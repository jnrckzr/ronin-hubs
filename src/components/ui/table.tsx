import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-xl border border-[#D9DEE8] dark:border-[#2C3445]">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      // Light: Soft Cream bg, bottom border
      "bg-[#EFE9DD] dark:bg-[#161A22]",
      "[&_tr]:border-b [&_tr]:border-[#D9DEE8] dark:[&_tr]:border-[#2C3445]",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      // Card surface background
      "bg-[#FFFFFF] dark:bg-[#1D2330]",
      className,
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-[#D9DEE8] dark:border-[#2C3445]",
      "bg-[#EFE9DD]/60 dark:bg-[#161A22]/80",
      "font-medium text-[#1C2230] dark:text-[#F4F1EA]",
      "[&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-[#D9DEE8] dark:border-[#2C3445]",
        "transition-colors duration-150",
        // Hover: Pale Blue White (light) / Elevated Surface (dark)
        "hover:bg-[#F4F6FB] dark:hover:bg-[#252C3D]",
        // Selected
        "data-[state=selected]:bg-[#6E8EF7]/10 dark:data-[state=selected]:bg-[#7DA2FF]/10",
        "data-[state=selected]:border-[#6E8EF7]/30 dark:data-[state=selected]:border-[#7DA2FF]/30",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-3 text-left align-middle",
      "text-xs font-semibold uppercase tracking-wider",
      // Secondary text colors
      "text-muted-foreground dark:text-[#A2AAB8]",
      "has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-3 align-middle",
      "text-[#1C2230] dark:text-[#F4F1EA]",
      "text-sm",
      "has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-sm",
      "text-[#9AA1AE] dark:text-[#6F7785]",
      className,
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};