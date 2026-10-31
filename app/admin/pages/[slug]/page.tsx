"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Plus,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layers,
  Settings,
  History,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
  Monitor,
  Tablet,
  Smartphone,
  AlertTriangle,
  X,
} from "lucide-react";
import { CMSSection, SectionType, SectionRepeatableItem } from "@/lib/cms-types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AdminPageDetailEditor({ params }: PageProps) {
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<"sections" | "seo">("sections");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Page Data State
  const [pageTitle, setPageTitle] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("/images/amazon-aed-70k-sales-proof.png");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robotsIndexing, setRobotsIndexing] = useState("index, follow");
  const [schemaJson, setSchemaJson] = useState("");
  const [pageStatus, setPageStatus] = useState<"published" | "draft">("published");
  const [sections, setSections] = useState<CMSSection[]>([]);

  // Expanded Accordion state
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Media Picker Modal State
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{
    sectionId?: string;
    field: "primaryImage" | "ogImage" | "itemImage";
    itemId?: string;
  } | null>(null);

  // Revisions Drawer State
  const [revisionsDrawerOpen, setRevisionsDrawerOpen] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const publicRoute = slug === "home" ? "/" : `/${slug}`;

  // Fetch Page Data
  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages?slug=${slug}`);
      const data = await res.json();
      if (data.success && data.page) {
        const p = data.page;
        setPageTitle(p.title || slug);
        setSeoTitle(p.seo_title || "");
        setMetaDescription(p.meta_description || "");
        setOgTitle(p.og_title || p.seo_title || "");
        setOgDescription(p.og_description || p.meta_description || "");
        setOgImage(p.og_image || "/images/amazon-aed-70k-sales-proof.png");
        setCanonicalUrl(p.canonical_url || `https://avantusforge.com${publicRoute}`);
        setRobotsIndexing(p.robots_indexing || "index, follow");
        setSchemaJson(p.schema_json || "");
        setPageStatus(p.status || "published");

        const loadedSections = p.draft_sections && p.draft_sections.length > 0 ? p.draft_sections : p.sections || [];
        setSections(loadedSections);
        if (loadedSections.length > 0 && !expandedSectionId) {
          setExpandedSectionId(loadedSections[0].id);
        }
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to load page configuration from database." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [slug]);

  // Fetch Revisions
  const fetchRevisions = async () => {
    setLoadingRevisions(true);
    try {
      const res = await fetch(`/api/admin/pages/revisions?slug=${slug}`);
      const data = await res.json();
      if (data.success && data.revisions) {
        setRevisions(data.revisions);
      }
    } catch (err) {
      console.error("Failed to load revisions:", err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleOpenRevisions = () => {
    setRevisionsDrawerOpen(true);
    fetchRevisions();
  };

  const handleRestoreRevision = async (revId: number) => {
    if (!confirm(`Are you sure you want to restore revision #${revId}? This will publish the restored version immediately.`)) {
      return;
    }

    try {
      setRestoringId(revId);
      const res = await fetch(`/api/admin/pages/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, revisionId: revId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        if (data.sections) {
          setSections(data.sections);
        }
        setPageStatus("published");
        setRevisionsDrawerOpen(false);
        fetchPage();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to restore revision." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error restoring revision." });
    } finally {
      setRestoringId(null);
    }
  };

  // Section Manipulation Handlers
  const handleToggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setSections(copy);
  };

  const handleDuplicateSection = (index: number) => {
    const source = sections[index];
    const newSection: CMSSection = {
      ...source,
      id: `${source.id}-copy-${Date.now().toString().slice(-4)}`,
      name: `${source.name} (Copy)`,
    };
    const copy = [...sections];
    copy.splice(index + 1, 0, newSection);
    setSections(copy);
    setExpandedSectionId(newSection.id);
    setFeedback({ type: "success", text: `Duplicated section '${source.name}'.` });
  };

  const handleDeleteSection = (index: number, name: string) => {
    if (!confirm(`Are you sure you want to remove section '${name}' from this page?`)) {
      return;
    }
    setSections((prev) => prev.filter((_, idx) => idx !== index));
    setFeedback({ type: "success", text: `Removed section '${name}'.` });
  };

  const updateSectionField = (sectionId: string, field: string, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          return {
            ...s,
            [parent]: {
              ...(s as any)[parent],
              [child]: value,
            },
          };
        }
        return { ...s, [field]: value };
      })
    );
  };

  // Repeatable Items Handlers
  const handleAddItem = (sectionId: string) => {
    const newItem: SectionRepeatableItem = {
      id: `item-${Date.now().toString().slice(-4)}`,
      title: "New Item Title",
      description: "Item descriptive paragraph or details.",
      number: "01",
    };
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items: [...(s.items || []), newItem] } : s))
    );
  };

  const updateItemField = (sectionId: string, itemId: string, field: string, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const updatedItems = (s.items || []).map((it) =>
          it.id === itemId ? { ...it, [field]: value } : it
        );
        return { ...s, items: updatedItems };
      })
    );
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, items: (s.items || []).filter((it) => it.id !== itemId) };
      })
    );
  };

  // Save Draft / Publish
  const handleSave = async (isPublish: boolean) => {
    try {
      if (isPublish) setPublishing(true);
      else setSavingDraft(true);
      setFeedback(null);

      const payload = {
        slug,
        title: pageTitle,
        seo_title: seoTitle,
        meta_description: metaDescription,
        og_title: ogTitle,
        og_description: ogDescription,
        og_image: ogImage,
        canonical_url: canonicalUrl,
        robots_indexing: robotsIndexing,
        schema_json: schemaJson,
        sections,
        publish: isPublish,
        isDraft: !isPublish,
      };

      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setPageStatus(isPublish ? "published" : "draft");
      } else {
        setFeedback({ type: "error", text: data.message || "Save failed." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error saving page: " + err.message });
    } finally {
      setPublishing(false);
      setSavingDraft(false);
    }
  };

  // Add Section Templates
  const handleAddSectionFromTemplate = (templateType: SectionType) => {
    const id = `${templateType}-${Date.now().toString().slice(-4)}`;
    let newSec: CMSSection;

    switch (templateType) {
      case "hero":
        newSec = {
          id,
          type: "hero",
          name: "Hero Section",
          enabled: true,
          eyebrow: "BRAND TAGLINE",
          headline: "Enter Compelling Headline",
          description: "Enter supporting description text for this hero section.",
          primaryBtn: { text: "Contact Us", href: "/contact", variant: "primary" },
          secondaryBtn: { text: "Learn More", href: "/services", variant: "secondary" },
          bgStyle: "default",
        };
        break;

      case "text_image":
        newSec = {
          id,
          type: "text_image",
          name: "Narrative & Feature Image",
          enabled: true,
          eyebrow: "EXECUTIVE PERSPECTIVE",
          headline: "Turning Complexity into Digital Scalability",
          description: "Lead editorial paragraph highlighting your strategic advantage.",
          bodyContent: "Detailed narrative paragraphs exploring the engineering craftsmanship behind your solutions.",
          primaryImage: { url: "/team/laiba-baig-ceo.jpg", alt: "Executive portrait" },
          primaryBtn: { text: "Learn More", href: "/about" },
          bgStyle: "white",
        };
        break;

      case "services_grid":
        newSec = {
          id,
          type: "services_grid",
          name: "Services & Capabilities Grid",
          enabled: true,
          eyebrow: "CAPABILITIES",
          headline: "High-Performance Digital Solutions",
          description: "Engineered to deliver high uptime and commercial velocity.",
          items: [
            { id: "s-1", number: "01", title: "Custom Software", description: "Bespoke platforms engineered around your exact internal operations." },
            { id: "s-2", number: "02", title: "Business Automation", description: "Eliminate repetitive tasks with robust integration pipelines." },
            { id: "s-3", number: "03", title: "Digital Commerce", description: "High-speed Shopify themes and scalable storefronts." },
            { id: "s-4", number: "04", title: "Enterprise Systems", description: "Secure ERP and CRM platforms designed for multi-market teams." },
          ],
          bgStyle: "default",
        };
        break;

      case "statistics":
        newSec = {
          id,
          type: "statistics",
          name: "Key Commercial Metrics",
          enabled: true,
          eyebrow: "VERIFIED PERFORMANCE",
          headline: "Results Delivered Across International Markets",
          items: [
            { id: "m-1", title: "AED 70k+", subtitle: "Organic gross sales" },
            { id: "m-2", title: "5 Markets", subtitle: "Active operational footprints" },
            { id: "m-3", title: "99.9%", subtitle: "System architecture uptime" },
            { id: "m-4", title: "100%", subtitle: "Client code ownership" },
          ],
          bgStyle: "white",
        };
        break;

      case "faq_accordion":
        newSec = {
          id,
          type: "faq_accordion",
          name: "Frequently Asked Questions",
          enabled: true,
          eyebrow: "FAQ",
          headline: "Common Inquiries & Technical Details",
          items: [
            { id: "f-1", title: "How long does a typical software project take?", description: "Standard sprint cycles run in 2-week increments, with initial deliverables deployed in 4 to 8 weeks." },
            { id: "f-2", title: "Do we retain source code ownership?", description: "Yes. All bespoke source code, database architectures, and design files are 100% owned by your company." },
          ],
          bgStyle: "default",
        };
        break;

      case "cta_banner":
        newSec = {
          id,
          type: "cta_banner",
          name: "Deep Burgundy Call To Action",
          enabled: true,
          eyebrow: "GET STARTED",
          headline: "Ready to Move Your Business Forward?",
          description: "Schedule a conversation directly with our engineering leadership.",
          primaryBtn: { text: "Schedule a Consultation", href: "/contact", variant: "gold" },
          secondaryBtn: { text: "View Portfolio", href: "/work", variant: "outline" },
          bgStyle: "burgundy",
        };
        break;

      case "rich_text":
      default:
        newSec = {
          id,
          type: "rich_text",
          name: "Rich Text & Legal Body",
          enabled: true,
          headline: "Section Overview",
          bodyContent: "Enter markdown or formatted text paragraphs for this section.",
          bgStyle: "white",
        };
        break;
    }

    setSections((prev) => [...prev, newSec]);
    setExpandedSectionId(newSec.id);
    setTemplateModalOpen(false);
    setFeedback({ type: "success", text: `Added new '${newSec.name}' section.` });
  };

  // Media Selection callback
  const handleMediaSelected = (image: { url: string; alt?: string }) => {
    if (!mediaTarget) return;

    if (mediaTarget.field === "ogImage") {
      setOgImage(image.url);
    } else if (mediaTarget.field === "primaryImage" && mediaTarget.sectionId) {
      updateSectionField(mediaTarget.sectionId, "primaryImage", {
        url: image.url,
        alt: image.alt,
      });
    } else if (mediaTarget.field === "itemImage" && mediaTarget.sectionId && mediaTarget.itemId) {
      updateItemField(mediaTarget.sectionId, mediaTarget.itemId, "imageUrl", image.url);
      if (image.alt) {
        updateItemField(mediaTarget.sectionId, mediaTarget.itemId, "imageAlt", image.alt);
      }
    }

    setMediaTarget(null);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Top Breadcrumb & Action Header */}
      <AdminPageHeader
        breadcrumbs={[
          { label: "Overview", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: pageTitle || slug },
        ]}
        backHref="/admin/pages"
        backLabel="Back to Pages"
        eyebrow="Section-Level Page Builder"
        title={pageTitle || slug}
        description={`Direct visual & component layout editor for ${publicRoute}`}
        badge={pageStatus === "published" ? "Published" : "Draft"}
        badgeColor={pageStatus === "published" ? "success" : "warning"}
      >
        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            href={`${publicRoute}?preview=true`}
            target="_blank"
            icon={Eye}
          >
            Preview Draft
          </AdminButton>

          <AdminButton
            variant="outline"
            size="sm"
            onClick={handleOpenRevisions}
            icon={History}
          >
            Revisions
          </AdminButton>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => handleSave(false)}
            loading={savingDraft}
            disabled={publishing}
            icon={Save}
          >
            Save Draft
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => handleSave(true)}
            loading={publishing}
            disabled={savingDraft}
            icon={CheckCircle2}
          >
            Publish Live
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* Feedback Banner */}
      {feedback && (
        <AdminAlert
          variant={feedback.type}
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Editor Tabs Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#EADFE3] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "sections"
                ? "bg-[#74102E] text-white shadow-2xs"
                : "text-[#777078] hover:text-[#24151B] hover:bg-[#F2ECEE]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Section-by-Section Editor ({sections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "seo"
                ? "bg-[#74102E] text-white shadow-2xs"
                : "text-[#777078] hover:text-[#24151B] hover:bg-[#F2ECEE]"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Page SEO &amp; Social Metadata</span>
          </button>
        </div>

        {activeTab === "sections" && (
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#74102E] text-[#74102E] hover:bg-[#F7EEF1] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="p-20 text-center text-xs text-[#777078] bg-white rounded-2xl border border-[#EADFE3]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#74102E] mb-2" />
          <span>Loading page sections...</span>
        </div>
      ) : activeTab === "sections" ? (
        /* SECTIONS LIST & ACCORDIONS */
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-[#EADFE3] text-xs text-[#777078] space-y-3">
              <Layers className="w-8 h-8 text-[#777078] mx-auto opacity-50" />
              <p className="font-bold text-[#24151B]">No sections configured for this page</p>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#74102E] text-white font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Section</span>
              </button>
            </div>
          ) : (
            sections.map((section, idx) => {
              const isExpanded = expandedSectionId === section.id;

              return (
                <div
                  key={section.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                    section.enabled
                      ? isExpanded
                        ? "border-[#74102E] ring-2 ring-[#74102E]/10"
                        : "border-[#EADFE3] hover:border-[#74102E]/40"
                      : "border-[#EADFE3] bg-[#FAF7F7]/60 opacity-60"
                  }`}
                >
                  {/* Section Bar Header */}
                  <div className="p-4 flex items-center justify-between gap-4 bg-white select-none">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Order and move buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-mono text-xs font-bold text-[#777078] w-5 text-center">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-[#F2ECEE] rounded text-[#777078] disabled:opacity-20 cursor-pointer"
                            title="Move Section Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "down")}
                            disabled={idx === sections.length - 1}
                            className="p-1 hover:bg-[#F2ECEE] rounded text-[#777078] disabled:opacity-20 cursor-pointer"
                            title="Move Section Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Section Title & Type */}
                      <div
                        onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#24151B] truncate">
                            {section.name || section.id}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#F7EEF1] text-[#74102E]">
                            {section.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#777078] truncate mt-0.5">
                          {section.headline || section.description || "Click to edit section content"}
                        </p>
                      </div>
                    </div>

                    {/* Section Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSection(section.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          section.enabled
                            ? "border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                        title={section.enabled ? "Section Visible (Click to Hide)" : "Section Hidden (Click to Show)"}
                      >
                        {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateSection(idx)}
                        className="p-1.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-[#777078] hover:text-[#24151B] transition-colors cursor-pointer"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(idx, section.name)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Expand / Collapse Accordion */}
                      <button
                        type="button"
                        onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                        className="p-1.5 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-[#4D4245] transition-colors cursor-pointer ml-1"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section Editor Fields */}
                  {isExpanded && (
                    <div className="p-5 border-t border-[#EADFE3] bg-[#FAF7F7] space-y-5 animate-in fade-in duration-150">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-[#24151B] block mb-1">
                            Section Label / Identifier
                          </label>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSectionField(section.id, "name", e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADFE3] bg-white text-[#24151B] focus:outline-none focus:border-[#74102E]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#24151B] block mb-1">
                            Eyebrow / Category Tag
                          </label>
                          <input
                            type="text"
                            value={section.eyebrow || ""}
                            onChange={(e) => updateSectionField(section.id, "eyebrow", e.target.value)}
                            placeholder="e.g. EXECUTIVE PERSPECTIVE"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EADFE3] bg-white text-[#24151B] focus:outline-none focus:border-[#74102E]"
                          />
                        </div>
                      </div>

                      {/* Headline & Description */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-[#24151B] block mb-1">
                            Main Headline
                          </label>
                          <input
                            type="text"
                            value={section.headline || ""}
                            onChange={(e) => updateSectionField(section.id, "headline", e.target.value)}
                            placeholder="Enter section headline..."
                            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#EADFE3] bg-white text-[#24151B] focus:outline-none focus:border-[#74102E]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#24151B] block mb-1">
                            Supporting Description / Paragraph
                          </label>
                          <textarea
                            rows={3}
                            value={section.description || ""}
                            onChange={(e) => updateSectionField(section.id, "description", e.target.value)}
                            placeholder="Enter section body copy or supporting paragraph..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] bg-white text-[#24151B] focus:outline-none focus:border-[#74102E]"
                          />
                        </div>

                        {section.type === "text_image" || section.type === "rich_text" ? (
                          <div>
                            <label className="text-xs font-bold text-[#24151B] block mb-1">
                              Detailed Editorial Body Content
                            </label>
                            <textarea
                              rows={5}
                              value={section.bodyContent || ""}
                              onChange={(e) => updateSectionField(section.id, "bodyContent", e.target.value)}
                              placeholder="Enter long-form editorial copy or markdown..."
                              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#EADFE3] bg-white text-[#24151B] focus:outline-none focus:border-[#74102E]"
                            />
                          </div>
                        ) : null}
                      </div>

                      {/* Buttons Configuration */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-[#EADFE3]">
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#74102E] block">
                            Primary CTA Button
                          </span>
                          <input
                            type="text"
                            value={section.primaryBtn?.text || ""}
                            onChange={(e) => updateSectionField(section.id, "primaryBtn.text", e.target.value)}
                            placeholder="Button Text (e.g. Start Your Project)"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#EADFE3] bg-[#FAF7F7]"
                          />
                          <input
                            type="text"
                            value={section.primaryBtn?.href || ""}
                            onChange={(e) => updateSectionField(section.id, "primaryBtn.href", e.target.value)}
                            placeholder="Destination URL (e.g. /contact)"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#EADFE3] bg-[#FAF7F7]"
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777078] block">
                            Secondary Button
                          </span>
                          <input
                            type="text"
                            value={section.secondaryBtn?.text || ""}
                            onChange={(e) => updateSectionField(section.id, "secondaryBtn.text", e.target.value)}
                            placeholder="Button Text (e.g. Explore Services)"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#EADFE3] bg-[#FAF7F7]"
                          />
                          <input
                            type="text"
                            value={section.secondaryBtn?.href || ""}
                            onChange={(e) => updateSectionField(section.id, "secondaryBtn.href", e.target.value)}
                            placeholder="Destination URL (e.g. /services)"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#EADFE3] bg-[#FAF7F7]"
                          />
                        </div>
                      </div>

                      {/* Primary Image Control */}
                      <div className="p-4 bg-white rounded-xl border border-[#EADFE3] space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#74102E] block">
                          Section Featured Image
                        </span>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#EADFE3] bg-[#FAF7F7] shrink-0">
                            {section.primaryImage?.url ? (
                              <Image src={section.primaryImage.url} alt="" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#777078]">
                                <ImageIcon className="w-6 h-6 opacity-40" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setMediaTarget({ sectionId: section.id, field: "primaryImage" });
                                  setMediaPickerOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#74102E] text-white text-xs font-bold hover:bg-[#4A0B20] transition-colors cursor-pointer shadow-2xs"
                              >
                                Select from Media Library
                              </button>
                              {section.primaryImage?.url && (
                                <button
                                  type="button"
                                  onClick={() => updateSectionField(section.id, "primaryImage", null)}
                                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 text-xs font-semibold hover:bg-rose-100 transition-colors"
                                >
                                  Remove Image
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={section.primaryImage?.alt || ""}
                              onChange={(e) => updateSectionField(section.id, "primaryImage.alt", e.target.value)}
                              placeholder="Image alt text for accessibility and SEO..."
                              className="w-full px-3 py-1 text-xs rounded-lg border border-[#EADFE3] bg-[#FAF7F7]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Repeatable Items Manager (for cards, FAQ items, statistics, etc.) */}
                      {section.items && (
                        <div className="p-4 bg-white rounded-xl border border-[#EADFE3] space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#74102E] block">
                              Repeatable Items ({section.items.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddItem(section.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7EEF1] hover:bg-[#F2ECEE] text-[#74102E] text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Item</span>
                            </button>
                          </div>

                          <div className="space-y-3">
                            {section.items.map((item, itemIdx) => (
                              <div
                                key={item.id || itemIdx}
                                className="p-3.5 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] space-y-2.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={item.number || `0${itemIdx + 1}`}
                                      onChange={(e) => updateItemField(section.id, item.id, "number", e.target.value)}
                                      className="w-14 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-[#EADFE3] bg-white text-[#74102E]"
                                    />
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => updateItemField(section.id, item.id, "title", e.target.value)}
                                      placeholder="Item Title"
                                      className="flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-[#EADFE3] bg-white text-[#24151B]"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(section.id, item.id)}
                                    className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  value={item.description || ""}
                                  onChange={(e) => updateItemField(section.id, item.id, "description", e.target.value)}
                                  placeholder="Item description / details..."
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-[#EADFE3] bg-white text-[#24151B]"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* PAGE SEO CONTROLS TAB */
        <div className="bg-white rounded-2xl border border-[#EADFE3] p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-[#24151B]">
              Search Engine Optimization (SEO) &amp; Social Sharing
            </h2>
            <p className="text-xs text-[#777078] mt-0.5">
              Configure page-specific meta titles, descriptions, canonical URL, and open graph social cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  SEO Title (Browser &amp; Google Snippet)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
                <span className="text-[10px] text-[#777078] block mt-1">
                  Recommended: 50–60 characters. Current: {seoTitle.length}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={4}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
                <span className="text-[10px] text-[#777078] block mt-1">
                  Recommended: 150–160 characters. Current: {metaDescription.length}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Search Indexing Robots Rule
                </label>
                <select
                  value={robotsIndexing}
                  onChange={(e) => setRobotsIndexing(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] bg-white"
                >
                  <option value="index, follow">index, follow (Standard Public)</option>
                  <option value="noindex, follow">noindex, follow (Hide from search)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Strictly Private)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Open Graph Social Title
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Open Graph Social Description
                </label>
                <textarea
                  rows={3}
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Social Share Preview Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-14 relative rounded-lg overflow-hidden border border-[#EADFE3] bg-[#FAF7F7] shrink-0">
                    <Image src={ogImage} alt="" fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTarget({ field: "ogImage" });
                      setMediaPickerOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#74102E] text-white text-xs font-bold hover:bg-[#4A0B20] transition-colors"
                  >
                    Select OG Image
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">
                  Custom Structured Data (JSON-LD)
                </label>
                <textarea
                  rows={4}
                  value={schemaJson}
                  onChange={(e) => setSchemaJson(e.target.value)}
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EADFE3] text-[#24151B] font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Template Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#EADFE3] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#4A0B20] text-white">
                  <Plus className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-[#24151B]">
                  Select a Section Template
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="text-xs font-bold text-[#777078] hover:text-[#24151B]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { type: "hero" as SectionType, title: "Hero Section", desc: "Top headline, badge, dual CTA buttons, and ambient lighting." },
                { type: "text_image" as SectionType, title: "Text & Image Narrative", desc: "Two-column editorial story with executive portrait and paragraphs." },
                { type: "services_grid" as SectionType, title: "Services / Capabilities Grid", desc: "Interactive cards with numbers, titles, descriptions, and links." },
                { type: "statistics" as SectionType, title: "Statistics & Commercial Metrics", desc: "Key business KPI cards (AED 70k+ sales, market numbers)." },
                { type: "faq_accordion" as SectionType, title: "FAQ Accordion", desc: "Expandable questions and answers with chevron toggles." },
                { type: "cta_banner" as SectionType, title: "Deep Burgundy CTA Banner", desc: "Conversion banner with gold button and background texture." },
                { type: "rich_text" as SectionType, title: "Rich Text / Legal Content", desc: "Formatted editorial body copy, headings, and bullet points." },
              ].map((tmpl) => (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => handleAddSectionFromTemplate(tmpl.type)}
                  className="p-4 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white hover:border-[#74102E] text-left transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="font-bold text-xs text-[#24151B] group-hover:text-[#74102E] transition-colors">
                    {tmpl.title}
                  </div>
                  <div className="text-[11px] text-[#777078] mt-1 leading-relaxed">
                    {tmpl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelected}
      />

      {/* Revision History Drawer */}
      {revisionsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#EADFE3] flex flex-col">
            <div className="p-5 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#74102E]" />
                <h2 className="text-base font-bold text-[#24151B]">Revision History</h2>
              </div>
              <button
                type="button"
                onClick={() => setRevisionsDrawerOpen(false)}
                className="p-1 rounded-lg text-[#777078] hover:bg-[#F2ECEE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {loadingRevisions ? (
                <div className="py-20 text-center text-xs text-[#777078]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
                  <span>Loading revision logs...</span>
                </div>
              ) : revisions.length === 0 ? (
                <div className="py-20 text-center text-xs text-[#777078]">
                  No prior revisions recorded.
                </div>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#74102E]">
                        Revision #{rev.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-[#F2ECEE] text-[#777078]">
                        {rev.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#24151B] font-semibold">{rev.title}</div>
                    <div className="text-[11px] text-[#777078] flex items-center justify-between">
                      <span>{new Date(rev.created_at).toLocaleString()}</span>
                      <span>by {rev.created_by}</span>
                    </div>
                    <div className="pt-2 border-t border-[#EADFE3]/60 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRestoreRevision(rev.id)}
                        disabled={restoringId === rev.id}
                        className="px-3 py-1 rounded-lg bg-[#74102E] hover:bg-[#4A0B20] text-white text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {restoringId === rev.id ? "Restoring..." : "Restore Version"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
