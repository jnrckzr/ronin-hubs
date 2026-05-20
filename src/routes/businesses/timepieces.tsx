import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/providers";
import { WATCH_BRANDS } from "@/lib/constants";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "@/hooks/use-role";

export default function AquaticPage() {
  const { isLimited, loading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLimited) {
      navigate({ to: "/dashboard" });
    }
  }, [isLimited, loading]);

  if (loading) return null;

  return <div />;
}

export const Route = createFileRoute("/businesses/timepieces")({
  head: () => ({ meta: [{ title: "Timepieces Inventory — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <Page />
    </AppShell>
  ),
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getStatusConfig(current: number) {
  if (current <= 0)  return { label: "Out of Stock", cls: "status-empty", dot: "#C76B6B" };
  if (current <= 5)  return { label: "Low Stock",    cls: "status-low",   dot: "#C9995D" };
  if (current <= 20) return { label: "In Stock",     cls: "status-ok",    dot: "#6E9F7A" };
  return               { label: "Well Stocked",  cls: "status-great", dot: "#6E8EF7" };
}

/* ─── Year options (current year down to 1900) ───────────────────────────── */
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) =>
  String(CURRENT_YEAR - i)
);

/* ─── Restock Modal ──────────────────────────────────────────────────────── */
function RestockModal({
  row, onConfirm, onClose, busy,
}: {
  row: any; onConfirm: (qty: number) => void; onClose: () => void; busy: boolean;
}) {
  const [qty, setQty] = useState(1);
  const current = row.stock_in - row.stock_out;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Restock — {row.brand} {row.model}</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {row.reference && (
          <p className="modal-ref">
            Ref: {row.reference}
            {row.year    ? ` · ${row.year}`         : ""}
            {row.nickname ? ` · "${row.nickname}"` : ""}
          </p>
        )}
        <p className="modal-sub">Current available: <strong>{current}</strong></p>
        <label className="form-label" style={{ marginTop: 12, display: "block" }}>Quantity to add</label>
        <div className="modal-input-row">
          <button className="step-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
          <input type="number" min="1" value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="form-input modal-qty-input" />
          <button className="step-btn" onClick={() => setQty((q) => q + 1)}>+</button>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="add-btn" style={{ flex: 1 }} onClick={() => onConfirm(qty)} disabled={busy}>
            {busy ? "Saving…" : `+ Add ${qty} piece${qty > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile card ────────────────────────────────────────────────────────── */
function WatchCard({
  r, idx, onRestock, onRemove, busy,
}: {
  r: any; idx: number; onRestock: (id: string) => void; onRemove: (id: string) => void; busy: Set<string>;
}) {
  const current = r.stock_in - r.stock_out;
  const { label, cls, dot } = getStatusConfig(current);
  const isBusy = busy.has(r.id);

  return (
    <div className="inv-card" style={{ animationDelay: `${idx * 60}ms` }}>
      <div className="inv-card-header">
        <div className="watch-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" className="watch-svg" aria-hidden="true">
            <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 9v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 4h6l1 3H8L9 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M9 20h6l1-3H8l1 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="watch-info">
          <span className="watch-brand">{r.brand}</span>
          <span className="watch-model">{r.model}</span>
          {(r.reference || r.nickname || r.year) && (
            <span className="watch-meta">
              {r.reference && <span className="watch-ref">Ref: {r.reference}</span>}
              {r.year      && <span className="watch-year">{r.year}</span>}
              {r.nickname  && <span className="watch-nick">"{r.nickname}"</span>}
            </span>
          )}
          {r.movement && <span className="watch-movement">{r.movement}</span>}
          <span className={`status-pill ${cls}`}>
            <span className="status-dot" style={{ background: dot }} />
            {label}
          </span>
        </div>
        <button className="remove-btn" onClick={() => onRemove(r.id)} disabled={isBusy}
          aria-label={`Remove ${r.brand} ${r.model}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>

      <div className="current-stock-display">
        <span className="current-num"
          style={{ color: current <= 0 ? "#C76B6B" : current <= 5 ? "#C9995D" : "var(--c-accent)" }}>
          {current}
        </span>
        <span className="current-label">pieces on hand</span>
      </div>

      <div className="stock-summary">
        <div className="summary-item">
          <span className="summary-label">Total Stocked</span>
          <span className="summary-val in">{r.stock_in}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Total Sold</span>
          <span className="summary-val out">{r.stock_out}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="restock-btn" onClick={() => onRestock(r.id)} disabled={isBusy}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Restock
        </button>
        <div className="sales-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7H19M9 21a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm10 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>
          </svg>
          Sales tracked via Sales page
        </div>
      </div>

      {isBusy && <div className="card-busy-overlay">Saving…</div>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();

  /* form state */
  const [brand,     setBrand]     = useState("");
  const [model,     setModel]     = useState("");
  const [reference, setReference] = useState("");
  const [nickname,  setNickname]  = useState("");
  const [movement,  setMovement]  = useState("");
  const [year,      setYear]      = useState("");
  const [stockIn,   setStockIn]   = useState("0");
  const [adding,    setAdding]    = useState(false);
  const [busyRows,  setBusyRows]  = useState<Set<string>>(new Set());
  const [restockTarget, setRestockTarget] = useState<any | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["watch-inv", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [invRes, salesRes] = await Promise.all([
        supabase
          .from("timepieces_inventory")
          .select("*")
          .eq("user_id", user!.id)
          .order("brand")
          .order("model"),
        supabase
          .from("timepieces_sales")
          .select("brand, model, quantity")
          .eq("user_id", user!.id),
      ]);

      const soldMap: Record<string, number> = {};
      for (const s of salesRes.data ?? []) {
        const key = `${s.brand}||${s.model}`;
        soldMap[key] = (soldMap[key] ?? 0) + Number(s.quantity);
      }

      return (invRes.data ?? []).map((row: any) => ({
        ...row,
        stock_out: soldMap[`${row.brand}||${row.model}`] ?? 0,
      }));
    },
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["watch-inv"] });
    qc.invalidateQueries({ queryKey: ["watch-sales"] });
  }, [qc]);

  const brands = Object.keys(WATCH_BRANDS);
  const models = brand ? (WATCH_BRANDS as any)[brand] : [];

  /* ── Add new watch ── */
  const addNew = async (): Promise<void> => {
    if (!brand || !model || !user) { toast.error("Pick brand and model"); return; }
    setAdding(true);
    // Cast to `any` to bypass Supabase generated-type strictness on nullable columns
    const payload: any = {
      user_id:   user.id,
      brand,
      model,
      reference: reference || null,
      nickname:  nickname  || null,
      movement:  movement  || null,
      year:      year      || null,
      stock_in:  Number(stockIn),
      stock_out: 0,
    };
    const { error } = await supabase
      .from("timepieces_inventory")
      .insert(payload);
    setAdding(false);
    if (error) { toast.error(error.message); return; }
    setBrand(""); setModel(""); setReference(""); setNickname(""); setMovement(""); setYear(""); setStockIn("0");
    invalidate();
    toast.success(`${brand} ${model} added to inventory`);
  };

  /* ── Restock ── */
  const confirmRestock = async (qty: number): Promise<void> => {
    if (!restockTarget) return;
    const { id, stock_in, brand: b, model: m } = restockTarget;
    setBusyRows((s) => new Set(s).add(id));
    const { error } = await supabase
      .from("timepieces_inventory")
      .update({ stock_in: stock_in + qty, updated_at: new Date().toISOString() })
      .eq("id", id);
    setBusyRows((s) => { const n = new Set(s); n.delete(id); return n; });
    if (error) { toast.error(error.message); return; }
    setRestockTarget(null);
    invalidate();
    toast.success(`Restocked ${qty} × ${b} ${m}`);
  };

  /* ── Remove ── */
  const remove = async (id: string): Promise<void> => {
    const row = rows.find((r: any) => r.id === id);
    if (!row) return;
    setBusyRows((s) => new Set(s).add(id));
    const { error } = await supabase.from("timepieces_inventory").delete().eq("id", id);
    setBusyRows((s) => { const n = new Set(s); n.delete(id); return n; });
    if (error) { toast.error(error.message); return; }
    invalidate();
    toast.success(`${(row as any).brand} ${(row as any).model} removed`);
  };

  const totalIn      = rows.reduce((s: number, r: any) => s + Number(r.stock_in),  0);
  const totalSold    = rows.reduce((s: number, r: any) => s + Number(r.stock_out), 0);
  const totalCurrent = totalIn - totalSold;
  const lowStock     = rows.filter((r: any) => r.stock_in - r.stock_out <= 5).length;

  const restockRow = restockTarget
    ? rows.find((r: any) => r.id === restockTarget.id) ?? restockTarget
    : null;

  /* ─────────────────────── RENDER ──────────────────────────────────────── */
  return (
    <div className="tp-root">
      <style>{`
        .tp-root {
          --c-bg:#F7F4EE;--c-bg2:#EFE9DD;--c-surface:#FFFFFF;
          --c-elevated:#F4F6FB;--c-border:#D9DEE8;--c-border-md:#b8c2d8;
          --c-text:#1C2230;--c-text2:#6C7380;--c-text3:#9AA1AE;
          --c-accent:#6E8EF7;--c-accent2:#8878FF;--c-accent3:#5BBFA3;
          --c-accent-lt:rgba(110,142,247,0.10);--c-accent-glow:rgba(110,142,247,0.22);
          --c-hover:#5C74D8;--c-ok:#6E9F7A;--c-warn:#C9995D;--c-danger:#C76B6B;
          --c-shadow-sm:0 1px 3px rgba(28,34,48,.05),0 4px 16px rgba(110,142,247,.07);
          --c-shadow-md:0 2px 8px rgba(28,34,48,.07),0 8px 32px rgba(110,142,247,.14);
          --r-sm:10px;--r-md:14px;--r-lg:20px;--r-xl:26px;
          font-family:'DM Sans',system-ui,sans-serif;
        }
        .dark .tp-root {
          --c-bg:#0F1117;--c-bg2:#161A22;--c-surface:#1D2330;
          --c-elevated:#252C3D;--c-border:#2C3445;--c-border-md:#3d4a60;
          --c-text:#F4F1EA;--c-text2:#A2AAB8;--c-text3:#6F7785;
          --c-accent:#7DA2FF;--c-accent2:#9A84FF;--c-accent3:#6ED4BA;
          --c-accent-lt:rgba(125,162,255,0.12);--c-accent-glow:rgba(125,162,255,0.24);
          --c-hover:#5E7CE2;--c-ok:#89B89A;--c-warn:#D6A86A;--c-danger:#D67C7C;
          --c-shadow-sm:0 1px 3px rgba(0,0,0,.30),0 4px 16px rgba(0,0,0,.20);
          --c-shadow-md:0 2px 8px rgba(0,0,0,.35),0 8px 32px rgba(0,0,0,.25);
        }
        .tp-root*{box-sizing:border-box;}
        .tp-root{padding:clamp(12px,3vw,28px);min-height:100vh;}

        @keyframes tp-fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tp-fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes tp-shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
        @keyframes tp-pulse{0%,100%{opacity:1}50%{opacity:.45}}
        @keyframes tp-sk{from{background-position:-200% 0}to{background-position:200% 0}}
        @keyframes tp-modalIn{from{opacity:0;transform:scale(.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .tp-fade-up{animation:tp-fadeUp .38s cubic-bezier(.22,.68,0,1.2) both;}

        /* Header */
        .tp-root .page-header{margin-bottom:24px;}
        .tp-root .page-title{font-size:clamp(1.6rem,4.5vw,2.6rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1;color:var(--c-text);margin:0 0 4px;}
        .tp-root .page-title span{color:var(--c-accent);}
        .tp-root .page-sub{font-size:clamp(0.8rem,2vw,0.95rem);color:var(--c-text2);margin:0;}

        /* Stat strip */
        .tp-root .stat-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:20px;}
        .tp-root .stat-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:14px 16px;box-shadow:var(--c-shadow-sm);position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s;}
        .tp-root .stat-card:hover{transform:translateY(-2px);box-shadow:var(--c-shadow-md);border-color:var(--c-border-md);}
        .tp-root .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--c-accent);border-radius:99px 99px 0 0;}
        .tp-root .stat-card.accent2::before{background:var(--c-accent2);}
        .tp-root .stat-card.ok::before{background:var(--c-ok);}
        .tp-root .stat-card.warn::before{background:var(--c-warn);}
        .tp-root .stat-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);display:block;margin-bottom:6px;}
        .tp-root .stat-value{font-size:clamp(1.4rem,3vw,2rem);font-weight:800;color:var(--c-text);letter-spacing:-0.02em;line-height:1;}

        /* Form card */
        .tp-root .form-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);padding:clamp(16px,3vw,24px);box-shadow:var(--c-shadow-sm);margin-bottom:20px;transition:border-color .25s,box-shadow .25s;}
        .tp-root .form-card:focus-within{border-color:var(--c-border-md);box-shadow:var(--c-shadow-md);}
        .tp-root .form-heading{font-size:.82rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);margin:0 0 16px;display:flex;align-items:center;gap:8px;}
        .tp-root .form-heading svg{color:var(--c-accent);}

        /* Form grids */
        .tp-root .form-row{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:12px;}
        @media(min-width:480px){.tp-root .form-row{grid-template-columns:1fr 2fr;}}
        @media(min-width:768px){.tp-root .form-row{grid-template-columns:1.2fr 2fr;}}
        .tp-root .form-row-2{display:grid;grid-template-columns:1fr;gap:12px;}
        @media(min-width:540px){.tp-root .form-row-2{grid-template-columns:1fr 1fr 1fr;}}
        @media(min-width:900px){.tp-root .form-row-2{grid-template-columns:1fr 1fr 1fr 140px;}}
        .tp-root .form-row-3{display:grid;grid-template-columns:1fr;gap:12px;margin-top:12px;}
        @media(min-width:540px){.tp-root .form-row-3{grid-template-columns:140px 1fr auto;align-items:end;}}

        .tp-root .form-label{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-text2);display:block;margin-bottom:6px;}
        .tp-root .form-input{width:100%;height:42px;padding:0 12px;background:var(--c-elevated);border:1.5px solid var(--c-border);border-radius:var(--r-sm);color:var(--c-text);font-size:14px;font-family:inherit;outline:none;transition:border-color .18s,box-shadow .18s;}
        .tp-root .form-input:hover{border-color:var(--c-border-md);}
        .tp-root .form-input:focus{border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-lt);}
        .tp-root .form-input::placeholder{color:var(--c-text3);}

        /* Add btn */
        .tp-root .add-btn{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:6px;height:42px;padding:0 20px;background:var(--c-accent);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;transition:background .18s,transform .14s,box-shadow .18s;width:100%;}
        @media(min-width:480px){.tp-root .add-btn{width:auto;}}
        .tp-root .add-btn:hover:not(:disabled){background:var(--c-hover);box-shadow:0 4px 20px var(--c-accent-glow);transform:translateY(-1px);}
        .tp-root .add-btn:active:not(:disabled){transform:scale(.97);}
        .tp-root .add-btn:disabled{opacity:.6;cursor:not-allowed;}
        .tp-root .add-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transform:translateX(-100%);pointer-events:none;}
        .tp-root .add-btn:hover:not(:disabled)::after{animation:tp-shimmer .55s ease;}

        /* Card list */
        .tp-root .card-list{display:flex;flex-direction:column;gap:12px;}

        /* Inventory card */
        .tp-root .inv-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-lg);padding:clamp(14px,3vw,20px);box-shadow:var(--c-shadow-sm);position:relative;overflow:hidden;animation:tp-fadeUp .35s cubic-bezier(.22,.68,0,1.2) both;transition:border-color .22s,box-shadow .22s,transform .22s;}
        .tp-root .inv-card:hover{border-color:var(--c-border-md);box-shadow:var(--c-shadow-md);transform:translateY(-2px);}
        .tp-root .inv-card-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;}
        .tp-root .watch-icon-wrap{width:42px;height:42px;border-radius:var(--r-sm);background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s,transform .2s;}
        .tp-root .inv-card:hover .watch-icon-wrap{background:var(--c-accent-glow);transform:scale(1.1) rotate(-6deg);}
        .tp-root .watch-svg{width:22px;height:22px;color:var(--c-accent);}
        .tp-root .watch-info{flex:1;min-width:0;}
        .tp-root .watch-brand{display:block;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-accent);}
        .tp-root .watch-model{display:block;font-size:15px;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .tp-root .watch-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:3px;}
        .tp-root .watch-ref{font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(110,142,247,.10);color:var(--c-accent);border:1px solid rgba(110,142,247,.2);}
        .tp-root .watch-year{font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(91,191,163,.12);color:var(--c-accent3);border:1px solid rgba(91,191,163,.25);}
        .tp-root .watch-nick{font-size:11px;font-weight:600;color:var(--c-text2);font-style:italic;}
        .tp-root .watch-movement{display:inline-block;margin-top:3px;font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(136,120,255,.10);color:var(--c-accent2);border:1px solid rgba(136,120,255,.2);}

        /* Status pill */
        .tp-root .status-pill{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;letter-spacing:.05em;padding:3px 8px;border-radius:99px;margin-top:3px;}
        .tp-root .status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .tp-root .status-empty{background:rgba(199,107,107,.12);color:#C76B6B;}
        .tp-root .status-low{background:rgba(201,153,93,.12);color:#C9995D;}
        .tp-root .status-ok{background:rgba(110,159,122,.12);color:#6E9F7A;}
        .tp-root .status-great{background:rgba(110,142,247,.12);color:#6E8EF7;}
        .dark .tp-root .status-empty{color:#D67C7C;background:rgba(214,124,124,.12);}
        .dark .tp-root .status-low{color:#D6A86A;background:rgba(214,168,106,.12);}
        .dark .tp-root .status-ok{color:#89B89A;background:rgba(137,184,154,.12);}
        .dark .tp-root .status-great{color:#7DA2FF;background:rgba(125,162,255,.12);}

        /* Remove btn */
        .tp-root .remove-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:none;border:none;border-radius:var(--r-sm);color:var(--c-text3);cursor:pointer;flex-shrink:0;transition:background .15s,color .15s,transform .12s;}
        .tp-root .remove-btn:hover:not(:disabled){background:rgba(199,107,107,.1);color:var(--c-danger);transform:scale(1.1);}
        .tp-root .remove-btn:disabled{opacity:.4;cursor:not-allowed;}

        /* Stock displays */
        .tp-root .current-stock-display{display:flex;align-items:baseline;gap:6px;background:var(--c-elevated);border:1px solid var(--c-border);border-radius:var(--r-sm);padding:10px 14px;margin-bottom:12px;}
        .tp-root .current-num{font-size:2rem;font-weight:800;letter-spacing:-0.03em;line-height:1;transition:color .2s;}
        .tp-root .current-label{font-size:13px;color:var(--c-text2);}
        .tp-root .stock-summary{display:flex;align-items:center;background:var(--c-elevated);border:1px solid var(--c-border);border-radius:var(--r-sm);overflow:hidden;margin-bottom:12px;}
        .tp-root .summary-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 8px;gap:4px;}
        .tp-root .summary-label{font-size:.63rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);}
        .tp-root .summary-val{font-size:1.15rem;font-weight:800;letter-spacing:-0.02em;}
        .tp-root .summary-val.in{color:var(--c-ok);}
        .tp-root .summary-val.out{color:var(--c-warn);}
        .tp-root .summary-divider{width:1px;align-self:stretch;background:var(--c-border);flex-shrink:0;}

        /* Card actions */
        .tp-root .card-actions{display:flex;align-items:center;gap:10px;}
        .tp-root .restock-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:38px;background:var(--c-accent-lt);border:1.5px solid var(--c-accent);border-radius:var(--r-sm);color:var(--c-accent);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:background .15s,transform .12s,box-shadow .15s;}
        .tp-root .restock-btn:hover:not(:disabled){background:var(--c-accent);color:#fff;box-shadow:0 3px 12px var(--c-accent-glow);transform:translateY(-1px);}
        .tp-root .restock-btn:disabled{opacity:.45;cursor:not-allowed;}
        .tp-root .sales-hint{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--c-text3);background:var(--c-elevated);border:1px solid var(--c-border);border-radius:99px;padding:4px 10px;white-space:nowrap;}
        .tp-root .card-busy-overlay{position:absolute;inset:0;background:rgba(0,0,0,.04);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--c-accent);font-weight:700;animation:tp-pulse 1s infinite;border-radius:var(--r-lg);backdrop-filter:blur(1px);}

        /* Stepper */
        .tp-root .step-btn{width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:var(--c-surface);border:1.5px solid var(--c-border);border-radius:8px;color:var(--c-text2);font-size:16px;font-weight:600;cursor:pointer;transition:background .14s,border-color .14s,color .14s,transform .12s;line-height:1;}
        .tp-root .step-btn:hover:not(:disabled){background:var(--c-accent);border-color:var(--c-accent);color:#fff;transform:scale(1.15);}
        .tp-root .step-btn:active:not(:disabled){transform:scale(.88);}
        .tp-root .step-btn:disabled{opacity:.35;cursor:not-allowed;}

        /* Modal */
        .tp-root .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:tp-fadeIn .15s ease;}
        .tp-root .modal-box{background:var(--c-surface);border:1px solid var(--c-border-md);border-radius:var(--r-xl);padding:24px;width:100%;max-width:380px;box-shadow:0 16px 64px rgba(0,0,0,.2);animation:tp-modalIn .22s cubic-bezier(.22,.68,0,1.2);}
        .tp-root .modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
        .tp-root .modal-title{font-size:15px;font-weight:800;color:var(--c-text);}
        .tp-root .modal-ref{font-size:12px;color:var(--c-accent);margin:0 0 6px;font-weight:600;}
        .tp-root .modal-close{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:none;border-radius:8px;color:var(--c-text3);font-size:14px;cursor:pointer;transition:background .15s,color .15s;}
        .tp-root .modal-close:hover{background:var(--c-elevated);color:var(--c-text);}
        .tp-root .modal-sub{font-size:13px;color:var(--c-text2);margin:0 0 4px;}
        .tp-root .modal-input-row{display:flex;align-items:center;gap:8px;margin-top:8px;}
        .tp-root .modal-qty-input{text-align:center;max-width:80px;flex:1;}
        .tp-root .modal-footer{display:flex;gap:8px;margin-top:20px;}
        .tp-root .cancel-btn{height:40px;padding:0 16px;background:var(--c-elevated);border:1.5px solid var(--c-border);border-radius:var(--r-sm);color:var(--c-text2);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:background .15s,color .15s;}
        .tp-root .cancel-btn:hover{background:var(--c-border);color:var(--c-text);}

        /* Skeleton */
        .tp-root .skeleton-card{height:220px;background:linear-gradient(90deg,var(--c-elevated) 25%,var(--c-border) 50%,var(--c-elevated) 75%);background-size:400% 100%;animation:tp-sk 1.6s ease infinite;border-radius:var(--r-lg);border:1px solid var(--c-border);}

        /* Desktop table */
        .tp-root .table-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);box-shadow:var(--c-shadow-sm);overflow:hidden;}
        .tp-root .inv-table{width:100%;border-collapse:collapse;}
        .tp-root .inv-table thead tr{background:var(--c-elevated);border-bottom:1px solid var(--c-border);}
        .tp-root .inv-table th{padding:13px 16px;font-size:.67rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-text3);text-align:left;white-space:nowrap;}
        .tp-root .inv-table td{padding:13px 16px;font-size:13px;color:var(--c-text);border-bottom:1px solid var(--c-border);vertical-align:middle;}
        .tp-root .inv-table tbody tr:last-child td{border-bottom:none;}
        .tp-root .inv-table tbody tr{transition:background .15s;animation:tp-fadeIn .3s ease both;}
        .tp-root .inv-table tbody tr:hover{background:var(--c-elevated);}
        .tp-root .inv-table tbody tr:hover .watch-cell-icon{background:var(--c-accent-glow);transform:scale(1.1) rotate(-5deg);}
        .tp-root .watch-cell{display:flex;align-items:center;gap:10px;}
        .tp-root .watch-cell-icon{width:32px;height:32px;border-radius:9px;background:var(--c-accent-lt);display:flex;align-items:center;justify-content:center;color:var(--c-accent);flex-shrink:0;transition:background .18s,transform .18s;}

        /* Table meta badges */
        .tp-root .tbl-ref{display:inline-block;font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(110,142,247,.10);color:var(--c-accent);border:1px solid rgba(110,142,247,.2);}
        .tp-root .tbl-year{display:inline-block;font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(91,191,163,.12);color:var(--c-accent3);border:1px solid rgba(91,191,163,.25);}
        .tp-root .tbl-nick{font-size:12px;color:var(--c-text3);font-style:italic;margin-top:2px;display:block;}
        .tp-root .tbl-movement{display:inline-block;font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;background:rgba(136,120,255,.10);color:var(--c-accent2);border:1px solid rgba(136,120,255,.2);}

        /* Table actions */
        .tp-root .tbl-restock-btn{display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 10px;background:var(--c-accent-lt);border:1.5px solid var(--c-accent);border-radius:8px;color:var(--c-accent);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:background .14s,color .14s,transform .12s;white-space:nowrap;}
        .tp-root .tbl-restock-btn:hover:not(:disabled){background:var(--c-accent);color:#fff;transform:translateY(-1px);}
        .tp-root .tbl-restock-btn:disabled{opacity:.4;cursor:not-allowed;}
        .tp-root .tbl-remove-btn{width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:none;border:none;border-radius:8px;color:var(--c-text3);cursor:pointer;transition:background .14s,color .14s,transform .12s;}
        .tp-root .tbl-remove-btn:hover:not(:disabled){background:rgba(199,107,107,.10);color:var(--c-danger);transform:scale(1.1);}
        .tp-root .tbl-remove-btn:disabled{opacity:.35;cursor:not-allowed;}
        .tp-root .sales-source-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--c-text3);background:var(--c-elevated);border:1px solid var(--c-border);border-radius:6px;padding:3px 8px;}

        /* Empty state */
        .tp-root .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:64px 24px;color:var(--c-text3);text-align:center;}
        .tp-root .empty-state svg{opacity:.35;}
        .tp-root .empty-state p{margin:0;font-size:15px;}
        .tp-root .empty-state small{font-size:13px;}

        /* Responsive */
        .tp-root .mobile-only{display:block;}
        .tp-root .desktop-only{display:none;}
        @media(min-width:768px){.tp-root .mobile-only{display:none !important;}.tp-root .desktop-only{display:block !important;}}
        @media(max-width:359px){.tp-root .page-title{font-size:1.35rem;}.tp-root .inv-card{padding:12px;}}
        @media(hover:none){.tp-root .remove-btn{opacity:1;}}
      `}</style>

      {/* ── Restock Modal ─────────────────────────────────── */}
      {restockRow && (
        <RestockModal
          row={restockRow}
          onConfirm={confirmRestock}
          onClose={() => setRestockTarget(null)}
          busy={busyRows.has(restockRow.id)}
        />
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="page-header tp-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="page-title">Ronin's <span>Timepieces</span></h1>
        <p className="page-sub">Every brand, every reference, in stock.</p>
      </header>

      {/* ── Stat strip ─────────────────────────────────────── */}
      <div className="stat-strip tp-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="stat-card">
          <span className="stat-label">Models</span>
          <span className="stat-value">{rows.length}</span>
        </div>
        <div className="stat-card accent2">
          <span className="stat-label">Total In</span>
          <span className="stat-value">{totalIn}</span>
        </div>
        <div className="stat-card ok">
          <span className="stat-label">On Hand</span>
          <span className="stat-value">{totalCurrent}</span>
        </div>
        <div className="stat-card warn">
          <span className="stat-label">Low Stock</span>
          <span className="stat-value">{lowStock}</span>
        </div>
      </div>

      {/* ── Add form ────────────────────────────────────────── */}
      <div className="form-card tp-fade-up" style={{ animationDelay: "120ms" }}>
        <p className="form-heading">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 9v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 4h6l1 3H8L9 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M9 20h6l1-3H8l1 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          Add watch to inventory
        </p>

        {/* Row 1: Brand + Model */}
        <div className="form-row">
          <div>
            <label className="form-label">Brand</label>
            <Select value={brand} onValueChange={(v) => { setBrand(v); setModel(""); }}>
              <SelectTrigger className="form-input" style={{ height: 42 }}>
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="form-label">Model</label>
            <SearchableSelect
              value={model}
              onChange={setModel}
              options={models}
              placeholder={brand ? "Model" : "Pick brand first"}
            />
          </div>
        </div>

        {/* Row 2: Reference + Nickname + Movement + Year */}
        <div className="form-row-2">
          <div>
            <label className="form-label">Reference No. <span style={{ color: "var(--c-text3)", fontWeight: 400 }}>(opt)</span></label>
            <input
              type="text"
              className="form-input"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. 126610LN"
            />
          </div>
          <div>
            <label className="form-label">Nickname <span style={{ color: "var(--c-text3)", fontWeight: 400 }}>(opt)</span></label>
            <input
              type="text"
              className="form-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder='e.g. "Batman"'
            />
          </div>
          <div>
            <label className="form-label">Movement <span style={{ color: "var(--c-text3)", fontWeight: 400 }}>(opt)</span></label>
            <input
              type="text"
              className="form-input"
              value={movement}
              onChange={(e) => setMovement(e.target.value)}
              placeholder="e.g. Automatic"
            />
          </div>
          <div>
            <label className="form-label">Year <span style={{ color: "var(--c-text3)", fontWeight: 400 }}>(opt)</span></label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="form-input" style={{ height: 42 }}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3: Initial stock + Add btn */}
        <div className="form-row-3">
          <div>
            <label className="form-label">Initial stock</label>
            <input
              type="number"
              min="0"
              value={stockIn}
              onChange={(e) => setStockIn(e.target.value)}
              className="form-input"
            />
          </div>
          <div />
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="add-btn" onClick={addNew} disabled={adding || !brand || !model}>
              {adding ? "Adding…" : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Watch
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="card-list mobile-only">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 80}ms` }} />)}
        </div>
      )}

      {/* ── Empty ───────────────────────────────────────────── */}
      {!isLoading && rows.length === 0 && (
        <div className="empty-state tp-fade-up" style={{ animationDelay: "180ms" }}>
          <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
            <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2"/>
            <path d="M32 24v8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M23 10h18l3 8H20l3-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M23 54h18l3-8H20l3 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          <p>No inventory yet</p>
          <small>Add your first timepiece using the form above</small>
        </div>
      )}

      {/* ── Mobile card list ─────────────────────────────────── */}
      {!isLoading && rows.length > 0 && (
        <div className="card-list mobile-only">
          {rows.map((r: any, idx: number) => (
            <WatchCard
              key={r.id}
              r={r}
              idx={idx}
              onRestock={(id) => setRestockTarget(rows.find((x: any) => x.id === id) ?? null)}
              onRemove={remove}
              busy={busyRows}
            />
          ))}
        </div>
      )}

      {/* ── Desktop table ────────────────────────────────────── */}
      {!isLoading && rows.length > 0 && (
        <div className="table-card desktop-only tp-fade-up" style={{ animationDelay: "180ms" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="inv-table" aria-label="Timepieces inventory">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Reference</th>
                  <th>Year</th>
                  <th>Movement</th>
                  <th>Status</th>
                  <th>Stocked</th>
                  <th>Sold</th>
                  <th>On Hand</th>
                  <th>Actions</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, idx: number) => {
                  const current = r.stock_in - r.stock_out;
                  const { label, cls, dot } = getStatusConfig(current);
                  const isBusy = busyRows.has(r.id);
                  return (
                    <tr key={r.id} style={{ animationDelay: `${idx * 40}ms`, opacity: isBusy ? 0.65 : 1 }}>
                      <td>
                        <div className="watch-cell">
                          <div className="watch-cell-icon">
                            <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M12 9v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M9 4h6l1 3H8L9 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              <path d="M9 20h6l1-3H8l1 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span style={{ fontWeight: 700, color: "var(--c-accent)", fontSize: 13, textTransform: "uppercase", letterSpacing: ".05em" }}>
                            {r.brand}
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <span style={{ display: "block", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.model}
                        </span>
                        {r.nickname && <span className="tbl-nick">"{r.nickname}"</span>}
                      </td>
                      <td>
                        {r.reference
                          ? <span className="tbl-ref">{r.reference}</span>
                          : <span style={{ color: "var(--c-text3)" }}>—</span>}
                      </td>
                      <td>
                        {r.year
                          ? <span className="tbl-year">{r.year}</span>
                          : <span style={{ color: "var(--c-text3)" }}>—</span>}
                      </td>
                      <td>
                        {r.movement
                          ? <span className="tbl-movement">{r.movement}</span>
                          : <span style={{ color: "var(--c-text3)" }}>—</span>}
                      </td>
                      <td>
                        <span className={`status-pill ${cls}`}>
                          <span className="status-dot" style={{ background: dot }} />
                          {label}
                        </span>
                      </td>
                      <td><span style={{ fontWeight: 700, color: "var(--c-ok)" }}>{r.stock_in}</span></td>
                      <td><span style={{ fontWeight: 700, color: "var(--c-warn)" }}>{r.stock_out}</span></td>
                      <td>
                        <span style={{ fontSize: 15, fontWeight: 800, color: current <= 0 ? "var(--c-danger)" : current <= 5 ? "var(--c-warn)" : "var(--c-accent)" }}>
                          {current}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button className="tbl-restock-btn" onClick={() => setRestockTarget(r)} disabled={isBusy}>
                            + Restock
                          </button>
                          <span className="sales-source-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="11" height="11">
                              <path d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                            </svg>
                            Via Sales
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="tbl-remove-btn" onClick={() => remove(r.id)} disabled={isBusy}
                          aria-label={`Remove ${r.brand} ${r.model}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}