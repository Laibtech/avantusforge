"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

interface PublicSiteWrapperProps {
  children: React.ReactNode;
}

/**
 * PublicSiteWrapper conditionally wraps content with the public website Header & Footer.
 * If the current route is within the admin console (/admin/*) or an API route,
 * it renders the children directly, allowing the dedicated AdminLayout to control
 * navigation, sidebar, and layout without leaking marketing elements.
 */
export default function PublicSiteWrapper({ children }: PublicSiteWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname ? pathname.startsWith("/admin") : false;

  if (isAdminRoute) {
    return <div className="min-h-screen flex flex-col flex-1">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
