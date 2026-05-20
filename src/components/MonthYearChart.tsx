import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  TooltipProps,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */

type DataPoint = { label: string; revenue: number; expenses: number };

/* ─────────────────────────────────────────────────────────────
   CINEMATIC ANIME-INSPIRED PALETTE
   CSS variables cover light/dark automatically.
   Hex constants are used only where CSS vars can't reach
   (SVG gradients, Recharts props that need literal hex).
───────────────────────────────────────────────────────────── */
const C = {
  // Revenue  → Cinematic Blue
  rev:      "#7DA2FF",   // dark
  revLight: "#6E8EF7",   // light
  revDim:   "#7DA2FF2A",

  // Expenses → Soft Lavender
  exp:      "#9A84FF",   // dark
  expLight: "#8878FF",   // light
  expDim:   "#9A84FF2A",
} as const;

/* ── One-time global CSS injection ─────────────────────────── */
const STYLES = `
  :root {
    --ca-bg:        #F7F4EE;
    --ca-bg2:       #EFE9DD;
    --ca-surface:   #FFFFFF;
    --ca-elevated:  #F4F6FB;
    --ca-t1:        #1C2230;
    --ca-t2:        #6C7380;
    --ca-t3:        #9AA1AE;
    --ca-border:    #D9DEE8;
    --ca-rev:       #6E8EF7;
    --ca-rev-h:     #5C74D8;
    --ca-exp:       #8878FF;
    --ca-exp-h:     #7068D0;
    --ca-success:   #6E9F7A;
    --ca-warning:   #C9995D;
    --ca-error:     #C76B6B;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --ca-bg:        #0F1117;
      --ca-bg2:       #161A22;
      --ca-surface:   #1D2330;
      --ca-elevated:  #252C3D;
      --ca-t1:        #F4F1EA;
      --ca-t2:        #A2AAB8;
      --ca-t3:        #6F7785;
      --ca-border:    #2C3445;
      --ca-rev:       #7DA2FF;
      --ca-rev-h:     #5E7CE2;
      --ca-exp:       #9A84FF;
      --ca-exp-h:     #7A6AE0;
      --ca-success:   #89B89A;
      --ca-warning:   #D6A86A;
      --ca-error:     #D67C7C;
    }
  }

  /* Card shell */
  .ca-card {
    background: var(--ca-surface);
    border: 1px solid var(--ca-border);
    border-radius: 18px;
    overflow: hidden;
    font-family: inherit;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity      .45s cubic-bezier(.4,0,.2,1),
      transform    .45s cubic-bezier(.4,0,.2,1),
      box-shadow   .25s ease,
      border-color .25s ease;
  }
  .ca-card.ca-mounted {
    opacity: 1;
    transform: translateY(0);
  }
  .ca-card:hover {
    box-shadow: 0 8px 32px rgba(125,162,255,.12), 0 2px 8px rgba(0,0,0,.08);
    border-color: var(--ca-rev);
  }

  /* Header */
  .ca-header {
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--ca-border);
    background: var(--ca-elevated);
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .ca-title-row { display: flex; align-items: center; gap: 10px; }
  .ca-icon-wrap {
    width: 32px; height: 32px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--ca-rev) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--ca-rev) 24%, transparent);
    flex-shrink: 0;
    transition: background .2s;
  }
  .ca-card:hover .ca-icon-wrap {
    background: color-mix(in srgb, var(--ca-rev) 22%, transparent);
  }
  .ca-icon-wrap svg { width: 16px; height: 16px; color: var(--ca-rev); }
  .ca-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--ca-t1);
    letter-spacing: -.015em;
  }

  /* Pill row */
  .ca-pill-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .ca-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px;
    border-radius: 999px;
    font-size: 11.5px; font-weight: 500;
    border: 1px solid transparent;
    cursor: default;
    user-select: none;
    transition: transform .18s cubic-bezier(.4,0,.2,1), box-shadow .18s ease;
  }
  .ca-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.12); }
  .ca-pill.p-rev {
    background: color-mix(in srgb, var(--ca-rev) 12%, transparent);
    border-color: color-mix(in srgb, var(--ca-rev) 28%, transparent);
    color: var(--ca-rev);
  }
  .ca-pill.p-exp {
    background: color-mix(in srgb, var(--ca-exp) 12%, transparent);
    border-color: color-mix(in srgb, var(--ca-exp) 28%, transparent);
    color: var(--ca-exp);
  }
  .ca-pill.p-net-pos {
    background: color-mix(in srgb, var(--ca-success) 12%, transparent);
    border-color: color-mix(in srgb, var(--ca-success) 28%, transparent);
    color: var(--ca-success);
  }
  .ca-pill.p-net-neg {
    background: color-mix(in srgb, var(--ca-error) 12%, transparent);
    border-color: color-mix(in srgb, var(--ca-error) 28%, transparent);
    color: var(--ca-error);
  }
  .ca-pill-lbl { color: var(--ca-t2); }

  /* Chart area */
  .ca-body { padding: 18px 10px 14px; background: var(--ca-surface); min-width: 0; }

  /* Legend */
  .ca-legend { display: flex; gap: 18px; padding: 0 6px; margin-bottom: 14px; }
  .ca-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ca-t2); }
  .ca-legend-sw { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

  /* Chart wrapper */
  .ca-chart-wrap {
    position: relative; width: 100%; height: 260px;
  }
  @media (max-width: 480px)                          { .ca-chart-wrap { height: 200px; } }
  @media (max-width: 768px) and (orientation:landscape) { .ca-chart-wrap { height: 175px; } }
  @media (min-width: 1024px)                         { .ca-chart-wrap { height: 300px; } }

  /* Tooltip */
  .ca-tip {
    position: absolute; pointer-events: none;
    background: var(--ca-elevated);
    border: 1px solid var(--ca-border);
    border-radius: 13px;
    padding: 12px 16px;
    font-size: 12.5px;
    min-width: 188px;
    opacity: 0;
    transform: translateY(6px) scale(.96);
    transition: opacity .18s ease, transform .18s cubic-bezier(.4,0,.2,1);
    z-index: 20;
    box-shadow: 0 8px 32px rgba(0,0,0,.14);
  }
  .ca-tip.ca-tip-on { opacity: 1; transform: translateY(0) scale(1); }
  .ca-tip-lbl {
    font-size: 14px; font-weight: 600; color: var(--ca-t1);
    margin-bottom: 10px; letter-spacing: -.01em;
  }
  .ca-tip-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 2.5px 0; }
  .ca-tip-key { display: flex; align-items: center; gap: 6px; color: var(--ca-t2); }
  .ca-tip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .ca-tip-val { font-variant-numeric: tabular-nums; font-weight: 600; }
  .ca-tip-hr  { border: none; border-top: 1px solid var(--ca-border); margin: 7px 0; }
  .tv-rev { color: var(--ca-rev); }
  .tv-exp { color: var(--ca-exp); }
  .tv-pos { color: var(--ca-success); }
  .tv-neg { color: var(--ca-error); }

  /* Empty */
  .ca-empty {
    height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px; color: var(--ca-t3); opacity: .45;
  }
  .ca-empty svg { width: 40px; height: 40px; }
  .ca-empty p   { font-size: 13px; margin: 0; }
`;

function useInjectStyles() {
  useEffect(() => {
    const ID = "ca-chart-v2";
    if (document.getElementById(ID)) return;
    const el = Object.assign(document.createElement("style"), { id: ID, textContent: STYLES });
    document.head.appendChild(el);
    return () => document.getElementById(ID)?.remove();
  }, []);
}

/* ── Formatters ─────────────────────────────────────────────── */
const fmtFull  = (v: number) =>
  (v < 0 ? "-" : "") + "₱" + Math.abs(v).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtShort = (v: number) => {
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  if (a >= 1_000_000) return `${s}₱${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000)     return `${s}₱${Math.round(a / 1_000)}k`;
  return `${s}₱${a}`;
};

const fmtPill  = (v: number) =>
  (v < 0 ? "-" : "") + "₱" + Math.abs(v).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export function MonthYearChart({
  title,
  data,
}: {
  title: string;
  data: DataPoint[];
}) {
  useInjectStyles();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const stats = useMemo(() => {
    if (!data.length) return null;
    const totalRev = data.reduce((s, d) => s + d.revenue, 0);
    const totalExp = data.reduce((s, d) => s + d.expenses, 0);
    return { totalRev, totalExp, net: totalRev - totalExp };
  }, [data]);

  const onEnter = useCallback((_: unknown, i: number) => setActiveIndex(i), []);
  const onLeave = useCallback(() => setActiveIndex(null), []);

  return (
    <div className={`ca-card${mounted ? " ca-mounted" : ""}`}>

      {/* Header */}
      <div className="ca-header">
        <div className="ca-title-row">
          <div className="ca-icon-wrap"><BarChart2 /></div>
          <h3 className="ca-title">{title}</h3>
        </div>

        {stats && (
          <div className="ca-pill-row">
            <Pill icon={<TrendingUp size={11} />} label="Revenue"  value={stats.totalRev} cls="p-rev"    />
            <Pill icon={<TrendingDown size={11} />} label="Expenses" value={stats.totalExp} cls="p-exp"    />
            <Pill label="Net" value={stats.net} cls={stats.net >= 0 ? "p-net-pos" : "p-net-neg"} bold />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="ca-body">
        <div className="ca-legend">
          <div className="ca-legend-item">
            <div className="ca-legend-sw" style={{ background: "var(--ca-rev)" }} />
            Revenue
          </div>
          <div className="ca-legend-item">
            <div className="ca-legend-sw" style={{ background: "var(--ca-exp)" }} />
            Expenses
          </div>
        </div>

        <div className="ca-chart-wrap">
          {data.length === 0 ? (
            <div className="ca-empty"><BarChart2 /><p>No data yet</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                  barGap={3}
                  onMouseLeave={onLeave}
                >
                  <defs>
                    {/* Dark-mode gradients */}
                    <linearGradient id="gRevD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.rev}      stopOpacity={1}    />
                      <stop offset="100%" stopColor={C.rev}      stopOpacity={0.68} />
                    </linearGradient>
                    <linearGradient id="gExpD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.exp}      stopOpacity={1}    />
                      <stop offset="100%" stopColor={C.exp}      stopOpacity={0.68} />
                    </linearGradient>
                    {/* Light-mode gradients */}
                    <linearGradient id="gRevL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.revLight} stopOpacity={1}    />
                      <stop offset="100%" stopColor={C.revLight} stopOpacity={0.68} />
                    </linearGradient>
                    <linearGradient id="gExpL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.expLight} stopOpacity={1}    />
                      <stop offset="100%" stopColor={C.expLight} stopOpacity={0.68} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.rev + "18"}
                    opacity={0.6}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--ca-t2)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    tick={{ fill: "var(--ca-t2)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={54}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(1)}M`
                        : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}k`
                        : String(v)
                    }
                  />

                  {/* Invisible tooltip to get position signal — actual UI is FloatingTooltip */}
                  <Tooltip content={() => null} cursor={{ fill: C.rev + "0C", radius: 6 }} />

                  {/* Revenue bars */}
                  <Bar
                    dataKey="revenue"
                    name="revenue"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                    onMouseEnter={onEnter}
                    isAnimationActive
                    animationDuration={750}
                    animationEasing="ease-out"
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={`r${i}`}
                        fill={activeIndex === null || activeIndex === i ? "url(#gRevD)" : C.revDim}
                      />
                    ))}
                  </Bar>

                  {/* Expenses bars */}
                  <Bar
                    dataKey="expenses"
                    name="expenses"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                    onMouseEnter={onEnter}
                    isAnimationActive
                    animationDuration={750}
                    animationEasing="ease-out"
                    animationBegin={90}
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={`e${i}`}
                        fill={activeIndex === null || activeIndex === i ? "url(#gExpD)" : C.expDim}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <FloatingTooltip activeIndex={activeIndex} data={data} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Floating mouse-tracked tooltip ────────────────────────── */
function FloatingTooltip({
  activeIndex,
  data,
}: {
  activeIndex: number | null;
  data: DataPoint[];
}) {
  const wrapRef              = useRef<HTMLDivElement>(null);
  const [pos, setPos]        = useState({ x: 0, y: 0 });
  const [show, setShow]      = useState(false);

  useEffect(() => { setShow(activeIndex !== null); }, [activeIndex]);

  useEffect(() => {
    const wrap = wrapRef.current?.closest<HTMLElement>(".ca-chart-wrap");
    if (!wrap) return;
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    wrap.addEventListener("mousemove", onMove);
    return () => wrap.removeEventListener("mousemove", onMove);
  }, []);

  const d   = activeIndex !== null ? data[activeIndex] : null;
  const net = d ? d.revenue - d.expenses : 0;

  const TIP_W  = 192;
  const wrapW  = wrapRef.current?.closest<HTMLElement>(".ca-chart-wrap")?.clientWidth ?? 600;
  const left   = pos.x > wrapW * 0.58 ? pos.x - TIP_W - 14 : pos.x + 14;
  const top    = Math.max(4, pos.y - 75);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {d && (
        <div
          className={`ca-tip${show ? " ca-tip-on" : ""}`}
          style={{ left, top, width: TIP_W }}
        >
          <div className="ca-tip-lbl">{d.label}</div>

          <div className="ca-tip-row">
            <span className="ca-tip-key">
              <span className="ca-tip-dot" style={{ background: "var(--ca-rev)" }} />
              Revenue
            </span>
            <span className="ca-tip-val tv-rev">{fmtFull(d.revenue)}</span>
          </div>

          <div className="ca-tip-row">
            <span className="ca-tip-key">
              <span className="ca-tip-dot" style={{ background: "var(--ca-exp)" }} />
              Expenses
            </span>
            <span className="ca-tip-val tv-exp">{fmtFull(d.expenses)}</span>
          </div>

          <hr className="ca-tip-hr" />

          <div className="ca-tip-row">
            <span className="ca-tip-key">Net</span>
            <span className={`ca-tip-val ${net >= 0 ? "tv-pos" : "tv-neg"}`}>
              {fmtFull(net)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat pill ──────────────────────────────────────────────── */
function Pill({
  icon,
  label,
  value,
  cls,
  bold = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  cls: string;
  bold?: boolean;
}) {
  return (
    <div className={`ca-pill ${cls}`}>
      {icon}
      <span className="ca-pill-lbl">{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600 }}>{fmtPill(value)}</span>
    </div>
  );
}