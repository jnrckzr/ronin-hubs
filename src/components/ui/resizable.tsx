"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";

type PanelGroupProps = React.ComponentProps<typeof Group>;
type ResizableHandleProps = React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
};

const ResizablePanelGroup = ({ className, ...props }: PanelGroupProps) => (
  <Group
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className,
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({ withHandle, className, ...props }: ResizableHandleProps) => (
  <Separator
    className={cn(
      "relative flex shrink-0 items-center justify-center",
      "bg-[--ca-border]",
      "w-0.75 data-[panel-group-direction=vertical]:h-0.75 data-[panel-group-direction=vertical]:w-full",
      "transition-colors duration-150",
      "hover:bg-[--ca-accent-primary]",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2",
      "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-2",
      "data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2",
      "data-[panel-group-direction=vertical]:after:translate-x-0",
      "[&[data-panel-group-direction=vertical]>div]:rotate-90",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ca-accent-primary] focus-visible:ring-offset-1",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div
        className="z-10 flex h-5 w-3 items-center justify-center rounded-sm border"
        style={{
          borderColor: "var(--ca-border)",
          background: "var(--ca-bg-elevated)",
        }}
      >
        <GripVertical className="h-3 w-3" style={{ color: "var(--ca-text-disabled)" }} />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };