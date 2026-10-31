"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  HelpCircle,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Star,
  Search,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface Testimonial {
  id: number;
  client_name: string;
  client_role: string;
  company: string;
  content: string;
  rating: number;
  order_index: number;
  is_featured: number;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: number;
}

export default function AdminTestimonialsFaqPage() {
  const [activeTab, setActiveTab] = useState<"testimonials" | "faqs">("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials || []);
        setFaqs(data.faqs || []);
      }
    } catch (e) {
      console.error("Failed to load testimonials & faqs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "testimonial", item: editingTestimonial }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTestimonial(null);
        setFeedback("Testimonial saved successfully.");
        fetchData();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "faq", item: editingFaq }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingFaq(null);
        setFeedback("FAQ saved successfully.");
        fetchData();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: "testimonial" | "faq", id: number) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      const res = await fetch(`/api/admin/testimonials?type=${type}&id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback(`${type === "faq" ? "FAQ" : "Testimonial"} deleted.`);
        fetchData();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Delete failed.");
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Testimonials & FAQs" }]}
        eyebrow="Trust & Client Signals"
        title="Testimonials & FAQs CMS"
        description="Manage verified client reviews, executive endorsements, and frequently asked questions across the website."
        badge={`${testimonials.length} Reviews • ${faqs.length} FAQs`}
        badgeColor="burgundy"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white border border-[#EADFE3] rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("testimonials")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "testimonials" ? "bg-[#74102E] text-white shadow-2xs" : "text-[#777078] hover:text-[#24151B]"
              }`}
            >
              Testimonials ({testimonials.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "faqs" ? "bg-[#74102E] text-white shadow-2xs" : "text-[#777078] hover:text-[#24151B]"
              }`}
            >
              FAQs ({faqs.length})
            </button>
          </div>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => {
              if (activeTab === "testimonials") {
                setEditingTestimonial({
                  client_name: "",
                  client_role: "",
                  company: "",
                  content: "",
                  rating: 5,
                  order_index: testimonials.length + 1,
                  is_featured: 1,
                });
              } else {
                setEditingFaq({
                  question: "",
                  answer: "",
                  category: "General",
                  order_index: faqs.length + 1,
                  is_active: 1,
                });
              }
            }}
            icon={Plus}
          >
            {activeTab === "testimonials" ? "Add Testimonial" : "Add FAQ"}
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

      {/* Testimonials Tab View */}
      {activeTab === "testimonials" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-[#777078] bg-white border border-[#EADFE3] rounded-2xl">
              No testimonials created yet. Click &quot;Add Testimonial&quot; above.
            </div>
          ) : (
            testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] flex flex-col justify-between space-y-4 hover:border-[#74102E]/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#D6A45B]">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-[#777078]">#{t.order_index}</span>
                  </div>

                  <p className="text-xs text-[#24151B] italic leading-relaxed">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EADFE3]/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#24151B] text-xs">{t.client_name}</div>
                    <div className="text-[10px] text-[#777078]">
                      {t.client_role} {t.company ? `• ${t.company}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial(t)}
                      className="p-1.5 rounded-lg border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete("testimonial", t.id)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* FAQs Tab View */}
      {activeTab === "faqs" && (
        <div className="bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden">
          <div className="divide-y divide-[#EADFE3]">
            {faqs.length === 0 ? (
              <div className="p-16 text-center text-xs text-[#777078]">
                No FAQs recorded yet. Click &quot;Add FAQ&quot; above.
              </div>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="p-5 hover:bg-[#FAF7F7]/60 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <AdminBadge variant="burgundy" size="xs">
                        {faq.category}
                      </AdminBadge>
                      <h3 className="font-bold text-[#24151B] text-sm">{faq.question}</h3>
                    </div>
                    <p className="text-xs text-[#777078] leading-relaxed pl-1">{faq.answer}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingFaq(faq)}
                      className="p-1.5 rounded-lg border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete("faq", faq.id)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <h2 className="text-base font-bold text-[#24151B]">
                {editingTestimonial.id ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#24151B] block mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.client_name || ""}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, client_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#24151B] block mb-1">Client Role</label>
                  <input
                    type="text"
                    value={editingTestimonial.client_role || ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, client_role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-[#24151B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#24151B] block mb-1">Company</label>
                  <input
                    type="text"
                    value={editingTestimonial.company || ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-[#24151B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">Feedback Quote</label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.content || ""}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTestimonial(null)}
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
                  Save Testimonial
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <h2 className="text-base font-bold text-[#24151B]">
                {editingFaq.id ? "Edit FAQ" : "Add FAQ"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#24151B] block mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={editingFaq.category || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-[#24151B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingFaq(null)}
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
                  Save FAQ
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
