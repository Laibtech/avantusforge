"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUp, Mail, Globe, Phone } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [footerConfig, setFooterConfig] = useState({
    newsletter_headline: "Quarterly Perspectives",
    newsletter_prompt: "Stay updated with modern digital engineering.",
    copyright_text: "© 2026 AvantusForge. All rights reserved.",
  });

  React.useEffect(() => {
    fetch("/api/admin/navigation")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.footer) {
          setFooterConfig((prev) => ({
            ...prev,
            ...d.footer,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-[#6F1028] text-[#F8F5F0] pt-20 pb-10 border-t border-[#4A0B1B] overflow-hidden">
      {/* Subtle Architectural Background Shapes (Burgundy-on-Burgundy, non-AI) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-25 select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="92%"
          cy="78%"
          r="480"
          stroke="#4A0B1B"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="92%"
          cy="78%"
          r="320"
          stroke="#4A0B1B"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
        />
        <circle
          cx="8%"
          cy="20%"
          r="360"
          stroke="#4A0B1B"
          strokeWidth="1.5"
          fill="none"
        />
        <line
          x1="0"
          y1="22%"
          x2="100%"
          y2="22%"
          stroke="#4A0B1B"
          strokeWidth="0.75"
          strokeDasharray="6 8"
        />
      </svg>

      <div className="relative max-w-[1360px] mx-auto px-6 sm:px-8 z-10">
        {/* TOP SECTION: Integrated Editorial Newsletter / CTA Area */}
        <div className="pb-16 border-b border-[#4A0B1B]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Headline & Prompt */}
            <div className="lg:col-span-6 space-y-2">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C89B3C]">
                {footerConfig.newsletter_headline}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8F5F0] leading-snug">
                {footerConfig.newsletter_prompt}
              </h3>
            </div>

            {/* Right Wide Rounded Input CTA */}
            <div className="lg:col-span-6 flex flex-col items-start lg:items-end">
              <form
                onSubmit={handleSubscribe}
                className="relative flex items-center w-full max-w-md bg-[#4A0B1B]/80 border border-[#F8F5F0]/15 rounded-full p-1.5 focus-within:border-[#C89B3C] transition-all duration-200 shadow-inner"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Stay updated with AvantusForge..."
                  required
                  className="w-full bg-transparent px-5 py-2.5 text-sm text-[#F8F5F0] placeholder:text-[#F8F5F0]/40 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Submit newsletter subscription"
                  className="w-10 h-10 rounded-full bg-[#6F1028] hover:bg-[#C89B3C] text-[#F8F5F0] hover:text-[#4A0B1B] border border-[#F8F5F0]/20 flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm group"
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              {subscribed ? (
                <p className="text-xs text-[#C89B3C] mt-2.5 font-medium">
                  Thank you for subscribing to AvantusForge updates.
                </p>
              ) : (
                <p className="text-xs text-[#F8F5F0]/60 mt-2.5 font-normal">
                  Get practical digital insights, updates, and business growth ideas.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* MAIN BODY: 3 Structured Columns with Subtle Vertical Dividers */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-0">
          {/* COLUMN 1: LEFT / MAIN BRAND COLUMN (5 cols on lg) */}
          <div className="md:col-span-12 lg:col-span-5 lg:pr-12 lg:border-r border-[#4A0B1B] space-y-6">
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-90 shrink-0 rounded-none overflow-visible"
              aria-label="AvantusForge Home"
            >
              <Image
                src="/logo-white.png"
                alt="AvantusForge — Empowering Solutions"
                width={190}
                height={48}
                className="logo-img h-8 w-auto object-contain !rounded-none"
                style={{ borderRadius: 0 }}
              />
            </Link>

            <div className="space-y-3 max-w-md">
              <p className="text-base font-semibold text-[#F8F5F0] leading-snug">
                Forging Custom Software, Modern Websites, and Scalable Digital Solutions.
              </p>
              <p className="text-xs text-[#F8F5F0]/70 leading-relaxed font-normal">
                Helping businesses build, improve, and scale their digital operations
                through dependable engineering and purpose-driven design.
              </p>
            </div>

            {/* Clear Subheading & Direct Contact Details */}
            <div className="pt-2 space-y-3">
              <h4 className="text-sm font-bold text-[#F8F5F0] tracking-wide">
                Let&apos;s Build Something That Works.
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#F8F5F0]/80">
                  <Phone className="w-3.5 h-3.5 text-[#C89B3C] shrink-0" />
                  <a
                    href="tel:+923274074472"
                    className="hover:text-[#C89B3C] transition-colors underline underline-offset-4 decoration-[#C89B3C]/30"
                  >
                    +92 327 4074472
                  </a>
                </div>

                <div className="flex items-center gap-2 text-[#F8F5F0]/80">
                  <Mail className="w-3.5 h-3.5 text-[#C89B3C] shrink-0" />
                  <a
                    href="mailto:info@avantusforge.com"
                    className="hover:text-[#C89B3C] transition-colors underline underline-offset-4 decoration-[#C89B3C]/30"
                  >
                    info@avantusforge.com
                  </a>
                </div>

                <div className="flex items-center gap-2 text-[#F8F5F0]/80">
                  <Globe className="w-3.5 h-3.5 text-[#C89B3C] shrink-0" />
                  <Link
                    href="/"
                    className="hover:text-[#C89B3C] transition-colors"
                  >
                    avantusforge.com
                  </Link>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#F8F5F0]/50 mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/avantusforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AvantusForge on LinkedIn"
                  className="w-9 h-9 rounded-full bg-[#4A0B1B] hover:bg-[#C89B3C] text-[#F8F5F0] hover:text-[#4A0B1B] border border-[#F8F5F0]/15 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/Avantusforgeofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AvantusForge on Facebook"
                  className="w-9 h-9 rounded-full bg-[#4A0B1B] hover:bg-[#C89B3C] text-[#F8F5F0] hover:text-[#4A0B1B] border border-[#F8F5F0]/15 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/avantusforgeofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AvantusForge on Instagram"
                  className="w-9 h-9 rounded-full bg-[#4A0B1B] hover:bg-[#C89B3C] text-[#F8F5F0] hover:text-[#4A0B1B] border border-[#F8F5F0]/15 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2: MIDDLE COLUMN (Our Services, 4 cols on lg) */}
          <div className="md:col-span-6 lg:col-span-4 lg:px-12 lg:border-r border-[#4A0B1B]">
            <h4 className="text-xs font-bold tracking-[0.18em] uppercase text-[#C89B3C] mb-6">
              Our Services
            </h4>
            <ul className="space-y-3.5 text-xs text-[#F8F5F0]/80 font-medium">
              <li>
                <Link
                  href="/services/custom-software-development"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Custom Software Development
                </Link>
              </li>
              <li>
                <Link
                  href="/services/business-automation"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Business Automation
                </Link>
              </li>
              <li>
                <Link
                  href="/services/erp-crm"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  SaaS, ERP &amp; CRM Systems
                </Link>
              </li>
              <li>
                <Link
                  href="/services/web-development"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Website Development
                </Link>
              </li>
              <li>
                <Link
                  href="/services/shopify-development"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Shopify &amp; E-commerce
                </Link>
              </li>
              <li>
                <Link
                  href="/services/mobile-app-development"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Mobile App Development
                </Link>
              </li>
              <li>
                <Link
                  href="/services/ui-ux-design"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/seo-digital-marketing"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  SEO &amp; Digital Marketing
                </Link>
              </li>
              <li>
                <Link
                  href="/services/amazon-services"
                  className="hover:text-[#C89B3C] font-semibold hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Amazon Marketplace Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: RIGHT COLUMN (Quick Links, 3 cols on lg) */}
          <div className="md:col-span-6 lg:col-span-3 lg:pl-12">
            <h4 className="text-xs font-bold tracking-[0.18em] uppercase text-[#C89B3C] mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-xs text-[#F8F5F0]/80 font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Leadership &amp; Team
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/work"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/industries"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Industries
                </Link>
              </li>
              <li>
                <Link
                  href="/insights"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#F8F5F0] hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR: Legal, Copyright & Circular Back-to-Top Button */}
        <div className="pt-8 border-t border-[#4A0B1B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F8F5F0]/65 font-sans">
          <div>
            {footerConfig.copyright_text || "© 2026 AvantusForge. All Rights Reserved."}
          </div>

          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link
              href="/privacy"
              className="hover:text-[#F8F5F0] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#F8F5F0] transition-colors"
            >
              Terms &amp; Conditions
            </Link>

            {/* Back to Top Circular Button */}
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-8 h-8 rounded-full bg-[#4A0B1B] hover:bg-[#C89B3C] text-[#F8F5F0] hover:text-[#4A0B1B] border border-[#F8F5F0]/15 flex items-center justify-center transition-all cursor-pointer shadow-xs group shrink-0"
            >
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
