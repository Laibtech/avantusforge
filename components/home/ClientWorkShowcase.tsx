import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const CLIENT_PROJECTS = [
  {
    name: "Caremon",
    category: "Holistic Wellness & Ecommerce",
    deliverables: "Bespoke e-commerce theme architecture, variant logic, sub-second checkout",
    href: "/work",
  },
  {
    name: "FAMA Bags",
    category: "Luxury Fashion & Leathercraft",
    deliverables: "Editorial digital storefront, lifestyle lookbooks, multi-currency purchasing",
    href: "/work",
  },
  {
    name: "HRMS & Business Suite",
    category: "Enterprise Software & Cloud Systems",
    deliverables: "Workforce digitized operations, payroll automation, mobile companion app",
    href: "/work",
  },
];

export default function ClientWorkShowcase() {
  return (
    <section className="py-24 md:py-32 bg-white border-b border-[#E8DDE0]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
            Client Engagements
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
            Selected Client Work.
          </h2>
          <p className="text-base sm:text-lg text-[#6F6568] leading-relaxed pt-1">
            We partner with businesses that value technical durability and thoughtful design.
            Here is a snapshot of recent production deployments.
          </p>
        </div>

        {/* Real Client Work Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#E8DDE0] pt-12">
          {CLIENT_PROJECTS.map((proj) => (
            <div
              key={proj.name}
              className="border border-[#E8DDE0] p-8 rounded-sm bg-[#FCFAF8] flex flex-col justify-between hover:border-[#750F2C]/40 transition-colors"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#750F2C] block mb-2">
                  {proj.category}
                </span>
                <h3 className="text-2xl font-extrabold text-[#191416] tracking-tight mb-4">
                  {proj.name}
                </h3>
                <div className="flex items-start gap-2.5 text-xs text-[#6F6568] leading-relaxed mb-6">
                  <CheckCircle2 className="w-4 h-4 text-[#750F2C] shrink-0 mt-0.5" />
                  <span>{proj.deliverables}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DDE0]">
                <Link
                  href="/work"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group cursor-pointer"
                >
                  <span>Explore in Work Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
