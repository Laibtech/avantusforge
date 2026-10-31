const mysql = require("mysql2/promise");
const crypto = require("crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

async function init() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  console.log("[AvantusForge Security DB] Initializing tables in MySQL...");

  // 1. admin_users table
  await conn.query(`
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
  await conn.query(`
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
  await conn.query(`
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

  // 4. business_projects table
  await conn.query(`
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

  // Seed default super administrator if empty
  const [existing] = await conn.query("SELECT id FROM admin_users WHERE username = 'admin' OR email = 'admin@avantusforge.com'");
  if (existing.length === 0) {
    const { hash, salt } = hashPassword("AvantusSuperAdmin2025!");
    await conn.query(
      `INSERT INTO admin_users (username, email, password_hash, salt, role, full_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["admin", "admin@avantusforge.com", hash, salt, "super_admin", "Executive Super Administrator"]
    );
    console.log("  ✓ Seeded default super administrator: admin / AvantusSuperAdmin2025!");
  } else {
    console.log("  ✓ Super administrator account already exists.");
  }

  // Seed sample security event
  const [events] = await conn.query("SELECT id FROM security_events LIMIT 1");
  if (events.length === 0) {
    await conn.query(
      `INSERT INTO security_events (event_type, severity, actor, source_ip, detection_reason, action_taken)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "SYSTEM_INITIALIZATION",
        "INFO",
        "System Engine",
        "127.0.0.1",
        "Security Center and defensive controls successfully provisioned.",
        "PBKDF2 authentication and sliding-window rate limiting activated.",
      ]
    );
    console.log("  ✓ Seeded baseline initialization security audit event.");
  }

  // Seed business projects if empty
  const [proj] = await conn.query("SELECT id FROM business_projects LIMIT 1");
  if (proj.length === 0) {
    await conn.query(
      `INSERT INTO business_projects (title, client_name, budget, status, health, milestones_json, team_assigned)
       VALUES 
       ('HRMS & Custom Business Management Suite', 'Global Workforce Operations', '$45,000', 'In Progress', 'On Track', '["Phase 1: Architecture - Completed", "Phase 2: Payroll Engine - Active", "Phase 3: Mobile Companion - Scheduled"]', 'Bilal (Technical Director)'),
       ('Caremon D2C Wellness Flagship', 'Caremon Group UK', '$28,000', 'Completed', 'Delivered', '["Theme 2.0 Engineering", "Conversion Architecture", "PDP Sub-second Loading"]', 'Maira (Design) & Muzamil (Operations Director)'),
       ('Oasis Global Consulting Digital Presence', 'Oasis Global Consulting (Pvt.) Ltd.', '$22,000', 'Completed', 'Delivered', '["Corporate Architecture", "Regulatory Trust Signals", "Encrypted Intake"]', 'Bilal & CEO Office')`
    );
    console.log("  ✓ Seeded sample business operations projects.");
  }

  console.log("[AvantusForge Security DB] All tables verified and ready.");
  await conn.end();
}

init().catch(console.error);
