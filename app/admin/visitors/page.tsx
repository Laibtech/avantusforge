"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Radio,
  RefreshCw,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  Compass,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  Pause,
  Play,
  Download,
  Filter,
  Search,
  Trash2,
  MapPin,
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
} from "@/components/admin/ui";
import LiveVisitorMap from "@/components/admin/visitors/LiveVisitorMap";
import VisitorDetailDrawer from "@/components/admin/visitors/VisitorDetailDrawer";

interface ActiveSessionItem {
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
  referrer_source: "Direct" | "Organic Search" | "Social Media" | "Referral" | "Campaign";
  is_returning: boolean;
  total_pageviews: number;
  duration_seconds: number;
  started_at: string;
  last_seen_at: string;
  seconds_ago: number;
  flag: string;
}

interface PageviewEventItem {
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
  seconds_ago: number;
}

interface TelemetryResponse {
  success: boolean;
  activeNow: number;
  todayVisitors: number;
  todayPageviews: number;
  uniqueVisitors: number;
  avgSessionDurationSec: number;
  activeSessions: ActiveSessionItem[];
  recentPageviews: PageviewEventItem[];
  topPages: { path: string; views: number; uniqueVisitors: number }[];
  topCountries: { country: string; countryCode: string; flag: string; count: number; percentage: number }[];
  topCities: { city: string; country: string; flag: string; count: number }[];
  trafficSources: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  canViewRawIp: boolean;
  currentUserRole: string;
}

export default function AdminLiveVisitorsPage() {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "IDLE">("ALL");

  // Retention cleanup state
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (countryFilter) params.set("country", countryFilter);
      if (sourceFilter !== "ALL") params.set("source", sourceFilter);

      const res = await fetch(`/api/admin/visitors?${params.toString()}`);
      const json: TelemetryResponse = await res.json();
      if (json.success) {
        setData(json);
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
  }, [autoRefresh, countryFilter, sourceFilter]);

  const handleExportCsv = () => {
    const url = `/api/admin/visitors?export=csv${
      countryFilter ? `&country=${encodeURIComponent(countryFilter)}` : ""
    }${sourceFilter !== "ALL" ? `&source=${encodeURIComponent(sourceFilter)}` : ""}`;
    window.open(url, "_blank");
  };

  const handleRunCleanup = async () => {
    if (!confirm("Run 30-day data retention cleanup? This will safely remove historical logs older than 30 days.")) {
      return;
    }
    setCleanupLoading(true);
    setCleanupMessage(null);
    try {
      const res = await fetch("/api/admin/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retentionDays: 30 }),
      });
      const resData = await res.json();
      if (resData.success) {
        setCleanupMessage(resData.message || "Cleanup complete.");
        fetchData();
      }
    } catch {
      setCleanupMessage("Cleanup execution failed.");
    } finally {
      setCleanupLoading(false);
      setTimeout(() => setCleanupMessage(null), 5000);
    }
  };

  const formatAgo = (sec: number) => {
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    return `${Math.floor(min / 60)}h ago`;
  };

  const formatDuration = (sec: number) => {
    if (!sec || sec <= 0) return "0s";
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // Filtered session list
  const filteredSessions = useMemo(() => {
    if (!data?.activeSessions) return [];
    return data.activeSessions.filter((s) => {
      // Search filter (Session ID, City, Page, Masked IP)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          s.id.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.current_page.toLowerCase().includes(q) ||
          s.landing_page.toLowerCase().includes(q) ||
          s.masked_ip.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Status filter (Active within last 5 minutes = 300s)
      if (statusFilter === "ACTIVE" && s.seconds_ago > 300) return false;
      if (statusFilter === "IDLE" && s.seconds_ago <= 300) return false;

      return true;
    });
  }, [data?.activeSessions, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Live Visitors" }]}
        eyebrow="Real-Time Telemetry & Live Traffic"
        title="Live Website Visitors"
        description="Monitor authentic live visitors, approximate geographic distribution, current page journeys, and technical session telemetry."
        badge={`${data?.activeNow ?? 0} Online Right Now`}
        badgeColor="success"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Sync Toggle */}
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

          {/* Manual Refresh */}
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={fetchData}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </AdminButton>

          {/* Export CSV */}
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            icon={Download}
          >
            Export CSV
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* Retention Message Alert */}
      {cleanupMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-medium text-[#159B70] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cleanupMessage}</span>
        </div>
      )}

      {/* 4 Primary KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Visitors Online Right Now */}
        <div className="p-5 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#159B70]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
              Online Right Now
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B] font-mono">
            {data?.activeNow ?? 0}
          </div>
          <div className="text-xs text-[#159B70] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#159B70] animate-ping" />
            <span>Active in last 5 minutes</span>
          </div>
        </div>

        {/* 2. Total Visitors Today */}
        <div className="p-5 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
              Total Visitors Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B] font-mono">
            {data?.todayVisitors ?? 0}
          </div>
          <div className="text-xs text-[#777078]">
            {data?.uniqueVisitors ?? 0} unique sessions tracked
          </div>
        </div>

        {/* 3. Total Page Views Today */}
        <div className="p-5 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
              Total Pageviews Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B] font-mono">
            {data?.todayPageviews ?? 0}
          </div>
          <div className="text-xs text-[#777078]">
            Updated at {lastRefreshed || "Just now"}
          </div>
        </div>

        {/* 4. Average Session Duration */}
        <div className="p-5 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#159B70]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777078]">
              Avg Session Duration
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B] font-mono">
            {formatDuration(data?.avgSessionDurationSec ?? 0)}
          </div>
          <div className="text-xs text-[#777078]">
            Continuous engagement telemetry
          </div>
        </div>
      </div>

      {/* Interactive World Map */}
      <LiveVisitorMap
        topCountries={data?.topCountries || []}
        topCities={data?.topCities || []}
        activeNow={data?.activeNow || 0}
        selectedCountry={countryFilter || undefined}
        onSelectCountry={(code) => setCountryFilter(code)}
      />

      {/* Analytics Breakdown: Traffic Sources & Most Visited Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Visited Pages */}
        <div className="lg:col-span-7 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                Content Engagement
              </span>
              <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">
                Most Visited Website Pages
              </h3>
              <p className="text-xs text-[#777078]">
                Real-time page demand with unique visitor engagement counts.
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {!data?.topPages || data.topPages.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#777078]">
              No page navigation events recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EADFE3] text-[#777078] uppercase tracking-wider text-[10px] font-mono">
                    <th className="pb-3 font-bold">Route Path</th>
                    <th className="pb-3 font-bold text-center">Pageviews</th>
                    <th className="pb-3 font-bold text-center">Unique Visitors</th>
                    <th className="pb-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFE3]/60">
                  {data.topPages.map((p) => (
                    <tr key={p.path} className="hover:bg-[#FAF7F7] transition-colors">
                      <td className="py-2.5">
                        <span className="font-mono text-[#24151B] font-semibold text-[11px]">
                          {p.path}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-bold text-[#74102E] font-mono">
                        {p.views}
                      </td>
                      <td className="py-2.5 text-center font-mono text-[#777078]">
                        {p.uniqueVisitors}
                      </td>
                      <td className="py-2.5 text-right">
                        <a
                          href={p.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#74102E] hover:text-[#4A0B20] inline-flex items-center gap-1 font-bold text-[11px]"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Traffic Sources & Device Distribution */}
        <div className="lg:col-span-5 space-y-6">
          {/* Traffic Sources Breakdown */}
          <div className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                  Acquisition
                </span>
                <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">
                  Traffic Sources
                </h3>
              </div>
              <Compass className="w-4 h-4 text-[#74102E]" />
            </div>

            <div className="space-y-3">
              {data?.trafficSources?.map((src) => (
                <div key={src.source} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#24151B]">{src.source}</span>
                    <span className="font-mono font-bold text-[#74102E]">
                      {src.count} ({src.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F7] border border-[#EADFE3]/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#74102E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(3, src.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADFE3]/60">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E]">
                Device Distribution
              </span>
              <Layers className="w-4 h-4 text-[#777078]" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {data?.deviceBreakdown?.map((dev) => (
                <div
                  key={dev.device}
                  className="p-3 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] text-center space-y-1"
                >
                  <div className="flex justify-center text-[#74102E]">
                    {dev.device === "mobile" ? (
                      <Smartphone className="w-4 h-4" />
                    ) : dev.device === "tablet" ? (
                      <Tablet className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[#777078] block">
                    {dev.device}
                  </span>
                  <span className="text-sm font-black text-[#24151B] font-mono block">
                    {dev.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter Toolbar & Live Sessions Table */}
      <div className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-5">
        {/* Table Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EADFE3]/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E]">
                Session Telemetry Stream
              </span>
              <span className="text-xs font-mono font-bold text-[#74102E] bg-[#FAF7F7] border border-[#EADFE3] px-2.5 py-0.5 rounded-lg">
                {filteredSessions.length} Visible
              </span>
            </div>
            <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">
              Live Visitor Sessions Log
            </h3>
            <p className="text-xs text-[#777078]">
              Comprehensive chronological log of visitor devices, paths, sources, and engagement.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#777078] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search session, page, city, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#EADFE3] text-xs bg-[#FAF7F7] text-[#24151B] placeholder-[#777078] focus:outline-none focus:border-[#74102E] w-56 transition-all"
              />
            </div>

            {/* Source Filter Dropdown */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#EADFE3] text-xs bg-[#FAF7F7] text-[#24151B] focus:outline-none focus:border-[#74102E] cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="Direct">Direct</option>
              <option value="Organic Search">Organic Search</option>
              <option value="Social Media">Social Media</option>
              <option value="Referral">Referral</option>
              <option value="Campaign">Campaign</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[#EADFE3] text-xs bg-[#FAF7F7] text-[#24151B] focus:outline-none focus:border-[#74102E] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Online Right Now</option>
              <option value="IDLE">Idle / Ended</option>
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        {filteredSessions.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#777078] space-y-2">
            <Globe className="w-8 h-8 text-[#777078]/40 mx-auto" />
            <p className="font-medium">No visitor sessions match your active criteria.</p>
            <p className="text-[11px] text-[#777078]">
              Try adjusting your search query, country, or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADFE3] text-[#777078] uppercase tracking-wider text-[10px] font-mono">
                  <th className="pb-3 font-bold">Visitor &amp; Location</th>
                  <th className="pb-3 font-bold">Current Page &amp; Landing</th>
                  <th className="pb-3 font-bold">Traffic Source</th>
                  <th className="pb-3 font-bold">Device &amp; Tech</th>
                  <th className="pb-3 font-bold text-center">Duration</th>
                  <th className="pb-3 font-bold text-center">Status</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3]/60">
                {filteredSessions.map((s) => {
                  const isActiveNow = s.seconds_ago <= 300; // 5 minutes
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#FAF7F7] transition-colors group cursor-pointer"
                      onClick={() => setSelectedSessionId(s.id)}
                    >
                      {/* Location & IP */}
                      <td className="py-3">
                        <div className="font-bold text-[#24151B] flex items-center gap-1.5">
                          <span className="text-base">{s.flag}</span>
                          <span>
                            {s.city ? `${s.city}, ` : ""}
                            {s.country}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#777078] flex items-center gap-1 mt-0.5">
                          <span>{s.masked_ip}</span>
                          {s.is_returning && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                              Returning
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Current Page */}
                      <td className="py-3 max-w-[220px]">
                        <span className="font-mono text-[#74102E] font-semibold text-[11px] block truncate">
                          {s.current_page}
                        </span>
                        <div className="text-[10px] text-[#777078] truncate">
                          Landing: {s.landing_page} ({s.total_pageviews} pvs)
                        </div>
                      </td>

                      {/* Traffic Source */}
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                            s.referrer_source === "Organic Search"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : s.referrer_source === "Social Media"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : s.referrer_source === "Campaign"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-[#FAF7F7] text-[#24151B] border-[#EADFE3]"
                          }`}
                        >
                          {s.referrer_source}
                        </span>
                        <div className="text-[10px] text-[#777078] truncate max-w-[130px] mt-0.5">
                          {s.referrer || "Direct"}
                        </div>
                      </td>

                      {/* Device & Tech */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#24151B]">
                          {s.device_type === "mobile" ? (
                            <Smartphone className="w-3.5 h-3.5 text-[#777078]" />
                          ) : s.device_type === "tablet" ? (
                            <Tablet className="w-3.5 h-3.5 text-[#777078]" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-[#777078]" />
                          )}
                          <span className="font-medium">
                            {s.browser} • {s.os}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 text-center font-mono font-bold text-[#24151B]">
                        {formatDuration(s.duration_seconds)}
                      </td>

                      {/* Status */}
                      <td className="py-3 text-center">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            isActiveNow
                              ? "bg-emerald-50 text-[#159B70] border-emerald-200"
                              : "bg-[#FAF7F7] text-[#777078] border-[#EADFE3]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActiveNow ? "bg-[#159B70] animate-pulse" : "bg-[#777078]"
                            }`}
                          />
                          <span>{isActiveNow ? "Active Now" : formatAgo(s.seconds_ago)}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSessionId(s.id);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#EADFE3] bg-white text-[#74102E] font-bold text-[11px] hover:bg-[#FAF7F7] hover:border-[#74102E]/40 transition-all cursor-pointer"
                        >
                          Journey →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-Time Live Activity Event Log Stream */}
      <div className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
              Sub-Second Event Ingestion
            </span>
            <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">
              Chronological Pageview Stream
            </h3>
            <p className="text-xs text-[#777078]">
              Instantaneous real-time feed of every incoming page load event.
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        {!data?.recentPageviews || data.recentPageviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#777078]">
            No live pageviews recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {data.recentPageviews.slice(0, 24).map((pv) => (
              <div
                key={pv.id}
                onClick={() => setSelectedSessionId(pv.session_id)}
                className="p-3 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] hover:bg-[#F2ECEF]/60 transition-colors text-xs space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#74102E] text-[11px] truncate max-w-[150px]">
                    {pv.path}
                  </span>
                  <span className="text-[10px] font-mono text-[#777078]">
                    {formatAgo(pv.seconds_ago || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#777078]">
                  <span>
                    {pv.browser} • {pv.os}
                  </span>
                  <span className="font-semibold text-[#24151B]">{pv.country}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy, Retention & Compliance Footer Strip */}
      <div className="p-5 bg-white border border-[#EADFE3] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#24151B]">
              Privacy-First &amp; GDPR Compliant Data Retention Policy
            </h4>
            <p className="text-[11px] text-[#777078] leading-relaxed">
              IP addresses are anonymized via SHA-256 masking. All session records are subject to an
              automatic 30-day retention purge.
            </p>
          </div>
        </div>

        <AdminButton
          variant="secondary"
          size="sm"
          onClick={handleRunCleanup}
          loading={cleanupLoading}
          icon={Trash2}
        >
          Run 30-Day Retention Cleanup
        </AdminButton>
      </div>

      {/* Visitor Detail Slide-Over Drawer */}
      <VisitorDetailDrawer
        sessionId={selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        canViewRawIp={Boolean(data?.canViewRawIp)}
      />
    </div>
  );
}
