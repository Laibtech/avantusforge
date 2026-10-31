"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const INDUSTRIES_LIST = [
  { name: "Healthcare", description: "HIPAA-compliant portals, patient intake systems, clinical scheduling." },
  { name: "Real Estate", description: "Custom property listings, broker portals, automated lead pipelines." },
  { name: "Education", description: "LMS integrations, student enrolment workflows, resource portals." },
  { name: "Ecommerce", description: "High-volume direct-to-consumer stores, headless Shopify, multi-currency." },
  { name: "Professional Services", description: "Client onboarding systems, document automation, bespoke ERPs." },
  { name: "Hospitality", description: "Reservation management, table dispatching, guest engagement apps." },
  { name: "Retail", description: "Omnichannel inventory sync, POS data bridges, loyalty platforms." },
  { name: "Events", description: "Ticketing architecture, attendee registration, schedule management." },
];

export default function IndustriesEditorial() {
  return (
    <section className="py-24 md:py-32 border-t border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Sectors We Serve
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight mt-3">
              Built for businesses with real-world challenges.
            </h2>
          </div>
          <Link
            href="/industries"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group"
          >
            <span>Industry Solutions Breakdown</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Large Typography List with Interactive Line/Arrow */}
        <div className="border-t border-[#E8DDE0]">
          {INDUSTRIES_LIST.map((ind, index) => (
            <Link
              key={ind.name}
              href="/industries"
              className="group block border-b border-[#E8DDE0] py-7 sm:py-9 transition-colors duration-200 hover:bg-[#F7EEF1] -mx-4 sm:-mx-8 px-4 sm:px-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-baseline gap-6 sm:gap-10">
                  <span className="text-xs font-mono font-bold text-[#750F2C]">
                    0{index + 1}
                  </span>
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight group-hover:text-[#750F2C] group-hover:translate-x-1.5 transition-all duration-200">
                    {ind.name}
                  </span>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-10">
                  <span className="text-xs sm:text-sm text-[#6F6568] max-w-md text-left md:text-right hidden sm:block">
                    {ind.description}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[#E8DDE0] flex items-center justify-center text-[#191416] group-hover:border-[#750F2C] group-hover:text-[#750F2C] transition-colors shrink-0 bg-white">
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
