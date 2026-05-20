"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Anime-Inspired Dropdown Menu
// Dark:  bg #1D2330 · border #2C3445 · accent #7DA2FF · text #F4F1EA
// Light: bg #FFFFFF · border #D9DEE8 · accent #6E8EF7 · text #1C2230
// ─────────────────────────────────────────────────────────────────────────────

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

// ─── SubTrigger ───────────────────────────────────────────────────────────────

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      // Layout
      "flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2",
      // Typography
      "text-sm font-medium",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      // States
      "outline-none transition-colors duration-150",
      "focus:bg-[#F4F6FB] dark:focus:bg-[#252C3D]",
      "focus:text-[#6E8EF7] dark:focus:text-[#7DA2FF]",
      "data-[state=open]:bg-[#F4F6FB] dark:data-[state=open]:bg-[#252C3D]",
      "data-[state=open]:text-[#6E8EF7] dark:data-[state=open]:text-[#7DA2FF]",
      // SVG icons
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      "[&_svg]:text-muted-foreground dark:[&_svg]:text-[#A2AAB8]",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto text-muted-foreground dark:text-[#6F7785]" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

// ─── SubContent ───────────────────────────────────────────────────────────────

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      // Size & layout
      "z-50 min-w-32 overflow-hidden",
      // Shape & surface
      "rounded-xl p-1.5",
      "bg-[#FFFFFF] dark:bg-[#1D2330]",
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      // Elevation
      "shadow-[0_8px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
      // Text
      "text-[#1C2230] dark:text-[#F4F1EA]",
      // Animations
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "origin-(--radix-dropdown-menu-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

// ─── Content ─────────────────────────────────────────────────────────────────

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Size & layout
        "z-50 min-w-48 overflow-hidden",
        "max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto",
        // Shape & surface — Soft Navy Slate card
        "rounded-xl p-1.5",
        "bg-[#FFFFFF] dark:bg-[#1D2330]",
        "border border-[#D9DEE8] dark:border-[#2C3445]",
        // Cinematic elevation shadow
        "shadow-[0_8px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
        // Text
        "text-[#1C2230] dark:text-[#F4F1EA]",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "origin-(--radix-dropdown-menu-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// ─── Item ─────────────────────────────────────────────────────────────────────

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    /** Renders the item in a destructive (error) color */
    destructive?: boolean;
  }
>(({ className, inset, destructive, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      // Layout
      "relative flex cursor-default select-none items-center gap-2.5",
      "rounded-lg px-3 py-2",
      // Typography
      "text-sm font-medium outline-none",
      // Colors — normal
      !destructive && [
        "text-[#1C2230] dark:text-[#F4F1EA]",
        "focus:bg-[#F4F6FB] dark:focus:bg-[#252C3D]",
        "focus:text-[#6E8EF7] dark:focus:text-[#7DA2FF]",
      ],
      // Colors — destructive
      destructive && [
        "text-destructive dark:text-[#D67C7C]",
        "focus:bg-destructive/8 dark:focus:bg-[#D67C7C]/10",
        "focus:text-destructive dark:focus:text-[#D67C7C]",
      ],
      // Transition
      "transition-colors duration-150",
      // Disabled
      "data-disabled:pointer-events-none data-disabled:opacity-40",
      // SVG
      "[&>svg]:size-4 [&>svg]:shrink-0",
      "[&>svg]:text-muted-foreground dark:[&>svg]:text-[#A2AAB8]",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// ─── CheckboxItem ─────────────────────────────────────────────────────────────

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center",
      "rounded-lg py-2 pl-8 pr-3",
      "text-sm font-medium",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      "outline-none transition-colors duration-150",
      "focus:bg-[#F4F6FB] dark:focus:bg-[#252C3D]",
      "focus:text-[#6E8EF7] dark:focus:text-[#7DA2FF]",
      "data-disabled:pointer-events-none data-disabled:opacity-40",
      className,
    )}
    checked={checked}
    {...props}
  >
    {/* Check indicator box */}
    <span
      className={cn(
        "absolute left-2.5 flex h-4 w-4 items-center justify-center",
        "rounded border",
        "border-[#D9DEE8] dark:border-[#2C3445]",
        "bg-[#F4F6FB] dark:bg-[#252C3D]",
        // When checked — accent fill
        "data-[state=checked]:border-[#6E8EF7] dark:data-[state=checked]:border-[#7DA2FF]",
        "data-[state=checked]:bg-[#6E8EF7] dark:data-[state=checked]:bg-[#7DA2FF]",
      )}
    >
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

// ─── RadioItem ────────────────────────────────────────────────────────────────

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center",
      "rounded-lg py-2 pl-8 pr-3",
      "text-sm font-medium",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      "outline-none transition-colors duration-150",
      "focus:bg-[#F4F6FB] dark:focus:bg-[#252C3D]",
      "focus:text-[#6E8EF7] dark:focus:text-[#7DA2FF]",
      "data-disabled:pointer-events-none data-disabled:opacity-40",
      className,
    )}
    {...props}
  >
    {/* Radio circle */}
    <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full",
          "border border-[#D9DEE8] dark:border-[#2C3445]",
          "bg-[#F4F6FB] dark:bg-[#252C3D]",
        )}
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-[#6E8EF7] dark:fill-[#7DA2FF] text-transparent" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// ─── Label ────────────────────────────────────────────────────────────────────

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-1.5",
      "text-xs font-semibold uppercase tracking-widest",
      "text-[#9AA1AE] dark:text-[#6F7785]",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// ─── Separator ────────────────────────────────────────────────────────────────

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-1.5 my-1.5 h-px",
      "bg-[#D9DEE8] dark:bg-[#2C3445]",
      className,
    )}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// ─── Shortcut ─────────────────────────────────────────────────────────────────

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-widest",
      "text-[#9AA1AE] dark:text-[#6F7785]",
      className,
    )}
    {...props}
  />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

/*
// 1. Basic dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>Open menu</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User /> Profile
      <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings /> Settings
      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive>
      <LogOut /> Sign out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// 2. With checkbox items
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>View options</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
      Show grid
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem checked={showRuler} onCheckedChange={setShowRuler}>
      Show ruler
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>

// 3. With radio group
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>Sort by</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>

// 4. With submenu
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>More</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Share2 /> Share
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Email link</DropdownMenuItem>
        <DropdownMenuItem>Copy link</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>
*/