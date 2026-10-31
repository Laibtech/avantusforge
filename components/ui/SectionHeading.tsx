import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  accentTitle?: string;
  description?: string | React.ReactNode;
  align?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
  goldAccent?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  accentTitle,
  description,
  align = "left",
  theme = "light",
  className,
  goldAccent = true,
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "flex flex-col mb-12 sm:mb-16",
        isCenter ? "items-center text-center mx-auto max-w-3xl" : "items-start max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "inline-flex items-center gap-2.5 mb-3.5",
            isCenter && "justify-center"
          )}
        >
          {goldAccent && (
            <span className="w-6 h-[2px] bg-[#C99A3D] rounded-full inline-block" />
          )}
          <span
            className={cn(
              "text-xs font-semibold tracking-[0.2em] uppercase",
              isDark ? "text-[#E1C27A]" : "text-[#750F2C]"
            )}
          >
            {eyebrow}
          </span>
        </div>
      )}

      <h2
        className={cn(
          "text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold tracking-tight leading-[1.2] mb-4 text-balance",
          isDark ? "text-white" : "text-[#191416]"
        )}
      >
        {title}
        {accentTitle && (
          <span
            className={cn(
              "font-serif font-normal italic block sm:inline sm:ml-2.5",
              isDark ? "text-[#E1C27A]" : "text-[#750F2C]"
            )}
            style={{ fontFamily: "var(--font-lora)" }}
          >
            {accentTitle}
          </span>
        )}
      </h2>

      {description && (
        <p
          className={cn(
            "text-base sm:text-lg leading-relaxed text-balance",
            isDark ? "text-[#E8DDE0]/85" : "text-[#6F6568]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
