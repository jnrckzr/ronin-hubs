import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/SearchableSelect";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCurrency } from "@/lib/providers";
import { WATCH_BRANDS, PAYMENT_METHODS } from "@/lib/constants";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Trash2, Watch, Clock, Plus, AlertTriangle, XCircle, CheckCircle2, Info } from "lucide-react";

export const Route = createFileRoute("/sales/timepieces")({
  head: () => ({ meta: [{ title: "Timepieces Sales — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <Page />
    </AppShell>
  ),
});

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  const [displayed, setDisplayed] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current;
    const end = value;
    const dur = 700;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplayed(start + (end - start) * ease);
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{format(displayed)}</span>;
}

// ── Ripple ────────────────────────────────────────────────────────────────────
function useRipple() {
  return (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const rpl = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 2.2;
    rpl.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      border-radius:50%;pointer-events:none;
      background:rgba(125,162,255,0.18);
      animation:tp-ripple 0.6s ease-out forwards;
    `;
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(rpl);
    setTimeout(() => rpl.remove(), 650);
  };
}

// ── Stock state types ─────────────────────────────────────────────────────────
type StockState =
  | { kind: "untracked" }
  | { kind: "ok";       available: number }
  | { kind: "exact";    available: number }
  | { kind: "over";     available: number }
  | { kind: "empty" };

function getStockState(
  brand: string,
  model: string,
  qty: number,
  invMap: Record<string, number>
): StockState {
  const key = `${brand}||${model}`;
  if (!(key in invMap)) return { kind: "untracked" };
  const available = invMap[key];
  if (available === undefined) return { kind: "untracked" };  // ← narrows the type
  if (available <= 0) return { kind: "empty" };
  if (qty > available) return { kind: "over", available };
  if (qty === available) return { kind: "exact", available };
  return { kind: "ok", available };
}
// ── Stock badge ───────────────────────────────────────────────────────────────
function StockBadge({ state }: { state: StockState }) {
  if (state.kind === "untracked") return null;
  if (state.kind === "empty") {
    return (
      <span className="stock-badge badge-empty">
        <XCircle size={12} />
        Out of stock
      </span>
    );
  }
  return (
    <span className={`stock-badge ${
      state.kind === "ok" ? "badge-ok" :
      state.kind === "exact" ? "badge-exact" : "badge-over"
    }`}>
      {state.kind === "ok"
        ? <CheckCircle2 size={12} />
        : <AlertTriangle size={12} />}
      {state.available} available
    </span>
  );
}

// ── Stock banner ──────────────────────────────────────────────────────────────
function StockBanner({ state }: { state: StockState }) {
  if (state.kind === "untracked" || state.kind === "ok") return null;

  if (state.kind === "empty") {
    return (
      <div className="stock-banner banner-empty">
        <XCircle size={14} />
        <span>Out of stock — restock this watch before recording a sale.</span>
      </div>
    );
  }

  if (state.kind === "over") {
    return (
      <div className="stock-banner banner-over">
        <AlertTriangle size={14} />
        <span>Only {state.available} in stock. Quantity will be capped at {state.available}.</span>
      </div>
    );
  }

  return (
    <div className="stock-banner banner-exact">
      <Info size={14} />
      <span>
        This sale will use ALL remaining stock ({state.available} piece{state.available !== 1 ? "s" : ""}).
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function Page() {
  const { user }   = useAuth();
  const { format } = useCurrency();
  const qc         = useQueryClient();
  const ripple     = useRipple();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["watch-sales", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("timepieces_sales")
          .select("*")
          .eq("user_id", user!.id)
          .order("sale_date", { ascending: false })
      ).data ?? [],
  });

  const { data: invMap = {} } = useQuery({
    queryKey: ["watch-inv-map", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [invRes, salesRes] = await Promise.all([
        supabase
          .from("timepieces_inventory")
          .select("brand, model, stock_in")
          .eq("user_id", user!.id),
        supabase
          .from("timepieces_sales")
          .select("brand, model, quantity")
          .eq("user_id", user!.id),
      ]);

      const soldMap: Record<string, number> = {};
      for (const s of salesRes.data ?? []) {
        const k = `${s.brand}||${s.model}`;
        soldMap[k] = (soldMap[k] ?? 0) + Number(s.quantity);
      }

      const map: Record<string, number> = {};
      for (const row of invRes.data ?? []) {
        const k = `${row.brand}||${row.model}`;
        map[k] = Number(row.stock_in) - (soldMap[k] ?? 0);
      }
      return map;
    },
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["watch-sales"] });
    qc.invalidateQueries({ queryKey: ["watch-inv"] });
    qc.invalidateQueries({ queryKey: ["watch-inv-map"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }, [qc]);

  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [brand,  setBrand]  = useState<string>("");
  const [model,  setModel]  = useState<string>("");
  const [qty,    setQty]    = useState("1");
  const [price,  setPrice]  = useState("");
  const [buyer,  setBuyer]  = useState("");
  const [pay,    setPay]    = useState("Cash");
  const [adding, setAdding] = useState(false);

  const brands = Object.keys(WATCH_BRANDS);
  const models = brand ? (WATCH_BRANDS as any)[brand] : [];

  const stockState = (brand && model)
    ? getStockState(brand, model, Number(qty) || 1, invMap)
    : { kind: "untracked" as const };

  const isOutOfStock = stockState.kind === "empty";
  const isOverStock  = stockState.kind === "over";

  // ── Fixed: proper type narrowing instead of unsafe cast ───────────────────
  const effectiveQty = stockState.kind === "over"
    ? stockState.available
    : Number(qty) || 1;

  // ── Fixed: explicit Promise<void> return type ──────────────────────────────
  const submit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    ripple(e);
    if (!brand || !model || !price || !user) {
      toast.error("Fill required fields");
      return;
    }
    if (isOutOfStock) {
      toast.error("Out of stock — restock before recording a sale");
      return;
    }

    setAdding(true);
    const finalQty = effectiveQty;
    const { error } = await supabase.from("timepieces_sales").insert({
      user_id:        user.id,
      sale_date:      date,
      brand,
      model,
      quantity:       finalQty,
      unit_price:     Number(price),
      total_revenue:  finalQty * Number(price),
      buyer_name:     buyer || null,
      payment_method: pay,
    });
    setAdding(false);
    if (error) { toast.error(error.message); return; }

    if (isOverStock) {
      toast.warning(`Qty capped at ${finalQty} — that's all that was in stock`);
    } else {
      toast.success("Sale recorded");
    }

    setModel(""); setPrice(""); setBuyer(""); setQty("1");
    invalidate();
  };

  // ── Fixed: explicit Promise<void> return type ──────────────────────────────
  const remove = async (id: string): Promise<void> => {
    if (!id) { toast.error("Invalid row ID"); return; }
    const { error } = await supabase
      .from("timepieces_sales")
      .delete()
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Sale removed");
    invalidate();
  };

  const total = (rows ?? []).reduce(
    (s, r: any) => s + Number(r.total_revenue),
    0
  );

  return (
    <div className="tp-root">
      <style>{`
        .tp-root {
          --c-bg:          #F7F4EE;
          --c-bg2:         #EFE9DD;
          --c-surface:     #FFFFFF;
          --c-elevated:    #F4F6FB;
          --c-border:      #D9DEE8;
          --c-border-md:   #b8c2d8;
          --c-text:        #1C2230;
          --c-text2:       #6C7380;
          --c-text3:       #9AA1AE;
          --c-accent:      #6E8EF7;
          --c-accent2:     #8878FF;
          --c-accent-lt:   rgba(110,142,247,0.10);
          --c-accent-glow: rgba(110,142,247,0.22);
          --c-hover:       #5C74D8;
          --c-ok:          #6E9F7A;
          --c-warn:        #C9995D;
          --c-danger:      #C76B6B;
          --c-shadow-sm:   0 1px 3px rgba(28,34,48,.05), 0 4px 16px rgba(110,142,247,.07);
          --c-shadow-md:   0 2px 8px rgba(28,34,48,.07), 0 8px 32px rgba(110,142,247,.14);
          --r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 26px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .tp-root {
          --c-bg:          #0F1117;
          --c-bg2:         #161A22;
          --c-surface:     #1D2330;
          --c-elevated:    #252C3D;
          --c-border:      #2C3445;
          --c-border-md:   #3d4a60;
          --c-text:        #F4F1EA;
          --c-text2:       #A2AAB8;
          --c-text3:       #6F7785;
          --c-accent:      #7DA2FF;
          --c-accent2:     #9A84FF;
          --c-accent-lt:   rgba(125,162,255,0.12);
          --c-accent-glow: rgba(125,162,255,0.24);
          --c-hover:       #5E7CE2;
          --c-ok:          #89B89A;
          --c-warn:        #D6A86A;
          --c-danger:      #D67C7C;
          --c-shadow-sm:   0 1px 3px rgba(0,0,0,.30), 0 4px 16px rgba(0,0,0,.20);
          --c-shadow-md:   0 2px 8px rgba(0,0,0,.35), 0 8px 32px rgba(0,0,0,.25);
        }
        .tp-root * { box-sizing: border-box; }
        .tp-root { padding: clamp(12px,3vw,28px); min-height: 100vh; }
        @keyframes tp-ripple  { from{transform:scale(0);opacity:1} to{transform:scale(1);opacity:0} }
        @keyframes tp-fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tp-fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes tp-shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        @keyframes tp-rowIn   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes tp-skelMove{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes tp-shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        @keyframes tp-bannerIn{ from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        .tp-fade-up { animation: tp-fadeUp .38s cubic-bezier(.22,.68,0,1.2) both; }
        .tp-root .page-header { margin-bottom: 24px; }
        .tp-root .page-title { font-size: clamp(1.6rem,4.5vw,2.6rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--c-text); margin: 0 0 4px; display: flex; align-items: center; gap: 12px; }
        .tp-root .page-title span { color: var(--c-accent); }
        .tp-root .page-sub { font-size: clamp(0.8rem,2vw,0.95rem); color: var(--c-text2); margin: 0; }
        .tp-root .title-icon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; background: var(--c-accent); box-shadow: 0 4px 16px var(--c-accent-glow); color: #fff !important; }
        .tp-root .title-icon svg { color: #fff !important; stroke: #fff !important; flex-shrink: 0; }
        .tp-root .stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 10px; margin-bottom: 20px; }
        .tp-root .stat-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-md); padding: 14px 16px; box-shadow: var(--c-shadow-sm); position: relative; overflow: hidden; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .tp-root .stat-card:hover { transform: translateY(-2px); box-shadow: var(--c-shadow-md); border-color: var(--c-border-md); }
        .tp-root .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--c-accent); border-radius: 99px 99px 0 0; }
        .tp-root .stat-card.ok::before { background: var(--c-ok); }
        .tp-root .stat-label { font-size: 0.68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--c-text3); display: block; margin-bottom: 6px; }
        .tp-root .stat-value { font-size: clamp(1.1rem,2.5vw,1.6rem); font-weight: 800; color: var(--c-text); letter-spacing: -0.02em; line-height: 1.2; word-break: break-all; }
        .tp-root .stat-value.accent { color: var(--c-accent); }
        .tp-root .panel { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-xl); padding: clamp(16px,3vw,24px); box-shadow: var(--c-shadow-sm); margin-bottom: 20px; transition: border-color .25s, box-shadow .25s; }
        .tp-root .panel:focus-within { border-color: var(--c-border-md); box-shadow: var(--c-shadow-md); }
        .tp-root .panel-heading { font-size: 0.82rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--c-text3); margin: 0 0 18px; display: flex; align-items: center; gap: 8px; }
        .tp-root .panel-heading svg { color: var(--c-accent); flex-shrink: 0; }
        .tp-root .form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 480px) { .tp-root .form-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1020px) { .tp-root .form-grid { grid-template-columns: 118px 135px 1fr 68px 148px 148px 1fr 108px; } }
        .tp-root .field-label { font-size: 0.72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--c-text2); display: block; margin-bottom: 6px; transition: color .18s; }
        .tp-root .form-field:focus-within .field-label { color: var(--c-accent); }
        .tp-root .form-input { width: 100%; height: 42px; padding: 0 12px; background: var(--c-elevated); border: 1.5px solid var(--c-border); border-radius: var(--r-sm); color: var(--c-text); font-size: 14px; font-family: inherit; outline: none; transition: border-color .18s, box-shadow .18s; }
        .tp-root .form-input::placeholder { color: var(--c-text3); }
        .tp-root .form-input:hover   { border-color: var(--c-border-md); }
        .tp-root .form-input:focus   { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }
        .tp-root .form-input.input-warn  { border-color: var(--c-warn) !important; }
        .tp-root .form-input.input-error { border-color: var(--c-danger) !important; box-shadow: 0 0 0 3px rgba(199,107,107,.12) !important; animation: tp-shake .35s ease; }
        .tp-root .form-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        .dark .tp-root .form-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
        .tp-root .stock-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 99px; white-space: nowrap; }
        .tp-root .badge-ok    { background: rgba(110,159,122,.12); color: var(--c-ok);    border: 1px solid rgba(110,159,122,.25); }
        .tp-root .badge-over  { background: rgba(201,153, 93,.12); color: var(--c-warn);  border: 1px solid rgba(201,153,93,.25); }
        .tp-root .badge-exact { background: rgba(201,153, 93,.12); color: var(--c-warn);  border: 1px solid rgba(201,153,93,.25); }
        .tp-root .badge-empty { background: rgba(199,107,107,.12); color: var(--c-danger); border: 1px solid rgba(199,107,107,.25); }
        .tp-root .stock-banner { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: var(--r-sm); font-size: 13px; font-weight: 600; line-height: 1.4; animation: tp-bannerIn .2s ease; margin-top: 2px; grid-column: 1 / -1; }
        .tp-root .stock-banner svg { flex-shrink: 0; margin-top: 1px; }
        .tp-root .banner-over  { background: rgba(201,153, 93,.10); color: var(--c-warn);  border: 1px solid rgba(201,153, 93,.25); }
        .tp-root .banner-exact { background: rgba(110,142,247,.08); color: var(--c-accent); border: 1px solid rgba(110,142,247,.20); }
        .tp-root .banner-empty { background: rgba(199,107,107,.08); color: var(--c-danger); border: 1px solid rgba(199,107,107,.20); }
        .tp-root .form-field [data-radix-select-trigger] { height: 42px !important; background: var(--c-elevated) !important; border: 1.5px solid var(--c-border) !important; border-radius: var(--r-sm) !important; color: var(--c-text) !important; font-family: inherit !important; font-size: 14px !important; width: 100% !important; outline: none !important; transition: border-color .18s, box-shadow .18s !important; }
        .tp-root .form-field [data-radix-select-trigger]:hover { border-color: var(--c-border-md) !important; }
        .tp-root .form-field [data-radix-select-trigger]:focus, .tp-root .form-field [data-radix-select-trigger][data-state='open'] { border-color: var(--c-accent) !important; box-shadow: 0 0 0 3px var(--c-accent-lt) !important; }
        .tp-root .submit-btn { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 42px; padding: 0 20px; background: var(--c-accent); color: #fff; border: none; border-radius: var(--r-sm); font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; width: 100%; transition: background .18s, transform .14s, box-shadow .18s; }
        .tp-root .submit-btn:hover:not(:disabled) { background: var(--c-hover); box-shadow: 0 4px 20px var(--c-accent-glow); transform: translateY(-1px); }
        .tp-root .submit-btn:active:not(:disabled) { transform: scale(.97); box-shadow: none; }
        .tp-root .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .tp-root .submit-btn.btn-capped { background: var(--c-warn); }
        .tp-root .submit-btn.btn-capped:hover:not(:disabled) { background: #b8863a; box-shadow: 0 4px 20px rgba(201,153,93,.35); }
        .tp-root .submit-btn.btn-disabled-stock { background: var(--c-danger); opacity: 0.6; }
        .tp-root .submit-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent); transform: translateX(-100%); pointer-events: none; }
        .tp-root .submit-btn:hover:not(:disabled)::after { animation: tp-shimmer .55s ease; }
        .tp-root .table-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-xl); box-shadow: var(--c-shadow-sm); overflow: hidden; }
        .tp-root .sales-table { width: 100%; border-collapse: collapse; min-width: 820px; }
        .tp-root .sales-table thead tr { background: var(--c-elevated); border-bottom: 1px solid var(--c-border); }
        .tp-root .sales-table th { padding: 13px 16px; font-size: 0.67rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--c-text3); text-align: left; white-space: nowrap; }
        .tp-root .sales-table td { padding: 13px 16px; font-size: 13px; color: var(--c-text); border-bottom: 1px solid var(--c-border); vertical-align: middle; white-space: nowrap; }
        .tp-root .sales-table tbody tr:last-child td { border-bottom: none; }
        .tp-root .sales-table tbody tr { position: relative; transition: background .15s; animation: tp-rowIn .32s ease both; }
        .tp-root .sales-table tbody tr::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: var(--c-accent); transition: width .2s ease; border-radius: 0 2px 2px 0; }
        .tp-root .sales-table tbody tr:hover { background: var(--c-elevated); }
        .tp-root .sales-table tbody tr:hover::before { width: 3px; }
        .tp-root .td-total { font-weight: 700; color: var(--c-accent); }
        .tp-root .td-date  { color: var(--c-text2); }
        .tp-root .td-mono  { color: var(--c-text2); }
        .tp-root .td-model { max-width: 160px; overflow: hidden; text-overflow: ellipsis; color: var(--c-text2); }
        .tp-root .buyer-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700; letter-spacing: .04em; padding: 3px 9px; border-radius: 99px; background: var(--c-accent-lt); color: var(--c-accent); border: 1px solid rgba(110,142,247,0.22); transition: background .15s, border-color .15s, box-shadow .15s; cursor: default; }
        .tp-root .buyer-badge:hover { background: rgba(110,142,247,0.18); border-color: var(--c-accent); box-shadow: 0 0 8px var(--c-accent-glow); }
        .tp-root .pay-chip { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: var(--c-elevated); color: var(--c-text2); border: 1px solid var(--c-border); }
        .tp-root .remove-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid transparent; border-radius: var(--r-sm); color: var(--c-text3); cursor: pointer; transition: background .15s, color .15s, transform .12s, border-color .15s, box-shadow .15s; }
        .tp-root .remove-btn:hover { background: rgba(199,107,107,.12); color: var(--c-danger); border-color: var(--c-danger); box-shadow: 0 0 10px rgba(199,107,107,.18); transform: scale(1.08); }
        .tp-root .remove-btn:active { transform: scale(.9); }
        .tp-root .skel { height: 13px; border-radius: 6px; background: linear-gradient(90deg, var(--c-elevated) 25%, var(--c-border) 50%, var(--c-elevated) 75%); background-size: 200% 100%; animation: tp-skelMove 1.5s infinite; }
        .tp-root .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 64px 24px; color: var(--c-text3); text-align: center; }
        .tp-root .empty-state svg { opacity: .35; }
        .tp-root .empty-state p { margin: 0; font-size: 15px; }
        @media (max-width: 767px) and (orientation: landscape) { .tp-root .page-title { font-size: 1.5rem; } .tp-root .stat-strip { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 359px) { .tp-root .page-title { font-size: 1.35rem; } .tp-root .panel { padding: 14px; } }
      `}</style>

      <header className="page-header tp-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="page-title">
          <span className="title-icon">
            <Watch size={20} strokeWidth={2.2} />
          </span>
          Timepieces <span>Sales</span>
        </h1>
        <p className="page-sub">Track every watch sold — Ronin's Hub</p>
      </header>

      <div className="stat-strip tp-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value accent">
            <AnimatedNumber value={total} format={format} />
          </span>
        </div>
        <div className="stat-card ok">
          <span className="stat-label">Sales recorded</span>
          <span className="stat-value">{(rows ?? []).length}</span>
        </div>
      </div>

      <div className="panel tp-fade-up" style={{ animationDelay: "120ms" }}>
        <p className="panel-heading">
          <Clock size={16} aria-hidden="true" />
          Add Sale
        </p>

        <div className="form-grid">
          <div className="form-field">
            <label className="field-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label">Brand</label>
            <Select
              value={brand}
              onValueChange={(v) => { setBrand(v); setModel(""); setQty("1"); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="form-field">
            <label className="field-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              Model
              {brand && model && <StockBadge state={stockState} />}
            </label>
            <SearchableSelect
              value={model}
              onChange={(v) => { setModel(v); setQty("1"); }}
              options={models}
              placeholder={brand ? "Search model…" : "Pick brand first"}
            />
          </div>

          <div className="form-field">
            <label className="field-label">Qty</label>
            <input
              type="number"
              min="1"
              className={[
                "form-input",
                isOutOfStock ? "input-error" :
                stockState.kind === "over" || stockState.kind === "exact" ? "input-warn" : "",
              ].join(" ").trim()}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              disabled={isOutOfStock}
            />
          </div>

          <div className="form-field">
            <label className="field-label">Unit Price (₱)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={price}
              placeholder="0.00"
              onChange={(e) => setPrice(e.target.value)}
              disabled={isOutOfStock}
            />
          </div>

          <div className="form-field">
            <label className="field-label">Payment</label>
            <Select value={pay} onValueChange={setPay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="form-field">
            <label className="field-label">Buyer Name</label>
            <input
              className="form-input"
              value={buyer}
              placeholder="Optional"
              onChange={(e) => setBuyer(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              className={[
                "submit-btn",
                isOutOfStock ? "btn-disabled-stock" :
                isOverStock  ? "btn-capped" : "",
              ].join(" ").trim()}
              onClick={submit}
              disabled={adding || isOutOfStock}
            >
              {adding ? "…" : isOutOfStock ? (
                <>
                  <XCircle size={14} aria-hidden="true" />
                  No Stock
                </>
              ) : isOverStock ? (
                <>
                  <AlertTriangle size={14} aria-hidden="true" />
                  Add {effectiveQty}
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
                  Add
                </>
              )}
            </button>
          </div>

          {brand && model && <StockBanner state={stockState} />}
        </div>
      </div>

      <div className="table-card tp-fade-up" style={{ animationDelay: "180ms" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="sales-table" aria-label="Timepieces sales records">
            <thead>
              <tr>
                {["Date", "Brand", "Model", "Qty", "Unit", "Total", "Buyer", "Payment", ""].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ animationDelay: `${i * 45}ms` }}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}>
                        <div
                          className="skel"
                          style={{
                            width: j === 8 ? 28 : `${55 + Math.random() * 30}%`,
                            animationDelay: `${i * 0.07}s`,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                rows?.map((r: any, idx: number) => (
                  <tr key={r.id} style={{ animationDelay: `${idx * 35}ms` }}>
                    <td className="td-date">{r.sale_date}</td>
                    <td style={{ fontWeight: 600 }}>{r.brand}</td>
                    <td className="td-model" title={r.model}>{r.model}</td>
                    <td className="td-mono">{r.quantity}</td>
                    <td className="td-mono">{format(Number(r.unit_price))}</td>
                    <td className="td-total">{format(Number(r.total_revenue))}</td>
                    <td>
                      {r.buyer_name ? (
                        <span className="buyer-badge">{r.buyer_name}</span>
                      ) : (
                        <span style={{ color: "var(--c-text3)" }}>—</span>
                      )}
                    </td>
                    <td>
                      {r.payment_method ? (
                        <span className="pay-chip">{r.payment_method}</span>
                      ) : (
                        <span style={{ color: "var(--c-text3)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => remove(r.id)}
                        aria-label="Remove sale"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

              {!isLoading && !rows?.length && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <Watch size={48} aria-hidden="true" />
                      <p>No sales recorded yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}