"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);
  const pageEnterTime = useRef<number>(Date.now());

  useEffect(() => {
    // Do not track admin portal views or API calls
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_next")) {
      return;
    }

    // Avoid double counting same path in rapid succession
    if (lastTrackedPath.current === pathname) return;
    const previousPath = lastTrackedPath.current || "";
    lastTrackedPath.current = pathname;
    pageEnterTime.current = Date.now();

    try {
      // 1. Session management via sessionStorage
      let sessionId = sessionStorage.getItem("af_session_id");
      if (!sessionId) {
        sessionId = "af_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now();
        sessionStorage.setItem("af_session_id", sessionId);
        sessionStorage.setItem("af_landing_page", pathname);
      }

      // 2. Returning visitor detection via localStorage
      const isReturning = Boolean(localStorage.getItem("af_visited_before"));
      localStorage.setItem("af_visited_before", "true");

      const payload = JSON.stringify({
        type: "pageview",
        path: pathname,
        previous_path: previousPath || undefined,
        referrer: document.referrer || "Direct",
        session_id: sessionId,
        is_returning: isReturning,
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

    // 3. Periodic heartbeat for live active status & accurate session duration
    const HEARTBEAT_INTERVAL_MS = 25000; // 25 seconds
    const intervalId = setInterval(() => {
      if (document.visibilityState !== "visible") return;

      try {
        const sid = sessionStorage.getItem("af_session_id");
        if (!sid) return;

        const heartbeatPayload = JSON.stringify({
          type: "heartbeat",
          path: pathname,
          session_id: sid,
          duration: 25,
        });

        if (navigator.sendBeacon) {
          const blob = new Blob([heartbeatPayload], { type: "application/json" });
          navigator.sendBeacon("/api/track", blob);
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: heartbeatPayload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // safe fallback
      }
    }, HEARTBEAT_INTERVAL_MS);

    // 4. Send exit duration on tab visibility change or unload
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        try {
          const sid = sessionStorage.getItem("af_session_id");
          if (!sid) return;
          const dwellSeconds = Math.max(1, Math.round((Date.now() - pageEnterTime.current) / 1000));
          const exitPayload = JSON.stringify({
            type: "heartbeat",
            path: pathname,
            session_id: sid,
            duration: dwellSeconds,
          });

          if (navigator.sendBeacon) {
            const blob = new Blob([exitPayload], { type: "application/json" });
            navigator.sendBeacon("/api/track", blob);
          }
        } catch {
          // safe fallback
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
