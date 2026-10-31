"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Mail,
  Search,
  Database,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Activity,
  Terminal,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminAlert,
} from "@/components/admin/ui";

interface IntegrationItem {
  id: number;
  service_key: string;
  service_name: string;
  is_enabled: boolean;
  config: Record<string, any>;
  last_tested_at?: string;
  test_status: string;
  updated_at?: string;
}

const SERVICE_METADATA: Record<
  string,
  { icon: any; category: string; description: string; fields: { key: string; label: string; type: string; placeholder: string }[] }
> = {
  ga4: {
    icon: Activity,
    category: "Telemetry & Traffic",
    description: "Enterprise web analytics stream for client page-views, user journey events, and conversion tracking.",
    fields: [
      { key: "measurement_id", label: "Measurement ID", type: "text", placeholder: "G-XXXXXXXXXX" },
    ],
  },
  smtp: {
    icon: Mail,
    category: "Communication & Alerts",
    description: "Authenticated outgoing mail transport for contact form dispatches, client notifications, and payslips.",
    fields: [
      { key: "host", label: "SMTP Server Host", type: "text", placeholder: "smtp.avantusforge.com" },
      { key: "port", label: "Port", type: "number", placeholder: "587" },
      { key: "user", label: "Username / Email", type: "text", placeholder: "noreply@avantusforge.com" },
      { key: "password", label: "Password / App Secret", type: "password", placeholder: "••••••••" },
    ],
  },
  search_console: {
    icon: Search,
    category: "SEO & Indexing",
    description: "Production indexing integration verifying site ownership, sitemap submission, and search visibility.",
    fields: [
      { key: "site_url", label: "Canonical Site Property URL", type: "text", placeholder: "https://avantusforge.com" },
    ],
  },
  storage: {
    icon: Database,
    category: "Infrastructure & Media",
    description: "Encrypted file repository for high-resolution portfolio images, corporate documents, and media assets.",
    fields: [
      { key: "provider", label: "Storage Engine Provider", type: "text", placeholder: "local_encrypted" },
      { key: "base_dir", label: "Storage Root Path", type: "text", placeholder: "public/uploads" },
    ],
  },
  stripe: {
    icon: CreditCard,
    category: "Billing & Invoicing",
    description: "Secure payment gateway for international client retainers, credit card settlements, and webhooks.",
    fields: [
      { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_live_..." },
      { key: "secret_key", label: "Secret Key", type: "password", placeholder: "••••••••" },
    ],
  },
};

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/integrations");
      const data = await res.json();
      if (data.success && data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to load integrations: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConfigChange = (serviceKey: string, fieldKey: string, value: any) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.service_key === serviceKey) {
          return {
            ...item,
            config: {
              ...item.config,
              [fieldKey]: value,
            },
          };
        }
        return item;
      })
    );
  };

  const handleToggleEnable = (serviceKey: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.service_key === serviceKey) {
          return { ...item, is_enabled: !item.is_enabled };
        }
        return item;
      })
    );
  };

  const handleSave = async (item: IntegrationItem) => {
    setSavingKey(item.service_key);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          service_key: item.service_key,
          is_enabled: item.is_enabled,
          config: item.config,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `${item.service_name} settings updated.` });
      } else {
        setFeedback({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Save error: " + err.message });
    } finally {
      setSavingKey(null);
    }
  };

  const handleTestConnection = async (item: IntegrationItem) => {
    setTestingKey(item.service_key);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          service_key: item.service_key,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `Connection Verified: ${data.message}` });
        fetchIntegrations();
      } else {
        setFeedback({ type: "error", text: `Diagnostic Warning: ${data.message}` });
        fetchIntegrations();
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Diagnostic probe failed: " + err.message });
    } finally {
      setTestingKey(null);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Metrics
  const activeCount = integrations.filter((i) => i.is_enabled).length;
  const verifiedCount = integrations.filter((i) => i.test_status === "Verified").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="System Integrations"
        description="Central hub for Google Analytics 4, SMTP mail server, Search Console, secure storage, and payment gateways."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "System Integrations" },
        ]}
        actions={
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={loading ? "animate-spin" : ""} />}
            onClick={fetchIntegrations}
          >
            Reload Status
          </AdminButton>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#777078] font-bold">
            Configured Connectors
          </div>
          <div className="text-2xl font-extrabold text-[#24151B]">{integrations.length}</div>
          <div className="text-xs text-[#777078]">Core enterprise interfaces</div>
        </AdminCard>

        <AdminCard className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#777078] font-bold">
            Active Integrations
          </div>
          <div className="text-2xl font-extrabold text-[#74102E]">{activeCount}</div>
          <div className="text-xs text-[#777078]">Enabled for traffic/events</div>
        </AdminCard>

        <AdminCard className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#777078] font-bold">
            Live Verified
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{verifiedCount}</div>
          <div className="text-xs text-emerald-700 font-medium">Diagnostic probe passed</div>
        </AdminCard>

        <AdminCard className="p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#777078] font-bold">
            Credentials Vault
          </div>
          <div className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Encrypted At Rest</span>
          </div>
          <div className="text-xs text-[#777078]">Never exposed to public client</div>
        </AdminCard>
      </div>

      {feedback && (
        <AdminAlert
          variant={feedback.type === "success" ? "success" : "error"}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {integrations.map((item) => {
          const meta = SERVICE_METADATA[item.service_key] || {
            icon: Layers,
            category: "General",
            description: "External system interface.",
            fields: [],
          };
          const Icon = meta.icon;

          return (
            <AdminCard
              key={item.id}
              className="p-5 space-y-4 flex flex-col justify-between"
            >
              {/* Top Row: Icon, Title & Toggle */}
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EADFE3]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-[#74102E] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#777078] font-bold tracking-wider">
                        {meta.category}
                      </span>
                      <h3 className="text-sm font-bold text-[#24151B]">{item.service_name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminBadge
                      variant={
                        item.test_status === "Verified" || item.test_status === "Active"
                          ? "success"
                          : item.test_status === "Configured"
                          ? "active"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {item.test_status}
                    </AdminBadge>

                    <button
                      type="button"
                      onClick={() => handleToggleEnable(item.service_key)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.is_enabled ? "bg-[#74102E]" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          item.is_enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#777078] mt-3 leading-relaxed">{meta.description}</p>

                {/* Configuration Fields */}
                <div className="mt-4 space-y-3">
                  {meta.fields.map((f) => {
                    const val = item.config[f.key] ?? "";
                    const isPwd = f.type === "password";
                    const isShown = showPasswordMap[`${item.service_key}_${f.key}`];

                    return (
                      <div key={f.key}>
                        <label className="text-[10px] font-mono uppercase text-[#777078] font-bold block mb-1">
                          {f.label}
                        </label>
                        <div className="relative">
                          <input
                            type={isPwd && !isShown ? "password" : "text"}
                            placeholder={f.placeholder}
                            value={val}
                            onChange={(e) => handleConfigChange(item.service_key, f.key, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F7] border border-[#EADFE3] font-mono text-xs focus:outline-none focus:border-[#74102E] focus:bg-white text-[#24151B] transition-colors"
                          />
                          {isPwd && (
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(`${item.service_key}_${f.key}`)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777078] hover:text-[#24151B] cursor-pointer"
                            >
                              {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer: Last Tested & Actions */}
              <div className="pt-4 border-t border-[#EADFE3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-[#777078] font-mono">
                  Last checked:{" "}
                  {item.last_tested_at ? new Date(item.last_tested_at).toLocaleString() : "Never tested"}
                </div>

                <div className="flex items-center gap-2">
                  <AdminButton
                    variant="outline"
                    size="sm"
                    icon={<Terminal className="w-3.5 h-3.5 text-[#74102E]" />}
                    onClick={() => handleTestConnection(item)}
                    loading={testingKey === item.service_key}
                  >
                    {testingKey === item.service_key ? "Probing..." : "Test"}
                  </AdminButton>

                  <AdminButton
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                    onClick={() => handleSave(item)}
                    loading={savingKey === item.service_key}
                  >
                    {savingKey === item.service_key ? "Saving..." : "Save"}
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
