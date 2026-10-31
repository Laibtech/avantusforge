import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const INDUSTRIES = [
  {
    name: "Healthcare",
    description: "Clinics · Pharmacies · Medical Businesses",
  },
  {
    name: "Real Estate",
    description: "Agencies · Property Management · Developers",
  },
  {
    name: "Education",
    description: "Academies · Training Centers · Institutes",
  },
  {
    name: "Professional Services",
    description: "Accountants · Consultants · Agencies",
  },
  {
    name: "Retail & Ecommerce",
    description: "Brands · Online Stores · D2C",
  },
  {
    name: "Hospitality & Events",
    description: "Restaurants · Farmhouses · Event Businesses",
  },
];

export default function IndustriesRows() {
  return (
    <section className="py-24 md:py-32 bg-white border-b border-[#E8DDE0]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Industries
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
              Solutions for Businesses{" "}
              <span className="font-serif italic font-normal text-[#750F2C]">
                That Want to Scale.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-[#6F6568] leading-relaxed pt-2">
              We work with businesses across multiple industries, adapting technology
              to their unique operational challenges.
            </p>
          </div>
          <div>
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group"
            >
              <span>Explore All Industries</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 2-Column Editorial Rows with Hover Background Transition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 border-t border-[#E8DDE0]">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.name}
              href="/industries"
              className="group flex items-center justify-between py-8 px-6 -mx-6 border-b border-[#E8DDE0] transition-all duration-200 hover:bg-[#750F2C] rounded-xs"
            >
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#191416] group-hover:text-white transition-colors tracking-tight">
                  {ind.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#6F6568] group-hover:text-[#FCFAF8]/80 transition-colors">
                  {ind.description}
                </p>
              </div>

              <div className="w-9 h-9 rounded-full border border-[#E8DDE0] flex items-center justify-center text-[#191416] group-hover:border-white/40 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 bg-white group-hover:bg-[#52091E]">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
