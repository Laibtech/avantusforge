"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface ServiceItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  short_desc: string;
  deliverables_json: string;
  pricing_tier: string;
  is_featured: boolean;
  order_index: number;
  status: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const json = await res.json();
      if (json.success && json.services) {
        setServices(json.services);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingService({
      slug: "",
      title: "",
      category: "Software Engineering",
      short_desc: "",
      deliverables_json: JSON.stringify(["Custom Web Applications", "API Integration", "Cloud Deployment"]),
      pricing_tier: "Enterprise Bespoke",
      is_featured: false,
      order_index: services.length + 1,
      status: "published",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title || !editingService?.slug) {
      setMessage({ type: "error", text: "Please enter title and slug." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Service successfully saved to database." });
        setEditingService(null);
        fetchServices();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save service." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete service '${title}'?`)) return;

    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Service '${title}' removed.` });
        fetchServices();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const categories = ["ALL", ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== "ALL" && s.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.slug.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Services Catalog" }]}
        eyebrow="Commercial Offerings"
        title="Services Catalog CMS"
        description="Full CRUD control over agency service offerings, deliverables tags, and pricing tiers."
        badge={`${services.length} Services`}
        badgeColor="burgundy"
      >
        <AdminButton
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={Plus}
        >
          New Service
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service title or slug..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs bg-[#FAF7F7] focus:outline-none focus:border-[#74102E] text-[#24151B]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#74102E] text-white shadow-2xs"
                  : "text-[#777078] hover:bg-[#FAF7F7] hover:text-[#24151B]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F7] text-[#777078] uppercase text-[10px] font-mono tracking-wider border-b border-[#EADFE3]">
              <tr>
                <th className="py-3.5 px-6">Order / Category</th>
                <th className="py-3.5 px-4">Service Title &amp; Slug</th>
                <th className="py-3.5 px-4">Pricing Tier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFE3]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#777078]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
                    Loading services catalog...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#777078]">
                    No services found. Click &quot;New Service&quot; above to create one.
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-[#FAF7F7]/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#777078] font-bold">#{srv.order_index}</span>
                        <AdminBadge variant="burgundy" size="xs">
                          {srv.category}
                        </AdminBadge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#24151B] text-sm">{srv.title}</div>
                      <div className="text-[11px] font-mono text-[#777078]">/services/{srv.slug}</div>
                    </td>
                    <td className="py-4 px-4 text-[#24151B] font-semibold">{srv.pricing_tier}</td>
                    <td className="py-4 px-4">
                      <AdminBadge variant="published" size="xs">
                        {srv.status}
                      </AdminBadge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/services/${srv.slug}`}
                          target="_blank"
                          className="p-2 rounded-xl border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#24151B] transition-colors"
                          title="View Service on Live Site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingService(srv)}
                          className="p-2 rounded-xl border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(srv.id, srv.title)}
                          className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                          title="Delete Service"
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
      {editingService && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#24151B]">
                  {editingService.id ? `Edit Service: ${editingService.title}` : "Create New Service"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Service Title</label>
                <input
                  type="text"
                  required
                  value={editingService.title || ""}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingService.slug || ""}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Category</label>
                  <input
                    type="text"
                    required
                    value={editingService.category || ""}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Short Description</label>
                <textarea
                  rows={2}
                  value={editingService.short_desc || ""}
                  onChange={(e) => setEditingService({ ...editingService, short_desc: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Pricing Tier</label>
                  <input
                    type="text"
                    value={editingService.pricing_tier || "Enterprise Bespoke"}
                    onChange={(e) => setEditingService({ ...editingService, pricing_tier: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Order Index</label>
                  <input
                    type="number"
                    value={editingService.order_index || 1}
                    onChange={(e) => setEditingService({ ...editingService, order_index: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Deliverables (JSON array or lines)</label>
                <textarea
                  rows={2}
                  value={editingService.deliverables_json || ""}
                  onChange={(e) => setEditingService({ ...editingService, deliverables_json: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(null)}
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
                  {saving ? "Saving..." : "Save Service"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
