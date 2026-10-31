import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  User,
  Share2,
  Tag,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  getAllBlogArticles,
  getBlogArticleBySlug,
  DEFAULT_BLOG_ARTICLES,
  type BlogArticle,
} from "@/lib/blogs";
import CTASection from "@/components/home/CTASection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllBlogArticles();
  return articles.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | AvantusForge Insights",
    };
  }

  const url = `https://avantusforge.com/insights/${article.slug}`;

  return {
    title: `${article.title} | AvantusForge Insights`,
    description: article.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      publishedTime: article.published_at,
      authors: [article.author],
      images: [
        {
          url: article.featured_image || "/images/about.jpg",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.featured_image || "/images/about.jpg"],
    },
  };
}

export default async function SingleBlogPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getAllBlogArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 2);

  // Render markdown-like sections cleanly
  const paragraphs = article.content
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image ? [`https://avantusforge.com${article.featured_image}`] : [],
    datePublished: article.published_at,
    author: {
      "@type": "Person",
      name: article.author,
      jobTitle: article.author_role,
    },
    publisher: {
      "@type": "Organization",
      name: "AvantusForge",
      url: "https://avantusforge.com",
      logo: {
        "@type": "ImageObject",
        url: "https://avantusforge.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://avantusforge.com/insights/${article.slug}`,
    },
  };

  return (
    <div className="bg-[#FCFAF8] min-h-screen">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* 1. TOP BREADCRUMB & BACK LINK */}
      <section className="pt-12 pb-6 border-b border-[#E8DDE0] bg-[#FCFAF8]">
        <div className="max-w-[1080px] mx-auto px-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#750F2C] hover:text-[#52091E] group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Perspectives</span>
            </Link>

            <div className="flex items-center gap-2 text-xs text-[#8C7E83] font-medium">
              <Link href="/" className="hover:text-[#191416]">Home</Link>
              <span>/</span>
              <Link href="/insights" className="hover:text-[#191416]">Insights</Link>
              <span>/</span>
              <span className="text-[#191416] font-semibold">{article.category}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL ARTICLE HEADER */}
      <header className="pt-12 pb-16 border-b border-[#E8DDE0] bg-white">
        <div className="max-w-[920px] mx-auto px-6 sm:px-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 bg-[#F7EEF1] text-[#750F2C] font-mono font-bold uppercase tracking-wider text-[11px] rounded-sm">
              {article.category}
            </span>
            <div className="flex items-center gap-1.5 text-[#6F6568]">
              <Calendar className="w-3.5 h-3.5 text-[#8C7E83]" />
              <span>{article.published_at}</span>
            </div>
            <span className="text-[#8C7E83]">•</span>
            <div className="flex items-center gap-1.5 text-[#6F6568]">
              <Clock className="w-3.5 h-3.5 text-[#8C7E83]" />
              <span>{article.read_time}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191416] tracking-tight leading-[1.12]">
            {article.title}
          </h1>

          <p className="text-lg sm:text-xl text-[#6F6568] leading-relaxed font-normal pt-1">
            {article.excerpt}
          </p>

          {/* Author Byline */}
          <div className="pt-6 border-t border-[#E8DDE0] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              {article.author_image ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#E8DDE0] bg-[#FAF7F4] shrink-0">
                  <Image
                    src={article.author_image}
                    alt={article.author}
                    fill
                    className="object-cover object-top"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#F7EEF1] text-[#750F2C] flex items-center justify-center font-bold text-sm shrink-0">
                  {article.author.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-[#191416]">
                  {article.author}
                </div>
                <div className="text-xs text-[#6F6568]">
                  {article.author_role} • AvantusForge Studio
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#8C7E83] uppercase tracking-wider">
                Production Perspective
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. FEATURED IMAGE (Clean, editorial, no fake browser) */}
      {article.featured_image && (
        <section className="pt-12 pb-6">
          <div className="max-w-[920px] mx-auto px-6 sm:px-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-[#E8DDE0] bg-[#FAF7F4] shadow-xs">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 920px"
              />
            </div>
          </div>
        </section>
      )}

      {/* 4. ESSAY BODY CONTENT */}
      <main className="py-12 md:py-16">
        <div className="max-w-[820px] mx-auto px-6 sm:px-8">
          <article className="space-y-6 text-[#191416]">
            {paragraphs.map((p, idx) => {
              // Heading 3
              if (p.startsWith("### ")) {
                return (
                  <h3
                    key={idx}
                    className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight pt-8 pb-2 border-b border-[#E8DDE0]/60"
                  >
                    {p.replace("### ", "")}
                  </h3>
                );
              }

              // Heading 2
              if (p.startsWith("## ")) {
                return (
                  <h2
                    key={idx}
                    className="text-2xl sm:text-3xl font-extrabold text-[#750F2C] tracking-tight pt-10 pb-2"
                  >
                    {p.replace("## ", "")}
                  </h2>
                );
              }

              // List items
              if (p.includes("\n1. ") || p.includes("\n- ") || p.startsWith("1. ") || p.startsWith("- ")) {
                const lines = p.split("\n").filter(Boolean);
                return (
                  <ul key={idx} className="space-y-3 my-4 pl-1">
                    {lines.map((line, lIdx) => {
                      const cleanText = line.replace(/^\d+\.\s+/, "").replace(/^-\s+/, "");
                      // Check for bold title
                      const boldMatch = cleanText.match(/^\*\*([^*]+)\*\*:(.*)/);
                      if (boldMatch) {
                        return (
                          <li key={lIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#6F6568] leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#750F2C] mt-2 shrink-0" />
                            <div>
                              <strong className="text-[#191416] font-bold">{boldMatch[1]}:</strong>
                              <span>{boldMatch[2]}</span>
                            </div>
                          </li>
                        );
                      }
                      return (
                        <li key={lIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#6F6568] leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#750F2C] mt-2 shrink-0" />
                          <span>{cleanText}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // Standard Paragraph with potential bold inline
              return (
                <p
                  key={idx}
                  className="text-base sm:text-[17px] text-[#423A3D] leading-[1.8] font-normal"
                >
                  {p}
                </p>
              );
            })}
          </article>

          {/* Tags Strip */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-10 mt-12 border-t border-[#E8DDE0] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#750F2C] block">
                Topics &amp; Systems
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {article.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 bg-white border border-[#E8DDE0] text-[#6F6568] text-xs font-medium rounded-md hover:border-[#750F2C] transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Card Box */}
          <div className="mt-12 p-8 bg-white border border-[#E8DDE0] rounded-xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {article.author_image && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#750F2C]/20 shrink-0">
                <Image
                  src={article.author_image}
                  alt={article.author}
                  fill
                  className="object-cover object-top"
                />
              </div>
            )}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#191416]">{article.author}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#F7EEF1] text-[#750F2C] font-semibold">
                  {article.author_role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed">
                Contributing engineering, systems architecture, and commercial insights from the AvantusForge studio.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#750F2C] hover:text-[#52091E] shrink-0"
            >
              <span>Connect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* 5. RELATED ARTICLES */}
      {relatedArticles.length > 0 && (
        <section className="py-20 border-t border-[#E8DDE0] bg-[#FCFAF8]">
          <div className="max-w-[1080px] mx-auto px-6 sm:px-8 space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#750F2C] block">
                  Keep Reading
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191416] tracking-tight mt-1">
                  Related Engineering Essays
                </h2>
              </div>
              <Link
                href="/insights"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-[#750F2C] hover:text-[#52091E] uppercase tracking-wider"
              >
                <span>View All Essays</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedArticles.map((rel) => (
                <article
                  key={rel.slug}
                  className="bg-white border border-[#E8DDE0] rounded-2xl p-8 hover:border-[#750F2C]/40 transition-all duration-200 shadow-2xs flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded bg-[#F7EEF1] text-[#750F2C] font-mono font-bold uppercase tracking-wider text-[10px]">
                        {rel.category}
                      </span>
                      <span className="text-[#8C7E83]">{rel.read_time}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#191416] group-hover:text-[#750F2C] transition-colors leading-snug">
                      <Link href={`/insights/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6F6568] leading-relaxed line-clamp-3">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-[#E8DDE0]/60 flex items-center justify-between text-xs">
                    <span className="text-[#6F6568] font-medium">{rel.author}</span>
                    <Link
                      href={`/insights/${rel.slug}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[#750F2C] group-hover:text-[#52091E]"
                    >
                      <span>Read Perspective</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION SECTION */}
      <CTASection />
    </div>
  );
}

