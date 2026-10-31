import { getDbPool } from "./db";
import type { RowDataPacket } from "mysql2/promise";
import fs from "fs";
import path from "path";

export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  category: string;
  author: string;
  author_role: string;
  author_image?: string;
  featured_image?: string;
  excerpt: string;
  content: string;
  read_time: string;
  tags: string[];
  status: "published" | "draft";
  published_at: string;
  created_at?: string;
}

export const DEFAULT_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    slug: "when-to-replace-spreadsheets-with-custom-software",
    title: "When to Replace Operational Spreadsheets with Custom Software",
    category: "Business Systems",
    author: "Bilal",
    author_role: "Technical Director",
    author_image: "/team/tech-lead.jpg",
    featured_image: "/images/slider-automation.jpg",
    read_time: "7 min read",
    published_at: "September 24, 2026",
    excerpt:
      "Spreadsheets are brilliant for early prototyping, but lethal for scaling. How to recognize the exact inflection point when fragmented Google Sheets and Excel macros begin silently bleeding team hours.",
    tags: ["Custom Software", "Architecture", "ERP Systems", "Database Design", "Scalability"],
    status: "published",
    content: `
### The Seductive Flexibility of Spreadsheets

Every successful enterprise began with a spreadsheet. Whether tracking inventory on Google Sheets, logging customer inquiries in Excel, or piecing together financial forecasts through nested VLOOKUPs, tabular software is undeniably the fastest way to prototype operational logic without code.

However, the very property that makes spreadsheets accessible—their total lack of structural constraints—eventually turns them into a catastrophic single point of failure.

### 4 Tell-Tale Signals You Have Outgrown Sheets

1. **Concurrency Collisions & Overwriting Data:** When multiple team members attempt to update the same customer row or dispatch status simultaneously, formulas corrupt, cells get overwritten, and audit trails evaporate.
2. **Fragile Formula Dependencies:** A single junior team member accidentally deleting an index cell or pasting plain text into a calculated column causes domino failures across downstream sheets.
3. **Lack of Role-Based Security:** Spreadsheets generally offer binary access: either someone can see everything, or they can see nothing. Sensitive client margins, salary figures, and supplier costs cannot be compartmentalized cleanly.
4. **Zero Automated Validation:** An email address entered with a missing "@" or an invoice code entered with an extra digit silently slips through, polluting reporting data for months.

### What Custom Software Solves

When AvantusForge engineers custom web applications and specialized ERP/CRM tooling, we replace fragile sheets with **relational data schemas, atomic transactions, and strict access governance**:

- **Centralized Source of Truth:** A hardened PostgreSQL or MySQL database where every write operation is validated against strict constraints before being committed.
- **Granular Role-Based Permissions:** Account managers only see their assigned accounts, warehouse operatives only see inventory batches, and executive leadership retains full cross-departmental financial visibility.
- **Automated Webhook & API Handoffs:** When an order is approved, invoices are generated automatically, inventory is deducted in real-time, and notifications fire to Slack or WhatsApp without manual data copying.
- **Complete Audit Logging:** Every edit, status change, and deletion records the exact user identity, timestamp, and previous state.

### The Phased Migration Strategy

You do not need to pause operations or attempt a high-risk "big-bang" migration. The pragmatic path is incremental:

1. **Audit & Extract:** Identify the single spreadsheet causing the highest volume of weekly errors (typically order intake or dispatch tracking).
2. **Schema Modeling:** Structure the rows into clean relational database entities.
3. **Parallel Run:** Deploy a bespoke web portal with custom forms and run it alongside the legacy sheet for 14 days to verify data parity.
4. **Full Cutover:** Deprecate the sheet once your operations team experiences the speed and reliability of dedicated web software.
    `.trim(),
  },
  {
    id: 2,
    slug: "headless-shopify-vs-custom-liquid-theme",
    title: "Headless Shopify vs. Bespoke Liquid Themes: What Ambitious Brands Actually Need",
    category: "Ecommerce",
    author: "Muzamil",
    author_role: "Operations Director",
    author_image: "/uploads/cebbef9afb9b84025540e70a.png",
    featured_image: "/projects/fama-real.webp",
    read_time: "6 min read",
    published_at: "August 18, 2026",
    excerpt:
      "A pragmatic engineering comparison between headless Next.js frontends and native Liquid 2.0 section architecture. Why 90% of stores are better served by eliminating app bloat than rebuilding headless.",
    tags: ["Shopify", "Ecommerce", "Liquid 2.0", "Performance", "Next.js"],
    status: "published",
    content: `
### The Headless Hype Cycle

In recent years, "headless commerce" has been heavily marketed as the ultimate salvation for e-commerce performance. Agencies promise lightning-fast sub-second page transitions by coupling Next.js or Remix frontends with Shopify's Storefront API.

While headless architecture genuinely unlocks limitless front-end flexibility for $50M+ enterprises with dedicated engineering squads, it routinely saddles mid-market brands with crippling maintenance overhead and broken marketing apps.

### The Real Cost of Going Headless

Before committing to a headless build, engineering leaders must account for the hidden trade-offs:

- **Loss of Native Shopify App Compatibility:** The vast majority of Shopify App Store plugins (reviews, product filters, upsell widgets, bundle builders) inject Liquid scripts directly into standard themes. In a headless setup, each tool requires custom API integration or expensive third-party SaaS alternatives.
- **Merchant Workflow Disruption:** Non-technical marketing teams lose the intuitive drag-and-drop live preview capabilities of the Shopify Theme Editor unless complex custom CMS visual builders are architected.
- **Dual Hosting & Security Maintenance:** You are now responsible for maintaining, monitoring, and scaling a separate cloud server layer (e.g. AWS/Vercel) in addition to your Shopify subscription.

### The Alternative: Clean, Native Liquid 2.0 Architecture

For the vast majority of ambitious direct-to-consumer and B2B brands, **a bespoke, zero-bloat Shopify Liquid 2.0 theme achieves identical 95+ Google Lighthouse scores at a third of the ongoing cost**.

How AvantusForge builds high-speed native Shopify storefronts:

1. **Eliminate 15+ Render-Blocking Apps:** We replace third-party apps for sticky carts, currency converters, announcement bars, and quick-views with native lightweight vanilla TypeScript compiled directly into the theme.
2. **Adaptive Image Delivery:** Implementing native WebP/AVIF srcset attributes that serve precise pixel dimensions matched to the shopper's viewport.
3. **Modular Section Architecture:** Full custom section controls that empower internal marketing teams to spin up landing pages, hero variations, and promotional bundles without touching code.
4. **Predictive Pre-fetching:** Subtly pre-fetching product page JSON during hover states so cart additions and product details render instantaneously.
    `.trim(),
  },
  {
    id: 3,
    slug: "practical-business-automation-without-fragile-tools",
    title: "Building Resilient Automation Pipelines Without Fragile No-Code Lock-In",
    category: "Automation",
    author: "Bilal",
    author_role: "Technical Director",
    author_image: "/team/tech-lead.jpg",
    featured_image: "/images/business-automation.jpg",
    read_time: "5 min read",
    published_at: "July 29, 2026",
    excerpt:
      "Why relying purely on no-code webhook zaps causes silent system failure, and how to build lightweight serverless API microservices with proper error catch loops and automated notification logging.",
    tags: ["Automation", "Webhooks", "APIs", "Cloud Microservices", "Reliability"],
    status: "published",
    content: `
### The Illusion of "Set-and-Forget" No-Code

No-code workflow builders like Zapier and Make are incredible for fast proof-of-concepts. You click together a trigger from Typeform, map fields to HubSpot, and dispatch an email via SendGrid in twenty minutes.

However, when core revenue operations—such as multi-currency customer billing, inventory replenishment, and customer support escalation—rely entirely on daisy-chained no-code triggers, systems eventually fail silently.

### The Anatomy of Silent Failures

- **Schema Drift:** A third-party SaaS updates its JSON payload structure. The no-code connector cannot parse the new nested key, failing silently without throwing a high-priority developer alert.
- **Rate Limit Throttling:** During seasonal traffic spikes (like Black Friday or marketing product drops), external API rate limits are exceeded. Unhandled requests are permanently dropped rather than queued.
- **Data Transformation Fragility:** Parsing complex international phone formats, multi-line addresses, or calculating tax rates across varying regional jurisdictions quickly turns visual recipe builders into unmaintainable spaghetti.

### Engineering Production-Grade Pipelines

At AvantusForge, we design automation infrastructure using **hardened serverless microservices and webhook ingestion hubs**:

- **Queued Ingestion & Idempotency:** Webhook listeners immediately ingest external payloads into an in-memory queue and acknowledge receipt with an HTTP 200 within 50ms, preventing external services from timing out. Every payload is stamped with an idempotency key to prevent accidental double-processing.
- **Dead-Letter Storage & Automatic Retries:** If an external endpoint is unreachable, our pipeline backs off exponentially and stores failed packets in a secure dead-letter table.
- **Real-Time Slack & Email Telemetry:** The engineering and operations teams receive instantaneous contextual alerts when an anomaly is detected, complete with payload diffs and automated re-drive links.
- **Cost Efficiency:** A serverless TypeScript microservice processing 500,000 monthly events costs mere pennies on AWS or Cloudflare, compared to exorbitant per-task tier fees on no-code platforms.
    `.trim(),
  },
  {
    id: 4,
    slug: "human-art-direction-vs-ai-generated-sameness",
    title: "The Death of Generic SaaS Templates: Why Human Art Direction Commands Trust",
    category: "Design & UX",
    author: "Maira",
    author_role: "Graphic Designer",
    author_image: "/team/maira.jpg",
    featured_image: "/images/about.jpg",
    read_time: "8 min read",
    published_at: "June 14, 2026",
    excerpt:
      "Modern B2B buyers have developed instant immunity to cookie-cutter gradients and fake AI mockups. How intentional typography, authentic photography, and deliberate whitespace build commercial conviction.",
    tags: ["Art Direction", "UI/UX", "Brand Authority", "Design Systems", "Conversion"],
    status: "published",
    content: `
### The Age of Synthetic Clutter

The barrier to generating software websites has dropped to zero. With AI website builders and saturated template marketplaces, any founder can spin up a glossy landing page in fifteen minutes—complete with isometric 3D illustrations, purple gradient buttons, floating social media icons, and fake analytics dashboards.

The unintended side effect? **Instant visual fatigue.**

Sophisticated B2B decision-makers and enterprise procurement teams have subconscious filters calibrated to detect generic aesthetics. When every software company looks identical, trust erodes, and perceived enterprise value plummets.

### The Psychology of Visual Credibility

Commercial credibility is not established through decorative flourishes or animated gimmicks. It is communicated through:

1. **Deliberate Typographic Hierarchy:** Pairing an authoritative, high-contrast headline serif or structured grotesque sans with strict optical leading conveys rigorous discipline.
2. **Authentic Photography Over Fake Renderings:** Showcasing real people, genuine studio environments, authentic architectural blueprints, and unvarnished product screens creates immediate subconscious resonance.
3. **Generous, Confident Whitespace:** Low-conviction brands feel compelled to fill every square pixel with floating badges, ticker ribbons, and decorative badges. High-conviction brands understand that spatial restraint allows core value propositions to breathe.
4. **Cohesive Physical & Digital Tone:** In AvantusForge's design system, deep burgundy (#750F2C) and warm architectural sand (#FCFAF8) evoke enduring physical materials—cast iron, fine stationery, and structured masonry—distinguishing our digital tools from transient tech fads.

### Art Direction as a Commercial Moat

Design is not mere styling applied after engineering is finished. True art direction is the strategic translation of business capability into visual authority. When your platform presents with dignity, clarity, and authentic craftsmanship, price resistance diminishes and commercial velocity accelerates.
    `.trim(),
  },
];

// Helper to format DB blog row into BlogArticle
function mapDbRowToArticle(row: RowDataPacket): BlogArticle {
  let tags: string[] = [];
  if (row.tags_json) {
    try {
      tags = typeof row.tags_json === "string" ? JSON.parse(row.tags_json) : row.tags_json;
    } catch {
      tags = [];
    }
  }

  // Resolve author image
  let authorImage = "/team/laiba-baig-ceo.jpg";
  const authorName = (row.author || "").toLowerCase();
  if (authorName.includes("bilal")) authorImage = "/team/tech-lead.jpg";
  else if (authorName.includes("maira")) authorImage = "/team/maira.jpg";
  else if (authorName.includes("muzamil") || authorName.includes("usman")) authorImage = "/uploads/cebbef9afb9b84025540e70a.png";

  const pubDate = row.published_at
    ? new Date(row.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "September 2026";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category || "Engineering",
    author: row.author || "AvantusForge",
    author_role: row.author_role || "Studio Lead",
    author_image: authorImage,
    featured_image: row.featured_image || "/images/about.jpg",
    excerpt: row.excerpt || "",
    content: row.content || "",
    read_time: row.read_time || "5 min read",
    tags: Array.isArray(tags) ? tags : [],
    status: (row.status || "published") as "published" | "draft",
    published_at: pubDate,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

export async function getAllBlogArticles(): Promise<BlogArticle[]> {
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM cms_blogs WHERE status = 'published' ORDER BY id DESC"
    );

    if (rows && rows.length > 0) {
      return rows.map(mapDbRowToArticle);
    }
  } catch (err) {
    console.warn("[AvantusForge Blogs] MySQL fallback to defaults:", err);
  }

  return DEFAULT_BLOG_ARTICLES;
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Try MySQL
  try {
    const p = getDbPool();
    const [rows] = await p.query<RowDataPacket[]>(
      "SELECT * FROM cms_blogs WHERE slug = ? LIMIT 1",
      [normalizedSlug]
    );

    if (rows && rows.length > 0) {
      return mapDbRowToArticle(rows[0]);
    }
  } catch (err) {
    console.warn(`[AvantusForge Blogs] MySQL error querying slug '${slug}':`, err);
  }

  // 2. Check defaults including common slug aliases
  const matched = DEFAULT_BLOG_ARTICLES.find(
    (a) =>
      a.slug === normalizedSlug ||
      (normalizedSlug === "building-resilient-automation-pipelines" &&
        a.slug === "practical-business-automation-without-fragile-tools") ||
      (normalizedSlug === "practical-business-automation-without-fragile-tools" &&
        a.slug === "building-resilient-automation-pipelines")
  );

  return matched || null;
}

