"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface PortfolioItem {
  id: number;
  slug: string;
  title: string;
  client_name: string;
  category: string;
  tagline: string;
  summary: string;
  image_url: string;
  deliverables_json: string;
  results_metric: string;
  order_index: number;
  is_featured: boolean;
  status: string;
}

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProject, setEditingProject] = useState<Partial<PortfolioItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio");
      const json = await res.json();
      if (json.success && json.projects) {
        setProjects(json.projects);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject({
      slug: "",
      title: "",
      client_name: "",
      category: "Software & HRMS",
      tagline: "",
      summary: "",
      image_url: "/projects/vendor-management.jpg",
      deliverables_json: JSON.stringify(["Custom Architecture", "Cloud Database", "API Integration"]),
      results_metric: "",
      order_index: projects.length + 1,
      is_featured: true,
      status: "published",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.slug) {
      setMessage({ type: "error", text: "Please enter title and slug." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Portfolio project saved." });
        setEditingProject(null);
        fetchProjects();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save project." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete portfolio project '${title}'?`)) return;

    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Project '${title}' removed.` });
        fetchProjects();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Portfolio Projects" }]}
        eyebrow="Case Studies & Work"
        title="Portfolio Projects CMS"
        description="Manage case studies, verified deliverables, and editorial cards rendered on /work."
        badge={`${projects.length} Case Studies`}
        badgeColor="burgundy"
      >
        <AdminButton
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={Plus}
        >
          New Project
        </AdminButton>
      </AdminPageHeader>

      {/* Feedback Banner */}
      {message && (
        <AdminAlert
          variant={message.type}
          message={message.text}
          onDismiss={() => setMessage(null)}
        />
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project title or client..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs bg-[#FAF7F7] focus:outline-none focus:border-[#74102E] text-[#24151B]"
          />
        </div>

        <AdminButton
          variant="secondary"
          size="sm"
          onClick={fetchProjects}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </AdminButton>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-16 text-center text-xs text-[#777078]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
            Loading portfolio catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-16 text-center text-xs text-[#777078] bg-white rounded-2xl border border-[#EADFE3]">
            No projects found. Click &quot;New Project&quot; to add one.
          </div>
        ) : (
          filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-[#EADFE3] overflow-hidden shadow-[0_2px_8px_rgba(36,21,27,0.03)] hover:border-[#74102E]/30 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Project Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF7F7] border-b border-[#EADFE3]">
                  <Image
                    src={proj.image_url}
                    alt={proj.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <AdminBadge variant="burgundy" size="xs">
                      {proj.category}
                    </AdminBadge>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-xs font-bold text-[#74102E]">{proj.client_name}</div>
                  <h3 className="text-base font-bold text-[#24151B] leading-snug">{proj.title}</h3>
                  <p className="text-xs text-[#777078] line-clamp-2">{proj.summary}</p>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-[#EADFE3]/60 flex items-center justify-between text-xs mt-3 bg-[#FCFAFA]">
                <AdminBadge variant="success" size="xs">
                  {proj.results_metric || "Delivered"}
                </AdminBadge>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingProject(proj)}
                    className="p-1.5 rounded-lg border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(proj.id, proj.title)}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#24151B]">
                  {editingProject.id ? `Edit Project: ${editingProject.title}` : "Create New Case Study"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Project Title</label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Client Name</label>
                  <input
                    type="text"
                    required
                    value={editingProject.client_name || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, client_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProject.category || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Results Metric</label>
                  <input
                    type="text"
                    value={editingProject.results_metric || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, results_metric: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Cover Image URL</label>
                <input
                  type="text"
                  value={editingProject.image_url || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Summary</label>
                <textarea
                  rows={2}
                  value={editingProject.summary || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProject(null)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={saving}
                  icon={Save}
                >
                  {saving ? "Saving..." : "Save Project"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
