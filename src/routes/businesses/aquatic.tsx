import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { SearchableSelect } from "@/components/SearchableSelect";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/providers";
import { FISH_TYPES } from "@/lib/constants";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useRole } from '@/hooks/use-role'

export default function AquaticPage() {
  const { isLimited, loading } = useRole()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isLimited) {
      navigate({ to: '/dashboard' })
    }
  }, [isLimited, loading])

  if (loading) return null

  return (
    <div>
      {/* your existing content */}
    </div>
  )
}

export const Route = createFileRoute("/businesses/aquatic")({
  head: () => ({ meta: [{ title: "Aquatic Inventory — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <AquaticInventoryPage />
    </AppShell>
  ),
});

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface InventoryRow {
  id: string;
  fish_type: string;
  stock_in: number;
  stock_out: number; // derived from aquatic_sales sum
  created_at: string;
  updated_at: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getStatusConfig(current: number) {
  if (current <= 0)  return { label: "Out of Stock", cls: "status-empty", dot: "#C76B6B" };
  if (current <= 5)  return { label: "Low Stock",    cls: "status-low",   dot: "#C9995D" };
  if (current <= 20) return { label: "In Stock",     cls: "status-ok",    dot: "#6E9F7A" };
  return               { label: "Well Stocked",  cls: "status-great", dot: "#6E8EF7" };
}

/* ─── Restock Modal ──────────────────────────────────────────────────────── */
function RestockModal({
  row,
  onConfirm,
  onClose,
  busy,
}: {
  row: InventoryRow;
  onConfirm: (qty: number) => void;
  onClose: () => void;
  busy: boolean;
}) {
  const [qty, setQty] = useState(1);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Restock — {row.fish_type}</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="modal-sub">Current available: <strong>{row.stock_in - row.stock_out}</strong></p>
        <label className="form-label" style={{ marginTop: 12, display: "block" }}>Quantity to add</label>
        <div className="modal-input-row">
          <button className="step-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="form-input modal-qty-input"
          />
          <button className="step-btn" onClick={() => setQty((q) => q + 1)}>+</button>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="add-btn"
            style={{ flex: 1 }}
            onClick={() => onConfirm(qty)}
            disabled={busy}
          >
            {busy ? "Saving…" : `+ Add ${qty} fish`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Inventory Card (mobile) ────────────────────────────────────────────── */
function InventoryCard({
  row,
  idx,
  onRestock,
  onRemove,
  busy,
}: {
  row: InventoryRow;
  idx: number;
  onRestock: (id: string) => void;
  onRemove: (id: string) => void;
  busy: Set<string>;
}) {
  const current = row.stock_in - row.stock_out;
  const { label, cls, dot } = getStatusConfig(current);
  const isBusy = busy.has(row.id);

  return (
    <div className="inv-card" style={{ animationDelay: `${idx * 60}ms` }}>
      <div className="inv-card-header">
        <div className="fish-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" className="fish-svg" aria-hidden="true">
            <path d="M2 12C2 12 6 7 12 7C14.5 7 16.5 8 18 9.5L22 7L20 12L22 17L18 14.5C16.5 16 14.5 17 12 17C6 17 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="14" cy="11" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div className="fish-info">
          <span className="fish-name">{row.fish_type}</span>
          <span className={`status-pill ${cls}`}>
            <span className="status-dot" style={{ background: dot }} />
            {label}
          </span>
        </div>
        <button
          className="remove-btn"
          onClick={() => onRemove(row.id)}
          disabled={isBusy}
          aria-label={`Remove ${row.fish_type}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16" aria-hidden="true">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>

      {/* Available stock — big display */}
      <div className="current-stock-display">
        <span className="current-num" style={{ color: current <= 0 ? "#C76B6B" : current <= 5 ? "#C9995D" : "var(--c-accent)" }}>
          {current}
        </span>
        <span className="current-label">available</span>
      </div>

      {/* Stock in / out summary */}
      <div className="stock-summary">
        <div className="summary-item">
          <span className="summary-label">Total Stocked</span>
          <span className="summary-val in">{row.stock_in}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Total Sold</span>
          <span className="summary-val out">{row.stock_out}</span>
        </div>
      </div>

      {/* Action buttons — Restock only; selling is done via Sales page */}
      <div className="card-actions">
        <button
          className="restock-btn"
          onClick={() => onRestock(row.id)}
          disabled={isBusy}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Restock
        </button>
        <div className="sales-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" aria-hidden="true">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7H19M9 21a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm10 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>
          </svg>
          Sales tracked via Sales page
        </div>
      </div>

      {isBusy && <div className="card-busy-overlay" aria-live="polite">Saving…</div>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
function AquaticInventoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [fishType, setFishType] = useState("");
  const [stockIn, setStockIn] = useState("0");
  const [adding, setAdding] = useState(false);
  const [busyRows, setBusyRows] = useState<Set<string>>(new Set());
  const [restockTarget, setRestockTarget] = useState<InventoryRow | null>(null);

  const { data: rows = [], isLoading } = useQuery<InventoryRow[]>({
    queryKey: ["aquatic-inv", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Fetch inventory and sales in parallel
      const [invRes, salesRes] = await Promise.all([
        supabase
          .from("aquatic_inventory")
          .select("*")
          .eq("user_id", user!.id)
          .order("fish_type"),
        supabase
          .from("aquatic_sales")
          .select("fish_type, quantity")
          .eq("user_id", user!.id),
      ]);

      // Sum sold quantities per fish type from actual sales records
      const soldMap: Record<string, number> = {};
      for (const s of salesRes.data ?? []) {
        soldMap[s.fish_type] = (soldMap[s.fish_type] ?? 0) + Number(s.quantity);
      }

      // Override stock_out with the real sales-derived total
      return (invRes.data ?? []).map((row) => ({
        ...row,
        stock_out: soldMap[row.fish_type] ?? 0,
      }));
    },
  });

  // Invalidate both queries so inventory always reflects latest sales
  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["aquatic-inv"] });
    qc.invalidateQueries({ queryKey: ["aquatic-sales"] });
  }, [qc]);

  /* ── Add new fish ── */
  const addNew = async () => {
    if (!fishType) return toast.error("Please select a fish type");
    if (!user) return toast.error("Not authenticated");
    setAdding(true);
    const initialStock = Math.max(0, parseInt(stockIn, 10) || 0);
    const { error } = await supabase.from("aquatic_inventory").insert({
      user_id:   user.id,
      fish_type: fishType,
      stock_in:  initialStock,
      stock_out: 0,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setFishType("");
    setStockIn("0");
    invalidate();
    toast.success(`${fishType} added — ${initialStock} fish stocked`);
  };

  /* ── Restock: increase stock_in only ── */
  const confirmRestock = async (qty: number) => {
    if (!restockTarget) return;
    const { id, stock_in, fish_type } = restockTarget;
    setBusyRows((s) => new Set(s).add(id));
    const { error } = await supabase
      .from("aquatic_inventory")
      .update({ stock_in: stock_in + qty, updated_at: new Date().toISOString() })
      .eq("id", id);
    setBusyRows((s) => { const n = new Set(s); n.delete(id); return n; });
    if (error) return toast.error(error.message);
    setRestockTarget(null);
    invalidate();
    toast.success(`Restocked ${qty} × ${fish_type} — new total: ${stock_in + qty}`);
  };

  /* ── Remove ── */
  const remove = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setBusyRows((s) => new Set(s).add(id));
    const { error } = await supabase.from("aquatic_inventory").delete().eq("id", id);
    setBusyRows((s) => { const n = new Set(s); n.delete(id); return n; });
    if (error) return toast.error(error.message);
    invalidate();
    toast.success(`${row.fish_type} removed`);
  };

  const totalFish  = rows.reduce((a, r) => a + r.stock_in, 0);
  const totalSold  = rows.reduce((a, r) => a + r.stock_out, 0);
  const totalAvail = totalFish - totalSold;
  const lowStock   = rows.filter((r) => r.stock_in - r.stock_out <= 5).length;

  /* ── Row used in modal (always fresh from query data) ── */
  const restockRow = restockTarget ? rows.find((r) => r.id === restockTarget.id) ?? restockTarget : null;

  return (
    <div className="aq2-root">

      {/* ── Styles ─────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Tokens — Cinematic Anime Palette ── */
        .aq2-root {
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
        .dark .aq2-root {
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

        .aq2-root * { box-sizing: border-box; }
        .aq2-root { padding: clamp(12px,3vw,28px); min-height: 100vh; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.45; } }
        @keyframes sk      { from { background-position:-200% 0; } to { background-position:200% 0; } }
        @keyframes modalIn { from { opacity:0; transform:scale(.94) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .fade-up { animation: fadeUp .38s cubic-bezier(.22,.68,0,1.2) both; }

        /* ── Page Header ── */
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: clamp(1.6rem,4.5vw,2.6rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--c-text); margin: 0 0 4px; }
        .page-title span { color: var(--c-accent); }
        .page-sub { font-size: clamp(0.8rem,2vw,0.95rem); color: var(--c-text2); margin: 0; }

        /* ── Stat strip ── */
        .stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap: 10px; margin-bottom: 20px; }
        .stat-card {
          background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-md);
          padding: 14px 16px; box-shadow: var(--c-shadow-sm); position: relative; overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: var(--c-shadow-md); border-color: var(--c-border-md); }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--c-accent); border-radius:99px 99px 0 0; }
        .stat-card.accent2::before { background: var(--c-accent2); }
        .stat-card.ok::before      { background: var(--c-ok); }
        .stat-card.warn::before    { background: var(--c-warn); }
        .stat-label { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--c-text3); display:block; margin-bottom:6px; }
        .stat-value { font-size:clamp(1.4rem,3vw,2rem); font-weight:800; color:var(--c-text); letter-spacing:-0.02em; line-height:1; }

        /* ── Form card ── */
        .form-card {
          background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-xl);
          padding: clamp(16px,3vw,24px); box-shadow: var(--c-shadow-sm); margin-bottom: 20px;
          transition: border-color .25s, box-shadow .25s;
        }
        .form-card:focus-within { border-color: var(--c-border-md); box-shadow: var(--c-shadow-md); }
        .form-heading { font-size:.82rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--c-text3); margin:0 0 16px; }
        .form-grid { display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width: 480px) { .form-grid { grid-template-columns: 2fr 1fr auto; align-items: end; } }
        .form-label { font-size:.72rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--c-text2); display:block; margin-bottom:6px; }
        .form-input {
          width:100%; height:42px; padding:0 12px;
          background:var(--c-elevated); border:1.5px solid var(--c-border);
          border-radius:var(--r-sm); color:var(--c-text); font-size:14px; font-family:inherit;
          outline:none; transition:border-color .18s, box-shadow .18s;
        }
        .form-input:hover { border-color: var(--c-border-md); }
        .form-input:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }

        /* ── Add button ── */
        .add-btn {
          position:relative; overflow:hidden;
          display:flex; align-items:center; justify-content:center; gap:6px;
          height:42px; padding:0 20px;
          background:var(--c-accent); color:#fff; border:none;
          border-radius:var(--r-sm); font-size:14px; font-weight:700; font-family:inherit;
          cursor:pointer; white-space:nowrap;
          transition:background .18s, transform .14s, box-shadow .18s;
          width:100%;
        }
        @media (min-width: 480px) { .add-btn { width: auto; } }
        .add-btn:hover:not(:disabled) { background:var(--c-hover); box-shadow:0 4px 20px var(--c-accent-glow); transform:translateY(-1px); }
        .add-btn:active:not(:disabled) { transform:scale(.97); box-shadow:none; }
        .add-btn:disabled { opacity:.6; cursor:not-allowed; }
        .add-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent); transform:translateX(-100%); pointer-events:none; }
        .add-btn:hover:not(:disabled)::after { animation:shimmer .55s ease; }

        /* ── Card list ── */
        .card-list { display:flex; flex-direction:column; gap:12px; }

        /* ── Inventory card ── */
        .inv-card {
          background:var(--c-surface); border:1px solid var(--c-border); border-radius:var(--r-lg);
          padding:clamp(14px,3vw,20px); box-shadow:var(--c-shadow-sm);
          position:relative; overflow:hidden;
          animation:fadeUp .35s cubic-bezier(.22,.68,0,1.2) both;
          transition:border-color .22s, box-shadow .22s, transform .22s;
        }
        .inv-card:hover { border-color:var(--c-border-md); box-shadow:var(--c-shadow-md); transform:translateY(-2px); }
        .inv-card-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .fish-icon-wrap { width:38px; height:38px; border-radius:var(--r-sm); background:var(--c-accent-lt); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .2s, transform .2s; }
        .inv-card:hover .fish-icon-wrap { background:var(--c-accent-glow); transform:scale(1.1) rotate(-6deg); }
        .fish-svg { width:20px; height:20px; color:var(--c-accent); }
        .fish-info { flex:1; min-width:0; }
        .fish-name { display:block; font-size:15px; font-weight:700; color:var(--c-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* ── Status pill ── */
        .status-pill { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; letter-spacing:.05em; padding:3px 8px; border-radius:99px; margin-top:3px; }
        .status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .status-empty { background:rgba(199,107,107,.12); color:#C76B6B; }
        .status-low   { background:rgba(201,153, 93,.12); color:#C9995D; }
        .status-ok    { background:rgba(110,159,122,.12); color:#6E9F7A; }
        .status-great { background:rgba(110,142,247,.12); color:#6E8EF7; }
        .dark .status-empty { color:#D67C7C; background:rgba(214,124,124,.12); }
        .dark .status-low   { color:#D6A86A; background:rgba(214,168,106,.12); }
        .dark .status-ok    { color:#89B89A; background:rgba(137,184,154,.12); }
        .dark .status-great { color:#7DA2FF; background:rgba(125,162,255,.12); }

        /* ── Remove button ── */
        .remove-btn { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:none; border:none; border-radius:var(--r-sm); color:var(--c-text3); cursor:pointer; flex-shrink:0; transition:background .15s, color .15s, transform .12s; }
        .remove-btn:hover:not(:disabled) { background:rgba(199,107,107,.1); color:var(--c-danger); transform:scale(1.1); }
        .remove-btn:disabled { opacity:.4; cursor:not-allowed; }

        /* ── Available display ── */
        .current-stock-display { display:flex; align-items:baseline; gap:6px; background:var(--c-elevated); border:1px solid var(--c-border); border-radius:var(--r-sm); padding:10px 14px; margin-bottom:12px; }
        .current-num { font-size:2rem; font-weight:800; letter-spacing:-0.03em; line-height:1; transition:color .2s; }
        .current-label { font-size:13px; color:var(--c-text2); }

        /* ── Stock in/out summary row ── */
        .stock-summary { display:flex; align-items:center; background:var(--c-elevated); border:1px solid var(--c-border); border-radius:var(--r-sm); overflow:hidden; margin-bottom:12px; }
        .summary-item { flex:1; display:flex; flex-direction:column; align-items:center; padding:10px 8px; gap:4px; }
        .summary-label { font-size:.63rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--c-text3); }
        .summary-val { font-size:1.15rem; font-weight:800; letter-spacing:-0.02em; }
        .summary-val.in  { color:var(--c-ok); }
        .summary-val.out { color:var(--c-warn); }
        .summary-divider { width:1px; align-self:stretch; background:var(--c-border); flex-shrink:0; }

        /* ── Card action buttons ── */
        .card-actions { display:flex; align-items:center; gap:10px; }
        .restock-btn {
          flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
          height:38px; background:var(--c-accent-lt); border:1.5px solid var(--c-accent);
          border-radius:var(--r-sm); color:var(--c-accent); font-size:13px; font-weight:700; font-family:inherit;
          cursor:pointer; transition:background .15s, transform .12s, box-shadow .15s;
        }
        .restock-btn:hover:not(:disabled) { background:var(--c-accent); color:#fff; box-shadow:0 3px 12px var(--c-accent-glow); transform:translateY(-1px); }
        .restock-btn:disabled { opacity:.45; cursor:not-allowed; }

        /* ── Sales hint ── */
        .sales-hint {
          display:inline-flex; align-items:center; gap:5px;
          font-size:11px; font-weight:600; color:var(--c-text3);
          background:var(--c-elevated); border:1px solid var(--c-border);
          border-radius:99px; padding:4px 10px;
          white-space:nowrap;
        }

        /* ── Busy overlay ── */
        .card-busy-overlay { position:absolute; inset:0; background:rgba(0,0,0,.04); display:flex; align-items:center; justify-content:center; font-size:12px; color:var(--c-accent); font-weight:700; animation:pulse 1s infinite; border-radius:var(--r-lg); backdrop-filter:blur(1px); }

        /* ── Stepper ── */
        .step-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:var(--c-surface); border:1.5px solid var(--c-border); border-radius:8px; color:var(--c-text2); font-size:16px; font-weight:600; cursor:pointer; transition:background .14s, border-color .14s, color .14s, transform .12s; line-height:1; }
        .step-btn:hover:not(:disabled) { background:var(--c-accent); border-color:var(--c-accent); color:#fff; transform:scale(1.15); }
        .step-btn:active:not(:disabled) { transform:scale(.88); }
        .step-btn:disabled { opacity:.35; cursor:not-allowed; }

        /* ── Modal ── */
        .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .15s ease; }
        .modal-box { background:var(--c-surface); border:1px solid var(--c-border-md); border-radius:var(--r-xl); padding:24px; width:100%; max-width:360px; box-shadow:0 16px 64px rgba(0,0,0,.2); animation:modalIn .22s cubic-bezier(.22,.68,0,1.2); }
        .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .modal-title { font-size:16px; font-weight:800; color:var(--c-text); }
        .modal-close { width:28px; height:28px; display:flex; align-items:center; justify-content:center; background:none; border:none; border-radius:8px; color:var(--c-text3); font-size:14px; cursor:pointer; transition:background .15s, color .15s; }
        .modal-close:hover { background:var(--c-elevated); color:var(--c-text); }
        .modal-sub { font-size:13px; color:var(--c-text2); margin:0 0 4px; }
        .modal-input-row { display:flex; align-items:center; gap:8px; margin-top:8px; }
        .modal-qty-input { text-align:center; max-width:80px; flex:1; }
        .modal-footer { display:flex; gap:8px; margin-top:20px; }
        .cancel-btn { height:40px; padding:0 16px; background:var(--c-elevated); border:1.5px solid var(--c-border); border-radius:var(--r-sm); color:var(--c-text2); font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:background .15s, color .15s; }
        .cancel-btn:hover { background:var(--c-border); color:var(--c-text); }

        /* ── Empty / Loading ── */
        .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:64px 24px; color:var(--c-text3); text-align:center; }
        .empty-state svg { opacity:.35; }
        .empty-state p { margin:0; font-size:15px; }
        .empty-state small { font-size:13px; }
        .skeleton-card { height:200px; background:linear-gradient(90deg,var(--c-elevated) 25%,var(--c-border) 50%,var(--c-elevated) 75%); background-size:400% 100%; animation:sk 1.6s ease infinite; border-radius:var(--r-lg); border:1px solid var(--c-border); }

        /* ── Desktop table ── */
        .table-card { background:var(--c-surface); border:1px solid var(--c-border); border-radius:var(--r-xl); box-shadow:var(--c-shadow-sm); overflow:hidden; }
        .inv-table { width:100%; border-collapse:collapse; }
        .inv-table thead tr { background:var(--c-elevated); border-bottom:1px solid var(--c-border); }
        .inv-table th { padding:13px 18px; font-size:.67rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--c-text3); text-align:left; white-space:nowrap; }
        .inv-table td { padding:14px 18px; font-size:14px; color:var(--c-text); border-bottom:1px solid var(--c-border); vertical-align:middle; }
        .inv-table tbody tr:last-child td { border-bottom:none; }
        .inv-table tbody tr { transition:background .15s; animation:fadeIn .3s ease both; }
        .inv-table tbody tr:hover { background:var(--c-elevated); }
        .inv-table tbody tr:hover .fish-cell-icon { background:var(--c-accent-glow); transform:scale(1.1) rotate(-5deg); }
        .fish-cell { display:flex; align-items:center; gap:10px; }
        .fish-cell-icon { width:32px; height:32px; border-radius:9px; background:var(--c-accent-lt); display:flex; align-items:center; justify-content:center; color:var(--c-accent); flex-shrink:0; transition:background .18s, transform .18s; }

        /* ── Table action buttons ── */
        .tbl-restock-btn { display:inline-flex; align-items:center; gap:4px; height:30px; padding:0 10px; background:var(--c-accent-lt); border:1.5px solid var(--c-accent); border-radius:8px; color:var(--c-accent); font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; transition:background .14s, color .14s, transform .12s; white-space:nowrap; }
        .tbl-restock-btn:hover:not(:disabled) { background:var(--c-accent); color:#fff; transform:translateY(-1px); }
        .tbl-restock-btn:disabled { opacity:.4; cursor:not-allowed; }
        .tbl-remove-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:none; border:none; border-radius:8px; color:var(--c-text3); cursor:pointer; transition:background .14px, color .14s, transform .12s; }
        .tbl-remove-btn:hover:not(:disabled) { background:rgba(199,107,107,.10); color:var(--c-danger); transform:scale(1.1); }
        .tbl-remove-btn:disabled { opacity:.35; cursor:not-allowed; }

        /* ── Sales source badge (table) ── */
        .sales-source-badge {
          display:inline-flex; align-items:center; gap:4px;
          font-size:11px; font-weight:600; color:var(--c-text3);
          background:var(--c-elevated); border:1px solid var(--c-border);
          border-radius:6px; padding:3px 8px;
        }

        /* ── Responsive ── */
        .mobile-only  { display:block; }
        .desktop-only { display:none; }
        @media (min-width: 768px) { .mobile-only { display:none !important; } .desktop-only { display:block !important; } }
        @media (max-width: 359px) { .page-title { font-size:1.35rem; } .inv-card { padding:12px; } }
        @media (hover: none) { .remove-btn { opacity:1; } }
      `}</style>

      {/* ── Restock Modal ───────────────────────────────────────────────── */}
      {restockRow && (
        <RestockModal
          row={restockRow}
          onConfirm={confirmRestock}
          onClose={() => setRestockTarget(null)}
          busy={busyRows.has(restockRow.id)}
        />
      )}

      {/* ── Page Header ─────────────────────────────────────── */}
      <header className="page-header fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="page-title">Ronin's <span>Aquatic</span></h1>
        <p className="page-sub">Live inventory — every breed, every count.</p>
      </header>

      {/* ── Stat strip ─────────────────────────────────────── */}
      <div className="stat-strip fade-up" style={{ animationDelay: "60ms" }}>
        <div className="stat-card">
          <span className="stat-label">Species</span>
          <span className="stat-value">{rows.length}</span>
        </div>
        <div className="stat-card accent2">
          <span className="stat-label">Total In</span>
          <span className="stat-value">{totalFish}</span>
        </div>
        <div className="stat-card ok">
          <span className="stat-label">Available</span>
          <span className="stat-value">{totalAvail}</span>
        </div>
        <div className="stat-card warn">
          <span className="stat-label">Low Stock</span>
          <span className="stat-value">{lowStock}</span>
        </div>
      </div>

      {/* ── Add form ────────────────────────────────────────── */}
      <div className="form-card fade-up" style={{ animationDelay: "120ms" }}>
        <p className="form-heading">Add new fish</p>
        <div className="form-grid">
          <div>
            <label className="form-label">Fish type</label>
            <SearchableSelect value={fishType} onChange={setFishType} options={FISH_TYPES} />
          </div>
          <div>
            <label className="form-label" htmlFor="stock-in-input">Initial stock</label>
            <input
              id="stock-in-input"
              type="number"
              min="0"
              value={stockIn}
              onChange={(e) => setStockIn(e.target.value)}
              className="form-input"
            />
          </div>
          <button className="add-btn" onClick={addNew} disabled={adding || !fishType}>
            {adding ? "Adding…" : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add Fish
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="card-list mobile-only">
          {[0,1,2].map((i) => <div key={i} className="skeleton-card" style={{ animationDelay:`${i*80}ms` }} />)}
        </div>
      )}

      {/* ── Empty ───────────────────────────────────────────── */}
      {!isLoading && rows.length === 0 && (
        <div className="empty-state fade-up" style={{ animationDelay: "180ms" }}>
          <svg viewBox="0 0 64 64" fill="none" width="64" height="64" aria-hidden="true">
            <path d="M8 32C8 32 18 16 32 16C38 16 43 18.5 47 22L58 16L54 32L58 48L47 41.5C43 45.5 38 48 32 48C18 48 8 32 8 32Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="38" cy="28" r="2.5" fill="currentColor"/>
          </svg>
          <p>No inventory yet</p>
          <small>Add your first fish using the form above</small>
        </div>
      )}

      {/* ── Mobile card list ─────────────────────────────────── */}
      {!isLoading && rows.length > 0 && (
        <div className="card-list mobile-only">
          {rows.map((row, idx) => (
            <InventoryCard
              key={row.id}
              row={row}
              idx={idx}
              onRestock={(id) => setRestockTarget(rows.find((r) => r.id === id) ?? null)}
              onRemove={(id) => remove(id)}
              busy={busyRows}
            />
          ))}
        </div>
      )}

      {/* ── Desktop table ────────────────────────────────────── */}
      {!isLoading && rows.length > 0 && (
        <div className="table-card desktop-only fade-up" style={{ animationDelay: "180ms" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="inv-table" aria-label="Aquatic inventory">
              <thead>
                <tr>
                  <th style={{ width: 220 }}>Fish type</th>
                  <th>Status</th>
                  <th>Total Stocked</th>
                  <th>Total Sold</th>
                  <th>Available</th>
                  <th>Actions</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const current = row.stock_in - row.stock_out;
                  const { label, cls, dot } = getStatusConfig(current);
                  const isBusy = busyRows.has(row.id);
                  return (
                    <tr key={row.id} style={{ animationDelay:`${idx * 40}ms`, opacity: isBusy ? .65 : 1 }}>
                      <td>
                        <div className="fish-cell">
                          <div className="fish-cell-icon">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true">
                              <path d="M2 12C2 12 6 7 12 7C14.5 7 16.5 8 18 9.5L22 7L20 12L22 17L18 14.5C16.5 16 14.5 17 12 17C6 17 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                              <circle cx="14" cy="11" r="1" fill="currentColor"/>
                            </svg>
                          </div>
                          <span style={{ fontWeight: 600 }}>{row.fish_type}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${cls}`}>
                          <span className="status-dot" style={{ background: dot }} />
                          {label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--c-ok)" }}>{row.stock_in}</span>
                      </td>
                      <td>
                        {/* Derived from aquatic_sales — not a stored column */}
                        <span style={{ fontWeight: 700, color: "var(--c-warn)" }}>{row.stock_out}</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 15, fontWeight: 800,
                          color: current <= 0 ? "var(--c-danger)" : current <= 5 ? "var(--c-warn)" : "var(--c-accent)",
                        }}>
                          {current}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button
                            className="tbl-restock-btn"
                            onClick={() => setRestockTarget(row)}
                            disabled={isBusy}
                          >
                            + Restock
                          </button>
                          <span className="sales-source-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="11" height="11" aria-hidden="true">
                              <path d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                            </svg>
                            Via Sales page
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="tbl-remove-btn"
                          onClick={() => remove(row.id)}
                          disabled={isBusy}
                          aria-label={`Remove ${row.fish_type}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" aria-hidden="true">
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