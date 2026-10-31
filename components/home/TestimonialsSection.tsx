"use client";

import React from "react";
import { Quote } from "lucide-react";

interface TestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  role: string;
  company: string;
  initials: string;
  decoration: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "test-01",
    quote:
      "AvantusForge engineered our custom storefront architecture and product catalog pipeline. Page speeds accelerated dramatically, and our checkout completion improved within the first month post-launch.",
    clientName: "E-Commerce Leadership",
    role: "Digital Operations",
    company: "Caremon Direct-to-Consumer",
    initials: "CR",
    decoration: "af-decoration--one",
  },
  {
    id: "test-02",
    quote:
      "Rather than forcing off-the-shelf software, AvantusForge engineered a bespoke business management portal that automated our internal dispatch and cut repetitive administrative bottlenecks in half.",
    clientName: "Executive Director",
    role: "Workforce Systems",
    company: "Custom HRMS & Enterprise Suite",
    initials: "HR",
    decoration: "af-decoration--two",
  },
  {
    id: "test-03",
    quote:
      "Their technical precision and strategic clarity throughout development were exemplary. They built an authoritative consulting platform that seamlessly represents our advisory practices.",
    clientName: "Advisory Partner",
    role: "Corporate Strategy",
    company: "Oasis Global Consulting",
    initials: "OG",
    decoration: "af-rings",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FBF9F7] border-b border-[#E9DDE2]">
      <div className="max-w-[1250px] mx-auto px-6 sm:px-8">
        
        {/* Section Heading */}
        <div className="max-w-[720px] mb-14">
          <span className="inline-block mb-3 text-[#8A1F4D] text-xs font-bold tracking-[0.16em] uppercase">
            CLIENT PERSPECTIVES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[50px] font-extrabold text-[#111116] tracking-tight leading-[1.08] mb-4">
            Trusted by Leaders.<br />
            Proven by Results.
          </h2>
          <p className="max-w-[590px] text-base sm:text-lg text-[#68656A] leading-relaxed font-normal">
            Hear from founders, directors, and operators who partnered with AvantusForge to scale their digital infrastructure.
          </p>
        </div>

        {/* Testimonials Grid (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="af-card p-8 sm:p-9 flex flex-col justify-between group min-h-[380px]"
            >
              {/* Top: Large subtle burgundy quotation mark & Monogram */}
              <div className="relative z-10 flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-[#F7EAF0] flex items-center justify-center text-[#8A1F4D] transition-transform duration-300 group-hover:scale-105">
                  <Quote className="w-5 h-5 fill-[#8A1F4D]/20 text-[#8A1F4D]" />
                </div>
                <div className="w-10 h-10 rounded-full border border-[#E9DDE2] bg-[#FBF9F7] flex items-center justify-center text-xs font-bold text-[#8A1F4D] font-mono">
                  {t.initials}
                </div>
              </div>

              {/* Quote Content */}
              <div className="relative z-10 mb-8">
                <p className="text-sm sm:text-[15px] text-[#111116] font-medium leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Client Info */}
              <div className="relative z-10 pt-5 border-t border-[#E9DDE2]/70">
                <h4 className="text-sm font-bold text-[#111116] tracking-tight">
                  {t.clientName}
                </h4>
                <p className="text-xs text-[#8A1F4D] font-semibold mt-0.5">
                  {t.role} &bull; {t.company}
                </p>
              </div>

              {/* Decorative Subtle Geometry */}
              {t.decoration === "af-rings" ? (
                <div className="af-rings">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <div className={t.decoration} />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
