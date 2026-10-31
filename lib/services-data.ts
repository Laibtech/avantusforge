export interface ServiceData {
  slug: string;
  category: "BUILD" | "AUTOMATE" | "COMMERCE" | "GROW" | "AMAZON";
  title: string;
  heroHeading: string;
  heroSubheading: string;
  projectImage: string;
  projectCaption: string;
  challengeTitle: string;
  challengeParagraphs: string[];
  solutionTitle: string;
  solutionParagraphs: string[];
  whatWeBuild: { title: string; description: string }[];
  howWeWork: { step: string; title: string; description: string }[];
  caseStudy: {
    title: string;
    category: string;
    slug: string;
    summary: string;
    image: string;
  };
  faqs: { question: string; answer: string }[];
}

const CORE_SERVICES: ServiceData[] = [
  {
    slug: "custom-software-development",
    category: "BUILD",
    title: "Custom Software Development",
    heroHeading: "Software built around the way your business works.",
    heroSubheading:
      "When off-the-shelf software forces compromise, we build custom web platforms, internal portals, and bespoke management systems engineered around your exact operational workflows.",
    projectImage: "/projects/caremon-real.png",
    projectCaption: "Bespoke digital architecture engineered for Caremon",
    challengeTitle: "The Challenge: Rigid Off-the-Shelf Limitations",
    challengeParagraphs: [
      "Modern businesses outgrow generic SaaS platforms quickly. You find your team duplicating data across three disconnected tools, inventing workarounds in spreadsheets, and paying recurring seat fees for software that only solves 60% of your problem.",
      "Off-the-shelf software forces your team to bend its proven operational processes to fit a generic product design. Over time, this creates severe administrative friction, human data entry error, and bottlenecks that prevent scale.",
    ],
    solutionTitle: "The Solution: Precision-Engineered Custom Architecture",
    solutionParagraphs: [
      "AvantusForge engineers software around how your business actually runs. We eliminate unnecessary complexity and build reliable, scalable web platforms that integrate directly into your existing infrastructure.",
      "Our solutions are built with modern TypeScript, high-performance backends, clean APIs, and thoughtful user interfaces designed for daily operational efficiency and long-term maintainability.",
    ],
    whatWeBuild: [
      {
        title: "Business Management Systems",
        description: "Tailor-made platforms unifying operations, order handling, and internal staff coordination.",
      },
      {
        title: "Internal Operations Portals",
        description: "Secure, role-based dashboards enabling staff to execute daily tasks without friction.",
      },
      {
        title: "Customer & Client Portals",
        description: "Self-service web interfaces for client onboarding, order tracking, and document exchange.",
      },
      {
        title: "Custom Admin Systems",
        description: "Granular data controls, auditing logs, and permission hierarchies for executive oversight.",
      },
      {
        title: "Workflow Automation Systems",
        description: "Automated event triggers, conditional business logic, and automated team notifications.",
      },
      {
        title: "Bespoke API Integrations",
        description: "Seamless bi-directional bridges between payment gateways, ERPs, and legacy software.",
      },
      {
        title: "Custom Databases & Schemas",
        description: "High-performance relational databases designed for data integrity and low latency.",
      },
      {
        title: "Reporting & Operational Hubs",
        description: "Real-time visibility into internal metrics without manual report compilation.",
      },
    ],
    howWeWork: [
      { step: "01", title: "Discovery", description: "Deep investigation of internal processes, edge cases, and user needs." },
      { step: "02", title: "Architecture", description: "Database schema design, API definitions, and infrastructure planning." },
      { step: "03", title: "UX/UI Design", description: "Frictionless operational screens tested with real end-users." },
      { step: "04", title: "Development", description: "Clean, type-safe full-stack engineering with modular codebases." },
      { step: "05", title: "Testing", description: "Automated regression tests, security verification, and user acceptance." },
      { step: "06", title: "Deployment", description: "Zero-downtime production launch and legacy data migration." },
      { step: "07", title: "Ongoing Support", description: "Proactive maintenance, performance tuning, and technical guidance." },
    ],
    caseStudy: {
      title: "Caremon Wellness Platform",
      category: "Custom Web & Storefront Architecture",
      slug: "caremon",
      summary: "Designed and engineered a tailored commerce experience with custom product variant architecture.",
      image: "/projects/caremon-real.png",
    },
    faqs: [
      {
        question: "How long does a typical custom software project take?",
        answer: "Most production-ready systems range between 8 to 16 weeks depending on architectural scope, data migration requirements, and integration touchpoints.",
      },
      {
        question: "Do we own the source code and intellectual property?",
        answer: "Yes, 100%. Upon final project delivery and settlement, all source code, design assets, and intellectual property belong exclusively to your company.",
      },
      {
        question: "Can your system integrate with our existing tools?",
        answer: "Yes. We specialize in building robust API bridges that synchronize data seamlessly with your accounting, CRM, inventory, and payment systems.",
      },
      {
        question: "What technology stack do you use?",
        answer: "We primarily build with modern TypeScript, Next.js, Node.js, PostgreSQL, and scalable cloud infrastructure (AWS/Vercel) for optimum performance and maintainability.",
      },
    ],
  },
  {
    slug: "business-automation",
    category: "AUTOMATE",
    title: "Business Automation",
    heroHeading: "Remove repetitive work and connect the systems you use.",
    heroSubheading:
      "Manual data entry, disconnected spreadsheets, and repetitive handoffs burn valuable hours. We engineer automated workflows that link your platforms and eliminate operational friction.",
    projectImage: "/images/business-automation.jpg",
    projectCaption: "Enterprise workflow architecture and data pipeline integration at AvantusForge Studio",
    challengeTitle: "The Challenge: The Hidden Cost of Manual Workflows",
    challengeParagraphs: [
      "When team members spend hours each week re-entering data from forms into CRMs, exporting CSVs to update accounting tools, and chasing approvals over email, operational speed stalls.",
      "Manual workflows are not only slow; they are inherently error-prone. A missed invoice or mismatched customer record leads directly to lost revenue and customer frustration.",
    ],
    solutionTitle: "The Solution: Resilient End-to-End Automation",
    solutionParagraphs: [
      "We design intelligent automation pipelines that run 24/7 without human intervention. By connecting your email, CRM, inventory, ERP, and customer service tools via custom webhooks and robust APIs, your business operates continuously.",
      "Our automation setups include built-in validation, error logging, and retry logic so that you never have to worry about silent failures.",
    ],
    whatWeBuild: [
      {
        title: "Lead-to-CRM Routing",
        description: "Instant enrichment and distribution of incoming sales inquiries directly to account reps.",
      },
      {
        title: "Automated Invoicing & Billing",
        description: "Triggering recurring invoices, payment reconciliation, and overdue reminder sequences.",
      },
      {
        title: "Cross-System Data Sync",
        description: "Two-way synchronization between ecommerce storefronts, warehouses, and accounting books.",
      },
      {
        title: "Document & Contract Generation",
        description: "Automated assembly of contracts, NDAs, and proposals populated with live database fields.",
      },
      {
        title: "Customer Support Escalation",
        description: "Smart ticket categorization, routing, and automated resolution status messaging.",
      },
      {
        title: "Inventory Alerting & Reorders",
        description: "Algorithmic stock monitoring with automated supplier purchase order drafting.",
      },
      {
        title: "Staff Onboarding Workflows",
        description: "One-click generation of credentials, hardware tracking, and training roadmaps.",
      },
      {
        title: "Custom Webhook Hubs",
        description: "Centralized serverless endpoints that transform and route external system signals.",
      },
    ],
    howWeWork: [
      { step: "01", title: "Workflow Audit", description: "Mapping every human touchpoint and identifying costly manual bottlenecks." },
      { step: "02", title: "Logic Design", description: "Specifying conditional paths, fallback behavior, and security constraints." },
      { step: "03", title: "Integration Build", description: "Developing secure API bridges and custom webhook endpoints." },
      { step: "04", title: "Data Validation", description: "Sanitizing data fields to ensure zero corruption across systems." },
      { step: "05", title: "Parallel Testing", description: "Running automated flows alongside existing manual operations to verify parity." },
      { step: "06", title: "Live Handover", description: "Deploying production triggers and establishing automated alerting logs." },
      { step: "07", title: "Optimization", description: "Refining triggers based on live throughput and business rule changes." },
    ],
    caseStudy: {
      title: "Dexlo Logistics Portal",
      category: "Workflow Automation & Vendor Dispatch",
      slug: "vendor-management",
      summary: "Automated vendor dispatching, status synchronization, and purchase order tracking.",
      image: "/projects/dexlo.png",
    },
    faqs: [
      {
        question: "Do we have to replace our existing software?",
        answer: "No. Our automation solutions are built to connect and enhance the tools your team already uses every day.",
      },
      {
        question: "What happens if an external API goes down?",
        answer: "We build all automations with queued retry logic, dead-letter storage, and automated notification alerts so no data is ever lost.",
      },
      {
        question: "Can non-technical team members monitor the automations?",
        answer: "Yes, we provide clean audit dashboards and notifications (via Slack, email, or internal portal) summarizing daily automated executions.",
      },
    ],
  },
  {
    slug: "erp-crm",
    category: "AUTOMATE",
    title: "ERP & CRM Systems",
    heroHeading: "Bring operations, customers and data into one connected system.",
    heroSubheading:
      "Fragmented data kills operational momentum. We build custom ERP and CRM solutions that unify sales pipelines, customer histories, inventory tracking, and operational analytics.",
    projectImage: "/images/about.jpg",
    projectCaption: "Enterprise software architecture and data modeling",
    challengeTitle: "The Challenge: Siloed Departments and Outdated Data",
    challengeParagraphs: [
      "When sales uses one tool, warehouse uses another, and finance uses a third, decision-makers are forced to rely on lagging indicators and conflicting numbers.",
      "Most enterprise ERPs on the market require multi-year contracts, clunky 1990s interfaces, and millions in consultant fees to make basic field adjustments.",
    ],
    solutionTitle: "The Solution: Modern, Modular Enterprise Platforms",
    solutionParagraphs: [
      "AvantusForge develops tailored ERP and CRM systems that reflect your company's actual operational flow. Fast, responsive, and intuitive, they empower staff to capture data cleanly and give leadership real-time visibility.",
      "Built on modern relational databases with granular permission controls, our systems scale seamlessly as your team and customer base expand.",
    ],
    whatWeBuild: [
      { title: "Unified Customer Records", description: "Single-pane view of customer interactions, order history, and lifetime value." },
      { title: "Custom Sales Pipelines", description: "Multi-stage deal tracking tailored to complex B2B sales cycles." },
      { title: "Inventory & Fulfillment Modules", description: "Live tracking of stock movements across multiple warehouses and locations." },
      { title: "Financial Ledger Sync", description: "Automatic generation of invoices, receipts, and revenue reconciliation." },
      { title: "Role-Based Access Control", description: "Strict permission boundaries protecting sensitive client and financial data." },
      { title: "Customer Service Hubs", description: "Centralized ticket history, SLA timers, and agent communication logs." },
      { title: "Executive Reporting Dashboards", description: "Real-time KPIs, margin analyses, and pipeline forecasting." },
      { title: "Audit Trail Logging", description: "Complete immutable audit history for every record edit and status change." },
    ],
    howWeWork: [
      { step: "01", title: "Domain Mapping", description: "Documenting all data models, entity relationships, and access tiers." },
      { step: "02", title: "Schema Engineering", description: "Structuring normalized databases designed for low latency and high concurrency." },
      { step: "03", title: "Interface Prototyping", description: "Designing intuitive screens that staff will actually enjoy using daily." },
      { step: "04", title: "Iterative Build", description: "Deploying modular functional blocks for early team feedback." },
      { step: "05", title: "Legacy Migration", description: "Extracting, cleansing, and validating existing customer and order records." },
      { step: "06", title: "Staff Training", description: "Hands-on walkthroughs and comprehensive operational documentation." },
      { step: "07", title: "Evolution", description: "Adding specialized modules as your business enters new territories." },
    ],
    caseStudy: {
      title: "Caremon Operations Architecture",
      category: "Customer & Order Data Management",
      slug: "caremon",
      summary: "Unified customer profiles, automated reordering, and integrated order tracking.",
      image: "/projects/caremon-real.png",
    },
    faqs: [
      {
        question: "Can we migrate data from our legacy CRM?",
        answer: "Yes. We handle the full extraction, transformation, deduplication, and migration of your legacy customer records without data loss.",
      },
      {
        question: "How secure is a custom ERP system?",
        answer: "Our systems implement industry-standard encryption in transit and at rest, role-based access control, session timeouts, and granular audit logs.",
      },
    ],
  },
  {
    slug: "saas-development",
    category: "BUILD",
    title: "SaaS Development",
    heroHeading: "Multi-tenant cloud applications built for scale.",
    heroSubheading:
      "Transforming high-value domain expertise into scalable recurring software. We engineer multi-tenant SaaS products with robust authentication, billing, and rock-solid cloud infrastructure.",
    projectImage: "/projects/dexlo.png",
    projectCaption: "Multi-tenant vendor management and logistics coordination platform",
    challengeTitle: "The Challenge: Navigating the Complexities of Multi-Tenancy",
    challengeParagraphs: [
      "Building a software-as-a-service application requires far more than basic CRUD functionality. Founders must solve data tenant isolation, subscription billing lifecycles, role hierarchies, and API rate limiting.",
      "A weak architectural foundation created by rushing an MVP leads to expensive rewrites when the first enterprise customer demands SOC2 compliance or custom integrations.",
    ],
    solutionTitle: "The Solution: Production-Grade SaaS Engineering",
    solutionParagraphs: [
      "AvantusForge partners with visionary founders and established enterprises to build SaaS platforms built on battle-tested architectural principles from day one.",
      "We build with Next.js, TypeScript, PostgreSQL, and Stripe Billing, ensuring zero-compromise security, lightning-fast interfaces, and clean API contracts.",
    ],
    whatWeBuild: [
      { title: "Multi-Tenant Data Architecture", description: "Secure row-level security or isolated database schemas per customer." },
      { title: "Stripe Billing & Subscriptions", description: "Tiered pricing, recurring billing, credit management, and self-serve invoices." },
      { title: "Auth & Team Management", description: "SSO, OAuth, passwordless login, and fine-grained organization permissions." },
      { title: "Public Developer APIs", description: "REST and GraphQL endpoints with API key management and documentation." },
      { title: "Admin Super-Portals", description: "Internal tooling for account impersonation, plan overrides, and metric auditing." },
      { title: "Event-Driven Notifications", description: "Transactional emails, in-app notification centers, and automated webhooks." },
      { title: "Analytics & Usage Metering", description: "Tracking feature consumption for usage-based billing models." },
      { title: "Automated CI/CD Pipelines", description: "Instant preview deployments, branch testing, and automated rollbacks." },
    ],
    howWeWork: [
      { step: "01", title: "Product Blueprint", description: "Defining core user loops, data tenancy model, and monetization tiers." },
      { step: "02", title: "UX Prototyping", description: "Designing polished, intuitive workflows from onboarding to checkout." },
      { step: "03", title: "Foundational Setup", description: "Auth, database tenancy, billing hooks, and security rules." },
      { step: "04", title: "Core Feature Build", description: "Engineering the primary value propositions with strict code quality." },
      { step: "05", title: "Load & Security Testing", description: "Stress testing concurrent sessions and validating authorization boundaries." },
      { step: "06", title: "Beta Rollout", description: "Deploying to closed beta cohorts with live telemetry and error monitoring." },
      { step: "07", title: "Commercial Launch", description: "Opening self-service onboarding and monitoring conversion funnels." },
    ],
    caseStudy: {
      title: "Dexlo Vendor Management System",
      category: "Multi-Tenant Logistics & SaaS",
      slug: "vendor-management",
      summary: "Multi-vendor logistics coordination portal, dispatch status synchronization, and purchase order tracking.",
      image: "/projects/dexlo.png",
    },
    faqs: [
      {
        question: "How do you ensure data isolation between tenants?",
        answer: "We use database-level Row Level Security (RLS) and scoped tenant context middleware on every single query, preventing cross-tenant data leakage.",
      },
      {
        question: "Can we support enterprise custom pricing and invoicing?",
        answer: "Yes, our billing architectures support both self-serve credit card subscriptions and custom enterprise invoicing with offline settlement terms.",
      },
    ],
  },
  {
    slug: "web-development",
    category: "BUILD",
    title: "Web Development",
    heroHeading: "Modern websites and digital platforms built to perform.",
    heroSubheading:
      "We design and build fast, responsive, and editorial-grade web platforms that load in milliseconds, tell your story with conviction, and convert qualified visitors into clients.",
    projectImage: "/projects/caremon-real.png",
    projectCaption: "High-performance web architecture built by AvantusForge",
    challengeTitle: "The Challenge: Bloated, Sluggish Template Websites",
    challengeParagraphs: [
      "Most commercial websites suffer from bloated page builders, heavy plugins, and generic layouts that look identical to competitors.",
      "These sites load slowly, perform poorly on mobile devices, and fail to convey the sophistication and craftsmanship of the company they represent.",
    ],
    solutionTitle: "The Solution: Custom Headless Engineering & Editorial Art Direction",
    solutionParagraphs: [
      "We build modern websites from scratch using Next.js, React, and clean semantic code. No page builder bloat. No unnecessary dependencies.",
      "Every layout is art-directed for visual rhythm, crisp typography, and fluid responsiveness across every screen size.",
    ],
    whatWeBuild: [
      { title: "Corporate Web Platforms", description: "Authoritative, editorial websites for consultancies and enterprise firms." },
      { title: "Product Landing Systems", description: "High-conversion product showcases with micro-interactions and proof points." },
      { title: "Headless CMS Platforms", description: "Empowering marketing teams to publish content without developer dependencies." },
      { title: "Interactive Portfolios", description: "Bespoke showcases for studios, architects, and luxury manufacturers." },
      { title: "Client Engagement Hubs", description: "Resource libraries, case study galleries, and interactive calculators." },
      { title: "Technical SEO Infrastructure", description: "Structured metadata, lightning-fast Core Web Vitals, and semantic HTML." },
      { title: "Responsive Micro-Animations", description: "Restrained motion that clarifies user hierarchy without slowing the page." },
      { title: "Internationalized Portals", description: "Multi-language and localized routing for global audience reach." },
    ],
    howWeWork: [
      { step: "01", title: "Information Architecture", description: "Structuring content hierarchy and user journeys." },
      { step: "02", title: "Art Direction", description: "Establishing bespoke typography, color systems, and visual rhythms." },
      { step: "03", title: "Frontend Engineering", description: "Writing modular, accessible React components with Next.js App Router." },
      { step: "04", title: "CMS Integration", description: "Configuring headless content models for seamless editorial publishing." },
      { step: "05", title: "Performance Tuning", description: "Image optimization, font preloading, and 95+ Google Lighthouse scores." },
      { step: "06", title: "Cross-Device QA", description: "Rigorous testing on mobile, tablet, and wide desktop viewports." },
      { step: "07", title: "Deployment", description: "Global edge CDN distribution with SSL certificates and DNS setup." },
    ],
    caseStudy: {
      title: "Caremon Storefront & Portal",
      category: "Modern Web Engineering",
      slug: "caremon",
      summary: "Crafted a blisteringly fast web storefront with sub-second page transitions.",
      image: "/projects/caremon-real.png",
    },
    faqs: [
      {
        question: "Can our marketing team update text and images easily?",
        answer: "Yes. We integrate modern headless CMS solutions (like Sanity, Strapi, or markdown workflows) so your team can publish updates freely.",
      },
      {
        question: "What are your typical Lighthouse performance scores?",
        answer: "We engineer all websites to achieve 90+ across Performance, Accessibility, Best Practices, and SEO on Google PageSpeed Insights.",
      },
    ],
  },
  {
    slug: "ecommerce-development",
    category: "COMMERCE",
    title: "Ecommerce Development",
    heroHeading: "Modern online stores designed around your business.",
    heroSubheading:
      "We engineer scalable digital commerce systems designed to turn visitors into buyers. From bespoke catalog navigation to swift one-click checkouts, every detail is tuned for commercial growth.",
    projectImage: "/projects/fama-real.png",
    projectCaption: "Luxury ecommerce storefront built for FAMA Bags",
    challengeTitle: "The Challenge: Cart Abandonment and Clunky Merchandising",
    challengeParagraphs: [
      "Consumers have zero patience for slow-loading product pages, confusing navigation, or frustrating multi-step checkout processes.",
      "Most online stores rely on heavily modified themes loaded with conflicting third-party apps, dragging down load times and creating high abandonment rates.",
    ],
    solutionTitle: "The Solution: Fast, Frictionless Commerce Architecture",
    solutionParagraphs: [
      "AvantusForge builds bespoke ecommerce experiences that combine high-fashion aesthetic standards with modern performance engineering.",
      "We design frictionless shopping funnels, optimize product variant selectors, and integrate reliable payment rails for seamless transactions.",
    ],
    whatWeBuild: [
      { title: "Custom Storefronts", description: "Bespoke digital flagships tailored to premium brand positioning." },
      { title: "High-Converting Checkout Flows", description: "Optimized one-page checkouts with Apple Pay, Google Pay, and localized currencies." },
      { title: "Dynamic Product Merchandising", description: "Interactive product configurators, bundle builders, and variant switchers." },
      { title: "ERP & Inventory Synchronization", description: "Real-time stock level synchronization with multi-channel warehouses." },
      { title: "Subscription Commerce", description: "Recurring deliveries, customer portal management, and automated dunning." },
      { title: "Wholesale & B2B Portals", description: "Tiered wholesale pricing, bulk order forms, and net-payment terms." },
      { title: "Cross-Border Localization", description: "Multi-currency checkout, automatic tax calculations, and localized shipping rates." },
      { title: "Performance Optimization", description: "Asset optimization delivering sub-second product page loads on mobile." },
    ],
    howWeWork: [
      { step: "01", title: "Commerce Strategy", description: "Auditing product catalog complexity, shipping rules, and payment requirements." },
      { step: "02", title: "UX Journey Mapping", description: "Refining the path from landing page to product discovery and checkout." },
      { step: "03", title: "Visual Merchandising", description: "Art-directing product display grids, photography frames, and typography." },
      { step: "04", title: "Custom Theme Build", description: "Writing clean liquid or headless React components without app bloat." },
      { step: "05", title: "App & Gateway Integration", description: "Configuring payment providers, logistics partners, and tax rules." },
      { step: "06", title: "End-to-End Testing", description: "Simulating hundreds of test transactions, card declines, and refund flows." },
      { step: "07", title: "Launch & Handover", description: "Smooth DNS switchover and comprehensive backend training for your staff." },
    ],
    caseStudy: {
      title: "FAMA Bags Flagship",
      category: "Luxury Ecommerce",
      slug: "fama-bags",
      summary: "Crafted a luxury handbag digital flagship with editorial storytelling and responsive mobile checkout.",
      image: "/projects/fama-real.png",
    },
    faqs: [
      {
        question: "Which platforms do you recommend for ecommerce?",
        answer: "We primarily build on Shopify and Shopify Plus due to their unmatched checkout conversion, reliability, and security. We also develop custom headless and WooCommerce solutions when specific business models dictate.",
      },
    ],
  },
  {
    slug: "shopify-development",
    category: "COMMERCE",
    title: "Shopify Development",
    heroHeading: "Custom Shopify themes and apps engineered for conversion.",
    heroSubheading:
      "Avoid bloated marketplace themes. We build bespoke Shopify stores, custom Liquid components, private apps, and headless commerce setups that give you total creative and operational freedom.",
    projectImage: "/projects/caremon-real.png",
    projectCaption: "Bespoke Shopify storefront engineered for Caremon",
    challengeTitle: "The Challenge: App Sprawl and Theme Bloat",
    challengeParagraphs: [
      "The average Shopify store installs 15 to 25 separate apps to handle basic styling, badges, upsells, and tabs. Each app injects third-party scripts, grinding mobile load times to a halt and creating brittle conflicts.",
      "When a generic theme breaks during a marketing campaign, fixing it becomes an emergency. You need custom code that belongs to you.",
    ],
    solutionTitle: "The Solution: Native, Clean-Coded Shopify Engineering",
    solutionParagraphs: [
      "We build custom Shopify themes directly using Shopify's modern Dawn framework or bespoke headless architectures. We write native Liquid, HTML, and CSS to replace bloated apps with clean code.",
      "The result is a lightning-fast shopping experience that loads instantly, ranks higher on search engines, and converts qualified traffic with ease.",
    ],
    whatWeBuild: [
      { title: "Bespoke Shopify Themes", description: "100% custom-coded themes built around your exact brand guidelines." },
      { title: "App Elimination & Native Code", description: "Replacing slow monthly subscription apps with native Liquid components." },
      { title: "Private Shopify Apps", description: "Custom backend apps connecting Shopify to your internal ERP or warehouse." },
      { title: "Custom Section Architecture", description: "Empowering your merchandising team to drag-and-drop custom blocks in the Theme Editor." },
      { title: "Shopify Plus Scripting & Functions", description: "Custom checkout discounts, bundle pricing, and specialized delivery rules." },
      { title: "Headless Shopify Storefronts", description: "Next.js frontends powered by Shopify's Storefront API for maximum speed." },
      { title: "Migration to Shopify", description: "Zero-data-loss transfer of customers, order histories, and SEO redirects." },
      { title: "Speed & Core Web Vitals Audits", description: "Eliminating unused JavaScript to achieve top-percentile speed scores." },
    ],
    howWeWork: [
      { step: "01", title: "Theme Architecture", description: "Auditing feature needs and structuring modular Liquid section schemas." },
      { step: "02", title: "Component Prototyping", description: "Designing editorial layouts, product card variants, and mini-cart drawers." },
      { step: "03", title: "Liquid Engineering", description: "Developing responsive components adhering to Shopify 2.0 architecture." },
      { step: "04", title: "Theme Editor Integration", description: "Exposing intuitive customization settings for non-technical team members." },
      { step: "05", title: "Checkout & App Setup", description: "Configuring payment gates, shipping matrices, and required integrations." },
      { step: "06", title: "QA & Real Order Testing", description: "Verifying webhooks, inventory deductions, and confirmation emails." },
      { step: "07", title: "Production Migration", description: "Seamless launch with automated 301 URL redirects preserving SEO equity." },
    ],
    caseStudy: {
      title: "Caremon Storefront",
      category: "Bespoke Shopify 2.0 Theme",
      slug: "caremon",
      summary: "Engineered a custom Shopify 2.0 theme with custom wellness product bundles and swift cart drawer.",
      image: "/projects/caremon-real.png",
    },
    faqs: [
      {
        question: "Can we still use the Shopify Admin and Theme Editor?",
        answer: "Yes, completely! We build all custom components into Shopify's native 2.0 section architecture so your team can edit text, swap images, and reorder sections with ease.",
      },
    ],
  },
  {
    slug: "mobile-app-development",
    category: "BUILD",
    title: "Mobile App Development",
    heroHeading: "Native and cross-platform mobile apps built to scale.",
    heroSubheading:
      "We design and engineer fluid, high-performance mobile applications for iOS and Android that put your business directly into your customers' hands.",
    projectImage: "/projects/safyrah.png",
    projectCaption: "Mobile commerce interface engineering with swift checkout",
    challengeTitle: "The Challenge: Sluggish Performance and Fragmented Platforms",
    challengeParagraphs: [
      "Users expect mobile apps to feel instantaneous, responsive, and native to their operating system. Clunky web wrappers and poorly optimized cross-platform code lead to low App Store ratings and swift uninstalls.",
      "Maintaining two completely separate codebases for iOS and Android can double development costs and slow down feature release cycles.",
    ],
    solutionTitle: "The Solution: High-Performance React Native & Swift Engineering",
    solutionParagraphs: [
      "We build mobile applications using modern React Native and native architectures that deliver 60fps performance while sharing business logic across iOS and Android.",
      "From biometric authentication and offline caching to push notification orchestration, our mobile apps are built for long-term customer engagement.",
    ],
    whatWeBuild: [
      { title: "Cross-Platform iOS & Android Apps", description: "Single codebase, native performance, and unified brand experiences." },
      { title: "On-Demand Delivery & Booking Apps", description: "Real-time geolocation tracking, driver dispatching, and instant checkout." },
      { title: "Customer Loyalty & Account Apps", description: "Personalized rewards, stored digital cards, and push notification triggers." },
      { title: "Enterprise Field Staff Apps", description: "Offline-first inspection tools, job status updates, and signature capture." },
      { title: "Biometric Auth & Secure Vaults", description: "FaceID, fingerprint recognition, and encrypted on-device storage." },
      { title: "Push Notification Engines", description: "Targeted, segmented push alerts driving user retention and order updates." },
      { title: "In-App Subscriptions & Purchases", description: "Apple App Store and Google Play billing integration." },
      { title: "App Store Submission & Compliance", description: "Handling full submission, review compliance, and release management." },
    ],
    howWeWork: [
      { step: "01", title: "Mobile Strategy", description: "Defining device capabilities, offline requirements, and user workflows." },
      { step: "02", title: "Touch-First UI Design", description: "Crafting gesture-driven interfaces following Apple HIG and Material guidelines." },
      { step: "03", title: "Engine Build", description: "Setting up typed React Native foundations with native bridge modules." },
      { step: "04", title: "API Integration", description: "Connecting mobile clients to high-speed backend endpoints with caching." },
      { step: "05", title: "Device Testing", description: "Testing across multiple physical iPhone and Android hardware form factors." },
      { step: "06", title: "Store Submission", description: "Navigating Apple App Store and Google Play Store review approvals." },
      { step: "07", title: "Telemetry & Updates", description: "Monitoring crash reports, app telemetry, and shipping seamless OTA updates." },
    ],
    caseStudy: {
      title: "Safyrah Mobile Commerce",
      category: "Pret Apparel & Mobile Shopping",
      slug: "safyrah",
      summary: "High-throughput mobile commerce experience with instant search and live inventory sync.",
      image: "/projects/safyrah.png",
    },
    faqs: [
      {
        question: "Do you publish the apps to Apple and Google stores?",
        answer: "Yes. We manage the entire store submission process, including metadata, screenshots, compliance policies, and responding to reviewer inquiries.",
      },
    ],
  },
  {
    slug: "ui-ux-design",
    category: "BUILD",
    title: "UI/UX Design",
    heroHeading: "Human-centric interface design and digital systems.",
    heroSubheading:
      "We design digital interfaces that balance editorial sophistication with functional clarity. Every screen is engineered to guide users intuitively and drive business outcomes.",
    projectImage: "/images/about.jpg",
    projectCaption: "Interface design system exploration at AvantusForge Studio",
    challengeTitle: "The Challenge: Confusing Navigation and High Friction",
    challengeParagraphs: [
      "A product can have incredible engineering under the hood, but if the interface is confusing, users will abandon it. Cluttered layouts, poor visual hierarchy, and inconsistent controls erode user trust.",
      "Designing without a cohesive design system leads to fragmented screens, duplicated effort, and a disjointed brand experience as new features are added.",
    ],
    solutionTitle: "The Solution: Systematic, Art-Directed Interface Design",
    solutionParagraphs: [
      "AvantusForge approaches UI/UX through an architectural lens. We start by mapping out mental models and user journeys before establishing comprehensive design systems in Figma.",
      "We blend restrained editorial typography, generous whitespace, and responsive grid layouts to create interfaces that feel effortless to navigate and look unmistakably premium.",
    ],
    whatWeBuild: [
      { title: "Design Systems & Token Libraries", description: "Comprehensive Figma component systems ensuring brand consistency across all products." },
      { title: "User Journey & Flow Mapping", description: "Streamlined paths that eliminate cognitive friction and unnecessary clicks." },
      { title: "High-Fidelity Interactive Prototypes", description: "Clickable prototypes simulating real product interactions before code is written." },
      { title: "Complex Dashboard Design", description: "Information-dense data visualizations presented with clarity and composure." },
      { title: "Mobile & Responsive UI", description: "Bespoke interface adaptations for mobile, tablet, and widescreen viewports." },
      { title: "Accessibility Audits (WCAG 2.1)", description: "High-contrast color pairings, accessible focus states, and keyboard navigation." },
      { title: "Micro-Interaction Guidelines", description: "Subtle motion and feedback states that provide tactile user confirmation." },
      { title: "Developer Handover Specs", description: "Pixel-perfect specifications, spacing tokens, and asset exports for engineering." },
    ],
    howWeWork: [
      { step: "01", title: "User Research", description: "Analyzing end-user needs, tasks, and commercial friction points." },
      { step: "02", title: "Wireframing", description: "Establishing information hierarchy and spatial relationships without visual bias." },
      { step: "03", title: "Visual Direction", description: "Exploring typography pairings, color systems, and brand elevation." },
      { step: "04", title: "Component Creation", description: "Building reusable, variant-rich UI component libraries in Figma." },
      { step: "05", title: "Interactive Prototyping", description: "Linking screens to simulate end-to-end user experiences." },
      { step: "06", title: "Usability Testing", description: "Validating navigation clarity with representative end users." },
      { step: "07", title: "Engineering Support", description: "Pairing directly with frontend developers to ensure 100% design fidelity." },
    ],
    caseStudy: {
      title: "FAMA Bags Brand & Storefront Design",
      category: "Editorial Commerce UI/UX",
      slug: "fama-bags",
      summary: "Crafted a luxury editorial design system showcasing artisan craftsmanship and frictionless checkout.",
      image: "/projects/fama-real.png",
    },
    faqs: [
      {
        question: "What design tools do you use?",
        answer: "We design primarily in Figma, delivering structured component libraries, auto-layout frames, and interactive prototypes ready for development.",
      },
    ],
  },
  {
    slug: "seo-digital-marketing",
    category: "GROW",
    title: "SEO & Digital Marketing",
    heroHeading: "SEO, content and paid campaigns built around real growth.",
    heroSubheading:
      "A great digital product is only valuable if qualified customers find it. We combine technical search engine optimization, content architecture, and performance marketing to drive commercial acquisition.",
    projectImage: "/projects/caremon-real.png",
    projectCaption: "Search optimization and growth architecture for digital brands",
    challengeTitle: "The Challenge: Wasted Ad Spend and Invisible Rankings",
    challengeParagraphs: [
      "Many companies spend thousands on paid ad campaigns that drive unqualified traffic to slow landing pages, burning budget with minimal return on ad spend.",
      "At the same time, technical SEO issues—such as improper canonical tags, slow Core Web Vitals, and poor site architecture—prevent search engines from indexing high-value pages.",
    ],
    solutionTitle: "The Solution: Technical Search Foundations & Targeted Acquisition",
    solutionParagraphs: [
      "We approach growth with an engineering mindset. We fix foundational technical SEO debt, build authoritative content hubs, and structure conversion funnels that convert visitors into revenue.",
      "Our paid media and organic campaigns are grounded in rigorous data tracking, attribution modeling, and continuous testing.",
    ],
    whatWeBuild: [
      { title: "Technical SEO Audits & Remediation", description: "Fixing crawl errors, redirect loops, sitemap discrepancies, and Core Web Vitals." },
      { title: "Keyword & Intent Architecture", description: "Targeting high-intent search queries that correlate directly with purchasing decisions." },
      { title: "Structured Data & Schema Markup", description: "Implementing JSON-LD schemas for rich snippets, FAQs, and product reviews." },
      { title: "Conversion Rate Optimization (CRO)", description: "A/B testing page copy, form fields, and call-to-actions to maximize conversion." },
      { title: "Paid Search (Google Ads)", description: "High-ROI search campaigns capturing customers actively looking for your solution." },
      { title: "Paid Social (Meta & LinkedIn)", description: "Precise audience targeting and compelling creative driving qualified B2B/B2C leads." },
      { title: "Content Strategy & Editorial Hubs", description: "Publishing authoritative industry guides that build domain authority." },
      { title: "Attribution & Analytics Setup", description: "Server-side tracking, Google Analytics 4, and conversion API integrations." },
    ],
    howWeWork: [
      { step: "01", title: "Technical Audit", description: "Inspecting site architecture, indexation status, and speed benchmarks." },
      { step: "02", title: "Market & Competitor Analysis", description: "Identifying keyword gaps and customer search behavior." },
      { step: "03", title: "Foundation Fixes", description: "Resolving technical crawl blockers and implementing schema tags." },
      { step: "04", title: "Funnel Engineering", description: "Building high-converting landing pages tailored to specific search intents." },
      { step: "05", title: "Campaign Launch", description: "Executing targeted paid campaigns with strict budget guardrails." },
      { step: "06", title: "Attribution Modeling", description: "Tracking customer lifetime value and cost per qualified acquisition." },
      { step: "07", title: "Iterative Scaling", description: "Doubling down on winning keywords, ad creatives, and search themes." },
    ],
    caseStudy: {
      title: "Caremon Growth Setup",
      category: "Technical SEO & Growth Funnel",
      slug: "caremon",
      summary: "Structured product schemas, accelerated mobile page speeds, and technical search visibility.",
      image: "/projects/caremon-real.png",
    },
    faqs: [
      {
        question: "How long does it take to see SEO results?",
        answer: "Technical fixes and indexing improvements typically take 4 to 8 weeks, while organic rankings for competitive terms build progressively over 3 to 6 months.",
      },
    ],
  },
];

import { AMAZON_SERVICES } from "./amazon-services-data";

export const ALL_SERVICES: ServiceData[] = [
  ...CORE_SERVICES,
  ...AMAZON_SERVICES,
];
