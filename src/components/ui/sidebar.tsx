"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3.25rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// ─── Context ──────────────────────────────────────────────────────────────────

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) setOpenProp(openState);
      else _setOpen(openState);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(
    () => (isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)),
    [isMobile, setOpen],
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col",
          "bg-background dark:bg-[#161A22]",
          "text-[#1C2230] dark:text-[#F4F1EA]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className={cn(
            "w-(--sidebar-width) p-0 [&>button]:hidden",
            "bg-background dark:bg-[#161A22]",
            "text-[#1C2230] dark:text-[#F4F1EA]",
          )}
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      className="group peer hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* Gap spacer */}
      <div
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width)"
            : "right-0 group-data-[collapsible=offcanvas]:-right-(--sidebar-width)",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          "border-[#D9DEE8] dark:border-[#2C3445]",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className={cn(
            "flex h-full w-full flex-col",
            "bg-[#EFE9DD] dark:bg-[#161A22]",
            "text-[#1C2230] dark:text-[#F4F1EA]",
            "group-data-[variant=floating]:rounded-xl",
            "group-data-[variant=floating]:border group-data-[variant=floating]:border-[#D9DEE8] dark:group-data-[variant=floating]:border-[#2C3445]",
            "group-data-[variant=floating]:shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:group-data-[variant=floating]:shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
Sidebar.displayName = "Sidebar";

// ─── Trigger ──────────────────────────────────────────────────────────────────

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 rounded-lg",
        "text-muted-foreground dark:text-[#A2AAB8]",
        "hover:bg-[#E8EDFA] hover:text-hover-accent",
        "dark:hover:bg-[#252C3D] dark:hover:text-[#7DA2FF]",
        className,
      )}
      onClick={(e) => { onClick?.(e); toggleSidebar(); }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

// ─── Rail ─────────────────────────────────────────────────────────────────────

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear sm:flex",
          "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5",
          "hover:after:bg-[#6E8EF7] dark:hover:after:bg-[#7DA2FF]",
          "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
          "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
          "group-data-[collapsible=offcanvas]:hover:bg-[#EFE9DD] dark:group-data-[collapsible=offcanvas]:hover:bg-[#161A22]",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

// ─── Inset ────────────────────────────────────────────────────────────────────

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      className={cn(
        "relative flex w-full flex-1 flex-col",
        "bg-background dark:bg-[#0F1117]",
        "md:peer-data-[variant=inset]:m-2",
        "md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2",
        "md:peer-data-[variant=inset]:ml-0",
        "md:peer-data-[variant=inset]:rounded-xl",
        "md:peer-data-[variant=inset]:shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:md:peer-data-[variant=inset]:shadow-[0_2px_16px_rgba(0,0,0,0.4)]",
        className,
      )}
      {...props}
    />
  ),
);
SidebarInset.displayName = "SidebarInset";

// ─── Input ────────────────────────────────────────────────────────────────────

const SidebarInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full shadow-none",
        "bg-[#FFFFFF] dark:bg-[#1D2330]",
        "border-[#D9DEE8] dark:border-[#2C3445]",
        "text-[#1C2230] dark:text-[#F4F1EA]",
        "placeholder:text-[#9AA1AE] dark:placeholder:text-[#6F7785]",
        "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] dark:focus-visible:ring-[#7DA2FF]",
        className,
      )}
      {...props}
    />
  ),
);
SidebarInput.displayName = "SidebarInput";

// ─── Header / Footer ──────────────────────────────────────────────────────────

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-3",
        "border-b border-[#D9DEE8] dark:border-[#2C3445]",
        className,
      )}
      {...props}
    />
  ),
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2 p-3",
        "border-t border-[#D9DEE8] dark:border-[#2C3445]",
        "bg-background dark:bg-[#0F1117]",
        className,
      )}
      {...props}
    />
  ),
);
SidebarFooter.displayName = "SidebarFooter";

// ─── Separator ────────────────────────────────────────────────────────────────

const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    data-sidebar="separator"
    className={cn("mx-2 w-auto bg-[#D9DEE8] dark:bg-[#2C3445]", className)}
    {...props}
  />
));
SidebarSeparator.displayName = "SidebarSeparator";

// ─── Content ─────────────────────────────────────────────────────────────────

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-1 overflow-auto",
        "group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarContent.displayName = "SidebarContent";

// ─── Group ────────────────────────────────────────────────────────────────────

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  ),
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-7 shrink-0 items-center rounded-md px-2",
        "text-xs font-semibold uppercase tracking-widest",
        "text-[#9AA1AE] dark:text-[#6F7785]",
        "outline-none transition-[margin,opacity] duration-200 ease-linear",
        "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] dark:focus-visible:ring-[#7DA2FF]",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0",
        "text-muted-foreground dark:text-[#A2AAB8]",
        "cursor-pointer outline-none transition-colors duration-150",
        "hover:bg-[#E8EDFA] hover:text-hover-accent",
        "dark:hover:bg-[#252C3D] dark:hover:text-[#7DA2FF]",
        "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] dark:focus-visible:ring-[#7DA2FF]",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

// ─── Menu ─────────────────────────────────────────────────────────────────────

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  ),
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  ),
);
SidebarMenuItem.displayName = "SidebarMenuItem";

// ─── Menu Button ─────────────────────────────────────────────────────────────

const sidebarMenuButtonVariants = cva(
  cn(
    "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-lg p-2 text-left text-sm",
    "cursor-pointer outline-none",
    "transition-colors duration-150",
    "text-[#1C2230] dark:text-[#F4F1EA]",
    "hover:bg-[#E8EDFA] hover:text-[#5C74D8] dark:hover:bg-[#252C3D] dark:hover:text-[#7DA2FF]",
    "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] dark:focus-visible:ring-[#7DA2FF]",
    "active:scale-[0.98]",
    "data-[active=true]:bg-[#E8EDFA] data-[active=true]:text-[#5C74D8] data-[active=true]:font-medium",
    "dark:data-[active=true]:bg-[#252C3D] dark:data-[active=true]:text-[#7DA2FF]",
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
    "aria-disabled:pointer-events-none aria-disabled:opacity-40",
    "[&>svg]:size-4 [&>svg]:shrink-0",
    "[&>svg]:text-muted-foreground dark:[&>svg]:text-[#A2AAB8]",
    "hover:[&>svg]:text-hover-accent dark:hover:[&>svg]:text-[#7DA2FF]",
    "data-[active=true]:[&>svg]:text-hover-accent dark:data-[active=true]:[&>svg]:text-[#7DA2FF]",
    "group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center",
    "[&>span:last-child]:truncate",
  ),
  {
    variants: {
      variant: {
        default: "",
        outline: cn(
          "bg-[#FFFFFF] dark:bg-[#1D2330]",
          "border border-[#D9DEE8] dark:border-[#2C3445]",
          "hover:border-[#6E8EF7] dark:hover:border-[#7DA2FF]",
        ),
      },
      size: {
        default: "h-9 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) return button;
  if (typeof tooltip === "string") tooltip = { children: tooltip };

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        className={cn(
          "bg-[#1D2330] dark:bg-[#252C3D]",
          "text-[#F4F1EA]",
          "border border-[#2C3445]",
          "text-xs",
        )}
        {...tooltip}
      />
    </Tooltip>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

// ─── Menu Action ──────────────────────────────────────────────────────────────

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean; showOnHover?: boolean }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-6 items-center justify-center rounded-md p-0",
        "text-muted-foreground dark:text-[#A2AAB8]",
        "cursor-pointer outline-none transition-colors duration-150",
        "hover:bg-[#E8EDFA] hover:text-hover-accent",
        "dark:hover:bg-[#252C3D] dark:hover:text-[#7DA2FF]",
        "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] dark:focus-visible:ring-[#7DA2FF]",
        "peer-hover/menu-button:text-hover-accent dark:peer-hover/menu-button:text-[#7DA2FF]",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && [
          "md:opacity-0",
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100",
          "data-[state=open]:opacity-100",
        ],
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

// ─── Menu Badge ───────────────────────────────────────────────────────────────

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1.5 flex h-5 min-w-5 select-none items-center justify-center rounded-full px-1.5",
        "text-xs font-medium tabular-nums",
        "bg-[#E8EDFA] text-hover-accent dark:bg-[#252C3D] dark:text-[#7DA2FF]",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

// ─── Menu Skeleton ────────────────────────────────────────────────────────────

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { showIcon?: boolean }
>(({ className, showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []);
  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-9 items-center gap-2 rounded-lg px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md bg-[#D9DEE8] dark:bg-[#2C3445]"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-3.5 flex-1 rounded-md bg-[#D9DEE8] dark:bg-[#2C3445]"
        style={{ maxWidth: width } as React.CSSProperties}
        data-sidebar="menu-skeleton-text"
      />
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

// ─── Menu Sub ─────────────────────────────────────────────────────────────────

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-0.5",
        "border-l border-[#D9DEE8] dark:border-[#2C3445]",
        "px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ ...props }, ref) => <li ref={ref} {...props} />,
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & { asChild?: boolean; size?: "sm" | "md"; isActive?: boolean }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-lg px-2",
        "cursor-pointer outline-none transition-colors duration-150",
        "text-muted-foreground dark:text-[#A2AAB8]",
        "hover:bg-[#E8EDFA] hover:text-hover-accent dark:hover:bg-[#252C3D] dark:hover:text-[#7DA2FF]",
        "focus-visible:ring-2 focus-visible:ring-[#6E8EF7] dark:focus-visible:ring-[#7DA2FF]",
        "data-[active=true]:text-hover-accent dark:data-[active=true]:text-[#7DA2FF]",
        "data-[active=true]:bg-[#E8EDFA] dark:data-[active=true]:bg-[#252C3D]",
        "disabled:pointer-events-none disabled:opacity-40",
        "[&>span:last-child]:truncate",
        "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground dark:[&>svg]:text-[#A2AAB8]",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset,
  SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar,
};