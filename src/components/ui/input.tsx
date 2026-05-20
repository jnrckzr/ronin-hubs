import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired Input
 *
 * Add these to your globals.css:
 *
 * :root {
 *   --ca-bg:           #FFFFFF;
 *   --ca-bg-hover:     #F4F6FB;
 *   --ca-text:         #1C2230;
 *   --ca-placeholder:  #9AA1AE;
 *   --ca-border:       #D9DEE8;
 *   --ca-accent:       #6E8EF7;
 *   --ca-accent-hover: #5C74D8;
 *   --ca-error:        #C76B6B;
 *   --ca-disabled-text:#9AA1AE;
 * }
 *
 * .dark {
 *   --ca-bg:           #0F1117;
 *   --ca-bg-hover:     #252C3D;
 *   --ca-text:         #F4F1EA;
 *   --ca-placeholder:  #6F7785;
 *   --ca-border:       #2C3445;
 *   --ca-accent:       #7DA2FF;
 *   --ca-accent-hover: #5E7CE2;
 *   --ca-error:        #D67C7C;
 *   --ca-disabled-text:#6F7785;
 * }
 */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // Layout & shape
          "flex h-10 w-full rounded-[10px] px-3.5 py-2",
          // Typography
          "text-sm font-normal tracking-[0.01em]",
          // Colors via CSS vars
          "bg-(--ca-bg) text-(--ca-text)",
          "border border-(--ca-border)",
          "placeholder:text-(--ca-placeholder)",
          // Transition
          "transition-all duration-150 ease-out",
          // Hover
          "hover:border-(--ca-accent-hover) hover:bg-(--ca-bg-hover)",
          // Focus — single clean ring using accent
          "focus-visible:outline-none",
          "focus-visible:border-(--ca-accent)",
          "focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--ca-accent)_18%,transparent)]",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-(--ca-text)",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-45 disabled:text-(--ca-disabled-text)",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };