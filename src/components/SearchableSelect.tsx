import { useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open the popover when clearing
    onChange("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            // Base — matches Input height conventions used across the app
            "w-full justify-between font-normal",
            "h-10 sm:h-9",                          // touch-friendly on mobile
            "px-3 text-sm",
            "border-input bg-background",
            "hover:bg-accent/40 transition-colors",
            // When open, show a focused ring
            open && "ring-2 ring-ring ring-offset-background",
            // Muted text when nothing selected
            !value && "text-muted-foreground",
          )}
        >
          {/* Left: search icon + label */}
          <span className="flex items-center gap-2 min-w-0 flex-1">
            <Search className="h-3.5 w-3.5 shrink-0 opacity-40" />
            <span className="truncate">
              {value || placeholder}
            </span>
          </span>

          {/* Right: clear button (when selected) or chevron */}
          <span className="flex items-center gap-1 shrink-0 ml-2">
            {value && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                onClick={handleClear}
                onKeyDown={(e) => e.key === "Enter" && handleClear(e as any)}
                className={cn(
                  "rounded-full p-0.5 opacity-50 hover:opacity-100",
                  "hover:bg-muted transition-all",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown
              className={cn(
                "h-3.5 w-3.5 opacity-40 transition-transform duration-200",
                open && "rotate-180 opacity-70",
              )}
            />
          </span>
        </Button>
      </PopoverTrigger>

      {/*
        PopoverContent:
        - Width matches trigger (--radix-popover-trigger-width)
        - Max height + scroll so long lists don't overflow viewport on mobile
        - Higher z-index safe since Radix handles stacking contexts
        - Side offset gives a small gap so it feels "floating"
      */}
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0 shadow-lg rounded-xl border-border/60"
        align="start"
        sideOffset={6}
      >
        <Command className="rounded-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center border-b border-border/60 px-3">
            <Search className="h-3.5 w-3.5 mr-2 shrink-0 opacity-40" />
            <CommandInput
              placeholder="Search…"
              className={cn(
                "flex-1 py-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground",
                "border-0 focus:ring-0 h-10 sm:h-9",
              )}
            />
          </div>

          <CommandList
            className="max-h-[min(280px,50dvh)] overflow-y-auto overscroll-contain"
            /*
              max-h uses min() so on short mobile screens (landscape with
              soft keyboard open) the list caps at 50% of the dynamic
              viewport height instead of going off-screen.
            */
          >
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground opacity-60">
                <Search className="h-5 w-5" />
                No match found.
              </div>
            </CommandEmpty>

            <CommandGroup className="p-1.5">
              {options.map((o) => (
                <CommandItem
                  key={o}
                  value={o}
                  onSelect={(v) => {
                    onChange(v);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer",
                    "transition-colors",
                    // Highlight the active item
                    value === o && "bg-primary/10 text-primary font-medium",
                  )}
                >
                  {/* Checkmark — fills space even when not checked so text doesn't jump */}
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 transition-opacity",
                        value === o ? "opacity-100 text-primary" : "opacity-0",
                      )}
                    />
                  </span>
                  <span className="truncate">{o}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {/* Footer — count of options, subtle UX affordance */}
          {options.length > 0 && (
            <div className="border-t border-border/40 px-3 py-1.5 text-xs text-muted-foreground opacity-50 text-right">
              {options.length} option{options.length !== 1 ? "s" : ""}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}