import React from "react";
import Image from "next/image";

const MARKETS = [
  { country: "United Kingdom", tag: "UK", flag: "/flags/gb.svg" },
  { country: "United States", tag: "USA", flag: "/flags/us.svg" },
  { country: "United Arab Emirates", tag: "UAE", flag: "/flags/ae.svg" },
  { country: "Kuwait", tag: "KW", flag: "/flags/kw.svg" },
  { country: "Pakistan", tag: "PK", flag: "/flags/pk.svg" },
];

const CAPABILITIES = [
  "Custom Software",
  "Ecommerce & Shopify",
  "Business Automation",
  "ERP & CRM Systems",
  "Amazon Growth & FBA",
];

export default function TrustBusinessStrip() {
  return (
    <section className="bg-white py-12 border-b border-[#E8DDE0]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading and Markets */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Global Presence
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#191416] tracking-tight">
              Built for ambitious businesses.
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#6F6568] mr-2">Active client markets:</span>
              {MARKETS.map((m) => (
                <span
                  key={m.country}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FCFAF8] border border-[#E8DDE0] text-[11px] font-semibold text-[#191416] rounded-md shadow-xs hover:border-[#750F2C]/30 transition-colors"
                >
                  <span className="relative w-4 h-3 overflow-hidden rounded-[2px] border border-black/10 shrink-0">
                    <Image
                      src={m.flag}
                      alt={`${m.country} flag`}
                      fill
                      className="object-cover"
                      sizes="16px"
                    />
                  </span>
                  <span>{m.country}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Factual Capability Statements */}
          <div className="lg:col-span-6 lg:border-l lg:border-[#E8DDE0] lg:pl-10">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6F6568] block mb-2">
              Core Engineering Focus
            </span>
            <div className="flex flex-wrap gap-2">
              {CAPABILITIES.map((cap) => (
                <span
                  key={cap}
                  className="text-xs font-medium text-[#191416] bg-[#F7EEF1] border border-[#E8DDE0]/60 px-3 py-1.5 rounded-md"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
