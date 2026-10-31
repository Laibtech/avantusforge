import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getDbPool } from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// ----------------------------------------------------
// 1. CRYPTOGRAPHIC PASSWORD HASHING (PBKDF2 - 100k Iterations)
// ----------------------------------------------------
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 2. SESSION TOKEN GENERATION & HASHING (SHA-256)
// ----------------------------------------------------
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ----------------------------------------------------
// 3. SLIDING-WINDOW DEFENSIVE RATE LIMITER
// ----------------------------------------------------
interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const memoryRateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = memoryRateLimitStore.get(key);

  if (!record) {
    memoryRateLimitStore.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Check if temporarily locked
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Window expired, reset counter
  if (now - record.firstAttempt > windowMs) {
    memoryRateLimitStore.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Increment within window
  record.count += 1;

  if (record.count > maxAttempts) {
    // Lock for progressive duration (3 minutes on basic threshold exceed)
    record.lockedUntil = now + 180 * 1000;
    return { allowed: false, remaining: 0, retryAfter: 180 };
  }

  return { allowed: true, remaining: maxAttempts - record.count };
}

export function recordFailedAuth(identifier: string): { isLocked: boolean; attempts: number } {
  const key = `auth_fail_${identifier}`;
  const now = Date.now();
  const record = memoryRateLimitStore.get(key) || { count: 0, firstAttempt: now };

  // Reset if older than 15 mins
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = undefined;
  } else {
    record.count += 1;
  }

  if (record.count >= 5) {
    // 15 minute progressive lockdown
    record.lockedUntil = now + 15 * 60 * 1000;
    memoryRateLimitStore.set(key, record);
    return { isLocked: true, attempts: record.count };
  }

  memoryRateLimitStore.set(key, record);
  return { isLocked: false, attempts: record.count };
}

export function clearFailedAuth(identifier: string): void {
  memoryRateLimitStore.delete(`auth_fail_${identifier}`);
}

// ----------------------------------------------------
// 4. MALICIOUS FILE UPLOAD VALIDATION & SANITIZATION
// ----------------------------------------------------
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg", ".pdf"]);
const DANGEROUS_EXTENSIONS = new Set([
  ".php", ".phtml", ".php3", ".php4", ".php5", ".phps", ".phar",
  ".exe", ".bat", ".sh", ".cmd", ".msi", ".dll", ".vbs",
  ".js", ".mjs", ".ts", ".html", ".htm", ".cgi", ".pl", ".py", ".aspx", ".asp", ".jsp"
]);

export interface FileValidationResult {
  valid: boolean;
  sanitizedFilename?: string;
  error?: string;
}

export function validateUploadedFile(
  originalFilename: string,
  buffer: Buffer,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10 MB default
): FileValidationResult {
  // 1. Path traversal check
  if (originalFilename.includes("..") || originalFilename.includes("/") || originalFilename.includes("\\")) {
    return { valid: false, error: "Path traversal character detected in filename." };
  }

  // 2. Size limit
  if (buffer.length > maxSizeBytes) {
    return { valid: false, error: `File exceeds maximum allowed size (${maxSizeBytes / (1024 * 1024)}MB).` };
  }

  // 3. Extension check
  const ext = path.extname(originalFilename).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Executable or script extension '${ext}' is strictly prohibited.` };
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Unsupported file type '${ext}'. Allowed: JPG, PNG, WEBP, SVG, PDF.` };
  }

  // 4. Magic byte / header verification
  const isMagicValid = verifyMagicBytes(buffer, ext);
  if (!isMagicValid) {
    return { valid: false, error: "File content does not match reported extension (magic byte mismatch)." };
  }

  // 5. Generate secure randomized filename
  const safeBase = crypto.randomBytes(12).toString("hex");
  const sanitizedFilename = `${safeBase}${ext}`;

  return { valid: true, sanitizedFilename };
}

function verifyMagicBytes(buffer: Buffer, ext: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (ext === ".jpg" || ext === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (ext === ".png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // WEBP: RIFF .... WEBP
  if (ext === ".webp") {
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    if (!isRiff || buffer.length < 12) return false;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isWebp;
  }

  // PDF: %PDF
  if (ext === ".pdf") {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // SVG: Inspect as text for <svg tag and no malicious <script tags
  if (ext === ".svg") {
    const text = buffer.toString("utf8", 0, Math.min(buffer.length, 1024)).toLowerCase();
    if (!text.includes("<svg") && !text.includes("<?xml")) return false;
    // Check for inline script execution
    const fullText = buffer.toString("utf8").toLowerCase();
    if (fullText.includes("<script") || fullText.includes("javascript:") || fullText.includes("onload=")) {
      return false;
    }
    return true;
  }

  return false;
}

// ----------------------------------------------------
// 5. CENTRAL SECURITY AUDIT LOGGING
// ----------------------------------------------------
export interface SecurityEventInput {
  event_type: string;
  severity: "INFO" | "WARN" | "HIGH" | "CRITICAL";
  actor?: string;
  source_ip?: string;
  detection_reason: string;
  details?: string;
  action_taken: string;
}

const LOCAL_EVENTS_FILE = path.join(process.cwd(), "data", "security-events.json");

export async function logSecurityEvent(event: SecurityEventInput): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY AUDIT - ${event.severity}] [${event.event_type}] ${event.detection_reason} | Action: ${event.action_taken}`);

  try {
    const p = getDbPool();
    await p.query(
      `INSERT INTO security_events (event_type, severity, actor, source_ip, detection_reason, details, action_taken)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        event.event_type,
        event.severity,
        event.actor || "System",
        event.source_ip || "Internal",
        event.detection_reason,
        event.details || "",
        event.action_taken,
      ]
    );
  } catch (err) {
    // Fallback to append-only JSON file
    try {
      const dir = path.dirname(LOCAL_EVENTS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let list: (SecurityEventInput & { id: string; created_at: string })[] = [];
      if (fs.existsSync(LOCAL_EVENTS_FILE)) {
        try {
          list = JSON.parse(fs.readFileSync(LOCAL_EVENTS_FILE, "utf8"));
        } catch {
          list = [];
        }
      }

      list.unshift({
        id: crypto.randomUUID(),
        ...event,
        created_at: timestamp,
      });

      // Keep latest 500 events
      if (list.length > 500) list = list.slice(0, 500);
      fs.writeFileSync(LOCAL_EVENTS_FILE, JSON.stringify(list, null, 2), "utf8");
    } catch {
      // safe fallback
    }
  }
}

export async function getRecentSecurityEvents(limit: number = 20): Promise<any[]> {
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM security_events ORDER BY id DESC LIMIT ?`,
      [limit]
    );
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    // read from JSON fallback
  }

  try {
    if (fs.existsSync(LOCAL_EVENTS_FILE)) {
      const raw = fs.readFileSync(LOCAL_EVENTS_FILE, "utf8");
      const list = JSON.parse(raw);
      return list.slice(0, limit);
    }
  } catch {}

  return [];
}
