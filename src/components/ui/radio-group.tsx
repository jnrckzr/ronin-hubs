import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired RadioGroup
 *
 * Add to globals.css:
 *
 * :root {
 *   --ca-bg:           #FFFFFF;
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
 *   --ca-text:         #F4F1EA;
 *   --ca-muted:        #A2AAB8;
 *   --ca-border:       #2C3445;
 *   --ca-accent:       #7DA2FF;
 *   --ca-accent-hover: #5E7CE2;
 *   --ca-accent-s:     color-mix(in srgb, #7DA2FF 12%, transparent);
 *   --ca-disabled:     #6F7785;
 * }
 */

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("grid gap-3", className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      // Size & shape
      "aspect-square h-4.5 w-4.5 rounded-full",
      // Border — idle uses palette border, checked will override via data attr
      "border-2 border-(--ca-border)",
      // Background
      "bg-(--ca-bg)",
      // Cursor
      "cursor-pointer",
      // Transition
      "transition-all duration-150 ease-out",
      // Hover — brighten border toward accent
      "hover:border-(--ca-accent) hover:shadow-[0_0_0_3px_var(--ca-accent-s)]",
      // Checked state — border becomes accent
      "data-[state=checked]:border-(--ca-accent)",
      // Focus ring
      "focus:outline-none",
      "focus-visible:ring-[3px] focus-visible:ring-(--ca-accent-s)",
      "focus-visible:border-(--ca-accent)",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-40",
      "disabled:border-(--ca-disabled) disabled:hover:shadow-none",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      {/* Filled dot — sized to sit inside the 18px circle cleanly */}
      <span
        className="block rounded-full transition-transform duration-150 scale-0 data-[state=checked]:scale-100"
        style={{
          width: 8,
          height: 8,
          backgroundColor: "var(--ca-accent)",
        }}
      />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };