import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface AdminAlertProps {
  type?: "success" | "warning" | "error" | "info";
  variant?: "success" | "warning" | "error" | "info";
  title?: string;
  message?: React.ReactNode;
  onDismiss?: () => void;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function AdminAlert({
  type,
  variant,
  title,
  message,
  onDismiss,
  onClose,
  className = "",
  children,
}: AdminAlertProps) {
  const alertType = variant || type || "info";
  const handleDismiss = onClose || onDismiss;
  const configs = {
    success: {
      bg: "bg-emerald-50/90 border-emerald-200 text-emerald-900",
      icon: CheckCircle2,
      iconColor: "text-[#159B70]",
    },
    warning: {
      bg: "bg-amber-50/90 border-amber-200 text-amber-900",
      icon: AlertTriangle,
      iconColor: "text-[#D69A32]",
    },
    error: {
      bg: "bg-rose-50/90 border-rose-200 text-rose-900",
      icon: AlertCircle,
      iconColor: "text-[#C43D4D]",
    },
    info: {
      bg: "bg-[#FBF4F6] border-[#EADFE3] text-[#24151B]",
      icon: Info,
      iconColor: "text-[#74102E]",
    },
  };

  const config = configs[alertType];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`p-3.5 sm:p-4 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed transition-all shadow-2xs ${config.bg} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="space-y-0.5">
          {title && <div className="font-bold">{title}</div>}
          {message && <div>{message}</div>}
          {children}
        </div>
      </div>

      {handleDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[#777078] hover:text-[#24151B] p-1 rounded-md transition-colors"
          aria-label="Dismiss Alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

