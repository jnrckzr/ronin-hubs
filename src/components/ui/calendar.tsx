"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Cinematic Anime-Inspired Calendar
 *
 * Dark Mode Palette:
 *   --cal-bg:          #0F1117  (Midnight Black Blue)
 *   --cal-bg-card:     #1D2330  (Soft Navy Slate)
 *   --cal-bg-elevated: #252C3D  (Muted Indigo Gray)
 *   --cal-text:        #F4F1EA  (Warm White)
 *   --cal-text-muted:  #A2AAB8  (Cool Muted Gray)
 *   --cal-text-faded:  #6F7785  (Faded Gray)
 *   --cal-accent:      #7DA2FF  (Cinematic Blue)
 *   --cal-accent-2:    #9A84FF  (Soft Lavender)
 *   --cal-hover:       #5E7CE2  (Glowing Indigo)
 *   --cal-border:      #2C3445  (Subtle Slate Border)
 *
 * Light Mode Palette:
 *   --cal-bg:          #F7F4EE  (Warm Ivory)
 *   --cal-bg-card:     #FFFFFF  (Soft White)
 *   --cal-bg-elevated: #F4F6FB  (Pale Blue White)
 *   --cal-text:        #1C2230  (Deep Slate)
 *   --cal-text-muted:  #6C7380  (Muted Gray)
 *   --cal-text-faded:  #9AA1AE  (Light Gray)
 *   --cal-accent:      #6E8EF7  (Cinematic Blue)
 *   --cal-accent-2:    #8878FF  (Lavender Indigo)
 *   --cal-hover:       #5C74D8  (Deep Indigo)
 *   --cal-border:      #D9DEE8  (Soft Border Gray)
 */

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <>
      {/* Inject CSS variables for the cinematic palette */}
      <style>{`
        :root {
          --cal-bg: #F7F4EE;
          --cal-bg-secondary: #EFE9DD;
          --cal-bg-card: #FFFFFF;
          --cal-bg-elevated: #F4F6FB;
          --cal-text: #1C2230;
          --cal-text-muted: #6C7380;
          --cal-text-faded: #9AA1AE;
          --cal-accent: #6E8EF7;
          --cal-accent-2: #8878FF;
          --cal-hover: #5C74D8;
          --cal-success: #6E9F7A;
          --cal-warning: #C9995D;
          --cal-error: #C76B6B;
          --cal-border: #D9DEE8;
          --cal-glow: rgba(110, 142, 247, 0.18);
          --cal-glow-strong: rgba(110, 142, 247, 0.32);
          --cal-range-bg: rgba(110, 142, 247, 0.12);
          --cal-cell: 2.25rem;
          --cal-radius: 0.625rem;
          --cal-font: 'DM Sans', 'Outfit', system-ui, sans-serif;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --cal-bg: #0F1117;
            --cal-bg-secondary: #161A22;
            --cal-bg-card: #1D2330;
            --cal-bg-elevated: #252C3D;
            --cal-text: #F4F1EA;
            --cal-text-muted: #A2AAB8;
            --cal-text-faded: #6F7785;
            --cal-accent: #7DA2FF;
            --cal-accent-2: #9A84FF;
            --cal-hover: #5E7CE2;
            --cal-success: #89B89A;
            --cal-warning: #D6A86A;
            --cal-error: #D67C7C;
            --cal-border: #2C3445;
            --cal-glow: rgba(125, 162, 255, 0.15);
            --cal-glow-strong: rgba(125, 162, 255, 0.28);
            --cal-range-bg: rgba(125, 162, 255, 0.10);
          }
        }

        .cal-root {
          font-family: var(--cal-font);
          background: var(--cal-bg-card);
          border: 1px solid var(--cal-border);
          border-radius: calc(var(--cal-radius) * 1.6);
          padding: 1.25rem;
          box-shadow:
            0 0 0 1px var(--cal-border),
            0 4px 24px -4px rgba(0,0,0,0.12),
            0 1px 4px rgba(0,0,0,0.06);
          transition: box-shadow 0.2s ease;
        }

        @media (prefers-color-scheme: dark) {
          .cal-root {
            box-shadow:
              0 0 0 1px var(--cal-border),
              0 8px 32px -4px rgba(0,0,0,0.4),
              0 0 0 4px rgba(125, 162, 255, 0.03);
          }
        }

        /* Caption / month label */
        .cal-caption-label {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: var(--cal-text);
        }

        /* Weekday headers */
        .cal-weekday {
          color: var(--cal-text-faded);
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Nav buttons */
        .cal-nav-btn {
          color: var(--cal-text-muted);
          border-radius: var(--cal-radius);
          border: 1px solid var(--cal-border);
          background: var(--cal-bg-elevated);
          transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .cal-nav-btn:hover {
          background: var(--cal-accent);
          color: #fff;
          border-color: var(--cal-accent);
          box-shadow: 0 0 10px var(--cal-glow-strong);
        }

        /* Day button base */
        .cal-day-btn {
          font-size: 0.85rem;
          font-weight: 450;
          border-radius: var(--cal-radius);
          color: var(--cal-text);
          transition: background 0.13s, color 0.13s, box-shadow 0.13s, transform 0.1s;
          position: relative;
          overflow: hidden;
        }
        .cal-day-btn:hover:not([data-selected-single=true]):not([data-range-start=true]):not([data-range-end=true]) {
          background: var(--cal-bg-elevated);
          color: var(--cal-accent);
          transform: scale(1.06);
          box-shadow: 0 0 0 1px var(--cal-border);
        }

        /* Today highlight */
        .cal-today .cal-day-btn:not([data-selected-single=true]):not([data-range-start=true]):not([data-range-end=true]) {
          background: var(--cal-range-bg);
          color: var(--cal-accent);
          font-weight: 600;
          box-shadow: 0 0 0 1.5px var(--cal-accent);
        }
        .cal-today .cal-day-btn::after {
          content: '';
          position: absolute;
          bottom: 3px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--cal-accent);
        }

        /* Selected single */
        .cal-day-btn[data-selected-single=true] {
          background: linear-gradient(135deg, var(--cal-accent) 0%, var(--cal-accent-2) 100%);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 12px var(--cal-glow-strong), 0 0 0 1px rgba(255,255,255,0.1) inset;
          transform: scale(1.05);
        }

        /* Range start */
        .cal-day-btn[data-range-start=true] {
          background: linear-gradient(135deg, var(--cal-accent) 0%, var(--cal-accent-2) 100%);
          color: #fff;
          font-weight: 600;
          border-radius: var(--cal-radius) 0 0 var(--cal-radius);
          box-shadow: 0 2px 10px var(--cal-glow);
        }

        /* Range end */
        .cal-day-btn[data-range-end=true] {
          background: linear-gradient(135deg, var(--cal-accent-2) 0%, var(--cal-accent) 100%);
          color: #fff;
          font-weight: 600;
          border-radius: 0 var(--cal-radius) var(--cal-radius) 0;
          box-shadow: 0 2px 10px var(--cal-glow);
        }

        /* Range middle */
        .cal-day-btn[data-range-middle=true] {
          background: var(--cal-range-bg);
          color: var(--cal-accent);
          border-radius: 0;
          font-weight: 500;
        }

        /* Outside days */
        .cal-outside .cal-day-btn {
          color: var(--cal-text-faded);
          opacity: 0.5;
        }

        /* Disabled days */
        .cal-disabled .cal-day-btn {
          color: var(--cal-text-faded);
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* Dropdown styling */
        .cal-dropdown-root {
          border: 1px solid var(--cal-border);
          border-radius: var(--cal-radius);
          background: var(--cal-bg-card);
          overflow: hidden;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cal-dropdown-root:focus-within {
          border-color: var(--cal-accent);
          box-shadow: 0 0 0 3px var(--cal-glow);
        }
        .cal-caption-label-dropdown {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--cal-text);
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .cal-caption-label-dropdown svg {
          color: var(--cal-text-muted);
          width: 14px;
          height: 14px;
        }
      `}</style>

      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("group/calendar", className)}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("cal-root w-fit", defaultClassNames.root),
          months: cn(
            "relative flex flex-col gap-4 md:flex-row",
            defaultClassNames.months,
          ),
          month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
            defaultClassNames.nav,
          ),
          button_previous: cn(
            "cal-nav-btn",
            buttonVariants({ variant: "ghost" }),
            "h-[var(--cal-cell)] w-[var(--cal-cell)] select-none p-0 aria-disabled:opacity-40",
            defaultClassNames.button_previous,
          ),
          button_next: cn(
            "cal-nav-btn",
            buttonVariants({ variant: "ghost" }),
            "h-[var(--cal-cell)] w-[var(--cal-cell)] select-none p-0 aria-disabled:opacity-40",
            defaultClassNames.button_next,
          ),
          month_caption: cn(
            "flex h-[var(--cal-cell)] w-full items-center justify-center px-[var(--cal-cell)]",
            defaultClassNames.month_caption,
          ),
          dropdowns: cn(
            "flex h-[var(--cal-cell)] w-full items-center justify-center gap-2",
            defaultClassNames.dropdowns,
          ),
          dropdown_root: cn(
            "cal-dropdown-root relative",
            defaultClassNames.dropdown_root,
          ),
          dropdown: cn(
            "absolute inset-0 opacity-0 cursor-pointer",
            defaultClassNames.dropdown,
          ),
          caption_label: cn(
            "cal-caption-label select-none",
            captionLayout === "label"
              ? "cal-caption-label text-sm"
              : "cal-caption-label-dropdown",
            defaultClassNames.caption_label,
          ),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "cal-weekday flex-1 select-none rounded-md text-center py-1",
            defaultClassNames.weekday,
          ),
          week: cn("mt-1 flex w-full", defaultClassNames.week),
          week_number_header: cn(
            "w-[var(--cal-cell)] select-none",
            defaultClassNames.week_number_header,
          ),
          week_number: cn(
            "text-[0.75rem] select-none",
            defaultClassNames.week_number,
          ),
          day: cn(
            "group/day relative aspect-square h-full w-full select-none p-0 text-center",
            defaultClassNames.day,
          ),
          range_start: cn(defaultClassNames.range_start),
          range_middle: cn(defaultClassNames.range_middle),
          range_end: cn(defaultClassNames.range_end),
          today: cn("cal-today", defaultClassNames.today),
          outside: cn("cal-outside", defaultClassNames.outside),
          disabled: cn("cal-disabled", defaultClassNames.disabled),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          ),
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left")
              return (
                <ChevronLeftIcon className={cn("size-4", className)} {...props} />
              );
            if (orientation === "right")
              return (
                <ChevronRightIcon
                  className={cn("size-4", className)}
                  {...props}
                />
              );
            return (
              <ChevronDownIcon className={cn("size-4", className)} {...props} />
            );
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => (
            <td {...props}>
              <div
                className="flex items-center justify-center text-center"
                style={{
                  width: "var(--cal-cell)",
                  height: "var(--cal-cell)",
                  color: "var(--cal-text-faded)",
                  fontSize: "0.72rem",
                }}
              >
                {children}
              </div>
            </td>
          ),
          ...components,
        }}
        {...props}
      />
    </>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "cal-day-btn",
        "flex aspect-square h-auto w-full min-w-(--cal-cell) items-center justify-center leading-none",
        modifiers.focused &&
          "outline-2 outline-offset-2 outline-(--cal-accent) z-10 relative",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };