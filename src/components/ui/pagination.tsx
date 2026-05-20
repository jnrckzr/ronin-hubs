import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

/**
 * Cinematic Anime-Inspired Pagination
 *
 * Uses the same --ca-* CSS variables. See navigation-menu.tsx for globals.css snippet.
 *
 * Additional vars used here:
 * :root  { --ca-accent-s: color-mix(in srgb, #6E8EF7 12%, transparent); }
 * .dark  { --ca-accent-s: color-mix(in srgb, #7DA2FF 12%, transparent); }
 */

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  ),
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      // Base layout
      "inline-flex h-9 w-9 items-center justify-center",
      "rounded-[9px]",
      "text-sm font-medium tracking-[0.01em]",
      "select-none cursor-pointer",
      "transition-all duration-150 ease-out",
      "outline-none",
      // Default (ghost)
      !isActive && [
        "text-(--ca-text)",
        "bg-transparent",
        "border border-transparent",
        "hover:bg-(--ca-accent-s) hover:text-(--ca-accent)",
        "focus-visible:bg-(--ca-accent-s) focus-visible:text-(--ca-accent)",
        "focus-visible:ring-[3px] focus-visible:ring-(--ca-accent-s)",
      ],
      // Active page
      isActive && [
        "text-(--ca-accent)",
        "bg-(--ca-accent-s)",
        "border border-(--ca-accent)",
        "shadow-[0_0_0_1px_var(--ca-accent)]",
        "font-semibold",
      ],
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn(
      "w-auto gap-1.5 px-3",
      "text-(--ca-muted) hover:text-(--ca-accent)",
      className,
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn(
      "w-auto gap-1.5 px-3",
      "text-(--ca-muted) hover:text-(--ca-accent)",
      className,
    )}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 items-center justify-center",
      "text-(--ca-muted)",
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};