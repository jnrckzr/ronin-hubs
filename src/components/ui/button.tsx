"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired Button
 * Uses the same CSS variables injected by <Calendar /> or you can add them globally.
 *
 * If you use these buttons outside of a page that renders <Calendar />, paste the
 * :root / dark-mode blocks from calendar.tsx into your global CSS file instead.
 */

const buttonVariants = cva(
  [
    // Base
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium cursor-pointer select-none",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
    "focus-visible:ring-[var(--cal-accent)] focus-visible:ring-offset-[var(--cal-bg-card)]",
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "relative overflow-hidden",
  ].join(" "),
  {
    variants: {
      variant: {
        /**
         * Primary — gradient Cinematic Blue → Soft Lavender
         * Glowing on hover, subtle press scale.
         */
        default: [
          "bg-gradient-to-br from-[var(--cal-accent)] to-[var(--cal-accent-2)]",
          "text-white",
          "shadow-[0_2px_12px_var(--cal-glow)]",
          "hover:shadow-[0_4px_20px_var(--cal-glow-strong)] hover:brightness-110 hover:-translate-y-px",
          "active:scale-[0.97] active:brightness-95",
          "border border-white/10",
        ].join(" "),

        /**
         * Destructive — Dusty Rose / Muted Rose
         */
        destructive: [
          "bg-[var(--cal-error)] text-white",
          "shadow-[0_2px_10px_rgba(214,124,124,0.25)]",
          "hover:brightness-110 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(214,124,124,0.38)]",
          "active:scale-[0.97]",
          "border border-white/10",
        ].join(" "),

        /**
         * Outline — bordered, transparent fill, accent on hover
         */
        outline: [
          "border border-[var(--cal-border)] bg-transparent",
          "text-[var(--cal-text)]",
          "hover:bg-[var(--cal-bg-elevated)] hover:border-[var(--cal-accent)] hover:text-[var(--cal-accent)]",
          "hover:shadow-[0_0_0_3px_var(--cal-glow)]",
          "active:scale-[0.97]",
        ].join(" "),

        /**
         * Secondary — elevated surface, muted look
         */
        secondary: [
          "bg-[var(--cal-bg-elevated)] text-[var(--cal-text-muted)]",
          "border border-[var(--cal-border)]",
          "hover:bg-[var(--cal-border)] hover:text-[var(--cal-text)]",
          "active:scale-[0.97]",
        ].join(" "),

        /**
         * Ghost — no border/bg, accent on hover
         */
        ghost: [
          "bg-transparent text-[var(--cal-text-muted)]",
          "hover:bg-[var(--cal-bg-elevated)] hover:text-[var(--cal-accent)]",
          "active:scale-[0.97]",
        ].join(" "),

        /**
         * Link — text-only with underline
         */
        link: [
          "bg-transparent text-[var(--cal-accent)]",
          "underline-offset-4 hover:underline hover:text-[var(--cal-hover)]",
          "active:opacity-70",
        ].join(" "),
      },

      size: {
        default: "h-9 px-4 py-2 text-sm rounded-[var(--cal-radius)] [&_svg]:size-4",
        sm:      "h-8 px-3 py-1.5 text-xs rounded-[calc(var(--cal-radius)*0.85)] [&_svg]:size-3.5",
        lg:      "h-11 px-6 py-2.5 text-base rounded-[calc(var(--cal-radius)*1.2)] [&_svg]:size-5",
        icon:    "h-9 w-9 rounded-[var(--cal-radius)] [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };