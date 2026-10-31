"use client";

import React from "react";
import { Users, Award, ShieldCheck } from "lucide-react";

const STATS = [
  {
    number: "50+",
    label: "Trusted Partners",
    description: "Ambitious operators and growing companies across UK, US, UAE & beyond.",
    icon: Users,
    decoration: "af-decoration--one",
  },
  {
    number: "40+",
    label: "Projects Delivered",
    description: "Custom software, high-converting storefronts, and automated platforms.",
    icon: Award,
    decoration: "af-decoration--two",
  },
  {
    number: "99.8%",
    label: "Production Reliability",
    description: "High performance architecture engineered for durability and sub-second speed.",
    icon: ShieldCheck,
    decoration: "af-rings",
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-[#FBF9F7] border-b border-[#E9DDE2]">
      <div className="max-w-[1250px] mx-auto px-6 sm:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#8A1F4D]">
            PROVEN TRACK RECORD
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111116] tracking-tight">
            Engineered for Real Impact
          </h2>
          <p className="text-sm sm:text-base text-[#68656A] leading-relaxed">
            We partner with businesses that value technical durability and measurable commercial growth.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="af-card p-8 sm:p-10 flex flex-col justify-between group cursor-default"
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div className="af-icon-badge">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8A1F4D] tracking-widest">
                    0{idx + 1}
                  </span>
                </div>

                <div className="relative z-10 mt-8 mb-4">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111116] tracking-tight leading-none block mb-2 font-display">
                    {stat.number}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#8A1F4D] tracking-tight mb-2">
                    {stat.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#68656A] leading-relaxed">
                    {stat.description}
                  </p>
                </div>

                {stat.decoration === "af-rings" ? (
                  <div className="af-rings">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                ) : (
                  <div className={stat.decoration} />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
