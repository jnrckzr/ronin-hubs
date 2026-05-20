import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired Menubar
 *
 * Add these to your globals.css alongside the --ca-* variables:
 *
 * :root {
 *   --ca-bg:            #FFFFFF;
 *   --ca-bg-hover:      #F4F6FB;
 *   --ca-surface:       #F4F6FB;
 *   --ca-elevated:      #EFE9DD;
 *   --ca-text:          #1C2230;
 *   --ca-text-muted:    #6C7380;
 *   --ca-placeholder:   #9AA1AE;
 *   --ca-border:        #D9DEE8;
 *   --ca-accent:        #6E8EF7;
 *   --ca-accent-hover:  #5C74D8;
 *   --ca-accent-subtle: color-mix(in srgb, #6E8EF7 12%, transparent);
 *   --ca-disabled-text: #9AA1AE;
 * }
 *
 * .dark {
 *   --ca-bg:            #0F1117;
 *   --ca-bg-hover:      #252C3D;
 *   --ca-surface:       #1D2330;
 *   --ca-elevated:      #252C3D;
 *   --ca-text:          #F4F1EA;
 *   --ca-text-muted:    #A2AAB8;
 *   --ca-placeholder:   #6F7785;
 *   --ca-border:        #2C3445;
 *   --ca-accent:        #7DA2FF;
 *   --ca-accent-hover:  #5E7CE2;
 *   --ca-accent-subtle: color-mix(in srgb, #7DA2FF 12%, transparent);
 *   --ca-disabled-text: #6F7785;
 * }
 */

// ─── Pass-through wrappers ────────────────────────────────────────────────────

function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

// ─── Root bar ─────────────────────────────────────────────────────────────────

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      // Layout
      "flex h-10 items-center gap-0.5 rounded-[10px] p-1",
      // Colors
      "border border-(--ca-border)",
      "bg-(--ca-bg)",
      // Subtle shadow for elevation
      "shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
      className,
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

// ─── Trigger ──────────────────────────────────────────────────────────────────

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      // Layout & shape
      "flex cursor-default select-none items-center rounded-[7px] px-3 py-1.5",
      // Typography
      "text-sm font-medium tracking-[0.01em]",
      "text-(--ca-text)",
      // Transition
      "transition-all duration-150 ease-out",
      // Outline removal
      "outline-none",
      // Focus/hover state
      "focus:bg-(--ca-accent-subtle) focus:text-(--ca-accent)",
      // Open state — matches active accent
      "data-[state=open]:bg-(--ca-accent-subtle) data-[state=open]:text-(--ca-accent)",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

// ─── Sub trigger ──────────────────────────────────────────────────────────────

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-[7px] px-2.5 py-1.5",
      "text-sm tracking-[0.01em] text-(--ca-text)",
      "outline-none transition-all duration-150",
      "focus:bg-(--ca-accent-subtle) focus:text-(--ca-accent)",
      "data-[state=open]:bg-(--ca-accent-subtle) data-[state=open]:text-(--ca-accent)",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-3.5 w-3.5 text-(--ca-text-muted)" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

// ─── Shared dropdown styles ───────────────────────────────────────────────────

const dropdownBase = [
  "z-50 min-w-[8rem] overflow-hidden rounded-[12px] p-1.5",
  "border border-[var(--ca-border)]",
  "bg-[var(--ca-bg)]",
  "text-[var(--ca-text)]",
  "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]",
  // Animations
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  "origin-(--radix-menubar-content-transform-origin)",
].join(" ");

// ─── Sub content ──────────────────────────────────────────────────────────────

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(dropdownBase, className)}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

// ─── Content ──────────────────────────────────────────────────────────────────

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn("min-w-52", dropdownBase, className)}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

// ─── Item ─────────────────────────────────────────────────────────────────────

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-[7px] px-2.5 py-1.5",
      "text-sm tracking-[0.01em] text-(--ca-text)",
      "outline-none transition-all duration-100",
      "focus:bg-(--ca-accent-subtle) focus:text-(--ca-accent)",
      "data-disabled:pointer-events-none data-disabled:opacity-40 data-disabled:text-(--ca-disabled-text)",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

// ─── Checkbox item ────────────────────────────────────────────────────────────

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-[7px] py-1.5 pl-8 pr-2.5",
      "text-sm tracking-[0.01em] text-(--ca-text)",
      "outline-none transition-all duration-100",
      "focus:bg-(--ca-accent-subtle) focus:text-(--ca-accent)",
      "data-disabled:pointer-events-none data-disabled:opacity-40",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check
          className="h-3.5 w-3.5"
          style={{ color: "var(--ca-accent)" }}
          strokeWidth={2.5}
        />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

// ─── Radio item ───────────────────────────────────────────────────────────────

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-[7px] py-1.5 pl-8 pr-2.5",
      "text-sm tracking-[0.01em] text-(--ca-text)",
      "outline-none transition-all duration-100",
      "focus:bg-(--ca-accent-subtle) focus:text-(--ca-accent)",
      "data-disabled:pointer-events-none data-disabled:opacity-40",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        {/* Filled dot using accent color */}
        <Circle
          className="h-2 w-2"
          style={{ fill: "var(--ca-accent)", color: "var(--ca-accent)" }}
        />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

// ─── Label ────────────────────────────────────────────────────────────────────

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]",
      "text-(--ca-text-muted)",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

// ─── Separator ────────────────────────────────────────────────────────────────

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-1.5 my-1.5 h-px",
      "bg-(--ca-border)",
      className,
    )}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

// ─── Shortcut ─────────────────────────────────────────────────────────────────

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-widest",
      "text-(--ca-text-muted)",
      "font-mono",
      className,
    )}
    {...props}
  />
);
MenubarShortcut.displayName = "MenubarShortcut";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};