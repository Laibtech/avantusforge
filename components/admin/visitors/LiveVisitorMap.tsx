"use client";

import React, { useState } from "react";
import { Globe, MapPin, ZoomIn, ZoomOut, RotateCcw, Activity } from "lucide-react";

interface CountryStat {
  country: string;
  countryCode: string;
  flag: string;
  count: number;
  percentage: number;
}

interface CityStat {
  city: string;
  country: string;
  flag: string;
  count: number;
}

interface LiveVisitorMapProps {
  topCountries: CountryStat[];
  topCities: CityStat[];
  activeNow: number;
  selectedCountry?: string;
  onSelectCountry: (countryCode: string | null) => void;
}

// Approximate SVG centroid coordinates (width=950, height=480) for major nations
const COUNTRY_COORDINATES: Record<string, { x: number; y: number; name: string }> = {
  US: { x: 210, y: 175, name: "United States" },
  CA: { x: 230, y: 110, name: "Canada" },
  MX: { x: 195, y: 230, name: "Mexico" },
  BR: { x: 340, y: 330, name: "Brazil" },
  AR: { x: 310, y: 400, name: "Argentina" },
  GB: { x: 470, y: 135, name: "United Kingdom" },
  IE: { x: 455, y: 135, name: "Ireland" },
  DE: { x: 500, y: 140, name: "Germany" },
  FR: { x: 480, y: 160, name: "France" },
  ES: { x: 465, y: 185, name: "Spain" },
  IT: { x: 505, y: 175, name: "Italy" },
  NL: { x: 488, y: 136, name: "Netherlands" },
  SE: { x: 515, y: 100, name: "Sweden" },
  NO: { x: 495, y: 95, name: "Norway" },
  CH: { x: 495, y: 160, name: "Switzerland" },
  TR: { x: 560, y: 180, name: "Turkey" },
  AE: { x: 625, y: 220, name: "United Arab Emirates" },
  SA: { x: 590, y: 230, name: "Saudi Arabia" },
  QA: { x: 618, y: 222, name: "Qatar" },
  KW: { x: 605, y: 208, name: "Kuwait" },
  OM: { x: 635, y: 238, name: "Oman" },
  PK: { x: 655, y: 200, name: "Pakistan" },
  IN: { x: 685, y: 235, name: "India" },
  SG: { x: 745, y: 300, name: "Singapore" },
  MY: { x: 738, y: 285, name: "Malaysia" },
  ID: { x: 775, y: 325, name: "Indonesia" },
  CN: { x: 730, y: 180, name: "China" },
  JP: { x: 825, y: 175, name: "Japan" },
  AU: { x: 810, y: 375, name: "Australia" },
  NZ: { x: 890, y: 430, name: "New Zealand" },
  ZA: { x: 525, y: 380, name: "South Africa" },
  EG: { x: 540, y: 215, name: "Egypt" },
  NG: { x: 485, y: 265, name: "Nigeria" },
  LOC: { x: 470, y: 135, name: "Local Dev" },
};

export default function LiveVisitorMap({
  topCountries,
  topCities,
  activeNow,
  selectedCountry,
  onSelectCountry,
}: LiveVisitorMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryStat | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Look up country stats by code
  const countryDataMap = new Map<string, CountryStat>();
  topCountries.forEach((c) => countryDataMap.set(c.countryCode.toUpperCase(), c));

  const maxCount = Math.max(...topCountries.map((c) => c.count), 1);

  return (
    <div className="relative bg-white border border-[#EADFE3] rounded-2xl p-5 shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden">
      {/* Top Map Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EADFE3]/60 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E]">
              Global Telemetry Distribution
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#159B70] border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159B70] animate-pulse" />
              Live Active Nodes
            </span>
          </div>
          <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">
            Interactive Worldwide Traffic Map
          </h3>
          <p className="text-xs text-[#777078]">
            Approximate country and metropolitan traffic nodes derived from privacy-preserving IP telemetry.
          </p>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-2">
          {selectedCountry && (
            <button
              type="button"
              onClick={() => onSelectCountry(null)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] hover:bg-[#F2ECEF] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter ({selectedCountry})</span>
            </button>
          )}

          <div className="flex items-center bg-[#FAF7F7] border border-[#EADFE3] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
              title="Zoom In"
              className="p-1.5 text-[#777078] hover:text-[#24151B] transition-colors rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 1))}
              title="Zoom Out"
              className="p-1.5 text-[#777078] hover:text-[#24151B] transition-colors rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full overflow-hidden my-2 flex items-center justify-center bg-[#FAF7F7]/60 rounded-xl border border-[#EADFE3]/50 min-h-[380px]">
        {/* SVG World Map Vector Canvas */}
        <div
          className="transition-transform duration-300 ease-out origin-center w-full max-w-[950px]"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 950 480"
            className="w-full h-auto select-none"
            style={{ filter: "drop-shadow(0 2px 4px rgba(36,21,27,0.02))" }}
          >
            {/* World Continent Outlines (Simplified high-performance SVG shapes) */}
            <g fill="#EADFE3" fillOpacity="0.45" stroke="#D1C4C9" strokeWidth="0.75" strokeLinejoin="round">
              {/* North America */}
              <path d="M 120 70 Q 180 50 250 80 Q 290 120 270 180 Q 220 230 190 250 Q 150 210 130 150 Z" />
              <path d="M 230 100 Q 280 70 330 90 Q 300 130 250 120 Z" />
              {/* South America */}
              <path d="M 270 260 Q 340 270 360 330 Q 340 420 300 450 Q 280 390 270 320 Z" />
              {/* Europe */}
              <path d="M 440 90 Q 520 80 540 120 Q 520 170 470 180 Q 430 150 440 90 Z" />
              <path d="M 450 115 Q 470 110 475 140 Q 455 145 450 115 Z" />
              {/* Africa */}
              <path d="M 440 200 Q 550 190 560 260 Q 540 370 510 420 Q 450 380 430 290 Z" />
              {/* Asia */}
              <path d="M 540 80 Q 750 60 840 120 Q 820 220 730 260 Q 640 250 570 190 Z" />
              {/* India */}
              <path d="M 660 210 Q 710 215 700 270 Q 675 285 660 235 Z" />
              {/* Southeast Asia */}
              <path d="M 720 270 Q 780 275 790 320 Q 740 340 720 290 Z" />
              {/* Australia */}
              <path d="M 770 340 Q 850 330 870 380 Q 840 430 780 420 Q 750 380 770 340 Z" />
            </g>

            {/* Minor grid lines */}
            <g stroke="#EADFE3" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6">
              <line x1="50" y1="240" x2="900" y2="240" /> {/* Equator */}
              <line x1="475" y1="40" x2="475" y2="440" /> {/* Prime Meridian */}
            </g>

            {/* Country Nodes with Heat Intensities and Markers */}
            {Object.entries(COUNTRY_COORDINATES).map(([code, coords]) => {
              const stat = countryDataMap.get(code);
              const count = stat?.count || 0;
              const isSelected = selectedCountry === code;
              const hasTraffic = count > 0;

              // Compute heat color
              const intensity = hasTraffic ? Math.min(1, count / maxCount) : 0;
              const radius = hasTraffic ? Math.max(7, Math.min(16, 7 + intensity * 9)) : 4;

              return (
                <g
                  key={code}
                  className="cursor-pointer group transition-all"
                  onClick={() => onSelectCountry(isSelected ? null : code)}
                  onMouseEnter={() => stat && setHoveredCountry(stat)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  {/* Outer pulse animation for active traffic */}
                  {hasTraffic && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={radius + 4}
                      fill={isSelected ? "#D6A45B" : "#74102E"}
                      fillOpacity={0.25}
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={radius}
                    fill={
                      isSelected
                        ? "#D6A45B"
                        : hasTraffic
                        ? "#74102E"
                        : "#A89FA3"
                    }
                    fillOpacity={hasTraffic ? 0.9 : 0.3}
                    stroke={isSelected ? "#74102E" : "#FFFFFF"}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-transform group-hover:scale-125 origin-center"
                  />

                  {/* Traffic count badge inside node if large enough */}
                  {hasTraffic && count > 0 && (
                    <text
                      x={coords.x}
                      y={coords.y + 3.5}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none select-none font-mono"
                    >
                      {count}
                    </text>
                  )}

                  {/* Country Code Label */}
                  <text
                    x={coords.x}
                    y={coords.y - radius - 3}
                    textAnchor="middle"
                    fill={hasTraffic ? "#24151B" : "#777078"}
                    fontSize={hasTraffic ? "10" : "8"}
                    fontWeight={hasTraffic ? "bold" : "normal"}
                    className="pointer-events-none select-none font-mono"
                  >
                    {code}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Tooltip upon Country Node Hover */}
        {hoveredCountry && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-[#74102E]/20 shadow-xl rounded-xl p-3 z-20 min-w-[200px] pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{hoveredCountry.flag}</span>
              <div>
                <h4 className="text-xs font-bold text-[#24151B] leading-none">
                  {hoveredCountry.country}
                </h4>
                <span className="text-[10px] font-mono text-[#777078]">
                  ISO: {hoveredCountry.countryCode}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EADFE3] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#777078]">Recorded Sessions:</span>
                <span className="font-bold text-[#74102E] font-mono">
                  {hoveredCountry.count} ({hoveredCountry.percentage}%)
                </span>
              </div>
              <div className="text-[10px] text-[#159B70] font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Click node to filter visitor logs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Strip: Top Active Countries & Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#EADFE3]/60 text-xs">
        {/* Countries Leaderboard */}
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078] block mb-2">
            Top Geographic Origin
          </span>
          <div className="flex flex-wrap gap-1.5">
            {topCountries.length === 0 ? (
              <span className="text-[#777078] text-xs">No country telemetry recorded yet.</span>
            ) : (
              topCountries.slice(0, 6).map((c) => (
                <button
                  key={c.countryCode}
                  type="button"
                  onClick={() => onSelectCountry(selectedCountry === c.countryCode ? null : c.countryCode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedCountry === c.countryCode
                      ? "bg-[#74102E] text-white border-[#74102E]"
                      : "bg-[#FAF7F7] text-[#24151B] border-[#EADFE3] hover:border-[#74102E]/40"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="font-semibold">{c.country}</span>
                  <span className="font-mono text-[10px] opacity-75">({c.count})</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Reliable Cities */}
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078] block mb-2">
            Top Metropolitan Clusters
          </span>
          <div className="flex flex-wrap gap-1.5">
            {topCities.length === 0 ? (
              <span className="text-[#777078] text-xs">Awaiting metropolitan telemetry resolution.</span>
            ) : (
              topCities.slice(0, 5).map((ct, idx) => (
                <div
                  key={`${ct.city}-${idx}`}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[#FAF7F7] text-[#24151B] border border-[#EADFE3] flex items-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 text-[#74102E]" />
                  <span className="font-medium">{ct.city}</span>
                  <span className="text-[10px] text-[#777078]">{ct.flag}</span>
                  <span className="font-mono text-[10px] font-bold text-[#74102E]">
                    {ct.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

