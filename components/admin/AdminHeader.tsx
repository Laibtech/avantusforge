"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpRight,
  ShieldCheck,
  Bell,
  LogOut,
  Database,
  Menu,
  X,
  FileText,
  Briefcase,
  Users,
  Layers,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function AdminHeader({ onToggleSidebar, isSidebarOpen }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [backupTriggered, setBackupTriggered] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const quickJumpItems = [
    { title: "Dashboard Overview", href: "/admin", category: "Telemetry" },
    { title: "Real-Time Visitor Analytics", href: "/admin/analytics", category: "Telemetry" },
    { title: "Live Active Visitors", href: "/admin/visitors", category: "Telemetry" },
    { title: "Website Pages & Sections", href: "/admin/pages", category: "CMS" },
    { title: "Homepage Controls", href: "/admin/pages/home", category: "CMS" },
    { title: "Services Catalog", href: "/admin/services", category: "CMS" },
    { title: "Industry Solutions", href: "/admin/solutions", category: "CMS" },
    { title: "Portfolio Projects", href: "/admin/portfolio", category: "CMS" },
    { title: "Articles & Insights", href: "/admin/blogs", category: "CMS" },
    { title: "Testimonials & FAQs", href: "/admin/testimonials", category: "CMS" },
    { title: "Team Management", href: "/admin/team", category: "CMS" },
    { title: "Media Asset Library", href: "/admin/media", category: "CMS" },
    { title: "CRM Inquiries & Leads", href: "/admin/leads", category: "Operations" },
    { title: "Client Directory", href: "/admin/clients", category: "Operations" },
    { title: "Client Projects", href: "/admin/projects", category: "Operations" },
    { title: "Finance & Invoicing", href: "/admin/finance", category: "Operations" },
    { title: "HRMS Staff & Payroll", href: "/admin/hrms", category: "Operations" },
    { title: "Search Engine & SEO", href: "/admin/seo", category: "Security" },
    { title: "URL Redirects (301/302)", href: "/admin/redirects", category: "Security" },
    { title: "Security Operations Center", href: "/admin/security", category: "Security" },
    { title: "Users & Access Roles", href: "/admin/users", category: "System" },
    { title: "System Integrations", href: "/admin/integrations", category: "System" },
    { title: "Audit & Activity Logs", href: "/admin/activity-logs", category: "System" },
    { title: "System Settings", href: "/admin/settings", category: "System" },
  ];

  const filteredJumpItems = searchQuery.trim()
    ? quickJumpItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
    router.refresh();
  };

  const handleQuickBackup = async () => {
    setBackupTriggered(true);
    try {
      await fetch("/api/admin/security/backup", { method: "POST" });
      setTimeout(() => setBackupTriggered(false), 2500);
    } catch {
      setBackupTriggered(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EADFE3] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7] border border-[#EADFE3] cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-[#777078] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search CMS modules, services, clients, settings..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-xs text-[#24151B] placeholder:text-[#777078] focus:bg-white focus:outline-none focus:border-[#74102E] transition-all"
          />

          {/* Quick Jump Results Dropdown */}
          {showSearchResults && filteredJumpItems.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-[#EADFE3] shadow-xl overflow-hidden py-1 divide-y divide-[#EADFE3]/60 max-h-80 overflow-y-auto">
                {filteredJumpItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-[#FAF7F7] text-[#24151B] transition-colors"
                  >
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FBF4F6] text-[#74102E] border border-[#EADFE3]">
                      {item.category}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Quick Action Buttons, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick DB Snapshot Trigger */}
        <button
          type="button"
          onClick={handleQuickBackup}
          disabled={backupTriggered}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] text-xs font-bold text-[#24151B] hover:bg-white hover:border-[#74102E]/40 transition-colors cursor-pointer disabled:opacity-60"
          title="Create Instant Encrypted Database Snapshot"
        >
          {backupTriggered ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#159B70] animate-pulse" />
          ) : (
            <Database className="w-3.5 h-3.5 text-[#74102E]" />
          )}
          <span>{backupTriggered ? "Snapshot Saved" : "DB Snapshot"}</span>
        </button>

        {/* View Live Website Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EADFE3] text-xs font-bold text-[#24151B] hover:text-[#74102E] hover:border-[#74102E]/40 transition-colors shadow-2xs"
        >
          <span>Live Site</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#777078]" />
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-[#777078] hover:text-[#24151B] hover:bg-[#FAF7F7] transition-colors relative cursor-pointer"
            aria-label="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#159B70] animate-pulse" />
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-white rounded-2xl border border-[#EADFE3] shadow-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EADFE3]">
                  <span className="text-xs font-bold text-[#24151B] uppercase tracking-wide">
                    System Telemetry &amp; Alerts
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#159B70] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ONLINE
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#24151B]">Real-Time Protection</span>
                      <span className="text-[9.5px] font-mono text-[#159B70] font-bold">ACTIVE</span>
                    </div>
                    <p className="text-[11px] text-[#777078] leading-relaxed">
                      Rate-limiting, security headers, and API edge protection operational.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#EADFE3] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#24151B]">Disaster Recovery</span>
                      <span className="text-[9.5px] font-mono text-[#159B70] font-bold">READY</span>
                    </div>
                    <p className="text-[11px] text-[#777078] leading-relaxed">
                      Dual-persistence JSON &amp; MySQL snapshot verification active.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full border border-[#EADFE3] hover:border-[#74102E] transition-colors cursor-pointer bg-white"
          >
            <div className="w-8 h-8 rounded-full bg-[#74102E] text-white flex items-center justify-center text-xs font-bold">
              AF
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-white rounded-2xl border border-[#EADFE3] shadow-xl p-3 space-y-2">
                <div className="p-2.5 bg-[#FAF7F7] rounded-xl border border-[#EADFE3] space-y-0.5">
                  <div className="text-xs font-bold text-[#24151B]">Super Administrator</div>
                  <div className="text-[10px] text-[#74102E] font-mono font-bold">Role: Full Enterprise Control</div>
                  <div className="text-[10.5px] text-[#777078]">admin@avantusforge.com</div>
                </div>

                <div className="divide-y divide-[#EADFE3]/60 pt-1 text-xs">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#24151B] hover:text-[#74102E] hover:bg-[#FAF7F7] rounded-xl transition-colors font-semibold"
                  >
                    <span>System Settings</span>
                  </Link>

                  <Link
                    href="/admin/security"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#24151B] hover:text-[#74102E] hover:bg-[#FAF7F7] rounded-xl transition-colors font-semibold"
                  >
                    <span>Security Center</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#C43D4D] hover:bg-rose-50 rounded-xl transition-colors font-bold cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
