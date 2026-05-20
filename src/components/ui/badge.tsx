import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Palette tokens ───────────────────────────────────────────────────────────
const paletteStyle = `
  :root {
    --badge-text-primary:   #0A0F1A;
    --badge-text-secondary: #3D4455;
    --badge-accent-1:       #6E8EF7;
    --badge-accent-2:       #8878FF;
    --badge-success:        #6E9F7A;
    --badge-warning:        #C9995D;
    --badge-error:          #C76B6B;
    --badge-border:         #D9DEE8;
    --badge-bg-elevated:    #F4F6FB;
  }
  .dark {
    --badge-text-primary:   #F4F1EA;
    --badge-text-secondary: #A2AAB8;
    --badge-accent-1:       #7DA2FF;
    --badge-accent-2:       #9A84FF;
    --badge-success:        #89B89A;
    --badge-warning:        #D6A86A;
    --badge-error:          #D67C7C;
    --badge-border:         #2C3445;
    --badge-bg-elevated:    #252C3D;
  }

  /* ── Base ── */
  .cai-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 6px;
    border: 1.5px solid transparent;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: .01em;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    transition: opacity 140ms ease, box-shadow 140ms ease;
  }
  .cai-badge:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--badge-accent-1);
  }

  /* ── Sizes ── */
  .cai-badge-sm { font-size: .68rem; padding: .2rem .5rem; }
  .cai-badge-md { font-size: .72rem; padding: .28rem .65rem; }
  .cai-badge-lg { font-size: .8rem;  padding: .35rem .8rem; }

  /* ── Variants ── */

  /* default — accent filled */
  .cai-badge-default {
    background: linear-gradient(135deg, var(--badge-accent-1), var(--badge-accent-2));
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--badge-accent-1) 50%, transparent);
  }

  /* secondary — subtle tinted surface */
  .cai-badge-secondary {
    background: color-mix(in srgb, var(--badge-accent-1) 12%, var(--badge-bg-elevated));
    color: var(--badge-accent-1);
    border-color: color-mix(in srgb, var(--badge-accent-1) 30%, transparent);
  }

  /* outline — ghost */
  .cai-badge-outline {
    background: transparent;
    color: var(--badge-text-secondary);
    border-color: var(--badge-border);
  }

  /* success */
  .cai-badge-success {
    background: color-mix(in srgb, var(--badge-success) 14%, var(--badge-bg-elevated));
    color: var(--badge-success);
    border-color: color-mix(in srgb, var(--badge-success) 35%, transparent);
  }

  /* warning */
  .cai-badge-warning {
    background: color-mix(in srgb, var(--badge-warning) 14%, var(--badge-bg-elevated));
    color: var(--badge-warning);
    border-color: color-mix(in srgb, var(--badge-warning) 35%, transparent);
  }

  /* destructive */
  .cai-badge-destructive {
    background: color-mix(in srgb, var(--badge-error) 14%, var(--badge-bg-elevated));
    color: var(--badge-error);
    border-color: color-mix(in srgb, var(--badge-error) 35%, transparent);
  }

  /* dot indicator */
  .cai-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: currentColor;
  }
`;

// ─── CVA ─────────────────────────────────────────────────────────────────────

type BadgeSize = "sm" | "md" | "lg";

const badgeVariants = cva("cai-badge cai-badge-md", {
  variants: {
    variant: {
      default:     "cai-badge-default",
      secondary:   "cai-badge-secondary",
      outline:     "cai-badge-outline",
      success:     "cai-badge-success",
      warning:     "cai-badge-warning",
      destructive: "cai-badge-destructive",
    },
  },
  defaultVariants: { variant: "default" },
});

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  size?: BadgeSize;
  /** Renders a small colored dot before the label */
  dot?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Badge({ className, variant, size = "md", dot, children, ...props }: BadgeProps) {
  const sizeClass = `cai-badge-${size}`;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: paletteStyle }} />
      <div className={cn(badgeVariants({ variant }), sizeClass, className)} {...props}>
        {dot && <span className="cai-badge-dot" aria-hidden="true" />}
        {children}
      </div>
    </>
  );
}

export { Badge, badgeVariants };