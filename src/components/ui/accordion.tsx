import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Styles ───────────────────────────────────────────────────────────────────

const ACCORDION_STYLES = `
  /* ── Light mode tokens ── */
  .rh-accordion {
    --ac-bg:          #FFFFFF;
    --ac-bg-hover:    #F4F6FB;
    --ac-bg-open:     #F4F6FB;
    --ac-border:      #D9DEE8;
    --ac-border-open: #6E8EF7;
    --ac-text:        #1C2230;
    --ac-text2:       #6C7380;
    --ac-accent:      #6E8EF7;
    --ac-accent2:     #8878FF;
    --ac-accent-tint: rgba(110,142,247,0.08);
    --ac-accent-glow: rgba(110,142,247,0.18);
    --ac-chevron:     #9AA1AE;
    --ac-r: 14px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  /* ── Dark mode tokens ── */
  .dark .rh-accordion {
    --ac-bg:          #1D2330;
    --ac-bg-hover:    #252C3D;
    --ac-bg-open:     #252C3D;
    --ac-border:      #2C3445;
    --ac-border-open: #7DA2FF;
    --ac-text:        #F4F1EA;
    --ac-text2:       #A2AAB8;
    --ac-accent:      #7DA2FF;
    --ac-accent2:     #9A84FF;
    --ac-accent-tint: rgba(125,162,255,0.10);
    --ac-accent-glow: rgba(125,162,255,0.20);
    --ac-chevron:     #6F7785;
  }

  /* ── Item wrapper ── */
  .rh-accordion-item {
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-r);
    background: var(--ac-bg);
    margin-bottom: 8px;
    overflow: hidden;
    transition:
      border-color .22s ease,
      box-shadow .22s ease,
      background .22s ease;
  }
  .rh-accordion-item:last-child { margin-bottom: 0; }

  /* Open state */
  .rh-accordion-item[data-state="open"] {
    border-color: var(--ac-border-open);
    box-shadow: 0 0 0 3px var(--ac-accent-tint), 0 4px 16px var(--ac-accent-glow);
    background: var(--ac-bg-open);
  }

  /* Hover state (when closed) */
  .rh-accordion-item[data-state="closed"]:hover {
    border-color: color-mix(in srgb, var(--ac-border) 60%, var(--ac-accent) 40%);
    background: var(--ac-bg-hover);
  }

  /* ── Trigger ── */
  .rh-accordion-trigger {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'DM Sans', system-ui, sans-serif;
    letter-spacing: -0.01em;
    color: var(--ac-text);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: color .18s ease;
    outline: none;
  }
  .rh-accordion-trigger:hover { color: var(--ac-accent); }
  [data-state="open"] .rh-accordion-trigger { color: var(--ac-accent); }

  /* ── Left accent bar ── */
  .rh-accordion-trigger-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }
  .rh-accordion-bar {
    width: 3px;
    height: 18px;
    border-radius: 99px;
    background: var(--ac-border);
    flex-shrink: 0;
    transition: background .22s ease, transform .22s ease, height .22s ease;
  }
  [data-state="open"] .rh-accordion-bar {
    background: linear-gradient(180deg, var(--ac-accent), var(--ac-accent2));
    height: 22px;
  }
  .rh-accordion-item[data-state="closed"]:hover .rh-accordion-bar {
    background: var(--ac-accent);
  }

  /* Trigger text */
  .rh-accordion-trigger-text {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: inherit;
    line-height: 1.35;
  }

  /* ── Chevron icon ── */
  .rh-accordion-chevron {
    width: 18px; height: 18px;
    flex-shrink: 0;
    color: var(--ac-chevron);
    border-radius: 50%;
    padding: 1px;
    transition:
      transform .3s cubic-bezier(.34,1.56,.64,1),
      color .18s ease,
      background .18s ease;
  }
  [data-state="open"] .rh-accordion-chevron {
    transform: rotate(180deg);
    color: var(--ac-accent);
    background: var(--ac-accent-tint);
  }
  .rh-accordion-trigger:hover .rh-accordion-chevron {
    color: var(--ac-accent);
  }

  /* ── Content area ── */
  .rh-accordion-content-wrap {
    overflow: hidden;
  }
  .rh-accordion-content-wrap[data-state="open"] {
    animation: rh-ac-down .25s cubic-bezier(.4,0,.2,1);
  }
  .rh-accordion-content-wrap[data-state="closed"] {
    animation: rh-ac-up .22s cubic-bezier(.4,0,.2,1);
  }

  @keyframes rh-ac-down {
    from { height: 0; opacity: 0.6; }
    to   { height: var(--radix-accordion-content-height); opacity: 1; }
  }
  @keyframes rh-ac-up {
    from { height: var(--radix-accordion-content-height); opacity: 1; }
    to   { height: 0; opacity: 0.6; }
  }

  /* Content inner */
  .rh-accordion-content {
    padding: 0 18px 18px 18px;
    padding-left: calc(18px + 3px + 12px); /* align with text past the bar */
  }

  /* Divider between trigger and content */
  .rh-accordion-divider {
    height: 1px;
    background: var(--ac-border);
    margin: 0 18px;
    opacity: 0;
    transition: opacity .2s ease;
  }
  [data-state="open"] .rh-accordion-divider { opacity: 1; }

  /* Content text defaults */
  .rh-accordion-content-inner {
    font-size: 13.5px;
    line-height: 1.7;
    color: var(--ac-text2);
    padding-top: 14px;
  }
`;

// ─── Components ───────────────────────────────────────────────────────────────

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <>
    <style>{ACCORDION_STYLES}</style>
    <AccordionPrimitive.Root
      ref={ref}
      className={cn("rh-accordion", className)}
      {...props}
    />
  </>
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("rh-accordion-item", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn("rh-accordion-trigger", className)}
      {...props}
    >
      <span className="rh-accordion-trigger-inner">
        {/* Left accent bar */}
        <span className="rh-accordion-bar" aria-hidden="true" />
        {/* Label */}
        <span className="rh-accordion-trigger-text">{children}</span>
      </span>
      {/* Chevron */}
      <ChevronDown className="rh-accordion-chevron" aria-hidden="true" />
    </AccordionPrimitive.Trigger>
    {/* Hairline divider shown only when open */}
    <span className="rh-accordion-divider" aria-hidden="true" />
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="rh-accordion-content-wrap"
    {...props}
  >
    <div className={cn("rh-accordion-content", className)}>
      <div className="rh-accordion-content-inner">{children}</div>
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };