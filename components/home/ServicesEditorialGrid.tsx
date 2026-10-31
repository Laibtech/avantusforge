import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SERVICES_GRID = [
  {
    number: "01",
    title: "CUSTOM SOFTWARE",
    description: "Business software designed around your actual workflows.",
    href: "/services/custom-software-development",
  },
  {
    number: "02",
    title: "BUSINESS AUTOMATION",
    description: "Automate repetitive work and connect your operations.",
    href: "/services/business-automation",
  },
  {
    number: "03",
    title: "WEBSITES",
    description: "Modern websites designed to turn visitors into customers.",
    href: "/services/web-development",
  },
  {
    number: "04",
    title: "ECOMMERCE",
    description: "Shopify, WooCommerce and custom ecommerce solutions.",
    href: "/services/ecommerce-development",
  },
  {
    number: "05",
    title: "SAAS, ERP & CRM",
    description: "Centralize customers, operations, sales and business data.",
    href: "/services/erp-crm",
  },
  {
    number: "06",
    title: "DIGITAL GROWTH",
    description: "SEO, social media, paid advertising and content.",
    href: "/services/seo-digital-marketing",
  },
];

export default function ServicesEditorialGrid() {
  return (
    <section className="py-24 md:py-32 bg-white border-b border-[#E8DDE0]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              What We Do
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
              Technology Built Around{" "}
              <span className="font-serif italic font-normal text-[#750F2C] block sm:inline">
                Your Business.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-[#6F6568] leading-relaxed pt-2">
              From software development and automation to ecommerce and digital growth,
              we build solutions around the way your business actually works.
            </p>
          </div>
          <div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group"
            >
              <span>View All 10 Capabilities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Sophisticated 2x3 Editorial Grid with Thin Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#E8DDE0]">
          {SERVICES_GRID.map((service, idx) => (
            <Link
              key={service.number}
              href={service.href}
              className={`group p-8 lg:p-10 border-r border-b border-[#E8DDE0] transition-colors duration-200 hover:bg-[#F7EEF1] flex flex-col justify-between ${
                idx % 2 === 1 ? "bg-[#FCFAF8]" : "bg-white"
              }`}
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#750F2C] block mb-6">
                  {service.number}
                </span>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#191416] group-hover:text-[#750F2C] transition-colors tracking-tight mb-3">
                  {service.title}
                </h3>

                <p className="text-sm text-[#6F6568] leading-relaxed mb-8">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E8DDE0]/60">
                <span className="text-xs font-bold text-[#750F2C] uppercase tracking-wider group-hover:text-[#52091E]">
                  Explore Service
                </span>
                <div className="w-8 h-8 rounded-full border border-[#E8DDE0] flex items-center justify-center text-[#191416] group-hover:border-[#750F2C] group-hover:text-[#750F2C] group-hover:translate-x-1 transition-all bg-white">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
