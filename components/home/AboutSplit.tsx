import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function AboutSplit() {
  return (
    <section className="py-24 md:py-32 border-t border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Side 1: Real Studio Photo */}
          <div className="lg:col-span-6">
            <div className="relative border border-[#E8DDE0] rounded-sm overflow-hidden bg-white shadow-[0_12px_32px_rgba(25,20,22,0.05)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/images/about.jpg"
                  alt="AvantusForge Studio & Engineering Workspace"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="px-5 py-3.5 bg-white border-t border-[#E8DDE0] flex items-center justify-between text-xs text-[#6F6568]">
                <span>AvantusForge Studio</span>
                <span className="font-mono text-[11px]">Engineering &amp; Design Practice</span>
              </div>
            </div>
          </div>

          {/* Side 2: Narrative & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              About AvantusForge
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
              Technology meets{" "}
              <span className="font-serif italic font-normal text-[#750F2C]">
                business growth.
              </span>
            </h2>

            <p className="text-lg text-[#191416]/90 leading-relaxed font-normal">
              AvantusForge helps businesses turn ideas, manual processes and outdated
              digital experiences into modern systems that actually work.
            </p>

            <div className="space-y-4 text-sm text-[#6F6568] leading-relaxed pt-2">
              <p>
                We operate as a high-conviction digital consultancy and full-stack software
                engineering studio. Rather than pushing pre-packaged templates or buzzwords,
                we sit down with leadership teams, dissect technical debt, and build
                systems that last.
              </p>
              <p>
                Whether orchestrating multi-system API synchronizations, crafting high-performance
                Shopify stores, or deploying mission-critical custom portals, our ethos
                centers on durability, engineering discipline, and commercial clarity.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[#750F2C] hover:bg-[#52091E] text-white px-6 py-3 text-xs font-semibold rounded-sm transition-all duration-150 group shadow-xs hover:shadow"
              >
                <span>More About Us</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
