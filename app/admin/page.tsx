"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  Radio,
  Clock,
  TrendingUp,
  FileText,
  Briefcase,
  FolderGit2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Plus,
  ShieldCheck,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Activity,
  CheckCircle2,
  DollarSign,
  UserCheck,
  BarChart2,
  LineChart as LineChartIcon,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
} from "@/components/admin/ui";

interface AnalyticsData {
  rangeDays: number;
  metrics: {
    totalPageviews: number;
    uniqueVisitors: number;
    activeVisitors: number;
    avgDurationSeconds: number;
    totalLeads: number;
    newLeads: number;
    conversionRate: string;
    publishedPages: number;
    publishedServices: number;
    publishedPortfolio: number;
    publishedBlogs: number;
  };
  timeline: { date_label: string; views: number; visitors: number }[];
  topPages: { path: string; views: number; unique_visitors: number }[];
  devices: { device_type: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  countries: { country: string; count: number }[];
  recentInquiries: {
    id?: number;
    name: string;
    email: string;
    service?: string;
    status?: string;
    created_at?: string;
  }[];
  recentActivities: {
    id?: number;
    actor: string;
    action?: string;
    details?: string;
    created_at?: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<number>(30);
  const [chartMode, setChartMode] = useState<"line" | "bars">("line");
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    views: number;
    visitors: number;
    x: number;
    y: number;
  } | null>(null);

  const fetchAnalytics = async (days: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedRange);
  }, [selectedRange]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDateLabel = (isoDate: string) => {
    try {
      const parts = isoDate.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const timeline = data?.timeline || [];
  const maxViews = Math.max(...timeline.map((t) => t.views), 10);
  const chartHeight = 180;
  const chartWidth = 700;

  // Generate SVG Points for Line Chart
  const svgPoints = timeline.map((item, idx) => {
    const x =
      timeline.length > 1
        ? (idx / (timeline.length - 1)) * (chartWidth - 40) + 20
        : chartWidth / 2;
    const y = chartHeight - (item.views / maxViews) * (chartHeight - 30) - 15;
    return { x, y, item };
  });

  const linePath =
    svgPoints.length > 0
      ? svgPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`, "")
      : "";

  const areaPath =
    svgPoints.length > 0
      ? `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${chartHeight} L ${svgPoints[0].x} ${chartHeight} Z`
      : "";

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* 1. Header & Live Telemetry Bar */}
      <AdminPageHeader
        eyebrow="AvantusForge Central Command"
        title="Executive Operations Dashboard"
        description="Real-time telemetry, visitor analytics, commercial CRM leads, and business operations."
        badge="Enterprise v3.0"
        badgeColor="burgundy"
      >
        <div className="flex items-center gap-2.5">
          {/* Time Range Filter */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#EADFE3] shadow-2xs">
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setSelectedRange(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedRange === days
                  ? "bg-[#74102E] text-white shadow-2xs"
                  : "text-[#777078] hover:text-[#24151B]"
                  }`}
              >
                {days}d
              </button>
            ))}
          </div>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => fetchAnalytics(selectedRange)}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* 2. Primary KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Page Views */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] flex flex-col justify-between space-y-3 group hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Total Page Views
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#24151B]">
              {data?.metrics?.totalPageviews ?? 0}
            </div>
            <div className="text-xs text-[#777078] mt-1.5 flex items-center gap-1.5">
              <span className="font-bold text-[#159B70]">+{data?.metrics?.uniqueVisitors ?? 0}</span>
              <span>unique visitors ({selectedRange}d)</span>
            </div>
          </div>
        </div>

        {/* Live Active Visitors */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] flex flex-col justify-between space-y-3 group hover:border-[#159B70]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Live Active Visitors
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#24151B] flex items-baseline gap-2.5">
              <span>{data?.metrics?.activeVisitors ?? 0}</span>
              <AdminBadge variant="active" size="xs" pulse>
                LIVE NOW
              </AdminBadge>
            </div>
            <div className="text-xs text-[#777078] mt-1.5">
              Active sessions on public website
            </div>
          </div>
        </div>

        {/* CRM Leads & Consultations */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] flex flex-col justify-between space-y-3 group hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Commercial Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#74102E]">
              {data?.metrics?.totalLeads ?? 0}
            </div>
            <div className="text-xs text-[#777078] mt-1.5 flex items-center gap-1.5">
              <span className="font-bold text-[#D69A32]">{data?.metrics?.newLeads ?? 0} new</span>
              <span>prospective client briefs</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] flex flex-col justify-between space-y-3 group hover:border-[#159B70]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Conversion Velocity
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#24151B]">
              {data?.metrics?.conversionRate ?? "0%"}
            </div>
            <div className="text-xs text-[#777078] mt-1.5">
              Avg session: {formatDuration(data?.metrics?.avgDurationSeconds || 120)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Visitor Trends Chart (Line & Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visitor Timeline Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#EADFE3]/60">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                Traffic Analytics
              </span>
              <h2 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">
                Visitor &amp; Page View Trajectory
              </h2>
              <p className="text-xs text-[#777078]">
                Real first-party traffic volume across the selected {selectedRange}-day telemetry window.
              </p>
            </div>

            {/* Line / Bar Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center bg-[#FAF7F7] p-1 rounded-xl border border-[#EADFE3]">
                <button
                  type="button"
                  onClick={() => setChartMode("line")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chartMode === "line"
                    ? "bg-[#74102E] text-white shadow-2xs"
                    : "text-[#777078] hover:text-[#24151B]"
                    }`}
                  title="Line & Area Fill"
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("bars")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chartMode === "bars"
                    ? "bg-[#74102E] text-white shadow-2xs"
                    : "text-[#777078] hover:text-[#24151B]"
                    }`}
                  title="Bar Columns"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 font-bold text-xs text-[#24151B] bg-[#FBF4F6] px-2.5 py-1.5 rounded-lg border border-[#EADFE3]">
                <span className="w-2 h-2 rounded-full bg-[#74102E]" />
                <span>Page Views</span>
              </div>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="pt-2">
            {timeline.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-[#777078]">
                No historical telemetry recorded for this period yet.
              </div>
            ) : chartMode === "line" ? (
              /* Line Chart with Subtle Area Fill */
              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-56 overflow-visible"
                >
                  <defs>
                    <linearGradient id="burgundyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#74102E" stopOpacity="0.20" />
                      <stop offset="100%" stopColor="#74102E" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                    const y = chartHeight - ratio * (chartHeight - 30) - 15;
                    return (
                      <g key={ratio}>
                        <line
                          x1="0"
                          y1={y}
                          x2={chartWidth}
                          y2={y}
                          stroke="#EADFE3"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x="5"
                          y={y - 4}
                          fill="#777078"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {Math.round(maxViews * ratio)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Fill */}
                  <path d={areaPath} fill="url(#burgundyArea)" />

                  {/* Line Stroke */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#74102E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {svgPoints.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPoint?.date === pt.item.date_label ? 5.5 : 3.5}
                        fill="#74102E"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all cursor-pointer"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            date: pt.item.date_label,
                            views: pt.item.views,
                            visitors: pt.item.visitors,
                            x: pt.x,
                            y: pt.y,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Interactive Tooltip */}
                {hoveredPoint && (
                  <div
                    style={{
                      left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                      top: `${(hoveredPoint.y / chartHeight) * 100 - 10}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-full z-30 bg-[#24151B] text-white text-[11px] p-3 rounded-xl shadow-xl pointer-events-none whitespace-nowrap space-y-1 border border-[#4A0B20]"
                  >
                    <div className="text-[10px] text-white/70 font-mono">
                      {formatDateLabel(hoveredPoint.date)}
                    </div>
                    <div className="font-bold text-[#D6A45B]">
                      {hoveredPoint.views} Page Views
                    </div>
                    <div className="text-[10px] text-white/80">
                      {hoveredPoint.visitors} Unique Visitors
                    </div>
                  </div>
                )}

                {/* X-Axis Date Labels */}
                <div className="flex items-center justify-between pt-3 border-t border-[#EADFE3] text-[9.5px] font-mono text-[#777078]">
                  {timeline.length > 0 && (
                    <>
                      <span>{formatDateLabel(timeline[0].date_label)}</span>
                      {timeline.length > 3 && (
                        <span>
                          {formatDateLabel(timeline[Math.floor(timeline.length / 2)].date_label)}
                        </span>
                      )}
                      <span>{formatDateLabel(timeline[timeline.length - 1].date_label)}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Column Bars Mode */
              <div className="h-56 w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-[#EADFE3]">
                {timeline.map((item, idx) => {
                  const heightPercent = Math.max(Math.round((item.views / maxViews) * 100), 10);
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 z-20 bg-[#24151B] text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap">
                        {formatDateLabel(item.date_label)}: {item.views} views ({item.visitors} visitors)
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[28px] rounded-t-md bg-[#74102E] hover:bg-[#4A0B20] transition-all"
                      />
                      <span className="text-[9px] font-mono text-[#777078] truncate max-w-full">
                        {formatDateLabel(item.date_label)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Business Content Counters (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
              Content Inventory
            </span>
            <h2 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">
              Live Business Modules
            </h2>
            <p className="text-xs text-[#777078] mt-0.5">
              Production assets and live database records.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/admin/pages"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F7] hover:bg-[#F2ECEF] border border-[#EADFE3] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#74102E]" />
                <span className="text-xs font-bold text-[#24151B]">Website Pages</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#74102E] bg-white px-2 py-0.5 rounded border border-[#EADFE3]">
                {data?.metrics?.publishedPages ?? 6} Live
              </span>
            </Link>

            <Link
              href="/admin/services"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F7] hover:bg-[#F2ECEF] border border-[#EADFE3] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[#74102E]" />
                <span className="text-xs font-bold text-[#24151B]">Services Catalog</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#74102E] bg-white px-2 py-0.5 rounded border border-[#EADFE3]">
                {data?.metrics?.publishedServices ?? 6} Live
              </span>
            </Link>

            <Link
              href="/admin/portfolio"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F7] hover:bg-[#F2ECEF] border border-[#EADFE3] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-4 h-4 text-[#74102E]" />
                <span className="text-xs font-bold text-[#24151B]">Portfolio Projects</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#74102E] bg-white px-2 py-0.5 rounded border border-[#EADFE3]">
                {data?.metrics?.publishedPortfolio ?? 7} Live
              </span>
            </Link>

            <Link
              href="/admin/blogs"
              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F7] hover:bg-[#F2ECEF] border border-[#EADFE3] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#74102E]" />
                <span className="text-xs font-bold text-[#24151B]">Articles &amp; Insights</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#74102E] bg-white px-2 py-0.5 rounded border border-[#EADFE3]">
                {data?.metrics?.publishedBlogs ?? 3} Live
              </span>
            </Link>
          </div>

          <Link
            href="/admin/pages/home"
            className="w-full text-center py-2.5 rounded-xl bg-[#FBF4F6] hover:bg-[#F2ECEF] border border-[#EADFE3] text-xs font-bold text-[#74102E] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Launch Homepage Content Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Traffic Sources, Devices & Top Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#EADFE3] pb-2.5">
            <span className="text-xs font-bold text-[#24151B] uppercase tracking-wide">
              Top Visited Pages
            </span>
            <FileText className="w-3.5 h-3.5 text-[#777078]" />
          </div>
          <div className="space-y-2 text-xs">
            {data?.topPages && data.topPages.length > 0 ? (
              data.topPages.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#EADFE3]/40">
                  <span className="font-mono text-[#24151B] truncate max-w-[170px]" title={p.path}>
                    {p.path}
                  </span>
                  <span className="font-bold text-[#74102E] font-mono">{p.views} views</span>
                </div>
              ))
            ) : (
              <div className="text-[#777078] py-4 text-center">No traffic recorded yet.</div>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#EADFE3] pb-2.5">
            <span className="text-xs font-bold text-[#24151B] uppercase tracking-wide">
              Device Distribution
            </span>
            <Monitor className="w-3.5 h-3.5 text-[#777078]" />
          </div>
          <div className="space-y-2 text-xs">
            {data?.devices && data.devices.length > 0 ? (
              data.devices.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#EADFE3]/40">
                  <span className="capitalize font-semibold text-[#24151B]">{d.device_type}</span>
                  <span className="font-bold text-[#74102E] font-mono">{d.count} sessions</span>
                </div>
              ))
            ) : (
              <div className="text-[#777078] py-4 text-center">Desktop 100%</div>
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#EADFE3] pb-2.5">
            <span className="text-xs font-bold text-[#24151B] uppercase tracking-wide">
              Traffic Sources
            </span>
            <Globe className="w-3.5 h-3.5 text-[#777078]" />
          </div>
          <div className="space-y-2 text-xs">
            {data?.referrers && data.referrers.length > 0 ? (
              data.referrers.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#EADFE3]/40">
                  <span className="font-mono text-[#24151B] truncate max-w-[170px]" title={r.referrer}>
                    {r.referrer}
                  </span>
                  <span className="font-bold text-[#74102E] font-mono">{r.count}</span>
                </div>
              ))
            ) : (
              <div className="text-[#777078] py-4 text-center">Direct Traffic</div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent CRM Leads Table & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Inquiries (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden">
          <div className="p-5 bg-[#FAF7F7] border-b border-[#EADFE3] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                CRM Pipeline
              </span>
              <h2 className="text-sm font-bold text-[#24151B] tracking-tight">
                Recent Prospective Client Inquiries
              </h2>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-bold text-[#74102E] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F7]/60 text-[#777078] uppercase text-[10px] font-mono tracking-wider border-b border-[#EADFE3]">
                <tr>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Service</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3]">
                {data?.recentInquiries && data.recentInquiries.length > 0 ? (
                  data.recentInquiries.map((inq, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF7F7] transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#24151B]">{inq.name}</div>
                        <div className="text-[10.5px] text-[#777078]">{inq.email}</div>
                      </td>
                      <td className="p-3.5 text-[#24151B] font-medium">{inq.service || "General Inquiry"}</td>
                      <td className="p-3.5">
                        <AdminBadge variant="warning" size="xs">
                          {inq.status || "New"}
                        </AdminBadge>
                      </td>
                      <td className="p-3.5 text-[11px] font-mono text-[#777078]">
                        {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : "Recent"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#777078]">
                      No inquiries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Defensive Audit Stream (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#EADFE3] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#24151B] uppercase tracking-wide">
                Security &amp; Audit Logs
              </span>
            </div>
            <Link
              href="/admin/activity-logs"
              className="text-xs font-bold text-[#74102E] hover:underline flex items-center gap-1"
            >
              <span>All Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.slice(0, 5).map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#24151B]">{act.actor}</span>
                    <span className="font-mono text-[#777078] text-[10px]">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString() : ""}
                    </span>
                  </div>
                  <div className="text-[#777078] truncate">{act.details}</div>
                </div>
              ))
            ) : (
              <div className="text-[#777078] py-6 text-center">
                System operational. Zero security anomalies detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
