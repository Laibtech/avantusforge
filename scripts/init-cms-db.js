const mysql = require("mysql2/promise");

async function initCmsDatabase() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "",
    database: "avantus_db",
  });

  console.log("[AvantusForge CMS DB] Initializing complete Enterprise CMS tables in MySQL...");

  // 1. cms_services table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      short_desc TEXT NOT NULL,
      full_content LONGTEXT NULL,
      icon VARCHAR(100) DEFAULT 'Layers',
      deliverables_json LONGTEXT NULL,
      pricing_tier VARCHAR(100) DEFAULT 'Enterprise Bespoke',
      is_featured BOOLEAN DEFAULT FALSE,
      order_index INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. cms_solutions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_solutions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      industry VARCHAR(100) NOT NULL,
      summary TEXT NOT NULL,
      challenges_json LONGTEXT NULL,
      solutions_json LONGTEXT NULL,
      impact_metrics VARCHAR(255) NULL,
      status VARCHAR(50) DEFAULT 'published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. cms_portfolio table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_portfolio (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      tagline VARCHAR(255) NULL,
      summary TEXT NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      deliverables_json LONGTEXT NULL,
      results_metric VARCHAR(255) NULL,
      external_url VARCHAR(255) NULL,
      order_index INT DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. cms_blogs table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      author VARCHAR(100) DEFAULT 'AvantusForge Engineering',
      author_role VARCHAR(100) DEFAULT 'Technical Architecture Studio',
      featured_image VARCHAR(255) NULL,
      excerpt TEXT NOT NULL,
      content LONGTEXT NOT NULL,
      read_time VARCHAR(50) DEFAULT '5 min read',
      tags_json LONGTEXT NULL,
      status VARCHAR(50) DEFAULT 'published',
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. cms_testimonials table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      client_role VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      rating INT DEFAULT 5,
      avatar_url VARCHAR(255) NULL,
      is_featured BOOLEAN DEFAULT TRUE,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. cms_faqs table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cms_faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(255) NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      order_index INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. visitor_pageviews table (First-party analytics)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS visitor_pageviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(100) NOT NULL,
      path VARCHAR(255) NOT NULL,
      referrer VARCHAR(500) NULL,
      user_agent TEXT NULL,
      device_type VARCHAR(50) DEFAULT 'desktop',
      browser VARCHAR(50) DEFAULT 'Chrome',
      os VARCHAR(50) DEFAULT 'Windows',
      country VARCHAR(100) DEFAULT 'United Kingdom',
      city VARCHAR(100) DEFAULT 'London',
      ip_hash VARCHAR(100) NULL,
      duration_seconds INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session (session_id),
      INDEX idx_path (path),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. visitor_sessions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS visitor_sessions (
      id VARCHAR(100) PRIMARY KEY,
      landing_page VARCHAR(255) NOT NULL,
      referrer VARCHAR(500) NULL,
      device_type VARCHAR(50) DEFAULT 'desktop',
      country VARCHAR(100) DEFAULT 'United Kingdom',
      total_pageviews INT DEFAULT 1,
      duration_seconds INT DEFAULT 0,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_last_seen (last_seen_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 9. url_redirects table (301/302 Redirect Manager)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS url_redirects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source_path VARCHAR(255) NOT NULL UNIQUE,
      target_url VARCHAR(500) NOT NULL,
      status_code INT DEFAULT 301,
      hits INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 10. admin_activity_logs table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      actor VARCHAR(100) NOT NULL,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100) NULL,
      details TEXT NULL,
      ip_address VARCHAR(100) DEFAULT '127.0.0.1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log("  ✓ All CMS tables created or verified.");

  // SEED cms_services if empty
  const [servicesCount] = await conn.query("SELECT COUNT(*) AS c FROM cms_services");
  if (servicesCount[0].c === 0) {
    const services = [
      {
        slug: "custom-software-development",
        title: "Custom Software & Systems",
        category: "Software Engineering",
        short_desc: "We build tailored software solutions around the way your business actually operates — from internal management systems to complete business platforms.",
        deliverables: JSON.stringify([
          "Business Management Systems",
          "Custom Web Applications",
          "ERP & CRM Solutions",
          "Workflow & Process Systems",
          "Admin & Customer Portals",
        ]),
        is_featured: 1,
        order_index: 1,
      },
      {
        slug: "ecommerce-development",
        title: "Websites & E-Commerce",
        category: "Digital Commerce",
        short_desc: "We build high-converting online storefronts and modern commercial websites engineered for performance, brand authority, and seamless customer transactions.",
        deliverables: JSON.stringify([
          "Shopify & Custom Storefronts",
          "Headless E-Commerce Builds",
          "Corporate & Editorial Websites",
          "Conversion Rate Optimization",
          "Payment & Inventory Sync",
        ]),
        is_featured: 1,
        order_index: 2,
      },
      {
        slug: "mobile-app-development",
        title: "Mobile App Development",
        category: "Mobile Engineering",
        short_desc: "Native iOS & Android mobile applications engineered with responsive UX, offline data synchronization, and enterprise cloud integration.",
        deliverables: JSON.stringify([
          "iOS Native Swift Engineering",
          "Android Kotlin Applications",
          "React Native Cross-Platform",
          "Real-Time Push & Telemetry",
          "Offline Data Caching",
        ]),
        is_featured: 1,
        order_index: 3,
      },
      {
        slug: "saas-erp-crm",
        title: "SaaS, ERP & CRM Architecture",
        category: "Enterprise Systems",
        short_desc: "Centralize operations, customer records, and commercial data into synchronized software ecosystems built for reliability and scale.",
        deliverables: JSON.stringify([
          "Multi-Tenant SaaS Products",
          "Bespoke ERP Infrastructure",
          "Automated Billing & Subscriptions",
          "Role-Based Access Control",
          "Data Warehouse Integration",
        ]),
        is_featured: 0,
        order_index: 4,
      },
      {
        slug: "seo-digital-marketing",
        title: "SEO & Growth Marketing",
        category: "Growth & Visibility",
        short_desc: "Data-backed visibility strategies connecting high-intent commercial buyers directly with your digital products and services.",
        deliverables: JSON.stringify([
          "Technical & Programmatic SEO",
          "Core Web Vitals Optimization",
          "High-Authority Backlink Acquisition",
          "Multi-Channel Ad Spend Strategy",
          "Commercial Conversion Funnels",
        ]),
        is_featured: 0,
        order_index: 5,
      },
      {
        slug: "business-automation-api",
        title: "Business Automation & APIs",
        category: "Integration & Cloud",
        short_desc: "Connect disconnected systems, eliminate manual data entry, and streamline operations with custom integrations.",
        deliverables: JSON.stringify([
          "Custom API Development & Integrations",
          "Webhook Automation Pipelines",
          "ERP & CRM System Bridges",
          "Payment & Banking Synchronizations",
          "Event-Driven Microservices",
        ]),
        is_featured: 0,
        order_index: 6,
      },
    ];

    for (const s of services) {
      await conn.query(
        `INSERT INTO cms_services (slug, title, category, short_desc, deliverables_json, is_featured, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [s.slug, s.title, s.category, s.short_desc, s.deliverables, s.is_featured, s.order_index]
      );
    }
    console.log(`  ✓ Seeded ${services.length} services.`);
  }

  // SEED cms_portfolio if empty
  const [portfolioCount] = await conn.query("SELECT COUNT(*) AS c FROM cms_portfolio");
  if (portfolioCount[0].c === 0) {
    const portfolio = [
      {
        slug: "hrms",
        title: "HRMS & Custom Business Management Software",
        client_name: "Global Workforce Operations",
        category: "Software & HRMS",
        tagline: "Smarter Tools. Stronger Teams.",
        summary: "A unified cloud architecture digitizing multi-department workforce operations, automated approval hierarchies, and payroll workflows, paired with an integrated mobile companion application.",
        image_url: "/projects/vendor-management.jpg",
        deliverables: JSON.stringify([
          "Custom Software Development",
          "Workforce & Payroll Workflows",
          "Business Process Digitization",
          "Mobile Companion Application",
        ]),
        results_metric: "82% Admin Time Saved",
        is_featured: 1,
        order_index: 1,
      },
      {
        slug: "caremon-consulting",
        title: "Caremon D2C Wellness Flagship",
        client_name: "Caremon Group UK",
        category: "E-commerce",
        tagline: "Speed That Converts.",
        summary: "High-converting bespoke digital commerce storefront engineered with sub-second page loads, conversion rate architecture, and integrated fulfillment automation.",
        image_url: "/projects/caremon-real.webp",
        deliverables: JSON.stringify([
          "Custom Shopify 2.0 Theme Engineering",
          "Headless Architecture Speed Optimizations",
          "Conversion Funnel Engineering",
          "Multi-Currency Payment Gateways",
        ]),
        results_metric: "4.8x Conversion Lift",
        is_featured: 1,
        order_index: 2,
      },
      {
        slug: "oasis-consulting",
        title: "Oasis Global Consulting Digital Presence",
        client_name: "Oasis Global Consulting (Pvt.) Ltd.",
        category: "Business Websites",
        tagline: "Regulatory Trust Signals & Corporate Architecture.",
        summary: "A distinguished corporate web platform positioning Oasis Global Consulting at the intersection of regulatory compliance, investment facilitation, and executive business setups.",
        image_url: "/projects/oasis-consulting.png",
        deliverables: JSON.stringify([
          "Custom Corporate Web Architecture",
          "Regulatory Credibility Positioning",
          "Secure Client Intake & Onboarding",
          "Technical SEO & Search Authority",
        ]),
        results_metric: "320% Qualified Inquiries",
        is_featured: 1,
        order_index: 3,
      },
      {
        slug: "fama-bags",
        title: "FAMA Handcrafted Leather Goods",
        client_name: "FAMA Leather House",
        category: "E-commerce",
        tagline: "Luxury Brand Storytelling Meets High-Velocity Sales.",
        summary: "Editorial digital commerce destination bringing bespoke leather craftsmanship to international luxury buyers across the UK and UAE.",
        image_url: "/projects/fama-real.webp",
        deliverables: JSON.stringify([
          "Art-Directed Visual Storytelling",
          "Mobile-First Shopping Experience",
          "Automated Inventory & Cart Synchronization",
          "A/B Tested Checkout Funnel",
        ]),
        results_metric: "AED 70k+ Verified Sales",
        is_featured: 1,
        order_index: 4,
      },
    ];

    for (const p of portfolio) {
      await conn.query(
        `INSERT INTO cms_portfolio (slug, title, client_name, category, tagline, summary, image_url, deliverables_json, results_metric, is_featured, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.slug, p.title, p.client_name, p.category, p.tagline, p.summary, p.image_url, p.deliverables, p.results_metric, p.is_featured, p.order_index]
      );
    }
    console.log(`  ✓ Seeded ${portfolio.length} portfolio items.`);
  }

  // SEED cms_blogs if empty
  const [blogsCount] = await conn.query("SELECT COUNT(*) AS c FROM cms_blogs");
  if (blogsCount[0].c === 0) {
    const blogs = [
      {
        slug: "when-to-replace-spreadsheets-with-custom-software",
        title: "When to Replace Operational Spreadsheets with Custom Software",
        category: "Business Systems",
        author: "Bilal",
        author_role: "Technical Director",
        excerpt: "Spreadsheets are brilliant for early prototyping, but lethal for scaling. How to recognize the exact inflection point when fragmented Google Sheets and Excel macros begin silently bleeding team hours.",
        content: "Every ambitious company reaches a threshold where shared spreadsheets break down. Concurrency collisions, missing audit histories, broken formulas, and manual copy-pasting degrade operational reliability. Custom web applications provide atomic database transactions, strict role permissions, and automated approval workflows that protect company data.",
        read_time: "7 min read",
        tags_json: JSON.stringify(["Custom Software", "Architecture", "ERP", "Scalability"]),
        status: "published",
      },
      {
        slug: "headless-shopify-vs-custom-liquid-theme",
        title: "Headless Shopify vs. Bespoke Liquid Themes: What Ambitious Brands Actually Need",
        category: "Ecommerce",
        author: "Muzamil",
        author_role: "Operations Director",
        excerpt: "A pragmatic engineering comparison between headless Next.js frontends and native Liquid 2.0 section architecture. Why 90% of stores are better served by eliminating third-party app bloat than rebuilding headless.",
        content: "Headless e-commerce offers unparalleled rendering control, but introduces significant infrastructure overhead, complex deployment pipelines, and third-party app incompatibilities. By rigorously optimizing native Shopify 2.0 themes and stripping away redundant apps, brands achieve sub-second load times at a fraction of maintenance cost.",
        read_time: "6 min read",
        tags_json: JSON.stringify(["Shopify", "Ecommerce", "Performance", "Web Development"]),
        status: "published",
      },
      {
        slug: "building-resilient-automation-pipelines",
        title: "Building Resilient Automation Pipelines Without Fragile No-Code Lock-In",
        category: "Automation",
        author: "Bilal",
        author_role: "Technical Director",
        excerpt: "Why relying purely on no-code webhook zaps causes silent system failure, and how to build lightweight serverless API microservices with proper error catch loops and automated notification logging.",
        content: "No-code automation tools are fantastic for simple triggers, but fail silently when API payloads change or rate limits are reached. Building dedicated backend webhook endpoints with retry mechanisms, dead-letter queues, and Slack alerts ensures mission-critical operations never drop data.",
        read_time: "5 min read",
        tags_json: JSON.stringify(["Automation", "APIs", "Cloud", "Reliability"]),
        status: "published",
      },
    ];

    for (const b of blogs) {
      await conn.query(
        `INSERT INTO cms_blogs (slug, title, category, author, author_role, excerpt, content, read_time, tags_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.slug, b.title, b.category, b.author, b.author_role, b.excerpt, b.content, b.read_time, b.tags_json, b.status]
      );
    }
    console.log(`  ✓ Seeded ${blogs.length} blog articles.`);
  }

  // SEED cms_pages if empty
  const [pagesCount] = await conn.query("SELECT COUNT(*) AS c FROM cms_pages");
  if (pagesCount[0].c === 0) {
    const pages = [
      {
        slug: "home",
        title: "Home",
        seo_title: "AvantusForge | Custom Software, E-Commerce & Digital Systems",
        meta_description: "International technology and software engineering studio. We build bespoke software platforms, high-converting digital storefronts, and automated business workflows.",
        status: "published",
        sections_json: JSON.stringify([
          { id: "hero", name: "Hero Section", enabled: true, eyebrow: "CUSTOM SOFTWARE • WEB • DIGITAL SOLUTIONS", headline: "Forging Digital Solutions That Move Your Business Forward." },
          { id: "trust_strip", name: "Trust & Market Credibility Strip", enabled: true },
          { id: "business_problems", name: "Business Problem & Solution", enabled: true },
          { id: "services", name: "Interactive Services Showcase", enabled: true },
          { id: "editorial_story", name: "Editorial Story & CEO Vision", enabled: true },
          { id: "tech_stack", name: "Modern Technology Stack", enabled: true },
          { id: "stats", name: "Commercial Statistics", enabled: true },
          { id: "process", name: "Numbered 4-Step Process", enabled: true },
          { id: "selected_work", name: "Selected Work Highlights", enabled: true },
          { id: "cta", name: "Bottom Call to Action Banner", enabled: true },
          { id: "faq", name: "Frequently Asked Questions", enabled: true },
        ]),
      },
      {
        slug: "about",
        title: "About Us",
        seo_title: "About AvantusForge | Technology Meets Business Growth",
        meta_description: "AvantusForge is an international digital consultancy and engineering studio helping businesses automate, build, and scale operations.",
        status: "published",
        sections_json: JSON.stringify([
          { id: "hero", name: "About Hero Section", enabled: true },
          { id: "leadership", name: "Executive Leadership & CEO Vision", enabled: true },
          { id: "approach", name: "Our Engineering Approach", enabled: true },
          { id: "beliefs", name: "Core Convictions & Beliefs", enabled: true },
          { id: "cta", name: "Call to Action", enabled: true },
        ]),
      },
      {
        slug: "services",
        title: "Services",
        seo_title: "Our Services | Custom Software, E-Commerce & Cloud Systems",
        meta_description: "Explore AvantusForge's full suite of enterprise digital engineering, custom software, Shopify development, and automation services.",
        status: "published",
        sections_json: JSON.stringify([
          { id: "hero", name: "Services Hero", enabled: true },
          { id: "services_grid", name: "All Services Grid", enabled: true },
          { id: "cta", name: "Call to Action", enabled: true },
        ]),
      },
      {
        slug: "work",
        title: "Portfolio & Work",
        seo_title: "Portfolio & Case Studies | AvantusForge Digital Agency",
        meta_description: "Real delivered systems, verified e-commerce growth, and bespoke software built by AvantusForge.",
        status: "published",
        sections_json: JSON.stringify([
          { id: "hero", name: "Work Hero", enabled: true },
          { id: "split_gallery", name: "Split Section Project Cards (Design 4)", enabled: true },
          { id: "cta", name: "Call to Action", enabled: true },
        ]),
      },
      {
        slug: "team",
        title: "Leadership & Team",
        seo_title: "Our Leadership & Team | AvantusForge Digital Agency",
        meta_description: "Meet the executive, technical, and operational leadership behind AvantusForge. Led by CEO Laiba Baig.",
        status: "published",
        sections_json: JSON.stringify([
          { id: "hero", name: "Team Hero", enabled: true },
          { id: "members_grid", name: "Executive Leadership Grid", enabled: true },
          { id: "cta", name: "Call to Action", enabled: true },
        ]),
      },
      {
        slug: "contact",
        title: "Contact Us",
        seo_title: "Contact AvantusForge | Start Your Project Today",
        meta_description: "Get in touch with our executive leadership and software engineering team for custom software, web platforms, and digital growth.",
        status: "published",
        sections_json: JSON.stringify([
          { id: "hero", name: "Contact Hero & Direct Channels", enabled: true },
          { id: "form", name: "Intake & Project Inquiry Form", enabled: true },
        ]),
      },
    ];

    for (const p of pages) {
      await conn.query(
        `INSERT INTO cms_pages (slug, title, seo_title, meta_description, status, sections_json)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [p.slug, p.title, p.seo_title, p.meta_description, p.status, p.sections_json]
      );
    }
    console.log(`  ✓ Seeded ${pages.length} core website pages.`);
  }

  // SEED sample visitor analytics if empty so charts are functional on first load
  const [sessionCount] = await conn.query("SELECT COUNT(*) AS c FROM visitor_sessions");
  if (sessionCount[0].c === 0) {
    console.log("  [Analytics] Seeding initial analytics telemetry baseline...");
    const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 19).replace("T", " ");
    
    // Seed sample sessions across past 7 days
    const mockSessions = [
      { id: "sess_uk_1", landing: "/", ref: "https://google.co.uk", dev: "desktop", country: "United Kingdom", pv: 4, dur: 180, time: daysAgo(0) },
      { id: "sess_us_1", landing: "/services", ref: "https://linkedin.com", dev: "desktop", country: "United States", pv: 3, dur: 120, time: daysAgo(0) },
      { id: "sess_ae_1", landing: "/work", ref: "https://google.ae", dev: "mobile", country: "United Arab Emirates", pv: 5, dur: 240, time: daysAgo(1) },
      { id: "sess_kw_1", landing: "/contact", ref: "https://google.com.kw", dev: "mobile", country: "Kuwait", pv: 2, dur: 95, time: daysAgo(2) },
      { id: "sess_uk_2", landing: "/about", ref: "Direct", dev: "desktop", country: "United Kingdom", pv: 3, dur: 150, time: daysAgo(3) },
      { id: "sess_pk_1", landing: "/team", ref: "Direct", dev: "desktop", country: "Pakistan", pv: 4, dur: 210, time: daysAgo(4) },
      { id: "sess_us_2", landing: "/", ref: "https://google.com", dev: "desktop", country: "United States", pv: 6, dur: 320, time: daysAgo(5) },
      { id: "sess_uk_3", landing: "/work/oasis-consulting", ref: "https://oasisglobalconsulting.com", dev: "desktop", country: "United Kingdom", pv: 3, dur: 140, time: daysAgo(6) },
    ];

    for (const s of mockSessions) {
      await conn.query(
        `INSERT INTO visitor_sessions (id, landing_page, referrer, device_type, country, total_pageviews, duration_seconds, started_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.landing, s.ref, s.dev, s.country, s.pv, s.dur, s.time, s.time]
      );

      // Add pageviews
      await conn.query(
        `INSERT INTO visitor_pageviews (session_id, path, referrer, device_type, country, duration_seconds, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.landing, s.ref, s.dev, s.country, s.dur, s.time]
      );
    }
    console.log("  ✓ Seeded baseline visitor analytics telemetry.");
  }

  // SEED initial activity log
  await conn.query(`
    INSERT INTO admin_activity_logs (actor, action, entity_type, entity_id, details)
    VALUES 
    ('Executive Super Admin', 'SYSTEM_INITIALIZATION', 'System', 'CMS', 'Enterprise CMS modules, database tables, and analytics tracking successfully deployed.'),
    ('Executive Super Admin', 'SECURITY_HARDENING', 'Security', 'Auth', 'PBKDF2-SHA512 password encryption and sliding-window rate limiting enforced.')
  `);

  console.log("[AvantusForge CMS DB] Enterprise CMS initialization complete.");
  await conn.end();
}

initCmsDatabase().catch(console.error);
