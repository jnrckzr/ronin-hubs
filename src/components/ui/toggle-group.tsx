"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center",
      // Light: Soft Cream tray with border
      "bg-[#EFE9DD] dark:bg-[#161A22]",
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      "rounded-xl p-1 gap-0.5",
      // Subtle shadow
      "shadow-[0_1px_3px_rgba(28,34,48,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]",
      className,
    )}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        // Base layout
        "inline-flex items-center justify-center",
        "rounded-lg px-3 py-1.5",
        "text-sm font-medium",
        "cursor-pointer",
        "transition-all duration-200 ease-out",
        // Inactive: secondary text
        "text-muted-foreground dark:text-[#A2AAB8]",
        // Hover (inactive)
        "hover:bg-[#F4F6FB] hover:text-[#1C2230]",
        "dark:hover:bg-[#252C3D] dark:hover:text-[#F4F1EA]",
        // Pressed micro-feedback
        "active:scale-95",
        // Focus ring
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] focus-visible:ring-offset-1",
        "focus-visible:ring-offset-[#EFE9DD] dark:focus-visible:ring-[#7DA2FF] dark:focus-visible:ring-offset-[#161A22]",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
        // Active/pressed state — Cinematic Blue accent
        "data-[state=on]:bg-[#FFFFFF] data-[state=on]:text-[#6E8EF7]",
        "data-[state=on]:font-semibold",
        "data-[state=on]:border data-[state=on]:border-[#D9DEE8]",
        "data-[state=on]:shadow-[0_1px_6px_rgba(110,142,247,0.18)]",
        "dark:data-[state=on]:bg-[#1D2330] dark:data-[state=on]:text-[#7DA2FF]",
        "dark:data-[state=on]:border-[#2C3445]",
        "dark:data-[state=on]:shadow-[0_1px_10px_rgba(125,162,255,0.20)]",
        // Icon sizing
        "[&>svg]:size-4 [&>svg]:shrink-0",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };