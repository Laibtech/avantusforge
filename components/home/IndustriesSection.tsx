import React from "react";
import Reveal from "@/components/ui/Reveal";

const INDUSTRIES = [
  {
    icon: "♡",
    title: "Healthcare",
    desc: "Clinics • Pharmacies • Medical Businesses",
  },
  {
    icon: "⌂",
    title: "Real Estate",
    desc: "Agencies • Property Management • Developers",
  },
  {
    icon: "🎓",
    title: "Education",
    desc: "Academies • Training Centers • Institutes",
  },
  {
    icon: "▣",
    title: "Professional Services",
    desc: "Accountants • Consultants • Agencies",
  },
  {
    icon: "🛒",
    title: "Retail & Ecommerce",
    desc: "Brands • Online Stores • D2C",
  },
  {
    icon: "♧",
    title: "Hospitality & Events",
    desc: "Restaurants • Farmhouses • Event Businesses",
  },
];

export default function IndustriesSection() {
  return (
    <section className="py-20 sm:py-24 bg-[#FCFAF8] border-b border-[#E8DDE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-[10px] sm:text-xs font-extrabold tracking-[1.5px] uppercase text-[#750F2C] mb-3">
                Industries
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191416] tracking-tight leading-tight">
                Solutions for Businesses{" "}
                <span className="text-[#750F2C]">That Want to Scale</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6F6568] max-w-sm leading-relaxed">
              We work with businesses across multiple industries, understanding
              their unique challenges and goals.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {INDUSTRIES.map((ind, idx) => (
            <Reveal key={ind.title} delay={0.06 * (idx + 1)}>
              <div className="bg-white border border-[#E8DDE0] rounded-lg p-5 sm:p-6 transition-all duration-200 hover:border-[#750F2C]/50 hover:shadow-xs group">
                <h3 className="text-sm sm:text-base font-bold text-[#191416] mb-1.5 flex items-center gap-2 group-hover:text-[#750F2C] transition-colors">
                  <span className="text-[#750F2C] text-sm font-normal">
                    {ind.icon}
                  </span>
                  <span>{ind.title}</span>
                </h3>
                <p className="text-xs text-[#6F6568] leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
