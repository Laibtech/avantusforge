"use client";

import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type ButtonBaseProps = {
  variant?: "primary" | "gold" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const sizeStyles = {
    sm: "text-xs tracking-wide px-4 py-2 gap-1.5",
    md: "text-sm tracking-wide px-6 py-3 gap-2",
    lg: "text-base tracking-wide px-7 py-3.5 gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#750F2C] text-white hover:bg-[#52091E] shadow-sm hover:shadow border border-[#750F2C] focus-visible:outline-[#750F2C]",
    gold:
      "bg-[#C99A3D] text-[#3D0717] hover:bg-[#E1C27A] shadow-sm hover:shadow border border-[#C99A3D] font-semibold focus-visible:outline-[#C99A3D]",
    secondary:
      "bg-white text-[#750F2C] border border-[#E8DDE0] hover:border-[#750F2C] hover:bg-[#F7EEF1] shadow-xs focus-visible:outline-[#750F2C]",
    outline:
      "bg-transparent text-[#750F2C] border border-[#750F2C] hover:bg-[#F7EEF1] focus-visible:outline-[#750F2C]",
    ghost:
      "bg-transparent text-[#191416] hover:bg-[#F7EEF1] hover:text-[#750F2C] focus-visible:outline-[#750F2C]",
  };

  const combinedClasses = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={cn("group", combinedClasses)} {...linkProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cn("group", combinedClasses)} {...buttonProps}>
      {content}
    </button>
  );
}
