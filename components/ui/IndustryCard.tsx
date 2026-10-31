import React from "react";
import { LucideIcon } from "lucide-react";

interface IndustryCardProps {
  title: string;
  subsectors: string[];
  icon: LucideIcon;
}

export default function IndustryCard({
  title,
  subsectors,
  icon: Icon,
}: IndustryCardProps) {
  return (
    <div className="group relative bg-white rounded-xl p-6 sm:p-7 border border-[#E8DDE0] hover:border-[#750F2C]/50 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(117,15,44,0.05)] hover:-translate-y-0.5">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-11 h-11 rounded-lg bg-[#F7EEF1] text-[#750F2C] flex items-center justify-center border border-[#E8DDE0]/50 transition-colors duration-200 group-hover:bg-[#750F2C] group-hover:text-white">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[#191416] group-hover:text-[#750F2C] transition-colors">
          {title}
        </h3>
      </div>

      <div className="space-y-2 pt-2 border-t border-[#F2E8EB]">
        {subsectors.map((sector, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 text-xs sm:text-sm text-[#6F6568]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C99A3D]" />
            <span>{sector}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
