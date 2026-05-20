import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group",
      className,
    )}
    {...props}
  >
    {/* Track */}
    <SliderPrimitive.Track
      className={cn(
        "relative h-1 w-full grow overflow-hidden rounded-full",
        // Light: Soft Border Gray base
        "bg-[#D9DEE8]",
        // Dark: Elevated Surface base
        "dark:bg-[#252C3D]",
        // Subtle glow on hover via group
        "transition-all duration-300",
        "group-hover:shadow-[0_0_0_2px_#6E8EF720] dark:group-hover:shadow-[0_0_0_2px_#7DA2FF20]",
      )}
    >
      {/* Range fill */}
      <SliderPrimitive.Range
        className={cn(
          "absolute h-full rounded-full",
          // Light: Cinematic Blue
          "bg-[#6E8EF7]",
          // Dark: Cinematic Blue (brighter)
          "dark:bg-[#7DA2FF]",
          // Glow effect on the filled range
          "shadow-[0_0_8px_#6E8EF780] dark:shadow-[0_0_10px_#7DA2FF80]",
          "transition-all duration-150",
        )}
      />
    </SliderPrimitive.Track>

    {/* Thumb */}
    <SliderPrimitive.Thumb
      className={cn(
        "block h-4 w-4 rounded-full",
        "border-2",
        // Light mode thumb
        "border-[#6E8EF7] bg-background",
        // Dark mode thumb
        "dark:border-[#7DA2FF] dark:bg-[#1D2330]",
        // Shadow / glow
        "shadow-[0_0_0_3px_#6E8EF720] dark:shadow-[0_0_0_3px_#7DA2FF25]",
        // Focus ring
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background dark:focus-visible:ring-[#7DA2FF] dark:focus-visible:ring-offset-[#0F1117]",
        // Hover glow
        "hover:shadow-[0_0_0_5px_#6E8EF730] dark:hover:shadow-[0_0_0_5px_#7DA2FF30]",
        "hover:scale-110",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        // Smooth transitions
        "transition-all duration-200 ease-out",
        "cursor-grab active:cursor-grabbing active:scale-95",
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };