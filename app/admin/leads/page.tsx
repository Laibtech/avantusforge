"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Building,
  UserCheck,
  Calendar,
  Trash2,
  Send,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface LeadItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  status: "New" | "In Progress" | "Contacted" | "Converted" | "Closed" | "Qualified" | "Proposal Sent" | "Won" | "Lost";
  priority: "High" | "Normal" | "Low";
  lead_source: string;
  assigned_to?: string;
  internal_notes?: string;
  follow_up_date?: string;
  created_at?: string;
  updated_at?: string;
}

const PRIMARY_STATUSES = ["New", "In Progress", "Contacted", "Converted", "Closed"];
const CHANNELS = ["All", "Contact Enquiries", "Free Consultation", "Service Enquiries", "Career Applications"];
const TEAM_MEMBERS = ["Unassigned", "Laiba Baig (CEO)", "Bilal (Tech Director)", "Muzamil (Ops Director)", "Maira (Designer)"];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inquiries" | "subscribers">("inquiries");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/leads");
      const json = await res.json();
      if (json.success) {
        setLeads(json.data || []);
        setSubscribers(json.subscribers || []);
      }
    } catch (e) {
      console.error("Failed to load leads", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateLead = async (updates: Partial<LeadItem>) => {
    if (!selectedLead) return;
    try {
      setIsUpdating(true);
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedLead.id, ...updates }),
      });
      if (res.ok) {
        const updated = { ...selectedLead, ...updates };
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updated : l)));
        setSelectedLead(updated);
        setFeedback("Lead updated successfully.");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error("Error updating lead", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this lead inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedLead(null);
        setFeedback("Lead inquiry deleted.");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Failed to delete lead.");
    }
  };

  const exportCsv = () => {
    if (leads.length === 0) return;
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Service",
      "Budget",
      "Source",
      "Status",
      "Priority",
      "Assigned To",
      "Follow-Up Date",
      "Notes",
      "Created At",
    ];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ""}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${(l.service || "").replace(/"/g, '""')}"`,
      `"${l.budget || ""}"`,
      `"${l.lead_source}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${l.assigned_to || "Unassigned"}"`,
      `"${l.follow_up_date || ""}"`,
      `"${(l.internal_notes || "").replace(/"/g, '""')}"`,
      `"${l.created_at || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `avantusforge-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus =
      selectedStatus === "All" ||
      l.status.toLowerCase() === selectedStatus.toLowerCase() ||
      (selectedStatus === "In Progress" && (l.status === "Qualified" || l.status === "Proposal Sent")) ||
      (selectedStatus === "Converted" && l.status === "Won") ||
      (selectedStatus === "Closed" && l.status === "Lost");

    const matchesChannel =
      selectedChannel === "All" ||
      (selectedChannel === "Contact Enquiries" && l.lead_source?.toLowerCase().includes("contact")) ||
      (selectedChannel === "Free Consultation" && l.lead_source?.toLowerCase().includes("consultation")) ||
      (selectedChannel === "Service Enquiries" && l.lead_source?.toLowerCase().includes("service")) ||
      (selectedChannel === "Career Applications" && l.lead_source?.toLowerCase().includes("career"));

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.service && l.service.toLowerCase().includes(q));

    return matchesStatus && matchesChannel && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
      {/* Top Banner */}
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Inquiries & CRM" }]}
        eyebrow="CRM & Commercial Pipeline"
        title="Lead & Form Management"
        description="Centralized intake across Contact forms, Free consultation requests, Service inquiries, Career applications, and Newsletter subscribers."
        badge={`${leads.length} Active Leads`}
        badgeColor="burgundy"
      >
        <div className="flex items-center gap-3">
          {/* View Switcher Tabs */}
          <div className="flex items-center bg-white border border-[#EADFE3] rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("inquiries")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "inquiries" ? "bg-[#74102E] text-white shadow-2xs" : "text-[#777078] hover:text-[#24151B]"
              }`}
            >
              Inquiries ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subscribers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "subscribers" ? "bg-[#74102E] text-white shadow-2xs" : "text-[#777078] hover:text-[#24151B]"
              }`}
            >
              Newsletter ({subscribers.length})
            </button>
          </div>

          <AdminButton
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={leads.length === 0}
            icon={Download}
          >
            Export CSV
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

      {activeTab === "subscribers" ? (
        /* Newsletter Subscribers View */
        <div className="bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFE3]/60">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block">
                Audience Growth
              </span>
              <h3 className="text-base font-bold text-[#24151B] tracking-tight mt-0.5">Newsletter Subscribers</h3>
              <p className="text-xs text-[#777078]">Verified email signups from footer &amp; editorial pages.</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#74102E] bg-[#FBF4F6] border border-[#EADFE3] px-2.5 py-1 rounded-lg">
              {subscribers.length} Emails
            </span>
          </div>

          {subscribers.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#777078]">No subscribers recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EADFE3] bg-[#FAF7F7] text-[#777078] uppercase tracking-wider text-[10px] font-mono">
                    <th className="py-3 px-4 font-bold">Email Address</th>
                    <th className="py-3 px-4 font-bold">Subscribed Date</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFE3]/60">
                  {subscribers.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF7F7] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#24151B] font-mono">{s.email}</td>
                      <td className="py-3.5 px-4 text-[#777078]">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <AdminBadge variant="active" size="xs">
                          Active Subscriber
                        </AdminBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* CRM Leads & Pipeline View */
        <>
          {/* Status KPI Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedStatus("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === "All"
                  ? "bg-[#74102E] text-white shadow-2xs"
                  : "bg-white border border-[#EADFE3] text-[#777078] hover:text-[#24151B]"
              }`}
            >
              All Inquiries ({leads.length})
            </button>
            {PRIMARY_STATUSES.map((st) => {
              const count = leads.filter((l) => {
                if (st === "In Progress") return l.status === "In Progress" || (l.status as string) === "Qualified" || (l.status as string) === "Proposal Sent";
                if (st === "Converted") return l.status === "Converted" || (l.status as string) === "Won";
                if (st === "Closed") return l.status === "Closed" || (l.status as string) === "Lost";
                return l.status === st;
              }).length;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStatus === st
                      ? "bg-[#74102E] text-white shadow-2xs"
                      : "bg-white border border-[#EADFE3] text-[#777078] hover:text-[#24151B]"
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {/* Search & Channel Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads by contact name, email, company, service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs text-[#24151B] focus:outline-none focus:border-[#74102E]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#777078]">Channel:</span>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="px-3 py-2 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-xs font-semibold text-[#24151B] focus:outline-none focus:border-[#74102E]"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Table + Drawer Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div
              className={`bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] ${
                selectedLead ? "lg:col-span-7" : "lg:col-span-12"
              }`}
            >
              {loading ? (
                <div className="py-16 text-center text-xs text-[#777078]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#74102E] mb-2" />
                  Loading inquiries...
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#777078] space-y-2">
                  <Users className="w-8 h-8 text-[#74102E]/40 mx-auto" />
                  <p className="font-semibold text-[#24151B]">No matching inquiries found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EADFE3] bg-[#FAF7F7] text-[#777078] uppercase tracking-wider text-[10px] font-mono">
                        <th className="py-3 px-3 font-bold">Contact</th>
                        <th className="py-3 px-3 font-bold">Service &amp; Budget</th>
                        <th className="py-3 px-3 font-bold">Channel</th>
                        <th className="py-3 px-3 font-bold">Status</th>
                        <th className="py-3 px-3 font-bold text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADFE3]/60">
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setNoteInput(lead.internal_notes || "");
                          }}
                          className={`hover:bg-[#FAF7F7] transition-colors cursor-pointer ${
                            selectedLead?.id === lead.id ? "bg-[#FBF4F6]" : ""
                          }`}
                        >
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-[#24151B]">{lead.name}</div>
                            <div className="text-[11px] text-[#777078]">{lead.email}</div>
                            {lead.company && (
                              <div className="text-[10px] text-[#74102E] font-semibold">{lead.company}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-[#24151B]">{lead.service || "General Inquiry"}</div>
                            <div className="text-[11px] text-[#777078]">{lead.budget || "Not specified"}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <AdminBadge variant="burgundy" size="xs">
                              {lead.lead_source}
                            </AdminBadge>
                          </td>
                          <td className="py-3.5 px-3">
                            <AdminBadge
                              variant={
                                lead.status === "New"
                                  ? "warning"
                                  : lead.status === "Converted" || lead.status === "Won"
                                  ? "success"
                                  : lead.status === "In Progress" || lead.status === "Qualified" || lead.status === "Proposal Sent"
                                  ? "gold"
                                  : lead.status === "Closed" || lead.status === "Lost"
                                  ? "neutral"
                                  : "warning"
                              }
                              size="xs"
                            >
                              {lead.status}
                            </AdminBadge>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className="text-[11px] font-bold text-[#74102E] hover:underline">
                              Details →
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selected Lead Inspector Drawer */}
            {selectedLead && (
              <div className="lg:col-span-5 bg-white border border-[#EADFE3] rounded-2xl p-6 shadow-[0_2px_8px_rgba(36,21,27,0.03)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#EADFE3]">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#74102E]">
                      Lead #{selectedLead.id} • {selectedLead.lead_source}
                    </span>
                    <h3 className="text-xl font-bold text-[#24151B] mt-0.5">{selectedLead.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="text-xs text-[#777078] hover:text-[#24151B] p-1 cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Workflow Status Controls */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-[#24151B] block mb-1">Status</label>
                    <select
                      value={selectedLead.status}
                      disabled={isUpdating}
                      onChange={(e) => handleUpdateLead({ status: e.target.value as any })}
                      className="w-full p-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl font-bold text-[#24151B] focus:outline-none focus:border-[#74102E]"
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#24151B] block mb-1">Assign Lead To</label>
                    <select
                      value={selectedLead.assigned_to || "Unassigned"}
                      disabled={isUpdating}
                      onChange={(e) => handleUpdateLead({ assigned_to: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF7F7] border border-[#EADFE3] rounded-xl font-semibold text-[#24151B] focus:outline-none focus:border-[#74102E]"
                    >
                      {TEAM_MEMBERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Contact Chips */}
                <div className="p-4 bg-[#FAF7F7] rounded-xl border border-[#EADFE3] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#24151B]">
                    <Mail className="w-4 h-4 text-[#74102E]" />
                    <a href={`mailto:${selectedLead.email}`} className="hover:underline font-semibold font-mono">
                      {selectedLead.email}
                    </a>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2 text-[#24151B]">
                      <Phone className="w-4 h-4 text-[#74102E]" />
                      <a href={`tel:${selectedLead.phone}`} className="hover:underline font-semibold">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="flex items-center gap-2 text-[#24151B]">
                      <Building className="w-4 h-4 text-[#74102E]" />
                      <span>{selectedLead.company}</span>
                    </div>
                  )}
                </div>

                {/* Inquiry Message */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777078] block">
                    Inquiry Message
                  </span>
                  <div className="p-3.5 bg-[#FAF7F7] rounded-xl border border-[#EADFE3] text-xs text-[#24151B] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedLead.message}
                  </div>
                </div>

                {/* Internal Operator Notes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777078] block">
                    Internal Operator Notes
                  </span>
                  <textarea
                    rows={3}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Log client call highlights, proposal delivery, follow-up dates..."
                    className="w-full p-2.5 text-xs bg-[#FAF7F7] border border-[#EADFE3] rounded-xl text-[#24151B] focus:outline-none focus:border-[#74102E]"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <AdminButton
                      variant="primary"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleUpdateLead({ internal_notes: noteInput })}
                    >
                      {isUpdating ? "Saving..." : "Save Notes"}
                    </AdminButton>

                    <button
                      type="button"
                      onClick={() => handleDeleteLead(selectedLead.id)}
                      className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Lead</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
