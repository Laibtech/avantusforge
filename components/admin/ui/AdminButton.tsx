import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export interface AdminButtonProps {
  variant?: "primary" | "secondary" | "gold" | "outline" | "danger" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  href?: string;
  target?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ElementType | React.ReactNode;
  iconRight?: React.ElementType | React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

export default function AdminButton({
  variant = "primary",
  size = "sm",
  href,
  target,
  disabled = false,
  loading = false,
  icon,
  iconRight,
  onClick,
  type = "button",
  className = "",
  title,
  children,
}: AdminButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-bold tracking-wide rounded-xl transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const sizeClasses = {
    xs: "px-2.5 py-1 text-[11px] gap-1.5",
    sm: "px-3.5 py-2 text-xs gap-2",
    md: "px-4.5 py-2.5 text-xs sm:text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-[#74102E] hover:bg-[#4A0B20] text-white shadow-2xs hover:shadow-xs border border-[#74102E]",
    secondary:
      "bg-[#FAF7F7] hover:bg-[#F2ECEF] text-[#24151B] border border-[#EADFE3]",
    gold:
      "bg-[#D6A45B] hover:bg-[#C4924A] text-[#4A0B20] shadow-2xs font-extrabold border border-[#D6A45B]",
    outline:
      "bg-white hover:bg-[#FBF4F6] text-[#74102E] border border-[#EADFE3] hover:border-[#74102E]/40",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-[#C43D4D] border border-rose-200",
    ghost:
      "bg-transparent hover:bg-[#FAF7F7] text-[#777078] hover:text-[#24151B]",
  };

  const renderIcon = (iconItem: any, defaultClass: string) => {
    if (!iconItem) return null;
    if (React.isValidElement(iconItem)) {
      return iconItem;
    }
    const IconComponent = iconItem;
    return <IconComponent className={defaultClass} />;
  };

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        renderIcon(icon, "w-3.5 h-3.5 shrink-0")
      )}
      {children && <span>{children}</span>}
      {!loading && renderIcon(iconRight, "w-3.5 h-3.5 shrink-0")}
    </>
  );

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} target={target} className={combinedClasses} title={title}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      title={title}
    >
      {content}
    </button>
  );
}
