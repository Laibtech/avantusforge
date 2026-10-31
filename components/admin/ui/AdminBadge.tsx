import React from "react";

export interface AdminBadgeProps {
  variant?:
    | "published"
    | "draft"
    | "active"
    | "inactive"
    | "success"
    | "warning"
    | "error"
    | "burgundy"
    | "gold"
    | "neutral";
  size?: "xs" | "sm";
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function AdminBadge({
  variant = "neutral",
  size = "sm",
  pulse = false,
  className = "",
  children,
}: AdminBadgeProps) {
  const sizeClasses = {
    xs: "px-2 py-0.5 text-[9.5px]",
    sm: "px-2.5 py-0.5 text-[11px]",
  };

  const variantClasses = {
    published: "bg-emerald-50 text-[#159B70] border-emerald-200/80",
    active: "bg-emerald-50 text-[#159B70] border-emerald-200/80",
    success: "bg-emerald-50 text-[#159B70] border-emerald-200/80",

    draft: "bg-amber-50 text-[#D69A32] border-amber-200/80",
    warning: "bg-amber-50 text-[#D69A32] border-amber-200/80",

    inactive: "bg-rose-50 text-[#C43D4D] border-rose-200/80",
    error: "bg-rose-50 text-[#C43D4D] border-rose-200/80",

    burgundy: "bg-[#FBF4F6] text-[#74102E] border-[#EADFE3]",
    gold: "bg-[#FBF6ED] text-[#D6A45B] border-[#F2E5CC]",
    neutral: "bg-[#FAF7F7] text-[#777078] border-[#EADFE3]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider rounded-md border ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "published" || variant === "active" || variant === "success"
              ? "bg-[#159B70] animate-pulse"
              : variant === "draft" || variant === "warning"
              ? "bg-[#D69A32] animate-pulse"
              : "bg-[#74102E] animate-pulse"
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

