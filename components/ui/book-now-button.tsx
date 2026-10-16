import * as React from "react";
import Link from "next/link";
import { cn } from "cn";

export interface BookNowButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
  ariaLabel?: string;
}

/**
 * Reusable FLATEL "BOOK YOUR STAY" Primary CTA Button
 * 
 * Follows official brand guidelines:
 * - Restrained champagne-gold background (#C6A15B)
 * - Deep black text (#080807)
 * - Minimum 44px touch target
 * - Architectural refined border treatment
 * - Subtle gold/ivory hover transition, zero glowing effects
 */
export function BookNowButton({
  href = "/#rooms",
  onClick,
  className,
  children = "Book Your Stay",
  variant = "primary",
  size = "default",
  fullWidth = false,
  ariaLabel = "Book Your Stay — FLATEL Furnished Residences",
}: BookNowButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans tracking-[0.08em] uppercase transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-primary disabled:pointer-events-none disabled:opacity-50 active:translate-y-[0.5px] min-h-[44px]";

  const sizeStyles = {
    sm: "h-10 px-4 text-[11px] font-bold rounded-xl",
    default: "h-11 px-6 text-[12px] font-bold rounded-xl",
    lg: "h-12 px-8 text-[13px] font-bold rounded-xl",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold border border-[#FFF4C2]/35 shadow-md shadow-[#E5C178]/20 hover:brightness-105 active:scale-[0.98]",
    secondary:
      "bg-[rgba(34,24,16,0.65)] backdrop-blur-md text-[#FAF4EB] border border-[rgba(212,163,89,0.28)] hover:border-[#E5C178] hover:text-[#E5C178] active:bg-[#16100B]",
    outline:
      "border border-[rgba(212,163,89,0.5)] text-[#E5C178] hover:bg-[rgba(212,163,89,0.1)] active:bg-[rgba(212,163,89,0.2)]",
  };

  const classes = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    fullWidth && "w-full",
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
      >
        <span>{children}</span>
      </button>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      <span>{children}</span>
    </Link>
  );
}
