import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Anime-Inspired Drawer
// Palette: Dark #0F1117 bg · #1D2330 card · #7DA2FF accent · #2C3445 border
//          Light #F7F4EE bg · #FFFFFF card · #6E8EF7 accent · #D9DEE8 border
// ─────────────────────────────────────────────────────────────────────────────

// ─── Root ─────────────────────────────────────────────────────────────────────

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

// ─── Overlay ─────────────────────────────────────────────────────────────────

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      // Cinematic frosted backdrop
      "bg-[#0F1117]/75 dark:bg-[#0F1117]/80",
      "backdrop-blur-md",
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

// ─── Content ─────────────────────────────────────────────────────────────────

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        // Position — anchors to bottom, full width
        "fixed inset-x-0 bottom-0 z-50",
        "mt-24 flex h-auto flex-col",
        // Shape
        "rounded-t-2xl",
        // Surface — Soft Navy Slate card
        "bg-[#FFFFFF] dark:bg-[#1D2330]",
        "border border-b-0 border-[#D9DEE8] dark:border-[#2C3445]",
        // Elevation
        "shadow-[0_-8px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.45)]",
        className
      )}
      {...props}
    >
      {/* Drag handle */}
      <DrawerHandle />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

// ─── Handle ───────────────────────────────────────────────────────────────────

const DrawerHandle = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "mx-auto mt-3.5 mb-1.5",
      "h-1 w-10",
      "rounded-full",
      "bg-[#D9DEE8] dark:bg-[#2C3445]",
      className
    )}
    aria-hidden
  />
);

// ─── Header ───────────────────────────────────────────────────────────────────

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "grid gap-1.5 px-6 pb-0 pt-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

// ─── Body ─────────────────────────────────────────────────────────────────────

const DrawerBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4 py-2", className)} {...props} />
);
DrawerBody.displayName = "DrawerBody";

// ─── Footer ───────────────────────────────────────────────────────────────────

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-auto flex flex-col gap-2",
      "border-t border-[#D9DEE8] dark:border-[#2C3445]",
      "px-6 pb-7 pt-4",
      className
    )}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

// ─── Title ────────────────────────────────────────────────────────────────────

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-base font-bold leading-none tracking-tight",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

// ─── Description ─────────────────────────────────────────────────────────────

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm leading-normal",
      "text-muted-foreground dark:text-[#A2AAB8]",
      className
    )}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

// ─── MenuItem ─────────────────────────────────────────────────────────────────
// A pre-styled action row for use inside the drawer body.

type DrawerMenuItemVariant = "default" | "destructive";

interface DrawerMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  variant?: DrawerMenuItemVariant;
  showArrow?: boolean;
}

const DrawerMenuItem = ({
  icon,
  label,
  description,
  variant = "default",
  showArrow = true,
  className,
  ...props
}: DrawerMenuItemProps) => (
  <div
    role="button"
    tabIndex={0}
    className={cn(
      "flex cursor-pointer items-center gap-3.5",
      "rounded-xl px-4 py-3",
      "transition-colors duration-150",
      "hover:bg-[#F4F6FB] dark:hover:bg-[#252C3D]",
      "focus:outline-none focus:ring-2 focus:ring-[#6E8EF7]/30",
      className
    )}
    {...props}
  >
    {/* Icon badge */}
    {icon && (
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center",
          "rounded-xl text-lg",
          variant === "destructive"
            ? "bg-destructive/12 dark:bg-[#D67C7C]/12"
            : "bg-[#6E8EF7]/10 dark:bg-[#7DA2FF]/10"
        )}
      >
        {icon}
      </div>
    )}

    {/* Text */}
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "text-sm font-medium",
          variant === "destructive"
            ? "text-destructive dark:text-[#D67C7C]"
            : "text-[#1C2230] dark:text-[#F4F1EA]"
        )}
      >
        {label}
      </span>
      {description && (
        <span className="text-xs text-muted-foreground dark:text-[#A2AAB8]">
          {description}
        </span>
      )}
    </div>

    {/* Arrow */}
    {showArrow && (
      <span
        className="ml-auto text-sm text-[#9AA1AE] dark:text-[#6F7785]"
        aria-hidden
      >
        ›
      </span>
    )}
  </div>
);

// ─── Close Button (full-width, ghost style) ───────────────────────────────────

const DrawerCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children = "Cancel", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-full rounded-xl py-3",
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      "bg-[#F4F6FB] dark:bg-[#252C3D]",
      "text-sm font-medium",
      "text-muted-foreground dark:text-[#A2AAB8]",
      "cursor-pointer",
      "transition-all duration-150",
      "hover:border-[#6E8EF7] dark:hover:border-[#7DA2FF]",
      "hover:text-[#1C2230] dark:hover:text-[#F4F1EA]",
      "focus:outline-none focus:ring-2 focus:ring-[#6E8EF7]/30",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
DrawerCloseButton.displayName = "DrawerCloseButton";

// ─── Primary Action Button ────────────────────────────────────────────────────

const DrawerButtonPrimary = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "success";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles: Record<string, string> = {
    default:
      "bg-[#6E8EF7] dark:bg-[#7DA2FF] shadow-[0_2px_14px_rgba(110,142,247,0.35)] dark:shadow-[0_2px_14px_rgba(125,162,255,0.30)] hover:bg-[#5C74D8] dark:hover:bg-[#5E7CE2]",
    destructive:
      "bg-[#C76B6B] dark:bg-[#D67C7C] text-white shadow-[0_2px_14px_rgba(199,107,107,0.35)] hover:bg-[#b55f5f]",
    success:
      "bg-[#6E9F7A] dark:bg-[#89B89A] shadow-[0_2px_14px_rgba(110,159,122,0.35)] hover:bg-[#5e8e6a]",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "w-full rounded-xl py-3",
        "border-none",
        "text-sm font-semibold",
        "text-[#0a0e1a]",
        "cursor-pointer",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6E8EF7]/50",
        "disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});
DrawerButtonPrimary.displayName = "DrawerButtonPrimary";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerMenuItem,
  DrawerCloseButton,
  DrawerButtonPrimary,
};

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

/*
// 1. Action sheet drawer (most common pattern)
<Drawer>
  <DrawerTrigger asChild>
    <button>Open options</button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>More options</DrawerTitle>
      <DrawerDescription>Choose an action for your selected file.</DrawerDescription>
    </DrawerHeader>

    <DrawerBody>
      <DrawerMenuItem icon="✏️" label="Rename" description="Change the file name" />
      <DrawerMenuItem icon="🔗" label="Share link" description="Copy shareable URL to clipboard" />
      <DrawerMenuItem icon="📥" label="Download" description="Save to device" />
      <DrawerMenuItem icon="🗑️" label="Delete" description="Permanently remove" variant="destructive" />
    </DrawerBody>

    <DrawerFooter>
      <DrawerClose asChild>
        <DrawerCloseButton />
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>

// 2. Confirmation drawer with primary action
<Drawer>
  <DrawerTrigger asChild>
    <button>Continue</button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Submit application?</DrawerTitle>
      <DrawerDescription>
        Review your details before submitting. You can edit later.
      </DrawerDescription>
    </DrawerHeader>

    <DrawerFooter>
      <DrawerButtonPrimary>Submit now</DrawerButtonPrimary>
      <DrawerClose asChild>
        <DrawerCloseButton>Go back</DrawerCloseButton>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
*/