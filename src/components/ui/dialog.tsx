"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Anime-Inspired UI Palette (CSS custom properties injected globally)
// Dark Mode  · Light Mode — auto-switches via [data-theme] or .dark class
// ─────────────────────────────────────────────────────────────────────────────

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

// ─── Overlay ─────────────────────────────────────────────────────────────────

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Cinematic frosted backdrop — midnight wash + blur
      "fixed inset-0 z-50",
      "bg-[#0F1117]/75 dark:bg-[#0F1117]/80",
      "backdrop-blur-md",
      // Radix open/close animations
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "duration-300",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ─── Content ─────────────────────────────────────────────────────────────────

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Accent strip variant painted across the top edge */
    variant?: "default" | "destructive" | "success" | "info";
    /** Show the top accent gradient strip */
    showStrip?: boolean;
  }
>(
  (
    { className, children, variant = "default", showStrip = true, ...props },
    ref
  ) => {
    const stripClass: Record<string, string> = {
      default:
        "bg-gradient-to-r from-[#7DA2FF] to-[#9A84FF]",
      destructive:
        "bg-gradient-to-r from-[#D67C7C] to-[#D6A86A]",
      success:
        "bg-gradient-to-r from-[#89B89A] to-[#7DA2FF]",
      info:
        "bg-gradient-to-r from-[#9A84FF] to-[#7DA2FF]",
    };

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            // Positioning
            "fixed left-1/2 top-1/2 z-50",
            "-translate-x-1/2 -translate-y-1/2",
            "w-full max-w-lg",
            // Surface — Soft Navy Slate card
            "overflow-hidden rounded-2xl",
            "bg-[#FFFFFF] dark:bg-[#1D2330]",
            "border border-[#D9DEE8] dark:border-[#2C3445]",
            // Elevation shadow
            "shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
            // Animations — spring-like scale pop
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-300",
            className
          )}
          {...props}
        >
          {/* Accent strip */}
          {showStrip && (
            <div className={cn("h-0.5 w-full", stripClass[variant])} />
          )}

          {children}

          {/* Close button */}
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4",
              "flex h-8 w-8 items-center justify-center",
              "rounded-lg",
              "border border-[#D9DEE8] dark:border-[#2C3445]",
              "bg-transparent",
              "text-muted-foreground dark:text-[#A2AAB8]",
              "cursor-pointer",
              "transition-all duration-150",
              "hover:border-[#6E8EF7] dark:hover:border-[#7DA2FF]",
              "hover:bg-[#F4F6FB] dark:hover:bg-[#252C3D]",
              "hover:text-[#1C2230] dark:hover:text-[#F4F1EA]",
              "focus:outline-none focus:ring-2 focus:ring-[#6E8EF7]/40 dark:focus:ring-[#7DA2FF]/30",
              "disabled:pointer-events-none",
              // Offset from strip
              showStrip ? "top-4.5" : "top-4"
            )}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ─── Icon Badge (optional, for destructive / success dialogs) ─────────────────

const DialogIconBadge = ({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "info";
  className?: string;
}) => {
  const styles: Record<string, string> = {
    default:
      "bg-[#6E8EF7]/10 border-[#6E8EF7]/20 dark:bg-[#7DA2FF]/10 dark:border-[#7DA2FF]/20",
    destructive:
      "bg-[#C76B6B]/12 border-[#C76B6B]/22 dark:bg-[#D67C7C]/12 dark:border-[#D67C7C]/22",
    success:
      "bg-[#6E9F7A]/12 border-[#6E9F7A]/22 dark:bg-[#89B89A]/12 dark:border-[#89B89A]/22",
    info:
      "bg-[#8878FF]/10 border-[#8878FF]/20 dark:bg-[#9A84FF]/10 dark:border-[#9A84FF]/20",
  };

  return (
    <div
      className={cn(
        "mb-4 flex h-12 w-12 items-center justify-center rounded-xl border text-xl",
        styles[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

// ─── Header ──────────────────────────────────────────────────────────────────

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 px-7 pb-0 pt-7",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

// ─── Body ─────────────────────────────────────────────────────────────────────

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-7 py-5", className)} {...props} />
);
DialogBody.displayName = "DialogBody";

// ─── Footer ──────────────────────────────────────────────────────────────────

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-2.5",
      "border-t border-[#D9DEE8] dark:border-[#2C3445]",
      "px-7 py-5",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// ─── Title ────────────────────────────────────────────────────────────────────

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-bold leading-none tracking-tight",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      // leave room for the close button on the right
      "pr-10",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ─── Description ─────────────────────────────────────────────────────────────

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      "text-muted-foreground dark:text-[#A2AAB8]",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ─── Field (input group convenience wrapper) ──────────────────────────────────

const DialogField = ({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    {label && (
      <label
        className={cn(
          "text-xs font-medium uppercase tracking-widest",
          "text-muted-foreground dark:text-[#A2AAB8]"
        )}
      >
        {label}
      </label>
    )}
    {children}
  </div>
);

// ─── Input (styled for the palette) ──────────────────────────────────────────

const DialogInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-xl px-3.5 py-2.5",
      "text-sm font-normal",
      "bg-[#F4F6FB] dark:bg-[#252C3D]",
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      "placeholder:text-[#9AA1AE] dark:placeholder:text-[#6F7785]",
      "outline-none",
      "transition-[border-color,box-shadow] duration-150",
      "focus:border-[#6E8EF7] dark:focus:border-[#7DA2FF]",
      "focus:ring-4 focus:ring-[#6E8EF7]/15 dark:focus:ring-[#7DA2FF]/15",
      className
    )}
    {...props}
  />
));
DialogInput.displayName = "DialogInput";

// ─── Action Buttons ───────────────────────────────────────────────────────────

const DialogButtonGhost = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "rounded-lg px-4 py-2",
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      "bg-transparent",
      "text-sm font-medium",
      "text-muted-foreground dark:text-[#A2AAB8]",
      "cursor-pointer",
      "transition-all duration-150",
      "hover:bg-[#F4F6FB] dark:hover:bg-[#252C3D]",
      "hover:text-[#1C2230] dark:hover:text-[#F4F1EA]",
      "focus:outline-none focus:ring-2 focus:ring-[#6E8EF7]/30",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
DialogButtonGhost.displayName = "DialogButtonGhost";

const DialogButtonPrimary = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "success";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles: Record<string, string> = {
    default:
      "bg-[#6E8EF7] dark:bg-[#7DA2FF] shadow-[0_2px_14px_rgba(110,142,247,0.35)] dark:shadow-[0_2px_14px_rgba(125,162,255,0.30)] hover:bg-[#5C74D8] dark:hover:bg-[#5E7CE2] hover:shadow-[0_4px_20px_rgba(92,116,216,0.45)]",
    destructive:
      "bg-[#C76B6B] dark:bg-[#D67C7C] text-white shadow-[0_2px_14px_rgba(199,107,107,0.35)] hover:bg-[#b55f5f] hover:shadow-[0_4px_20px_rgba(199,107,107,0.45)]",
    success:
      "bg-[#6E9F7A] dark:bg-[#89B89A] shadow-[0_2px_14px_rgba(110,159,122,0.35)] hover:bg-[#5e8e6a] hover:shadow-[0_4px_20px_rgba(110,159,122,0.45)]",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "rounded-lg px-5 py-2",
        "border-none",
        "text-sm font-semibold",
        "text-[#0a0e1a]",
        "cursor-pointer",
        "transition-all duration-150",
        "hover:-translate-y-px",
        "active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6E8EF7]/50",
        "disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});
DialogButtonPrimary.displayName = "DialogButtonPrimary";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogField,
  DialogInput,
  DialogIconBadge,
  DialogButtonGhost,
  DialogButtonPrimary,
};

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

/*
// 1. Form Dialog
<Dialog>
  <DialogTrigger asChild>
    <button>Open</button>
  </DialogTrigger>
  <DialogContent variant="default">
    <DialogHeader>
      <DialogTitle>Create new workspace</DialogTitle>
      <DialogDescription>
        Set up a shared workspace for your team. You can adjust settings anytime.
      </DialogDescription>
    </DialogHeader>
    <DialogBody className="flex flex-col gap-4">
      <DialogField label="Workspace name">
        <DialogInput placeholder="e.g. Design System" />
      </DialogField>
      <DialogField label="Description">
        <DialogInput placeholder="Short description (optional)" />
      </DialogField>
    </DialogBody>
    <DialogFooter>
      <DialogClose asChild>
        <DialogButtonGhost>Cancel</DialogButtonGhost>
      </DialogClose>
      <DialogButtonPrimary>Create workspace</DialogButtonPrimary>
    </DialogFooter>
  </DialogContent>
</Dialog>

// 2. Destructive Dialog
<Dialog>
  <DialogTrigger asChild>
    <button>Delete</button>
  </DialogTrigger>
  <DialogContent variant="destructive">
    <DialogHeader>
      <DialogIconBadge variant="destructive">🗑️</DialogIconBadge>
      <DialogTitle>Delete project?</DialogTitle>
      <DialogDescription>
        This will permanently delete <strong>"Lunar Dashboard"</strong> and all
        its files. This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <DialogButtonGhost>Keep it</DialogButtonGhost>
      </DialogClose>
      <DialogButtonPrimary variant="destructive">Yes, delete</DialogButtonPrimary>
    </DialogFooter>
  </DialogContent>
</Dialog>

// 3. Success Dialog
<Dialog>
  <DialogTrigger asChild>
    <button>Pay</button>
  </DialogTrigger>
  <DialogContent variant="success">
    <DialogHeader>
      <DialogIconBadge variant="success">🎉</DialogIconBadge>
      <DialogTitle>Payment successful!</DialogTitle>
      <DialogDescription>
        Your subscription has been activated. Receipt sent to your email.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogButtonPrimary variant="success">Go to dashboard</DialogButtonPrimary>
    </DialogFooter>
  </DialogContent>
</Dialog>
*/