"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ProblemCard {
  number: string;
  tag: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
  bgImage: string;
  bgAlt: string;
  icon: React.ReactNode;
  decorationClass: string;
}

const CARDS: ProblemCard[] = [
  {
    number: "01",
    tag: "MANUAL PROCESSES",
    title: "Too much repetitive work?",
    description: "We automate workflows that slow your team down.",
    linkText: "EXPLORE AUTOMATION",
    href: "/services/business-automation",
    bgImage: "/images/card-automation.webp",
    bgAlt: "Workflow Automation Pipeline & Systems",
    decorationClass: "af-decoration--one",
    icon: (
      <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
        <path d="M11 8h2M16 11v2" />
      </svg>
    ),
  },
  {
    number: "02",
    tag: "OUTDATED DIGITAL PRESENCE",
    title: "Website not converting?",
    description: "We rebuild digital experiences around your customers.",
    linkText: "EXPLORE WEB",
    href: "/services/web-development",
    bgImage: "/images/card-web.webp",
    bgAlt: "High-Converting Digital Commerce & Modern Web",
    decorationClass: "af-decoration--two",
    icon: (
      <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
        <path d="M4 7l8-4 8 4-8 4-8-4Z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 17l8 4 8-4" />
      </svg>
    ),
  },
  {
    number: "03",
    tag: "DISCONNECTED SYSTEMS",
    title: "Data scattered everywhere?",
    description: "We connect tools, operations and business systems.",
    linkText: "EXPLORE SOFTWARE",
    href: "/services/custom-software-development",
    bgImage: "/images/card-software-nexus.webp",
    bgAlt: "Nexus Data Ops - Connected Enterprise Systems & Architecture",
    decorationClass: "af-rings",
    icon: (
      <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
      </svg>
    ),
  },
];

export default function BusinessProblems() {
  return (
    <section className="py-20 md:py-28 bg-[#FBF9F7] border-b border-[#E9DDE2] relative overflow-hidden">
      {/* Ambient Burgundy Glow Background Accents */}
      <div className="absolute top-10 right-1/4 w-[540px] h-[380px] bg-gradient-to-b from-[#8A1F4D]/[0.05] via-[#8A1F4D]/[0.018] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-[480px] h-[360px] bg-gradient-to-tr from-[#750F2C]/[0.045] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Heading */}
        <div className="max-w-[720px] mb-14">
          <div className="inline-flex items-center gap-2 mb-3.5 px-3 py-1 rounded-full bg-[#8A1F4D]/[0.07] border border-[#8A1F4D]/15 text-[#8A1F4D] text-xs font-bold tracking-[0.16em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A1F4D] animate-pulse" />
            WHAT WE SOLVE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[54px] font-extrabold text-[#111116] tracking-tight leading-[1.05] mb-4">
            Digital problems.<br />
            <span className="bg-gradient-to-r from-[#8A1F4D] via-[#A3285D] to-[#641436] bg-clip-text text-transparent">
              Built into better solutions.
            </span>
          </h2>
          <p className="max-w-[590px] text-base sm:text-lg text-[#68656A] leading-relaxed font-normal">
            We help modern businesses simplify operations, improve digital
            experiences and build systems that scale.
          </p>
        </div>

        {/* Card Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((card, idx) => (
            <Link
              key={card.number}
              href={card.href}
              className={`af-card p-8 sm:p-9 flex flex-col min-h-[390px] justify-between group cursor-pointer relative overflow-hidden transition-all duration-500 hover:border-[#8A1F4D]/40 hover:shadow-[0_22px_55px_rgba(138,31,77,0.14)] ${
                idx === 2 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Sleek Top Burgundy Accent Line on Hover */}
              <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#8A1F4D]/30 to-transparent group-hover:via-[#8A1F4D] transition-all duration-500 z-20" />

              {/* Themed Background Image Layer - Crisp, Distinct & Visible */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[18px]">
                <Image
                  src={card.bgImage}
                  alt={card.bgAlt}
                  fill
                  className="object-cover object-[78%_center] transition-all duration-700 ease-out group-hover:scale-106 opacity-85 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={idx < 3}
                />
                {/* Soft directional backdrop: Solid crisp white on left behind text, tapering away to reveal the image on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 via-35% to-white/5 group-hover:to-transparent transition-opacity duration-500" />
                {/* Subtle bottom fade to guarantee 100% CTA text contrast */}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none" />

                {/* Subtle Burgundy Corner Ambient Glow on Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8A1F4D]/[0.015] via-transparent to-[#8A1F4D]/[0.05] group-hover:to-[#8A1F4D]/[0.10] transition-colors duration-500" />
              </div>

              {/* Top Row: Number Badge & Icon Badge */}
              <div className="relative z-10 flex items-start justify-between">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#8A1F4D]/[0.08] border border-[#8A1F4D]/15 text-xs font-bold tracking-wider text-[#8A1F4D] group-hover:bg-[#8A1F4D] group-hover:text-white transition-colors duration-300">
                  {card.number}
                </span>
                <div className="af-icon-badge group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
              </div>

              {/* Middle Content */}
              <div className="relative z-10 mt-10 mb-auto">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A1F4D] mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A1F4D]/50 group-hover:bg-[#8A1F4D] transition-colors" />
                  {card.tag}
                </span>
                <h3 className="text-2xl sm:text-[26px] font-bold text-[#111116] group-hover:text-[#210611] tracking-tight leading-snug mb-3 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm sm:text-base text-[#68656A] leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Bottom Row: CTA & Arrow */}
              <div className="relative z-10 pt-6 mt-4 border-t border-[#E9DDE2]/70 group-hover:border-[#8A1F4D]/30 transition-colors flex items-center justify-between text-xs font-extrabold tracking-wider uppercase text-[#8A1F4D]">
                <span className="group-hover:tracking-widest transition-all duration-300">{card.linkText}</span>
                <span className="af-arrow text-lg leading-none">→</span>
              </div>

              {/* Decorative Subtle Geometry */}
              {card.decorationClass === "af-rings" ? (
                <div className="af-rings">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <div className={card.decorationClass} />
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
