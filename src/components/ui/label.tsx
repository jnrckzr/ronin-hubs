"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired Label
 *
 * Uses the same --ca-* CSS variables as input.tsx.
 * See input.tsx for the full globals.css snippet.
 */

const labelVariants = cva(
  [
    // Base
    "text-sm font-medium leading-none tracking-[0.01em]",
    // Color
    "text-[var(--ca-text)]",
    // Transition for smooth peer interactions
    "transition-colors duration-150",
    // Disabled peer
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-45 peer-disabled:text-[var(--ca-disabled-text)]",
  ].join(" "),
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };