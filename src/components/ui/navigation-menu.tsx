import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired NavigationMenu
 *
 * Add to globals.css:
 *
 * :root {
 *   --ca-bg:           #FFFFFF;
 *   --ca-bg-hover:     #F4F6FB;
 *   --ca-surface:      #F4F6FB;
 *   --ca-text:         #1C2230;
 *   --ca-muted:        #6C7380;
 *   --ca-border:       #D9DEE8;
 *   --ca-accent:       #6E8EF7;
 *   --ca-accent-hover: #5C74D8;
 *   --ca-accent-s:     color-mix(in srgb, #6E8EF7 12%, transparent);
 *   --ca-disabled:     #9AA1AE;
 * }
 * .dark {
 *   --ca-bg:           #0F1117;
 *   --ca-bg-hover:     #252C3D;
 *   --ca-surface:      #1D2330;
 *   --ca-text:         #F4F1EA;
 *   --ca-muted:        #A2AAB8;
 *   --ca-border:       #2C3445;
 *   --ca-accent:       #7DA2FF;
 *   --ca-accent-hover: #5E7CE2;
 *   --ca-accent-s:     color-mix(in srgb, #7DA2FF 12%, transparent);
 *   --ca-disabled:     #6F7785;
 * }
 */

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center gap-0.5",
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  [
    "group inline-flex h-10 w-max items-center justify-center",
    "rounded-[9px] px-4 py-2",
    "text-sm font-medium tracking-[0.01em]",
    "text-[var(--ca-text)]",
    "bg-transparent",
    "cursor-pointer select-none",
    "outline-none",
    "transition-all duration-150 ease-out",
    // Hover
    "hover:bg-[var(--ca-accent-s)] hover:text-[var(--ca-accent)]",
    // Focus
    "focus:bg-[var(--ca-accent-s)] focus:text-[var(--ca-accent)]",
    // Open state
    "data-[state=open]:bg-[var(--ca-accent-s)] data-[state=open]:text-[var(--ca-accent)]",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}
    <ChevronDown
      className="relative top-px ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]:rotate-180"
      style={{ color: "var(--ca-muted)" }}
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full",
      "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out",
      "data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
      "data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52",
      "data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
      "md:absolute md:w-auto",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      className={cn(
        // Size & shape
        "origin-top-center relative mt-2",
        "h-(--radix-navigation-menu-viewport-height)",
        "w-full overflow-hidden rounded-[14px]",
        "md:w-(--radix-navigation-menu-viewport-width)",
        // Colors
        "border border-(--ca-border)",
        "bg-(--ca-bg)",
        "text-(--ca-text)",
        // Elevation
        "shadow-[0_8px_32px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
        className,
      )}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
      "data-[state=visible]:animate-in data-[state=hidden]:animate-out",
      "data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    {/* Arrow pip in accent color */}
    <div
      className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm"
      style={{ background: "var(--ca-border)" }}
    />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};