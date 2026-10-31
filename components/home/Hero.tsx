"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-[#FBF9F7]">
      {/* Background Subtle Burgundy Abstract Geometry */}
      <div className="absolute top-1/2 right-[-100px] w-[500px] h-[500px] rounded-full border border-[#8A1F4D]/10 pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-[-40px] w-[380px] h-[380px] rounded-full border border-[#8A1F4D]/[0.07] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-[20px] w-[260px] h-[260px] rounded-full border border-[#8A1F4D]/[0.05] pointer-events-none -translate-y-1/2" />

      <div className="max-w-[1250px] mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Typography & Call to Action (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7EAF0] border border-[#8A1F4D]/15 text-[#8A1F4D] text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#8A1F4D]" />
              <span>Modern Digital Engineering &amp; Growth</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-[#111116] tracking-tight leading-[1.04]">
              We Build Scalable Digital Solutions for Modern Businesses
            </h1>

            <p className="text-base sm:text-lg text-[#68656A] leading-relaxed max-w-2xl font-normal pt-1">
              AvantusForge builds high performance websites, e-commerce stores, and custom web
              applications that attract visitors, build trust, and convert them into paying
              customers engineered for growth, not just aesthetics.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2.5 bg-[#8A1F4D] hover:bg-[#641436] text-white px-8 py-4 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-200 shadow-[0_8px_20px_rgba(138,31,77,0.2)] hover:shadow-[0_12px_28px_rgba(138,31,77,0.3)] hover:-translate-y-0.5 group cursor-pointer"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F7EAF0]/40 text-[#111116] hover:text-[#8A1F4D] border border-[#E9DDE2] hover:border-[#8A1F4D]/40 px-8 py-4 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-200 shadow-xs cursor-pointer"
              >
                <span>Explore Services</span>
              </Link>
            </div>

            {/* Quick Trust Badges */}
            <div className="pt-8 border-t border-[#E9DDE2] grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-[#111116] text-sm block">100% Custom</span>
                <span className="text-[#68656A] text-[11px] block">Zero generic templates</span>
              </div>
              <div className="space-y-1 border-l border-[#E9DDE2] pl-4">
                <span className="font-extrabold text-[#111116] text-sm block">Sub-Second</span>
                <span className="text-[#68656A] text-[11px] block">High performance speed</span>
              </div>
              <div className="space-y-1 border-l border-[#E9DDE2] pl-4">
                <span className="font-extrabold text-[#111116] text-sm block">Turnkey Growth</span>
                <span className="text-[#68656A] text-[11px] block">Strategy to execution</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Hero Visual Card System (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Main Interactive Showcase Card */}
            <div className="af-card p-7 sm:p-8 space-y-6 relative z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E9DDE2]">
                <div className="flex items-center gap-3">
                  <div className="af-icon-badge">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8A1F4D] block">
                      AvantusForge Engine
                    </span>
                    <h3 className="text-base font-bold text-[#111116] tracking-tight">
                      Enterprise Architecture
                    </h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#8A1F4D] bg-[#F7EAF0] px-2.5 py-1 rounded-full border border-[#8A1F4D]/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A1F4D] animate-pulse" />
                  Active Sprints
                </span>
              </div>

              {/* Capabilities Stack */}
              <div className="space-y-3">
                <div className="bg-[#FBF9F7] border border-[#E9DDE2] p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#8A1F4D]" />
                    <span className="text-xs font-semibold text-[#111116]">High Performance Websites</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#8A1F4D]">Shopify &amp; Next.js</span>
                </div>

                <div className="bg-[#FBF9F7] border border-[#E9DDE2] p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#8A1F4D]" />
                    <span className="text-xs font-semibold text-[#111116]">Custom Web Applications</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#8A1F4D]">Tailored ERP / SaaS</span>
                </div>

                <div className="bg-[#FBF9F7] border border-[#E9DDE2] p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#8A1F4D]" />
                    <span className="text-xs font-semibold text-[#111116]">Business Automation</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#8A1F4D]">Zero Repetitive Work</span>
                </div>
              </div>

              {/* Card Footer Metric */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E9DDE2]/70">
                <div className="flex items-center gap-2 text-[#68656A]">
                  <CheckCircle2 className="w-4 h-4 text-[#8A1F4D]" />
                  <span>Production-Ready Engineering</span>
                </div>
                <Link
                  href="/work"
                  className="font-bold text-[#8A1F4D] hover:text-[#641436] inline-flex items-center gap-1 group/lnk"
                >
                  <span>Our Work</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/lnk:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Decorative Burgundy Rings */}
              <div className="af-rings">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            {/* Small Floating Accent Card */}
            <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white border border-[#E9DDE2] rounded-2xl p-4 shadow-[0_12px_30px_rgba(73,18,43,0.08)] items-center gap-3 z-20">
              <div className="w-10 h-10 rounded-full bg-[#8A1F4D] text-white flex items-center justify-center font-extrabold text-xs">
                99%
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#111116] block">Conversion Driven</span>
                <span className="text-[10px] text-[#68656A] block">Engineered for real ROI</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
