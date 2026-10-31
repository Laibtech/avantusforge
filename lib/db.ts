import mysql from "mysql2/promise";
import type { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import fs from "fs";
import path from "path";

// MySQL Connection Pool Configuration
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = parseInt(process.env.DB_PORT || "3307", 10);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "avantus_db";

let pool: Pool | null = null;
let dbInitialized = false;

// Fallback JSON persistence directory
const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function getDbPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  if (dbInitialized) return;

  try {
    const p = getDbPool();

    // 1. Contact Inquiries & CRM Leads table
    await p.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NULL,
        company VARCHAR(255) NULL,
        service VARCHAR(255) NULL,
        budget VARCHAR(100) NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'New',
        priority VARCHAR(50) DEFAULT 'Normal',
        lead_source VARCHAR(100) DEFAULT 'Website Form',
        assigned_to VARCHAR(100) DEFAULT 'Unassigned',
        internal_notes TEXT NULL,
        follow_up_date VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Newsletter subscribers
    await p.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. CMS Pages
    await p.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        seo_title VARCHAR(255) NULL,
        meta_description TEXT NULL,
        og_image VARCHAR(255) NULL,
        status VARCHAR(50) DEFAULT 'published',
        sections_json LONGTEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. CMS Team Members
    await p.query(`
      CREATE TABLE IF NOT EXISTS cms_team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        bio TEXT NULL,
        image_url VARCHAR(255) NOT NULL,
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        linkedin_url VARCHAR(500) NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await p.query("ALTER TABLE cms_team_members ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500) NULL");
    } catch {
      // Column may already exist or syntax unsupported
    }

    // 5. Audit logs
    await p.query(`
      CREATE TABLE IF NOT EXISTS cms_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        actor VARCHAR(255) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Global Site Settings
    await p.query(`
      CREATE TABLE IF NOT EXISTS cms_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value LONGTEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default authentic team members if empty
    const [rows] = await p.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM cms_team_members");
    if (rows[0]?.count === 0) {
      await p.query(`
        INSERT INTO cms_team_members (name, title, role, bio, image_url, order_index, is_active)
        VALUES 
        ('Laiba Baig', 'CEO Laiba Baig', 'Chief Executive Officer', 'Founder and Chief Executive Officer guiding strategic direction, enterprise technology solutions, and global marketplace expansion for AvantusForge.', '/team/laiba-baig.jpg', 1, TRUE),
        ('Maira', 'Maira', 'Graphic Designer', 'Directing brand identity systems, conversion-driven visual design, storefront graphics, and premium digital marketing assets.', '/team/maira.jpg', 2, TRUE),
        ('Hamza Tariq', 'Technical Director', 'Head of Software Architecture', 'Leading bespoke system architecture, custom ERP/CRM engineering, and high-performance cloud applications.', '/team/tech-lead.jpg', 3, TRUE),
        ('Usman Farooq', 'Operations Director', 'Head of Client Operations & Growth', 'Overseeing client digital delivery, e-commerce growth strategies, and international market development.', '/team/ops-lead.jpg', 4, TRUE)
      `);
    }

    dbInitialized = true;
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL pool initialization note (using dual-persistence):", err);
    dbInitialized = true;
  }
}

// ================= CRM LEADS REPOSITORY =================
export interface CrmLead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  status: "New" | "In Progress" | "Contacted" | "Converted" | "Closed" | "Qualified" | "Proposal Sent" | "Won" | "Lost";
  priority: "High" | "Normal" | "Low";
  lead_source: string;
  assigned_to?: string;
  internal_notes?: string;
  follow_up_date?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createLead(lead: Omit<CrmLead, "id" | "created_at" | "updated_at">): Promise<number> {
  await initDb();
  const now = new Date().toISOString();
  let insertedId = Date.now();

  // Try MySQL first
  try {
    const p = getDbPool();
    const [result] = await p.query<ResultSetHeader>(
      `INSERT INTO contact_inquiries (name, email, phone, company, service, budget, message, status, priority, lead_source, assigned_to, internal_notes, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead.name,
        lead.email,
        lead.phone || null,
        lead.company || null,
        lead.service || "General Inquiry",
        lead.budget || null,
        lead.message,
        lead.status || "New",
        lead.priority || "Normal",
        lead.lead_source || "Website Form",
        lead.assigned_to || "Unassigned",
        lead.internal_notes || null,
        lead.follow_up_date || null,
      ]
    );
    if (result.insertId) insertedId = result.insertId;
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL createLead fallback to JSON:", err);
  }

  // Dual sync to JSON storage
  try {
    const list = readJsonFile<CrmLead[]>("crm-leads.json", []);
    const record: CrmLead = {
      ...lead,
      id: insertedId,
      status: lead.status || "New",
      priority: lead.priority || "Normal",
      created_at: now,
      updated_at: now,
    };
    list.unshift(record);
    writeJsonFile("crm-leads.json", list);
  } catch (jsonErr) {
    console.error("[AvantusForge DB] JSON sync error:", jsonErr);
  }

  return insertedId;
}

export async function getAllLeads(): Promise<CrmLead[]> {
  await initDb();
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM contact_inquiries ORDER BY id DESC"
    );
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone || "",
        company: r.company || "",
        service: r.service || "",
        budget: r.budget || "",
        message: r.message || "",
        status: (r.status || "New") as CrmLead["status"],
        priority: (r.priority || "Normal") as CrmLead["priority"],
        lead_source: r.lead_source || "Website Form",
        assigned_to: r.assigned_to || "Unassigned",
        internal_notes: r.internal_notes || "",
        follow_up_date: r.follow_up_date || "",
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL getAllLeads fallback to JSON:", err);
  }

  return readJsonFile<CrmLead[]>("crm-leads.json", []);
}

export async function updateLeadStatus(
  id: number,
  updates: Partial<Pick<CrmLead, "status" | "priority" | "assigned_to" | "internal_notes" | "follow_up_date">>
): Promise<boolean> {
  await initDb();
  try {
    const p = getDbPool();
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push("priority = ?");
      values.push(updates.priority);
    }
    if (updates.assigned_to !== undefined) {
      fields.push("assigned_to = ?");
      values.push(updates.assigned_to);
    }
    if (updates.internal_notes !== undefined) {
      fields.push("internal_notes = ?");
      values.push(updates.internal_notes);
    }
    if (updates.follow_up_date !== undefined) {
      fields.push("follow_up_date = ?");
      values.push(updates.follow_up_date);
    }

    if (fields.length > 0) {
      values.push(String(id));
      await p.query(`UPDATE contact_inquiries SET ${fields.join(", ")} WHERE id = ?`, values);
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL updateLead fallback to JSON:", err);
  }

  // Update JSON copy
  const list = readJsonFile<CrmLead[]>("crm-leads.json", []);
  const idx = list.findIndex((item) => item.id === id);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeJsonFile("crm-leads.json", list);
    return true;
  }
  return false;
}

// ================= CMS TEAM REPOSITORY =================
export interface CmsTeamMember {
  id: number;
  name: string;
  title: string;
  role: string;
  bio: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  linkedin_url?: string;
}

const DEFAULT_TEAM: CmsTeamMember[] = [
  {
    id: 1,
    name: "Laiba Baig",
    title: "Laiba Baig",
    role: "Chief Executive Officer",
    bio: "Founder and Chief Executive Officer guiding strategic direction, enterprise technology solutions, and global marketplace expansion for AvantusForge.",
    image_url: "/team/laiba-baig-ceo.jpg",
    order_index: 1,
    is_active: true,
    linkedin_url: "https://www.linkedin.com/in/laiba-baig-dev/",
  },
  {
    id: 2,
    name: "Maira Faizan",
    title: "Maira Faizan",
    role: "Graphic Designer",
    bio: "Directing brand identity systems, conversion-driven visual design, storefront graphics, and premium digital marketing assets.",
    image_url: "/team/maira.jpg",
    order_index: 2,
    is_active: true,
    linkedin_url: "https://www.linkedin.com/in/maira-faizan-graphic-designer/",
  },
  {
    id: 3,
    name: "Abdul Rauf Bilal",
    title: "Abdul Rauf Bilal",
    role: "Technical Director",
    bio: "Leading bespoke system architecture, custom ERP/CRM engineering, and high-performance cloud applications.",
    image_url: "/team/tech-lead.jpg",
    order_index: 3,
    is_active: true,
    linkedin_url: "https://www.linkedin.com/in/abdulraufbilal/",
  },
  {
    id: 4,
    name: "Muzamil",
    title: "Muzamil",
    role: "Operations Director",
    bio: "Overseeing client digital delivery, e-commerce growth strategies, and international market development.",
    image_url: "/uploads/cebbef9afb9b84025540e70a.png",
    order_index: 4,
    is_active: true,
    linkedin_url: "https://www.linkedin.com/in/muzamilbiz/",
  },
];

export async function getTeamMembers(): Promise<CmsTeamMember[]> {
  await initDb();
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM cms_team_members WHERE is_active = TRUE ORDER BY order_index ASC, id ASC"
    );
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        title: r.title,
        role: r.role,
        bio: r.bio || "",
        image_url: r.image_url,
        order_index: r.order_index,
        is_active: Boolean(r.is_active),
        linkedin_url: r.linkedin_url || "",
      }));
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL getTeamMembers fallback to JSON:", err);
  }

  return readJsonFile<CmsTeamMember[]>("cms-team.json", DEFAULT_TEAM);
}

export async function saveTeamMember(member: Omit<CmsTeamMember, "id"> & { id?: number }): Promise<number> {
  await initDb();
  let id = member.id || Date.now();

  try {
    const p = getDbPool();
    if (member.id) {
      await p.query(
        "UPDATE cms_team_members SET name = ?, title = ?, role = ?, bio = ?, image_url = ?, order_index = ?, is_active = ?, linkedin_url = ? WHERE id = ?",
        [member.name, member.title, member.role, member.bio, member.image_url, member.order_index, member.is_active, member.linkedin_url || null, member.id]
      );
    } else {
      const [res] = await p.query<ResultSetHeader>(
        "INSERT INTO cms_team_members (name, title, role, bio, image_url, order_index, is_active, linkedin_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [member.name, member.title, member.role, member.bio, member.image_url, member.order_index, member.is_active, member.linkedin_url || null]
      );
      if (res.insertId) id = res.insertId;
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL saveTeamMember fallback to JSON:", err);
  }

  const list = readJsonFile<CmsTeamMember[]>("cms-team.json", DEFAULT_TEAM);
  if (member.id) {
    const idx = list.findIndex((m) => m.id === member.id);
    if (idx !== -1) list[idx] = { ...member, id: member.id };
  } else {
    list.push({ ...member, id });
  }
  writeJsonFile("cms-team.json", list);
  return id;
}

// ================= CMS SETTINGS REPOSITORY =================
export interface SiteSettings {
  // Identity
  site_name: string;
  brand_name: string;
  logo_url: string;
  alternate_logo_url: string;
  favicon_url: string;
  tagline: string;
  official_tagline: string;
  contact_email: string;
  primary_email: string;
  secondary_email: string;
  contact_phone: string;
  phone_number: string;
  whatsapp_number: string;
  contact_address: string;
  operations_address: string;
  business_hours: string;
  timezone: string;
  default_currency: string;
  default_country: string;
  consultation_cta_text: string;
  consultation_cta_url: string;
  footer_copyright: string;
  business_registration_info: string;

  // Social
  social_linkedin: string;
  social_facebook: string;
  social_instagram: string;
  social_profiles_json?: string;

  // Markets
  target_markets: string[];
  target_markets_json?: string;

  // Amazon Marketplace Achievement
  verified_amazon_sales: string;
  verified_amazon_period: string;
  amazon_achievement_title: string;
  amazon_sales_figure: string;
  amazon_sales_currency: string;
  amazon_period: string;
  amazon_context: string;
  amazon_proof_image: string;
  amazon_is_visible: boolean;
  amazon_service_route: string;

  // Global SEO
  default_meta_title: string;
  default_meta_description: string;
  default_og_image: string;
  default_canonical_base: string;
  robots_indexing_enabled: boolean;
  organization_legal_name: string;

  // Preferences & Integrations
  site_maintenance_mode: boolean;
  announcement_banner_enabled: boolean;
  announcement_banner_text: string;
  cookie_consent_enabled: boolean;
  ga4_measurement_id: string;
  primary_contact_destination: string;
  notification_email_alerts: boolean;

  webhook_url?: string;
  updated_at?: string;
}

const DEFAULT_TARGET_MARKETS_JSON = JSON.stringify([
  { code: "gb", name: "United Kingdom", flag: "/flags/gb.svg", is_active: true, order_index: 1, currency: "GBP", timezone: "Europe/London" },
  { code: "us", name: "United States", flag: "/flags/us.svg", is_active: true, order_index: 2, currency: "USD", timezone: "America/New_York" },
  { code: "ae", name: "United Arab Emirates", flag: "/flags/ae.svg", is_active: true, order_index: 3, currency: "AED", timezone: "Asia/Dubai" },
  { code: "kw", name: "Kuwait", flag: "/flags/kw.svg", is_active: true, order_index: 4, currency: "KWD", timezone: "Asia/Kuwait" },
  { code: "pk", name: "Pakistan", flag: "/flags/pk.svg", is_active: true, order_index: 5, currency: "PKR", timezone: "Asia/Karachi" },
]);

const DEFAULT_SOCIAL_PROFILES_JSON = JSON.stringify([
  { id: "linkedin", platform: "LinkedIn", url: "https://www.linkedin.com/company/avantusforge", label: "AvantusForge on LinkedIn", is_active: true, show_in_footer: true, show_in_contact: true, order_index: 1 },
  { id: "facebook", platform: "Facebook", url: "https://www.facebook.com/Avantusforgeofficial", label: "AvantusForge on Facebook", is_active: true, show_in_footer: true, show_in_contact: true, order_index: 2 },
  { id: "instagram", platform: "Instagram", url: "https://www.instagram.com/avantusforgeofficial/", label: "AvantusForge on Instagram", is_active: true, show_in_footer: true, show_in_contact: true, order_index: 3 },
]);

const DEFAULT_SETTINGS: SiteSettings = {
  // Identity
  site_name: "AvantusForge",
  brand_name: "AvantusForge",
  logo_url: "/logo.png",
  alternate_logo_url: "/logo.png",
  favicon_url: "/favicon.ico",
  tagline: "Engineering High-Performance Digital Platforms, Bespoke Software & Amazon Growth",
  official_tagline: "Forging Digital Solutions That Move Your Business Forward",
  contact_email: "info@avantusforge.com",
  primary_email: "info@avantusforge.com",
  secondary_email: "sales@avantusforge.com",
  contact_phone: "+92 327 4074472",
  phone_number: "+92 327 4074472",
  whatsapp_number: "+92 327 4074472",
  contact_address: "AvantusForge Global Operations — UK, USA, UAE, Kuwait, Pakistan",
  operations_address: "AvantusForge Global Operations — UK, USA, UAE, Kuwait, Pakistan",
  business_hours: "Monday – Friday: 9:00 AM – 6:00 PM (GMT+5)",
  timezone: "Asia/Karachi",
  default_currency: "USD",
  default_country: "United Kingdom",
  consultation_cta_text: "Get a Free Consultation",
  consultation_cta_url: "/contact",
  footer_copyright: "© 2026 AvantusForge. All rights reserved.",
  business_registration_info: "AvantusForge Global Digital Technologies Pvt. Ltd.",

  // Social
  social_linkedin: "https://www.linkedin.com/company/avantusforge",
  social_facebook: "https://www.facebook.com/Avantusforgeofficial",
  social_instagram: "https://www.instagram.com/avantusforgeofficial/",
  social_profiles_json: DEFAULT_SOCIAL_PROFILES_JSON,

  // Markets
  target_markets: [
    "United Kingdom",
    "United States",
    "United Arab Emirates",
    "Kuwait",
    "Pakistan",
  ],
  target_markets_json: DEFAULT_TARGET_MARKETS_JSON,

  // Amazon Marketplace Achievement
  verified_amazon_sales: "AED 70,182.29",
  verified_amazon_period: "6–7 months organic growth without paid ads",
  amazon_achievement_title: "Verified Gross Amazon Product Sales",
  amazon_sales_figure: "AED 70,182.29",
  amazon_sales_currency: "AED",
  amazon_period: "6–7 months",
  amazon_context: "Organic brand acceleration achieved without paid advertising expenditure.",
  amazon_proof_image: "/images/amazon-aed-70k-sales-proof.png",
  amazon_is_visible: true,
  amazon_service_route: "/services/amazon-services",

  // Global SEO
  default_meta_title: "AvantusForge | International Digital Agency & Software House",
  default_meta_description:
    "Bespoke web platforms, custom ERP/CRM software, Amazon marketplace acceleration, and technical SEO for ambitious global businesses.",
  default_og_image: "/images/amazon-aed-70k-sales-proof.png",
  default_canonical_base: "https://avantusforge.com",
  robots_indexing_enabled: true,
  organization_legal_name: "AvantusForge Global Digital Technologies",

  // Preferences & Integrations
  site_maintenance_mode: false,
  announcement_banner_enabled: false,
  announcement_banner_text: "Accelerate your digital operations — schedule an architectural consultation today.",
  cookie_consent_enabled: true,
  ga4_measurement_id: "G-XXXXXXXXXX",
  primary_contact_destination: "info@avantusforge.com",
  notification_email_alerts: true,

  webhook_url: "",
  updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  await initDb();
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT setting_key, setting_value FROM cms_settings"
    );
    if (rows && rows.length > 0) {
      const dbSettings: Partial<SiteSettings> = {};
      for (const row of rows) {
        try {
          dbSettings[row.setting_key as keyof SiteSettings] = JSON.parse(row.setting_value);
        } catch {
          (dbSettings as Record<string, unknown>)[row.setting_key] = row.setting_value;
        }
      }
      return { ...DEFAULT_SETTINGS, ...dbSettings };
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL getSiteSettings fallback to JSON:", err);
  }

  return readJsonFile<SiteSettings>("site-settings.json", DEFAULT_SETTINGS);
}

export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<SiteSettings> {
  await initDb();
  const current = await getSiteSettings();
  const merged: SiteSettings = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  try {
    const p = getDbPool();
    for (const [key, value] of Object.entries(merged)) {
      const valStr = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
      await p.query(
        `INSERT INTO cms_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, valStr]
      );
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL updateSiteSettings fallback to JSON:", err);
  }

  writeJsonFile("site-settings.json", merged);
  return merged;
}

// ================= CRM CLIENTS REPOSITORY =================
export interface CrmClient {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  website?: string;
  status: "Active" | "Prospect" | "Former";
  account_manager?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getClients(): Promise<CrmClient[]> {
  await initDb();
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM crm_clients ORDER BY company_name ASC"
    );
    return rows as CrmClient[];
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL getClients fallback to JSON:", err);
  }
  return readJsonFile<CrmClient[]>("crm-clients.json", []);
}

export async function saveClient(client: Partial<CrmClient> & { company_name: string; contact_name: string; email: string }): Promise<number> {
  await initDb();
  let id = client.id || Date.now();
  try {
    const p = getDbPool();
    if (client.id) {
      await p.query(
        `UPDATE crm_clients SET company_name = ?, contact_name = ?, email = ?, phone = ?, address = ?, country = ?, website = ?, status = ?, account_manager = ?, notes = ? WHERE id = ?`,
        [client.company_name, client.contact_name, client.email, client.phone || null, client.address || null, client.country || "United Kingdom", client.website || null, client.status || "Active", client.account_manager || "Usman Farooq", client.notes || null, client.id]
      );
    } else {
      const [res] = await p.query<ResultSetHeader>(
        `INSERT INTO crm_clients (company_name, contact_name, email, phone, address, country, website, status, account_manager, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [client.company_name, client.contact_name, client.email, client.phone || null, client.address || null, client.country || "United Kingdom", client.website || null, client.status || "Active", client.account_manager || "Usman Farooq", client.notes || null]
      );
      if (res.insertId) id = res.insertId;
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL saveClient fallback to JSON:", err);
  }
  return id;
}

// ================= FINANCE REPOSITORY =================
export interface FinanceInvoice {
  id: number;
  invoice_number: string;
  client_id?: number;
  client_name: string;
  client_email: string;
  project_id?: number;
  issue_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  balance_due: number;
  status: "Draft" | "Sent" | "Paid" | "Partially Paid" | "Overdue" | "Cancelled";
  notes?: string;
  line_items_json?: string;
  created_at?: string;
}

export async function getInvoices(): Promise<FinanceInvoice[]> {
  await initDb();
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM finance_invoices ORDER BY issue_date DESC, id DESC"
    );
    return rows as FinanceInvoice[];
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL getInvoices fallback:", err);
  }
  return [];
}

export async function saveInvoice(inv: Partial<FinanceInvoice> & { invoice_number: string; client_name: string; client_email: string; total_amount: number }): Promise<number> {
  await initDb();
  let id = inv.id || Date.now();
  try {
    const p = getDbPool();
    if (inv.id) {
      await p.query(
        `UPDATE finance_invoices SET invoice_number = ?, client_name = ?, client_email = ?, issue_date = ?, due_date = ?, currency = ?, subtotal = ?, tax_rate = ?, tax_amount = ?, total_amount = ?, balance_due = ?, status = ?, notes = ?, line_items_json = ? WHERE id = ?`,
        [inv.invoice_number, inv.client_name, inv.client_email, inv.issue_date, inv.due_date, inv.currency || "USD", inv.subtotal || 0, inv.tax_rate || 0, inv.tax_amount || 0, inv.total_amount, inv.balance_due || 0, inv.status || "Sent", inv.notes || null, inv.line_items_json || "[]", inv.id]
      );
    } else {
      const [res] = await p.query<ResultSetHeader>(
        `INSERT INTO finance_invoices (invoice_number, client_name, client_email, issue_date, due_date, currency, subtotal, tax_rate, tax_amount, total_amount, balance_due, status, notes, line_items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [inv.invoice_number, inv.client_name, inv.client_email, inv.issue_date, inv.due_date, inv.currency || "USD", inv.subtotal || 0, inv.tax_rate || 0, inv.tax_amount || 0, inv.total_amount, inv.balance_due || 0, inv.status || "Sent", inv.notes || null, inv.line_items_json || "[]"]
      );
      if (res.insertId) id = res.insertId;
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL saveInvoice error:", err);
  }
  return id;
}

// ================= HRMS REPOSITORY =================
export interface HrmsEmployee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  date_of_joining: string;
  employment_type: string;
  status: "Active" | "Inactive" | "On Leave";
  base_salary: number;
  currency: string;
  emergency_contact?: string;
  bank_details_json?: string;
  created_at?: string;
}

export async function getEmployees(): Promise<HrmsEmployee[]> {
  await initDb();
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM hrms_employees ORDER BY department ASC, full_name ASC"
    );
    return rows as HrmsEmployee[];
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL getEmployees error:", err);
  }
  return [];
}

export async function saveEmployee(emp: Partial<HrmsEmployee> & { employee_code: string; full_name: string; email: string }): Promise<number> {
  await initDb();
  let id = emp.id || Date.now();
  try {
    const p = getDbPool();
    if (emp.id) {
      await p.query(
        `UPDATE hrms_employees SET employee_code = ?, full_name = ?, email = ?, phone = ?, department = ?, designation = ?, date_of_joining = ?, employment_type = ?, status = ?, base_salary = ?, currency = ? WHERE id = ?`,
        [emp.employee_code, emp.full_name, emp.email, emp.phone || null, emp.department || "Engineering", emp.designation || "Staff", emp.date_of_joining || "2023-01-01", emp.employment_type || "Full-time", emp.status || "Active", emp.base_salary || 0, emp.currency || "PKR", emp.id]
      );
    } else {
      const [res] = await p.query<ResultSetHeader>(
        `INSERT INTO hrms_employees (employee_code, full_name, email, phone, department, designation, date_of_joining, employment_type, status, base_salary, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [emp.employee_code, emp.full_name, emp.email, emp.phone || null, emp.department || "Engineering", emp.designation || "Staff", emp.date_of_joining || "2023-01-01", emp.employment_type || "Full-time", emp.status || "Active", emp.base_salary || 0, emp.currency || "PKR"]
      );
      if (res.insertId) id = res.insertId;
    }
  } catch (err) {
    console.warn("[AvantusForge DB] MySQL saveEmployee error:", err);
  }
  return id;
}


