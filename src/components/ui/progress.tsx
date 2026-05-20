"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired Progress
 *
 * Uses the same --ca-* CSS variables. See navigation-menu.tsx for globals.css snippet.
 *
 * Additional vars:
 * :root  { --ca-accent-track: color-mix(in srgb, #6E8EF7 14%, transparent); }
 * .dark  { --ca-accent-track: color-mix(in srgb, #7DA2FF 14%, transparent); }
 *
 * Optional `variant` prop: "default" | "success" | "warning" | "error"
 *
 * :root  { --ca-success:#6E9F7A; --ca-warning:#C9995D; --ca-error:#C76B6B; }
 * .dark  { --ca-success:#89B89A; --ca-warning:#D6A86A; --ca-error:#D67C7C; }
 */

type ProgressVariant = "default" | "success" | "warning" | "error";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Visual variant that changes the indicator colour. */
  variant?: ProgressVariant;
  /** Show an animated shimmer on the indicator. */
  animated?: boolean;
}

const variantIndicator: Record<ProgressVariant, string> = {
  default: "bg-[var(--ca-accent)]",
  success: "bg-[var(--ca-success)]",
  warning: "bg-[var(--ca-warning)]",
  error:   "bg-[var(--ca-error)]",
};

const variantTrack: Record<ProgressVariant, string> = {
  default: "bg-[var(--ca-accent-track)]",
  success: "bg-[color-mix(in_srgb,var(--ca-success)_14%,transparent)]",
  warning: "bg-[color-mix(in_srgb,var(--ca-warning)_14%,transparent)]",
  error:   "bg-[color-mix(in_srgb,var(--ca-error)_14%,transparent)]",
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", animated = false, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // Track
      "relative h-2 w-full overflow-hidden rounded-full",
      variantTrack[variant],
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 rounded-full",
        "transition-transform duration-500 ease-out",
        variantIndicator[variant],
        // Optional shimmer
        animated && "relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_infinite] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]",
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
export type { ProgressVariant };