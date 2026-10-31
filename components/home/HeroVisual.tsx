"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function HeroVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-[360px] sm:min-h-[400px] flex items-center justify-center select-none w-full max-w-lg mx-auto">
      {/* Background Radial Orb */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[radial-gradient(circle,#FFFFFF_10%,#F7EEF1_50%,transparent_72%)] pointer-events-none -z-0" />

      {/* 3D Perspective Device */}
      <div
        className="relative z-10 w-[320px] sm:w-[420px] min-h-[240px] sm:min-h-[260px] rounded-[18px] bg-gradient-to-br from-[#2D0914] to-[#120206] p-3.5 sm:p-4 border border-[#52091E]/60 shadow-[0_25px_60px_rgba(117,15,44,0.22)] transition-transform duration-500 hover:rotate-0"
        style={{
          transform: "perspective(900px) rotateY(-7deg) rotateX(2deg)",
        }}
      >
        {/* Device Screen */}
        <div className="relative h-[200px] sm:h-[225px] rounded-[9px] bg-gradient-to-r from-white from-60% to-[#F7EEF1] to-60% overflow-hidden border border-white/20 p-4 flex flex-col justify-between">
          {/* Inner Left UI Wireframe */}
          <div className="w-[50%] space-y-2.5">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#750F2C]" />
              <span className="w-2 h-2 rounded-full bg-[#C99A3D]" />
              <span className="w-2 h-2 rounded-full bg-[#E8DDE0]" />
            </div>
            <div className="h-3 w-4/5 rounded bg-[#750F2C]/20" />
            <div className="h-2 w-full rounded bg-[#E8DDE0]" />
            <div className="h-2 w-3/4 rounded bg-[#E8DDE0]/80" />
            <div className="h-2 w-5/6 rounded bg-[#E8DDE0]/60" />

            <div className="pt-2 flex items-center gap-2">
              <div className="h-5 w-14 rounded-full bg-[#750F2C] text-white text-[8px] font-bold flex items-center justify-center">
                ACTIVE
              </div>
              <div className="h-5 w-12 rounded-full bg-[#C99A3D]/20 text-[#750F2C] text-[8px] font-semibold flex items-center justify-center">
                SYNC
              </div>
            </div>
          </div>

          {/* Inner Right Tech Graphic Card */}
          <div className="absolute right-4 top-8 sm:top-10 w-36 sm:w-44 h-24 sm:h-28 rounded-xl bg-gradient-to-br from-[#750F2C] to-[#C99A3D] p-3 text-white shadow-md flex flex-col justify-between opacity-95">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-wider">
              <span>FORGE.IO</span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono">cluster::ready</div>
              <div className="text-[9px] text-[#E1C27A]">100% throughput</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Card 1: Websites */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-20 top-6 sm:top-8 -right-2 sm:-right-4 bg-white border border-[#E8DDE0] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-[11px] font-bold text-[#191416] shadow-[0_12px_30px_rgba(117,15,44,0.12)] flex items-center gap-2"
      >
        <span className="text-sm">🌐</span>
        <span>Websites</span>
      </motion.div>

      {/* Floating Card 2: Automation */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, 6, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-20 top-28 sm:top-32 -right-4 sm:-right-8 bg-white border border-[#E8DDE0] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-[11px] font-bold text-[#191416] shadow-[0_12px_30px_rgba(117,15,44,0.12)] flex items-center gap-2"
      >
        <span className="text-sm">⚙️</span>
        <span>Automation</span>
      </motion.div>

      {/* Floating Card 3: Ecommerce */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-20 bottom-6 sm:bottom-8 -right-2 sm:-right-4 bg-white border border-[#E8DDE0] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-[11px] font-bold text-[#191416] shadow-[0_12px_30px_rgba(117,15,44,0.12)] flex items-center gap-2"
      >
        <span className="text-sm">🛒</span>
        <span>Ecommerce</span>
      </motion.div>
    </div>
  );
}
