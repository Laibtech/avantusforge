"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Code2,
  Cpu,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react";

type ServiceCategoryId = "BUILD" | "AUTOMATE" | "COMMERCE" | "GROW" | "AMAZON";

interface ServiceItem {
  title: string;
  href: string;
}

interface ServiceCategoryConfig {
  id: ServiceCategoryId;
  title: string;
  tagline: string;
  icon: React.ElementType;
  items: ServiceItem[];
}

const SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  {
    id: "BUILD",
    title: "BUILD",
    tagline: "Custom Software & Web Apps",
    icon: Code2,
    items: [
      {
        title: "Custom Software Development",
        href: "/services/custom-software-development",
      },
      {
        title: "Web Development",
        href: "/services/web-development",
      },
      {
        title: "Mobile Applications",
        href: "/services/mobile-app-development",
      },
      {
        title: "SaaS Development",
        href: "/services/saas-development",
      },
      {
        title: "ERP & CRM Systems",
        href: "/services/erp-crm",
      },
    ],
  },
  {
    id: "AUTOMATE",
    title: "AUTOMATE",
    tagline: "Workflows & Integrations",
    icon: Cpu,
    items: [
      {
        title: "Business Automation",
        href: "/services/business-automation",
      },
      {
        title: "Workflow Automation",
        href: "/services/business-automation",
      },
      {
        title: "API Integrations",
        href: "/services/custom-software-development",
      },
      {
        title: "Enterprise Admin Portals",
        href: "/services/custom-software-development",
      },
      {
        title: "Reporting & Data Hubs",
        href: "/services/custom-software-development",
      },
    ],
  },
  {
    id: "COMMERCE",
    title: "COMMERCE",
    tagline: "Digital Commerce & Headless",
    icon: ShoppingCart,
    items: [
      {
        title: "E-commerce Development",
        href: "/services/ecommerce-development",
      },
      {
        title: "Shopify 2.0 Development",
        href: "/services/shopify-development",
      },
      {
        title: "WooCommerce Development",
        href: "/services/ecommerce-development",
      },
      {
        title: "Headless Storefronts",
        href: "/services/ecommerce-development",
      },
      {
        title: "Checkout & Conversion Tuning",
        href: "/services/ecommerce-development",
      },
    ],
  },
  {
    id: "GROW",
    title: "GROW",
    tagline: "SEO, Performance & Scale",
    icon: TrendingUp,
    items: [
      {
        title: "SEO & Search Optimization",
        href: "/services/seo-digital-marketing",
      },
      {
        title: "Social Media Marketing",
        href: "/services/seo-digital-marketing",
      },
      {
        title: "Performance PPC Ads",
        href: "/services/seo-digital-marketing",
      },
      {
        title: "Content & Editorial Strategy",
        href: "/services/seo-digital-marketing",
      },
      {
        title: "Attribution & Analytics Setup",
        href: "/services/seo-digital-marketing",
      },
    ],
  },
  {
    id: "AMAZON",
    title: "AMAZON SERVICES",
    tagline: "Marketplace Operations & Scale",
    icon: Package,
    items: [
      {
        title: "Amazon Account Management",
        href: "/services/amazon-seller-account-management",
      },
      {
        title: "Amazon SEO & Listing Optimization",
        href: "/services/amazon-seo-keyword-research",
      },
      {
        title: "Amazon Product Research",
        href: "/services/product-research-hunting",
      },
      {
        title: "Amazon FBA & FBM Management",
        href: "/services/amazon-fba-management",
      },
      {
        title: "Amazon PPC Management",
        href: "/services/amazon-ppc-sponsored-ads",
      },
      {
        title: "Amazon Brand Store & A+ Content",
        href: "/services/amazon-brand-store-design",
      },
    ],
  },
];

const ABOUT_ITEMS = [
  {
    name: "Our Story",
    href: "/about",
    description: "Agency vision, engineering philosophy, and history.",
  },
  {
    name: "Leadership & Team",
    href: "/team",
    description: "Meet the people behind GIA Corporation.",
  },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<ServiceCategoryId | null>("BUILD");
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setServicesOpen(false);
    setAboutOpen(false);
    setMobileMenuOpen(false);
  }

  const [logoSrc, setLogoSrc] = useState("/logo.png");
  const [ctaButtonText, setCtaButtonText] = useState("Get a Free Consultation");
  const [ctaButtonHref, setCtaButtonHref] = useState("/contact");

  useEffect(() => {
    fetch("/api/admin/navigation")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.navigation) {
          if (d.navigation.logo_url) setLogoSrc(d.navigation.logo_url);
          if (d.navigation.consultation_cta_text) setCtaButtonText(d.navigation.consultation_cta_text);
          if (d.navigation.consultation_cta_url) setCtaButtonHref(d.navigation.consultation_cta_url);
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard navigation: Escape key closes menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setAboutOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setAboutOpen(false);
    setServicesOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 220);
  };

  const handleAboutMouseEnter = () => {
    if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
    setServicesOpen(false);
    setAboutOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => {
      setAboutOpen(false);
    }, 200);
  };

  const buildCat = SERVICE_CATEGORIES.find((c) => c.id === "BUILD")!;
  const automateCat = SERVICE_CATEGORIES.find((c) => c.id === "AUTOMATE")!;
  const commerceCat = SERVICE_CATEGORIES.find((c) => c.id === "COMMERCE")!;
  const growCat = SERVICE_CATEGORIES.find((c) => c.id === "GROW")!;
  const amazonCat = SERVICE_CATEGORIES.find((c) => c.id === "AMAZON")!;

  return (
    <header className="sticky top-0 z-50 w-full relative pointer-events-none">
      <div
        className={`max-w-[1360px] mx-auto px-4 sm:px-6 transition-all duration-200 pointer-events-auto ${
          scrolled ? "pt-2" : "pt-3 sm:pt-4"
        }`}
      >
        <div
          className={`bg-white/95 backdrop-blur-md border border-[#E8DDE0]/80 rounded-2xl px-6 sm:px-8 flex items-center justify-between transition-all duration-200 ${
            scrolled
              ? "py-2.5 shadow-[0_6px_24px_rgba(25,20,22,0.06)]"
              : "py-3 shadow-[0_4px_20px_rgba(25,20,22,0.04)]"
          }`}
        >
          {/* LEFT: AvantusForge Logo */}
          <Link
            href="/"
            className="flex items-center select-none group shrink-0 rounded-none overflow-visible"
            aria-label="AvantusForge Home"
          >
            <Image
              src={logoSrc}
              alt="AvantusForge — Empowering Solutions"
              width={210}
              height={56}
              className="logo-img h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90 !rounded-none"
              style={{ borderRadius: 0 }}
              priority
            />
          </Link>

          {/* CENTER: Exact Top-Level Navigation Links */}
          <nav
            className="hidden lg:flex items-center space-x-8 text-[13px] font-medium tracking-tight text-[#191416]"
            aria-label="Main Navigation"
          >
            {/* 1. Home */}
            <Link
              href="/"
              className={`py-2 transition-colors duration-150 ${
                pathname === "/"
                  ? "text-[#750F2C] font-bold"
                  : "text-[#191416] hover:text-[#750F2C]"
              }`}
            >
              Home
            </Link>

            {/* 2. Services with Mega-Menu Trigger */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/services"
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                className={`flex items-center gap-1 py-2 transition-colors duration-150 ${
                  servicesOpen || pathname.startsWith("/services")
                    ? "text-[#750F2C] font-semibold"
                    : "text-[#191416] hover:text-[#750F2C]"
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    servicesOpen ? "rotate-180 text-[#750F2C]" : "text-[#6F6568]"
                  }`}
                />
              </Link>
            </div>

            {/* 3. Solutions */}
            <Link
              href="/industries"
              className={`py-2 transition-colors duration-150 ${
                pathname.startsWith("/industries")
                  ? "text-[#750F2C] font-semibold"
                  : "text-[#191416] hover:text-[#750F2C]"
              }`}
            >
              Solutions
            </Link>

            {/* 4. Work */}
            <Link
              href="/work"
              className={`py-2 transition-colors duration-150 ${
                pathname.startsWith("/work")
                  ? "text-[#750F2C] font-semibold"
                  : "text-[#191416] hover:text-[#750F2C]"
              }`}
            >
              Work
            </Link>

            {/* 5. About Dropdown (Contains: Our Story, Leadership & Team) */}
            <div
              className="relative"
              onMouseEnter={handleAboutMouseEnter}
              onMouseLeave={handleAboutMouseLeave}
            >
              <Link
                href="/about"
                aria-haspopup="true"
                aria-expanded={aboutOpen}
                className={`flex items-center gap-1 py-2 transition-colors duration-150 ${
                  aboutOpen || pathname === "/about" || pathname.startsWith("/team")
                    ? "text-[#750F2C] font-semibold"
                    : "text-[#191416] hover:text-[#750F2C]"
                }`}
              >
                <span>About</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    aboutOpen ? "rotate-180 text-[#750F2C]" : "text-[#6F6568]"
                  }`}
                />
              </Link>

              {/* Desktop About Dropdown Menu (Clean, Borderless List) */}
              {aboutOpen && (
                <div
                  className="absolute left-0 top-full pt-2 w-72 z-50 animate-megamenu"
                  onMouseEnter={handleAboutMouseEnter}
                  onMouseLeave={handleAboutMouseLeave}
                >
                  <div className="bg-white rounded-xl border border-[#E8DDE0]/80 p-2 shadow-[0_14px_36px_rgba(25,20,22,0.08)] space-y-1">
                    {ABOUT_ITEMS.map((item) => {
                      const isItemActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setAboutOpen(false)}
                          className={`block p-2.5 rounded-lg transition-colors group ${
                            isItemActive
                              ? "bg-[#F7EEF1] text-[#750F2C]"
                              : "hover:bg-[#FCFAF8] text-[#191416]"
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span className="group-hover:text-[#750F2C] transition-colors">
                              {item.name}
                            </span>
                            <ArrowRight className="w-3 h-3 text-[#750F2C] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[11px] text-[#6F6568] mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Insights (Appears ONCE in top-level navigation) */}
            <Link
              href="/insights"
              className={`py-2 transition-colors duration-150 ${
                pathname.startsWith("/insights")
                  ? "text-[#750F2C] font-semibold"
                  : "text-[#191416] hover:text-[#750F2C]"
              }`}
            >
              Insights
            </Link>

            {/* 7. Contact */}
            <Link
              href="/contact"
              className={`py-2 transition-colors duration-150 ${
                pathname === "/contact"
                  ? "text-[#750F2C] font-semibold"
                  : "text-[#191416] hover:text-[#750F2C]"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* RIGHT: Get a Free Consultation Button */}
          <div className="hidden lg:flex items-center">
            <Link
              href={ctaButtonHref}
              className="inline-flex items-center gap-2 bg-[#750F2C] hover:bg-[#52091E] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <span>{ctaButtonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#191416] hover:text-[#750F2C] transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP SERVICES MEGA MENU (Clean, Editorial, Non-Boxed Layout) */}
      {servicesOpen && (
        <div
          ref={megaMenuRef}
          id="services-mega-menu"
          role="region"
          aria-label="Services Mega Menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="hidden lg:block absolute left-0 right-0 top-full w-full pt-2 px-4 sm:px-6 lg:px-8 pointer-events-auto z-50 animate-megamenu"
        >
          {/* Invisible Hover Bridge */}
          <div className="absolute -top-3 inset-x-0 h-4 bg-transparent pointer-events-auto" />

          <div className="max-w-[1360px] mx-auto rounded-2xl bg-white shadow-[0_24px_60px_rgba(25,20,22,0.08)] border border-[#E8DDE0]/80 p-8 xl:p-9 text-[#191416] relative">
            {/* 5-Column Editorial Layout: Build, Automate, Commerce, Grow, Amazon Services */}
            <div className="grid grid-cols-5 gap-6 xl:gap-8 divide-x divide-[#E8DDE0]/50 -mr-4">
              {/* 1. BUILD */}
              <div className="pr-4 space-y-3">
                <div className="flex items-center gap-2 pb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#F8EEF1] text-[#750F2C] flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-[#750F2C] uppercase font-mono">
                      BUILD
                    </h3>
                    <p className="text-[11px] text-[#827478]">Custom Engineering</p>
                  </div>
                </div>
                <ul className="space-y-1 pt-1">
                  {buildCat.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between text-[13px] text-[#42393D] hover:text-[#750F2C] py-1 transition-colors"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {item.title}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#750F2C] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. AUTOMATE */}
              <div className="px-4 space-y-3">
                <div className="flex items-center gap-2 pb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#F8EEF1] text-[#750F2C] flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-[#750F2C] uppercase font-mono">
                      AUTOMATE
                    </h3>
                    <p className="text-[11px] text-[#827478]">Workflows &amp; Systems</p>
                  </div>
                </div>
                <ul className="space-y-1 pt-1">
                  {automateCat.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between text-[13px] text-[#42393D] hover:text-[#750F2C] py-1 transition-colors"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {item.title}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#750F2C] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. COMMERCE */}
              <div className="px-4 space-y-3">
                <div className="flex items-center gap-2 pb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#F8EEF1] text-[#750F2C] flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-[#750F2C] uppercase font-mono">
                      COMMERCE
                    </h3>
                    <p className="text-[11px] text-[#827478]">Storefront Architecture</p>
                  </div>
                </div>
                <ul className="space-y-1 pt-1">
                  {commerceCat.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between text-[13px] text-[#42393D] hover:text-[#750F2C] py-1 transition-colors"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {item.title}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#750F2C] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. GROW */}
              <div className="px-4 space-y-3">
                <div className="flex items-center gap-2 pb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#F8EEF1] text-[#750F2C] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-[#750F2C] uppercase font-mono">
                      GROW
                    </h3>
                    <p className="text-[11px] text-[#827478]">SEO &amp; Acquisition</p>
                  </div>
                </div>
                <ul className="space-y-1 pt-1">
                  {growCat.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between text-[13px] text-[#42393D] hover:text-[#750F2C] py-1 transition-colors"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {item.title}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#750F2C] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. AMAZON SERVICES (Featured Column, Clean and Integrated) */}
              <div className="pl-4 pr-1">
                <div className="bg-[#FAF5F7] rounded-xl p-4 sm:p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#750F2C] text-white flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold tracking-wider text-[#750F2C] uppercase font-mono">
                          AMAZON SERVICES
                        </h3>
                        <p className="text-[10.5px] text-[#827478]">Marketplace Operations</p>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-1 pt-1">
                    {amazonCat.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className="group flex items-center justify-between text-[12px] text-[#3D3337] hover:text-[#750F2C] py-0.5 transition-colors font-medium"
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform truncate">
                            {item.title}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#750F2C] opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-[#750F2C]/15">
                    <Link
                      href="/services/amazon-services"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#750F2C] hover:text-[#52091E] transition-colors group cursor-pointer"
                    >
                      <span>Explore Amazon Landing Page</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* MEGA MENU BOTTOM BAR */}
            <div className="mt-7 pt-4 border-t border-[#E8DDE0]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-[#6F6568]">
                <span className="w-2 h-2 rounded-full bg-[#750F2C]" />
                <span>
                  Looking for full-lifecycle architecture? Explore all 31 specialized agency &amp; marketplace services.
                </span>
                <Link
                  href="/services"
                  className="font-bold text-[#750F2C] hover:underline ml-1"
                >
                  View All Services →
                </Link>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs font-bold text-white transition-all bg-[#750F2C] hover:bg-[#52091E] px-4 py-2 rounded-lg shadow-2xs hover:shadow-xs group cursor-pointer"
              >
                <span>Schedule Technical Consultation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[65px] bottom-0 bg-[#FCFAF8] z-50 lg:hidden overflow-y-auto border-t border-[#E8DDE0] px-6 py-6 flex flex-col justify-between text-[#191416] pointer-events-auto">
          <div className="space-y-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#191416] py-2 border-b border-[#E8DDE0] hover:text-[#750F2C] transition-colors"
            >
              Home
            </Link>

            {/* Services Mobile Accordion Group */}
            <div className="border-b border-[#E8DDE0] pb-3">
              <div className="flex items-center justify-between py-2 text-base font-semibold text-[#191416]">
                <span>Services</span>
                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-[#750F2C] hover:underline"
                >
                  Overview →
                </Link>
              </div>

              {/* 5 Category Mobile Accordions (including Amazon Services) */}
              <div className="space-y-2 mt-2">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isExpanded = mobileCategoryOpen === cat.id;
                  const Icon = cat.icon;

                  return (
                    <div
                      key={cat.id}
                      className="rounded-xl border border-[#E8DDE0]/80 bg-white overflow-hidden transition-all duration-200 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setMobileCategoryOpen(isExpanded ? null : cat.id)
                        }
                        className="w-full flex items-center justify-between p-3 text-left text-sm font-bold tracking-wide text-[#191416] cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-[#F8EEF1] text-[#750F2C] flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{cat.title}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#750F2C] transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-3.5 pb-3 pt-1 border-t border-[#E8DDE0]/60 bg-[#FCFAF8] space-y-2">
                          <ul className="space-y-1.5">
                            {cat.items.map((item) => (
                              <li key={item.title}>
                                <Link
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center justify-between text-xs text-[#5A5054] hover:text-[#750F2C] py-1 transition-colors"
                                >
                                  <span>{item.title}</span>
                                  <ArrowRight className="w-3 h-3 text-[#750F2C]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 border-t border-[#E8DDE0]/60">
                            <Link
                              href={
                                cat.id === "AMAZON"
                                  ? "/services/amazon-services"
                                  : "/services"
                              }
                              onClick={() => setMobileMenuOpen(false)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#750F2C]"
                            >
                              <span>
                                {cat.id === "AMAZON"
                                  ? "Explore Amazon Landing Page →"
                                  : `View all ${cat.id.toLowerCase()} services →`}
                              </span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              href="/industries"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#191416] py-2 border-b border-[#E8DDE0] hover:text-[#750F2C] transition-colors"
            >
              Solutions
            </Link>

            <Link
              href="/work"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#191416] py-2 border-b border-[#E8DDE0] hover:text-[#750F2C] transition-colors"
            >
              Work
            </Link>

            {/* Mobile About Accordion (Contains: Our Story, Leadership & Team) */}
            <div className="border-b border-[#E8DDE0] pb-2">
              <button
                type="button"
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className="w-full flex items-center justify-between py-2 text-base font-semibold text-[#191416] hover:text-[#750F2C] cursor-pointer"
              >
                <span>About</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#750F2C] transition-transform duration-200 ${
                    mobileAboutOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAboutOpen && (
                <div className="pl-3 pr-2 py-2 space-y-2 bg-[#FCFAF8] rounded-lg mt-1 border border-[#E8DDE0]/60">
                  {ABOUT_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm font-semibold text-[#191416] hover:text-[#750F2C] py-1"
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        <ArrowRight className="w-3 h-3 text-[#750F2C]" />
                      </div>
                      <span className="text-[11px] text-[#6F6568] font-normal block">
                        {item.description}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Insights (Single entry) */}
            <Link
              href="/insights"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#191416] py-2 border-b border-[#E8DDE0] hover:text-[#750F2C] transition-colors"
            >
              Insights
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#191416] py-2 border-b border-[#E8DDE0] hover:text-[#750F2C] transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="pt-6 border-t border-[#E8DDE0] space-y-4">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#750F2C] hover:bg-[#52091E] text-white py-3.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              <span>Get a Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-center text-xs text-[#6F6568] space-y-1 pt-1">
              <div>
                Direct:{" "}
                <a
                  href="tel:+923274074472"
                  className="text-[#750F2C] font-semibold hover:underline"
                >
                  +92 327 4074472
                </a>
              </div>
              <div>
                Email:{" "}
                <a
                  href="mailto:info@avantusforge.com"
                  className="text-[#750F2C] font-semibold hover:underline"
                >
                  info@avantusforge.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
