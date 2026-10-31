import React from "react";
import type { Metadata } from "next";
import CTASection from "@/components/home/CTASection";
import WorkGallery from "@/components/work/WorkGallery";

export const metadata: Metadata = {
  title: "Selected Work & Case Studies | AvantusForge",
  description:
    "A selection of digital products, websites, e-commerce storefronts, and enterprise platforms built by AvantusForge. Proven engineering for real businesses.",
};

export default function WorkPage() {
  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {/* Editorial Page Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20 border-b border-[#E8DDE0]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="max-w-4xl space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Portfolio
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191416] tracking-tight leading-[1.08]">
              Selected Work
            </h1>
            <p className="text-lg sm:text-xl text-[#6F6568] leading-relaxed font-normal pt-1 max-w-2xl">
              A selection of digital products, websites and platforms built by AvantusForge.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Tabs & Portfolio Gallery */}
      <WorkGallery />

      {/* Global CTA */}
      <CTASection />
    </div>
  );
}
