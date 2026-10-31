"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Search,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  X,
  Save,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface RedirectRule {
  id: number;
  source_path: string;
  target_url: string;
  status_code: number;
  hits: number;
  is_active: number;
  created_at: string;
}

export default function AdminRedirectsPage() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingRule, setEditingRule] = useState<Partial<RedirectRule> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/redirects");
      const data = await res.json();
      if (data.success && data.redirects) {
        setRedirects(data.redirects);
      }
    } catch (e) {
      console.error("Failed to fetch redirects", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const handleOpenCreate = () => {
    setEditingRule({
      source_path: "/",
      target_url: "/",
      status_code: 301,
      is_active: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: RedirectRule) => {
    setEditingRule({ ...rule });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this redirect rule?")) return;
    try {
      const res = await fetch(`/api/admin/redirects?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRedirects((prev) => prev.filter((r) => r.id !== id));
        setFeedback("Redirect deleted successfully.");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Failed to delete redirect.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule?.source_path || !editingRule?.target_url) {
      alert("Source path and target URL are required.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRule),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingRule(null);
        setFeedback("Redirect rule saved and active.");
        fetchRedirects();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.message || "Failed to save redirect rule.");
      }
    } catch {
      alert("Network error saving redirect.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = redirects.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.source_path.toLowerCase().includes(q) || r.target_url.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "URL Redirects" }]}
        eyebrow="SEO & Traffic Routing"
        title="301 & 302 URL Redirects"
        description="Manage permanent and temporary HTTP redirects to preserve search engine link equity and prevent 404 dead links."
        badge={`${redirects.length} Rules Active`}
        badgeColor="burgundy"
      >
        <AdminButton
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={Plus}
        >
          Add Redirect Rule
        </AdminButton>
      </AdminPageHeader>

      {feedback && (
        <AdminAlert
          variant="success"
          message={feedback}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search redirects by source or target URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs text-[#24151B] focus:outline-none focus:border-[#74102E]"
          />
        </div>

        <AdminButton
          variant="secondary"
          size="sm"
          onClick={fetchRedirects}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </AdminButton>
      </div>

      {/* Redirects Table */}
      <div className="bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#777078]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
            Loading redirect rules...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#777078] space-y-2">
            <ArrowRightLeft className="w-8 h-8 text-[#74102E]/40 mx-auto" />
            <p className="font-bold text-[#24151B]">No redirect rules defined.</p>
            <p>Click &quot;Add Redirect Rule&quot; to forward legacy URLs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADFE3] bg-[#FAF7F7] text-[#777078] uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3.5 px-6 font-bold">Source Path (Old)</th>
                  <th className="py-3.5 px-4 font-bold">Target Destination (New)</th>
                  <th className="py-3.5 px-4 font-bold">Status Code</th>
                  <th className="py-3.5 px-4 font-bold">Total Hits</th>
                  <th className="py-3.5 px-4 font-bold">State</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF7F7]/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#74102E]">
                      {r.source_path}
                    </td>
                    <td className="py-4 px-4 font-mono text-[#24151B]">
                      {r.target_url}
                    </td>
                    <td className="py-4 px-4">
                      <AdminBadge variant={r.status_code === 301 ? "published" : "gold"} size="xs">
                        {r.status_code} {r.status_code === 301 ? "Permanent" : "Temporary"}
                      </AdminBadge>
                    </td>
                    <td className="py-4 px-4 font-mono text-[#777078]">
                      {r.hits || 0} hits
                    </td>
                    <td className="py-4 px-4">
                      <AdminBadge variant={r.is_active ? "active" : "neutral"} size="xs">
                        {r.is_active ? "ACTIVE" : "DISABLED"}
                      </AdminBadge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(r)}
                          className="p-2 rounded-xl border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && editingRule && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#24151B]">
                  {editingRule.id ? "Edit Redirect Rule" : "Create Redirect Rule"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#24151B] block mb-1">Source Path (e.g. /old-services)</label>
                <input
                  type="text"
                  required
                  value={editingRule.source_path || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, source_path: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl font-mono text-[11px] text-[#24151B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">Target Destination (e.g. /services)</label>
                <input
                  type="text"
                  required
                  value={editingRule.target_url || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, target_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl font-mono text-[11px] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#24151B] block mb-1">Status Code</label>
                  <select
                    value={editingRule.status_code || 301}
                    onChange={(e) => setEditingRule({ ...editingRule, status_code: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl font-semibold text-[#24151B]"
                  >
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#24151B] block mb-1">State</label>
                  <select
                    value={editingRule.is_active ? 1 : 0}
                    onChange={(e) => setEditingRule({ ...editingRule, is_active: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl font-semibold text-[#24151B]"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
                  Save Rule
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
