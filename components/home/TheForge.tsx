import React from "react";

const FORGE_PILLARS = [
  {
    number: "01",
    title: "Strategy",
    description: "Deep examination of business mechanics, user workflows, operational leaks, and commercial objectives before a single line of code is written.",
  },
  {
    number: "02",
    title: "Design",
    description: "Human-centric interface architecture, design systems, and frictionless conversion paths prioritizing functional clarity over superficial decoration.",
  },
  {
    number: "03",
    title: "Development",
    description: "Clean, maintainable, modern full-stack engineering. Robust TypeScript codebases, high-speed APIs, and scalable database architectures.",
  },
  {
    number: "04",
    title: "Automation",
    description: "Elimination of repetitive manual labour through seamless API bridges, CRM synchronization, and automated backend operational tasks.",
  },
  {
    number: "05",
    title: "Growth",
    description: "Continuous performance audits, technical SEO infrastructure, conversion rate optimization, and scalable long-term technical evolution.",
  },
];

export default function TheForge() {
  return (
    <section className="py-24 md:py-32 border-t border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              The Forge
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
              We don&apos;t just build websites.{" "}
              <span className="font-serif italic font-normal text-[#750F2C] block mt-1">
                We understand the business behind them.
              </span>
            </h2>
            <p className="text-base text-[#6F6568] leading-relaxed max-w-md pt-2">
              Every system built by AvantusForge is crafted with an engineering mindset
              and a commercial focus. We bridge the gap between technical execution
              and measurable business outcomes.
            </p>
          </div>

          {/* Right Column: Large Typography Timeline / List */}
          <div className="lg:col-span-7">
            <div className="border-t border-[#E8DDE0]">
              {FORGE_PILLARS.map((pillar) => (
                <div
                  key={pillar.number}
                  className="py-8 border-b border-[#E8DDE0] grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline"
                >
                  <div className="sm:col-span-2 text-xs font-mono font-bold text-[#750F2C]">
                    {pillar.number}
                  </div>
                  <div className="sm:col-span-4 text-2xl font-extrabold text-[#191416] tracking-tight">
                    {pillar.title}
                  </div>
                  <div className="sm:col-span-6 text-sm text-[#6F6568] leading-relaxed">
                    {pillar.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
