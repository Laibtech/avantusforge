import type { Metadata, Viewport } from "next";
import { Manrope, Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import PublicSiteWrapper from "@/components/layout/PublicSiteWrapper";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
  weight: ["400"],
});

export const viewport: Viewport = {
  themeColor: "#750F2C",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://avantusforge.com"),
  title: {
    default: "AvantusForge | Custom Software, Websites & Digital Solutions",
    template: "%s | AvantusForge",
  },
  description:
    "AvantusForge builds custom software, business automation systems, modern websites, ecommerce solutions and scalable digital products for growing businesses.",
  keywords: [
    "custom software development",
    "business automation",
    "SaaS development",
    "ERP & CRM systems",
    "Shopify development",
    "WooCommerce development",
    "enterprise web applications",
    "Amazon seller account management",
    "Amazon FBA & FBM operations",
    "Amazon SEO & PPC advertising",
    "UI UX design",
    "digital growth",
  ],
  authors: [{ name: "AvantusForge", url: "https://avantusforge.com" }],
  creator: "AvantusForge",
  publisher: "AvantusForge",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://avantusforge.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://avantusforge.com",
    siteName: "AvantusForge",
    title: "AvantusForge | Custom Software, Websites & Digital Solutions",
    description:
      "AvantusForge builds custom software, business automation systems, modern websites, ecommerce solutions and scalable digital products for growing businesses.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AvantusForge - Custom Software and Digital Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AvantusForge | Custom Software, Websites & Digital Solutions",
    description:
      "Forging Custom Software, Modern Websites, and Scalable Digital Solutions for ambitious businesses.",
    creator: "@avantusforge",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AvantusForge",
  url: "https://avantusforge.com",
  logo: "https://avantusforge.com/logo.png",
  description:
    "AvantusForge builds custom software, business automation systems, modern websites, ecommerce solutions and scalable digital products for growing businesses.",
  email: "info@avantusforge.com",
  telephone: "+92 327 4074472",
  brand: {
    "@type": "Brand",
    name: "AvantusForge",
    slogan: "Forging Custom Software, Modern Websites, and Scalable Digital Solutions.",
  },
  areaServed: ["UK", "USA", "UAE", "Kuwait", "Pakistan"],
  knowsAbout: [
    "Custom Software Development",
    "Business Automation",
    "SaaS Architecture",
    "ERP and CRM Systems",
    "Shopify and Ecommerce Engineering",
    "Enterprise Web Systems",
  ],
};

import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${inter.variable} ${dmSerif.variable} scroll-smooth`}
    >
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && process.env.NEXT_PUBLIC_GA_ID !== "G-XXXXXXXXXX" && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-inline" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');` }} />
          </>
        )}
        <Script
          type="application/ld+json"
          id="ld-json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#FCFAF8] text-[#191416] antialiased selection:bg-[#750F2C] selection:text-white font-sans flex flex-col"
      >
        <AnalyticsTracker />
        <PublicSiteWrapper>{children}</PublicSiteWrapper>
      </body>
    </html>
  );
}
