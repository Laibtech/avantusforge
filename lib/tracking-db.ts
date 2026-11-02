import fs from "fs";
import path from "path";
import { getDbPool } from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { GeoLocation, getCountryFlag } from "./geolocation";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "visitor-sessions.json");
const PAGEVIEWS_FILE = path.join(DATA_DIR, "visitor-pageviews.json");

export interface VisitorSessionRecord {
  id: string;
  ip_address?: string;
  masked_ip: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  landing_page: string;
  current_page: string;
  previous_page?: string;
  referrer: string;
  referrer_source: "Direct" | "Organic Search" | "Social Media" | "Referral" | "Campaign";
  is_returning: boolean;
  total_pageviews: number;
  duration_seconds: number;
  started_at: string;
  last_seen_at: string;
}

export interface VisitorPageviewRecord {
  id: number;
  session_id: string;
  path: string;
  previous_path?: string;
  referrer: string;
  referrer_source: string;
  device_type: string;
  browser: string;
  os: string;
  country: string;
  country_code: string;
  city: string;
  masked_ip: string;
  duration_seconds: number;
  created_at: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[Tracking DB] Failed writing JSON:", err);
  }
}

let tablesInitialized = false;

/**
 * Ensures MySQL visitor tables exist with full telemetry columns and indexes.
 */
export async function initTrackingTables(): Promise<void> {
  if (tablesInitialized) return;

  try {
    const p = getDbPool();

    // 1. visitor_sessions table
    await p.query(`
      CREATE TABLE IF NOT EXISTS visitor_sessions (
        id VARCHAR(128) PRIMARY KEY,
        ip_address VARCHAR(64) NULL,
        masked_ip VARCHAR(64) NOT NULL,
        country VARCHAR(100) DEFAULT 'Unknown',
        country_code VARCHAR(10) DEFAULT 'XX',
        region VARCHAR(100) DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        timezone VARCHAR(100) DEFAULT 'UTC',
        isp VARCHAR(150) DEFAULT '',
        device_type VARCHAR(50) DEFAULT 'desktop',
        browser VARCHAR(50) DEFAULT 'Other',
        os VARCHAR(50) DEFAULT 'Other',
        landing_page VARCHAR(255) NOT NULL,
        current_page VARCHAR(255) NOT NULL,
        previous_page VARCHAR(255) NULL,
        referrer VARCHAR(500) DEFAULT 'Direct',
        referrer_source VARCHAR(50) DEFAULT 'Direct',
        is_returning BOOLEAN DEFAULT FALSE,
        total_pageviews INT DEFAULT 1,
        duration_seconds INT DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_last_seen (last_seen_at),
        INDEX idx_started (started_at),
        INDEX idx_country (country_code),
        INDEX idx_source (referrer_source)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. visitor_pageviews table
    await p.query(`
      CREATE TABLE IF NOT EXISTS visitor_pageviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(128) NOT NULL,
        path VARCHAR(255) NOT NULL,
        previous_path VARCHAR(255) NULL,
        referrer VARCHAR(500) DEFAULT 'Direct',
        referrer_source VARCHAR(50) DEFAULT 'Direct',
        device_type VARCHAR(50) NULL,
        browser VARCHAR(50) NULL,
        os VARCHAR(50) NULL,
        country VARCHAR(100) NULL,
        country_code VARCHAR(10) NULL,
        city VARCHAR(100) NULL,
        masked_ip VARCHAR(64) NULL,
        duration_seconds INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session (session_id),
        INDEX idx_created (created_at),
        INDEX idx_path (path)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Add potential missing columns if table already existed in a legacy state
    const migrations = [
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS masked_ip VARCHAR(64) NOT NULL DEFAULT '127.0.***.***'",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS current_page VARCHAR(255) NOT NULL DEFAULT '/'",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS previous_page VARCHAR(255) NULL",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'XX'",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT ''",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT ''",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC'",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS isp VARCHAR(150) DEFAULT ''",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS browser VARCHAR(50) DEFAULT 'Other'",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS os VARCHAR(50) DEFAULT 'Other'",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS referrer_source VARCHAR(50) DEFAULT 'Direct'",
      "ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS is_returning BOOLEAN DEFAULT FALSE",
      "ALTER TABLE visitor_pageviews ADD COLUMN IF NOT EXISTS previous_path VARCHAR(255) NULL",
      "ALTER TABLE visitor_pageviews ADD COLUMN IF NOT EXISTS referrer_source VARCHAR(50) DEFAULT 'Direct'",
      "ALTER TABLE visitor_pageviews ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'XX'",
      "ALTER TABLE visitor_pageviews ADD COLUMN IF NOT EXISTS masked_ip VARCHAR(64) NULL",
      "ALTER TABLE visitor_pageviews ADD COLUMN IF NOT EXISTS duration_seconds INT DEFAULT 0",
    ];

    for (const sql of migrations) {
      try {
        await p.query(sql);
      } catch {
        // Ignored if column already exists or syntax not supported
      }
    }

    tablesInitialized = true;
  } catch (err) {
    console.warn("[Tracking DB] MySQL table init note (dual-storage active):", err);
    tablesInitialized = true;
  }
}

/**
 * Records a pageview event and updates the visitor session.
 */
export async function recordPageView(params: {
  sessionId: string;
  rawIp: string;
  maskedIp: string;
  path: string;
  previousPath?: string;
  referrer: string;
  referrerSource: "Direct" | "Organic Search" | "Social Media" | "Referral" | "Campaign";
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  geo: GeoLocation;
  isReturning: boolean;
}): Promise<void> {
  await initTrackingTables();
  const now = new Date().toISOString();

  // 1. MySQL Execution
  try {
    const p = getDbPool();

    // Upsert session
    await p.query(
      `INSERT INTO visitor_sessions (
         id, ip_address, masked_ip, country, country_code, region, city, timezone, isp,
         device_type, browser, os, landing_page, current_page, previous_page, referrer,
         referrer_source, is_returning, total_pageviews, duration_seconds, started_at, last_seen_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         current_page = VALUES(current_page),
         previous_page = VALUES(previous_page),
         total_pageviews = total_pageviews + 1,
         last_seen_at = NOW()`,
      [
        params.sessionId,
        params.rawIp,
        params.maskedIp,
        params.geo.country,
        params.geo.countryCode,
        params.geo.region,
        params.geo.city,
        params.geo.timezone,
        params.geo.isp,
        params.device,
        params.browser,
        params.os,
        params.path, // landing_page on first insert
        params.path, // current_page
        params.previousPath || null,
        params.referrer,
        params.referrerSource,
        params.isReturning ? 1 : 0,
      ]
    );

    // Insert pageview
    await p.query(
      `INSERT INTO visitor_pageviews (
         session_id, path, previous_path, referrer, referrer_source,
         device_type, browser, os, country, country_code, city, masked_ip, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        params.sessionId,
        params.path,
        params.previousPath || null,
        params.referrer,
        params.referrerSource,
        params.device,
        params.browser,
        params.os,
        params.geo.country,
        params.geo.countryCode,
        params.geo.city,
        params.maskedIp,
      ]
    );
  } catch (err) {
    console.warn("[Tracking DB] MySQL recordPageView error (saved to JSON fallback):", err);
  }

  // 2. Dual JSON Persistence (Guarantees data retention and local resilience)
  try {
    const sessions = readJson<VisitorSessionRecord[]>(SESSIONS_FILE, []);
    const existingIndex = sessions.findIndex((s) => s.id === params.sessionId);

    if (existingIndex >= 0) {
      sessions[existingIndex].current_page = params.path;
      if (params.previousPath) sessions[existingIndex].previous_page = params.previousPath;
      sessions[existingIndex].total_pageviews += 1;
      sessions[existingIndex].last_seen_at = now;
    } else {
      const newSession: VisitorSessionRecord = {
        id: params.sessionId,
        ip_address: params.rawIp,
        masked_ip: params.maskedIp,
        country: params.geo.country,
        country_code: params.geo.countryCode,
        region: params.geo.region,
        city: params.geo.city,
        timezone: params.geo.timezone,
        isp: params.geo.isp,
        device_type: params.device,
        browser: params.browser,
        os: params.os,
        landing_page: params.path,
        current_page: params.path,
        previous_page: params.previousPath,
        referrer: params.referrer,
        referrer_source: params.referrerSource,
        is_returning: params.isReturning,
        total_pageviews: 1,
        duration_seconds: 0,
        started_at: now,
        last_seen_at: now,
      };
      sessions.unshift(newSession);
      if (sessions.length > 500) sessions.length = 500;
    }
    writeJson(SESSIONS_FILE, sessions);

    // Save pageview event
    const pageviews = readJson<VisitorPageviewRecord[]>(PAGEVIEWS_FILE, []);
    const newPv: VisitorPageviewRecord = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      session_id: params.sessionId,
      path: params.path,
      previous_path: params.previousPath,
      referrer: params.referrer,
      referrer_source: params.referrerSource,
      device_type: params.device,
      browser: params.browser,
      os: params.os,
      country: params.geo.country,
      country_code: params.geo.countryCode,
      city: params.geo.city,
      masked_ip: params.maskedIp,
      duration_seconds: 0,
      created_at: now,
    };
    pageviews.unshift(newPv);
    if (pageviews.length > 1000) pageviews.length = 1000;
    writeJson(PAGEVIEWS_FILE, pageviews);
  } catch (jsonErr) {
    console.error("[Tracking DB] JSON persistence error:", jsonErr);
  }
}

/**
 * Handles periodic client heartbeats to track dwell time and active online status.
 */
export async function recordHeartbeat(params: {
  sessionId: string;
  path: string;
  durationSeconds: number;
}): Promise<void> {
  await initTrackingTables();
  const now = new Date().toISOString();

  // 1. MySQL Update
  try {
    const p = getDbPool();
    await p.query(
      `UPDATE visitor_sessions 
       SET duration_seconds = duration_seconds + ?,
           current_page = ?,
           last_seen_at = NOW()
       WHERE id = ?`,
      [params.durationSeconds, params.path, params.sessionId]
    );

    // Update current pageview duration
    await p.query(
      `UPDATE visitor_pageviews 
       SET duration_seconds = duration_seconds + ?
       WHERE session_id = ? AND path = ?
       ORDER BY id DESC LIMIT 1`,
      [params.durationSeconds, params.sessionId, params.path]
    );
  } catch {
    // handled gracefully
  }

  // 2. JSON Update
  try {
    const sessions = readJson<VisitorSessionRecord[]>(SESSIONS_FILE, []);
    const session = sessions.find((s) => s.id === params.sessionId);
    if (session) {
      session.duration_seconds = (session.duration_seconds || 0) + params.durationSeconds;
      session.current_page = params.path;
      session.last_seen_at = now;
      writeJson(SESSIONS_FILE, sessions);
    }
  } catch {
    // handled gracefully
  }
}

export interface TrackingTelemetryData {
  activeNow: number;
  todayVisitors: number;
  todayPageviews: number;
  uniqueVisitors: number;
  avgSessionDurationSec: number;
  activeSessions: (VisitorSessionRecord & { seconds_ago: number; flag: string })[];
  recentPageviews: (VisitorPageviewRecord & { seconds_ago: number })[];
  topPages: { path: string; views: number; uniqueVisitors: number }[];
  topCountries: { country: string; countryCode: string; flag: string; count: number; percentage: number }[];
  topCities: { city: string; country: string; flag: string; count: number }[];
  trafficSources: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
}

/**
 * Computes live metrics for the real-time admin visitors dashboard.
 */
export async function getLiveTrackingMetrics(options?: {
  countryFilter?: string;
  sourceFilter?: string;
  includeRawIp?: boolean;
}): Promise<TrackingTelemetryData> {
  await initTrackingTables();

  const nowMs = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartIso = todayStart.toISOString();

  let sessions: VisitorSessionRecord[] = [];
  let pageviews: VisitorPageviewRecord[] = [];

  // Try fetching from MySQL first
  let mysqlSucceeded = false;
  try {
    const p = getDbPool();

    const [sessionRows] = await p.query<RowDataPacket[]>(
      `SELECT id, ip_address, masked_ip, country, country_code, region, city, timezone, isp,
              device_type, browser, os, landing_page, current_page, previous_page, referrer,
              referrer_source, is_returning, total_pageviews, duration_seconds, started_at, last_seen_at
       FROM visitor_sessions
       ORDER BY last_seen_at DESC
       LIMIT 300`
    );

    const [pvRows] = await p.query<RowDataPacket[]>(
      `SELECT id, session_id, path, previous_path, referrer, referrer_source,
              device_type, browser, os, country, country_code, city, masked_ip, duration_seconds, created_at
       FROM visitor_pageviews
       ORDER BY id DESC
       LIMIT 300`
    );

    if (sessionRows) {
      sessions = sessionRows.map((r) => ({
        id: r.id,
        ip_address: options?.includeRawIp ? r.ip_address : undefined,
        masked_ip: r.masked_ip || "127.0.***.***",
        country: r.country || "Unknown Country",
        country_code: r.country_code || "XX",
        region: r.region || "",
        city: r.city || "",
        timezone: r.timezone || "UTC",
        isp: r.isp || "",
        device_type: (r.device_type || "desktop") as "desktop" | "mobile" | "tablet",
        browser: r.browser || "Other",
        os: r.os || "Other",
        landing_page: r.landing_page || "/",
        current_page: r.current_page || r.landing_page || "/",
        previous_page: r.previous_page || undefined,
        referrer: r.referrer || "Direct",
        referrer_source: (r.referrer_source || "Direct") as "Direct" | "Organic Search" | "Social Media" | "Referral" | "Campaign",
        is_returning: Boolean(r.is_returning),
        total_pageviews: Number(r.total_pageviews) || 1,
        duration_seconds: Number(r.duration_seconds) || 0,
        started_at: new Date(r.started_at).toISOString(),
        last_seen_at: new Date(r.last_seen_at).toISOString(),
      }));
      mysqlSucceeded = true;
    }

    if (pvRows) {
      pageviews = pvRows.map((r) => ({
        id: r.id,
        session_id: r.session_id,
        path: r.path,
        previous_path: r.previous_path || undefined,
        referrer: r.referrer || "Direct",
        referrer_source: r.referrer_source || "Direct",
        device_type: r.device_type || "desktop",
        browser: r.browser || "Other",
        os: r.os || "Other",
        country: r.country || "Unknown Country",
        country_code: r.country_code || "XX",
        city: r.city || "",
        masked_ip: r.masked_ip || "127.0.***.***",
        duration_seconds: Number(r.duration_seconds) || 0,
        created_at: new Date(r.created_at).toISOString(),
      }));
    }
  } catch (err) {
    console.warn("[Tracking DB] MySQL query fallback to JSON:", err);
  }

  // Fallback to JSON store if MySQL had 0 records or failed
  if (!mysqlSucceeded || sessions.length === 0) {
    const jsonSessions = readJson<VisitorSessionRecord[]>(SESSIONS_FILE, []);
    const jsonPageviews = readJson<VisitorPageviewRecord[]>(PAGEVIEWS_FILE, []);

    if (jsonSessions.length > 0) {
      sessions = jsonSessions.map((s) => ({
        ...s,
        ip_address: options?.includeRawIp ? s.ip_address : undefined,
      }));
      pageviews = jsonPageviews;
    }
  }

  // Apply Filters if provided
  let filteredSessions = sessions;
  if (options?.countryFilter && options.countryFilter !== "ALL") {
    filteredSessions = filteredSessions.filter(
      (s) => s.country_code.toUpperCase() === options.countryFilter?.toUpperCase()
    );
  }
  if (options?.sourceFilter && options.sourceFilter !== "ALL") {
    filteredSessions = filteredSessions.filter((s) => s.referrer_source === options.sourceFilter);
  }

  // 1. Live Active Visitors (activity within last 5 minutes = 300,000 ms)
  const FIVE_MIN_MS = 5 * 60 * 1000;
  const activeNowSessions = filteredSessions.filter((s) => {
    const lastSeenMs = new Date(s.last_seen_at).getTime();
    return nowMs - lastSeenMs <= FIVE_MIN_MS;
  });
  const activeNow = activeNowSessions.length;

  // 2. Total Visitors Today
  const todaySessions = filteredSessions.filter((s) => {
    const startedMs = new Date(s.started_at).getTime();
    return startedMs >= todayStart.getTime();
  });
  const todayVisitors = todaySessions.length;

  // 3. Total Pageviews Today
  const todayPv = pageviews.filter((pv) => {
    const pvMs = new Date(pv.created_at).getTime();
    return pvMs >= todayStart.getTime();
  });
  const todayPageviews = todayPv.length || todaySessions.reduce((acc, s) => acc + s.total_pageviews, 0);

  // 4. Unique Visitors
  const uniqueVisitorIds = new Set(filteredSessions.map((s) => s.id));
  const uniqueVisitors = uniqueVisitorIds.size;

  // 5. Average Session Duration (seconds)
  const totalDuration = filteredSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const avgSessionDurationSec = filteredSessions.length > 0 ? Math.round(totalDuration / filteredSessions.length) : 0;

  // 6. Active Sessions with seconds_ago and flag
  const activeSessions = filteredSessions.map((s) => {
    const lastSeenMs = new Date(s.last_seen_at).getTime();
    const secondsAgo = Math.max(0, Math.floor((nowMs - lastSeenMs) / 1000));
    return {
      ...s,
      seconds_ago: secondsAgo,
      flag: getCountryFlag(s.country_code),
    };
  });

  // 7. Recent Pageviews with seconds_ago
  const recentPageviews = pageviews.slice(0, 40).map((pv) => {
    const pvMs = new Date(pv.created_at).getTime();
    const secondsAgo = Math.max(0, Math.floor((nowMs - pvMs) / 1000));
    return {
      ...pv,
      seconds_ago: secondsAgo,
    };
  });

  // 8. Top Visited Pages
  const pageMap = new Map<string, { views: number; sessions: Set<string> }>();
  for (const pv of pageviews) {
    const p = pv.path || "/";
    if (!pageMap.has(p)) {
      pageMap.set(p, { views: 0, sessions: new Set() });
    }
    const item = pageMap.get(p)!;
    item.views += 1;
    item.sessions.add(pv.session_id);
  }
  const topPages = Array.from(pageMap.entries())
    .map(([path, val]) => ({
      path,
      views: val.views,
      uniqueVisitors: val.sessions.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // 9. Top Countries
  const countryMap = new Map<string, { country: string; code: string; count: number }>();
  for (const s of filteredSessions) {
    const code = s.country_code || "XX";
    if (!countryMap.has(code)) {
      countryMap.set(code, { country: s.country || "Unknown", code, count: 0 });
    }
    countryMap.get(code)!.count += 1;
  }
  const totalCountrySessions = filteredSessions.length || 1;
  const topCountries = Array.from(countryMap.values())
    .map((c) => ({
      country: c.country,
      countryCode: c.code,
      flag: getCountryFlag(c.code),
      count: c.count,
      percentage: Math.round((c.count / totalCountrySessions) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 10. Top Cities (reliable only)
  const cityMap = new Map<string, { city: string; country: string; flag: string; count: number }>();
  for (const s of filteredSessions) {
    if (s.city && s.city !== "Unspecified" && s.city !== "Unknown City") {
      const key = `${s.city}-${s.country_code}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city: s.city,
          country: s.country,
          flag: getCountryFlag(s.country_code),
          count: 0,
        });
      }
      cityMap.get(key)!.count += 1;
    }
  }
  const topCities = Array.from(cityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 11. Traffic Sources Breakdown
  const sourceCounts: Record<string, number> = {
    Direct: 0,
    "Organic Search": 0,
    "Social Media": 0,
    Referral: 0,
    Campaign: 0,
  };
  for (const s of filteredSessions) {
    const src = s.referrer_source || "Direct";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }
  const trafficSources = Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    count,
    percentage: Math.round((count / totalCountrySessions) * 100),
  }));

  // 12. Device Breakdown
  const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
  for (const s of filteredSessions) {
    const d = s.device_type || "desktop";
    deviceCounts[d] = (deviceCounts[d] || 0) + 1;
  }
  const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count,
    percentage: Math.round((count / totalCountrySessions) * 100),
  }));

  return {
    activeNow,
    todayVisitors,
    todayPageviews,
    uniqueVisitors,
    avgSessionDurationSec,
    activeSessions,
    recentPageviews,
    topPages,
    topCountries,
    topCities,
    trafficSources,
    deviceBreakdown,
  };
}

/**
 * Retrieves the full chronological activity journey for a single visitor session.
 */
export async function getSessionTimeline(sessionId: string): Promise<{
  session: VisitorSessionRecord | null;
  timeline: VisitorPageviewRecord[];
}> {
  await initTrackingTables();

  let session: VisitorSessionRecord | null = null;
  let timeline: VisitorPageviewRecord[] = [];

  // Try MySQL
  try {
    const p = getDbPool();
    const [sRows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM visitor_sessions WHERE id = ? LIMIT 1`,
      [sessionId]
    );
    if (sRows && sRows.length > 0) {
      const r = sRows[0];
      session = {
        id: r.id,
        ip_address: r.ip_address,
        masked_ip: r.masked_ip || "127.0.***.***",
        country: r.country,
        country_code: r.country_code,
        region: r.region,
        city: r.city,
        timezone: r.timezone,
        isp: r.isp,
        device_type: r.device_type,
        browser: r.browser,
        os: r.os,
        landing_page: r.landing_page,
        current_page: r.current_page,
        previous_page: r.previous_page,
        referrer: r.referrer,
        referrer_source: r.referrer_source,
        is_returning: Boolean(r.is_returning),
        total_pageviews: r.total_pageviews,
        duration_seconds: r.duration_seconds,
        started_at: new Date(r.started_at).toISOString(),
        last_seen_at: new Date(r.last_seen_at).toISOString(),
      };
    }

    const [pvRows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM visitor_pageviews WHERE session_id = ? ORDER BY id ASC`,
      [sessionId]
    );
    if (pvRows && pvRows.length > 0) {
      timeline = pvRows.map((r) => ({
        id: r.id,
        session_id: r.session_id,
        path: r.path,
        previous_path: r.previous_path,
        referrer: r.referrer,
        referrer_source: r.referrer_source,
        device_type: r.device_type,
        browser: r.browser,
        os: r.os,
        country: r.country,
        country_code: r.country_code,
        city: r.city,
        masked_ip: r.masked_ip,
        duration_seconds: r.duration_seconds || 0,
        created_at: new Date(r.created_at).toISOString(),
      }));
    }
  } catch (err) {
    console.warn("[Tracking DB] getSessionTimeline MySQL fallback:", err);
  }

  // Fallback to JSON
  if (!session) {
    const sessions = readJson<VisitorSessionRecord[]>(SESSIONS_FILE, []);
    session = sessions.find((s) => s.id === sessionId) || null;
    const pageviews = readJson<VisitorPageviewRecord[]>(PAGEVIEWS_FILE, []);
    timeline = pageviews.filter((pv) => pv.session_id === sessionId).reverse();
  }

  return { session, timeline };
}

/**
 * Configurable data retention cleanup: purges records older than specified days.
 */
export async function cleanupOldVisitorRecords(retentionDays: number = 30): Promise<{
  deletedSessions: number;
  deletedPageviews: number;
}> {
  await initTrackingTables();
  let deletedSessions = 0;
  let deletedPageviews = 0;

  try {
    const p = getDbPool();
    const [sResult] = await p.query<ResultSetHeader>(
      `DELETE FROM visitor_sessions WHERE started_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [retentionDays]
    );
    deletedSessions = sResult.affectedRows || 0;

    const [pvResult] = await p.query<ResultSetHeader>(
      `DELETE FROM visitor_pageviews WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [retentionDays]
    );
    deletedPageviews = pvResult.affectedRows || 0;
  } catch (err) {
    console.warn("[Tracking DB] MySQL cleanupOldVisitorRecords error:", err);
  }

  // Clean JSON files
  try {
    const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const sessions = readJson<VisitorSessionRecord[]>(SESSIONS_FILE, []);
    const keptSessions = sessions.filter((s) => new Date(s.started_at).getTime() >= cutoffMs);
    deletedSessions = Math.max(deletedSessions, sessions.length - keptSessions.length);
    writeJson(SESSIONS_FILE, keptSessions);

    const pageviews = readJson<VisitorPageviewRecord[]>(PAGEVIEWS_FILE, []);
    const keptPageviews = pageviews.filter((pv) => new Date(pv.created_at).getTime() >= cutoffMs);
    deletedPageviews = Math.max(deletedPageviews, pageviews.length - keptPageviews.length);
    writeJson(PAGEVIEWS_FILE, keptPageviews);
  } catch (jsonErr) {
    console.error("[Tracking DB] JSON cleanup error:", jsonErr);
  }

  return { deletedSessions, deletedPageviews };
}

/**
 * Generates CSV string for aggregated visitor telemetry data.
 */
export function generateVisitorsCsv(
  sessions: VisitorSessionRecord[],
  includeRawIp: boolean = false
): string {
  const headers = [
    "Session ID",
    includeRawIp ? "Raw IP" : "Masked IP",
    "Country",
    "Country Code",
    "Region",
    "City",
    "Device",
    "Browser",
    "OS",
    "Landing Page",
    "Current Page",
    "Referrer",
    "Traffic Source",
    "Returning Visitor",
    "Pageviews",
    "Duration (sec)",
    "Started At",
    "Last Seen At",
  ];

  const rows = sessions.map((s) => [
    `"${s.id}"`,
    `"${includeRawIp && s.ip_address ? s.ip_address : s.masked_ip}"`,
    `"${s.country || "Unknown"}"`,
    `"${s.country_code || "XX"}"`,
    `"${s.region || ""}"`,
    `"${s.city || ""}"`,
    `"${s.device_type}"`,
    `"${s.browser}"`,
    `"${s.os}"`,
    `"${s.landing_page}"`,
    `"${s.current_page}"`,
    `"${(s.referrer || "").replace(/"/g, '""')}"`,
    `"${s.referrer_source}"`,
    s.is_returning ? "Yes" : "No",
    s.total_pageviews,
    s.duration_seconds,
    `"${s.started_at}"`,
    `"${s.last_seen_at}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

