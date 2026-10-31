"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Edit2,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Trash2,
  RefreshCw,
  Globe,
  Sliders,
  Menu,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface PageInventoryItem {
  id: number;
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  status: "published" | "draft";
  has_draft: boolean;
  section_count: number;
  updated_at: string;
  updated_by?: string;
}

const PROTECTED_SLUGS = [
  "home",
  "about",
  "services",
  "work",
  "team",
  "contact",
  "insights",
  "industries",
  "process",
  "amazon-services",
  "privacy",
  "terms",
];

export default function AdminPagesMasterPage() {
  const [pages, setPages] = useState<PageInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (data.success && data.pages) {
        setPages(data.pages);
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to page management service." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;

    const cleanSlug = newPageSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    try {
      setCreating(true);
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: cleanSlug,
          title: newPageTitle.trim(),
          seo_title: `${newPageTitle.trim()} | AvantusForge`,
          meta_description: `Official page for ${newPageTitle.trim()} at AvantusForge.`,
          status: "published",
          publish: true,
          sections: [
            {
              id: "hero",
              type: "hero",
              name: "Page Hero",
              enabled: true,
              eyebrow: "AVANTUSFORGE",
              headline: newPageTitle.trim(),
              description: `Welcome to the ${newPageTitle.trim()} section. Configure and edit this content in the CMS.`,
              primaryBtn: { text: "Contact Leadership", href: "/contact", variant: "primary" },
            },
            {
              id: "content",
              type: "rich_text",
              name: "Main Body Content",
              enabled: true,
              headline: "Overview & Objectives",
              bodyContent: "Add structured paragraphs, bullet points, or media to this section.",
            },
            {
              id: "cta",
              type: "cta_banner",
              name: "Bottom Call To Action",
              enabled: true,
              headline: "Ready to discuss your project requirements?",
              description: "Schedule an introductory consultation with our senior engineers.",
              primaryBtn: { text: "Schedule a Consultation", href: "/contact", variant: "gold" },
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Page '${newPageTitle}' created successfully.` });
        setCreateModalOpen(false);
        setNewPageTitle("");
        setNewPageSlug("");
        fetchPages();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to create page." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error creating page." });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCustomPage = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete custom page '${title}' (${slug})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/pages?slug=${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Page '${title}' deleted.` });
        fetchPages();
      } else {
        setFeedback({ type: "error", text: data.message || "Deletion failed." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error deleting page." });
    }
  };

  const filteredPages = pages.filter((p) => {
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "published" && p.status === "published") ||
      (filterStatus === "draft" && p.status === "draft");

    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Pages" }]}
        eyebrow="Centralized CMS Architecture"
        title="Website Pages & Section-Level Editor"
        description="Complete section-by-section editing control for all public website routes. Edit copy, buttons, images, styling, order, and publishing status."
        badge={`${pages.length} Pages Managed`}
        badgeColor="burgundy"
      >
        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            href="/admin/navigation"
            icon={Menu}
          >
            Navigation &amp; Footer
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            icon={Plus}
          >
            Create New Page
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* Feedback Alert */}
      {feedback && (
        <AdminAlert
          variant={feedback.type}
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by route, title, or slug..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#EADFE3] bg-[#FAF7F7] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#FAF7F7] p-1 rounded-xl border border-[#EADFE3]">
            {(["all", "published", "draft"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#74102E] text-white shadow-2xs"
                    : "text-[#777078] hover:text-[#24151B]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={fetchPages}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* Pages Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#EADFE3] overflow-hidden shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#777078]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#74102E] mb-2" />
            <span>Loading website page catalog...</span>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#777078] space-y-1">
            <FileText className="w-8 h-8 text-[#777078] mx-auto opacity-50" />
            <p className="font-bold text-[#24151B]">No website pages found</p>
            <p className="text-[11px] text-[#777078]">Adjust your search query or create a new page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EADFE3] bg-[#FAF7F7] text-[10px] font-mono uppercase tracking-wider text-[#777078]">
                  <th className="py-3.5 px-6">Page &amp; Route</th>
                  <th className="py-3.5 px-4">Sections</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Modified</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3] text-xs">
                {filteredPages.map((page) => {
                  const isProtected = PROTECTED_SLUGS.includes(page.slug);
                  const publicRoute = page.slug === "home" ? "/" : `/${page.slug}`;

                  return (
                    <tr
                      key={page.slug}
                      className="hover:bg-[#FAF7F7]/80 transition-colors group"
                    >
                      {/* Title & Route */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E] shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[#24151B] group-hover:text-[#74102E] transition-colors flex items-center gap-2">
                              <span>{page.title}</span>
                              {isProtected && (
                                <AdminBadge variant="neutral" size="xs">
                                  CORE
                                </AdminBadge>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[#777078] flex items-center gap-1.5 mt-0.5">
                              <span className="text-[#74102E] font-semibold">{publicRoute}</span>
                              <span>•</span>
                              <span className="truncate max-w-[260px] text-[#777078]">
                                {page.seo_title || page.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Section Count Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono font-bold text-[#24151B] text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#74102E]" />
                          <span>{page.section_count} Sections</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {page.status === "published" ? (
                            <AdminBadge variant="published" size="xs">
                              Published
                            </AdminBadge>
                          ) : (
                            <AdminBadge variant="draft" size="xs">
                              Draft
                            </AdminBadge>
                          )}

                          {page.has_draft && (
                            <AdminBadge variant="gold" size="xs">
                              Draft Pending
                            </AdminBadge>
                          )}
                        </div>
                      </td>

                      {/* Last Modified */}
                      <td className="py-4 px-4 text-[#777078] text-[11px] font-mono">
                        <div>{new Date(page.updated_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-[#AFA7AB]">by {page.updated_by || "admin"}</div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={publicRoute}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#24151B] transition-colors"
                            title="View Public Page in New Tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Link
                            href={`/admin/pages/${page.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#74102E] hover:bg-[#4A0B20] text-white text-xs font-bold transition-all shadow-2xs"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Sections</span>
                          </Link>

                          {!isProtected && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomPage(page.slug, page.title)}
                              className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New Page Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24151B]/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#EADFE3] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#24151B]">Create New Website Page</h2>
                  <p className="text-[11px] text-[#777078]">Add a new dynamic route to the CMS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs font-bold text-[#777078] hover:text-[#24151B] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug || newPageSlug === newPageTitle.toLowerCase().replace(/\s+/g, "-")) {
                      setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Enterprise Cloud Security"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#24151B] block mb-1">URL Slug</label>
                <div className="flex items-center rounded-xl border border-[#EADFE3] overflow-hidden bg-[#FAF7F7]">
                  <span className="px-3 text-xs font-mono text-[#777078] bg-[#F2ECEF] py-2 border-r border-[#EADFE3]">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="enterprise-cloud-security"
                    className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none text-[#24151B]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F7] rounded-xl border border-[#EADFE3] text-[11px] text-[#777078] space-y-1">
                <span className="font-bold text-[#24151B] block">Starter Template Included:</span>
                <p>• Hero Section with Heading &amp; CTA</p>
                <p>• Rich Text Narrative &amp; Overview Section</p>
                <p>• Bottom Call To Action Banner</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={creating}
                >
                  {creating ? "Creating..." : "Initialize Page"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
