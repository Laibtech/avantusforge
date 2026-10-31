"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
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

interface SolutionItem {
  id: number;
  slug: string;
  title: string;
  industry: string;
  summary: string;
  challenges_json: string;
  solutions_json: string;
  impact_metrics: string;
  status: string;
}

export default function AdminSolutionsPage() {
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSolution, setEditingSolution] = useState<Partial<SolutionItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/solutions");
      const json = await res.json();
      if (json.success && json.solutions) {
        setSolutions(json.solutions);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const handleOpenCreate = () => {
    setEditingSolution({
      slug: "",
      title: "",
      industry: "Enterprise Operations",
      summary: "",
      challenges_json: JSON.stringify(["Manual spreadsheet dependencies", "Fragmented data silos"]),
      solutions_json: JSON.stringify(["Unified cloud database", "Automated workflow notifications"]),
      impact_metrics: "85% Manual Effort Reduced",
      status: "published",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSolution?.title || !editingSolution?.slug) {
      setMessage({ type: "error", text: "Please enter title and slug." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSolution),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Solution saved successfully." });
        setEditingSolution(null);
        fetchSolutions();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save solution." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete solution '${title}'?`)) return;

    try {
      const res = await fetch(`/api/admin/solutions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Solution '${title}' removed.` });
        fetchSolutions();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const filtered = solutions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Solutions CMS" }]}
        eyebrow="Industry Blueprints"
        title="Solutions Architecture CMS"
        description="Manage industry solutions, operational problem-solving blueprints, and client transformation metrics."
        badge={`${solutions.length} Blueprints`}
        badgeColor="burgundy"
      >
        <AdminButton
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={Plus}
        >
          New Solution
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
            placeholder="Search solution or industry vertical..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs bg-[#FAF7F7] focus:outline-none focus:border-[#74102E] text-[#24151B]"
          />
        </div>

        <AdminButton
          variant="secondary"
          size="sm"
          onClick={fetchSolutions}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </AdminButton>
      </div>

      {/* Solutions Table */}
      <div className="bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F7] text-[#777078] uppercase text-[10px] font-mono tracking-wider border-b border-[#EADFE3]">
              <tr>
                <th className="py-3.5 px-6">Industry Vertical</th>
                <th className="py-3.5 px-4">Solution Title</th>
                <th className="py-3.5 px-4">Impact Metric</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFE3]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#777078]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
                    Loading solutions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#777078]">
                    No solutions found. Click &quot;New Solution&quot; to add one.
                  </td>
                </tr>
              ) : (
                filtered.map((sol) => (
                  <tr key={sol.id} className="hover:bg-[#FAF7F7]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#74102E]">
                      <AdminBadge variant="burgundy" size="xs">
                        {sol.industry}
                      </AdminBadge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#24151B] text-sm">{sol.title}</div>
                      <div className="text-[11px] text-[#777078] line-clamp-1 max-w-sm">{sol.summary}</div>
                    </td>
                    <td className="py-4 px-4 text-[#159B70] font-bold font-mono">
                      {sol.impact_metrics || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <AdminBadge variant="published" size="xs">
                        {sol.status}
                      </AdminBadge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingSolution(sol)}
                          className="p-2 rounded-xl border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                          title="Edit Solution"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sol.id, sol.title)}
                          className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                          title="Delete Solution"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {editingSolution && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#24151B]">
                  {editingSolution.id ? `Edit Solution: ${editingSolution.title}` : "Create New Solution"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingSolution(null)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Solution Title</label>
                <input
                  type="text"
                  required
                  value={editingSolution.title || ""}
                  onChange={(e) => setEditingSolution({ ...editingSolution, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingSolution.slug || ""}
                    onChange={(e) => setEditingSolution({ ...editingSolution, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Industry</label>
                  <input
                    type="text"
                    required
                    value={editingSolution.industry || ""}
                    onChange={(e) => setEditingSolution({ ...editingSolution, industry: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Summary</label>
                <textarea
                  rows={2}
                  value={editingSolution.summary || ""}
                  onChange={(e) => setEditingSolution({ ...editingSolution, summary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Impact Metrics (e.g. 85% Reduced Manual Work)</label>
                <input
                  type="text"
                  value={editingSolution.impact_metrics || ""}
                  onChange={(e) => setEditingSolution({ ...editingSolution, impact_metrics: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Challenges (JSON array)</label>
                  <textarea
                    rows={2}
                    value={editingSolution.challenges_json || ""}
                    onChange={(e) => setEditingSolution({ ...editingSolution, challenges_json: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Solutions (JSON array)</label>
                  <textarea
                    rows={2}
                    value={editingSolution.solutions_json || ""}
                    onChange={(e) => setEditingSolution({ ...editingSolution, solutions_json: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSolution(null)}
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
                  {saving ? "Saving..." : "Save Solution"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
