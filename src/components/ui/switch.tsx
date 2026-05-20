import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Layout
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
      "border-2 border-transparent",
      // Transitions
      "transition-all duration-300 ease-out",
      // Focus ring
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] focus-visible:ring-offset-2",
      "focus-visible:ring-offset-background",
      "dark:focus-visible:ring-[#7DA2FF] dark:focus-visible:ring-offset-[#0F1117]",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-40",
      // Unchecked state — Light: Soft Border Gray | Dark: Elevated Surface
      "data-[state=unchecked]:bg-[#D9DEE8]",
      "dark:data-[state=unchecked]:bg-[#252C3D]",
      // Checked state — Light: Cinematic Blue | Dark: Cinematic Blue
      "data-[state=checked]:bg-[#6E8EF7]",
      "dark:data-[state=checked]:bg-[#7DA2FF]",
      // Checked glow
      "data-[state=checked]:shadow-[0_0_10px_#6E8EF760]",
      "dark:data-[state=checked]:shadow-[0_0_12px_#7DA2FF60]",
      // Hover
      "hover:data-[state=unchecked]:bg-[#C4CBDB]",
      "dark:hover:data-[state=unchecked]:bg-[#2C3445]",
      "hover:data-[state=checked]:bg-hover-accent",
      "dark:hover:data-[state=checked]:bg-[#5E7CE2]",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full",
        // Light: warm white thumb | Dark: soft navy slate thumb
        "bg-background",
        "dark:bg-[#F4F1EA]",
        // Elevation shadow
        "shadow-[0_1px_4px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.4)]",
        // Slide transition
        "ring-0 transition-transform duration-300 ease-out",
        "data-[state=checked]:translate-x-4",
        "data-[state=unchecked]:translate-x-0",
        // Subtle scale pulse on checked
        "data-[state=checked]:scale-95",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };