import fs from "fs";
import path from "path";

export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  flag: string;
  isApproximate: boolean;
}

// In-memory cache for ultra-fast lookup (sub-millisecond)
const geoMemoryCache = new Map<string, { data: GeoLocation; expires: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// File cache path
const DATA_DIR = path.join(process.cwd(), "data");
const GEO_CACHE_FILE = path.join(DATA_DIR, "geo-cache.json");

function loadDiskCache(): Record<string, GeoLocation> {
  try {
    if (fs.existsSync(GEO_CACHE_FILE)) {
      const content = fs.readFileSync(GEO_CACHE_FILE, "utf8");
      return JSON.parse(content);
    }
  } catch {
    // ignore
  }
  return {};
}

function saveDiskCache(cacheObj: Record<string, GeoLocation>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(GEO_CACHE_FILE, JSON.stringify(cacheObj, null, 2), "utf8");
  } catch {
    // ignore
  }
}

/**
 * Extracts verified client IP using trusted proxy headers.
 */
export function extractClientIp(headers: Headers): string {
  // 1. Cloudflare connecting IP
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) return cfIp.trim();

  // 2. Standard reverse proxy real IP
  const realIp = headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  // 3. X-Forwarded-For list (first non-private IP if possible)
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const ips = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (ips.length > 0) {
      // Find first non-internal IP if present, otherwise first
      const nonInternal = ips.find((ip) => !isPrivateIp(ip));
      return nonInternal || ips[0];
    }
  }

  // 4. Fallback localhost
  return "127.0.0.1";
}

/**
 * Anonymizes/masks IP address for privacy & GDPR compliance.
 * IPv4 -> 192.168.***.***
 * IPv6 -> 2001:0db8:85a3:****:****:****:****:****
 */
export function maskIp(ip: string): string {
  if (!ip) return "0.0.0.0";
  const clean = ip.trim();

  if (clean === "127.0.0.1" || clean === "::1" || clean === "localhost") {
    return "127.0.***.*** (Local)";
  }

  // IPv4 format
  if (clean.includes(".")) {
    const parts = clean.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }

  // IPv6 format
  if (clean.includes(":")) {
    const parts = clean.split(":");
    if (parts.length >= 3) {
      return `${parts.slice(0, 3).join(":")}:****:****:****`;
    }
  }

  return "Anonymized IP";
}

/**
 * Checks if an IP is a private/local/loopback IP address.
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim().toLowerCase();

  if (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean === "localhost" ||
    clean.startsWith("10.") ||
    clean.startsWith("192.168.") ||
    clean.startsWith("fc00:") ||
    clean.startsWith("fe80:")
  ) {
    return true;
  }

  // Check 172.16.0.0 - 172.31.255.255
  if (clean.startsWith("172.")) {
    const parts = clean.split(".");
    if (parts.length === 4) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
  }

  return false;
}

/**
 * Converts 2-letter ISO country code into emoji flag.
 */
export function getCountryFlag(code?: string): string {
  if (!code || code.length !== 2 || code === "XX") return "🌐";
  if (code.toUpperCase() === "LC" || code.toUpperCase() === "LO") return "💻";
  try {
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

// ISO code to Country Name dictionary for quick mapping
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  PK: "Pakistan",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  AU: "Australia",
  IN: "India",
  SG: "Singapore",
  KW: "Kuwait",
  QA: "Qatar",
  OM: "Oman",
  TR: "Turkey",
  NL: "Netherlands",
  IE: "Ireland",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  ES: "Spain",
  IT: "Italy",
  JP: "Japan",
  CN: "China",
  BR: "Brazil",
  ZA: "South Africa",
  MY: "Malaysia",
  ID: "Indonesia",
  NZ: "New Zealand",
};

/**
 * Resolves approximate visitor geolocation safely without claiming GPS precision.
 */
export async function resolveLocation(ip: string, headers?: Headers): Promise<GeoLocation> {
  const cleanIp = (ip || "127.0.0.1").trim();

  // 1. Handle Local / Loopback / Private IPs
  if (isPrivateIp(cleanIp)) {
    return {
      country: "Local Development",
      countryCode: "LOC",
      region: "Internal Network",
      city: "Localhost",
      timezone: "UTC",
      isp: "Loopback Interface",
      flag: "💻",
      isApproximate: true,
    };
  }

  // 2. Check Cloudflare Edge Headers if present
  if (headers) {
    const cfCountry = headers.get("cf-ipcountry");
    if (cfCountry && cfCountry.length === 2 && cfCountry !== "XX" && cfCountry !== "T1") {
      const code = cfCountry.toUpperCase();
      const country = COUNTRY_NAMES[code] || code;
      const city = headers.get("cf-ipcity") || "Metro Area";
      const region = headers.get("cf-region") || "";
      const timezone = headers.get("cf-timezone") || "UTC";

      return {
        country,
        countryCode: code,
        region,
        city,
        timezone,
        isp: "Cloudflare Network",
        flag: getCountryFlag(code),
        isApproximate: true,
      };
    }
  }

  // 3. Check In-Memory Cache
  const cached = geoMemoryCache.get(cleanIp);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  // 4. Check Disk Cache
  const disk = loadDiskCache();
  if (disk[cleanIp]) {
    geoMemoryCache.set(cleanIp, { data: disk[cleanIp], expires: Date.now() + CACHE_TTL_MS });
    return disk[cleanIp];
  }

  // 5. Query Reputable Geolocation API (ip-api.com with timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(
      `http://ip-api.com/json/${cleanIp}?fields=status,country,countryCode,regionName,city,timezone,isp,org`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === "success") {
        const result: GeoLocation = {
          country: data.country || "Unknown Country",
          countryCode: data.countryCode || "XX",
          region: data.regionName || "",
          city: data.city || "Unknown City",
          timezone: data.timezone || "UTC",
          isp: data.isp || data.org || "Internet Provider",
          flag: getCountryFlag(data.countryCode),
          isApproximate: true,
        };

        // Save in memory & disk cache
        geoMemoryCache.set(cleanIp, { data: result, expires: Date.now() + CACHE_TTL_MS });
        disk[cleanIp] = result;
        saveDiskCache(disk);

        return result;
      }
    }
  } catch {
    // Network lookup timed out or failed; fallback gracefully
  }

  // 6. Graceful default fallback
  const fallback: GeoLocation = {
    country: "Unknown Country",
    countryCode: "XX",
    region: "Unspecified",
    city: "Unspecified",
    timezone: "UTC",
    isp: "Standard ISP",
    flag: "🌐",
    isApproximate: true,
  };

  return fallback;
}

/**
 * Categorizes traffic source into Direct, Organic Search, Social Media, Referral, or Campaign.
 */
export function categorizeReferrer(
  referrer: string,
  currentPath?: string
): { source: "Direct" | "Organic Search" | "Social Media" | "Referral" | "Campaign"; label: string } {
  if (!referrer || referrer === "Direct" || referrer === "") {
    return { source: "Direct", label: "Direct Traffic" };
  }

  const refLower = referrer.toLowerCase();

  // Campaign detection via UTM or tags
  if (
    (currentPath && /[?&](utm_source|utm_campaign|utm_medium|gclid|fbclid)=/i.test(currentPath)) ||
    refLower.includes("utm_")
  ) {
    return { source: "Campaign", label: "Paid / Campaign" };
  }

  // Organic Search engines
  if (/google\./i.test(refLower)) return { source: "Organic Search", label: "Google Search" };
  if (/bing\./i.test(refLower)) return { source: "Organic Search", label: "Bing Search" };
  if (/yahoo\./i.test(refLower)) return { source: "Organic Search", label: "Yahoo Search" };
  if (/duckduckgo\./i.test(refLower)) return { source: "Organic Search", label: "DuckDuckGo" };
  if (/ecosia\./i.test(refLower)) return { source: "Organic Search", label: "Ecosia" };
  if (/baidu\./i.test(refLower)) return { source: "Organic Search", label: "Baidu" };
  if (/yandex\./i.test(refLower)) return { source: "Organic Search", label: "Yandex" };

  // Social Media platforms
  if (/linkedin\./i.test(refLower)) return { source: "Social Media", label: "LinkedIn" };
  if (/t\.co|twitter\.|x\.com/i.test(refLower)) return { source: "Social Media", label: "X / Twitter" };
  if (/facebook\.|fb\.com/i.test(refLower)) return { source: "Social Media", label: "Facebook" };
  if (/instagram\./i.test(refLower)) return { source: "Social Media", label: "Instagram" };
  if (/reddit\./i.test(refLower)) return { source: "Social Media", label: "Reddit" };
  if (/youtube\./i.test(refLower)) return { source: "Social Media", label: "YouTube" };
  if (/tiktok\./i.test(refLower)) return { source: "Social Media", label: "TikTok" };
  if (/pinterest\./i.test(refLower)) return { source: "Social Media", label: "Pinterest" };

  // General External Referral
  try {
    const url = new URL(referrer.startsWith("http") ? referrer : `https://${referrer}`);
    return { source: "Referral", label: url.hostname.replace(/^www\./, "") };
  } catch {
    return { source: "Referral", label: "External Referral" };
  }
}

/**
 * Parses user agent string to extract device, browser, and OS.
 */
export function parseUserAgent(ua: string): { device: "desktop" | "mobile" | "tablet"; browser: string; os: string } {
  const uaLower = (ua || "").toLowerCase();

  // Device
  let device: "desktop" | "mobile" | "tablet" = "desktop";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(uaLower)) {
    device = "tablet";
  } else if (/mobile|iphone|ipod|android/i.test(uaLower)) {
    device = "mobile";
  }

  // Browser
  let browser = "Other";
  if (uaLower.includes("edg/")) browser = "Edge";
  else if (uaLower.includes("chrome/") && !uaLower.includes("edg/")) browser = "Chrome";
  else if (uaLower.includes("safari/") && !uaLower.includes("chrome/")) browser = "Safari";
  else if (uaLower.includes("firefox/")) browser = "Firefox";
  else if (uaLower.includes("opera") || uaLower.includes("opr/")) browser = "Opera";

  // Operating System
  let os = "Other";
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("macintosh") || uaLower.includes("mac os x")) os = "macOS";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ipod")) os = "iOS";
  else if (uaLower.includes("linux")) os = "Linux";

  return { device, browser, os };
}

