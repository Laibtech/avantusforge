"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Save,
  ShieldCheck,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface SeoConfig {
  default_meta_title: string;
  default_meta_description: string;
  site_url: string;
  og_image: string;
  robots_content: string;
}

export default function AdminSeoPage() {
  const [config, setConfig] = useState<SeoConfig>({
    default_meta_title: "AvantusForge | International Digital Agency & Software House",
    default_meta_description:
      "Bespoke web platforms, custom ERP/CRM software, Amazon marketplace acceleration, and technical SEO for ambitious global businesses.",
    site_url: "https://avantusforge.com",
    og_image: "/og-image.jpg",
    robots_content: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/admin/\n\nSitemap: https://avantusforge.com/sitemap.xml`,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current settings
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (json.success && json.settings) {
          setConfig((prev) => ({
            ...prev,
            default_meta_title: json.settings.default_meta_title || prev.default_meta_title,
            default_meta_description: json.settings.default_meta_description || prev.default_meta_description,
          }));
        }
      } catch (e) {
        console.error("Failed to load SEO settings:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          default_meta_title: config.default_meta_title,
          default_meta_description: config.default_meta_description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback("Global SEO metadata successfully saved and live.");
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch {
      alert("Failed to save SEO configuration.");
    } finally {
      setSaving(false);
    }
  };

  const titleCharCount = config.default_meta_title.length;
  const descCharCount = config.default_meta_description.length;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "SEO & Search Engine" }]}
        eyebrow="Search Engine Optimization & Indexation"
        title="SEO & Website Health"
        description="Control search engine snippets, meta tags, Google SERP previews, XML sitemaps, and robots.txt directives."
        badge="Schema.org Active"
        badgeColor="success"
      >
        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            href="/sitemap.xml"
            target="_blank"
            icon={FileCode}
          >
            XML Sitemap
          </AdminButton>
          <AdminButton
            variant="outline"
            size="sm"
            href="/robots.txt"
            target="_blank"
            icon={Globe}
          >
            Robots.txt
          </AdminButton>
        </div>
      </AdminPageHeader>

      {feedback && (
        <AdminAlert
          variant="success"
          message={feedback}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* SEO Health Audit Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#159B70]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Indexation Status
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#159B70]">Indexable (All Public)</div>
          <div className="text-xs text-[#777078]">Private /admin routes shielded</div>
        </div>

        <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              XML Sitemap
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#24151B]">Dynamic Next.js</div>
          <div className="text-xs text-[#777078]">Auto-includes pages, services &amp; portfolio</div>
        </div>

        <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Canonical URLs
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#24151B]">Enforced (No Dupes)</div>
          <div className="text-xs text-[#777078]">Prevents duplicate content penalties</div>
        </div>

        <div className="p-5 sm:p-6 bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Structured Data
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#24151B]">Schema.org Active</div>
          <div className="text-xs text-[#777078]">Organization &amp; Agency JSON-LD</div>
        </div>
      </div>

      {/* Google SERP Preview Card */}
      <div className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
              Search Result Simulation
            </span>
            <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Google SERP Snippet Preview</h3>
            <p className="text-xs text-[#777078]">Simulated preview of how AvantusForge appears in Google Search results.</p>
          </div>
          <AdminBadge variant="burgundy" size="xs">
            Live Preview
          </AdminBadge>
        </div>

        {/* Google Result Box */}
        <div className="p-5 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl max-w-2xl font-sans space-y-1">
          <div className="flex items-center gap-2.5 text-xs text-[#202124]">
            <div className="w-7 h-7 rounded-lg bg-[#74102E] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              AF
            </div>
            <div>
              <div className="text-xs font-semibold text-[#202124]">AvantusForge</div>
              <div className="text-[11px] text-[#4d5156] font-mono">https://avantusforge.com</div>
            </div>
          </div>
          <h4 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-tight pt-1">
            {config.default_meta_title}
          </h4>
          <p className="text-xs text-[#4d5156] leading-relaxed pt-0.5">
            {config.default_meta_description}
          </p>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-6">
        <div className="pb-3 border-b border-[#EADFE3]/60">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
            Global Metadata Configuration
          </span>
          <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Default Search Metadata</h3>
          <p className="text-xs text-[#777078]">Applied across website pages when custom per-page overrides are not specified.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#24151B]">Default Meta Title</label>
              <span className={`text-[10px] font-mono ${titleCharCount > 60 ? "text-amber-600 font-bold" : "text-[#777078]"}`}>
                {titleCharCount} / 60 recommended
              </span>
            </div>
            <input
              type="text"
              required
              value={config.default_meta_title}
              onChange={(e) => setConfig({ ...config, default_meta_title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs text-[#24151B] focus:outline-none focus:border-[#74102E]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#24151B]">Default Meta Description</label>
              <span className={`text-[10px] font-mono ${descCharCount > 160 ? "text-amber-600 font-bold" : "text-[#777078]"}`}>
                {descCharCount} / 160 recommended
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={config.default_meta_description}
              onChange={(e) => setConfig({ ...config, default_meta_description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs leading-relaxed text-[#24151B] focus:outline-none focus:border-[#74102E]"
            />
          </div>

          <div>
            <label className="font-bold text-[#24151B] block mb-1">Canonical Base URL</label>
            <input
              type="text"
              disabled
              value={config.site_url}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs font-mono text-[#777078] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-bold text-[#24151B] block mb-1">Active Robots.txt Directives</label>
            <textarea
              rows={4}
              disabled
              value={config.robots_content}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs font-mono text-[#777078] cursor-not-allowed leading-relaxed"
            />
            <span className="text-[10px] text-[#777078] mt-1 block">
              Auto-generated via Next.js <code className="font-mono">app/robots.ts</code> with built-in protection for administrative routes.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#EADFE3]/60">
          <span className="text-xs text-[#777078]">Saved directly to database.</span>
          <AdminButton
            variant="primary"
            size="sm"
            type="submit"
            loading={saving}
            icon={Save}
          >
            {saving ? "Saving Changes..." : "Save SEO Settings"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
