"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  RefreshCw,
  Globe,
  Smartphone,
  Laptop,
  Compass,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  Pause,
  Play,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
} from "@/components/admin/ui";

interface ActiveSession {
  id: string;
  landing_page: string;
  referrer: string;
  device_type: string;
  country: string;
  total_pageviews: number;
  duration_seconds: number;
  started_at: string;
  last_seen_at: string;
  seconds_ago: number;
}

interface PageviewEvent {
  id: number;
  session_id: string;
  path: string;
  referrer: string;
  device_type: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  created_at: string;
  seconds_ago: number;
}

export default function AdminLiveVisitorsPage() {
  const [activeNow, setActiveNow] = useState(0);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [pageviews, setPageviews] = useState<PageviewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/visitors");
      const data = await res.json();
      if (data.success) {
        setActiveNow(data.activeNow);
        setSessions(data.sessions || []);
        setPageviews(data.recentPageviews || []);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Live telemetry polling error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatAgo = (sec: number) => {
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    return `${Math.floor(min / 60)}h ago`;
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Top Banner */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Live Visitors" }]}
        eyebrow="Live Telemetry Stream"
        title="Real-Time Active Visitors"
        description="First-party privacy-conscious visitor session tracker with sub-second event ingestion."
        badge={`${activeNow} Active Users`}
        badgeColor="success"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              autoRefresh
                ? "bg-emerald-50 text-[#159B70] border-emerald-200"
                : "bg-white text-[#777078] border-[#EADFE3] hover:text-[#24151B]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-[#159B70] animate-pulse" : "bg-[#777078]"}`}
            />
            <span>{autoRefresh ? "Live Sync (5s)" : "Sync Paused"}</span>
          </button>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={fetchData}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#159B70]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
              Active In Last 5 Mins
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-4xl font-black text-[#24151B]">{activeNow}</div>
          <div className="text-xs text-[#159B70] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#159B70] animate-ping" />
            <span>Live connected public sessions</span>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
              Sessions In Last 30 Mins
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-black text-[#24151B]">{sessions.length}</div>
          <div className="text-xs text-[#777078]">
            Updated at {lastRefreshed || "Just now"}
          </div>
        </div>

        <div className="p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#159B70]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
              Data Privacy Standard
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#24151B]">First-Party SHA256</div>
          <div className="text-xs text-[#777078]">
            Zero third-party trackers or PII storage
          </div>
        </div>
      </div>

      {/* Real-Time Split: Active Sessions & Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Sessions List */}
        <div className="lg:col-span-7 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60 flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                Session Telemetry
              </span>
              <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Recent Active Sessions</h3>
              <p className="text-xs text-[#777078]">Unique visitor devices recorded in the last 30 minutes.</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#74102E] bg-[#FBF4F6] border border-[#EADFE3] px-2.5 py-1 rounded-lg">
              {sessions.length} Sessions
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#777078]">
              No active sessions recorded in the past 30 minutes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EADFE3] text-[#777078] uppercase tracking-wider text-[10px] font-mono">
                    <th className="pb-3 font-bold">Session &amp; Country</th>
                    <th className="pb-3 font-bold">Landing Route</th>
                    <th className="pb-3 font-bold">Device</th>
                    <th className="pb-3 font-bold">Views</th>
                    <th className="pb-3 font-bold text-right">Last Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFE3]/60">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF7F7] transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-[#24151B] flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-[#74102E]" />
                          <span>{s.country || "United Kingdom"}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#777078]">{s.id.slice(0, 18)}...</div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[#24151B] text-[11px] font-semibold">{s.landing_page}</span>
                        <div className="text-[10px] text-[#777078] truncate max-w-[140px]">{s.referrer}</div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-[#FAF7F7] border border-[#EADFE3] rounded text-[10px] uppercase font-bold text-[#24151B]">
                          {s.device_type}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-[#24151B]">
                        {s.total_pageviews} pv
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            s.seconds_ago < 120
                              ? "bg-emerald-50 text-[#159B70] border-emerald-200"
                              : "bg-[#FAF7F7] text-[#777078] border-[#EADFE3]"
                          }`}
                        >
                          {formatAgo(s.seconds_ago || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Pageviews Ingestion Stream */}
        <div className="lg:col-span-5 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                Activity Stream
              </span>
              <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Live Event Stream</h3>
              <p className="text-xs text-[#777078]">Chronological log of recent page loads.</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          {pageviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#777078]">No pageview events recorded.</div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {pageviews.map((pv) => (
                <div
                  key={pv.id}
                  className="p-3 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] hover:bg-[#F2ECEF]/60 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#74102E] text-[11px] truncate max-w-[200px]">
                      {pv.path}
                    </span>
                    <span className="text-[10px] font-mono text-[#777078]">
                      {formatAgo(pv.seconds_ago || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#777078]">
                    <span>
                      {pv.browser} • {pv.os} ({pv.device_type})
                    </span>
                    <span className="font-semibold text-[#24151B]">{pv.country}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
