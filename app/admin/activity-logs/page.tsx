"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Download,
  User,
  Clock,
  Shield,
  Layers,
  FileText,
  Activity,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminEmptyState,
  AdminLoadingState,
} from "@/components/admin/ui";

interface ActivityLog {
  id: number;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("All");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEntity !== "All") params.set("entity", selectedEntity);
      if (search) params.set("q", search);

      const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.entities) setEntities(["All", ...data.entities]);
      }
    } catch (e) {
      console.error("Failed to load activity logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedEntity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ["ID", "Timestamp", "Actor", "Action", "Entity Type", "Entity ID", "Details", "IP Address"];
    const rows = logs.map((l) => [
      l.id,
      `"${l.created_at}"`,
      `"${l.actor}"`,
      `"${l.action}"`,
      `"${l.entity_type}"`,
      `"${l.entity_id || ""}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.ip_address}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `avantusforge-activity-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Admin Activity Logs"
        description="Immutable chronological record of administrator actions, publishing events, settings changes, and security updates."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Admin Activity Logs" },
        ]}
        actions={
          <AdminButton
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-[#74102E]" />}
            onClick={exportCsv}
            disabled={logs.length === 0}
          >
            Export Audit Log
          </AdminButton>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#777078] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, action name, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EADFE3] rounded-lg text-xs text-[#24151B] placeholder:text-[#777078] focus:outline-none focus:border-[#74102E] transition-colors shadow-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5">
          {entities.map((ent) => (
            <button
              key={ent}
              type="button"
              onClick={() => setSelectedEntity(ent)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedEntity === ent
                  ? "bg-[#74102E] text-white shadow-xs"
                  : "bg-white border border-[#EADFE3] text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7]"
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <AdminCard noPadding>
        {loading ? (
          <div className="py-16">
            <AdminLoadingState message="Loading immutable audit trail..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16">
            <AdminEmptyState
              icon={<History className="w-8 h-8 text-[#74102E]/40" />}
              title="No activity records found"
              description="No administrative events match your selected filters. Actions performed across CMS modules will be captured here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F7] text-[#777078] uppercase tracking-wider text-[10px] font-mono border-b border-[#EADFE3]">
                <tr>
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">Administrator</th>
                  <th className="p-4 font-semibold">Action</th>
                  <th className="p-4 font-semibold">Entity</th>
                  <th className="p-4 font-semibold">Event Details</th>
                  <th className="p-4 font-semibold text-right">IP Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFE3] bg-white">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F7] transition-colors">
                    <td className="p-4 font-mono text-[11px] text-[#777078] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-[#24151B] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center shrink-0">
                          <User className="w-3 h-3" />
                        </div>
                        <span>{log.actor}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold bg-[#FAF7F7] border border-[#EADFE3] px-2 py-0.5 rounded text-[#24151B]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <AdminBadge variant="burgundy" size="sm">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ""}
                      </AdminBadge>
                    </td>
                    <td className="p-4 text-[#24151B] max-w-md">
                      <div className="line-clamp-2 leading-relaxed">{log.details}</div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-[#777078] text-right whitespace-nowrap">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
