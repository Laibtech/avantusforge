"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid double counting same path in rapid succession
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    // Do not track admin portal views
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    try {
      // Get or create anonymous session token
      let sessionId = sessionStorage.getItem("af_session_id");
      if (!sessionId) {
        sessionId = "af_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now();
        sessionStorage.setItem("af_session_id", sessionId);
      }

      const payload = JSON.stringify({
        path: pathname,
        referrer: document.referrer || "Direct",
        session_id: sessionId,
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // safe fallback
    }
  }, [pathname]);

  return null;
}
