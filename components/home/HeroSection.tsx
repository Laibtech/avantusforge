"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface ServiceCard {
  title: string;
  description: string;
  linkHref: string;
  linkText: string;
  imageSrc: string;
  imageAlt: string;
}

const SERVICE_CARDS: ServiceCard[] = [
  {
    title: "Custom Software",
    description:
      "Tailored enterprise applications, custom CRM/ERP platforms, and automated workflow pipelines engineered for commercial scale.",
    linkHref: "/services/custom-software-development",
    linkText: "Explore Custom Software",
    imageSrc: "/images/hero-custom-software.jpg",
    imageAlt: "Custom software development analytics dashboard displayed on laptop in modern office",
  },
  {
    title: "Ecommerce Solutions",
    description:
      "High-converting digital storefronts, bespoke Shopify Plus architectures, and multi-channel marketplace acceleration.",
    linkHref: "/services/ecommerce-development",
    linkText: "Explore Ecommerce Solutions",
    imageSrc: "/images/hero-ecommerce.jpg",
    imageAlt: "Polished ecommerce storefront with lifestyle products displayed on desktop monitor",
  },
  {
    title: "Mobile Apps",
    description:
      "Native and cross-platform iOS & Android mobile applications engineered with responsive UX and cloud synchronization.",
    linkHref: "/services/mobile-app-development",
    linkText: "Explore Mobile Apps",
    imageSrc: "/images/hero-mobile-apps.jpg",
    imageAlt: "Refined modern mobile application interface displayed on premium smartphones",
  },
];

export interface HeroSectionProps {
  eyebrow?: string;
  headline?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnHref?: string;
  secondaryBtnText?: string;
  secondaryBtnHref?: string;
  cards?: ServiceCard[];
}

export default function HeroSection(props?: HeroSectionProps) {
  const eyebrow = props?.eyebrow ?? "CUSTOM SOFTWARE • WEB • DIGITAL SOLUTIONS";
  const headline = props?.headline ?? "Forging Digital Solutions That Move Your Business Forward.";
  const description =
    props?.description ??
    "We design, build, and scale high-performance custom software, bespoke ecommerce platforms, and digital operations engineered to give ambitious businesses a lasting commercial advantage.";
  const primaryBtnText = props?.primaryBtnText ?? "Start Your Project";
  const primaryBtnHref = props?.primaryBtnHref ?? "/contact";
  const secondaryBtnText = props?.secondaryBtnText ?? "Explore Our Services";
  const secondaryBtnHref = props?.secondaryBtnHref ?? "/services";
  const cards = props?.cards && props.cards.length > 0 ? props.cards : SERVICE_CARDS;

  return (
    <section className="relative bg-[#FCFAF8] pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[#E8DDE0] overflow-hidden">
      {/* Subtle ambient warm lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(117,15,44,0.035)_0%,rgba(252,250,248,0)_70%)] pointer-events-none -z-0" />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative z-10 space-y-14 sm:space-y-16">
        {/* 1. HERO TEXT & CTA BLOCK (Centered Layout) */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Label */}
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8DDE0] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#750F2C]" />
              <span className="text-[11px] font-mono font-bold tracking-[0.18em] uppercase text-[#750F2C]">
                {eyebrow}
              </span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] xl:text-[60px] font-extrabold text-[#191416] tracking-tight leading-[1.12]">
            {headline}
          </h1>

          {/* Supporting Paragraph */}
          {description && (
            <p className="text-base sm:text-lg text-[#6F6568] max-w-2xl mx-auto leading-relaxed font-normal">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryBtnText && (
              <Link
                href={primaryBtnHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#750F2C] hover:bg-[#52091E] text-white px-8 py-3.5 text-sm font-semibold rounded-full transition-all duration-200 shadow-[0_8px_20px_rgba(117,15,44,0.18)] hover:shadow-[0_12px_28px_rgba(117,15,44,0.28)] hover:-translate-y-0.5 group cursor-pointer"
              >
                <span>{primaryBtnText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {secondaryBtnText && (
              <Link
                href={secondaryBtnHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF7F4] text-[#191416] hover:text-[#750F2C] border border-[#E8DDE0] hover:border-[#750F2C]/40 px-8 py-3.5 text-sm font-semibold rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-2xs cursor-pointer"
              >
                <span>{secondaryBtnText}</span>
              </Link>
            )}
          </div>
        </div>

        {/* 2. THREE SERVICE CARDS (Equal Width, Desktop Row, Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {SERVICE_CARDS.map((card, idx) => (
            <Link
              key={card.title}
              href={card.linkHref}
              className="bg-white border border-[#E8DDE0] rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_16px_36px_rgba(25,20,22,0.08)] hover:border-[#750F2C]/30 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Rectangular Commercial Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF7F4] border-b border-[#E8DDE0]/80">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={idx === 0}
                  />
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-7 space-y-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#191416] tracking-tight group-hover:text-[#750F2C] transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-sm text-[#6F6568] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-2">
                <div className="pt-4 border-t border-[#E8DDE0]/70 flex items-center justify-between text-xs sm:text-sm font-bold text-[#750F2C]">
                  <span className="inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    <span>{card.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
