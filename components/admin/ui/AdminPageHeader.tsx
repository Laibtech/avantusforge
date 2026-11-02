import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  badge?: string;
  badgeColor?: "burgundy" | "success" | "warning" | "neutral";
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode; // Actions slot (buttons, search, export)
}

export default function AdminPageHeader({
  title,
  description,
  eyebrow,
  badge,
  badgeColor = "burgundy",
  breadcrumbs,
  backHref,
  backLabel = "Back",
  actions,
  children,
}: AdminPageHeaderProps) {
  const badgeClasses = {
    burgundy: "bg-[#FBF4F6] text-[#74102E] border-[#EADFE3]",
    success: "bg-emerald-50 text-[#159B70] border-emerald-200",
    warning: "bg-amber-50 text-[#D69A32] border-amber-200",
    neutral: "bg-[#FAF7F7] text-[#777078] border-[#EADFE3]",
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Top Breadcrumb Bar / Back link */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#74102E] hover:text-[#4A0B20] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{backLabel}</span>
          </Link>
        ) : breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[#777078]">
            <Link href="/admin" className="hover:text-[#24151B] transition-colors">
              Console
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-[#AFA7AB] shrink-0" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#24151B] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#24151B]">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : null}

        <div className="text-[11px] font-mono text-[#777078] hidden sm:block">
          AvantusForge Enterprise Suite
        </div>
      </div>

      {/* Main Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-2xl">
          {eyebrow && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#74102E]">
                {eyebrow}
              </span>
              {badge && (
                <span
                  className={`text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${badgeClasses[badgeColor]}`}
                >
                  {badge}
                </span>
              )}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24151B] tracking-tight leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-xs sm:text-sm text-[#777078] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {(actions || children) && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            {actions}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

