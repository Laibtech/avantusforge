"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, ArrowUpRight, CheckCircle2, Edit3, Save, Users, ExternalLink, X, RefreshCw } from "lucide-react";
import type { CmsTeamMember } from "@/lib/db";

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<CmsTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<CmsTeamMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/team");
      const json = await res.json();
      if (json.success && json.data) {
        setTeam(json.data);
      }
    } catch (e) {
      console.error("Failed to load team", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setIsSaving(true);
      setMessage("");
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMember),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("Team member saved successfully!");
        setTeam((prev) =>
          prev.map((m) => (m.id === editingMember.id ? editingMember : m))
        );
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      console.error("Failed to save team member", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Team Management" }]}
        eyebrow="Leadership & Talent"
        title="Executive Leadership CMS"
        description="Manage authentic team profiles rendered on the public /team page."
        badge={`${team.length} Leaders Listed`}
        badgeColor="burgundy"
      >
        <AdminButton
          variant="outline"
          size="sm"
          href="/team"
          target="_blank"
          icon={ExternalLink}
        >
          View Public /team
        </AdminButton>
      </AdminPageHeader>

      {message && (
        <AdminAlert
          variant="success"
          message={message}
          onDismiss={() => setMessage("")}
        />
      )}

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-16 text-center text-xs text-[#777078]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
            Loading executive profiles...
          </div>
        ) : (
          team.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#EADFE3] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(36,21,27,0.03)] p-6 space-y-4 flex flex-col justify-between hover:border-[#74102E]/30 transition-all"
            >
              <div className="space-y-4">
                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden border border-[#EADFE3] bg-[#FAF7F7]">
                  <Image
                    src={m.image_url}
                    alt={m.title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <AdminBadge variant="burgundy" size="xs">
                      {m.role}
                    </AdminBadge>
                    {m.linkedin_url && (
                      <a
                        href={m.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#0A66C2] hover:underline font-semibold"
                        title="Open LinkedIn Profile"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </a>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#24151B] mt-1.5">{m.title}</h3>
                  <p className="text-xs text-[#777078] leading-relaxed mt-2 line-clamp-3">
                    {m.bio}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EADFE3]/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#777078]">Order #{m.order_index}</span>
                <AdminButton
                  variant="ghost"
                  size="xs"
                  onClick={() => setEditingMember(m)}
                  icon={Edit3}
                >
                  Edit Profile
                </AdminButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal / Drawer */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <h3 className="text-base font-bold text-[#24151B]">
                Edit Profile: {editingMember.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-xs text-[#777078] hover:text-[#24151B] cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#24151B] block mb-1">Display Title / Name</label>
                <input
                  type="text"
                  value={editingMember.title}
                  onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs text-[#24151B] focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">Role / Department</label>
                <input
                  type="text"
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs text-[#24151B] focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">Professional Bio</label>
                <textarea
                  rows={4}
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs leading-relaxed text-[#24151B] focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">Uploaded Image Path</label>
                <input
                  type="text"
                  value={editingMember.image_url}
                  onChange={(e) => setEditingMember({ ...editingMember, image_url: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs font-mono text-[#24151B] focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div>
                <label className="font-bold text-[#24151B] block mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/..."
                  value={editingMember.linkedin_url || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, linkedin_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs text-[#24151B] focus:outline-none focus:border-[#74102E]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={isSaving}
                  icon={Save}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
