import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Palette tokens (injected once) ─────────────────────────────────────────
const paletteStyle = `
  :root {
    --bg-card:          #FFFFFF;
    --bg-elevated:      #F4F6FB;
    --text-primary:     #0A0F1A;
    --text-secondary:   #3D4455;
    --accent-primary:   #6E8EF7;
    --accent-secondary: #8878FF;
    --color-success:    #6E9F7A;
    --color-warning:    #C9995D;
    --color-error:      #C76B6B;
    --border:           #D9DEE8;
    --border-success:   #A8CEB4;
    --border-warning:   #DDB97A;
    --border-error:     #DDA0A0;
    --border-info:      #B0C4F8;
  }
  .dark {
    --bg-card:          #1D2330;
    --bg-elevated:      #252C3D;
    --text-primary:     #F4F1EA;
    --text-secondary:   #A2AAB8;
    --accent-primary:   #7DA2FF;
    --accent-secondary: #9A84FF;
    --color-success:    #89B89A;
    --color-warning:    #D6A86A;
    --color-error:      #D67C7C;
    --border:           #2C3445;
    --border-success:   #3D6B4A;
    --border-warning:   #6B4E20;
    --border-error:     #6B3030;
    --border-info:      #2C3D6B;
  }

  /* ── Base alert ── */
  .cai-alert {
    position: relative;
    width: 100%;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--bg-card);
    padding: 1rem 1.1rem 1rem 3.25rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    overflow: hidden;
    transition: box-shadow 160ms ease;
  }

  /* left accent bar */
  .cai-alert::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 14px 0 0 14px;
    background: var(--border);
  }

  /* icon slot */
  .cai-alert > svg,
  .cai-alert > [data-icon] {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  /* ── Variants ── */

  /* default / info */
  .cai-alert-default {
    background: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-card));
    border-color: var(--border-info);
  }
  .cai-alert-default::before { background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary)); }
  .cai-alert-default > svg,
  .cai-alert-default > [data-icon] { color: var(--accent-primary); }

  /* destructive / error */
  .cai-alert-destructive {
    background: color-mix(in srgb, var(--color-error) 8%, var(--bg-card));
    border-color: var(--border-error);
  }
  .cai-alert-destructive::before { background: var(--color-error); }
  .cai-alert-destructive > svg,
  .cai-alert-destructive > [data-icon] { color: var(--color-error); }

  /* success */
  .cai-alert-success {
    background: color-mix(in srgb, var(--color-success) 8%, var(--bg-card));
    border-color: var(--border-success);
  }
  .cai-alert-success::before { background: var(--color-success); }
  .cai-alert-success > svg,
  .cai-alert-success > [data-icon] { color: var(--color-success); }

  /* warning */
  .cai-alert-warning {
    background: color-mix(in srgb, var(--color-warning) 8%, var(--bg-card));
    border-color: var(--border-warning);
  }
  .cai-alert-warning::before { background: var(--color-warning); }
  .cai-alert-warning > svg,
  .cai-alert-warning > [data-icon] { color: var(--color-warning); }

  /* ── Title ── */
  .cai-alert-title {
    font-size: .9rem;
    font-weight: 700;
    letter-spacing: -.02em;
    line-height: 1.3;
    color: var(--text-primary);
    margin: 0 0 .3rem;
  }

  /* ── Description ── */
  .cai-alert-description {
    font-size: .835rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
  }
  .cai-alert-description p { line-height: 1.6; }
`;

// ─── CVA variants ────────────────────────────────────────────────────────────
const alertVariants = cva("cai-alert", {
  variants: {
    variant: {
      default:     "cai-alert-default",
      destructive: "cai-alert-destructive",
      success:     "cai-alert-success",
      warning:     "cai-alert-warning",
    },
  },
  defaultVariants: { variant: "default" },
});

// ─── Components ──────────────────────────────────────────────────────────────

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => (
  <>
    <style dangerouslySetInnerHTML={{ __html: paletteStyle }} />
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  </>
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("cai-alert-title", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("cai-alert-description", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };