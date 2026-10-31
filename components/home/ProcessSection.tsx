"use client";

import React from "react";
import Link from "next/link";
import { Compass, Lightbulb, Hammer, Rocket, TrendingUp, ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "DISCOVER",
    subtitle: "Understanding Root Problems",
    description:
      "We audit your existing workflows, interview stakeholders, and uncover operational bottlenecks before writing any code.",
    icon: Compass,
  },
  {
    number: "02",
    title: "STRATEGIZE",
    subtitle: "Architecture & Blueprint",
    description:
      "We map relational data schemas, API integration points, sprint milestones, and user experience flows with complete clarity.",
    icon: Lightbulb,
  },
  {
    number: "03",
    title: "BUILD",
    subtitle: "Production Engineering",
    description:
      "Our engineers write clean, maintainable, type-safe TypeScript codebases in disciplined sprints with peer code reviews.",
    icon: Hammer,
  },
  {
    number: "04",
    title: "LAUNCH",
    subtitle: "Zero-Downtime Deployment",
    description:
      "We execute seamless production cutovers, DNS configurations, and thorough end-to-end operational handovers.",
    icon: Rocket,
  },
  {
    number: "05",
    title: "SCALE",
    subtitle: "Continuous Optimization",
    description:
      "We monitor live telemetry, optimize performance, and iterate on features to keep your business ahead of the market.",
    icon: TrendingUp,
  },
];

export default function ProcessSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FBF9F7] border-b border-[#E9DDE2]">
      <div className="max-w-[1250px] mx-auto px-6 sm:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block text-[#8A1F4D] text-xs font-bold tracking-[0.16em] uppercase">
              HOW WE WORK
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[50px] font-extrabold text-[#111116] tracking-tight leading-[1.08]">
              A Disciplined Process for <br />
              <span className="text-[#8A1F4D]">Predictable Outcomes.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#68656A] leading-relaxed max-w-xl">
              From the initial architectural consultation to commercial launch, every milestone
              is structured to eliminate ambiguity and deliver measurable value.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/process"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A1F4D] hover:text-[#641436] group"
            >
              <span>Explore Detailed Process</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 5 Connected Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="af-card p-6 sm:p-7 flex flex-col justify-between group cursor-default relative z-10"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-[#8A1F4D] tracking-widest">
                      {step.number}
                    </span>
                    <div className="af-icon-badge w-10 h-10">
                      <Icon className="w-4 h-4 stroke-[1.8]" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#111116] tracking-tight mb-1 group-hover:text-[#8A1F4D] transition-colors">
                    {step.title}
                  </h3>
                  <span className="block text-[11px] font-bold text-[#8A1F4D] uppercase tracking-wider mb-3">
                    {step.subtitle}
                  </span>

                  <p className="text-xs text-[#68656A] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#E9DDE2]/60 flex items-center justify-between text-[11px] font-bold text-[#8A1F4D]">
                  <span>STAGE {step.number}</span>
                  <span className="af-arrow">→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
