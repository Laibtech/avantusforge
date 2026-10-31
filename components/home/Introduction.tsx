import React from "react";

export default function Introduction() {
  return (
    <section className="py-24 md:py-32 border-t border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Label */}
          <div className="lg:col-span-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              What We Do
            </span>
          </div>

          {/* Heading and Statement */}
          <div className="lg:col-span-9 space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.15]">
              Technology built around{" "}
              <span className="font-serif italic font-normal text-[#750F2C]">
                your business.
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-[#191416]/90 leading-relaxed font-normal max-w-4xl">
              We design and build digital products, business systems and ecommerce
              experiences around the way real businesses operate.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E8DDE0] text-sm text-[#6F6568] leading-relaxed">
              <p>
                Too many companies get stuck wrestling with rigid off-the-shelf software
                or fragile disjointed tools. We forge custom architectures that solve
                actual operational bottlenecks, automate high-friction tasks, and scale
                with your commercial objectives.
              </p>
              <p>
                From bespoke internal ERPs and automated client workflows to high-volume
                Shopify stores and modern web applications, every system we deliver is
                engineered for resilience, clarity, and enduring business value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
