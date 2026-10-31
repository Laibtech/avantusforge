import { getDbPool } from "./db";
import { CMSPageData, CMSSection } from "./cms-types";
import { DEFAULT_PAGE_CONFIGS } from "./cms-page-defaults";
import type { RowDataPacket } from "mysql2/promise";
import type { Metadata } from "next";

export async function getPageBySlug(
  slug: string,
  options?: { preview?: boolean }
): Promise<CMSPageData | null> {
  const fallback = DEFAULT_PAGE_CONFIGS[slug] || null;

  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT id, slug, title, seo_title, meta_description, og_title, og_description, og_image, canonical_url, robots_indexing, schema_json, status, sections_json, draft_sections_json, updated_at, updated_by
       FROM cms_pages WHERE slug = ? LIMIT 1`,
      [slug]
    );

    if (!rows || rows.length === 0) {
      return fallback;
    }

    const row = rows[0];
    let sections: CMSSection[] = [];

    // If preview mode is requested and draft sections exist, use draft; otherwise use published
    const jsonToParse =
      options?.preview && row.draft_sections_json
        ? row.draft_sections_json
        : row.sections_json;

    if (jsonToParse) {
      try {
        const parsed = JSON.parse(jsonToParse);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sections = parsed;
        }
      } catch (err) {
        console.warn(`[CMS Warning] Failed to parse sections for page '${slug}':`, err);
      }
    }

    // If sections were empty, fallback to default page config
    if (sections.length === 0 && fallback) {
      sections = fallback.sections;
    }

    return {
      id: row.id,
      slug: row.slug,
      title: row.title || fallback?.title || slug,
      route: fallback?.route || `/${slug === "home" ? "" : slug}`,
      seo_title: row.seo_title || fallback?.seo_title || `${row.title} | AvantusForge`,
      meta_description: row.meta_description || fallback?.meta_description || "",
      og_title: row.og_title || row.seo_title || fallback?.og_title || `${row.title} | AvantusForge`,
      og_description: row.og_description || row.meta_description || fallback?.og_description || "",
      og_image: row.og_image || fallback?.og_image || "/images/amazon-aed-70k-sales-proof.png",
      canonical_url: row.canonical_url || fallback?.canonical_url || `https://avantusforge.com/${slug === "home" ? "" : slug}`,
      robots_indexing: row.robots_indexing || fallback?.robots_indexing || "index, follow",
      schema_json: row.schema_json || fallback?.schema_json,
      status: row.status || "published",
      sections,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
    };
  } catch (err) {
    console.warn(`[CMS Warning] Error fetching page '${slug}':`, err);
    return fallback;
  }
}

export async function getPageMetadata(slug: string): Promise<Metadata> {
  const page = await getPageBySlug(slug);
  const fallback = DEFAULT_PAGE_CONFIGS[slug];

  const title = page?.seo_title || fallback?.seo_title || "AvantusForge | High-Performance Digital Studio";
  const description = page?.meta_description || fallback?.meta_description || "Bespoke software, automation, and ecommerce systems.";
  const canonical = page?.canonical_url || fallback?.canonical_url || `https://avantusforge.com/${slug === "home" ? "" : slug}`;
  const ogImage = page?.og_image || fallback?.og_image || "/images/amazon-aed-70k-sales-proof.png";

  const isNoIndex = page?.robots_indexing?.includes("noindex");

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: !isNoIndex,
      follow: !page?.robots_indexing?.includes("nofollow"),
    },
    openGraph: {
      title: page?.og_title || title,
      description: page?.og_description || description,
      url: canonical,
      siteName: "AvantusForge",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page?.og_title || title,
      description: page?.og_description || description,
      images: [ogImage],
    },
  };
}
