"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * Cinematic Anime-Inspired Command Palette
 *
 * Surface:    --cal-bg-card / --cal-bg-elevated
 * Text:       --cal-text / --cal-text-muted / --cal-text-faded
 * Accent:     --cal-accent / --cal-accent-2
 * Border:     --cal-border
 * Glow:       --cal-glow / --cal-glow-strong
 */

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, style, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden",
      /* cmdk group heading */
      "**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1.5",
      "**:[[cmdk-group-heading]]:text-[0.68rem] **:[[cmdk-group-heading]]:font-600",
      "**:[[cmdk-group-heading]]:tracking-[0.08em] **:[[cmdk-group-heading]]:uppercase",
      /* adjacent groups */
      "[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0",
      "**:[[cmdk-group]]:px-1.5",
      /* input wrapper icon */
      "[&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4",
      /* item icon */
      "**:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-2",
      "[&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4",
      className,
    )}
    style={{
      borderRadius: 14,
      background: "var(--cal-bg-card)",
      color: "var(--cal-text)",
      fontFamily: "var(--cal-font, 'DM Sans', system-ui, sans-serif)",
      ...style,
    }}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

/* ── CommandDialog ── */
const CommandDialog = ({ children, ...props }: DialogProps) => (
  <Dialog {...props}>
    <DialogContent
      className="overflow-hidden p-0"
      style={{
        background: "var(--cal-bg-card)",
        border: "1px solid var(--cal-border)",
        borderRadius: 16,
        boxShadow:
          "0 8px 40px -8px rgba(0,0,0,0.22), 0 0 0 1px var(--cal-border), 0 0 32px var(--cal-glow)",
      }}
    >
      <Command>{children}</Command>
    </DialogContent>
  </Dialog>
);

/* ── CommandInput ── */
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, style, ...props }, ref) => (
  <div
    cmdk-input-wrapper=""
    className="flex items-center gap-2 px-3"
    style={{
      borderBottom: "1px solid var(--cal-border)",
      paddingTop: "0.625rem",
      paddingBottom: "0.625rem",
    }}
  >
    <Search
      style={{ color: "var(--cal-accent)", opacity: 0.7, flexShrink: 0 }}
      className="h-4 w-4"
    />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none",
        "placeholder:text-(--cal-text-faded)",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{ color: "var(--cal-text)", caretColor: "var(--cal-accent)", ...style }}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

/* ── CommandList ── */
const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-75 overflow-y-auto overflow-x-hidden py-1.5", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

/* ── CommandEmpty ── */
const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-8 text-center text-sm"
    style={{ color: "var(--cal-text-faded)" }}
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

/* ── CommandGroup ── */
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1",
      "**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5",
      "**:[[cmdk-group-heading]]:text-[0.68rem] **:[[cmdk-group-heading]]:font-semibold",
      "**:[[cmdk-group-heading]]:tracking-[0.08em] **:[[cmdk-group-heading]]:uppercase",
      className,
    )}
    style={
      {
        color: "var(--cal-text)",
        "--cmdk-group-heading-color": "var(--cal-text-faded)",
      } as React.CSSProperties
    }
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

/* ── CommandSeparator ── */
const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1.5 h-px", className)}
    style={{ background: "var(--cal-border)" }}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

/* ── CommandItem ── */
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, style, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2.5 rounded-[9px] px-2.5 py-2",
      "text-sm outline-none transition-all duration-100",
      /* selected / focused state */
      "data-[selected=true]:bg-(--cal-bg-elevated) data-[selected=true]:text-(--cal-accent)",
      /* disabled state */
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-35",
      /* icons */
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      "[&_svg]:text-(--cal-text-muted) data-[selected=true]:[&_svg]:text-(--cal-accent)",
      className,
    )}
    style={{ color: "var(--cal-text)", ...style }}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

/* ── CommandShortcut ── */
const CommandShortcut = ({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-[0.7rem] tracking-widest", className)}
    style={{
      color: "var(--cal-text-faded)",
      background: "var(--cal-bg-elevated)",
      border: "1px solid var(--cal-border)",
      borderRadius: 5,
      padding: "1px 5px",
      fontFamily: "monospace",
      ...style,
    }}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};