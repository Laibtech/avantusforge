"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Ensure every page transition begins from the top position
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return <div className="page-transition-wrap min-h-screen flex flex-col">{children}</div>;
}
