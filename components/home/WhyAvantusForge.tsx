import React from "react";
import { Briefcase, UserCheck, Shield, TrendingUp } from "lucide-react";

const PRINCIPLES = [
  {
    number: "01",
    title: "BUSINESS FIRST",
    description: "We understand the business problem before choosing the technology.",
    icon: Briefcase,
  },
  {
    number: "02",
    title: "BUILT AROUND YOU",
    description: "No unnecessary features. No one-size-fits-all systems.",
    icon: UserCheck,
  },
  {
    number: "03",
    title: "ONE PARTNER",
    description: "Strategy, design, development, ecommerce and digital growth under one roof.",
    icon: Shield,
  },
  {
    number: "04",
    title: "BUILT TO SCALE",
    description: "Solutions designed to grow with your business.",
    icon: TrendingUp,
  },
];

export default function WhyAvantusForge() {
  return (
    <section className="py-24 md:py-32 bg-white border-b border-[#E8DDE0]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4 mb-20">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
            Why AvantusForge
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
            Technology with{" "}
            <span className="font-serif italic font-normal text-[#750F2C]">
              Business Thinking Behind It.
            </span>
          </h2>
        </div>

        {/* Clean Horizontal Editorial Layout (No card-heavy UI) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 border-t border-[#E8DDE0] pt-12">
          {PRINCIPLES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.number} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-[#750F2C]">
                    {item.number}
                  </span>
                  <Icon className="w-5 h-5 text-[#6F6568]" />
                </div>

                <h3 className="text-lg font-extrabold text-[#191416] tracking-tight">
                  {item.title}
                </h3>

                <p className="text-sm text-[#6F6568] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
