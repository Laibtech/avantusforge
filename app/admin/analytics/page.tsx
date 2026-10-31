"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
} from "@/components/admin/ui";

interface AnalyticsData {
  metrics: {
    totalPageviews: number;
    uniqueVisitors: number;
    activeVisitors: number;
    avgDurationSeconds: number;
    totalLeads: number;
    newLeads: number;
    conversionRate: string;
  };
  timeline: { date_label: string; views: number; visitors: number }[];
  topPages: { path: string; views: number; unique_visitors: number }[];
  devices: { device_type: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  countries: { country: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async (selectedDays: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?days=${selectedDays}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load analytics data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Timeframe", `Last ${days} days`],
      ["Total Pageviews", data.metrics.totalPageviews],
      ["Unique Visitors", data.metrics.uniqueVisitors],
      ["Active Visitors (Real-Time)", data.metrics.activeVisitors],
      ["Avg Session Duration (sec)", data.metrics.avgDurationSeconds],
      ["Total Inquiries Generated", data.metrics.totalLeads],
      ["Conversion Rate", data.metrics.conversionRate],
      [],
      ["Date", "Pageviews", "Unique Visitors"],
      ...data.timeline.map((t) => [t.date_label, t.views, t.visitors]),
      [],
      ["Top Page Route", "Views", "Unique Visitors"],
      ...data.topPages.map((p) => [p.path, p.views, p.unique_visitors]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `avantusforge-analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxTimelineViews = data?.timeline?.reduce((m, item) => Math.max(m, item.views), 0) || 1;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Analytics" }]}
        eyebrow="Website Intelligence & Performance"
        title="Visitor Analytics & Funnels"
        description="Genuine first-party telemetry tracking pageviews, referral channels, user devices, and commercial inquiries."
        badge={`${days} Days Window`}
        badgeColor="burgundy"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white border border-[#EADFE3] rounded-xl p-1 shadow-2xs">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  days === d
                    ? "bg-[#74102E] text-white shadow-2xs"
                    : "text-[#777078] hover:text-[#24151B]"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <AdminButton
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={loading || !data}
            icon={Download}
          >
            Export CSV
          </AdminButton>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => fetchAnalytics(days)}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* KPI Cards Row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#74102E]/30 transition-all">
            <div className="flex items-center justify-between text-[#777078]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                Total Pageviews
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#24151B]">
              {data.metrics.totalPageviews.toLocaleString()}
            </div>
            <div className="text-xs text-[#74102E] font-semibold">
              Verified Public Hits
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#159B70]/30 transition-all">
            <div className="flex items-center justify-between text-[#777078]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                Unique Visitors
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#24151B]">
              {data.metrics.uniqueVisitors.toLocaleString()}
            </div>
            <div className="text-xs text-[#159B70] font-semibold">
              Distinct Browsing Sessions
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#74102E]/30 transition-all">
            <div className="flex items-center justify-between text-[#777078]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                Avg Session Duration
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#777078]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#24151B]">
              {Math.floor(data.metrics.avgDurationSeconds / 60)}m{" "}
              {data.metrics.avgDurationSeconds % 60}s
            </div>
            <div className="text-xs text-[#777078]">
              High commercial engagement
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 group hover:border-[#74102E]/30 transition-all">
            <div className="flex items-center justify-between text-[#777078]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                Inquiry Conversion
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#74102E]">
              {data.metrics.conversionRate}
            </div>
            <div className="text-xs text-[#777078]">
              {data.metrics.totalLeads} CRM Inquiries Captured
            </div>
          </div>
        </div>
      )}

      {/* Main Timeline Bar Chart */}
      <div className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60 flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
              Trajectory Trends
            </span>
            <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Visitor Traffic Trajectory</h3>
            <p className="text-xs text-[#777078]">Pageviews and unique sessions aggregated by day.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#74102E]" />
              <span className="text-[#24151B]">Pageviews</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EADFE3]" />
              <span className="text-[#777078]">Unique Visitors</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs text-[#777078]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#74102E] mr-2" />
            Loading telemetry metrics...
          </div>
        ) : !data || data.timeline.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-[#777078]">
            No traffic recorded in this date range.
          </div>
        ) : (
          <div className="pt-4">
            <div className="h-56 flex items-end gap-2 sm:gap-3 border-b border-[#EADFE3] pb-2">
              {data.timeline.map((point, idx) => {
                const viewHeight = Math.max(8, (point.views / maxTimelineViews) * 100);
                const visHeight = Math.max(6, (point.visitors / maxTimelineViews) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#24151B] text-white text-[10px] py-1.5 px-2.5 rounded-xl pointer-events-none whitespace-nowrap z-20 shadow-lg border border-[#4A0B20]">
                      <div className="font-bold text-[#D6A45B]">{point.date_label}</div>
                      <div className="text-white/80">{point.views} views • {point.visitors} visitors</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        style={{ height: `${viewHeight}%` }}
                        className="w-full max-w-[20px] bg-[#74102E] hover:bg-[#4A0B20] rounded-t transition-all"
                      />
                      <div
                        style={{ height: `${visHeight}%` }}
                        className="w-full max-w-[20px] bg-[#EADFE3] hover:bg-[#8F2948]/30 rounded-t transition-all"
                      />
                    </div>

                    <span className="text-[9px] font-mono text-[#777078] truncate max-w-[45px]">
                      {point.date_label.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Grids */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Visited Pages */}
          <div className="lg:col-span-6 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                  Route Popularity
                </span>
                <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Top Visited Routes</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#74102E] bg-[#FBF4F6] px-2 py-0.5 rounded border border-[#EADFE3]">
                Hits
              </span>
            </div>
            <div className="space-y-3">
              {data.topPages.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EADFE3]/40">
                  <div className="font-mono text-[#24151B] font-semibold truncate max-w-[280px]">
                    {page.path}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#777078] text-[11px]">{page.unique_visitors} unique</span>
                    <span className="font-bold text-[#74102E] bg-[#FBF4F6] border border-[#EADFE3] px-2 py-0.5 rounded text-[11px] font-mono">
                      {page.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acquisition Referrers */}
          <div className="lg:col-span-6 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                  Channels
                </span>
                <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Referral Sources</h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#74102E] bg-[#FBF4F6] px-2 py-0.5 rounded border border-[#EADFE3]">
                Traffic
              </span>
            </div>
            <div className="space-y-3">
              {data.referrers.map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EADFE3]/40">
                  <span className="text-[#24151B] font-medium truncate max-w-[260px]">
                    {ref.referrer || "Direct Navigation"}
                  </span>
                  <span className="font-bold text-[#24151B] bg-[#FAF7F7] border border-[#EADFE3] px-2 py-0.5 rounded text-[11px] font-mono">
                    {ref.count} sessions
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Geo Distribution */}
          <div className="lg:col-span-6 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                  Global Reach
                </span>
                <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Geographic Markets</h3>
              </div>
              <Globe className="w-4 h-4 text-[#74102E]" />
            </div>
            <div className="space-y-3">
              {data.countries.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EADFE3]/40">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#24151B]">{c.country}</span>
                  </div>
                  <span className="font-bold text-[#74102E] bg-[#FBF4F6] border border-[#EADFE3] px-2 py-0.5 rounded text-[11px] font-mono">
                    {c.count} sessions
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Device & Browser Distribution */}
          <div className="lg:col-span-6 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                  Hardware & OS
                </span>
                <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Device Hardware Types</h3>
              </div>
              <Smartphone className="w-4 h-4 text-[#74102E]" />
            </div>
            <div className="space-y-3">
              {data.devices.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EADFE3]/40">
                  <span className="uppercase font-bold text-[#24151B] text-[11px]">
                    {d.device_type}
                  </span>
                  <span className="font-mono text-[#777078] font-bold">{d.count} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
