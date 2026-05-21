"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Root Components
// ─────────────────────────────────────────────────────────────

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

// ─────────────────────────────────────────────────────────────
// Overlay
// ─────────────────────────────────────────────────────────────

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "pointer-events-none",
      "bg-[#0F1117]/75 dark:bg-[#0F1117]/85",
      "backdrop-blur-[2px]",
      "transition-opacity duration-300",
      "data-[state=closed]:opacity-0",
      "data-[state=open]:opacity-100",
      className
    )}
    {...props}
  />
));

SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

// ─────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────

const sheetVariants = cva(
  cn(
    "fixed z-[51] flex flex-col gap-0",
    "bg-[#FFFFFF] dark:bg-[#1D2330]",
    "border-[#D9DEE8] dark:border-[#2C3445]",
    "shadow-[0_0_48px_rgba(0,0,0,0.14)]",
    "dark:shadow-[0_0_48px_rgba(0,0,0,0.55)]",
    "transition-transform duration-300 ease-in-out",
  ),
  {
    variants: {
      side: {
        top:
          "inset-x-0 top-0 border-b data-[state=closed]:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:translate-y-full",
        left:
          "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:-translate-x-full sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:translate-x-full sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

// ─────────────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────────────

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close
        className={cn(
          "absolute right-4 top-4 z-10",
          "flex h-7 w-7 items-center justify-center rounded-lg",
          "border border-[#D9DEE8] dark:border-[#2C3445]",
          "bg-[#F4F6FB] dark:bg-[#252C3D]",
          "text-muted-foreground",
          "transition-all duration-150",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-[#6E8EF7]",
          "dark:focus:ring-[#7DA2FF]",
          "disabled:pointer-events-none"
        )}
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>

      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));

SheetContent.displayName = SheetPrimitive.Content.displayName;

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-1.5 p-6 pb-4",
      "border-b border-[#D9DEE8] dark:border-[#2C3445]",
      className
    )}
    {...props}
  />
);

SheetHeader.displayName = "SheetHeader";

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 p-6 pt-4",
      "sm:flex-row sm:justify-end",
      "border-t border-[#D9DEE8] dark:border-[#2C3445]",
      "bg-background dark:bg-[#161A22]",
      className
    )}
    {...props}
  />
);

SheetFooter.displayName = "SheetFooter";

// ─────────────────────────────────────────────────────────────
// Body
// ─────────────────────────────────────────────────────────────

const SheetBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 overflow-y-auto p-6", className)}
    {...props}
  />
);

SheetBody.displayName = "SheetBody";

// ─────────────────────────────────────────────────────────────
// Title
// ─────────────────────────────────────────────────────────────

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-snug",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      className
    )}
    {...props}
  />
));

SheetTitle.displayName = SheetPrimitive.Title.displayName;

// ─────────────────────────────────────────────────────────────
// Description
// ─────────────────────────────────────────────────────────────

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      "text-muted-foreground",
      className
    )}
    {...props}
  />
));

SheetDescription.displayName = SheetPrimitive.Description.displayName;

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};