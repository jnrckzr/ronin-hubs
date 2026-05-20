import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired Chart Components
 *
 * Tooltip + legend surfaces use --cal-* palette variables.
 * Colors for chart series should be set via ChartConfig using the palette hex values:
 *
 *   const chartConfig = {
 *     revenue: { label: "Revenue", color: "#6E8EF7" },   // --cal-accent (light)
 *     expenses: { label: "Expenses", color: "#8878FF" },  // --cal-accent-2 (light)
 *   } satisfies ChartConfig;
 *
 * For dark/light theme-aware series colors, use the `theme` key:
 *   views: {
 *     label: "Views",
 *     theme: { light: "#6E8EF7", dark: "#7DA2FF" }
 *   }
 */

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

/* ─── ChartContainer ─── */
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, style, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center",
          /* recharts overrides mapped to palette vars */
          "[&_.recharts-cartesian-axis-tick_text]:fill-(--cal-text-faded)",
          "[&_.recharts-cartesian-grid_line]:stroke-(--cal-border)",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-(--cal-border)",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-(--cal-border)",
          "[&_.recharts-radial-bar-background-sector]:fill-(--cal-bg-elevated)",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--cal-bg-elevated)",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-(--cal-border) !important",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
          "text-xs",
          className,
        )}
        style={{ fontFamily: "var(--cal-font, 'DM Sans', system-ui)", ...style }}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

/* ─── ChartStyle ─── */
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color);
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color = item.theme?.[theme as keyof typeof item.theme] || item.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}`,
          )
          .join("\n"),
      }}
    />
  );
};

/* ─── ChartTooltip ─── */
const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active, payload, className, indicator = "dot", hideLabel = false,
      hideIndicator = false, label, labelFormatter, labelClassName,
      formatter, color, nameKey, labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null;
      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;
      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }
      if (!value) return null;
      return <div className={cn("font-medium text-[0.8rem]", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) return null;
    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn("grid min-w-32 items-start gap-1.5 rounded-[10px] px-3 py-2 text-xs shadow-xl", className)}
        style={{
          background: "var(--cal-bg-card)",
          border: "1px solid var(--cal-border)",
          color: "var(--cal-text)",
          boxShadow: "0 4px 24px -4px rgba(0,0,0,0.18), 0 0 0 1px var(--cal-border)",
          backdropFilter: "blur(8px)",
        }}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color || item.payload.fill || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2",
                    indicator === "dot" && "items-center",
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn("shrink-0 rounded-xs", {
                              "h-2.5 w-2.5 rounded-full": indicator === "dot",
                              "w-1 rounded-none": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            })}
                            style={{
                              background:
                                indicator === "dashed" ? "transparent" : indicatorColor,
                              border:
                                indicator === "dashed"
                                  ? `1.5px dashed ${indicatorColor}`
                                  : undefined,
                              boxShadow:
                                indicator === "dot"
                                  ? `0 0 6px ${indicatorColor}55`
                                  : undefined,
                            }}
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center",
                        )}
                      >
                        <div className="grid gap-1">
                          {nestLabel ? tooltipLabel : null}
                          <span style={{ color: "var(--cal-text-muted)", fontSize: "0.75rem" }}>
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span
                            className="font-mono tabular-nums"
                            style={{
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              color: "var(--cal-text)",
                            }}
                          >
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

/* ─── ChartLegend ─── */
const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          return (
            <div
              key={item.value}
              className="flex items-center gap-1.5"
              style={{ fontSize: "0.75rem", color: "var(--cal-text-muted)" }}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: item.color,
                    boxShadow: `0 0 6px ${item.color}66`,
                  }}
                />
              )}
              <span>{itemConfig?.label}</span>
            </div>
          );
        })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return undefined;
  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;
  let configLabelKey: string = key;
  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }
  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, ChartStyle,
};