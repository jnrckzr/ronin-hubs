"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Layout
        "z-50 overflow-hidden",
        "rounded-lg px-3 py-1.5",
        "text-xs font-medium leading-snug",
        // Light mode: Deep Slate surface, Warm White text
        "bg-[#1C2230] text-[#F4F1EA]",
        "border border-[#2C3445]",
        // Dark mode: Elevated Surface, slightly lighter
        "dark:bg-[#252C3D] dark:text-[#F4F1EA]",
        "dark:border-[#2C3445]",
        // Depth shadow
        "shadow-[0_4px_16px_rgba(0,0,0,0.22)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
        // Enter animations
        "animate-in fade-in-0 zoom-in-95 duration-150",
        // Exit animations
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100",
        // Side-specific slide-in
        "data-[side=top]:slide-in-from-bottom-1.5",
        "data-[side=bottom]:slide-in-from-top-1.5",
        "data-[side=left]:slide-in-from-right-1.5",
        "data-[side=right]:slide-in-from-left-1.5",
        "origin-(--radix-tooltip-content-transform-origin)",
        // Max width for longer labels
        "max-w-55 text-center",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };