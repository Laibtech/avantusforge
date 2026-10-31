"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Layers, Store } from "lucide-react";

interface CaseStudyCardProps {
  title: string;
  category: string;
  description: string;
  imageSrc?: string;
  slug?: string;
  projectType: "ecommerce" | "luxury-store" | "marketplace";
  tags?: string[];
}

export default function CaseStudyCard({
  title,
  category,
  description,
  imageSrc,
  slug = "/work",
  projectType,
  tags = [],
}: CaseStudyCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8DDE0] hover:border-[#750F2C]/40 transition-all duration-300 hover:shadow-[0_16px_36px_rgba(117,15,44,0.08)]">
      {/* Visual Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F7EEF1] border-b border-[#E8DDE0]">
        {imageSrc && !imageError ? (
          <Image
            src={imageSrc}
            alt={`${title} Case Study`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-fidelity custom tech UI placeholder */
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 bg-gradient-to-br from-[#FCFAF8] via-[#F7EEF1] to-[#E8DDE0]/30 transition-transform duration-500 group-hover:scale-102">
            {/* Top Mockup Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8DDE0]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8DDE0]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8DDE0]" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#E8DDE0] text-[11px] font-mono text-[#6F6568]">
                {projectType === "ecommerce" && <ShoppingBag className="w-3 h-3 text-[#750F2C]" />}
                {projectType === "luxury-store" && <Store className="w-3 h-3 text-[#C99A3D]" />}
                {projectType === "marketplace" && <Layers className="w-3 h-3 text-[#750F2C]" />}
                <span>{title.toLowerCase()}.com</span>
              </div>
            </div>

            {/* Mockup Center Interface */}
            <div className="my-auto py-2">
              <div className="bg-white/95 rounded-xl p-5 border border-[#E8DDE0] shadow-sm max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-3 w-20 bg-[#750F2C]/20 rounded-full" />
                  <div className="h-2.5 w-12 bg-[#C99A3D]/40 rounded-full" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-2 w-full bg-[#E8DDE0]/60 rounded-full" />
                  <div className="h-2 w-4/5 bg-[#E8DDE0]/40 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-[4/3] rounded-md bg-[#F7EEF1] border border-[#E8DDE0]/40 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-[#750F2C]">Catalog</span>
                  </div>
                  <div className="aspect-[4/3] rounded-md bg-[#F7EEF1] border border-[#E8DDE0]/40 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-[#750F2C]">Checkout</span>
                  </div>
                  <div className="aspect-[4/3] rounded-md bg-[#F7EEF1] border border-[#E8DDE0]/40 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-[#750F2C]">Sync</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sub-indicator */}
            <div className="flex items-center justify-between text-[11px] text-[#6F6568]">
              <span className="font-semibold text-[#750F2C] tracking-wider uppercase">Production Architecture</span>
              <span className="font-mono text-[10px]">VERIFIED STACK</span>
            </div>
          </div>
        )}

        {/* Subtle Burgundy Tint Overlay on Hover */}
        <div className="absolute inset-0 bg-[#750F2C]/0 group-hover:bg-[#750F2C]/5 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-6 sm:p-8 justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C99A3D]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#750F2C]">
              {category}
            </span>
          </div>

          {/* Project Title */}
          <h3 className="text-2xl font-bold text-[#191416] mb-3 group-hover:text-[#750F2C] transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed text-[#6F6568] mb-5">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#F7EEF1] text-[#750F2C] border border-[#E8DDE0]/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA Link */}
        <div className="pt-4 border-t border-[#F2E8EB]">
          <Link
            href={slug}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#750F2C] group-hover:text-[#52091E] transition-colors"
          >
            <span>View Case Study</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#C99A3D]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
