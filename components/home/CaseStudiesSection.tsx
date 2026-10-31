import React from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

const PROJECTS = [
  {
    title: "Caremon",
    tag: "Shopify Development",
    desc: "Shopify Development • Conversion Optimization • Social Media • Paid Advertising",
    imageText: "CAREMON",
    imageSrc: "/projects/caremon.png",
    imageBg: "bg-gradient-to-br from-[#750F2C] to-[#52091E] text-white",
    slug: "/work#caremon",
  },
  {
    title: "FAMA Bags",
    tag: "Shopify • Ecommerce • Marketing",
    desc: "Shopify Development • Meta Ads • Creative Strategy • Brand Growth",
    imageText: "FAMA Bags",
    imageSrc: "/projects/fama.png",
    imageBg: "bg-gradient-to-br from-[#F7EEF1] to-[#E8DDE0] text-[#191416]",
    slug: "/work#fama",
  },
  {
    title: "Safyrah",
    tag: "Pret Apparel • Modest Fashion • Ecommerce",
    desc: "Bespoke Shopify Storefront • Dynamic Variant Filters • Live Inventory Sync",
    imageText: "SAFYRAH",
    imageSrc: "/projects/safyrah.png",
    imageBg: "bg-gradient-to-br from-[#750F2C] to-[#52091E] text-white",
    slug: "https://safyrah.com/",
  },
];

export default function CaseStudiesSection() {
  return (
    <section id="work" className="py-20 sm:py-24 bg-white border-b border-[#E8DDE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-[10px] sm:text-xs font-extrabold tracking-[1.5px] uppercase text-[#750F2C] mb-3">
                Our Work
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#191416] tracking-tight leading-tight">
                Built. <span className="text-[#750F2C]">Launched. Growing.</span>
              </h2>
            </div>
            <Link
              href="/work"
              className="text-xs font-bold text-[#750F2C] hover:underline inline-flex items-center gap-1"
            >
              View All Projects →
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, idx) => (
            <Reveal key={project.title} delay={0.1 * (idx + 1)}>
              <div className="group border border-[#E8DDE0] rounded-xl overflow-hidden bg-white hover:border-[#750F2C]/40 hover:shadow-xs transition-all duration-300 flex flex-col justify-between">
                <div>
                  {/* Project Image Banner */}
                  <div className={`relative h-48 w-full flex items-center justify-center font-extrabold text-2xl tracking-wider select-none overflow-hidden ${project.imageBg}`}>
                    {project.imageSrc ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={project.imageSrc}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      </div>
                    ) : (
                      <span>{project.imageText}</span>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <small className="text-[10px] font-bold uppercase tracking-wider text-[#750F2C] block mb-1.5">
                      {project.tag}
                    </small>

                    <h3 className="text-base font-bold text-[#191416] mb-2 group-hover:text-[#750F2C] transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-[#6F6568] leading-relaxed mb-4">
                      {project.desc}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={project.slug}
                    className="text-xs font-bold text-[#750F2C] group-hover:underline inline-flex items-center gap-1"
                  >
                    View Case Study →
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
