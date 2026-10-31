import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentAdminSession } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    return NextResponse.json({ success: true, backups: [] });
  }

  try {
    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter((f) => f.endsWith(".json"))
      .map((filename) => {
        const filePath = path.join(backupDir, filename);
        const stat = fs.statSync(filePath);
        const checksumFile = path.join(backupDir, filename.replace(".json", ".sha256"));
        let checksum = "N/A";
        if (fs.existsSync(checksumFile)) {
          checksum = fs.readFileSync(checksumFile, "utf8").trim().split(/\s+/)[0];
        }
        return {
          filename,
          sizeBytes: stat.size,
          sizeKb: (stat.size / 1024).toFixed(2),
          createdAt: stat.mtime.toISOString(),
          checksum,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, backups });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Dynamically require and run backup script
    const { runBackup } = require("@/scripts/backup-db.js");
    const result = await runBackup();

    await logSecurityEvent({
      event_type: "MANUAL_BACKUP_TRIGGERED",
      severity: "INFO",
      actor: session.user.username,
      source_ip: "127.0.0.1",
      detection_reason: "Administrator initiated encrypted database snapshot and checksum generation.",
      action_taken: `Created snapshot ${result.filename} (${(result.sizeBytes / 1024).toFixed(2)} KB). Integrity checksum: ${result.hash}`,
    });

    return NextResponse.json({
      success: true,
      message: "Database backup successfully generated with SHA-256 integrity checksum.",
      backup: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Backup failed: " + err.message },
      { status: 500 }
    );
  }
}
