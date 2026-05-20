import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Layout
          "flex min-h-20 w-full",
          "rounded-xl px-3.5 py-2.5",
          "text-sm md:text-sm leading-relaxed",
          // Light mode surface
          "bg-[#FFFFFF] text-[#1C2230]",
          "border border-[#D9DEE8]",
          "placeholder:text-[#9AA1AE]",
          // Dark mode surface
          "dark:bg-[#1D2330] dark:text-[#F4F1EA]",
          "dark:border-[#2C3445]",
          "dark:placeholder:text-[#6F7785]",
          // Hover border lift
          "hover:border-[#6E8EF7]/60 dark:hover:border-[#7DA2FF]/50",
          // Focus ring — Cinematic Blue glow
          "focus-visible:outline-none",
          "focus-visible:border-[#6E8EF7] dark:focus-visible:border-[#7DA2FF]",
          "focus-visible:ring-2 focus-visible:ring-[#6E8EF7]/25 dark:focus-visible:ring-[#7DA2FF]/20",
          "focus-visible:shadow-[0_0_0_3px_rgba(110,142,247,0.12)] dark:focus-visible:shadow-[0_0_0_3px_rgba(125,162,255,0.12)]",
          // Shadow for depth
          "shadow-[0_1px_3px_rgba(28,34,48,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.25)]",
          // Transitions
          "transition-all duration-200 ease-out",
          // Resize handle
          "resize-y",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-40",
          "disabled:bg-[#EFE9DD] dark:disabled:bg-[#161A22]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };