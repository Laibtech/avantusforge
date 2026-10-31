import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-[#FCFAF8] min-h-[70vh] flex items-center justify-center py-24">
      <div className="max-w-xl mx-auto px-6 sm:px-8 text-center space-y-6">
        <span className="text-xs font-mono font-bold text-[#750F2C] tracking-widest uppercase">
          404 / Page Not Found
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#191416] tracking-tight">
          The requested system route does not exist.
        </h1>
        <p className="text-sm sm:text-base text-[#6F6568] leading-relaxed">
          The page you are looking for has been relocated, archived, or is temporarily
          unavailable. Please return to the studio homepage or reach out directly.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#750F2C] hover:bg-[#52091E] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-all shadow-xs"
          >
            <span>Return to Homepage</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 border border-[#E8DDE0] hover:bg-black/5 text-[#191416] px-7 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
          >
            <span>View All Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
