"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  FolderGit2,
  DollarSign,
  Edit2,
  Trash2,
  Save,
  X,
  UserCheck,
  Briefcase,
  AlertCircle,
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

interface Client {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  country: string;
  website?: string;
  status: "Active" | "Onboarding" | "Inactive" | "Archived";
  account_manager: string;
  notes?: string;
  projects_count?: number;
  invoices_count?: number;
  outstanding_balance?: number;
  created_at?: string;
}

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "United Arab Emirates",
  "Kuwait",
  "Pakistan",
  "Saudi Arabia",
  "Canada",
  "Germany",
  "Australia",
];

const ACCOUNT_MANAGERS = [
  "Usman Farooq",
  "Hamza Tariq",
  "Laiba Baig",
  "Bilal (Tech Director)",
  "Muzamil (Ops Director)",
];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/clients", window.location.origin);
      if (search.trim()) url.searchParams.set("search", search.trim());
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setClients(data.clients || []);
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to load clients." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  const handleOpenCreate = () => {
    setEditingClient({
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      country: "United Kingdom",
      status: "Active",
      account_manager: "Usman Farooq",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient({ ...client });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient?.company_name || !editingClient?.contact_name || !editingClient?.email) {
      setFeedback({ type: "error", text: "Company name, contact person, and email are required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingClient),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setIsModalOpen(false);
        setEditingClient(null);
        fetchClients();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to save client." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (force = false) => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/admin/clients?id=${deleteConfirm.id}&force=${force}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: data.message });
        setDeleteConfirm(null);
        if (selectedClient?.id === deleteConfirm.id) setSelectedClient(null);
        fetchClients();
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Error deleting client: " + err.message });
    }
  };

  // Metrics
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const totalOutstanding = clients.reduce((sum, c) => sum + Number(c.outstanding_balance || 0), 0);
  const totalProjects = clients.reduce((sum, c) => sum + Number(c.projects_count || 0), 0);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Clients Directory" }]}
        eyebrow="Commercial Accounts CRM"
        title="Client Accounts & Business CRM"
        description="Centralized registry for client organizations, contacts, linked projects, and billing balances."
        badge={`${totalClients} Organizations`}
        badgeColor="burgundy"
      >
        <AdminButton
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={Plus}
        >
          Register New Client
        </AdminButton>
      </AdminPageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Total Client Directory
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#777078]">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B]">{totalClients}</div>
          <div className="text-xs text-[#159B70] font-semibold">Enterprise & SME accounts</div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Active Retainers
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#74102E]">{activeClients}</div>
          <div className="text-xs text-[#777078]">Under active service contracts</div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Active Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] flex items-center justify-center text-[#777078]">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#24151B]">{totalProjects}</div>
          <div className="text-xs text-[#777078]">Linked delivery initiatives</div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-2 hover:border-[#74102E]/30 transition-all">
          <div className="flex items-center justify-between text-[#777078]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Outstanding Invoices
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D69A32]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#D69A32]">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#777078]">Total balance pending</div>
        </div>
      </div>

      {feedback && (
        <AdminAlert
          variant={feedback.type}
          message={feedback.text}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#EADFE3]">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#777078] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, contact person, email, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#777078]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs font-medium text-[#24151B] focus:outline-none focus:border-[#74102E] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={fetchClients}
            className="px-3 py-2 rounded-lg border border-[#EADFE3] bg-[#FAF7F7] hover:bg-white text-xs font-semibold text-[#4D4245] transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-[#EADFE3] overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#777078]">Loading client records...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-[#777078] mx-auto opacity-50" />
            <p className="text-xs font-bold text-[#24151B]">No clients found matching query</p>
            <p className="text-[11px] text-[#777078]">Try adjusting search filters or add a new client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F7] border-b border-[#EADFE3] text-[#777078] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Company / Organization</th>
                  <th className="py-3 px-4 font-bold">Primary Contact</th>
                  <th className="py-3 px-4 font-bold">Country & Territory</th>
                  <th className="py-3 px-4 font-bold">Account Lead</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Projects & Billing</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3]">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF7F7]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedClient(c)}
                        className="text-left font-bold text-[#24151B] hover:text-[#74102E] transition-colors cursor-pointer block"
                      >
                        {c.company_name}
                      </button>
                      {c.website && (
                        <a
                          href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#74102E] hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>{c.website}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#24151B]">{c.contact_name}</div>
                      <div className="text-[11px] text-[#777078] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-[#777078]" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="text-[10px] text-[#777078] flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-[#24151B]">
                        <MapPin className="w-3.5 h-3.5 text-[#777078]" />
                        <span>{c.country}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#4D4245]">
                      {c.account_manager || "Unassigned"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          c.status === "Active"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : c.status === "Onboarding"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] font-semibold text-[#24151B]">
                        {c.projects_count || 0} Project{c.projects_count === 1 ? "" : "s"}
                      </div>
                      <div className="text-[10px] text-[#777078]">
                        Bal:{" "}
                        <span className={Number(c.outstanding_balance) > 0 ? "font-bold text-amber-700" : "text-emerald-700"}>
                          ${Number(c.outstanding_balance || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedClient(c)}
                          className="px-2.5 py-1 rounded-md bg-[#FAF7F7] hover:bg-[#F7EEF1] text-[#74102E] font-semibold text-[11px] border border-[#EADFE3] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-md hover:bg-[#FAF7F7] text-[#777078] hover:text-[#24151B] transition-colors cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(c)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-[#777078] hover:text-rose-700 transition-colors cursor-pointer"
                          title="Delete Client"
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

      {/* Client CRM Details Slide-Over */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#EADFE3] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#74102E] font-bold">
                  Client CRM Dossier
                </span>
                <h3 className="text-base font-bold text-[#24151B]">{selectedClient.company_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Primary Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Contact Person
                  </label>
                  <div className="font-semibold text-[#24151B]">{selectedClient.contact_name}</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Lifecycle Status
                  </label>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F7EEF1] text-[#74102E] border border-[#EADFE3]">
                    {selectedClient.status}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Primary Email
                  </label>
                  <a href={`mailto:${selectedClient.email}`} className="text-[#74102E] hover:underline font-mono">
                    {selectedClient.email}
                  </a>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Direct Phone
                  </label>
                  <div className="text-[#24151B] font-mono">{selectedClient.phone || "Not specified"}</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Jurisdiction / Territory
                  </label>
                  <div className="text-[#24151B]">{selectedClient.country}</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Assigned Account Lead
                  </label>
                  <div className="text-[#24151B] font-semibold">{selectedClient.account_manager}</div>
                </div>
              </div>

              {selectedClient.address && (
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Physical / Billing Address
                  </label>
                  <div className="p-2.5 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-[#24151B]">
                    {selectedClient.address}
                  </div>
                </div>
              )}

              {/* Notes / Relationship History */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Relationship Notes & Delivery Scope
                </label>
                <div className="p-3 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-[#4D4245] leading-relaxed">
                  {selectedClient.notes || "No internal dossier notes logged."}
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 rounded-xl bg-[#F7EEF1]/60 border border-[#EADFE3] grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#777078] font-bold">Associated Projects</div>
                  <div className="text-xl font-bold text-[#24151B] mt-0.5">
                    {selectedClient.projects_count || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#777078] font-bold">Pending Invoices Balance</div>
                  <div className="text-xl font-bold text-amber-800 mt-0.5">
                    ${Number(selectedClient.outstanding_balance || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#EADFE3] bg-[#FAF7F7] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const c = selectedClient;
                  setSelectedClient(null);
                  handleOpenEdit(c);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold cursor-pointer"
              >
                Edit Client Info
              </button>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-3 py-1.5 rounded-lg border border-[#EADFE3] hover:bg-white text-xs font-medium text-[#4D4245] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#EADFE3] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#EADFE3] flex items-center justify-between bg-[#FAF7F7]">
              <h3 className="text-sm font-bold text-[#24151B]">
                {editingClient.id ? "Edit Client Account" : "Register New Client"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-[#777078] hover:text-[#24151B] hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClient.company_name || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, company_name: e.target.value })}
                    placeholder="e.g. Caremon Wellness Ltd"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClient.contact_name || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, contact_name: e.target.value })}
                    placeholder="e.g. Marcus Thorne"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingClient.email || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    placeholder="e.g. contact@domain.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editingClient.phone || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="+44 20 7946 0912"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Country Territory
                  </label>
                  <select
                    value={editingClient.country || "United Kingdom"}
                    onChange={(e) => setEditingClient({ ...editingClient, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  >
                    {COUNTRIES.map((cty) => (
                      <option key={cty} value={cty}>
                        {cty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={editingClient.status || "Active"}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={editingClient.website || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, website: e.target.value })}
                    placeholder="e.g. caremon.co.uk"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                    Assigned Account Manager
                  </label>
                  <select
                    value={editingClient.account_manager || "Usman Farooq"}
                    onChange={(e) => setEditingClient({ ...editingClient, account_manager: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                  >
                    {ACCOUNT_MANAGERS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  Physical / Billing Address
                </label>
                <input
                  type="text"
                  value={editingClient.address || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                  placeholder="e.g. Suite 400, Canary Wharf, London E14 5AA"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                  CRM Notes & Engagement History
                </label>
                <textarea
                  rows={3}
                  value={editingClient.notes || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  placeholder="Notes about contract scope, deliverables, communication preferences..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] text-xs focus:outline-none focus:border-[#74102E] text-[#24151B]"
                />
              </div>

              <div className="pt-4 border-t border-[#EADFE3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#EADFE3] hover:bg-gray-50 text-xs font-semibold text-[#4D4245] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#74102E] text-white hover:bg-[#5C0C23] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Client Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EADFE3] shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-full bg-rose-50 text-rose-700">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#24151B]">Confirm Client Deletion</h3>
                <p className="text-xs text-[#777078]">This action will safely check dependencies first.</p>
              </div>
            </div>

            <p className="text-xs text-[#4D4245]">
              Are you sure you want to delete <span className="font-bold text-[#24151B]">{deleteConfirm.company_name}</span>? If this client has active projects or unpaid balances, the system will prevent accidental deletion.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 rounded-lg border border-[#EADFE3] hover:bg-gray-50 text-xs font-semibold text-[#4D4245] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(false)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
