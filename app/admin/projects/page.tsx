"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Edit2,
  Save,
  X,
  TrendingUp,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface Project {
  id: number;
  title: string;
  client_name: string;
  budget: string;
  status: string;
  health: string;
  milestones_json: string;
  team_assigned: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject({
      title: "",
      client_name: "",
      budget: "$0",
      status: "In Progress",
      health: "On Track",
      team_assigned: "",
      milestones_json: JSON.stringify(["Phase 1: Architecture - Active", "Phase 2: Execution - Scheduled"]),
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject({ ...p });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.client_name) {
      setMessage({ type: "error", text: "Please enter a project title and client name." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Project saved successfully." });
        setShowModal(false);
        setEditingProject(null);
        fetchProjects();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save project." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const parseMilestones = (jsonStr: string): string[] => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) return parsed;
      return [jsonStr];
    } catch {
      return [jsonStr];
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
    if (
      searchQuery &&
      !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Top Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Client Projects" }]}
        eyebrow="Commercial Deliverables"
        title="Projects & Operations Console"
        description="Manage client deliverables, milestones, budget allocations, and engineering workloads."
        badge={`${projects.length} Total Projects`}
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

      {/* Operations Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#777078]">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B]">{projects.length}</div>
          <p className="text-xs text-[#777078]">Enterprise & bespoke contracts</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Active in Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#74102E]">
            {projects.filter((p) => p.status === "In Progress").length}
          </div>
          <p className="text-xs text-[#777078]">Currently in active sprint</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Delivered & Live</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#159B70]">
            {projects.filter((p) => p.status === "Completed").length}
          </div>
          <p className="text-xs text-[#777078]">Successfully deployed client systems</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Delivery Health</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#159B70]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#159B70]">100% On Track</div>
          <p className="text-xs text-[#777078]">No critical blockers reported</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or clients..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs bg-[#FAF7F7] focus:outline-none focus:border-[#74102E] text-[#24151B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(["ALL", "In Progress", "Completed"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                filterStatus === st
                  ? "bg-[#74102E] text-white shadow-2xs"
                  : "text-[#777078] hover:bg-[#FAF7F7] hover:text-[#24151B]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-16 text-center text-xs text-[#777078]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
            Loading operations projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full p-16 text-center text-xs text-[#777078] bg-white rounded-2xl border border-[#EADFE3]">
            No projects found matching the criteria.
          </div>
        ) : (
          filteredProjects.map((p) => {
            const isCompleted = p.status === "Completed";
            const milestones = parseMilestones(p.milestones_json);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#EADFE3] p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] flex flex-col justify-between space-y-4 hover:border-[#74102E]/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <AdminBadge
                      variant={isCompleted ? "published" : "warning"}
                      size="xs"
                    >
                      {p.status}
                    </AdminBadge>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg border border-[#EADFE3] bg-white hover:bg-[#FAF7F7] text-[#777078] hover:text-[#74102E] transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#24151B] leading-snug">{p.title}</h3>
                    <p className="text-xs text-[#74102E] font-semibold mt-0.5">{p.client_name}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#777078] pt-2 border-t border-[#EADFE3]/60">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#74102E]" />
                      <span className="font-bold text-[#24151B]">{p.budget || "Confidential"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold">{p.health || "On Track"}</span>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#777078] block">
                      Deliverables &amp; Milestones
                    </span>
                    <div className="space-y-1">
                      {milestones.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#24151B]">
                          <CheckCircle2 className="w-3 h-3 text-[#74102E] shrink-0" />
                          <span className="truncate">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EADFE3]/60 flex items-center justify-between text-[11px] text-[#777078]">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <Users className="w-3.5 h-3.5 text-[#74102E] shrink-0" />
                    <span className="truncate">{p.team_assigned || "Engineering Core"}</span>
                  </div>
                  <span className="font-mono text-[10px]">ID: #{p.id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit/Create Project Modal */}
      {showModal && editingProject && (
        <div className="fixed inset-0 z-50 bg-[#24151B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#24151B]">
                  {editingProject.id ? `Edit Project #${editingProject.id}` : "Create New Project"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
                  <label className="font-bold text-[#24151B]">Client Organization</label>
                  <input
                    type="text"
                    required
                    value={editingProject.client_name || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, client_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Contract Budget</label>
                  <input
                    type="text"
                    value={editingProject.budget || "$0"}
                    onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Delivery Status</label>
                  <select
                    value={editingProject.status || "In Progress"}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B] bg-white"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#24151B]">Sprint Health</label>
                  <select
                    value={editingProject.health || "On Track"}
                    onChange={(e) => setEditingProject({ ...editingProject, health: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B] bg-white"
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Assigned Team Lead / Engineers</label>
                <input
                  type="text"
                  value={editingProject.team_assigned || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, team_assigned: e.target.value })}
                  placeholder="e.g. Bilal (Tech Director), 2 Full-Stack Engineers"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#24151B]">Milestones (JSON array or lines)</label>
                <textarea
                  rows={3}
                  value={editingProject.milestones_json || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, milestones_json: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADFE3] font-mono text-[11px] focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
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
