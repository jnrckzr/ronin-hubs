import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base shape
        "rounded-lg overflow-hidden relative",
        // Light mode: shimmer from Soft Border Gray → Pale Blue White → Soft Border Gray
        "bg-[#EFE9DD]",
        // Dark mode: shimmer from Deep Slate → Elevated Surface → Deep Slate
        "dark:bg-[#161A22]",
        // Shimmer overlay via pseudo-element simulation with animate-pulse fallback
        "before:absolute before:inset-0",
        "before:bg-linear-to-r",
        "before:from-transparent before:via-[#D9DEE8]/60 before:to-transparent",
        "dark:before:from-transparent dark:before:via-[#252C3D]/80 dark:before:to-transparent",
        "before:animate-[shimmer_1.8s_ease-in-out_infinite]",
        "before:-translate-x-full",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };