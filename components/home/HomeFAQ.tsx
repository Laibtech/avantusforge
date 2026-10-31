"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What type of businesses do you work with?",
    a: "We work with small to mid-market businesses, ambitious founders, and established operators across healthcare, real estate, education, luxury retail, ecommerce, and professional services who have outgrown generic tools.",
  },
  {
    q: "Can you build custom business software?",
    a: "Yes. We engineer bespoke internal platforms, customer portals, order management hubs, and multi-tenant SaaS applications tailored to your exact workflows and data models.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. Our client partnerships span the United Kingdom, United States, United Arab Emirates, Kuwait, and Pakistan, utilizing asynchronous sprint communication and scheduled video reviews.",
  },
  {
    q: "Do you provide website maintenance?",
    a: "Yes. We offer ongoing SLA-backed maintenance, server security patching, database optimization, and performance monitoring to keep systems running at peak speed.",
  },
  {
    q: "Can you manage ecommerce after launch?",
    a: "Yes. We assist brands with catalog expansions, custom Liquid section builds, checkout rate optimization, and ERP inventory synchronization.",
  },
  {
    q: "Do you provide SEO and digital marketing?",
    a: "Yes. We implement technical SEO infrastructure, Core Web Vitals optimization, structured data schemas, and high-ROI targeted paid advertising campaigns across search and social channels.",
  },
  {
    q: "How does a project start?",
    a: "Every engagement begins with an introductory discovery consultation where we audit your existing software, clarify operational goals, and provide a clear architectural scope with milestone timelines.",
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 md:py-28 bg-[#FBF9F7] border-b border-[#E9DDE2]">
      <div className="max-w-[1250px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8A1F4D]">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111116] tracking-tight leading-[1.12]">
              Got Questions? <br />
              <span className="text-[#8A1F4D]">
                Clear Answers.
              </span>
            </h2>
            <p className="text-base text-[#68656A] leading-relaxed pt-2">
              Straightforward answers about our engineering capabilities, client
              onboarding, and delivery processes.
            </p>
          </div>

          {/* Right Column: Clean Accordion with Thin Borders & Minimal Plus Icon */}
          <div className="lg:col-span-7 border-t border-[#E9DDE2]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="border-b border-[#E9DDE2]">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full py-6 flex items-center justify-between text-left group focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-[#111116] group-hover:text-[#8A1F4D] transition-colors pr-4">
                      {item.q}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-[#E9DDE2] flex items-center justify-center text-[#111116] group-hover:border-[#8A1F4D] group-hover:text-[#8A1F4D] transition-colors shrink-0 bg-white">
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pb-6 pr-8 text-sm text-[#68656A] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
