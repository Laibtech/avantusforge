import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Discover",
    summary: "Understand the business, users, goals and problems.",
    detail: "We audit current operational friction, study existing software tools, and identify root business requirements.",
  },
  {
    number: "02",
    title: "Define",
    summary: "Turn requirements into a clear product direction.",
    detail: "Scope specifications, database schemas, API architecture, and clear milestone deliverables.",
  },
  {
    number: "03",
    title: "Design",
    summary: "Create the structure, experience and visual system.",
    detail: "Wireframes, high-fidelity prototypes, design tokens, and rigorous mobile/desktop interface systems.",
  },
  {
    number: "04",
    title: "Build",
    summary: "Develop the actual product.",
    detail: "Clean TypeScript code, modern Next.js/React frontends, robust backends, and secure integrations.",
  },
  {
    number: "05",
    title: "Launch",
    summary: "Test, deploy and make it ready for real users.",
    detail: "Comprehensive QA, load testing, seamless data migration, and zero-downtime production deployment.",
  },
  {
    number: "06",
    title: "Improve",
    summary: "Continue refining the product based on real-world usage.",
    detail: "Post-launch analytics, performance monitoring, feature iterations, and long-term technical support.",
  },
];

export default function ProcessEditorial() {
  return (
    <section className="py-24 md:py-32 border-t border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Delivery Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight mt-3">
              From idea to working system.
            </h2>
          </div>
          <Link
            href="/process"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group"
          >
            <span>Read Process Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Visually Interesting Editorial Vertical Step Layout - NOT cards */}
        <div className="border-t border-[#E8DDE0]">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="py-10 border-b border-[#E8DDE0] grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline"
            >
              {/* Step Number */}
              <div className="md:col-span-2 text-xs font-mono font-bold text-[#750F2C]">
                {step.number}
              </div>

              {/* Step Title */}
              <div className="md:col-span-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight">
                  {step.title}
                </h3>
              </div>

              {/* Step Summary */}
              <div className="md:col-span-4">
                <p className="text-base font-semibold text-[#191416] leading-snug">
                  {step.summary}
                </p>
              </div>

              {/* Step Detail */}
              <div className="md:col-span-3">
                <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
