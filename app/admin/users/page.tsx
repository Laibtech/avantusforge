"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  Lock,
  Search,
  Users,
  X,
  Mail,
  User as UserIcon,
  KeyRound,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface AdminUserRow {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  mfa_enabled: number;
  failed_attempts: number;
  last_login?: string;
  created_at: string;
}

const ROLES_INFO: Record<string, { label: string; desc: string; variant: "burgundy" | "gold" | "success" | "warning" | "neutral" | "active" }> = {
  super_admin: {
    label: "Super Admin",
    desc: "Complete system access, user administration, security & settings",
    variant: "burgundy",
  },
  admin: {
    label: "Website Manager",
    desc: "Website content, CMS pages, CRM leads & operations control",
    variant: "active",
  },
  content_editor: {
    label: "Content Editor",
    desc: "Pages, articles, portfolio & media library management",
    variant: "neutral",
  },
  crm_sales: {
    label: "Sales / CRM",
    desc: "Leads, inquiries, client onboarding & follow-ups",
    variant: "success",
  },
  project_manager: {
    label: "Project Manager",
    desc: "Client projects, delivery milestones & task assignment",
    variant: "neutral",
  },
  hr_manager: {
    label: "HR Manager",
    desc: "Staff directory, attendance records, leaves & payroll approvals",
    variant: "neutral",
  },
  finance_manager: {
    label: "Finance Manager",
    desc: "Invoices, client billing, payments, receipts & financial reports",
    variant: "gold",
  },
  employee: {
    label: "Employee",
    desc: "Staff member portal: schedule, tasks & payslip viewing",
    variant: "neutral",
  },
  client: {
    label: "Client",
    desc: "Dedicated client portal: view assigned deliverables & invoices",
    variant: "neutral",
  },
  seo_manager: {
    label: "SEO Manager",
    desc: "Search engine metadata, robots.txt & 301/302 redirects",
    variant: "warning",
  },
  analytics_viewer: {
    label: "Analytics Viewer",
    desc: "Read-only access to visitor telemetry & performance reports",
    variant: "neutral",
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<Partial<AdminUserRow & { password?: string }> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser({
      username: "",
      email: "",
      full_name: "",
      role: "content_editor",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUserRow) => {
    setEditingUser({ ...user, password: "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setFeedback("User deleted successfully.");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(data.message || "Failed to delete user.");
      }
    } catch {
      alert("Failed to delete user.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingUser(null);
        setFeedback(data.message);
        fetchUsers();
        setTimeout(() => setFeedback(null), 3500);
      } else {
        alert(data.message || "Failed to save user.");
      }
    } catch {
      alert("Network error saving user.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Users & Roles"
        description="Role-based access control (RBAC), cryptographically salted PBKDF2 authentication, and session security."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users & Roles" },
        ]}
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            icon={<Plus />}
            onClick={handleOpenCreate}
          >
            Add Admin User
          </AdminButton>
        }
      />

      {feedback && (
        <AdminAlert
          variant="success"
          message={feedback}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Roles Legend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(ROLES_INFO).map(([key, info]) => (
          <div key={key} className="p-3.5 bg-white border border-[#EADFE3] rounded-xl shadow-xs space-y-1.5">
            <AdminBadge variant={info.variant} size="sm">
              {info.label}
            </AdminBadge>
            <p className="text-[11px] text-[#777078] leading-relaxed pt-0.5">{info.desc}</p>
          </div>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#777078] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search administrators by username, email, or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#EADFE3] rounded-lg text-xs text-[#24151B] placeholder:text-[#777078] focus:outline-none focus:border-[#74102E] transition-colors shadow-xs"
        />
      </div>

      {/* Users Table */}
      <AdminCard noPadding>
        {loading ? (
          <div className="py-16 text-center text-xs text-[#777078]">Loading administrators...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#777078]">
            <Users className="w-8 h-8 mx-auto mb-2 text-[#777078] opacity-50" />
            <p className="font-medium text-[#24151B]">No user accounts found</p>
            <p className="text-[11px] text-[#777078] mt-1">Try adjusting your search criteria or add a new user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F7] text-[#777078] uppercase tracking-wider text-[10px] font-mono border-b border-[#EADFE3]">
                <tr>
                  <th className="p-4 font-semibold">User Identity</th>
                  <th className="p-4 font-semibold">Assigned Role</th>
                  <th className="p-4 font-semibold">Security State</th>
                  <th className="p-4 font-semibold">Last Login</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3] bg-white">
                {filteredUsers.map((u) => {
                  const roleData = ROLES_INFO[u.role] || {
                    label: u.role,
                    variant: "neutral" as const,
                  };
                  const isLocked = u.failed_attempts >= 5;

                  return (
                    <tr key={u.id} className="hover:bg-[#FAF7F7] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#24151B]">{u.full_name}</div>
                        <div className="text-[11px] text-[#777078] flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[#74102E]">@{u.username}</span>
                          <span>•</span>
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <AdminBadge variant={roleData.variant} size="sm">
                          {roleData.label}
                        </AdminBadge>
                      </td>
                      <td className="p-4">
                        {isLocked ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-max">
                            <Lock className="w-3 h-3" /> Locked ({u.failed_attempts} fails)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                            <Shield className="w-3 h-3" /> Active / Secure
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#777078] font-mono text-[11px]">
                        {u.last_login ? new Date(u.last_login).toLocaleString() : "Never logged in"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-[#24151B] hover:text-[#74102E] hover:bg-[#FBF4F6] rounded-lg transition-colors cursor-pointer"
                            title="Edit Role or Password"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Create / Edit User Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EADFE3] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] text-[#74102E] flex items-center justify-center border border-[#EADFE3]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#24151B]">
                    {editingUser.id ? `Edit Account: @${editingUser.username}` : "Create Administrator Account"}
                  </h3>
                  <p className="text-[11px] text-[#777078]">
                    Configure administrative credentials and RBAC access tier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#24151B] block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  placeholder="e.g. Bilal Khan"
                  className="w-full p-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-lg text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="font-semibold text-[#24151B] block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingUser.id)}
                  value={editingUser.username || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="e.g. bilal.khan"
                  className={`w-full p-2.5 border border-[#EADFE3] rounded-lg text-xs font-mono transition-colors ${
                    editingUser.id
                      ? "bg-neutral-100 text-[#777078] cursor-not-allowed"
                      : "bg-[#FAF7F7] text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-[#24151B] block mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="bilal@avantusforge.com"
                  className="w-full p-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-lg text-xs text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="font-semibold text-[#24151B] block mb-1">Assigned Role</label>
                <select
                  value={editingUser.role || "content_editor"}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-lg text-xs font-semibold text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="super_admin">Super Admin (Complete Access &amp; Security)</option>
                  <option value="admin">Website Manager (CMS &amp; General Ops)</option>
                  <option value="content_editor">Content Editor (Pages, Blogs &amp; Media)</option>
                  <option value="crm_sales">Sales / CRM (Leads &amp; Client Onboarding)</option>
                  <option value="project_manager">Project Manager (Client Delivery &amp; Milestones)</option>
                  <option value="hr_manager">HR Manager (Staff, Attendance &amp; Payroll)</option>
                  <option value="finance_manager">Finance Manager (Invoices, Billing &amp; Expenses)</option>
                  <option value="employee">Employee (Internal Staff Portal)</option>
                  <option value="client">Client (Client Portal Access)</option>
                  <option value="seo_manager">SEO Manager (Metadata &amp; Redirects)</option>
                  <option value="analytics_viewer">Analytics Viewer (Read-only Telemetry)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#24151B] block mb-1">
                  {editingUser.id ? "New Password (Leave blank to keep current)" : "Initial Password (min 8 chars) *"}
                </label>
                <input
                  type="password"
                  required={!editingUser.id}
                  value={editingUser.password || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-lg text-xs font-mono text-[#24151B] focus:outline-none focus:border-[#74102E] focus:bg-white transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFE3]">
                <AdminButton
                  variant="secondary"
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
                >
                  {saving ? "Saving..." : "Save Account"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
