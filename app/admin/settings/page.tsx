"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Settings,
  Save,
  CheckCircle2,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Search,
  Share2,
  Building,
  Clock,
  Upload,
  Sliders,
  Check,
} from "lucide-react";
import type { SiteSettings } from "@/lib/db";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface TargetMarketItem {
  code: string;
  name: string;
  flag: string;
  is_active: boolean;
  order_index: number;
  currency?: string;
  timezone?: string;
}

interface SocialProfileItem {
  id: string;
  platform: string;
  url: string;
  label: string;
  is_active: boolean;
  show_in_footer: boolean;
  show_in_contact: boolean;
  order_index: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "identity" | "social" | "markets" | "amazon" | "seo" | "preferences"
  >("identity");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [dbStatus, setDbStatus] = useState<string>("Checking...");
  const [marketsList, setMarketsList] = useState<TargetMarketItem[]>([]);
  const [socialList, setSocialList] = useState<SocialProfileItem[]>([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setDbStatus(data.database?.status || "Connected");

        // Parse markets
        if (data.settings.target_markets_json) {
          try {
            setMarketsList(JSON.parse(data.settings.target_markets_json));
          } catch {
            setMarketsList([]);
          }
        }

        // Parse social profiles
        if (data.settings.social_profiles_json) {
          try {
            setSocialList(JSON.parse(data.settings.social_profiles_json));
          } catch {
            setSocialList([]);
          }
        }
      } else {
        setFeedback({ type: "error", text: "Failed to load system settings." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error connecting to settings API." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleMarket = (code: string) => {
    const updated = marketsList.map((m) =>
      m.code === code ? { ...m, is_active: !m.is_active } : m
    );
    setMarketsList(updated);
    if (settings) {
      const activeNames = updated.filter((m) => m.is_active).map((m) => m.name);
      setSettings({
        ...settings,
        target_markets: activeNames,
        target_markets_json: JSON.stringify(updated),
      });
    }
  };

  const handleToggleSocial = (id: string, field: "is_active" | "show_in_footer" | "show_in_contact") => {
    const updated = socialList.map((s) =>
      s.id === id ? { ...s, [field]: !s[field] } : s
    );
    setSocialList(updated);
    if (settings) {
      setSettings({
        ...settings,
        social_profiles_json: JSON.stringify(updated),
      });
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    try {
      setUploadingProof(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSettings({
          ...settings,
          amazon_proof_image: data.url,
        });
        setFeedback({
          type: "success",
          text: `Amazon sales proof asset replaced with ${file.name}. Click 'Save & Publish Settings' to commit.`,
        });
      } else {
        alert(data.message || "Failed to upload proof image.");
      }
    } catch {
      alert("Error uploading proof asset.");
    } finally {
      setUploadingProof(false);
      if (proofInputRef.current) proofInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setFeedback(null);

      const payload: SiteSettings = {
        ...settings,
        target_markets_json: JSON.stringify(marketsList),
        social_profiles_json: JSON.stringify(socialList),
        target_markets: marketsList.filter((m) => m.is_active).map((m) => m.name),
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: "Global agency settings successfully published and saved to MySQL.",
        });
        setSettings(data.settings);
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: "error", text: data.error || "Save operation failed." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error saving settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#74102E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-xs">
        Could not load settings. Please ensure database connection is available.
      </div>
    );
  }

  const tabs = [
    { id: "identity", label: "Agency Identity", icon: Building },
    { id: "social", label: "Social Profiles", icon: Share2 },
    { id: "markets", label: "Target Markets", icon: Globe },
    { id: "amazon", label: "Amazon Achievement", icon: TrendingUp },
    { id: "seo", label: "Global SEO", icon: Search },
    { id: "preferences", label: "Preferences & Config", icon: Sliders },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Global Agency Settings"
        description="Authoritative agency configuration across identity, international markets, verified proof, and metadata."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
        actions={
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#EADFE3] shadow-xs text-xs">
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="text-[#777078]">MySQL Port 3307:</span>
            <span className="font-bold text-emerald-700">{dbStatus}</span>
          </div>
        }
      />

      {/* Toast Feedback */}
      {feedback && (
        <AdminAlert
          variant={feedback.type === "success" ? "success" : "error"}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EADFE3] scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#74102E] text-white shadow-xs"
                    : "bg-white text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7] border border-[#EADFE3]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D6A45B]" : "text-[#777078]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: AGENCY IDENTITY */}
        {activeTab === "identity" && (
          <AdminCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EADFE3]">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#24151B]">Agency Identity &amp; Contact Architecture</h2>
                <p className="text-xs text-[#777078]">
                  Authoritative brand identity parameters used by header, footer, contact section, and legal notices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={settings.brand_name || settings.site_name}
                  onChange={(e) =>
                    setSettings({ ...settings, brand_name: e.target.value, site_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Official Tagline
                </label>
                <input
                  type="text"
                  value={settings.official_tagline || settings.tagline}
                  onChange={(e) =>
                    setSettings({ ...settings, official_tagline: e.target.value, tagline: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Primary Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#777078] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={settings.primary_email || settings.contact_email}
                    onChange={(e) =>
                      setSettings({ ...settings, primary_email: e.target.value, contact_email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Secondary / Sales Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#777078] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={settings.secondary_email || "sales@avantusforge.com"}
                    onChange={(e) => setSettings({ ...settings, secondary_email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Direct Telephone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777078] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settings.phone_number || settings.contact_phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone_number: e.target.value, contact_phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Official WhatsApp Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777078] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settings.whatsapp_number || "+92 327 4074472"}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Global Operations Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#777078] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settings.operations_address || settings.contact_address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operations_address: e.target.value,
                        contact_address: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Operating Business Hours &amp; Timezone
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#777078] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settings.business_hours || "Monday – Friday: 9:00 AM – 6:00 PM (GMT+5)"}
                    onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Default Consultation CTA Text &amp; Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.consultation_cta_text || "Get a Free Consultation"}
                    onChange={(e) => setSettings({ ...settings, consultation_cta_text: e.target.value })}
                    placeholder="CTA Label"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  />
                  <input
                    type="text"
                    value={settings.consultation_cta_url || "/contact"}
                    onChange={(e) => setSettings({ ...settings, consultation_cta_url: e.target.value })}
                    placeholder="/contact"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Footer Copyright Notice
                </label>
                <input
                  type="text"
                  value={settings.footer_copyright || "© 2026 AvantusForge. All rights reserved."}
                  onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Business Entity / Legal Registration
                </label>
                <input
                  type="text"
                  value={settings.business_registration_info || "AvantusForge Global Digital Technologies Pvt. Ltd."}
                  onChange={(e) => setSettings({ ...settings, business_registration_info: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </AdminCard>
        )}

        {/* TAB 2: OFFICIAL SOCIAL PROFILES */}
        {activeTab === "social" && (
          <AdminCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EADFE3]">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#24151B]">Official Social Media Profiles</h2>
                <p className="text-xs text-[#777078]">
                  Manage official channels rendered in the website footer, contact section, and public metadata.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  LinkedIn Company Page
                </label>
                <input
                  type="url"
                  value={settings.social_linkedin || "https://www.linkedin.com/company/avantusforge"}
                  onChange={(e) => setSettings({ ...settings, social_linkedin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
                <span className="text-[11px] text-[#777078] mt-1 block">linkedin.com/company/avantusforge</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Facebook Official Page
                </label>
                <input
                  type="url"
                  value={settings.social_facebook || "https://www.facebook.com/Avantusforgeofficial"}
                  onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
                <span className="text-[11px] text-[#777078] mt-1 block">facebook.com/Avantusforgeofficial</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Instagram Official Profile
                </label>
                <input
                  type="url"
                  value={settings.social_instagram || "https://www.instagram.com/avantusforgeofficial/"}
                  onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
                <span className="text-[11px] text-[#777078] mt-1 block">instagram.com/avantusforgeofficial</span>
              </div>
            </div>

            {/* Profile Placement Controls */}
            <div className="pt-6 border-t border-[#EADFE3] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#24151B] block">
                Channel Visibility &amp; Placement Controls
              </span>
              <div className="space-y-3">
                {socialList.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#24151B]">{item.platform}</div>
                      <div className="text-[11px] text-[#777078] truncate max-w-sm mt-0.5">{item.url}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-[#24151B]">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.is_active}
                          onChange={() => handleToggleSocial(item.id, "is_active")}
                          className="rounded text-[#74102E]"
                        />
                        <span>Active</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.show_in_footer}
                          onChange={() => handleToggleSocial(item.id, "show_in_footer")}
                          className="rounded text-[#74102E]"
                        />
                        <span>Footer</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.show_in_contact}
                          onChange={() => handleToggleSocial(item.id, "show_in_contact")}
                          className="rounded text-[#74102E]"
                        />
                        <span>Contact Page</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        )}

        {/* TAB 3: TARGET INTERNATIONAL MARKETS */}
        {activeTab === "markets" && (
          <AdminCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EADFE3]">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#24151B]">Target International Markets</h2>
                <p className="text-xs text-[#777078]">
                  Countries served by AvantusForge, highlighted on homepage credibility bar and regional marketing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {marketsList.map((m) => (
                <div
                  key={m.code}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    m.is_active
                      ? "bg-white border-[#EADFE3] shadow-xs"
                      : "bg-[#FAF7F7] border-[#EADFE3]/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 rounded overflow-hidden border border-[#EADFE3] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.flag} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#24151B]">{m.name}</div>
                        <div className="text-[10px] font-mono text-[#777078] uppercase">
                          {m.code} • {m.currency || "USD"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EADFE3]/60 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleMarket(m.code)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                        m.is_active
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                      }`}
                    >
                      {m.is_active ? "Active in Public Lists" : "Deactivated"}
                    </button>
                    <span className="text-[10px] text-[#777078] font-mono">Priority #{m.order_index}</span>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )}

        {/* TAB 4: AMAZON MARKETPLACE ACHIEVEMENT */}
        {activeTab === "amazon" && (
          <AdminCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EADFE3]">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#24151B]">Amazon Marketplace Achievement</h2>
                <p className="text-xs text-[#777078]">
                  Verified sales proof and organic performance statistics displayed across the Amazon Services practice.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Gross Ordered Product Sales
                </label>
                <input
                  type="text"
                  value={settings.amazon_sales_figure || settings.verified_amazon_sales}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      amazon_sales_figure: e.target.value,
                      verified_amazon_sales: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs font-mono font-bold text-[#74102E] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Timeline / Growth Window
                </label>
                <input
                  type="text"
                  value={settings.amazon_period || settings.verified_amazon_period}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      amazon_period: e.target.value,
                      verified_amazon_period: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Associated Service Route
                </label>
                <input
                  type="text"
                  value={settings.amazon_service_route || "/services/amazon-services"}
                  onChange={(e) => setSettings({ ...settings, amazon_service_route: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Contextual Explanation (Organic Growth)
                </label>
                <input
                  type="text"
                  value={
                    settings.amazon_context ||
                    "Organic marketplace brand acceleration achieved without paid advertising expenditure."
                  }
                  onChange={(e) => setSettings({ ...settings, amazon_context: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Proof Asset Section */}
            <div className="pt-6 border-t border-[#EADFE3] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#24151B] block">
                    Verified Sales Screenshot Evidence
                  </span>
                  <span className="text-xs text-[#777078]">
                    Currently mapped to: {settings.amazon_proof_image || "/images/amazon-aed-70k-sales-proof.png"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={proofInputRef}
                    onChange={handleProofUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    icon={<Upload className="w-3.5 h-3.5 text-[#74102E]" />}
                    onClick={() => proofInputRef.current?.click()}
                    disabled={uploadingProof}
                  >
                    {uploadingProof ? "Uploading..." : "Replace Proof Asset"}
                  </AdminButton>
                </div>
              </div>

              {/* Image Preview Box */}
              <div className="relative w-full max-w-xl h-64 rounded-xl border border-[#EADFE3] overflow-hidden bg-[#FAF7F7] flex items-center justify-center p-3">
                <Image
                  src={settings.amazon_proof_image || "/images/amazon-aed-70k-sales-proof.png"}
                  alt="Amazon Sales Proof"
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
          </AdminCard>
        )}

        {/* TAB 5: GLOBAL SEO DEFAULTS */}
        {activeTab === "seo" && (
          <AdminCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EADFE3]">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#24151B]">Global SEO &amp; Search Engine Defaults</h2>
                <p className="text-xs text-[#777078]">
                  Default metadata applied whenever a page or section does not specify custom page-level overrides.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Default Meta Title
                </label>
                <input
                  type="text"
                  value={settings.default_meta_title}
                  onChange={(e) => setSettings({ ...settings, default_meta_title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
                <span className="text-[11px] text-[#777078] mt-1 block">
                  Recommended length: 50–60 characters. Current: {settings.default_meta_title.length} chars.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={settings.default_meta_description}
                  onChange={(e) => setSettings({ ...settings, default_meta_description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  required
                />
                <span className="text-[11px] text-[#777078] mt-1 block">
                  Recommended length: 140–160 characters. Current: {settings.default_meta_description.length} chars.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                    Default Canonical Base URL
                  </label>
                  <input
                    type="url"
                    value={settings.default_canonical_base || "https://avantusforge.com"}
                    onChange={(e) => setSettings({ ...settings, default_canonical_base: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                    Organization Legal Entity (Schema.org)
                  </label>
                  <input
                    type="text"
                    value={settings.organization_legal_name || "AvantusForge Global Digital Technologies"}
                    onChange={(e) => setSettings({ ...settings, organization_legal_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {/* TAB 6: PREFERENCES & INTEGRATIONS */}
        {activeTab === "preferences" && (
          <AdminCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EADFE3]">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#24151B]">System Preferences &amp; Notification Routing</h2>
                <p className="text-xs text-[#777078]">
                  Global flags for cookie consent, Google Analytics 4 telemetry, and automated contact dispatch.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  value={settings.ga4_measurement_id || "G-XXXXXXXXXX"}
                  onChange={(e) => setSettings({ ...settings, ga4_measurement_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs font-mono text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24151B] mb-1.5 uppercase tracking-wider">
                  Primary Lead Notification Email Destination
                </label>
                <input
                  type="email"
                  value={settings.primary_contact_destination || "info@avantusforge.com"}
                  onChange={(e) => setSettings({ ...settings, primary_contact_destination: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>

              <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#EADFE3]">
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.cookie_consent_enabled)}
                    onChange={(e) => setSettings({ ...settings, cookie_consent_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#74102E]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#24151B] block">
                      Enable GDPR &amp; International Cookie Consent Banner
                    </span>
                    <span className="text-[11px] text-[#777078]">
                      Displays respectful consent banner to European and international visitors.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.notification_email_alerts)}
                    onChange={(e) => setSettings({ ...settings, notification_email_alerts: e.target.checked })}
                    className="w-4 h-4 rounded text-[#74102E]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#24151B] block">
                      Instant Email Notification on New Contact Inquiries
                    </span>
                    <span className="text-[11px] text-[#777078]">
                      Dispatches immediate SMTP alert whenever a prospective client submits an inquiry form.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </AdminCard>
        )}

        {/* Global Save Action Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#EADFE3] shadow-lg flex items-center justify-between">
          <div className="text-xs text-[#777078] hidden sm:block">
            Settings are persistently stored in MySQL database table <code className="text-[#74102E] font-mono font-semibold">cms_settings</code>.
          </div>
          <AdminButton
            type="submit"
            variant="primary"
            size="lg"
            icon={<Save className="w-4 h-4" />}
            loading={saving}
          >
            {saving ? "Publishing to Live System..." : "Save & Publish Settings"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
