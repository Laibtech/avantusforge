import React from "react";

export default function TrustStrip() {
  return (
    <div className="bg-white border-y border-[#E8DDE0] py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
          {/* Main Title & Markets */}
          <div className="col-span-2 pr-4">
            <strong className="block text-xs sm:text-sm font-extrabold text-[#191416]">
              Built for ambitious businesses
            </strong>
            <div className="text-[11px] font-semibold text-[#6F6568] tracking-wider mt-1">
              UK &bull; USA &bull; UAE &bull; Kuwait &bull; Pakistan
            </div>
          </div>

          {/* Stat 1 */}
          <div className="border-l border-[#E8DDE0] pl-4 sm:pl-6">
            <div className="text-xl sm:text-2xl font-extrabold text-[#750F2C]">
              50+
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-[#6F6568]">
              Projects Delivered
            </div>
          </div>

          {/* Stat 2 */}
          <div className="border-l border-[#E8DDE0] pl-4 sm:pl-6">
            <div className="text-xl sm:text-2xl font-extrabold text-[#750F2C]">
              4+
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-[#6F6568]">
              Years Experience
            </div>
          </div>

          {/* Stat 3 */}
          <div className="border-l border-[#E8DDE0] pl-4 sm:pl-6">
            <div className="text-xl sm:text-2xl font-extrabold text-[#750F2C]">
              5
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-[#6F6568]">
              Markets Served
            </div>
          </div>

          {/* Stat 4 */}
          <div className="border-l border-[#E8DDE0] pl-4 sm:pl-6">
            <div className="text-xl sm:text-2xl font-extrabold text-[#750F2C]">
              24/7
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-[#6F6568]">
              Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
