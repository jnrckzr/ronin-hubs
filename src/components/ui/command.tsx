  "use client";

  import * as React from "react";
  import { type DialogProps } from "@radix-ui/react-dialog";
  import { Command as CommandPrimitive } from "cmdk";
  import { Search } from "lucide-react";

  import { cn } from "@/lib/utils";
  import { Dialog, DialogContent } from "@/components/ui/dialog";

  /**
   * Command Palette
   *
   * Uses the app's real design tokens defined in styles.css under @theme:
   *   --color-popover / --color-popover-foreground   (surface + text)
   *   --color-muted-foreground                        (faded text)
   *   --color-primary                                  (accent)
   *   --color-border                                   (borders)
   *   --color-accent                                    (selected row bg)
   */

  const Command = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive>
  >(({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
        /* cmdk group heading */
        "**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1.5",
        "**:[[cmdk-group-heading]]:text-[0.68rem] **:[[cmdk-group-heading]]:font-600",
        "**:[[cmdk-group-heading]]:tracking-[0.08em] **:[[cmdk-group-heading]]:uppercase",
        "**:[[cmdk-group-heading]]:text-muted-foreground",
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
      {...props}
    />
  ));
  Command.displayName = CommandPrimitive.displayName;

  /* ── CommandDialog ── */
  const CommandDialog = ({ children, ...props }: DialogProps) => (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 bg-popover text-popover-foreground border border-border rounded-2xl shadow-lg">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );

  /* ── CommandInput ── */
  const CommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
  >(({ className, ...props }, ref) => (
    <div
      cmdk-input-wrapper=""
      className="flex items-center gap-2 px-3 border-b border-border py-2.5"
    >
      <Search className="h-4 w-4 shrink-0 text-primary opacity-70" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none text-foreground",
          "placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
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
      className="py-8 text-center text-sm text-muted-foreground"
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
        "overflow-hidden p-1 text-popover-foreground",
        "**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5",
        "**:[[cmdk-group-heading]]:text-[0.68rem] **:[[cmdk-group-heading]]:font-semibold",
        "**:[[cmdk-group-heading]]:tracking-[0.08em] **:[[cmdk-group-heading]]:uppercase",
        "**:[[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
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
      className={cn("-mx-1 my-1.5 h-px bg-border", className)}
      {...props}
    />
  ));
  CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

  /* ── CommandItem ── */
  const CommandItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
  >(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2.5 rounded-[9px] px-2.5 py-2",
        "text-sm outline-none transition-all duration-100 text-popover-foreground",
        /* selected / focused state */
        "data-[selected=true]:bg-accent data-[selected=true]:text-primary",
        /* disabled state */
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-35",
        /* icons */
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "[&_svg]:text-muted-foreground data-[selected=true]:[&_svg]:text-primary",
        className,
      )}
      {...props}
    />
  ));
  CommandItem.displayName = CommandPrimitive.Item.displayName;

  /* ── CommandShortcut ── */
  const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span
      className={cn(
        "ml-auto text-[0.7rem] tracking-widest text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 font-mono",
        className,
      )}
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