"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Globe,
  Clock,
  Compass,
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Activity,
  Calendar,
  Layers,
  MapPin,
  Wifi,
  Eye,
  Loader2,
} from "lucide-react";
import { AdminBadge, AdminButton } from "@/components/admin/ui";

interface SessionTimelineItem {
  id: number;
  session_id: string;
  path: string;
  previous_path?: string;
  referrer: string;
  referrer_source: string;
  device_type: string;
  browser: string;
  os: string;
  country: string;
  country_code: string;
  city: string;
  masked_ip: string;
  duration_seconds: number;
  created_at: string;
}

interface VisitorSessionDetail {
  id: string;
  ip_address?: string;
  masked_ip: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  landing_page: string;
  current_page: string;
  previous_page?: string;
  referrer: string;
  referrer_source: string;
  is_returning: boolean;
  total_pageviews: number;
  duration_seconds: number;
  started_at: string;
  last_seen_at: string;
}

interface VisitorDetailDrawerProps {
  sessionId: string | null;
  onClose: () => void;
  canViewRawIp: boolean;
}

export default function VisitorDetailDrawer({
  sessionId,
  onClose,
  canViewRawIp,
}: VisitorDetailDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<VisitorSessionDetail | null>(null);
  const [timeline, setTimeline] = useState<SessionTimelineItem[]>([]);
  const [showRawIp, setShowRawIp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    setShowRawIp(false);

    const fetchSession = async () => {
      try {
        const url = `/api/admin/visitors?session_id=${encodeURIComponent(sessionId)}${
          showRawIp ? "&include_raw_ip=1" : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setSession(data.session);
          setTimeline(data.timeline || []);
        } else {
          setError(data.message || "Failed to load session telemetry.");
        }
      } catch (err: any) {
        setError(err.message || "Network communication error.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, showRawIp]);

  if (!sessionId) return null;

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return iso;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#EADFE3] overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EADFE3] bg-[#FAF7F7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EADFE3] flex items-center justify-center text-[#74102E] shadow-2xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#74102E]">
                  Visitor Journey
                </span>
                {session?.is_returning ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Returning Visitor
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#159B70] border border-emerald-200">
                    First-Time Visitor
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-[#24151B] truncate max-w-sm">
                Session Inspection
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#EADFE3] bg-white text-[#777078] hover:text-[#24151B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#74102E]" />
              <p className="text-xs text-[#777078] font-mono">Loading telemetry journey...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          ) : session ? (
            <>
              {/* Identity & Geolocation Card */}
              <div className="p-4 rounded-xl border border-[#EADFE3] bg-[#FAF7F7]/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EADFE3]/60">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
                    Network &amp; Geolocation
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#777078]">
                    ID: {session.id.slice(0, 16)}...
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#777078] block">IP Address</span>
                    <div className="font-mono font-bold text-[#24151B] flex items-center gap-1.5 mt-0.5">
                      <span>{showRawIp && session.ip_address ? session.ip_address : session.masked_ip}</span>
                    </div>
                    {canViewRawIp && (
                      <button
                        type="button"
                        onClick={() => setShowRawIp(!showRawIp)}
                        className="text-[10px] text-[#74102E] font-bold underline cursor-pointer hover:text-[#4A0B20] mt-0.5"
                      >
                        {showRawIp ? "Mask IP" : "View Raw IP (Admin Audit)"}
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777078] block">Approx. Location</span>
                    <div className="font-semibold text-[#24151B] flex items-center gap-1.5 mt-0.5">
                      <Globe className="w-3.5 h-3.5 text-[#74102E]" />
                      <span>
                        {session.city ? `${session.city}, ` : ""}
                        {session.country}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#777078]">
                      Timezone: {session.timezone || "UTC"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777078] block">Network / ISP</span>
                    <div className="font-medium text-[#24151B] flex items-center gap-1.5 mt-0.5 truncate">
                      <Wifi className="w-3.5 h-3.5 text-[#777078]" />
                      <span className="truncate">{session.isp || "Standard Telecom / ISP"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777078] block">Device &amp; Browser</span>
                    <div className="font-medium text-[#24151B] flex items-center gap-1.5 mt-0.5">
                      {getDeviceIcon(session.device_type)}
                      <span>
                        {session.browser} on {session.os}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Stats Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-[#EADFE3] bg-white text-center">
                  <span className="text-[10px] font-mono text-[#777078] uppercase block">
                    Duration
                  </span>
                  <span className="text-lg font-black text-[#74102E] font-mono">
                    {formatDuration(session.duration_seconds || 0)}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-[#EADFE3] bg-white text-center">
                  <span className="text-[10px] font-mono text-[#777078] uppercase block">
                    Pages Viewed
                  </span>
                  <span className="text-lg font-black text-[#24151B] font-mono">
                    {session.total_pageviews}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-[#EADFE3] bg-white text-center">
                  <span className="text-[10px] font-mono text-[#777078] uppercase block">
                    Source
                  </span>
                  <span className="text-xs font-bold text-[#24151B] truncate block mt-1">
                    {session.referrer_source}
                  </span>
                </div>
              </div>

              {/* Chronological Navigation Journey */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#74102E]">
                    Chronological Page Activity
                  </span>
                  <span className="text-[10px] font-mono text-[#777078]">
                    Started at {formatDateTime(session.started_at)}
                  </span>
                </div>

                {timeline.length === 0 ? (
                  <div className="p-4 rounded-xl border border-[#EADFE3] text-center text-xs text-[#777078]">
                    No pageview history recorded for this session.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EADFE3]">
                    {timeline.map((step, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === timeline.length - 1;

                      return (
                        <div key={step.id} className="relative group">
                          {/* Dot indicator */}
                          <div
                            className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-125 ${
                              isLast
                                ? "border-[#159B70] text-[#159B70]"
                                : isFirst
                                ? "border-[#74102E] text-[#74102E]"
                                : "border-[#777078] text-[#777078]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLast ? "bg-[#159B70]" : isFirst ? "bg-[#74102E]" : "bg-[#777078]"
                              }`}
                            />
                          </div>

                          {/* Card Content */}
                          <div className="p-3 rounded-xl border border-[#EADFE3] bg-white hover:border-[#74102E]/30 transition-all text-xs space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[#74102E] text-xs">
                                {step.path}
                              </span>
                              <span className="text-[10px] font-mono text-[#777078]">
                                {formatDateTime(step.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#777078] pt-1 border-t border-[#EADFE3]/40">
                              <span>
                                {isFirst ? (
                                  <span className="font-semibold text-[#24151B]">
                                    Landing Page (via {step.referrer || "Direct"})
                                  </span>
                                ) : isLast ? (
                                  <span className="font-semibold text-[#159B70]">
                                    Current / Latest Active Page
                                  </span>
                                ) : (
                                  <span>Navigated from {step.previous_path || "prior page"}</span>
                                )}
                              </span>

                              {step.duration_seconds > 0 && (
                                <span className="font-mono text-[10px] text-[#74102E] font-bold">
                                  {formatDuration(step.duration_seconds)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Privacy Notice Card */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs text-[#159B70] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#159B70]" />
                  <span>Privacy Compliance Standards</span>
                </div>
                <p className="text-[11px] text-[#777078] leading-relaxed">
                  No personal identifiable information (PII), form input, passwords, or precise GPS
                  coordinates are collected. All IP addresses are masked by default according to
                  GDPR minimization principles.
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EADFE3] bg-[#FAF7F7] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#777078]">
            AvantusForge Telemetry Engine v2.0
          </span>
          <AdminButton variant="secondary" size="sm" onClick={onClose}>
            Close Inspection
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

