"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

interface ServiceItem {
  id: string;
  number: string;
  navTitle: string;
  headline: string;
  description: string;
  deliverables: string[];
  href: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "custom-software",
    number: "01",
    navTitle: "Custom Software & Systems",
    headline: "CUSTOM SOFTWARE & SYSTEMS",
    description:
      "We build tailored software solutions around the way your business actually operates — from internal management systems to complete business platforms.",
    deliverables: [
      "Business Management Systems",
      "Custom Web Applications",
      "ERP & CRM Solutions",
      "Workflow & Process Systems",
      "Admin & Customer Portals",
    ],
    href: "/services/custom-software-development",
  },
  {
    id: "websites-ecommerce",
    number: "02",
    navTitle: "Websites & E-Commerce",
    headline: "WEBSITES & E-COMMERCE",
    description:
      "We build high-converting online storefronts and modern commercial websites engineered for performance, brand authority, and seamless customer transactions.",
    deliverables: [
      "Shopify & Custom Storefronts",
      "Headless E-Commerce Builds",
      "Corporate & Editorial Websites",
      "Conversion Rate Optimization",
      "Payment & Inventory Sync",
    ],
    href: "/services/ecommerce-development",
  },
  {
    id: "saas-erp-crm",
    number: "03",
    navTitle: "SaaS, ERP & CRM",
    headline: "SAAS, ERP & CRM",
    description:
      "Centralize operations, customer records, and commercial data into synchronized software ecosystems built for reliability and scale.",
    deliverables: [
      "Multi-Tenant SaaS Products",
      "Bespoke ERP Infrastructure",
      "Custom CRM Pipelines",
      "Role-Based Access & Audits",
      "Executive Analytics Dashboards",
    ],
    href: "/services/erp-crm",
  },
  {
    id: "mobile-apps",
    number: "04",
    navTitle: "Mobile Applications",
    headline: "MOBILE APPLICATIONS",
    description:
      "Engineered mobile experiences for iOS and Android that deliver fluid responsiveness, offline reliability, and daily operational value for your users.",
    deliverables: [
      "Native iOS & Android Apps",
      "Cross-Platform React Native",
      "Customer Self-Service Apps",
      "Real-Time Push Notification Systems",
      "App Store Deployment & Lifecycle",
    ],
    href: "/services/mobile-app-development",
  },
  {
    id: "marketing-seo",
    number: "05",
    navTitle: "Digital Marketing & SEO",
    headline: "DIGITAL MARKETING & SEO",
    description:
      "Data-driven search visibility and growth campaigns engineered to position your business in front of high-intent commercial buyers.",
    deliverables: [
      "Technical SEO & Schema Optimization",
      "Organic Search Positioning",
      "Targeted Multi-Channel Ads",
      "Customer Acquisition Funnels",
      "Attribution & Analytics Auditing",
    ],
    href: "/services/seo-digital-marketing",
  },
  {
    id: "ui-ux",
    number: "06",
    navTitle: "UI/UX & Creative",
    headline: "UI/UX & CREATIVE",
    description:
      "Human-centered product design that clarifies complex business logic into intuitive, visually refined digital journeys that your team and clients enjoy.",
    deliverables: [
      "Interactive Wireframes & Prototypes",
      "Design Systems & Component Libraries",
      "Product Usability Auditing",
      "Mobile & Web Application UI",
      "Brand & Typography Direction",
    ],
    href: "/services/ui-ux-design",
  },
  {
    id: "automation",
    number: "07",
    navTitle: "Automation & Integrations",
    headline: "AUTOMATION & INTEGRATIONS",
    description:
      "Connect disconnected tools and automate manual handoffs so your team can spend less time on administrative repetition and more on revenue growth.",
    deliverables: [
      "API & Webhook Architecture",
      "Cross-Platform Workflow Triggers",
      "Accounting & Invoice Automation",
      "Automated Data Sanitization",
      "Legacy System Synchronization",
    ],
    href: "/services/business-automation",
  },
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpenTab, setMobileOpenTab] = useState<number | null>(0);

  const activeService = SERVICES[activeTab];

  const toggleMobileTab = (index: number) => {
    setMobileOpenTab(mobileOpenTab === index ? null : index);
  };

  return (
    <section className="py-24 sm:py-28 md:py-32 bg-[#FCFAF8] border-b border-[#E8DDE0] relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* DESKTOP TWO-COLUMN SECTION (lg and above) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-12 xl:gap-16 items-start">
          {/* LEFT SIDE: Vertical Interactive Service Navigation (~42% width) */}
          <div className="lg:col-span-5 space-y-4 sticky top-28">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#750F2C]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
                SERVICES WE OFFER
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight leading-tight pb-2">
              Engineered for real operational impact.
            </h2>

            {/* Vertical list of service tabs */}
            <div className="space-y-1.5 pt-2">
              {SERVICES.map((service, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={service.id}
                    onClick={() => setActiveTab(idx)}
                    type="button"
                    className={`w-full text-left py-3.5 px-4 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? "bg-[#750F2C]/[0.06] text-[#750F2C]"
                        : "text-[#6F6568] hover:text-[#191416] hover:bg-black/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono text-xs tracking-wider transition-colors ${
                          isActive
                            ? "text-[#750F2C] font-bold"
                            : "text-[#9E9396] group-hover:text-[#6F6568]"
                        }`}
                      >
                        {service.number}
                      </span>
                      <span
                        className={`text-base tracking-tight transition-all ${
                          isActive
                            ? "font-extrabold text-[#750F2C] translate-x-0.5"
                            : "font-semibold text-[#3D3336] group-hover:text-[#191416]"
                        }`}
                      >
                        {service.navTitle}
                      </span>
                    </div>

                    {/* Thin Burgundy Indicator line */}
                    <div
                      className={`w-1 h-6 rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-[#750F2C] opacity-100 scale-y-100"
                          : "bg-transparent opacity-0 scale-y-50"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Large Content Panel + Visual Agency CTA (~58% width) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Service Content Panel */}
            <div className="bg-white border border-[#E8DDE0] rounded-3xl p-8 sm:p-10 xl:p-12 shadow-[0_12px_40px_rgba(25,20,22,0.04)] transition-all duration-300">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-[11px] font-mono font-bold text-[#750F2C] tracking-widest uppercase">
                  Service {activeService.number}
                </span>
                <span className="text-[11px] font-semibold text-[#9E9396] uppercase tracking-wider">
                  AvantusForge Practice
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight uppercase mb-4">
                {activeService.headline}
              </h3>

              <p className="text-base text-[#6F6568] leading-relaxed max-w-2xl mb-8 font-normal">
                {activeService.description}
              </p>

              {/* Short Deliverables Bullet List */}
              <div className="border-t border-[#E8DDE0]/80 pt-6 mb-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E9396] block mb-4">
                  Core Capabilities
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  {activeService.deliverables.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 text-sm font-medium text-[#191416]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#750F2C] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Small burgundy outlined button */}
              <div>
                <Link
                  href={activeService.href}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#750F2C] text-[#750F2C] hover:bg-[#750F2C] hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 group/btn shadow-xs cursor-pointer"
                >
                  <span>Explore Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* RIGHT-SIDE VISUAL CTA: Authentic agency aesthetic */}
            <div className="relative rounded-3xl overflow-hidden border border-[#E8DDE0] min-h-[230px] sm:min-h-[250px] flex items-center bg-[#191416] group shadow-[0_12px_40px_rgba(25,20,22,0.06)]">
              {/* Natural Photography Background */}
              <Image
                src="/images/about.jpg"
                alt="AvantusForge Studio & Engineering Workspace"
                fill
                className="object-cover object-center opacity-40 transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />

              {/* Editorial Burgundy / Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2D060F]/95 via-[#3D0717]/85 to-transparent" />

              {/* Content Overlay */}
              <div className="relative z-10 p-8 sm:p-10 max-w-lg space-y-3">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C89B3C] block">
                  Engineering Partnership
                </span>

                <h4 className="text-xl sm:text-2xl font-extrabold text-[#F8F5F0] tracking-tight leading-snug">
                  BUILD WHAT YOUR BUSINESS NEEDS.
                </h4>

                <p className="text-xs sm:text-sm text-[#F8F5F0]/80 leading-relaxed font-normal">
                  From idea to execution, we turn business requirements into practical digital solutions.
                </p>

                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#C89B3C] hover:text-white transition-colors group/link cursor-pointer"
                  >
                    <span>Start a Project</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 group-hover/link:bg-[#C89B3C] text-white group-hover/link:text-[#2D060F] flex items-center justify-center transition-all duration-200">
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE & TABLET ACCORDION VIEW (< lg screens) */}
        <div className="block lg:hidden space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#750F2C]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
                SERVICES WE OFFER
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight leading-tight">
              Engineered for real operational impact.
            </h2>
            <p className="text-sm text-[#6F6568] leading-relaxed">
              Explore our core technical practices and capabilities below.
            </p>
          </div>

          {/* Stacked Accordion Items */}
          <div className="space-y-3">
            {SERVICES.map((service, idx) => {
              const isOpen = mobileOpenTab === idx;
              return (
                <div
                  key={service.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-[#750F2C]/40 bg-white shadow-sm"
                      : "border-[#E8DDE0] bg-white/80 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleMobileTab(idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isOpen ? "text-[#750F2C]" : "text-[#9E9396]"
                        }`}
                      >
                        {service.number}
                      </span>
                      <span
                        className={`text-base font-bold tracking-tight ${
                          isOpen ? "text-[#750F2C]" : "text-[#191416]"
                        }`}
                      >
                        {service.navTitle}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full border border-[#E8DDE0] flex items-center justify-center transition-transform duration-200 ${
                        isOpen
                          ? "rotate-180 bg-[#750F2C] text-white border-[#750F2C]"
                          : "text-[#6F6568] bg-[#FCFAF8]"
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Expanded Content Panel */}
                  {isOpen && (
                    <div className="px-5 pb-6 pt-1 border-t border-[#E8DDE0]/60 space-y-4">
                      <h4 className="text-lg font-extrabold text-[#191416] tracking-tight uppercase pt-2">
                        {service.headline}
                      </h4>

                      <p className="text-sm text-[#6F6568] leading-relaxed">
                        {service.description}
                      </p>

                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9396] block mb-2.5">
                          Core Capabilities
                        </span>
                        <ul className="space-y-2">
                          {service.deliverables.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2.5 text-xs font-medium text-[#191416]"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#750F2C] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3">
                        <Link
                          href={service.href}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#750F2C] text-[#750F2C] hover:bg-[#750F2C] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          <span>Explore Service</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Visual CTA for Mobile / Tablet */}
          <div className="relative rounded-3xl overflow-hidden border border-[#E8DDE0] min-h-[220px] flex items-center bg-[#191416] group shadow-sm mt-6">
            <Image
              src="/images/about.jpg"
              alt="AvantusForge Studio & Engineering Workspace"
              fill
              className="object-cover object-center opacity-40"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D060F]/95 via-[#3D0717]/85 to-transparent" />
            <div className="relative z-10 p-6 sm:p-8 space-y-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C89B3C] block">
                Engineering Partnership
              </span>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#F8F5F0] tracking-tight">
                BUILD WHAT YOUR BUSINESS NEEDS.
              </h4>
              <p className="text-xs text-[#F8F5F0]/80 leading-relaxed max-w-sm">
                From idea to execution, we turn business requirements into practical digital solutions.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#C89B3C] hover:text-white transition-colors"
                >
                  <span>Start a Project</span>
                  <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
