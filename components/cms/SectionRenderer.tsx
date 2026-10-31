"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";
import { CMSSection } from "@/lib/cms-types";

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Import existing authentic home components
import HeroSection from "@/components/home/HeroSection";
import TrustBusinessStrip from "@/components/home/TrustBusinessStrip";
import BusinessProblems from "@/components/home/BusinessProblems";
import ServicesSection from "@/components/home/ServicesSection";
import EditorialStorySection from "@/components/home/EditorialStorySection";
import TechnologySection from "@/components/home/TechnologySection";
import StatsSection from "@/components/home/StatsSection";
import ProcessSection from "@/components/home/ProcessSection";
import SelectedWork from "@/components/home/SelectedWork";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import HomeFAQ from "@/components/home/HomeFAQ";
import WorkGallery from "@/components/work/WorkGallery";
import ContactForm from "@/components/contact/ContactForm";

interface SectionRendererProps {
  section: CMSSection;
  pageSlug?: string;
  isDraft?: boolean;
  teamMembers?: any[];
}

export default function SectionRenderer({ section, pageSlug, teamMembers }: SectionRendererProps) {
  // If section is explicitly disabled in the CMS, do not render
  if (section.enabled === false) {
    return null;
  }

  // 1. Specific Home Page Sections
  if (pageSlug === "home") {
    switch (section.id) {
      case "hero":
        return (
          <HeroSection
            eyebrow={section.eyebrow}
            headline={section.headline}
            description={section.description}
            primaryBtnText={section.primaryBtn?.text}
            primaryBtnHref={section.primaryBtn?.href}
            secondaryBtnText={section.secondaryBtn?.text}
            secondaryBtnHref={section.secondaryBtn?.href}
          />
        );
      case "trust_strip":
        return <TrustBusinessStrip />;
      case "business_problems":
        return <BusinessProblems />;
      case "services":
        return <ServicesSection />;
      case "editorial_story":
        return <EditorialStorySection />;
      case "tech_stack":
        return <TechnologySection />;
      case "stats":
        return <StatsSection />;
      case "process":
        return <ProcessSection />;
      case "selected_work":
        return <SelectedWork />;
      case "testimonials":
        return <TestimonialsSection />;
      case "cta":
        return (
          <CTASection
            eyebrow={section.eyebrow}
            headline={section.headline}
            description={section.description}
            primaryBtnText={section.primaryBtn?.text}
            primaryBtnHref={section.primaryBtn?.href}
            secondaryBtnText={section.secondaryBtn?.text}
            secondaryBtnHref={section.secondaryBtn?.href}
          />
        );
      case "faq":
        return <HomeFAQ />;
      default:
        break;
    }
  }

  if (pageSlug === "work") {
    if (section.id === "split_gallery" || section.type === "portfolio_showcase") {
      return <WorkGallery />;
    }
  }

  if (pageSlug === "team") {
    if (
      section.id === "members_grid" ||
      section.id === "team_grid" ||
      section.id === "team" ||
      section.type === "team_grid" ||
      section.type === "team"
    ) {
      return <TeamGridSection section={section} teamMembers={teamMembers} />;
    }
  }

  if (pageSlug === "services") {
    if (section.id === "services_grid" || section.id === "catalog" || section.type === "services_grid") {
      if (section.items && section.items.length > 0) {
        return <ServicesGridSection section={section} />;
      }
      return <ServicesSection />;
    }
  }

  if (pageSlug === "contact") {
    if (section.id === "form" || section.type === "contact_form") {
      return <ContactFormSection section={section} />;
    }
  }

  // 2. Universal & Template-Based Rendering for all other sections & pages
  const sectionType =
    section.type ||
    (section.id.includes("hero")
      ? "hero"
      : section.id.includes("cta")
        ? "cta_banner"
        : section.id.includes("team")
          ? "team_grid"
          : section.id.includes("grid") || section.id === "catalog"
            ? "services_grid"
            : undefined);

  switch (sectionType) {
    case "hero":
      return <StandardHeroSection section={section} />;

    case "text_image":
      return <TextImageSection section={section} />;

    case "services_grid":
      return <ServicesGridSection section={section} />;

    case "cta_banner":
      return (
        <CTASection
          eyebrow={section.eyebrow}
          headline={section.headline}
          description={section.description}
          primaryBtnText={section.primaryBtn?.text}
          primaryBtnHref={section.primaryBtn?.href}
          secondaryBtnText={section.secondaryBtn?.text}
          secondaryBtnHref={section.secondaryBtn?.href}
        />
      );

    case "statistics":
      return <StatisticsSection section={section} />;

    case "process_steps":
      return <ProcessStepsSection section={section} />;

    case "faq_accordion":
      return <FAQAccordionSection section={section} />;

    case "rich_text":
      return <RichTextSection section={section} />;

    case "logo_strip":
      return <TechnologySection />;

    case "portfolio_showcase":
      return pageSlug === "work" ? <WorkGallery /> : <SelectedWork />;

    case "contact_form":
      return <ContactFormSection section={section} />;

    case "team_grid":
    case "team":
      return <TeamGridSection section={section} teamMembers={teamMembers} />;

    case "blog_listing":
      return <BlogListingSection section={section} />;

    case "testimonials":
      return <TestimonialsSection />;

    default:
      // Fallback section card
      return <StandardSectionFallback section={section} />;
  }
}

// --- REUSABLE SECTION TEMPLATES MATCHING AVANTUSFORGE DESIGN TOKENS ---

function StandardHeroSection({ section }: { section: CMSSection }) {
  return (
    <section className="pt-20 pb-16 md:pt-28 md:pb-24 border-b border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="max-w-4xl space-y-6">
          {section.eyebrow && (
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
              {section.eyebrow}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191416] tracking-tight leading-[1.08]">
            {section.headline}
          </h1>

          {section.description && (
            <p className="text-lg sm:text-xl text-[#6F6568] leading-relaxed font-normal pt-2">
              {section.description}
            </p>
          )}

          {(section.primaryBtn || section.secondaryBtn) && (
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {section.primaryBtn && (
                <Link
                  href={section.primaryBtn.href || "/contact"}
                  className="inline-flex items-center justify-center gap-2.5 bg-[#750F2C] hover:bg-[#52091E] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-xs"
                >
                  <span>{section.primaryBtn.text}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {section.secondaryBtn && (
                <Link
                  href={section.secondaryBtn.href || "/work"}
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-black/5 text-[#191416] border border-[#E8DDE0] px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  <span>{section.secondaryBtn.text}</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TextImageSection({ section }: { section: CMSSection }) {
  const imageUrl = section.primaryImage?.url || "/team/laiba-baig-ceo.jpg";
  const imageAlt = section.primaryImage?.alt || section.headline || "AvantusForge Feature Image";

  return (
    <section className="py-20 md:py-24 border-b border-[#E8DDE0] bg-white">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image */}
          <div className="lg:col-span-6">
            <div className="border border-[#E8DDE0]/80 rounded-2xl overflow-hidden bg-[#FCFAF8] shadow-xs">
              <div className="relative aspect-[4/3] sm:aspect-[4/3.5] w-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {section.primaryImage?.caption && (
                <div className="p-3 bg-white border-t border-[#E8DDE0]/60 text-xs text-[#6F6568]">
                  {section.primaryImage.caption}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            {section.eyebrow && (
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
                {section.eyebrow}
              </span>
            )}

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight leading-snug">
              {section.headline}
            </h2>

            {section.description && (
              <p className="text-base sm:text-lg text-[#6F6568] leading-relaxed">
                {section.description}
              </p>
            )}

            {section.bodyContent && (
              <div className="space-y-4 text-sm sm:text-base text-[#6F6568] leading-relaxed whitespace-pre-line">
                {section.bodyContent}
              </div>
            )}

            {section.primaryBtn && (
              <div className="pt-2">
                <Link
                  href={section.primaryBtn.href || "/contact"}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#750F2C] hover:bg-[#52091E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <span>{section.primaryBtn.text}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesGridSection({ section }: { section: CMSSection }) {
  const items = section.items || [];

  return (
    <section className="py-20 md:py-24 border-b border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          {section.eyebrow && (
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight">
            {section.headline}
          </h2>
          {section.description && (
            <p className="text-base text-[#6F6568] leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-7 rounded-xl border border-[#E8DDE0] bg-white hover:border-[#750F2C]/40 transition-all duration-200 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {item.number && (
                    <span className="font-mono text-xs font-bold text-[#750F2C] block">
                      {item.number}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-[#191416]">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <div className="text-xs font-semibold text-[#750F2C]">
                      {item.subtitle}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {item.linkHref && (
                  <div className="pt-4 mt-4 border-t border-[#E8DDE0]/60">
                    <Link
                      href={item.linkHref}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#750F2C] hover:text-[#52091E] transition-colors"
                    >
                      <span>{item.linkText || "Learn More"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatisticsSection({ section }: { section: CMSSection }) {
  const items = section.items || [];

  return (
    <section className="py-16 md:py-20 border-b border-[#E8DDE0] bg-white">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          {section.eyebrow && (
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416]">
            {section.headline}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((stat, idx) => (
            <div
              key={stat.id || idx}
              className="text-center p-6 rounded-xl border border-[#E8DDE0] bg-[#FCFAF8]"
            >
              <div className="text-2xl sm:text-3xl font-black text-[#750F2C] tracking-tight">
                {stat.title}
              </div>
              <div className="text-xs text-[#6F6568] mt-2 font-medium leading-relaxed">
                {stat.subtitle || stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessStepsSection({ section }: { section: CMSSection }) {
  const items = section.items || [];

  return (
    <section className="py-20 md:py-24 border-b border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          {section.eyebrow && (
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight">
            {section.headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((step, idx) => (
            <div
              key={step.id || idx}
              className="p-7 rounded-xl border border-[#E8DDE0] bg-white space-y-4"
            >
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#F7EEF1] text-[#750F2C] inline-block">
                {step.number || `0${idx + 1}`}
              </span>
              <h3 className="text-lg font-bold text-[#191416]">{step.title}</h3>
              {step.subtitle && (
                <div className="text-xs font-medium text-[#750F2C]">{step.subtitle}</div>
              )}
              <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQAccordionSection({ section }: { section: CMSSection }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const items = section.items || [];

  return (
    <section className="py-20 md:py-24 border-b border-[#E8DDE0] bg-white">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          {section.eyebrow && (
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-3xl font-extrabold text-[#191416] tracking-tight">
            {section.headline}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.id || idx}
                className="border border-[#E8DDE0] rounded-xl overflow-hidden transition-colors bg-[#FCFAF8]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#191416] hover:text-[#750F2C] cursor-pointer"
                >
                  <span>{item.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8C7E83] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[#750F2C]" : ""
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6F6568] leading-relaxed border-t border-[#E8DDE0]/50 bg-white">
                    {item.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RichTextSection({ section }: { section: CMSSection }) {
  return (
    <section className="py-16 md:py-20 border-b border-[#E8DDE0] bg-white">
      <div className="max-w-[900px] mx-auto px-6 sm:px-8 space-y-6">
        {section.headline && (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416]">
            {section.headline}
          </h2>
        )}
        {section.bodyContent && (
          <div className="prose prose-sm sm:prose-base max-w-none text-[#6F6568] whitespace-pre-line leading-relaxed space-y-4">
            {section.bodyContent}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactFormSection({ section }: { section: CMSSection }) {
  return (
    <section className="py-20 md:py-28 border-b border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="border border-[#E8DDE0] bg-white p-8 rounded-2xl shadow-xs space-y-6">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
                Direct Inquiries
              </span>
              <div>
                <span className="text-xs text-[#6F6568] block">Electronic Mail</span>
                <a
                  href="mailto:info@avantusforge.com"
                  className="text-lg font-bold text-[#191416] hover:text-[#750F2C] transition-colors underline underline-offset-4 decoration-[#750F2C]/30"
                >
                  info@avantusforge.com
                </a>
              </div>
              <div>
                <span className="text-xs text-[#6F6568] block">Direct Telephone / WhatsApp</span>
                <a
                  href="https://wa.me/923274074472"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-[#191416] hover:text-[#750F2C] transition-colors"
                >
                  +92 327 4074472
                </a>
              </div>
              <div className="pt-4 border-t border-[#E8DDE0]/60">
                <span className="text-xs text-[#6F6568] block">Global Operations</span>
                <p className="text-xs font-semibold text-[#191416] mt-1">
                  United Kingdom • United States • United Arab Emirates • Kuwait • Pakistan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamGridSection({
  section,
  teamMembers,
}: {
  section: CMSSection;
  teamMembers?: any[];
}) {
  const LINKEDIN_MAP: Record<string, string> = {
    "laiba": "https://www.linkedin.com/in/laiba-baig-dev/",
    "laiba baig": "https://www.linkedin.com/in/laiba-baig-dev/",
    "ceo": "https://www.linkedin.com/in/laiba-baig-dev/",
    "chief executive": "https://www.linkedin.com/in/laiba-baig-dev/",
    "muzamil": "https://www.linkedin.com/in/muzamilbiz/",
    "operations": "https://www.linkedin.com/in/muzamilbiz/",
    "ops": "https://www.linkedin.com/in/muzamilbiz/",
    "maira": "https://www.linkedin.com/in/maira-faizan-graphic-designer/",
    "maira faizan": "https://www.linkedin.com/in/maira-faizan-graphic-designer/",
    "graphic": "https://www.linkedin.com/in/maira-faizan-graphic-designer/",
    "designer": "https://www.linkedin.com/in/maira-faizan-graphic-designer/",
    "bilal": "https://www.linkedin.com/in/abdulraufbilal/",
    "abdul rauf": "https://www.linkedin.com/in/abdulraufbilal/",
    "abdul rauf bilal": "https://www.linkedin.com/in/abdulraufbilal/",
    "abdulrauf": "https://www.linkedin.com/in/abdulraufbilal/",
    "technical": "https://www.linkedin.com/in/abdulraufbilal/",
    "tech": "https://www.linkedin.com/in/abdulraufbilal/",
  };

  const getLinkedIn = (name?: string, fallbackUrl?: string, role?: string) => {
    if (fallbackUrl && fallbackUrl.trim().startsWith("http")) return fallbackUrl.trim();
    const cleanName = (name || "").toLowerCase().trim();
    const cleanRole = (role || "").toLowerCase().trim();
    for (const [key, url] of Object.entries(LINKEDIN_MAP)) {
      if (cleanName.includes(key) || cleanRole.includes(key)) return url;
    }
    return "";
  };

  const defaultMembers = [
    {
      id: 1,
      name: "Laiba Baig",
      role: "Chief Executive Officer",
      image: "/team/laiba-baig-ceo.jpg",
      bio: "Founder and Chief Executive Officer guiding strategic direction, enterprise technology solutions, and global marketplace expansion for AvantusForge.",
      linkedin_url: "https://www.linkedin.com/in/laiba-baig-dev/",
    },
    {
      id: 2,
      name: "Maira Faizan",
      role: "Graphic Designer",
      image: "/team/maira.jpg",
      bio: "Directing brand identity systems, conversion-driven visual design, storefront graphics, and premium digital marketing assets.",
      linkedin_url: "https://www.linkedin.com/in/maira-faizan-graphic-designer/",
    },
    {
      id: 3,
      name: "Abdul Rauf Bilal",
      role: "Technical Director",
      image: "/team/tech-lead.jpg",
      bio: "Leading bespoke system architecture, custom ERP/CRM engineering, and high-performance cloud applications.",
      linkedin_url: "https://www.linkedin.com/in/abdulraufbilal/",
    },
    {
      id: 4,
      name: "Muzamil",
      role: "Operations Director",
      image: "/uploads/cebbef9afb9b84025540e70a.png",
      bio: "Overseeing client digital delivery, e-commerce growth strategies, and international market development.",
      linkedin_url: "https://www.linkedin.com/in/muzamilbiz/",
    },
  ];

  let membersToDisplay = defaultMembers;

  if (section.items && section.items.length > 0) {
    membersToDisplay = section.items.map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      name: item.name || item.title || "Team Member",
      role: item.role || item.subtitle || "AvantusForge",
      image: item.image || item.image_url || "/team/laiba-baig-ceo.jpg",
      bio: item.bio || item.description || "",
      linkedin_url: getLinkedIn(item.name || item.title, item.linkedin_url, item.role || item.subtitle),
    }));
  } else if (teamMembers && teamMembers.length > 0) {
    const active = teamMembers.filter((m: any) => m.is_active !== false && m.is_active !== 0);
    if (active.length > 0) {
      membersToDisplay = active.map((m: any) => ({
        id: m.id,
        name: m.name || m.title,
        role: m.role || m.title || "Leadership",
        image: m.image_url || m.image || (m.role?.toLowerCase().includes("ceo") ? "/team/laiba-baig-ceo.jpg" : "/team/ops-lead.jpg"),
        bio: m.bio || "",
        linkedin_url: getLinkedIn(m.name || m.title, m.linkedin_url, m.role || m.title),
      }));
    }
  }

  return (
    <section className="py-20 md:py-28 border-b border-[#EADFE3] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          {section.eyebrow && (
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight">
            {section.headline}
          </h2>
          {section.description && (
            <p className="text-base text-[#6F6568] leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {membersToDisplay.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-[#EADFE3]/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7EEF1]/30">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-white/95 backdrop-blur-xs border border-[#EADFE3]/80 text-[10px] font-bold text-[#750F2C] uppercase tracking-wider rounded-md">
                    {member.role.split("&")[0].trim()}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#191416] group-hover:text-[#750F2C] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#750F2C] tracking-wide uppercase mt-1">
                    {member.role}
                  </p>
                  <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed mt-3">
                    {member.bio}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E8DDE0]/60 flex items-center justify-between text-xs text-[#6F6568]">
                  <span>AvantusForge</span>
                  {member.linkedin_url ? (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#750F2C] hover:text-[#52091E] font-semibold inline-flex items-center gap-1.5 transition-colors group/link"
                      title={`Connect with ${member.name} on LinkedIn`}
                    >
                      <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                      <span>LinkedIn Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                    </a>
                  ) : (
                    <Link
                      href="/contact"
                      className="text-[#750F2C] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Connect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogListingSection({ section }: { section: CMSSection }) {
  const articles = [
    {
      slug: "when-to-replace-spreadsheets-with-custom-software",
      category: "Business Systems",
      date: "September 2026",
      readTime: "7 min read",
      title: "When to Replace Operational Spreadsheets with Custom Software",
      excerpt:
        "Spreadsheets are brilliant for early prototyping, but lethal for scaling. How to recognize the exact inflection point when fragmented Google Sheets begin silently bleeding team hours.",
    },
    {
      slug: "headless-shopify-vs-custom-liquid-theme",
      category: "Ecommerce",
      date: "August 2026",
      readTime: "6 min read",
      title: "Headless Shopify vs. Bespoke Liquid Themes: What Ambitious Brands Actually Need",
      excerpt:
        "A pragmatic engineering comparison between headless Next.js frontends and native Liquid 2.0 section architecture. Why 90% of stores are better served by eliminating app bloat.",
    },
    {
      slug: "practical-business-automation-without-fragile-tools",
      category: "Automation",
      date: "July 2026",
      readTime: "5 min read",
      title: "Building Resilient Automation Pipelines Without Fragile No-Code Lock-In",
      excerpt:
        "Why relying purely on no-code webhook zaps causes silent system failure, and how to build lightweight serverless API microservices with proper error catch loops.",
    },
    {
      slug: "human-art-direction-vs-ai-generated-sameness",
      category: "Technology",
      date: "June 2026",
      readTime: "8 min read",
      title: "The Death of Generic SaaS Templates: Why Human Art Direction Commands Trust",
      excerpt:
        "Modern B2B buyers have developed instant immunity to cookie-cutter gradients and fake AI mockups. How intentional typography and deliberate whitespace build commercial conviction.",
    },
  ];

  return (
    <section className="py-20 md:py-24 border-b border-[#E8DDE0] bg-[#FCFAF8]">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          {section.eyebrow && (
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight">
            {section.headline}
          </h2>
          {section.description && (
            <p className="text-base text-[#6F6568] leading-relaxed">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art) => (
            <article
              key={art.slug}
              className="bg-white border border-[#E8DDE0] rounded-2xl p-8 hover:border-[#750F2C]/40 transition-all duration-200 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded bg-[#F7EEF1] text-[#750F2C] font-mono font-bold uppercase tracking-wider text-[10px]">
                    {art.category}
                  </span>
                  <span className="text-[#8C7E83]">{art.date}</span>
                  <span className="text-[#8C7E83]">•</span>
                  <span className="text-[#8C7E83]">{art.readTime}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#191416] leading-snug hover:text-[#750F2C] transition-colors">
                  <Link href={`/insights/${art.slug}`}>{art.title}</Link>
                </h3>
                <p className="text-sm text-[#6F6568] leading-relaxed">
                  {art.excerpt}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E8DDE0]/60 flex items-center justify-between">
                <Link
                  href={`/insights/${art.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#750F2C] hover:text-[#52091E] group"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="text-xs text-[#8C7E83] hover:text-[#191416] transition-colors"
                >
                  Discuss Scope
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StandardSectionFallback({ section }: { section: CMSSection }) {
  return (
    <section className="py-16 border-b border-[#E8DDE0] bg-white">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 space-y-4">
        {section.eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#750F2C]">
            {section.eyebrow}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#191416]">{section.headline}</h2>
        {section.description && <p className="text-sm text-[#6F6568]">{section.description}</p>}
      </div>
    </section>
  );
}

