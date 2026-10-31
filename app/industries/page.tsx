import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Industries & Sectors | Digital Solutions for Real Industries | AvantusForge",
  description:
    "Custom software, business automation, and digital platforms engineered for Healthcare, Real Estate, Education, Ecommerce, Professional Services, and more.",
};

const INDUSTRIES_DATA = [
  {
    name: "Healthcare",
    challenges:
      "Manual patient intake paperwork, fragmented electronic health records, missed appointment slots, and strict data privacy compliance (HIPAA/GDPR).",
    solutions:
      "Secure patient self-service portals, automated appointment reminder workflows, encrypted intake forms, and role-based staff management dashboards.",
    services: [
      { name: "Custom Software", href: "/services/custom-software-development" },
      { name: "Business Automation", href: "/services/business-automation" },
    ],
  },
  {
    name: "Real Estate",
    challenges:
      "Outdated MLS listings sync, slow lead qualification, scattered deal documents, and disjointed communication between brokers and buyers.",
    solutions:
      "Interactive property search platforms, automated lead-to-agent distribution, digital contract generation, and unified client CRM hubs.",
    services: [
      { name: "Web Development", href: "/services/web-development" },
      { name: "ERP & CRM Systems", href: "/services/erp-crm" },
    ],
  },
  {
    name: "Education",
    challenges:
      "Disjointed student enrollment workflows, clunky learning management systems, manual grading spreadsheets, and poor parent communication.",
    solutions:
      "Custom LMS platforms, automated tuition billing pipelines, self-service student portals, and integrated course schedule management.",
    services: [
      { name: "Custom Software", href: "/services/custom-software-development" },
      { name: "SaaS Development", href: "/services/saas-development" },
    ],
  },
  {
    name: "Ecommerce & Retail",
    challenges:
      "High cart abandonment rates, slow mobile performance, inventory sync errors across physical and online channels, and disjointed return processes.",
    solutions:
      "Bespoke Shopify 2.0 themes, headless storefronts, multi-warehouse stock synchronization, and streamlined one-page checkout experiences.",
    services: [
      { name: "Shopify Development", href: "/services/shopify-development" },
      { name: "Ecommerce Development", href: "/services/ecommerce-development" },
    ],
  },
  {
    name: "Professional Services",
    challenges:
      "Unbillable hours spent compiling client documents, manual invoice tracking, lack of client visibility into project status, and unstructured emails.",
    solutions:
      "Bespoke client onboarding portals, automated retainer billing, centralized project milestone tracking, and secure document vaults.",
    services: [
      { name: "Custom Software", href: "/services/custom-software-development" },
      { name: "ERP & CRM Systems", href: "/services/erp-crm" },
    ],
  },
  {
    name: "Hospitality & Lounges",
    challenges:
      "Phone-based table reservation bottlenecks, high no-show rates, manual kitchen dispatching, and lack of customer loyalty tracking.",
    solutions:
      "Real-time online reservation engines, SMS booking reminders, digital kitchen display systems, and automated loyalty reward workflows.",
    services: [
      { name: "Web Development", href: "/services/web-development" },
      { name: "Business Automation", href: "/services/business-automation" },
    ],
  },
  {
    name: "Wholesale & Distribution",
    challenges:
      "Paper-based purchase orders, slow wholesale credit approval, manual inventory updates across multiple branches, and disconnected shipping carriers.",
    solutions:
      "B2B wholesale ordering portals with tiered pricing matrices, real-time inventory synchronization, and automated carrier dispatch APIs.",
    services: [
      { name: "ERP & CRM Systems", href: "/services/erp-crm" },
      { name: "Ecommerce Development", href: "/services/ecommerce-development" },
    ],
  },
  {
    name: "Events & Entertainment",
    challenges:
      "Ticketing platform transaction fee gouging, ticket fraud/scalping, complex seating reservation logic, and chaotic attendee check-in queues.",
    solutions:
      "Custom white-label ticketing portals, QR code mobile scanner apps for staff, real-time seat selection maps, and automated schedule notifications.",
    services: [
      { name: "Custom Software", href: "/services/custom-software-development" },
      { name: "Mobile App Development", href: "/services/mobile-app-development" },
    ],
  },
];

export default function IndustriesPage() {
  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-20 md:pt-28 md:pb-24 border-b border-[#E8DDE0]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Sectors We Serve
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191416] tracking-tight leading-[1.08]">
              Digital solutions{" "}
              <span className="font-serif italic font-normal text-[#750F2C] block mt-1">
                for real industries.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#6F6568] leading-relaxed font-normal pt-2">
              Every vertical presents unique regulatory constraints, operational bottlenecks,
              and customer expectations. We build systems tailored to the exact realities
              of your industry.
            </p>
          </div>
        </div>
      </section>

      {/* Industries Editorial Breakdown */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-16">
          <div className="border-t border-[#E8DDE0]">
            {INDUSTRIES_DATA.map((ind, idx) => (
              <div
                key={ind.name}
                className="py-12 border-b border-[#E8DDE0] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Industry Name */}
                <div className="lg:col-span-3">
                  <span className="text-xs font-mono font-bold text-[#750F2C] block mb-1">
                    0{idx + 1}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight">
                    {ind.name}
                  </h2>
                </div>

                {/* Challenges & Solutions */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6568]">
                      Operational Challenge
                    </span>
                    <p className="text-sm text-[#191416] leading-relaxed mt-1">
                      {ind.challenges}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#750F2C]">
                      AvantusForge Digital Solution
                    </span>
                    <p className="text-sm text-[#6F6568] leading-relaxed mt-1">
                      {ind.solutions}
                    </p>
                  </div>
                </div>

                {/* Relevant Services */}
                <div className="lg:col-span-3 lg:text-right space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6568] block">
                    Relevant Services
                  </span>
                  <div className="flex flex-col lg:items-end gap-1.5">
                    {ind.services.map((svc) => (
                      <Link
                        key={svc.name}
                        href={svc.href}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#750F2C] hover:text-[#52091E] transition-colors"
                      >
                        <span>{svc.name}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
