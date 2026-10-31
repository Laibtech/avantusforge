"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Eye,
  FileText,
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

interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  category: string;
  author: string;
  author_role: string;
  featured_image?: string;
  excerpt: string;
  content: string;
  read_time: string;
  tags_json?: string;
  status: "published" | "draft";
  published_at?: string;
  created_at?: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingBlog, setEditingBlog] = useState<Partial<BlogArticle> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (data.success && data.blogs) {
        setBlogs(data.blogs);
      }
    } catch (e) {
      console.error("Failed to fetch blogs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingBlog({
      title: "",
      slug: "",
      category: "Engineering",
      author: "Bilal",
      author_role: "Technical Director",
      excerpt: "",
      content: "",
      read_time: "5 min read",
      tags_json: JSON.stringify(["Architecture", "Performance"]),
      status: "published",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog: BlogArticle) => {
    setEditingBlog({ ...blog });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setFeedback("Article deleted successfully.");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Failed to delete article.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !editingBlog.title || !editingBlog.slug) {
      alert("Title and slug are required.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBlog),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingBlog(null);
        setFeedback("Article published and database updated.");
        fetchBlogs();
        setTimeout(() => setFeedback(null), 3500);
      } else {
        alert(data.message || "Failed to save article.");
      }
    } catch {
      alert("Network error saving article.");
    } finally {
      setSaving(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Top Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Articles & Insights" }]}
        eyebrow="Content Management System"
        title="Articles & Editorial Insights"
        description="Publish engineering viewpoints, case study commentary, and technical essays to /insights."
        badge={`${blogs.length} Articles Published`}
        badgeColor="burgundy"
      >
        <div className="flex items-center gap-2.5">
          <AdminButton
            variant="outline"
            size="sm"
            href="/insights"
            target="_blank"
            icon={Eye}
          >
            View Public Insights
          </AdminButton>
          <AdminButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            icon={Plus}
          >
            Create Article
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, author, or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs text-[#24151B] focus:outline-none focus:border-[#74102E]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#74102E] text-white shadow-2xs"
                  : "bg-white border border-[#EADFE3] text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-[#EADFE3] rounded-2xl shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#777078]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
            Loading articles from MySQL...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#777078] space-y-2">
            <BookOpen className="w-8 h-8 text-[#74102E]/40 mx-auto" />
            <p className="font-bold text-[#24151B]">No articles found.</p>
            <p>Click &quot;Create Article&quot; to draft your first perspective.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADFE3] bg-[#FAF7F7] text-[#777078] uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3.5 px-6 font-bold">Article Title &amp; Excerpt</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Author</th>
                  <th className="py-3.5 px-4 font-bold">Read Time</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3]">
                {filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF7F7]/80 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <Link
                        href={`/insights/${b.slug}`}
                        target="_blank"
                        className="font-bold text-[#24151B] text-sm hover:text-[#74102E] transition-colors flex items-center gap-1.5"
                      >
                        <span>{b.title}</span>
                        <ExternalLink className="w-3 h-3 opacity-40 shrink-0" />
                      </Link>
                      <p className="text-[11px] text-[#777078] line-clamp-1 mt-0.5">{b.excerpt}</p>
                      <span className="text-[10px] font-mono text-[#AFA7AB] block mt-0.5">
                        /insights/{b.slug}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <AdminBadge variant="burgundy" size="xs">
                        {b.category}
                      </AdminBadge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#24151B]">{b.author}</div>
                      <div className="text-[10px] text-[#777078]">{b.author_role}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-[#777078]">
                      {b.read_time}
                    </td>
                    <td className="py-4 px-4">
                      <AdminBadge variant={b.status === "published" ? "published" : "draft"} size="xs">
                        {b.status}
                      </AdminBadge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-2 rounded-xl border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#C43D4D] transition-colors cursor-pointer"
                          title="Delete Article"
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

      {/* Editor Modal */}
      {isModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#24151B]">
                  {editingBlog.id ? "Edit Perspective Article" : "Create Technical Insight"}
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

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Article Title</label>
                <input
                  type="text"
                  required
                  value={editingBlog.title || ""}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setEditingBlog((prev) => ({
                      ...prev,
                      title,
                      slug: prev?.id ? prev.slug : slug,
                    }));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.slug || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Category</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.category || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Author Name</label>
                  <input
                    type="text"
                    value={editingBlog.author || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Author Role / Title</label>
                  <input
                    type="text"
                    value={editingBlog.author_role || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author_role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Summary / Excerpt</label>
                <textarea
                  rows={2}
                  value={editingBlog.excerpt || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Full Article Content (Markdown or HTML supported)</label>
                <textarea
                  rows={8}
                  value={editingBlog.content || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
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
                  {saving ? "Saving..." : "Save Article"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
