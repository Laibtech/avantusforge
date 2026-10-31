import React from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const PROBLEMS = [
  {
    icon: "⚙",
    title: "Manual Processes",
    lead: "Too much repetitive work?",
    action: "We automate it →",
    href: "/services#automation",
  },
  {
    icon: "▣",
    title: "Outdated Digital Presence",
    lead: "Website not converting?",
    action: "We rebuild it →",
    href: "/services#websites",
  },
  {
    icon: "◉",
    title: "Disconnected Systems",
    lead: "Data scattered everywhere?",
    action: "We connect it →",
    href: "/services#systems",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 sm:py-24 bg-white border-b border-[#E8DDE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <div className="text-[10px] sm:text-xs font-extrabold tracking-[1.5px] uppercase text-[#750F2C] mb-3">
                The Right Technology
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191416] tracking-tight leading-tight">
                Your business doesn&apos;t need more technology.
                <br />
                It needs the{" "}
                <span className="text-[#750F2C]">right technology.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6F6568] max-w-sm leading-relaxed">
              We help businesses solve real problems with practical, scalable and
              future-ready digital solutions. No fluff, just technology that works.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROBLEMS.map((card, idx) => (
            <Reveal key={card.title} delay={0.1 * (idx + 1)}>
              <Link
                href={card.href}
                className="group block bg-white rounded-lg p-7 border border-[#E8DDE0] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(117,15,44,0.08)] hover:border-[#750F2C]/40"
              >
                <div className="w-10 h-10 rounded-full bg-[#F7EEF1] text-[#750F2C] flex items-center justify-center text-lg mb-4.5 group-hover:bg-[#750F2C] group-hover:text-white transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-[#191416] mb-2 group-hover:text-[#750F2C] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-[#6F6568] mb-2">{card.lead}</p>
                <p className="text-xs font-bold text-[#750F2C] group-hover:underline">
                  {card.action}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
