import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import path from "path";

function canManageMedia(role: string): boolean {
  return ["super_admin", "admin", "content_editor"].includes(role);
}

export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageMedia(session.user.role)) {
    return NextResponse.json(
      { success: false, message: "Permission Denied: Media re-assignment requires Content Editor or Administrator role." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { oldPath, newPath } = body;

    if (!oldPath || !newPath) {
      return NextResponse.json(
        { success: false, message: "Both oldPath and newPath are required." },
        { status: 400 }
      );
    }

    const normOld = oldPath.trim().replace(/\/+/g, "/");
    const normNew = newPath.trim().replace(/\/+/g, "/");

    const absOld = normOld.startsWith("/") ? normOld : `/${normOld}`;
    const relOld = normOld.replace(/^\/+/, "");
    const baseOld = path.basename(normOld);

    const absNew = normNew.startsWith("/") ? normNew : `/${normNew}`;
    const relNew = normNew.replace(/^\/+/, "");
    const baseNew = path.basename(normNew);

    const performReplace = (str: string): string => {
      let res = str.split(absOld).join(absNew);
      if (res.includes(relOld)) res = res.split(relOld).join(relNew);
      if (res.includes(baseOld)) res = res.split(baseOld).join(baseNew);
      // Clean up accidental double slashes in paths
      return res.replace(/([^:])\/\/{2,}/g, "$1/").replace(/^\/\/{2,}/g, "/");
    };

    const p = getDbPool();
    let updatedCount = 0;

    // 1. cms_portfolio
    try {
      const [portRows] = await p.query<RowDataPacket[]>(
        "SELECT id, image_url FROM cms_portfolio WHERE image_url LIKE ? OR image_url LIKE ?",
        [`%${relOld}%`, `%${baseOld}%`]
      );
      for (const row of portRows) {
        await p.query("UPDATE cms_portfolio SET image_url = ? WHERE id = ?", [absNew, row.id]);
        updatedCount++;
      }
    } catch (e) {
      console.warn("[Media Replace] Portfolio check note:", e);
    }

    // 2. cms_team_members
    try {
      const [teamRows] = await p.query<RowDataPacket[]>(
        "SELECT id, image_url FROM cms_team_members WHERE image_url LIKE ? OR image_url LIKE ?",
        [`%${relOld}%`, `%${baseOld}%`]
      );
      for (const row of teamRows) {
        await p.query("UPDATE cms_team_members SET image_url = ? WHERE id = ?", [absNew, row.id]);
        updatedCount++;
      }
    } catch (e) {
      console.warn("[Media Replace] Team check note:", e);
    }

    // 3. cms_blogs
    try {
      const [blogRows] = await p.query<RowDataPacket[]>(
        "SELECT id, featured_image FROM cms_blogs WHERE featured_image LIKE ? OR featured_image LIKE ?",
        [`%${relOld}%`, `%${baseOld}%`]
      );
      for (const row of blogRows) {
        await p.query("UPDATE cms_blogs SET featured_image = ? WHERE id = ?", [absNew, row.id]);
        updatedCount++;
      }
    } catch (e) {
      console.warn("[Media Replace] Blog check note:", e);
    }

    // 4. cms_pages
    try {
      const [pageRows] = await p.query<RowDataPacket[]>(
        "SELECT id, og_image, sections_json FROM cms_pages WHERE og_image LIKE ? OR sections_json LIKE ?",
        [`%${baseOld}%`, `%${baseOld}%`]
      );
      for (const row of pageRows) {
        let newOg = row.og_image;
        if (row.og_image && (row.og_image.includes(relOld) || row.og_image.includes(baseOld))) {
          newOg = absNew;
        }
        let newSec = row.sections_json;
        if (row.sections_json && typeof row.sections_json === "string") {
          newSec = performReplace(row.sections_json);
        }
        await p.query("UPDATE cms_pages SET og_image = ?, sections_json = ? WHERE id = ?", [newOg, newSec, row.id]);
        updatedCount++;
      }
    } catch (e) {
      console.warn("[Media Replace] Pages check note:", e);
    }

    // 5. cms_services
    try {
      const [servRows] = await p.query<RowDataPacket[]>(
        "SELECT id, full_content, icon FROM cms_services WHERE full_content LIKE ? OR icon LIKE ?",
        [`%${baseOld}%`, `%${baseOld}%`]
      );
      for (const row of servRows) {
        let newContent = row.full_content ? performReplace(row.full_content) : row.full_content;
        let newIcon = row.icon;
        if (newIcon && (newIcon.includes(relOld) || newIcon.includes(baseOld))) {
          newIcon = absNew;
        }
        await p.query("UPDATE cms_services SET full_content = ?, icon = ? WHERE id = ?", [newContent, newIcon, row.id]);
        updatedCount++;
      }
    } catch (e) {
      console.warn("[Media Replace] Services check note:", e);
    }

    // 6. cms_settings
    try {
      const [settingRows] = await p.query<RowDataPacket[]>(
        "SELECT setting_key, setting_value FROM cms_settings WHERE setting_value LIKE ?",
        [`%${baseOld}%`]
      );
      for (const row of settingRows) {
        const val = String(row.setting_value);
        const replaced = performReplace(val);
        await p.query("UPDATE cms_settings SET setting_value = ? WHERE setting_key = ?", [replaced, row.setting_key]);
        updatedCount++;
      }
    } catch (e) {
      console.warn("[Media Replace] Settings check note:", e);
    }

    await p.query(
      "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'MEDIA_REASSIGNED', 'Media', ?, ?)",
      [session.user.username, baseOld, `Reassigned ${updatedCount} CMS references from '${oldPath}' to '${absNew}'`]
    );

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Successfully reassigned ${updatedCount} CMS reference(s) to '${absNew}'. The previous file is now unreferenced and safe to delete.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
