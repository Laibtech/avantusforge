import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Services & Capabilities | Custom Software, Automation & Ecommerce",
  description:
    "Explore AvantusForge's full suite of technology capabilities: custom software development, business automation, ERP/CRM systems, web, Shopify, and digital growth.",
};

const CATEGORIES = [
  {
    name: "BUILD",
    label: "Digital Engineering & Architecture",
    description: "Bespoke software platforms, web systems, mobile applications and SaaS architectures engineered from the ground up.",
    services: [
      {
        number: "01",
        title: "Custom Software Development",
        description: "Software built around your exact internal processes, data schemas and user requirements.",
        href: "/services/custom-software-development",
      },
      {
        number: "02",
        title: "Web Development",
        description: "Modern, high-performance web applications and corporate digital platforms.",
        href: "/services/web-development",
      },
      {
        number: "03",
        title: "Mobile Applications",
        description: "Fluid iOS and Android applications built with React Native and native engineering.",
        href: "/services/mobile-app-development",
      },
      {
        number: "04",
        title: "SaaS Development",
        description: "Multi-tenant cloud applications with authentication, billing and scalable infrastructure.",
        href: "/services/saas-development",
      },
      {
        number: "05",
        title: "UI/UX Design",
        description: "Editorial visual systems, user research, wireframing and design systems.",
        href: "/services/ui-ux-design",
      },
    ],
  },
  {
    name: "AUTOMATE",
    label: "Operational Systems & Workflows",
    description: "Eliminating manual data entry and unifying disconnected business tools through robust integrations.",
    services: [
      {
        number: "06",
        title: "Business Automation",
        description: "Remove repetitive administrative tasks and connect the systems your team uses every day.",
        href: "/services/business-automation",
      },
      {
        number: "07",
        title: "ERP & CRM Systems",
        description: "Bring operations, customer histories and business metrics into one connected platform.",
        href: "/services/erp-crm",
      },
      {
        number: "08",
        title: "Workflow Automation & API Integrations",
        description: "Custom webhook pipelines, automated approval flows, and secure data bridges.",
        href: "/services/business-automation",
      },
    ],
  },
  {
    name: "COMMERCE",
    label: "Digital Storefronts & Platforms",
    description: "Conversion-focused digital storefronts, custom Shopify setups and seamless checkout flows.",
    services: [
      {
        number: "09",
        title: "Ecommerce Development",
        description: "Scalable online stores designed around your inventory, catalog and commercial goals.",
        href: "/services/ecommerce-development",
      },
      {
        number: "10",
        title: "Shopify Development",
        description: "Bespoke themes, Liquid component engineering, private apps and headless commerce.",
        href: "/services/shopify-development",
      },
    ],
  },
  {
    name: "GROW",
    label: "Acquisition & Performance",
    description: "Technical SEO foundations, targeted paid advertising campaigns and full-funnel digital expansion.",
    services: [
      {
        number: "11",
        title: "SEO & Digital Marketing",
        description: "Technical search audits, high-intent keyword ranking, and scalable acquisition funnels.",
        href: "/services/seo-digital-marketing",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-20 md:pt-28 md:pb-24 border-b border-[#E8DDE0]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              What We Do
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191416] tracking-tight leading-[1.08]">
              Digital systems built around{" "}
              <span className="font-serif italic font-normal text-[#750F2C] block mt-1">
                the way your business works.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#6F6568] leading-relaxed font-normal pt-2">
              We do not believe in one-size-fits-all software templates. Every platform,
              automation pipeline, and storefront we forge is engineered with precision
              to solve real operational bottlenecks.
            </p>
          </div>
        </div>
      </section>

      {/* Categorized Editorial Rows (NO cards) */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-24">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="space-y-8">
              {/* Category Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-6 border-b-2 border-[#750F2C] items-baseline">
                <div className="lg:col-span-3">
                  <span className="text-sm font-bold tracking-[0.2em] text-[#750F2C] uppercase font-mono">
                    {cat.name}
                  </span>
                </div>
                <div className="lg:col-span-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#191416] tracking-tight">
                    {cat.label}
                  </h2>
                </div>
                <div className="lg:col-span-5">
                  <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Editorial Rows */}
              <div>
                {cat.services.map((item) => (
                  <Link
                    key={item.number}
                    href={item.href}
                    className="group block border-b border-[#E8DDE0] py-8 sm:py-10 px-4 sm:px-8 -mx-4 sm:-mx-8 transition-colors duration-200 hover:bg-[#F7EEF1]"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center">
                      <div className="md:col-span-1 text-xs font-mono font-bold text-[#750F2C]">
                        {item.number}
                      </div>
                      <div className="md:col-span-5">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191416] group-hover:text-[#750F2C] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div className="md:col-span-5">
                        <p className="text-sm text-[#6F6568] leading-relaxed group-hover:text-[#191416]/90 transition-colors">
                          {item.description}
                        </p>
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <div className="w-9 h-9 rounded-full border border-[#E8DDE0] flex items-center justify-center text-[#191416] group-hover:border-[#750F2C] group-hover:text-[#750F2C] group-hover:translate-x-1.5 transition-all duration-200 bg-white">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global CTA */}
      <CTASection />
    </div>
  );
}
