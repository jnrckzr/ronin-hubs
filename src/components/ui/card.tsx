import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired Card Components
 *
 * Reads from CSS variables defined in the global palette (calendar.tsx or global.css).
 * If used standalone, ensure these variables are present:
 *
 * Light: --cal-bg-card:#FFFFFF, --cal-bg-elevated:#F4F6FB,
 *        --cal-text:#1C2230, --cal-text-muted:#6C7380,
 *        --cal-border:#D9DEE8, --cal-accent:#6E8EF7
 *
 * Dark:  --cal-bg-card:#1D2330, --cal-bg-elevated:#252C3D,
 *        --cal-text:#F4F1EA, --cal-text-muted:#A2AAB8,
 *        --cal-border:#2C3445, --cal-accent:#7DA2FF
 */

/* ─── Card ─── */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-[14px] overflow-hidden", className)}
      style={{
        background: "var(--cal-bg-card)",
        border: "1px solid var(--cal-border)",
        color: "var(--cal-text)",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.06), 0 4px 20px -4px rgba(0,0,0,0.10)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        ...style,
      }}
      {...props}
    />
  ),
);
Card.displayName = "Card";

/* ─── CardHeader ─── */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col", className)}
      style={{ padding: "1.25rem 1.375rem 0.75rem", gap: "0.3rem", ...style }}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

/* ─── CardTitle ─── */
const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("leading-tight tracking-tight", className)}
      style={{
        fontSize: "0.9375rem",
        fontWeight: 600,
        color: "var(--cal-text)",
        ...style,
      }}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

/* ─── CardDescription ─── */
const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        fontSize: "0.8rem",
        color: "var(--cal-text-muted)",
        lineHeight: 1.55,
        ...style,
      }}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

/* ─── CardContent ─── */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      style={{ padding: "0.75rem 1.375rem 1.25rem", ...style }}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

/* ─── CardFooter ─── */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      style={{
        padding: "0 1.375rem 1.25rem",
        borderTop: "1px solid var(--cal-border)",
        paddingTop: "0.875rem",
        gap: "0.5rem",
        ...style,
      }}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };