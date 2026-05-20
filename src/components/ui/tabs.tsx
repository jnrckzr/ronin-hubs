import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-xl p-1 gap-0.5",
      // Light: Soft Cream pill tray
      "bg-[#EFE9DD] text-muted-foreground",
      // Dark: Deep Slate pill tray
      "dark:bg-[#161A22] dark:text-[#A2AAB8]",
      // Subtle border
      "border border-[#D9DEE8] dark:border-[#2C3445]",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap",
      "rounded-lg px-4 py-1.5",
      "text-sm font-medium",
      "cursor-pointer",
      "transition-all duration-200 ease-out",
      // Focus
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] focus-visible:ring-offset-1",
      "focus-visible:ring-offset-[#EFE9DD] dark:focus-visible:ring-[#7DA2FF] dark:focus-visible:ring-offset-[#161A22]",
      // Disabled
      "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
      // Inactive hover
      "hover:text-[#1C2230] hover:bg-[#F4F6FB]",
      "dark:hover:text-[#F4F1EA] dark:hover:bg-[#252C3D]",
      // Active tab — Card Surface + accent text + glow shadow
      "data-[state=active]:bg-[#FFFFFF] data-[state=active]:text-[#6E8EF7]",
      "data-[state=active]:font-semibold",
      "data-[state=active]:shadow-[0_1px_6px_rgba(110,142,247,0.15)]",
      "data-[state=active]:border data-[state=active]:border-[#D9DEE8]",
      "dark:data-[state=active]:bg-[#1D2330] dark:data-[state=active]:text-[#7DA2FF]",
      "dark:data-[state=active]:shadow-[0_1px_10px_rgba(125,162,255,0.18)]",
      "dark:data-[state=active]:border-[#2C3445]",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3",
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] focus-visible:ring-offset-2",
      "focus-visible:ring-offset-background dark:focus-visible:ring-[#7DA2FF] dark:focus-visible:ring-offset-[#0F1117]",
      // Fade-in animation
      "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
      "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0",
      "duration-200",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };