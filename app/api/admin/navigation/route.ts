import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

const DEFAULT_NAV_ITEMS = [
  { id: "nav-home", title: "Home", href: "/", is_active: true, order_index: 1 },
  { id: "nav-services", title: "Services", href: "/services", is_active: true, order_index: 2 },
  { id: "nav-solutions", title: "Solutions", href: "/solutions", is_active: true, order_index: 3 },
  { id: "nav-work", title: "Work", href: "/work", is_active: true, order_index: 4 },
  { id: "nav-about", title: "About", href: "/about", is_active: true, order_index: 5 },
  { id: "nav-insights", title: "Insights", href: "/insights", is_active: true, order_index: 6 },
  { id: "nav-contact", title: "Contact", href: "/contact", is_active: true, order_index: 7 },
];

export async function GET() {
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT setting_key, setting_value FROM cms_settings WHERE setting_key IN ('site_navigation_json', 'site_footer_json', 'logo_url', 'brand_name', 'consultation_cta_text', 'consultation_cta_url', 'footer_copyright', 'primary_email', 'phone_number', 'operations_address')"
    );

    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.setting_key] = r.setting_value;
    }

    let navItems = DEFAULT_NAV_ITEMS;
    if (map["site_navigation_json"]) {
      try {
        const parsed = JSON.parse(map["site_navigation_json"]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          navItems = parsed;
        }
      } catch {}
    }

    let footerConfig = null;
    if (map["site_footer_json"]) {
      try {
        footerConfig = JSON.parse(map["site_footer_json"]);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      navigation: {
        logo_url: map["logo_url"] || "/logo.png",
        brand_name: map["brand_name"] || "AvantusForge",
        consultation_cta_text: map["consultation_cta_text"] || "Get a Free Consultation",
        consultation_cta_url: map["consultation_cta_url"] || "/contact",
        nav_items: navItems,
      },
      footer: footerConfig || {
        newsletter_headline: "Quarterly Perspectives",
        newsletter_prompt: "Stay updated with modern digital engineering.",
        primary_email: map["primary_email"] || "info@avantusforge.com",
        phone_number: map["phone_number"] || "+92 327 4074472",
        operations_address: map["operations_address"] || "AvantusForge Global Operations UK, USA, UAE, Kuwait, Pakistan",
        copyright_text: map["footer_copyright"] || "© 2026 AvantusForge. All rights reserved.",
      },
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

  try {
    const body = await req.json();
    const { navigation, footer } = body;

    const p = getDbPool();

    const upsert = async (key: string, val: string) => {
      await p.query(
        `INSERT INTO cms_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
        [key, val]
      );
    };

    if (navigation) {
      if (navigation.logo_url) await upsert("logo_url", navigation.logo_url);
      if (navigation.brand_name) await upsert("brand_name", navigation.brand_name);
      if (navigation.consultation_cta_text) await upsert("consultation_cta_text", navigation.consultation_cta_text);
      if (navigation.consultation_cta_url) await upsert("consultation_cta_url", navigation.consultation_cta_url);
      if (Array.isArray(navigation.nav_items)) {
        await upsert("site_navigation_json", JSON.stringify(navigation.nav_items));
      }
    }

    if (footer) {
      await upsert("site_footer_json", JSON.stringify(footer));
      if (footer.copyright_text) await upsert("footer_copyright", footer.copyright_text);
      if (footer.primary_email) await upsert("primary_email", footer.primary_email);
      if (footer.phone_number) await upsert("phone_number", footer.phone_number);
      if (footer.operations_address) await upsert("operations_address", footer.operations_address);
    }

    await p.query(
      `INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
       VALUES (?, 'NAVIGATION_UPDATED', 'Global Navigation', 'site_nav', ?)`,
      [session.user.username, `Updated website header navigation and footer settings`]
    );

    return NextResponse.json({ success: true, message: "Navigation and Footer settings updated successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
