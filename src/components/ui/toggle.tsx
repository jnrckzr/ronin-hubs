import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  cn(
    // Base layout
    "inline-flex items-center justify-center gap-2 text-sm font-medium",
    "cursor-pointer select-none",
    // Transitions
    "transition-all duration-200 ease-out",
    // Icon
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Focus ring — Cinematic Blue
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] focus-visible:ring-offset-1",
    "focus-visible:ring-offset-[#F7F4EE]",
    "dark:focus-visible:ring-[#7DA2FF] dark:focus-visible:ring-offset-[#0F1117]",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
    // Press micro-feedback
    "active:scale-95",
    // OFF state text
    "text-[#6C7380] dark:text-[#A2AAB8]",
    // ON state — Cinematic Blue accent with card lift
    "data-[state=on]:bg-[#FFFFFF] data-[state=on]:text-[#6E8EF7]",
    "data-[state=on]:font-semibold",
    "data-[state=on]:shadow-[0_1px_6px_rgba(110,142,247,0.18)]",
    "dark:data-[state=on]:bg-[#1D2330] dark:data-[state=on]:text-[#7DA2FF]",
    "dark:data-[state=on]:shadow-[0_1px_10px_rgba(125,162,255,0.20)]",
    // SVG color inherits
    "[&_svg]:text-current",
  ),
  {
    variants: {
      variant: {
        default: cn(
          "rounded-lg",
          // OFF: transparent bg, hover lifts to Pale Blue White / Elevated Surface
          "bg-transparent",
          "hover:bg-[#F4F6FB] hover:text-[#1C2230]",
          "dark:hover:bg-[#252C3D] dark:hover:text-[#F4F1EA]",
          // ON: Card Surface with border
          "data-[state=on]:border data-[state=on]:border-[#D9DEE8]",
          "dark:data-[state=on]:border-[#2C3445]",
        ),
        outline: cn(
          "rounded-lg",
          // Border always visible
          "border border-[#D9DEE8] dark:border-[#2C3445]",
          "bg-transparent",
          // Hover
          "hover:bg-[#F4F6FB] hover:text-[#1C2230] hover:border-[#6E8EF7]/50",
          "dark:hover:bg-[#252C3D] dark:hover:text-[#F4F1EA] dark:hover:border-[#7DA2FF]/40",
          // ON: accent border glow
          "data-[state=on]:border-[#6E8EF7] dark:data-[state=on]:border-[#7DA2FF]",
        ),
      },
      size: {
        default: "h-9 px-3 min-w-9",
        sm: "h-7 px-2 min-w-7 text-xs",
        lg: "h-11 px-4 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };