import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ALL_SERVICES } from "@/lib/services-data";
import CTASection from "@/components/home/CTASection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = ALL_SERVICES.find((s) => s.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: `${service.title} | AvantusForge`,
    description: service.heroSubheading,
    alternates: {
      canonical: `https://avantusforge.com/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | AvantusForge`,
      description: service.heroSubheading,
      url: `https://avantusforge.com/services/${service.slug}`,
      images: [
        {
          url: service.projectImage,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = ALL_SERVICES.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#E8DDE0]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#750F2C] tracking-widest uppercase">
                  {service.category}
                </span>
                <span className="text-[#E8DDE0]">/</span>
                <span className="text-xs font-bold text-[#6F6568] uppercase tracking-wider">
                  {service.title}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[54px] font-extrabold text-[#191416] tracking-tight leading-[1.1]">
                {service.heroHeading}
              </h1>

              <p className="text-base sm:text-lg text-[#6F6568] leading-relaxed max-w-2xl font-normal">
                {service.heroSubheading}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#750F2C] hover:bg-[#52091E] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-150 group shadow-xs hover:shadow"
                >
                  <span>Discuss Your Project</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/work"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-black/5 text-[#191416] border border-[#E8DDE0] px-7 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  <span>View Our Work</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Authentic Editorial Visual Presentation */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[#E8DDE0] bg-[#FAF7F4] shadow-[0_12px_32px_rgba(25,20,22,0.06)] group">
                <Image
                  src={service.projectImage}
                  alt={service.projectCaption || service.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                />
              </div>
              {service.projectCaption && (
                <p className="mt-3 text-xs text-[#6F6568] font-medium leading-relaxed">
                  {service.projectCaption}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CHALLENGE & THE SOLUTION (Split Editorial Layout) */}
      <section className="py-24 border-b border-[#E8DDE0]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* The Challenge */}
            <div className="space-y-6">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
                The Challenge
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight">
                {service.challengeTitle}
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[#6F6568] leading-relaxed">
                {service.challengeParagraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {/* The Solution */}
            <div className="space-y-6">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
                The AvantusForge Approach
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight">
                {service.solutionTitle}
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[#6F6568] leading-relaxed">
                {service.solutionParagraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT WE BUILD (Editorial Capabilities) */}
      <section className="py-24 border-b border-[#E8DDE0] bg-white">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Scope &amp; Deliverables
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight mt-3">
              What we build for you.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.whatWeBuild.map((item, idx) => (
              <div
                key={idx}
                className="p-6 border border-[#E8DDE0] rounded-sm hover:border-[#750F2C]/50 transition-colors bg-[#FCFAF8]"
              >
                <div className="text-xs font-mono font-bold text-[#750F2C] mb-3">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-[#191416] mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6F6568] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW WE WORK (7-Step Methodology Timeline) */}
      <section className="py-24 border-b border-[#E8DDE0]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Delivery Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight mt-3">
              How we execute this service.
            </h2>
          </div>

          <div className="border-t border-[#E8DDE0]">
            {service.howWeWork.map((step) => (
              <div
                key={step.step}
                className="py-8 border-b border-[#E8DDE0] grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline"
              >
                <div className="md:col-span-2 text-xs font-mono font-bold text-[#750F2C]">
                  {step.step}
                </div>
                <div className="md:col-span-4 text-xl font-bold text-[#191416] tracking-tight">
                  {step.title}
                </div>
                <div className="md:col-span-6 text-sm text-[#6F6568] leading-relaxed">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RELEVANT CASE STUDY FEATURE */}
      <section className="py-24 border-b border-[#E8DDE0] bg-[#FCFAF8]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="mb-12">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
              Real-World Application
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191416] tracking-tight mt-2">
              Featured Case Study
            </h2>
          </div>

          <div className="border border-[#E8DDE0] rounded-sm overflow-hidden bg-white shadow-[0_8px_24px_rgba(25,20,22,0.04)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 lg:p-12">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#750F2C]">
                  {service.caseStudy.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight">
                  {service.caseStudy.title}
                </h3>
                <p className="text-sm text-[#6F6568] leading-relaxed">
                  {service.caseStudy.summary}
                </p>
                <div className="pt-2">
                  <Link
                    href={
                      service.caseStudy.slug === "amazon-services"
                        ? "/services/amazon-services"
                        : "/work"
                    }
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider group cursor-pointer"
                  >
                    <span>Explore Selected Work</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-[#E8DDE0]">
                  <Image
                    src={service.caseStudy.image}
                    alt={service.caseStudy.title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SERVICE FAQ */}
      <section className="py-24 border-b border-[#E8DDE0]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C]">
                Questions &amp; Answers
              </span>
              <h2 className="text-3xl font-extrabold text-[#191416] tracking-tight">
                Frequently asked questions.
              </h2>
              <p className="text-sm text-[#6F6568] leading-relaxed">
                Have a question that is not covered here? Reach out directly and our
                technical team will walk you through the details.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#E8DDE0] border-t border-b border-[#E8DDE0]">
              {service.faqs.map((faq, idx) => (
                <div key={idx} className="py-6 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#191416]">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <CTASection />
    </div>
  );
}
