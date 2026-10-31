import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { validateUploadedFile } from "@/lib/security";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import fs from "fs";
import path from "path";

interface MediaReference {
  entityType: string;
  name: string;
  id?: string | number;
}

const ALLOWED_FOLDERS = ["uploads", "projects", "team", "images", "flags"];
const PROTECTED_CORE_ASSETS = ["logo.png", "logo-white.png", "og-image.png", "favicon.ico"];

function canManageMedia(role: string): boolean {
  return ["super_admin", "admin", "content_editor"].includes(role);
}

function resolveMediaFilePath(filenameOrPath: string): { filePath: string; folder: string; cleanName: string } | null {
  if (!filenameOrPath) return null;
  // Prevent directory traversal attacks
  if (filenameOrPath.includes("..") || filenameOrPath.includes("\0")) return null;

  const normalized = filenameOrPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const stripped = normalized.startsWith("public/") ? normalized.slice(7) : normalized;
  const parts = stripped.split("/").filter(Boolean);

  let folder = "uploads";
  let cleanName = "";

  if (parts.length === 1) {
    cleanName = parts[0];
    folder = "uploads";
  } else if (parts.length >= 2) {
    if (ALLOWED_FOLDERS.includes(parts[0])) {
      folder = parts[0];
      cleanName = parts.slice(1).join("/");
    } else {
      return null;
    }
  }

  if (!cleanName || cleanName.includes("..") || cleanName.includes("\0")) return null;

  const publicRoot = path.join(process.cwd(), "public");
  const candidate = path.join(publicRoot, folder, cleanName);

  if (!candidate.startsWith(publicRoot)) return null;

  // If file doesn't exist in that folder, check if it exists in another allowed folder
  if (!fs.existsSync(candidate) && parts.length === 1) {
    for (const f of ALLOWED_FOLDERS) {
      const alt = path.join(publicRoot, f, cleanName);
      if (fs.existsSync(alt)) {
        return { filePath: alt, folder: f, cleanName };
      }
    }
  }

  return { filePath: candidate, folder, cleanName };
}

async function getMediaUsageMap(): Promise<Map<string, MediaReference[]>> {
  const usageMap = new Map<string, MediaReference[]>();

  const addRef = (filepath: string, ref: MediaReference) => {
    if (!filepath) return;
    const clean = filepath.trim();
    const base = path.basename(clean);
    if (!usageMap.has(clean)) {
      usageMap.set(clean, []);
    }
    usageMap.get(clean)!.push(ref);
    if (base && base !== clean) {
      if (!usageMap.has(base)) {
        usageMap.set(base, []);
      }
      usageMap.get(base)!.push(ref);
    }
  };

  try {
    const p = getDbPool();

    // 1. Check Portfolio
    const [portfolios] = await p.query<RowDataPacket[]>(
      "SELECT id, title, image_url FROM cms_portfolio"
    );
    for (const item of portfolios) {
      if (item.image_url) {
        addRef(item.image_url, { entityType: "Portfolio Project", name: item.title, id: item.id });
      }
    }

    // 2. Check Team Members
    const [team] = await p.query<RowDataPacket[]>(
      "SELECT id, name, image_url FROM cms_team_members"
    );
    for (const member of team) {
      if (member.image_url) {
        addRef(member.image_url, { entityType: "Team Member", name: member.name, id: member.id });
      }
    }

    // 3. Check Blogs
    const [blogs] = await p.query<RowDataPacket[]>(
      "SELECT id, title, featured_image FROM cms_blogs"
    );
    for (const blog of blogs) {
      if (blog.featured_image) {
        addRef(blog.featured_image, { entityType: "Article", name: blog.title, id: blog.id });
      }
    }

    // 4. Check Pages (OG image & sections)
    const [pages] = await p.query<RowDataPacket[]>(
      "SELECT id, title, og_image, sections_json FROM cms_pages"
    );
    for (const page of pages) {
      if (page.og_image) {
        addRef(page.og_image, { entityType: "Website Page (OG)", name: page.title, id: page.id });
      }
      if (page.sections_json) {
        const str = String(page.sections_json);
        const matches = str.match(/\/uploads\/[a-zA-Z0-9_\-\.]+|\/projects\/[a-zA-Z0-9_\-\.]+|\/images\/[a-zA-Z0-9_\-\.]+/g);
        if (matches) {
          for (const m of matches) {
            addRef(m, { entityType: "Website Page (Section)", name: page.title, id: page.id });
          }
        }
      }
    }

    // 5. Check Services
    try {
      const [services] = await p.query<RowDataPacket[]>(
        "SELECT id, title, full_content, icon FROM cms_services"
      );
      for (const s of services) {
        if (s.icon && s.icon.startsWith("/")) {
          addRef(s.icon, { entityType: "Service Icon", name: s.title, id: s.id });
        }
        if (s.full_content) {
          const matches = String(s.full_content).match(/\/uploads\/[a-zA-Z0-9_\-\.]+|\/projects\/[a-zA-Z0-9_\-\.]+|\/images\/[a-zA-Z0-9_\-\.]+/g);
          if (matches) {
            for (const m of matches) {
              addRef(m, { entityType: "Service Content", name: s.title, id: s.id });
            }
          }
        }
      }
    } catch {}

    // 6. Check Global Settings
    const [settings] = await p.query<RowDataPacket[]>(
      "SELECT setting_key, setting_value FROM cms_settings"
    );
    for (const s of settings) {
      const val = String(s.setting_value);
      if (val.startsWith("/") || val.includes("/uploads/") || val.includes("/images/")) {
        addRef(val, { entityType: "Global Settings", name: s.setting_key });
      }
    }
  } catch (err) {
    console.warn("[Media Usage Map Warning]", err);
  }

  return usageMap;
}

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const publicDir = path.join(process.cwd(), "public");
    const subdirs = [
      { folder: "uploads", category: "Uploads" },
      { folder: "projects", category: "Portfolio Projects" },
      { folder: "team", category: "Team Photos" },
      { folder: "images", category: "Brand & Verification" },
      { folder: "flags", category: "Country Flags" },
    ];

    const usageMap = await getMediaUsageMap();

    // Query metadata from cms_media if exists
    const metaMap = new Map<string, { alt_text?: string; caption?: string; uploaded_by?: string; category?: string }>();
    try {
      const p = getDbPool();
      const [rows] = await p.query<RowDataPacket[]>("SELECT filename, alt_text, caption, category, uploaded_by FROM cms_media");
      for (const r of rows) {
        metaMap.set(r.filename, { alt_text: r.alt_text, caption: r.caption, category: r.category, uploaded_by: r.uploaded_by });
      }
    } catch {}

    const mediaList: {
      path: string;
      name: string;
      category: string;
      sizeBytes: number;
      modifiedAt: string;
      isDeletable: boolean;
      references: MediaReference[];
      hasReferences: boolean;
      alt_text?: string;
      caption?: string;
      uploaded_by?: string;
    }[] = [];

    const seenPaths = new Set<string>();

    for (const sub of subdirs) {
      const fullPath = path.join(publicDir, sub.folder);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        for (const file of files) {
          const filePath = path.join(fullPath, file);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              const relPath = `/${sub.folder}/${file}`;
              if (seenPaths.has(relPath)) continue;
              seenPaths.add(relPath);

              const refs = usageMap.get(relPath) || usageMap.get(file) || [];
              const meta = metaMap.get(file);
              const isProtectedCore = PROTECTED_CORE_ASSETS.includes(file.toLowerCase());

              mediaList.push({
                path: relPath,
                name: file,
                category: meta?.category || sub.category,
                sizeBytes: stat.size,
                modifiedAt: stat.mtime.toISOString(),
                isDeletable: !isProtectedCore,
                references: refs,
                hasReferences: refs.length > 0,
                alt_text: meta?.alt_text || "",
                caption: meta?.caption || "",
                uploaded_by: meta?.uploaded_by || "System",
              });
            }
          } catch {}
        }
      }
    }

    // Sort newest modified first
    mediaList.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    return NextResponse.json({
      success: true,
      media: mediaList,
      totalCount: mediaList.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageMedia(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Permission Denied: Media upload requires Content Editor or Administrator role." },
      { status: 403 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // Action support: replace references
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.action === "replace_references") {
        const { oldPath, newPath } = body;
        if (!oldPath || !newPath) {
          return NextResponse.json({ success: false, message: "oldPath and newPath are required." }, { status: 400 });
        }
        // Forward to replace handler
        const p = getDbPool();
        const cleanOld = oldPath.trim().replace(/^\/+/, "");
        const baseOld = path.basename(cleanOld);
        const cleanNew = newPath.trim().startsWith("/") ? newPath.trim() : `/${newPath.trim()}`;
        const baseNew = path.basename(cleanNew);

        let updatedCount = 0;
        try {
          const [portRows] = await p.query<RowDataPacket[]>(
            "SELECT id FROM cms_portfolio WHERE image_url LIKE ? OR image_url LIKE ?",
            [`%${cleanOld}%`, `%${baseOld}%`]
          );
          for (const row of portRows) {
            await p.query("UPDATE cms_portfolio SET image_url = ? WHERE id = ?", [cleanNew, row.id]);
            updatedCount++;
          }
        } catch {}

        try {
          const [teamRows] = await p.query<RowDataPacket[]>(
            "SELECT id FROM cms_team_members WHERE image_url LIKE ? OR image_url LIKE ?",
            [`%${cleanOld}%`, `%${baseOld}%`]
          );
          for (const row of teamRows) {
            await p.query("UPDATE cms_team_members SET image_url = ? WHERE id = ?", [cleanNew, row.id]);
            updatedCount++;
          }
        } catch {}

        try {
          const [blogRows] = await p.query<RowDataPacket[]>(
            "SELECT id FROM cms_blogs WHERE featured_image LIKE ? OR featured_image LIKE ?",
            [`%${cleanOld}%`, `%${baseOld}%`]
          );
          for (const row of blogRows) {
            await p.query("UPDATE cms_blogs SET featured_image = ? WHERE id = ?", [cleanNew, row.id]);
            updatedCount++;
          }
        } catch {}

        try {
          const [pageRows] = await p.query<RowDataPacket[]>(
            "SELECT id, og_image, sections_json FROM cms_pages WHERE og_image LIKE ? OR sections_json LIKE ?",
            [`%${baseOld}%`, `%${baseOld}%`]
          );
          for (const row of pageRows) {
            let newOg = row.og_image;
            if (row.og_image && (row.og_image.includes(cleanOld) || row.og_image.includes(baseOld))) {
              newOg = cleanNew;
            }
            let newSec = row.sections_json;
            if (row.sections_json && typeof row.sections_json === "string") {
              newSec = row.sections_json.split(cleanOld).join(cleanNew).split(baseOld).join(baseNew);
            }
            await p.query("UPDATE cms_pages SET og_image = ?, sections_json = ? WHERE id = ?", [newOg, newSec, row.id]);
            updatedCount++;
          }
        } catch {}

        try {
          const [settingRows] = await p.query<RowDataPacket[]>(
            "SELECT setting_key, setting_value FROM cms_settings WHERE setting_value LIKE ?",
            [`%${baseOld}%`]
          );
          for (const row of settingRows) {
            const val = String(row.setting_value);
            const replaced = val.split(cleanOld).join(cleanNew).split(baseOld).join(baseNew);
            await p.query("UPDATE cms_settings SET setting_value = ? WHERE setting_key = ?", [replaced, row.setting_key]);
            updatedCount++;
          }
        } catch {}

        await p.query(
          "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'MEDIA_REASSIGNED', 'Media', ?, ?)",
          [session.user.username, baseOld, `Reassigned ${updatedCount} references from '${oldPath}' to '${cleanNew}'`]
        );

        return NextResponse.json({
          success: true,
          updatedCount,
          message: `Successfully reassigned ${updatedCount} reference(s) to '${cleanNew}'.`,
        });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "Uploads";
    const altText = (formData.get("alt_text") as string) || "";
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic-byte & File type validation
    const validation = validateUploadedFile(file.name, buffer);
    if (!validation.valid || !validation.sanitizedFilename) {
      return NextResponse.json(
        { success: false, message: validation.error || "File rejected by security validation." },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const targetFilePath = path.join(uploadsDir, validation.sanitizedFilename);
    fs.writeFileSync(targetFilePath, buffer);

    const publicUrl = `/uploads/${validation.sanitizedFilename}`;

    // Index into cms_media table
    try {
      const p = getDbPool();
      await p.query(
        `INSERT INTO cms_media (filename, original_name, file_path, file_type, file_size, alt_text, caption, folder, category, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'uploads', ?, ?)
         ON DUPLICATE KEY UPDATE alt_text = VALUES(alt_text), caption = VALUES(caption), file_size = VALUES(file_size)`,
        [
          validation.sanitizedFilename,
          file.name,
          publicUrl,
          file.type || "image/octet-stream",
          buffer.length,
          altText || null,
          caption || null,
          category,
          session.user.username,
        ]
      );

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'MEDIA_UPLOADED', 'Media', ?, ?)",
        [session.user.username, publicUrl, `Uploaded verified asset '${file.name}' (${(buffer.length / 1024).toFixed(1)} KB)`]
      );
    } catch (e) {
      console.warn("[Media DB Index Error]", e);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: validation.sanitizedFilename,
      size: buffer.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageMedia(session.user.role)) {
    return NextResponse.json({ success: false, message: "Permission Denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { filename, alt_text, caption, category } = body;

    if (!filename) {
      return NextResponse.json({ success: false, message: "Filename required" }, { status: 400 });
    }

    const p = getDbPool();
    await p.query(
      `UPDATE cms_media SET alt_text = ?, caption = ?, category = ? WHERE filename = ?`,
      [alt_text || null, caption || null, category || "General", filename]
    );

    return NextResponse.json({ success: true, message: "Media metadata updated successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageMedia(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Permission Denied: Media deletion requires Content Editor or Administrator role." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const queryFilename = searchParams.get("filename") || searchParams.get("id");
    let force = searchParams.get("force") === "true";
    let filenamesToDelete: string[] = [];

    // Support JSON body for bulk deletion or single deletion
    const contentType = req.headers.get("content-type") || "";
    const contentLength = req.headers.get("content-length");
    if (contentType.includes("application/json") && contentLength && parseInt(contentLength, 10) > 0) {
      try {
        const body = await req.json();
        if (body.force !== undefined) force = Boolean(body.force);
        if (Array.isArray(body.filenames) && body.filenames.length > 0) {
          filenamesToDelete = body.filenames;
        } else if (body.filename) {
          filenamesToDelete = [body.filename];
        }
      } catch {}
    }

    if (filenamesToDelete.length === 0 && queryFilename) {
      filenamesToDelete = [queryFilename];
    }

    if (filenamesToDelete.length === 0) {
      return NextResponse.json({ success: false, message: "No filename(s) specified for deletion." }, { status: 400 });
    }

    const usageMap = await getMediaUsageMap();
    const p = getDbPool();

    // Scan references for all requested files
    const blockedList: { filename: string; name: string; references: MediaReference[] }[] = [];
    const deletableList: string[] = [];

    for (const name of filenamesToDelete) {
      const resolved = resolveMediaFilePath(name);
      if (!resolved) {
        return NextResponse.json(
          { success: false, message: `Invalid filename or path traversal detected for '${name}'.` },
          { status: 400 }
        );
      }

      const baseName = path.basename(resolved.cleanName);
      if (PROTECTED_CORE_ASSETS.includes(baseName.toLowerCase())) {
        return NextResponse.json(
          { success: false, message: `Protected system asset '${baseName}' cannot be deleted.` },
          { status: 403 }
        );
      }

      const relPath = `/${resolved.folder}/${resolved.cleanName}`;
      const refs = usageMap.get(relPath) || usageMap.get(resolved.cleanName) || usageMap.get(baseName) || [];

      if (refs.length > 0 && !force) {
        blockedList.push({ filename: name, name: baseName, references: refs });
      } else {
        deletableList.push(name);
      }
    }

    // If some files are blocked and not forced, return 409 with details
    if (blockedList.length > 0 && !force) {
      if (filenamesToDelete.length === 1) {
        return NextResponse.json(
          {
            success: false,
            blocked: true,
            inUse: true,
            message: `Deletion blocked: '${blockedList[0].name}' is actively referenced by ${blockedList[0].references.length} record(s). Please replace or reassign before deleting.`,
            references: blockedList[0].references,
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            blocked: true,
            inUse: true,
            message: `${blockedList.length} of ${filenamesToDelete.length} selected asset(s) are actively referenced. Please reassign or confirm force deletion.`,
            blockedFiles: blockedList,
            deletableFiles: deletableList,
          },
          { status: 409 }
        );
      }
    }

    // Execute safe deletion on deletableList (or all if force is true)
    const targets = force ? filenamesToDelete : deletableList;
    let deletedCount = 0;
    const errors: string[] = [];

    for (const targetName of targets) {
      const resolved = resolveMediaFilePath(targetName);
      if (!resolved) {
        errors.push(`Invalid path or security violation for '${targetName}'`);
        continue;
      }

      const baseName = path.basename(resolved.cleanName);
      const relPath = `/${resolved.folder}/${resolved.cleanName}`;

      // Check storage deletion
      if (fs.existsSync(resolved.filePath)) {
        try {
          fs.unlinkSync(resolved.filePath);
        } catch (unlinkErr: any) {
          // Requirement 13: If storage deletion fails, do not silently delete database record
          errors.push(`Failed to delete '${baseName}' from storage: ${unlinkErr.message}`);
          continue; // skip DB deletion
        }
      }

      // Storage deletion succeeded (or file was already missing) -> clean up database
      try {
        await p.query(
          "DELETE FROM cms_media WHERE filename = ? OR file_path = ? OR original_name = ?",
          [baseName, relPath, baseName]
        );
        await p.query(
          "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'MEDIA_DELETED', 'Media', ?, ?)",
          [session.user.username, baseName, `Deleted media file ${relPath} from storage and media registry`]
        );
        deletedCount++;
      } catch (dbErr: any) {
        console.warn(`[Media Delete DB Warning for ${baseName}]`, dbErr);
      }
    }

    if (deletedCount === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join("; ") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} media file(s) from storage and database.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
