import React from "react";
import { Loader2 } from "lucide-react";

export interface AdminLoadingStateProps {
  message?: string;
  className?: string;
}

export default function AdminLoadingState({
  message = "Loading data from AvantusForge Engine...",
  className = "",
}: AdminLoadingStateProps) {
  return (
    <div
      className={`py-16 sm:py-24 px-6 text-center flex flex-col items-center justify-center space-y-3.5 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-[#777078] tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}

