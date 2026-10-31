"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export interface CTASectionProps {
  eyebrow?: string;
  headline?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnHref?: string;
  secondaryBtnText?: string;
  secondaryBtnHref?: string;
}

export default function CTASection(props?: CTASectionProps) {
  const eyebrow = props?.eyebrow ?? "Let's Build Together";
  const headline =
    props?.headline ?? "Ready to Build Scalable Digital Solutions for Modern Businesses?";
  const description =
    props?.description ??
    "Turn your digital bottlenecks into high-converting web applications, resilient e-commerce platforms, and automated operations engineered for commercial scale.";
  const primaryBtnText = props?.primaryBtnText ?? "Schedule a Consultation";
  const primaryBtnHref = props?.primaryBtnHref ?? "/contact";
  const secondaryBtnText = props?.secondaryBtnText ?? "Explore Selected Work";
  const secondaryBtnHref = props?.secondaryBtnHref ?? "/work";

  return (
    <section className="py-20 md:py-28 bg-[#FBF9F7]">
      <div className="max-w-[1250px] mx-auto px-6 sm:px-8">
        {/* Large Burgundy CTA Card */}
        <div className="relative overflow-hidden rounded-[22px] bg-[#641436] border border-[#8A1F4D]/40 p-10 sm:p-14 lg:p-18 shadow-[0_24px_60px_rgba(73,18,43,0.18)]">
          {/* Soft Abstract Burgundy/Wine Concentric Circles Texture */}
          <div className="absolute -right-20 -bottom-20 w-[420px] h-[420px] rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-[300px] h-[300px] rounded-full border border-white/[0.08] pointer-events-none" />
          <div className="absolute right-6 bottom-6 w-[180px] h-[180px] rounded-full border border-white/[0.05] pointer-events-none" />

          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8A1F4D]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#F7EAF0]" />
                <span>{eyebrow}</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.08]">
              {headline}
            </h2>

            {description && (
              <p className="text-base sm:text-lg text-white/80 leading-relaxed font-normal max-w-2xl">
                {description}
              </p>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {primaryBtnText && (
                <Link
                  href={primaryBtnHref}
                  className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-[#FBF9F7] text-[#641436] px-8 py-4 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-200 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 group cursor-pointer"
                >
                  <span>{primaryBtnText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              {secondaryBtnText && (
                <Link
                  href={secondaryBtnHref}
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/20 hover:border-white/40 px-8 py-4 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <span>{secondaryBtnText}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
