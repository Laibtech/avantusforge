import React from "react";
import { FolderOpen } from "lucide-react";
import AdminButton from "./AdminButton";

export interface AdminEmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function AdminEmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = "",
  children,
}: AdminEmptyStateProps) {
  return (
    <div
      className={`py-14 sm:py-20 px-6 text-center flex flex-col items-center justify-center space-y-3.5 max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FBF4F6] border border-[#EADFE3] flex items-center justify-center text-[#74102E] shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#24151B] tracking-tight">{title}</h3>
        <p className="text-xs text-[#777078] leading-relaxed">{description}</p>
      </div>

      {(actionLabel && (onAction || actionHref)) && (
        <div className="pt-2">
          <AdminButton
            variant="primary"
            onClick={onAction}
            href={actionHref}
          >
            {actionLabel}
          </AdminButton>
        </div>
      )}

      {children}
    </div>
  );
}

