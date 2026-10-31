"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  ArrowLeft,
  Sliders,
  Globe,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminAlert,
  AdminBadge,
} from "@/components/admin/ui";

interface NavItem {
  id: string;
  title: string;
  href: string;
  is_active: boolean;
  order_index?: number;
}

export default function AdminNavigationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");

  // Header Nav State
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [brandName, setBrandName] = useState("AvantusForge");
  const [ctaText, setCtaText] = useState("Get a Free Consultation");
  const [ctaUrl, setCtaUrl] = useState("/contact");
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  // Footer State
  const [newsletterHeadline, setNewsletterHeadline] = useState("Quarterly Perspectives");
  const [newsletterPrompt, setNewsletterPrompt] = useState("Stay updated with modern digital engineering.");
  const [primaryEmail, setPrimaryEmail] = useState("info@avantusforge.com");
  const [phoneNumber, setPhoneNumber] = useState("+92 327 4074472");
  const [operationsAddress, setOperationsAddress] = useState(
    "AvantusForge Global Operations UK, USA, UAE, Kuwait, Pakistan"
  );
  const [copyrightText, setCopyrightText] = useState("© 2026 AvantusForge. All rights reserved.");

  // Media Picker
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchNav = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      if (data.success) {
        if (data.navigation) {
          setLogoUrl(data.navigation.logo_url || "/logo.png");
          setBrandName(data.navigation.brand_name || "AvantusForge");
          setCtaText(data.navigation.consultation_cta_text || "Get a Free Consultation");
          setCtaUrl(data.navigation.consultation_cta_url || "/contact");
          setNavItems(data.navigation.nav_items || []);
        }
        if (data.footer) {
          setNewsletterHeadline(data.footer.newsletter_headline || "Quarterly Perspectives");
          setNewsletterPrompt(data.footer.newsletter_prompt || "Stay updated with modern digital engineering.");
          setPrimaryEmail(data.footer.primary_email || "info@avantusforge.com");
          setPhoneNumber(data.footer.phone_number || "+92 327 4074472");
          setOperationsAddress(data.footer.operations_address || "AvantusForge Global Operations UK, USA, UAE, Kuwait, Pakistan");
          setCopyrightText(data.footer.copyright_text || "© 2026 AvantusForge. All rights reserved.");
        }
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to load navigation configuration." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNav();
  }, []);

  const handleAddNavItem = () => {
    const newItem: NavItem = {
      id: `nav-${Date.now().toString().slice(-4)}`,
      title: "New Link",
      href: "/services",
      is_active: true,
      order_index: navItems.length + 1,
    };
    setNavItems((prev) => [...prev, newItem]);
  };

  const handleMoveNavItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navItems.length) return;
    const copy = [...navItems];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setNavItems(copy);
  };

  const handleDeleteNavItem = (index: number) => {
    setNavItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleNavItem = (index: number) => {
    setNavItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, is_active: !item.is_active } : item))
    );
  };

  const updateNavItem = (index: number, field: keyof NavItem, value: any) => {
    setNavItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        navigation: {
          logo_url: logoUrl,
          brand_name: brandName,
          consultation_cta_text: ctaText,
          consultation_cta_url: ctaUrl,
          nav_items: navItems,
        },
        footer: {
          newsletter_headline: newsletterHeadline,
          newsletter_prompt: newsletterPrompt,
          primary_email: primaryEmail,
          phone_number: phoneNumber,
          operations_address: operationsAddress,
          copyright_text: copyrightText,
        },
      };

      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: "Navigation & Footer configurations saved and published!" });
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to save configuration." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error saving navigation settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: "Navigation & Footer" },
        ]}
        eyebrow="Global Layout Architecture"
        title="Navigation & Footer Controls"
        description="Configure top-level navbar brand identity, navigation routes, header consultation CTA, and global footer columns."
        badge="Global Layout"
        badgeColor="burgundy"
      >
        <AdminButton
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={saving}
          icon={Save}
        >
          {saving ? "Saving Changes..." : "Save Navigation Settings"}
        </AdminButton>
      </AdminPageHeader>

      {/* Feedback Banner */}
      {feedback && (
        <AdminAlert
          variant={feedback.type}
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#EADFE3] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("header")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "header"
              ? "bg-[#74102E] text-white shadow-2xs"
              : "text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7]"
          }`}
        >
          Header Navigation &amp; Logo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "footer"
              ? "bg-[#74102E] text-white shadow-2xs"
              : "text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7]"
          }`}
        >
          Footer Columns &amp; Branding
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[#777078] bg-white rounded-2xl border border-[#EADFE3]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#74102E] mb-2" />
          <span>Loading navigation settings...</span>
        </div>
      ) : activeTab === "header" ? (
        /* HEADER TAB */
        <div className="space-y-6">
          {/* Logo & CTA Bar */}
          <div className="bg-white rounded-2xl border border-[#EADFE3] p-6 space-y-4 shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                Brand Identity
              </span>
              <h2 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Header Brand &amp; Primary CTA</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">Header Logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-10 relative rounded-xl border border-[#EADFE3] bg-[#FAF7F7] flex items-center justify-center shrink-0">
                    <Image src={logoUrl} alt="" fill className="object-contain p-1.5" />
                  </div>
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaPickerOpen(true)}
                    icon={ImageIcon}
                  >
                    Select Logo
                  </AdminButton>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Header CTA Button Label
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Header CTA Destination
                </label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] font-mono bg-white focus:outline-none focus:border-[#74102E]"
                />
              </div>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <div className="bg-white rounded-2xl border border-[#EADFE3] p-6 space-y-4 shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#EADFE3]/60">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                  Link Hierarchy
                </span>
                <h2 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Main Navigation Links</h2>
                <p className="text-xs text-[#777078]">
                  Reorder, rename, or toggle visibility of header navigation links.
                </p>
              </div>
              <AdminButton
                variant="primary"
                size="sm"
                onClick={handleAddNavItem}
                icon={Plus}
              >
                Add Menu Item
              </AdminButton>
            </div>

            <div className="space-y-2.5">
              {navItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    item.is_active ? "border-[#EADFE3] bg-[#FAF7F7]" : "border-[#EADFE3] bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#777078] w-4 text-center">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => handleMoveNavItem(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-[#F2ECEF] rounded disabled:opacity-20 cursor-pointer text-[#777078]"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveNavItem(idx, "down")}
                        disabled={idx === navItems.length - 1}
                        className="p-1 hover:bg-[#F2ECEF] rounded disabled:opacity-20 cursor-pointer text-[#777078]"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateNavItem(idx, "title", e.target.value)}
                      placeholder="Title"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#EADFE3] bg-white text-[#24151B] focus:outline-none focus:border-[#74102E]"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateNavItem(idx, "href", e.target.value)}
                      placeholder="Destination URL (e.g. /services)"
                      className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[#EADFE3] bg-white text-[#24151B] focus:outline-none focus:border-[#74102E]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleNavItem(idx)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        item.is_active ? "border-emerald-200 bg-emerald-50 text-[#159B70]" : "border-amber-200 bg-amber-50 text-[#D69A32]"
                      }`}
                      title={item.is_active ? "Link Active" : "Link Hidden"}
                    >
                      {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNavItem(idx)}
                      className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* FOOTER TAB */
        <div className="bg-white rounded-2xl border border-[#EADFE3] p-6 space-y-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
              Footer Configuration
            </span>
            <h2 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Footer Columns &amp; Information</h2>
            <p className="text-xs text-[#777078]">
              Manage newsletter banner, contact information, and legal copyright.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#24151B] block mb-1">
                Newsletter Section Tagline
              </label>
              <input
                type="text"
                value={newsletterHeadline}
                onChange={(e) => setNewsletterHeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#24151B] block mb-1">
                Newsletter Prompt Text
              </label>
              <input
                type="text"
                value={newsletterPrompt}
                onChange={(e) => setNewsletterPrompt(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#24151B] block mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={primaryEmail}
                onChange={(e) => setPrimaryEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#24151B] block mb-1">
                Direct Telephone / WhatsApp
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#24151B] block mb-1">
                Operations &amp; Footprint Address
              </label>
              <input
                type="text"
                value={operationsAddress}
                onChange={(e) => setOperationsAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#24151B] block mb-1">
                Copyright Text
              </label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white focus:outline-none focus:border-[#74102E]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(img) => setLogoUrl(img.url)}
        currentUrl={logoUrl}
      />
    </div>
  );
}
