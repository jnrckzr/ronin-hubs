import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Anime-Inspired Hover Card
// Dark:  bg #1D2330 · border #2C3445 · accent strip #7DA2FF→#9A84FF
// Light: bg #FFFFFF · border #D9DEE8 · accent strip #6E8EF7→#8878FF
// ─────────────────────────────────────────────────────────────────────────────

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

// ─── Content ─────────────────────────────────────────────────────────────────

const HoverCardContent = React.forwardRef
  <React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & {
    /** Show the top accent gradient strip (default: true) */
    showStrip?: boolean;
  }
>(({ className, align = "center", sideOffset = 8, showStrip = true, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-72 overflow-hidden",
      "rounded-xl",
      "bg-[#FFFFFF] dark:bg-[#1D2330]",
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      "shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.50)]",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      "outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "origin-(--radix-hover-card-content-transform-origin)",
      className,
    )}
    {...props}
  >
    {/* Accent gradient strip */}
    {showStrip && (
      <div className="h-0.5 w-full bg-linear-to-r from-[#6E8EF7] to-secondary-accent dark:from-[#7DA2FF] dark:to-[#9A84FF]" />
    )}

    {/* Inner padding wrapper */}
    <div className="p-4">
      {props.children}
    </div>
  </HoverCardPrimitive.Content>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

// ─── Convenience sub-components ───────────────────────────────────────────────

/** Avatar / image area at the top of a hover card */
const HoverCardAvatar = ({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "mb-3 flex h-10 w-10 items-center justify-center rounded-full overflow-hidden",
      "bg-[#F4F6FB] dark:bg-[#252C3D]",
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      "text-sm font-semibold",
      "text-[#6E8EF7] dark:text-[#7DA2FF]",
      className,
    )}
  >
    {src ? (
      <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
    ) : (
      <span>{fallback}</span>
    )}
  </div>
);

/** Title line inside a hover card */
const HoverCardTitle = ({
  children,
  className,
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <p
    className={cn(
      "text-sm font-semibold leading-none",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      className,
    )}
  >
    {children}
  </p>
);

/** Subtitle / handle line */
const HoverCardSubtitle = ({
  children,
  className,
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "text-xs",
      "text-[#6E8EF7] dark:text-[#7DA2FF]",
      className,
    )}
  >
    {children}
  </p>
);

/** Body description text */
const HoverCardDescription = ({
  children,
  className,
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "mt-2 text-xs leading-relaxed",
      "text-muted-foreground dark:text-[#A2AAB8]",
      className,
    )}
  >
    {children}
  </p>
);

/** Stat row — e.g. "Following · 128" */
const HoverCardStats = ({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-3 flex items-center gap-4 border-t pt-3",
      "border-[#D9DEE8] dark:border-[#2C3445]",
      className,
    )}
  >
    {children}
  </div>
);

const HoverCardStat = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-start gap-0.5", className)}>
    <span className="text-xs font-semibold text-[#1C2230] dark:text-[#F4F1EA]">
      {value}
    </span>
    <span className="text-xs text-[#9AA1AE] dark:text-[#6F7785]">{label}</span>
  </div>
);

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardAvatar,
  HoverCardTitle,
  HoverCardSubtitle,
  HoverCardDescription,
  HoverCardStats,
  HoverCardStat,
};