import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// ─── Cinematic Anime-Inspired Palette ───────────────────────────────────────
// Injected as a <style> block so the component is self-contained.
// Tokens follow the light / dark split provided by the user.
const paletteStyle = `
  :root {
    /* Light Mode */
    --bg-main:         #F7F4EE;
    --bg-secondary:    #EFE9DD;
    --bg-card:         #FFFFFF;
    --bg-elevated:     #F4F6FB;
    --text-primary:    #1C2230;
    --text-secondary:  #6C7380;
    --text-disabled:   #9AA1AE;
    --accent-primary:  #6E8EF7;
    --accent-secondary:#8878FF;
    --accent-hover:    #5C74D8;
    --color-success:   #6E9F7A;
    --color-warning:   #C9995D;
    --color-error:     #C76B6B;
    --border:          #D9DEE8;

    /* Overlay tint */
    --overlay-bg: rgba(28, 34, 48, 0.55);
  }

  .dark {
    --bg-main:         #0F1117;
    --bg-secondary:    #161A22;
    --bg-card:         #1D2330;
    --bg-elevated:     #252C3D;
    --text-primary:    #F4F1EA;
    --text-secondary:  #A2AAB8;
    --text-disabled:   #6F7785;
    --accent-primary:  #7DA2FF;
    --accent-secondary:#9A84FF;
    --accent-hover:    #5E7CE2;
    --color-success:   #89B89A;
    --color-warning:   #D6A86A;
    --color-error:     #D67C7C;
    --border:          #2C3445;

    --overlay-bg: rgba(9, 11, 17, 0.80);
  }

  /* ── Overlay ── */
  .cai-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--overlay-bg);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .cai-overlay[data-state="open"]  { animation: cai-fade-in  180ms ease forwards; }
  .cai-overlay[data-state="closed"]{ animation: cai-fade-out 160ms ease forwards; }

  /* ── Dialog Content ── */
  .cai-content {
    position: fixed;
    left: 50%; top: 50%;
    z-index: 51;
    transform: translate(-50%, -50%);

    width: min(calc(100vw - 2rem), 480px);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 2rem;

    /* Subtle top-edge glow */
    box-shadow:
      0 0 0 1px var(--border),
      0 8px 40px -8px rgba(0,0,0,.28),
      inset 0 1px 0 rgba(255,255,255,.06);

    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .cai-content[data-state="open"] {
    animation: cai-zoom-in 220ms cubic-bezier(.16,1,.3,1) forwards;
  }
  .cai-content[data-state="closed"] {
    animation: cai-zoom-out 160ms ease forwards;
  }

  /* Decorative top accent stripe */
  .cai-content::before {
    content: '';
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 18px 18px 0 0;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    opacity: .85;
  }

  /* ── Header ── */
  .cai-header {
    display: flex;
    flex-direction: column;
    gap: .375rem;
  }

  /* ── Title ── */
  .cai-title {
    font-family: 'DM Sans', 'Outfit', system-ui, sans-serif;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -.02em;
    line-height: 1.3;
    color: var(--text-primary);
  }

  /* ── Description ── */
  .cai-description {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: .875rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* ── Footer ── */
  .cai-footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: .625rem;
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .cai-footer { flex-direction: column-reverse; }
  }

  /* ── Base button reset ── */
  .cai-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .375rem;
    padding: .5rem 1.25rem;
    border-radius: 10px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: .875rem;
    font-weight: 600;
    letter-spacing: -.01em;
    cursor: pointer;
    transition:
      background 160ms ease,
      box-shadow 160ms ease,
      transform 100ms ease,
      opacity 160ms ease;
    border: none;
    outline: none;
    user-select: none;
  }
  .cai-btn:focus-visible {
    box-shadow: 0 0 0 3px var(--accent-primary);
  }
  .cai-btn:active { transform: scale(.97); }

  /* Action — filled accent */
  .cai-btn-action {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: #0F1117;
    box-shadow: 0 2px 12px -2px rgba(110,142,247,.45);
  }
  .cai-btn-action:hover {
    background: linear-gradient(135deg, var(--accent-hover), var(--accent-primary));
    box-shadow: 0 4px 18px -2px rgba(110,142,247,.6);
  }

  /* Cancel — ghost / outline */
  .cai-btn-cancel {
    background: transparent;
    color: var(--text-secondary);
    border: 1.5px solid var(--border);
  }
  .cai-btn-cancel:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
    border-color: var(--accent-primary);
  }

  /* ── Keyframes ── */
  @keyframes cai-fade-in  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes cai-fade-out { from { opacity: 1 } to { opacity: 0 } }
  @keyframes cai-zoom-in  {
    from { opacity: 0; transform: translate(-50%,-50%) scale(.94) translateY(6px) }
    to   { opacity: 1; transform: translate(-50%,-50%) scale(1)   translateY(0)   }
  }
  @keyframes cai-zoom-out {
    from { opacity: 1; transform: translate(-50%,-50%) scale(1)   translateY(0)   }
    to   { opacity: 0; transform: translate(-50%,-50%) scale(.94) translateY(6px) }
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn("cai-overlay", className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    {/* Inject palette tokens once, scoped to the portal */}
    <style dangerouslySetInnerHTML={{ __html: paletteStyle }} />
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn("cai-content", className)}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("cai-header", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("cai-footer", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("cai-title", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("cai-description", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn("cai-btn cai-btn-action", className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn("cai-btn cai-btn-cancel", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};