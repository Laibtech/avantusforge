"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ServiceRowItem {
  number: string;
  title: string;
  description: string;
  href: string;
}

const SERVICES_LIST: ServiceRowItem[] = [
  {
    number: "01",
    title: "CUSTOM SOFTWARE DEVELOPMENT",
    description: "Software built around your processes, requirements and customers.",
    href: "/services/custom-software-development",
  },
  {
    number: "02",
    title: "BUSINESS AUTOMATION",
    description: "Remove repetitive work and connect the systems your team already uses.",
    href: "/services/business-automation",
  },
  {
    number: "03",
    title: "ERP & CRM SYSTEMS",
    description: "Bring operations, customers and business data into one connected system.",
    href: "/services/erp-crm",
  },
  {
    number: "04",
    title: "WEB & ECOMMERCE",
    description: "Modern websites and online stores designed around your business.",
    href: "/services/ecommerce-development",
  },
  {
    number: "05",
    title: "DIGITAL GROWTH",
    description: "SEO, content, social media and paid campaigns built around growth.",
    href: "/services/seo-digital-marketing",
  },
];

export default function EditorialServicesList() {
  return (
    <section className="py-24 border-t border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight mt-3">
              Crafted for operational precision.
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group"
          >
            <span>Explore All 10 Services</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Vertical Editorial Rows */}
        <div className="border-t border-[#E8DDE0]">
          {SERVICES_LIST.map((service) => (
            <Link
              key={service.number}
              href={service.href}
              className="group block border-b border-[#E8DDE0] py-8 sm:py-10 px-4 sm:px-8 -mx-4 sm:-mx-8 transition-colors duration-200 hover:bg-[#F7EEF1]"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center">
                {/* Number */}
                <div className="md:col-span-2 text-xs sm:text-sm font-mono font-bold text-[#750F2C]">
                  {service.number}
                </div>

                {/* Title */}
                <div className="md:col-span-5">
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-[#191416] group-hover:text-[#750F2C] transition-colors duration-150">
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="md:col-span-4">
                  <p className="text-sm text-[#6F6568] leading-relaxed group-hover:text-[#191416]/80 transition-colors">
                    {service.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="md:col-span-1 flex justify-end">
                  <div className="w-9 h-9 rounded-full border border-[#E8DDE0] flex items-center justify-center text-[#191416] group-hover:border-[#750F2C] group-hover:text-[#750F2C] group-hover:translate-x-1.5 transition-all duration-200 bg-white">
                    <ArrowRight className="w-4 h-4" />
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
