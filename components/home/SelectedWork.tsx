"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Check } from "lucide-react";

interface ProjectData {
  id: string;
  number: string;
  category: string;
  categoryKey: "all" | "software" | "ecommerce" | "website";
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  image: string;
  caseLink: string;
}

const PROJECTS: ProjectData[] = [
  {
    id: "caremon",
    number: "01",
    category: "E-COMMERCE",
    categoryKey: "ecommerce",
    title: "Caremon D2C Wellness Flagship",
    subtitle: "Speed That Converts",
    description:
      "A clean digital commerce flagship designed around healthcare, wellness, and a seamless mobile checkout journey with sub-second page loads and conversion rate architecture.",
    deliverables: [
      "Custom Shopify 2.0 Theme Engineering",
      "Headless Architecture Speed Optimization",
      "Frictionless Mobile Checkout Funnel",
      "SEO & Technical Search Indexing",
    ],
    image: "/projects/caremon-real.webp",
    caseLink: "/work",
  },
  {
    id: "hrms",
    number: "02",
    category: "SOFTWARE & HRMS",
    categoryKey: "software",
    title: "HRMS & Business Suite",
    subtitle: "Smarter Tools. Stronger Teams.",
    description:
      "A unified enterprise cloud platform digitizing workforce operations, multi-tier approvals, and payroll workflows, paired with an integrated mobile companion application.",
    deliverables: [
      "Custom Software & Cloud Architecture",
      "Workforce & Payroll Workflows",
      "Business Process Digitization",
      "Mobile Companion Application",
    ],
    image: "/projects/vendor-management.jpg",
    caseLink: "/work",
  },
  {
    id: "oasis",
    number: "03",
    category: "BUSINESS WEBSITES",
    categoryKey: "website",
    title: "Oasis Global Consulting",
    subtitle: "Regulatory Trust Signals",
    description:
      "Distinguished corporate digital platform positioning Oasis Global Consulting at the intersection of regulatory compliance, investment facilitation, and executive business setups.",
    deliverables: [
      "Custom Corporate Web Architecture",
      "Regulatory Credibility Positioning",
      "Secure Client Intake & Onboarding",
      "Technical SEO & Search Authority",
    ],
    image: "/projects/oasis-consulting.png",
    caseLink: "/work",
  },
  {
    id: "fama",
    number: "04",
    category: "E-COMMERCE",
    categoryKey: "ecommerce",
    title: "FAMA Handcrafted Leather Goods",
    subtitle: "Luxury Storytelling",
    description:
      "Direct-to-consumer digital flagship bringing bespoke leather craftsmanship to international luxury buyers across the UK and UAE with localized multi-currency purchasing.",
    deliverables: [
      "Art-Directed Visual Storytelling",
      "Mobile-First Shopping Experience",
      "Automated Inventory & Cart Synchronization",
      "A/B Tested Checkout Funnel",
    ],
    image: "/projects/fama-real.webp",
    caseLink: "/work",
  },
  {
    id: "dexlo",
    number: "05",
    category: "BUSINESS WEBSITES",
    categoryKey: "website",
    title: "Dexlo Systems",
    subtitle: "Lightweight Architecture",
    description:
      "A modern corporate digital presence engineered with custom lightweight WordPress Gutenberg block architecture, fluid responsive scaling, and sub-second core web vitals.",
    deliverables: [
      "Custom Gutenberg Block Architecture",
      "Responsive Front-End Implementation",
      "Speed & Core Web Vitals Optimization",
      "Corporate Authority Positioning",
    ],
    image: "/projects/dexlo.webp",
    caseLink: "/work",
  },
  {
    id: "aldulaijan",
    number: "06",
    category: "BUSINESS WEBSITES",
    categoryKey: "website",
    title: "Al-Dulaijan CPA",
    subtitle: "Advisory & Compliance",
    description:
      "A professional corporate advisory website designed to communicate trust, financial expertise, and regulatory clarity through structured consultation intake channels.",
    deliverables: [
      "Corporate Advisory Platform",
      "Regulatory Positioning System",
      "Structured Client Onboarding",
      "Enterprise Security Standards",
    ],
    image: "/projects/aldulaijan.webp",
    caseLink: "/work",
  },
  {
    id: "thrivex",
    number: "07",
    category: "BUSINESS WEBSITES",
    categoryKey: "website",
    title: "ThriveX Platform",
    subtitle: "Modular Component Delivery",
    description:
      "High-performance digital web platform engineered for modern brand presentation, modular component delivery, and sub-second page response times.",
    deliverables: [
      "Next.js App Router Architecture",
      "Modular Design Token System",
      "Enterprise Cloud CDN Ingestion",
      "Technical SEO Optimization",
    ],
    image: "/projects/automation-pipeline.jpg",
    caseLink: "/work",
  },
];

const TABS = [
  { label: "All Work", filter: "all", count: "07" },
  { label: "Software & HRMS", filter: "software", count: "01" },
  { label: "E-Commerce", filter: "ecommerce", count: "02" },
  { label: "Websites", filter: "website", count: "04" },
];

export default function SelectedWork() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentId, setCurrentId] = useState<string>("caremon");

  const visibleProjects =
    activeTab === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.categoryKey === activeTab);

  const currentProject =
    PROJECTS.find((p) => p.id === currentId) || visibleProjects[0] || PROJECTS[0];

  const handleTabChange = (filter: string) => {
    setActiveTab(filter);
    const matches =
      filter === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.categoryKey === filter);
    if (matches.length > 0 && !matches.some((p) => p.id === currentId)) {
      setCurrentId(matches[0].id);
    }
  };

  const moveProject = useCallback(
    (direction: number) => {
      const idx = visibleProjects.findIndex((p) => p.id === currentProject.id);
      if (idx === -1) {
        if (visibleProjects.length > 0) setCurrentId(visibleProjects[0].id);
        return;
      }
      const nextIdx = (idx + direction + visibleProjects.length) % visibleProjects.length;
      setCurrentId(visibleProjects[nextIdx].id);
    },
    [visibleProjects, currentProject.id]
  );

  return (
    <section className="py-20 md:py-28 bg-[#FCFAF8] border-b border-[#E8DDE0]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-10 md:space-y-12">
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E8DDE0]">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
              Selected Work
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
              Disciplined engineering delivered for real businesses.
            </h2>
            <p className="text-sm sm:text-base text-[#6F6568] leading-relaxed font-normal pt-1">
              Explore featured digital flagships, bespoke software platforms, and high-performance commercial websites.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.filter;
              return (
                <button
                  key={tab.filter}
                  type="button"
                  onClick={() => handleTabChange(tab.filter)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#750F2C] text-white shadow-xs"
                      : "bg-white text-[#6F6568] border border-[#E8DDE0] hover:text-[#191416] hover:border-[#750F2C]/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SPLIT SHOWCASE CARD (Left: Dark Burgundy, Right: Project Picture) */}
        <div className="bg-white border border-[#E8DDE0] rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          {/* LEFT PANEL — Deep Burgundy (#52091E) */}
          <div className="lg:col-span-6 xl:col-span-5 bg-[#52091E] p-8 sm:p-10 xl:p-12 text-[#FCFAF8] flex flex-col justify-between relative overflow-hidden">
            {/* Subtle atmospheric radial accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-white/5 to-transparent pointer-events-none rounded-full -mr-20 -mt-20" />

            <div className="relative z-10 space-y-6">
              {/* Counter & Arrows */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#E1C27A]">
                    {currentProject.number}
                  </span>
                  <span className="text-xs font-mono text-white/50">/ 07</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Previous Case Study"
                    onClick={() => moveProject(-1)}
                    className="w-9 h-9 rounded-lg border border-white/20 bg-white/10 hover:bg-white hover:text-[#52091E] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next Case Study"
                    onClick={() => moveProject(1)}
                    className="w-9 h-9 rounded-lg border border-white/20 bg-white/10 hover:bg-white hover:text-[#52091E] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Badge & Title */}
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full border border-white/25 bg-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-[#E1C27A] inline-block">
                  {currentProject.category}
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FAF8F5] tracking-tight leading-[1.18]">
                  <Link href={currentProject.caseLink} className="hover:underline">
                    {currentProject.title}
                  </Link>
                </h3>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  {currentProject.description}
                </p>
              </div>

              {/* Deliverables Checklist */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E1C27A] font-bold block mb-3">
                  Delivered Architecture &amp; Services
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/90">
                  {currentProject.deliverables.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center shrink-0 text-[#E1C27A] bg-white/5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Button Action */}
            <div className="relative z-10 pt-7 mt-6 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/30 bg-white/15 hover:bg-white hover:text-[#52091E] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xs cursor-pointer group/btn"
              >
                <span>Explore Work Gallery</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <span className="text-[11px] font-mono text-white/50 tracking-wider hidden sm:inline">
                {currentProject.subtitle}
              </span>
            </div>
          </div>

          {/* RIGHT PANEL — Visual Picture Showcase (Warm Ivory #FAF7F4) */}
          <div className="lg:col-span-6 xl:col-span-7 bg-[#FAF7F4] flex flex-col justify-center p-6 sm:p-8 xl:p-12 relative overflow-hidden min-h-[360px] sm:min-h-[440px] lg:min-h-full">
            {/* Subtle background tone */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5EFE9] to-[#FAF7F4] pointer-events-none" />

            <div className="relative z-10 w-full flex items-center justify-center">
              <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[400px] xl:h-[430px] rounded-xl overflow-hidden bg-white shadow-[0_12px_36px_rgba(25,20,22,0.08)] border border-[#E8DDE0] p-3 sm:p-4 flex items-center justify-center">
                <Image
                  src={currentProject.image}
                  alt={currentProject.title}
                  fill
                  className="object-contain p-2 sm:p-3"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM PROJECT QUICK-SELECTOR STRIP */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {visibleProjects.map((p) => {
              const isSelected = p.id === currentProject.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCurrentId(p.id)}
                  className={`px-3.5 py-2 rounded-xl border text-left whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#750F2C] text-white border-[#750F2C] shadow-xs"
                      : "bg-white text-[#191416] border-[#E8DDE0] hover:border-[#750F2C]/40 hover:bg-[#FCFAF8]"
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isSelected ? "text-[#E1C27A]" : "text-[#750F2C]"
                    }`}
                  >
                    {p.number}
                  </span>
                  <span className="text-xs font-bold truncate max-w-[150px]">{p.title}</span>
                </button>
              );
            })}
          </div>

          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#750F2C] hover:text-[#52091E] shrink-0 hover:underline"
          >
            <span>Explore All Work</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
