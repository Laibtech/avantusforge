import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TIMELINE_STEPS = [
  {
    number: "01",
    title: "DISCOVER",
    description: "Understand your business, goals and problems.",
  },
  {
    number: "02",
    title: "PLAN",
    description: "Define the right solution and roadmap.",
  },
  {
    number: "03",
    title: "DESIGN",
    description: "Create the user experience and visual direction.",
  },
  {
    number: "04",
    title: "BUILD",
    description: "Develop, integrate and test.",
  },
  {
    number: "05",
    title: "LAUNCH",
    description: "Deploy and get everything live.",
  },
  {
    number: "06",
    title: "SCALE",
    description: "Monitor, improve and evolve.",
  },
];

export default function ApproachTimeline() {
  return (
    <section className="py-24 md:py-32 bg-[#FCFAF8] border-b border-[#E8DDE0]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Our Approach
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
              From Idea to{" "}
              <span className="font-serif italic font-normal text-[#750F2C]">
                Digital Product.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-[#6F6568] leading-relaxed pt-2">
              We don&apos;t just build what you ask for. We understand how your business works,
              identify what can be improved and then build the technology around it.
            </p>
          </div>
          <div>
            <Link
              href="/process"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group"
            >
              <span>Explore Full Process</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Horizontal Editorial Timeline (NO cards) */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-[22px] left-0 right-0 h-[1px] bg-[#E8DDE0] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6 relative z-10">
            {TIMELINE_STEPS.map((step) => (
              <div key={step.number} className="space-y-4">
                {/* Node & Number */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white border border-[#E8DDE0] flex items-center justify-center font-mono text-xs font-bold text-[#750F2C] shadow-xs">
                    {step.number}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold text-[#191416] tracking-wider uppercase">
                  {step.title}
                </h3>

                {/* Small Description */}
                <p className="text-xs text-[#6F6568] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
