import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Palette tokens ───────────────────────────────────────────────────────────
const paletteStyle = `
  :root {
    --bc-text-primary:   #0A0F1A;
    --bc-text-muted:     #6C7380;
    --bc-text-disabled:  #9AA1AE;
    --bc-accent:         #6E8EF7;
    --bc-accent-hover:   #5C74D8;
    --bc-border:         #D9DEE8;
    --bc-bg-elevated:    #F4F6FB;
  }
  .dark {
    --bc-text-primary:   #F4F1EA;
    --bc-text-muted:     #A2AAB8;
    --bc-text-disabled:  #6F7785;
    --bc-accent:         #7DA2FF;
    --bc-accent-hover:   #5E7CE2;
    --bc-border:         #2C3445;
    --bc-bg-elevated:    #252C3D;
  }

  /* ── List ── */
  .cai-bc-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: .835rem;
    line-height: 1;
    list-style: none;
    padding: 0;
    margin: 0;
    color: var(--bc-text-muted);
  }

  /* ── Item ── */
  .cai-bc-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  /* ── Link ── */
  .cai-bc-link {
    color: var(--bc-text-muted);
    text-decoration: none;
    font-weight: 500;
    border-radius: 5px;
    padding: .15rem .3rem;
    margin: 0 -.3rem;
    transition: color 140ms ease, background 140ms ease;
    outline: none;
  }
  .cai-bc-link:hover {
    color: var(--bc-accent);
    background: color-mix(in srgb, var(--bc-accent) 10%, transparent);
  }
  .cai-bc-link:focus-visible {
    color: var(--bc-accent);
    box-shadow: 0 0 0 2px var(--bc-accent);
  }

  /* ── Current page ── */
  .cai-bc-page {
    color: var(--bc-text-primary);
    font-weight: 700;
    letter-spacing: -.01em;
  }

  /* ── Separator ── */
  .cai-bc-sep {
    display: inline-flex;
    align-items: center;
    color: var(--bc-text-disabled);
    padding: 0 1px;
  }
  .cai-bc-sep svg {
    width: 13px;
    height: 13px;
    stroke-width: 2.2px;
  }

  /* ── Ellipsis ── */
  .cai-bc-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: 1.5px solid var(--bc-border);
    background: var(--bc-bg-elevated);
    color: var(--bc-text-muted);
    cursor: pointer;
    transition: border-color 140ms, color 140ms, background 140ms;
  }
  .cai-bc-ellipsis:hover {
    border-color: var(--bc-accent);
    color: var(--bc-accent);
    background: color-mix(in srgb, var(--bc-accent) 8%, var(--bc-bg-elevated));
  }
  .cai-bc-ellipsis svg {
    width: 13px;
    height: 13px;
  }
`;

// ─── Components ──────────────────────────────────────────────────────────────

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & { separator?: React.ReactNode }
>(({ ...props }, ref) => (
  <>
    <style dangerouslySetInnerHTML={{ __html: paletteStyle }} />
    <nav ref={ref} aria-label="breadcrumb" {...props} />
  </>
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn("cai-bc-list", className)} {...props} />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("cai-bc-item", className)} {...props} />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp ref={ref} className={cn("cai-bc-link", className)} {...props} />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("cai-bc-page", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("cai-bc-sep", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("cai-bc-ellipsis", className)}
    {...props}
  >
    <MoreHorizontal />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};