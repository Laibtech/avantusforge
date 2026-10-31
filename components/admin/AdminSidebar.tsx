"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Radio,
  FileText,
  Briefcase,
  Layers,
  FolderGit2,
  BookOpen,
  Image as ImageIcon,
  ShieldAlert,
  Search,
  ArrowRightLeft,
  Settings,
  Shield,
  Building,
  DollarSign,
  History,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavGroup {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: "Overview & Telemetry",
      items: [
        { href: "/admin", label: "Executive Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Visitor Analytics", icon: BarChart3 },
        { href: "/admin/visitors", label: "Live Active Visitors", icon: Radio, badge: "LIVE" },
      ],
    },
    {
      label: "Website Content Management",
      items: [
        { href: "/admin/pages", label: "Page Builder & Sections", icon: FileText },
        { href: "/admin/navigation", label: "Navigation & Footer", icon: Layers },
        { href: "/admin/pages/home", label: "Homepage Controls", icon: Sparkles },
        { href: "/admin/services", label: "Services CMS", icon: Briefcase },
        { href: "/admin/solutions", label: "Solutions CMS", icon: Layers },
        { href: "/admin/portfolio", label: "Portfolio Projects", icon: FolderGit2 },
        { href: "/admin/blogs", label: "Articles & Insights", icon: BookOpen },
        { href: "/admin/testimonials", label: "Testimonials & FAQs", icon: MessageSquare },
        { href: "/admin/team", label: "Team Management", icon: Shield },
        { href: "/admin/media", label: "Media Library", icon: ImageIcon },
      ],
    },
    {
      label: "Business Operations & CRM",
      items: [
        { href: "/admin/leads", label: "Inquiries & CRM", icon: Users },
        { href: "/admin/clients", label: "Client Directory", icon: Building },
        { href: "/admin/projects", label: "Client Projects", icon: FolderGit2 },
        { href: "/admin/finance", label: "Finance & Invoicing", icon: DollarSign },
        { href: "/admin/hrms", label: "HRMS & Payroll", icon: Users },
      ],
    },
    {
      label: "SEO & Defensive Security",
      items: [
        { href: "/admin/seo", label: "SEO & Search Engine", icon: Search },
        { href: "/admin/redirects", label: "301/302 Redirects", icon: ArrowRightLeft },
        { href: "/admin/security", label: "Security & Threat Center", icon: ShieldAlert, badge: "100%" },
      ],
    },
    {
      label: "System Administration",
      items: [
        { href: "/admin/users", label: "Users & Roles", icon: ShieldCheck },
        { href: "/admin/integrations", label: "System Integrations", icon: Layers },
        { href: "/admin/activity-logs", label: "Admin Activity Logs", icon: History },
        { href: "/admin/settings", label: "System Settings", icon: Settings },
      ],
    },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-72 bg-white border-r border-[#EADFE3] p-5 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EADFE3]">
            <div>
              <Link href="/admin" className="block" onClick={onClose}>
                <Image
                  src="/logo.png"
                  alt="AvantusForge"
                  width={150}
                  height={36}
                  className="h-6 w-auto object-contain !rounded-none"
                  style={{ borderRadius: 0 }}
                />
              </Link>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159B70] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#74102E] font-bold">
                  Enterprise SaaS Console
                </span>
              </div>
            </div>

            <span className="text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#FBF4F6] text-[#74102E] font-bold border border-[#EADFE3]">
              v3.0
            </span>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="text-[9.5px] font-mono uppercase tracking-[0.16em] font-bold text-[#777078] px-2.5 block mb-1.5">
                  {group.label}
                </span>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || (item.href !== "/admin/pages" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-[#FBF4F6] text-[#74102E] font-bold border border-[#EADFE3] shadow-2xs"
                          : "text-[#24151B]/80 hover:bg-[#FAF7F7] hover:text-[#74102E]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? "text-[#74102E]" : "text-[#777078]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            item.badge === "LIVE"
                              ? "bg-emerald-50 text-[#159B70] border border-emerald-200 animate-pulse"
                              : "bg-[#74102E] text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-5 border-t border-[#EADFE3] space-y-3">
          <div className="p-3 bg-[#FAF7F7] rounded-xl border border-[#EADFE3] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono uppercase font-bold text-[#777078]">
                Logged In Role
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#159B70]" />
            </div>
            <div className="font-bold text-[#24151B] truncate">Super Administrator</div>
            <div className="text-[10px] text-[#74102E] font-mono font-medium">Full Enterprise Access</div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#C43D4D] text-xs font-bold border border-rose-200/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
