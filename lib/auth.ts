import { cookies } from "next/headers";
import { getDbPool, initDb } from "./db";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashToken,
  recordFailedAuth,
  clearFailedAuth,
  logSecurityEvent,
} from "./security";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "super_admin" | "ops_manager" | "tech_lead";
  mfa_enabled: boolean;
  failed_attempts: number;
  last_login?: string;
  created_at?: string;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  expires_at: string;
}

const SESSION_COOKIE_NAME = "avantus_admin_session";
const SESSION_DURATION_HOURS = 24;

// Default initial credentials (hashed on first run)
const DEFAULT_SUPER_ADMIN = {
  username: "admin",
  email: "admin@avantusforge.com",
  full_name: "Executive Super Administrator",
  defaultPassword: "AvantusSuperAdmin2025!",
  role: "super_admin" as const,
};

// In-memory fallback user store if MySQL is offline
const memoryUsers = new Map<string, { user: AdminUser; passwordHash: string; salt: string }>();
const memorySessions = new Map<string, { user: AdminUser; expiresAt: number }>();

export async function ensureAdminTablesAndSeed(): Promise<void> {
  await initDb();
  try {
    const p = getDbPool();

    // 1. admin_users table
    await p.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'super_admin',
        full_name VARCHAR(255) NOT NULL,
        mfa_enabled BOOLEAN DEFAULT FALSE,
        mfa_secret VARCHAR(100) NULL,
        failed_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. admin_sessions table
    await p.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        ip_address VARCHAR(100) NULL,
        user_agent TEXT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token_hash),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. security_events table
    await p.query(`
      CREATE TABLE IF NOT EXISTS security_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50) DEFAULT 'INFO',
        actor VARCHAR(255) DEFAULT 'System',
        source_ip VARCHAR(100) NULL,
        detection_reason TEXT NOT NULL,
        details TEXT NULL,
        action_taken VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_severity (severity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. business_projects table (Part 1 Operations)
    await p.query(`
      CREATE TABLE IF NOT EXISTS business_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        budget VARCHAR(100) NULL,
        status VARCHAR(50) DEFAULT 'In Progress',
        health VARCHAR(50) DEFAULT 'On Track',
        milestones_json LONGTEXT NULL,
        team_assigned VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if super_admin exists
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT id FROM admin_users WHERE username = ? OR email = ?",
      [DEFAULT_SUPER_ADMIN.username, DEFAULT_SUPER_ADMIN.email]
    );

    if (!rows || rows.length === 0) {
      const { hash, salt } = hashPassword(DEFAULT_SUPER_ADMIN.defaultPassword);
      await p.query(
        `INSERT INTO admin_users (username, email, password_hash, salt, role, full_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          DEFAULT_SUPER_ADMIN.username,
          DEFAULT_SUPER_ADMIN.email,
          hash,
          salt,
          DEFAULT_SUPER_ADMIN.role,
          DEFAULT_SUPER_ADMIN.full_name,
        ]
      );
      console.log("[AvantusForge Auth] Seeded Super Administrator account with PBKDF2 hash.");
    }
  } catch (err: any) {
    console.warn("[AvantusForge Auth] ensureAdminTablesAndSeed warning:", err.message);
    // Seed memory fallback
    if (!memoryUsers.has(DEFAULT_SUPER_ADMIN.username)) {
      const { hash, salt } = hashPassword(DEFAULT_SUPER_ADMIN.defaultPassword);
      memoryUsers.set(DEFAULT_SUPER_ADMIN.username, {
        user: {
          id: 1,
          username: DEFAULT_SUPER_ADMIN.username,
          email: DEFAULT_SUPER_ADMIN.email,
          full_name: DEFAULT_SUPER_ADMIN.full_name,
          role: DEFAULT_SUPER_ADMIN.role,
          mfa_enabled: false,
          failed_attempts: 0,
        },
        passwordHash: hash,
        salt,
      });
    }
  }
}

// ----------------------------------------------------
// AUTHENTICATE LOGIN
// ----------------------------------------------------
export async function authenticateAdmin(
  usernameOrEmail: string,
  plainPassword: string,
  clientIp: string = "Unknown"
): Promise<{ success: boolean; user?: AdminUser; token?: string; error?: string }> {
  await ensureAdminTablesAndSeed();

  const identifier = usernameOrEmail.trim().toLowerCase();

  // Check brute force defense
  const authDefense = recordFailedAuth(identifier);
  if (authDefense.isLocked) {
    await logSecurityEvent({
      event_type: "LOGIN_LOCKOUT_TRIGGERED",
      severity: "HIGH",
      actor: identifier,
      source_ip: clientIp,
      detection_reason: `Account locked after multiple consecutive failed attempts (${authDefense.attempts}).`,
      action_taken: "Access denied with progressive 15-minute cooldown.",
    });
    return {
      success: false,
      error: "Too many failed attempts. This account is temporarily locked for 15 minutes.",
    };
  }

  let foundUser: AdminUser | null = null;
  let storedHash = "";
  let salt = "";

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM admin_users WHERE (username = ? OR email = ?) LIMIT 1`,
      [identifier, identifier]
    );

    if (rows && rows.length > 0) {
      const r = rows[0];
      storedHash = r.password_hash;
      salt = r.salt;
      foundUser = {
        id: r.id,
        username: r.username,
        email: r.email,
        full_name: r.full_name,
        role: r.role,
        mfa_enabled: Boolean(r.mfa_enabled),
        failed_attempts: r.failed_attempts,
        last_login: r.last_login,
      };
    }
  } catch (err) {
    // Memory fallback check
    const m = memoryUsers.get(identifier);
    if (m) {
      storedHash = m.passwordHash;
      salt = m.salt;
      foundUser = m.user;
    }
  }

  if (!foundUser || !storedHash || !salt) {
    await logSecurityEvent({
      event_type: "LOGIN_FAILED",
      severity: "WARN",
      actor: identifier,
      source_ip: clientIp,
      detection_reason: "Login attempt with non-existent administrative username or email.",
      action_taken: "Generic error returned.",
    });
    return { success: false, error: "Invalid credentials provided." };
  }

  const isValidPassword = verifyPassword(plainPassword, storedHash, salt);

  if (!isValidPassword) {
    await logSecurityEvent({
      event_type: "LOGIN_FAILED_BAD_PASSWORD",
      severity: "HIGH",
      actor: identifier,
      source_ip: clientIp,
      detection_reason: "Invalid password supplied for administrative account.",
      action_taken: "Failed attempt counter incremented.",
    });
    return { success: false, error: "Invalid credentials provided." };
  }

  // Clear failed counter on success
  clearFailedAuth(identifier);

  // Generate cryptographic session token
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 3600 * 1000);

  try {
    const p = getDbPool();
    await p.query(
      `INSERT INTO admin_sessions (user_id, token_hash, ip_address, expires_at)
       VALUES (?, ?, ?, ?)`,
      [foundUser.id, tokenHash, clientIp, expiresAt]
    );
    await p.query(
      `UPDATE admin_users SET last_login = CURRENT_TIMESTAMP, failed_attempts = 0 WHERE id = ?`,
      [foundUser.id]
    );
  } catch {
    memorySessions.set(tokenHash, { user: foundUser, expiresAt: expiresAt.getTime() });
  }

  await logSecurityEvent({
    event_type: "LOGIN_SUCCESS",
    severity: "INFO",
    actor: foundUser.username,
    source_ip: clientIp,
    detection_reason: "Successful authentication into administration console.",
    action_taken: "Issued 24-hour HttpOnly secure session cookie.",
  });

  return { success: true, user: foundUser, token };
}

// ----------------------------------------------------
// VERIFY ACTIVE SESSION FROM REQUEST / COOKIES
// ----------------------------------------------------
export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT s.token_hash, s.expires_at, u.id, u.username, u.email, u.full_name, u.role, u.mfa_enabled
       FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
      [tokenHash]
    );

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        token: rawToken,
        expires_at: r.expires_at,
        user: {
          id: r.id,
          username: r.username,
          email: r.email,
          full_name: r.full_name,
          role: r.role,
          mfa_enabled: Boolean(r.mfa_enabled),
          failed_attempts: 0,
        },
      };
    }
  } catch (err) {
    const mem = memorySessions.get(tokenHash);
    if (mem && Date.now() < mem.expiresAt) {
      return {
        token: rawToken,
        expires_at: new Date(mem.expiresAt).toISOString(),
        user: mem.user,
      };
    }
  }

  return null;
}

// ----------------------------------------------------
// LOGOUT & SESSION REVOCATION
// ----------------------------------------------------
export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return;

  const tokenHash = hashToken(rawToken);
  try {
    const p = getDbPool();
    await p.query("DELETE FROM admin_sessions WHERE token_hash = ?", [tokenHash]);
  } catch {
    memorySessions.delete(tokenHash);
  }
}
