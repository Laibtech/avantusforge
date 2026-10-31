import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT id, username, email, full_name, role, mfa_enabled, failed_attempts, last_login, created_at 
       FROM admin_users 
       ORDER BY id ASC`
    );
    return NextResponse.json({ success: true, users: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Only super_admin or admin can manage users
  if (session.user.role !== "super_admin" && (session.user.role as string) !== "admin") {
    return NextResponse.json({ success: false, message: "Permission denied: Requires Administrator role." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, username, email, full_name, role = "content_editor", password, unlock = false } = body;

    const p = getDbPool();

    if (id) {
      // Update existing user
      if (password && password.length >= 8) {
        const { hash, salt } = hashPassword(password);
        await p.query(
          `UPDATE admin_users 
           SET email = ?, full_name = ?, role = ?, password_hash = ?, salt = ?
           WHERE id = ?`,
          [email, full_name, role, hash, salt, id]
        );
      } else {
        await p.query(
          `UPDATE admin_users 
           SET email = ?, full_name = ?, role = ?
           WHERE id = ?`,
          [email, full_name, role, id]
        );
      }

      if (unlock) {
        await p.query("UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [id]);
      }

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'USER_UPDATED', 'User', ?, ?)",
        [session.user.username, String(id), `Updated user profile/role for: ${username || email}`]
      );

      return NextResponse.json({ success: true, message: "User account updated successfully." });
    } else {
      // Create new user
      if (!username || !email || !password || !full_name) {
        return NextResponse.json({ success: false, message: "All fields including password are required." }, { status: 400 });
      }

      if (password.length < 8) {
        return NextResponse.json({ success: false, message: "Password must be at least 8 characters long." }, { status: 400 });
      }

      const { hash, salt } = hashPassword(password);

      const [res] = await p.query<ResultSetHeader>(
        `INSERT INTO admin_users (username, email, password_hash, salt, role, full_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username.trim().toLowerCase(), email.trim().toLowerCase(), hash, salt, role, full_name]
      );

      await p.query(
        "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'USER_CREATED', 'User', ?, ?)",
        [session.user.username, String(res.insertId), `Created admin account '${username}' with role: ${role}`]
      );

      return NextResponse.json({ success: true, message: "New user account created successfully." });
    }
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ success: false, message: "Username or email already exists." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "super_admin") {
    return NextResponse.json({ success: false, message: "Only Super Administrators can delete user accounts." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Missing user id" }, { status: 400 });

    if (parseInt(id, 10) === session.user.id) {
      return NextResponse.json({ success: false, message: "You cannot delete your own account." }, { status: 400 });
    }

    const p = getDbPool();
    await p.query("DELETE FROM admin_users WHERE id = ?", [id]);

    await p.query(
      "INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'USER_DELETED', 'User', ?, ?)",
      [session.user.username, id, `Deleted user account #${id}`]
    );

    return NextResponse.json({ success: true, message: "User account deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
