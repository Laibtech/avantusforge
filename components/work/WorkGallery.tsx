"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight, ArrowUpRight } from "lucide-react";

type ProjectCategory =
  | "All Work"
  | "Software & HRMS"
  | "Mobile Applications"
  | "E-commerce"
  | "Business Websites"
  | "SEO & Digital Marketing";

interface ProjectItem {
  id: string;
  name: string;
  categoryBadge: string;
  categoryLabel: string;
  tag: string;
  tagline: string;
  tabTags: ProjectCategory[];
  image: string;
  description: string;
  servicesDelivered: string[];
  linkHref: string;
}

const TABS: ProjectCategory[] = [
  "All Work",
  "Software & HRMS",
  "Mobile Applications",
  "E-commerce",
  "Business Websites",
  "SEO & Digital Marketing",
];

const PROJECTS: ProjectItem[] = [
  {
    id: "hrms",
    name: "HRMS & Custom Business Management Software",
    categoryBadge: "SOFTWARE & HRMS",
    categoryLabel: "Enterprise Software & Mobile Architecture",
    tag: "Unified Cloud Platform & Mobile Companion",
    tagline: "Smarter Tools. Stronger Teams.",
    tabTags: ["Software & HRMS", "Mobile Applications"],
    image: "/projects/vendor-management.jpg",
    description:
      "A unified enterprise cloud system digitizing workforce operations, automated approval hierarchies, attendance tracking, and payroll workflows. Paired with a responsive mobile companion application for staff on the move.",
    servicesDelivered: [
      "Custom Software Development",
      "Mobile Application Engineering",
      "Workforce & Payroll Workflows",
      "Business Process Digitization",
    ],
    linkHref: "/contact",
  },
  {
    id: "caremon",
    name: "Caremon D2C Wellness Flagship",
    categoryBadge: "E-COMMERCE",
    categoryLabel: "Holistic Wellness & Digital Commerce",
    tag: "Direct-to-Consumer Wellness Flagship",
    tagline: "Holistic Care. Sub-Second Checkout.",
    tabTags: ["E-commerce", "SEO & Digital Marketing"],
    image: "/projects/caremon-real.webp",
    description:
      "Custom holistic care and wellness e-commerce storefront engineered with modular catalog browsing, streamlined customer navigation, and a frictionless mobile checkout funnel.",
    servicesDelivered: [
      "E-commerce Website Development",
      "SEO & Technical Search Indexing",
      "Conversion & Checkout Optimization",
      "Graphic Design & Visual Brand Assets",
    ],
    linkHref: "/contact",
  },
  {
    id: "fama-bags",
    name: "FAMA Handcrafted Leather Goods",
    categoryBadge: "E-COMMERCE",
    categoryLabel: "Luxury Leathercraft & Fashion",
    tag: "Global Multi-Currency Flagship",
    tagline: "Artisan Leathercraft. Global Commerce.",
    tabTags: ["E-commerce", "SEO & Digital Marketing"],
    image: "/projects/fama-real.webp",
    description:
      "Direct-to-consumer digital flagship engineered for luxury leather handbags. Features structured product variant logic, lifestyle galleries, multi-currency support, and conversion-focused social campaign assets.",
    servicesDelivered: [
      "Shopify Storefront Engineering",
      "Editorial Brand Art Direction",
      "Multi-Currency Purchasing Setup",
      "High-Converting Checkout Journey",
    ],
    linkHref: "/contact",
  },
  {
    id: "oasis",
    name: "Oasis Global Consulting Platform",
    categoryBadge: "BUSINESS WEBSITES",
    categoryLabel: "Corporate Advisory & Regulatory Compliance",
    tag: "Corporate Credibility & Client Intake",
    tagline: "Institutional Trust. Regulatory Clarity.",
    tabTags: ["Business Websites", "SEO & Digital Marketing"],
    image: "/projects/oasis-consulting.png",
    description:
      "Distinguished corporate digital platform positioning Oasis Global Consulting at the intersection of regulatory compliance, foreign business setup, and secure executive onboarding across international jurisdictions.",
    servicesDelivered: [
      "Corporate Web Architecture",
      "Regulatory Credibility Positioning",
      "Secure Client Intake & Onboarding",
      "Technical SEO & Search Authority",
    ],
    linkHref: "/contact",
  },
  {
    id: "dexlo",
    name: "Dexlo Systems Corporate Engineering",
    categoryBadge: "BUSINESS WEBSITES",
    categoryLabel: "High-Performance Corporate Presence",
    tag: "Gutenberg Block Architecture",
    tagline: "Lightweight Architecture. Zero Bloat.",
    tabTags: ["Business Websites"],
    image: "/projects/dexlo.webp",
    description:
      "A modern corporate digital presence engineered with custom lightweight WordPress Gutenberg block architecture, fluid responsive scaling, and sub-second core web vitals performance.",
    servicesDelivered: [
      "Custom Gutenberg Block Architecture",
      "Responsive Front-End Implementation",
      "Speed & Core Web Vitals Optimization",
      "Corporate Authority Positioning",
    ],
    linkHref: "/contact",
  },
  {
    id: "aldulaijan",
    name: "Al-Dulaijan Financial & Corporate Advisory",
    categoryBadge: "BUSINESS WEBSITES",
    categoryLabel: "Institutional Advisory & Compliance",
    tag: "Corporate Advisory & Compliance",
    tagline: "Financial Integrity. Structured Intake.",
    tabTags: ["Business Websites"],
    image: "/projects/aldulaijan.webp",
    description:
      "A professional corporate advisory website designed to communicate trust, financial expertise, and regulatory clarity through structured consultation intake channels.",
    servicesDelivered: [
      "Website Development",
      "Advisory Structure & UI/UX Design",
      "SEO & Search Engine Indexing",
      "Inquiry Channel Optimization",
    ],
    linkHref: "/contact",
  },
  {
    id: "safyrah",
    name: "Safyrah Luxury Fragrance & E-Commerce",
    categoryBadge: "E-COMMERCE",
    categoryLabel: "High-End Perfumery & Digital Commerce",
    tag: "Luxury D2C Fragrance Flagship",
    tagline: "Bespoke Scent Storytelling.",
    tabTags: ["E-commerce", "SEO & Digital Marketing"],
    image: "/projects/safyrah.webp",
    description:
      "Bespoke direct-to-consumer digital storefront for high-end perfumery, featuring refined typography, scent family filtering, and seamless mobile checkout.",
    servicesDelivered: [
      "Shopify Storefront Development",
      "Luxury Editorial Art Direction",
      "Product Variant Logic",
      "Mobile Checkout Flow",
    ],
    linkHref: "/contact",
  },
  {
    id: "thrivex",
    name: "ThriveX Platform",
    categoryBadge: "SOFTWARE & HRMS",
    categoryLabel: "Modern Web Platform & Systems",
    tag: "Next.js Modular Architecture",
    tagline: "Sub-Second Execution. Modular Architecture.",
    tabTags: ["Business Websites", "Software & HRMS"],
    image: "/projects/automation-pipeline.jpg",
    description:
      "High-performance digital web platform engineered for modern brand presentation, modular component delivery, and sub-second page response times.",
    servicesDelivered: [
      "Custom Software Development",
      "Website Development",
      "Modular Design Token System",
      "Speed & Accessibility Standards",
    ],
    linkHref: "/contact",
  },
  {
    id: "sheesha",
    name: "SheeshaTonight Rental Marketplace",
    categoryBadge: "E-COMMERCE",
    categoryLabel: "On-Demand Hospitality & Rental Marketplace",
    tag: "Real-Time Booking & Logistics Engine",
    tagline: "Instant Dispatch. Effortless Booking.",
    tabTags: ["E-commerce", "Software & HRMS"],
    image: "/projects/sheesha-real.webp",
    description:
      "On-demand rental marketplace and delivery dispatch system engineered for real-time order scheduling, customer geo-routing, and automated inventory sync.",
    servicesDelivered: [
      "Custom Marketplace Engineering",
      "Automated Order Dispatching",
      "Mobile-First UI/UX System",
      "Real-Time Delivery Synchronization",
    ],
    linkHref: "/contact",
  },
];

export default function WorkGallery() {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("All Work");

  const filteredProjects =
    activeTab === "All Work"
      ? PROJECTS
      : PROJECTS.filter((p) => p.tabTags.includes(activeTab));

  return (
    <section className="py-16 md:py-24 bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-12 sm:space-y-14">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E8DDE0] pb-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer ${isActive
                  ? "bg-[#750F2C] text-white shadow-xs"
                  : "bg-white text-[#6F6568] border border-[#E8DDE0] hover:text-[#191416] hover:border-[#750F2C]/40"
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* EXACT SPLIT SHOWCASE CARDS (Left: Dark Burgundy, Right: Project Picture) */}
        <div className="space-y-10 sm:space-y-12 lg:space-y-14">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-[#E8DDE0] rounded-2xl overflow-hidden shadow-xs hover:border-[#750F2C]/40 transition-all duration-300 grid grid-cols-1 lg:grid-cols-2"
            >
              {/* LEFT PANEL — Deep Dark Burgundy (#52091E) */}
              <div className="bg-[#52091E] text-[#FCFAF8] p-7 sm:p-9 xl:p-11 flex flex-col justify-between relative overflow-hidden">
                {/* Subtle atmospheric radial accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-white/5 to-transparent pointer-events-none rounded-full -mr-20 -mt-20" />

                {/* Top Badge & Header */}
                <div>
                  <div className="inline-flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full border border-white/25 bg-white/5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#E1C27A]">
                      {project.categoryBadge}
                    </span>
                    <span className="text-white/40 text-xs">•</span>
                    <span className="text-[11px] font-medium text-white/70">
                      {project.categoryLabel}
                    </span>
                  </div>

                  {/* Project Name */}
                  <h3 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-[#FAF8F5] tracking-tight leading-[1.14] mt-5 mb-4">
                    {project.name}
                  </h3>

                  {/* Concise Description */}
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal max-w-xl">
                    {project.description}
                  </p>

                  {/* Services Delivered */}
                  <div className="pt-6 mt-6 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E1C27A] font-bold block mb-3">
                      Services Delivered &amp; Capabilities
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {project.servicesDelivered.map((service) => (
                        <li
                          key={service}
                          className="flex items-center gap-2 text-xs text-white/90"
                        >
                          <span className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center shrink-0 text-[#E1C27A] bg-white/5">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span className="truncate">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-7 mt-7 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={project.linkHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/15 hover:bg-white hover:text-[#52091E] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200"
                  >
                    <span>Discuss Similar Scope</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[11px] font-mono text-white/50 tracking-wider hidden sm:inline">
                    {project.tag}
                  </span>
                </div>
              </div>

              {/* RIGHT PANEL — Picture / Visual Showcase (Warm Ivory / Beige #FAF7F4) */}
              <div className="bg-[#FAF7F4] flex flex-col justify-between p-6 sm:p-8 xl:p-10 relative overflow-hidden min-h-[340px] sm:min-h-[420px] lg:min-h-full">
                {/* Backdrop subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5EFE9] to-[#FAF7F4] pointer-events-none" />

                {/* Real Picture Container (Clean, NO fake browser dots or URL bars) */}
                <div className="relative flex-1 w-full flex items-center justify-center z-1 py-3">
                  <div className="relative w-full h-[260px] sm:h-[320px] lg:h-[360px] xl:h-[390px] rounded-xl overflow-hidden bg-white shadow-[0_10px_30px_rgba(25,20,22,0.06)] border border-[#E8DDE0]/70 p-2 sm:p-3 flex items-center justify-center">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-contain p-2 sm:p-4"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Italic Tagline */}
                <div className="pt-4 border-t border-[#E8DDE0]/60 flex items-center justify-between text-xs relative z-1">
                  <span className="font-serif italic text-sm sm:text-base text-[#52091E] font-medium tracking-tight">
                    &ldquo;{project.tagline}&rdquo;
                  </span>
                  <span className="text-[11px] font-mono font-medium text-[#827478]">
                    AvantusForge Production
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 bg-white border border-[#E8DDE0] rounded-2xl p-8 space-y-4">
              <p className="text-sm text-[#6F6568]">
                No projects found under this category filter.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("All Work")}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md bg-[#750F2C] text-white hover:bg-[#52091E] transition-colors cursor-pointer"
              >
                Reset to All Work
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
