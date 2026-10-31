import React from "react";

export interface AdminCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export default function AdminCard({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  actions,
  footer,
  padding = "md",
  className = "",
  children,
}: AdminCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4 sm:p-5",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-[#EADFE3] shadow-[0_2px_8px_rgba(36,21,27,0.03)] overflow-hidden transition-all duration-200 ${className}`}
    >
      {(title || eyebrow || actions) && (
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#EADFE3]/70 flex flex-wrap items-center justify-between gap-3 bg-[#FCFAFA]">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {eyebrow && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#74102E] block mb-0.5">
                  {eyebrow}
                </span>
              )}
              {title && (
                <div className="text-sm sm:text-base font-bold text-[#24151B] tracking-tight">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-xs text-[#777078] mt-0.5">{subtitle}</div>
              )}
            </div>
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={paddingClasses[padding]}>{children}</div>

      {footer && (
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#EADFE3]/70 bg-[#FAF7F7] text-xs text-[#777078]">
          {footer}
        </div>
      )}
    </div>
  );
}

