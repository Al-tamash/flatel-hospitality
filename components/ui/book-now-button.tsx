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
    sm: "h-10 px-4 text-xs font-bold rounded-xl",
    default: "h-11 px-6 text-xs font-bold rounded-xl",
    lg: "h-12 px-8 text-sm font-bold rounded-xl",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-gold to-gold-deep text-ink font-bold border border-gold-bright/35 shadow-md shadow-gold/20 hover:brightness-105 active:scale-[0.98]",
    secondary:
      "bg-raised/65 backdrop-blur-md text-fg border border-line hover:border-gold hover:text-gold active:bg-surface",
    outline:
      "border border-line-strong text-gold hover:bg-gold/10 active:bg-gold/20",
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
