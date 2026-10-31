import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  deliverables?: string[];
}

export default function ServiceCard({
  number,
  title,
  description,
  icon: Icon,
  href = "/services",
  deliverables,
}: ServiceCardProps) {
  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-xl p-7 sm:p-8 border border-[#E8DDE0] hover:border-[#750F2C]/40 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(117,15,44,0.06)] hover:-translate-y-1">
      {/* Top row: Number and Icon with subtle gold micro accent */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#F7EEF1] text-[#750F2C] flex items-center justify-center border border-[#E8DDE0]/60 transition-colors duration-300 group-hover:bg-[#750F2C] group-hover:text-white">
            <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#6F6568]/70 tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C99A3D]" />
            <span>{number}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#191416] mb-3 group-hover:text-[#750F2C] transition-colors duration-200">
          {title}
        </h3>

        <p className="text-sm sm:text-[15px] leading-relaxed text-[#6F6568] mb-6">
          {description}
        </p>

        {deliverables && deliverables.length > 0 && (
          <div className="mb-6 pt-4 border-t border-[#F2E8EB]">
            <p className="text-xs uppercase tracking-wider font-semibold text-[#6F6568] mb-2.5">
              Key Capabilities:
            </p>
            <ul className="space-y-1.5">
              {deliverables.map((item, idx) => (
                <li key={idx} className="text-xs text-[#191416]/80 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C99A3D]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link
          href={href}
          className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#750F2C] group-hover:text-[#52091E] gap-2 transition-colors"
        >
          <span>Explore Service</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 text-[#C99A3D]" />
        </Link>
      </div>
    </div>
  );
}
