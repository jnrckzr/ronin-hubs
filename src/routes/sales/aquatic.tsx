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
import { FISH_TYPES, PAYMENT_METHODS } from "@/lib/constants";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Trash2, Fish, Waves, Plus, AlertTriangle, PackageX } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/sales/aquatic")({
  head: () => ({ meta: [{ title: "Aquatic Sales — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <AquaticSalesPage />
    </AppShell>
  ),
});

function AquaticSalesPage() {
  const { isLimited, loading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLimited) {
      navigate({ to: "/dashboard" });
    }
  }, [isLimited, loading, navigate]);

  if (loading) return null;
  if (isLimited) return null;

  return <Page />;
}

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
      background:rgba(110,142,247,0.18);
      animation:aq-ripple 0.6s ease-out forwards;
    `;
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(rpl);
    setTimeout(() => rpl.remove(), 650);
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
function Page() {
  const { user }   = useAuth();
  const { format } = useCurrency();
  const qc         = useQueryClient();
  const ripple     = useRipple();

  // ── Fetch inventory with derived stock_out from sales ──────────────────────
  const { data: inventoryMap = {} } = useQuery<Record<string, number>>({
    queryKey: ["aquatic-inv-stock", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [invRes, salesRes] = await Promise.all([
        supabase
          .from("aquatic_inventory")
          .select("fish_type, stock_in")
          .eq("user_id", user!.id),
        supabase
          .from("aquatic_sales")
          .select("fish_type, quantity")
          .eq("user_id", user!.id),
      ]);

      const soldMap: Record<string, number> = {};
      for (const s of salesRes.data ?? []) {
        soldMap[s.fish_type] = (soldMap[s.fish_type] ?? 0) + Number(s.quantity);
      }

      const available: Record<string, number> = {};
      for (const row of invRes.data ?? []) {
        available[row.fish_type] = Number(row.stock_in) - (soldMap[row.fish_type] ?? 0);
      }
      return available;
    },
  });

  // ── Fish type options (inventory first, then constants) ────────────────────
  const { data: fishOptions = [] } = useQuery<string[]>({
    queryKey: ["aquatic-inv-types", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("aquatic_inventory")
        .select("fish_type")
        .eq("user_id", user!.id);
      const fromInv = (data ?? []).map((d: any) => d.fish_type);
      return Array.from(new Set([...fromInv, ...FISH_TYPES])).sort();
    },
  });

  const { data: rows, isLoading } = useQuery({
    queryKey: ["aquatic-sales", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("aquatic_sales")
        .select("*")
        .eq("user_id", user!.id)
        .order("sale_date", { ascending: false });
      return data ?? [];
    },
  });

  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [type,   setType]   = useState("");
  const [qty,    setQty]    = useState("1");
  const [price,  setPrice]  = useState("");
  const [buyer,  setBuyer]  = useState("");
  const [pay,    setPay]    = useState("Cash");
  const [adding, setAdding] = useState(false);

  // ── Derived stock info for selected fish ───────────────────────────────────
  const availableStock = type ? (inventoryMap[type] ?? null) : null;
  const qtyNum = Math.max(1, parseInt(qty) || 1);

  const stockStatus = useMemo(() => {
    if (availableStock === null)  return "untracked";
    if (availableStock <= 0)      return "out";
    if (qtyNum > availableStock)  return "over";
    if (qtyNum === availableStock) return "exact";
    return "ok";
  }, [availableStock, qtyNum]);

  const canSubmit = stockStatus !== "out" && !adding && type && qty && price;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    ripple(e);
    if (!type || !qty || !price || !user) {
      toast.error("Fill required fields");
      return;
    }

    if (stockStatus === "out") {
      toast.error(`No stock available for ${type}`);
      return;
    }

    if (stockStatus === "over") {
      const cap = availableStock!;
      toast.warning(
        `Only ${cap} ${type} in stock — sale recorded for ${cap} instead of ${qtyNum}`
      );
      setAdding(true);
      const { error } = await supabase.from("aquatic_sales").insert({
        user_id:        user.id,
        sale_date:      date,
        fish_type:      type,
        quantity:       cap,
        unit_price:     Number(price),
        total_revenue:  cap * Number(price),
        buyer_name:     buyer || null,
        payment_method: pay,
      });
      setAdding(false);
      if (error) {
        toast.error(error.message);
        return;                     // ✅ Fix 1 — was: return toast.error(error.message)
      }
      setType(""); setQty("1"); setPrice(""); setBuyer("");
      invalidate();
      return;
    }

    setAdding(true);
    const { error } = await supabase.from("aquatic_sales").insert({
      user_id:        user.id,
      sale_date:      date,
      fish_type:      type,
      quantity:       qtyNum,
      unit_price:     Number(price),
      total_revenue:  qtyNum * Number(price),
      buyer_name:     buyer || null,
      payment_method: pay,
    });
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;                       // ✅ Fix 2 — was: return toast.error(error.message)
    }
    setType(""); setQty("1"); setPrice(""); setBuyer("");
    toast.success("Sale recorded");
    invalidate();
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["aquatic-sales"] });
    qc.invalidateQueries({ queryKey: ["aquatic-inv-stock"] });
    qc.invalidateQueries({ queryKey: ["aquatic-inv"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const remove = async (id: string) => {
    if (!id) return toast.error("Invalid row ID");
    const { error } = await supabase.from("aquatic_sales").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Sale removed");
    invalidate();
    return; 
  };

  const total = (rows ?? []).reduce((s, r: any) => s + Number(r.total_revenue), 0);

  return (
    <div className="aq-root">
      <style>{`
        .aq-root {
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
          --c-ok-lt:       rgba(110,159,122,0.12);
          --c-warn:        #C9995D;
          --c-warn-lt:     rgba(201,153,93,0.12);
          --c-danger:      #C76B6B;
          --c-danger-lt:   rgba(199,107,107,0.12);
          --c-shadow-sm:   0 1px 3px rgba(28,34,48,.05), 0 4px 16px rgba(110,142,247,.07);
          --c-shadow-md:   0 2px 8px rgba(28,34,48,.07), 0 8px 32px rgba(110,142,247,.14);
          --r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 26px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .aq-root {
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
          --c-ok-lt:       rgba(137,184,154,0.12);
          --c-warn:        #D6A86A;
          --c-warn-lt:     rgba(214,168,106,0.12);
          --c-danger:      #D67C7C;
          --c-danger-lt:   rgba(214,124,124,0.12);
          --c-shadow-sm:   0 1px 3px rgba(0,0,0,.30), 0 4px 16px rgba(0,0,0,.20);
          --c-shadow-md:   0 2px 8px rgba(0,0,0,.35), 0 8px 32px rgba(0,0,0,.25);
        }

        .aq-root * { box-sizing: border-box; }
        .aq-root { padding: clamp(12px,3vw,28px); min-height: 100vh; }

        @keyframes aq-ripple  { from{transform:scale(0);opacity:1} to{transform:scale(1);opacity:0} }
        @keyframes aq-fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes aq-fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes aq-shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        @keyframes aq-rowIn   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes aq-skelMove{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes aq-shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        .aq-fade-up { animation: aq-fadeUp .38s cubic-bezier(.22,.68,0,1.2) both; }

        /* ── Header ── */
        .aq-root .page-header { margin-bottom: 24px; }
        .aq-root .page-title {
          font-size: clamp(1.6rem,4.5vw,2.6rem); font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.1; color: var(--c-text);
          margin: 0 0 4px; display: flex; align-items: center; gap: 12px;
        }
        .aq-root .page-title span { color: var(--c-accent); }
        .aq-root .page-sub { font-size: clamp(0.8rem,2vw,0.95rem); color: var(--c-text2); margin: 0; }
        .aq-root .title-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: var(--c-accent); box-shadow: 0 4px 16px var(--c-accent-glow);
        }
        .aq-root .title-icon svg { color: #fff !important; stroke: #fff !important; flex-shrink: 0; }

        /* ── Stat strip ── */
        .aq-root .stat-strip {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr));
          gap: 10px; margin-bottom: 20px;
        }
        .aq-root .stat-card {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: var(--r-md); padding: 14px 16px; box-shadow: var(--c-shadow-sm);
          position: relative; overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .aq-root .stat-card:hover { transform: translateY(-2px); box-shadow: var(--c-shadow-md); border-color: var(--c-border-md); }
        .aq-root .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--c-accent); border-radius:99px 99px 0 0; }
        .aq-root .stat-card.ok::before { background: var(--c-ok); }
        .aq-root .stat-label { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--c-text3); display:block; margin-bottom:6px; }
        .aq-root .stat-value { font-size:clamp(1.1rem,2.5vw,1.6rem); font-weight:800; color:var(--c-text); letter-spacing:-0.02em; line-height:1.2; word-break:break-all; }
        .aq-root .stat-value.accent { color: var(--c-accent); }

        /* ── Panel ── */
        .aq-root .panel {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: var(--r-xl); padding: clamp(16px,3vw,24px);
          box-shadow: var(--c-shadow-sm); margin-bottom: 20px;
          transition: border-color .25s, box-shadow .25s;
        }
        .aq-root .panel:focus-within { border-color: var(--c-border-md); box-shadow: var(--c-shadow-md); }
        .aq-root .panel-heading {
          font-size:.82rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          color:var(--c-text3); margin:0 0 18px; display:flex; align-items:center; gap:8px;
        }
        .aq-root .panel-heading svg { color: var(--c-accent); flex-shrink: 0; }

        /* ── Form grid ── */
        .aq-root .form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 480px) { .aq-root .form-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 900px) {
          .aq-root .form-grid { grid-template-columns: 118px 1fr 68px 148px 148px 1fr 108px; }
        }

        .aq-root .field-label {
          font-size:.72rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
          color:var(--c-text2); display:block; margin-bottom:6px; transition:color .18s;
        }
        .aq-root .form-field:focus-within .field-label { color: var(--c-accent); }

        .aq-root .form-input {
          width:100%; height:42px; padding:0 12px;
          background:var(--c-elevated); border:1.5px solid var(--c-border);
          border-radius:var(--r-sm); color:var(--c-text); font-size:14px; font-family:inherit;
          outline:none; transition:border-color .18s, box-shadow .18s;
        }
        .aq-root .form-input::placeholder { color: var(--c-text3); }
        .aq-root .form-input:hover   { border-color: var(--c-border-md); }
        .aq-root .form-input:focus   { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }
        .aq-root .form-input.input-warn  { border-color: var(--c-warn) !important; box-shadow: 0 0 0 3px var(--c-warn-lt) !important; }
        .aq-root .form-input.input-error { border-color: var(--c-danger) !important; box-shadow: 0 0 0 3px var(--c-danger-lt) !important; animation: aq-shake .3s ease; }
        .aq-root .form-input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.4); cursor:pointer; }
        .dark .aq-root .form-input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.7); }

        /* ── Select override ── */
        .aq-root .form-field [data-radix-select-trigger] {
          height:42px !important; background:var(--c-elevated) !important;
          border:1.5px solid var(--c-border) !important; border-radius:var(--r-sm) !important;
          color:var(--c-text) !important; font-family:inherit !important; font-size:14px !important;
          width:100% !important; outline:none !important; transition:border-color .18s, box-shadow .18s !important;
        }
        .aq-root .form-field [data-radix-select-trigger]:hover { border-color:var(--c-border-md) !important; }
        .aq-root .form-field [data-radix-select-trigger]:focus,
        .aq-root .form-field [data-radix-select-trigger][data-state='open'] {
          border-color:var(--c-accent) !important; box-shadow:0 0 0 3px var(--c-accent-lt) !important;
        }

        /* ── Stock badge ── */
        .aq-root .stock-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; letter-spacing: .04em;
          padding: 3px 9px; border-radius: 99px; margin-top: 6px;
          transition: all .2s ease;
        }
        .aq-root .stock-badge.ok      { background: var(--c-ok-lt);     color: var(--c-ok);     border: 1px solid rgba(110,159,122,.25); }
        .aq-root .stock-badge.warn    { background: var(--c-warn-lt);   color: var(--c-warn);   border: 1px solid rgba(201,153,93,.25); }
        .aq-root .stock-badge.danger  { background: var(--c-danger-lt); color: var(--c-danger); border: 1px solid rgba(199,107,107,.25); }
        .aq-root .stock-badge.neutral { background: var(--c-elevated);  color: var(--c-text3);  border: 1px solid var(--c-border); }

        /* ── Stock alert banner ── */
        .aq-root .stock-alert {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; border-radius: var(--r-sm); margin-top: 14px;
          font-size: 13px; font-weight: 500; line-height: 1.45;
          animation: aq-fadeUp .22s ease both;
        }
        .aq-root .stock-alert.warn   { background: var(--c-warn-lt);   color: var(--c-warn);   border: 1px solid rgba(201,153,93,.3); }
        .aq-root .stock-alert.danger { background: var(--c-danger-lt); color: var(--c-danger); border: 1px solid rgba(199,107,107,.3); }
        .aq-root .stock-alert svg    { flex-shrink: 0; margin-top: 1px; }
        .aq-root .stock-alert strong { font-weight: 800; }

        /* ── Submit button ── */
        .aq-root .submit-btn {
          position:relative; overflow:hidden;
          display:inline-flex; align-items:center; justify-content:center; gap:6px;
          height:42px; padding:0 20px; background:var(--c-accent); color:#fff; border:none;
          border-radius:var(--r-sm); font-size:14px; font-weight:700; font-family:inherit;
          cursor:pointer; width:100%; transition:background .18s, transform .14s, box-shadow .18s;
        }
        .aq-root .submit-btn.btn-warn { background: var(--c-warn); }
        .aq-root .submit-btn.btn-warn:hover:not(:disabled) { background: #b5883f; box-shadow: 0 4px 20px var(--c-warn-lt); }
        .aq-root .submit-btn.btn-danger { background: var(--c-danger); cursor: not-allowed; }
        .aq-root .submit-btn:hover:not(:disabled) { background:var(--c-hover); box-shadow:0 4px 20px var(--c-accent-glow); transform:translateY(-1px); }
        .aq-root .submit-btn:active:not(:disabled) { transform:scale(.97); box-shadow:none; }
        .aq-root .submit-btn:disabled { opacity:0.55; cursor:not-allowed; }
        .aq-root .submit-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent); transform:translateX(-100%); pointer-events:none; }
        .aq-root .submit-btn:hover:not(:disabled)::after { animation:aq-shimmer .55s ease; }

        /* ── Table card ── */
        .aq-root .table-card {
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:var(--r-xl); box-shadow:var(--c-shadow-sm); overflow:hidden;
        }
        .aq-root .sales-table { width:100%; border-collapse:collapse; min-width:720px; }
        .aq-root .sales-table thead tr { background:var(--c-elevated); border-bottom:1px solid var(--c-border); }
        .aq-root .sales-table th { padding:13px 16px; font-size:.67rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--c-text3); text-align:left; white-space:nowrap; }
        .aq-root .sales-table td { padding:13px 16px; font-size:13px; color:var(--c-text); border-bottom:1px solid var(--c-border); vertical-align:middle; white-space:nowrap; }
        .aq-root .sales-table tbody tr:last-child td { border-bottom:none; }
        .aq-root .sales-table tbody tr { position:relative; transition:background .15s; animation:aq-rowIn .32s ease both; }
        .aq-root .sales-table tbody tr::before { content:''; position:absolute; left:0; top:0; bottom:0; width:0; background:var(--c-accent); transition:width .2s ease; border-radius:0 2px 2px 0; }
        .aq-root .sales-table tbody tr:hover { background:var(--c-elevated); }
        .aq-root .sales-table tbody tr:hover::before { width:3px; }
        .aq-root .td-total { font-weight:700; color:var(--c-accent); }
        .aq-root .td-date  { color:var(--c-text2); }
        .aq-root .td-mono  { color:var(--c-text2); }

        /* ── Buyer badge ── */
        .aq-root .buyer-badge {
          display:inline-flex; align-items:center; font-size:11px; font-weight:700;
          letter-spacing:.04em; padding:3px 9px; border-radius:99px;
          background:var(--c-accent-lt); color:var(--c-accent); border:1px solid rgba(110,142,247,0.22);
          transition:background .15s, border-color .15s, box-shadow .15s; cursor:default;
        }
        .aq-root .buyer-badge:hover { background:rgba(110,142,247,0.18); border-color:var(--c-accent); box-shadow:0 0 8px var(--c-accent-glow); }

        /* ── Payment chip ── */
        .aq-root .pay-chip { display:inline-block; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:600; background:var(--c-elevated); color:var(--c-text2); border:1px solid var(--c-border); }

        /* ── Capped badge (in table) ── */
        .aq-root .capped-badge {
          display:inline-flex; align-items:center; gap:4px;
          font-size:10px; font-weight:700; padding:2px 7px; border-radius:6px;
          background:var(--c-warn-lt); color:var(--c-warn); border:1px solid rgba(201,153,93,.25);
          margin-left:6px;
        }

        /* ── Delete button ── */
        .aq-root .remove-btn {
          width:30px; height:30px; display:flex; align-items:center; justify-content:center;
          background:none; border:1px solid transparent; border-radius:var(--r-sm);
          color:var(--c-text3); cursor:pointer;
          transition:background .15s, color .15s, transform .12s, border-color .15s, box-shadow .15s;
        }
        .aq-root .remove-btn:hover { background:rgba(199,107,107,.12); color:var(--c-danger); border-color:var(--c-danger); box-shadow:0 0 10px rgba(199,107,107,.18); transform:scale(1.08); }
        .aq-root .remove-btn:active { transform:scale(.9); }

        /* ── Skeleton shimmer ── */
        .aq-root .skel { height:13px; border-radius:6px; background:linear-gradient(90deg,var(--c-elevated) 25%,var(--c-border) 50%,var(--c-elevated) 75%); background-size:200% 100%; animation:aq-skelMove 1.5s infinite; }

        /* ── Empty state ── */
        .aq-root .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:64px 24px; color:var(--c-text3); text-align:center; }
        .aq-root .empty-state svg { opacity:.35; }
        .aq-root .empty-state p { margin:0; font-size:15px; }

        /* ── Responsive ── */
        @media (max-width: 767px) and (orientation: landscape) { .aq-root .page-title { font-size:1.5rem; } .aq-root .stat-strip { grid-template-columns:repeat(2,1fr); } }
        @media (max-width: 359px) { .aq-root .page-title { font-size:1.35rem; } .aq-root .panel { padding:14px; } }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="page-header aq-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="page-title">
          <span className="title-icon">
            <Fish size={20} strokeWidth={2.2} />
          </span>
          Aquatic <span>Sales</span>
        </h1>
        <p className="page-sub">Record every fish sold — Ronin's Hub</p>
      </header>

      {/* ── Stat strip ─────────────────────────────────────── */}
      <div className="stat-strip aq-fade-up" style={{ animationDelay: "60ms" }}>
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

      {/* ── Form ───────────────────────────────────────────── */}
      <div className="panel aq-fade-up" style={{ animationDelay: "120ms" }}>
        <p className="panel-heading">
          <Waves size={16} aria-hidden="true" />
          Add Sale
        </p>

        <div className="form-grid">
          {/* Date */}
          <div className="form-field">
            <label className="field-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Fish Type — with live stock badge */}
          <div className="form-field">
            <label className="field-label">Fish Type</label>
            <SearchableSelect
              value={type}
              onChange={(v) => { setType(v); setQty("1"); }}
              options={fishOptions}
              placeholder="Search fish…"
            />
            {type && (
              availableStock === null ? (
                <span className="stock-badge neutral">Not in inventory — unlimited</span>
              ) : availableStock <= 0 ? (
                <span className="stock-badge danger">
                  <PackageX size={10} /> Out of stock
                </span>
              ) : (
                <span className={`stock-badge ${availableStock <= 5 ? "warn" : "ok"}`}>
                  {availableStock <= 5 ? <AlertTriangle size={10} /> : null}
                  {availableStock} available
                </span>
              )
            )}
          </div>

          {/* Qty */}
          <div className="form-field">
            <label className="field-label">Qty</label>
            <input
              type="number"
              min="1"
              max={availableStock !== null && availableStock > 0 ? availableStock : undefined}
              className={`form-input ${
                stockStatus === "over" ? "input-warn"  :
                stockStatus === "out"  ? "input-error" : ""
              }`}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          {/* Unit Price */}
          <div className="form-field">
            <label className="field-label">Unit Price (₱)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={price}
              placeholder="0.00"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Payment */}
          <div className="form-field">
            <label className="field-label">Payment</label>
            <Select value={pay} onValueChange={setPay}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buyer */}
          <div className="form-field">
            <label className="field-label">Buyer Name</label>
            <input
              className="form-input"
              value={buyer}
              placeholder="Optional"
              onChange={(e) => setBuyer(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              className={`submit-btn ${
                stockStatus === "out"  ? "btn-danger" :
                stockStatus === "over" ? "btn-warn"   : ""
              }`}
              onClick={submit}
              disabled={!canSubmit}
            >
              {adding ? "…" : stockStatus === "out" ? (
                <>
                  <PackageX size={14} strokeWidth={2.5} aria-hidden="true" />
                  No Stock
                </>
              ) : stockStatus === "over" ? (
                <>
                  <AlertTriangle size={14} strokeWidth={2.5} aria-hidden="true" />
                  Add {availableStock}
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Stock alert banners ── */}
        {stockStatus === "out" && type && (
          <div className="stock-alert danger">
            <PackageX size={15} />
            <div>
              <strong>{type}</strong> is completely out of stock. Restock it first from the Inventory page before recording a sale.
            </div>
          </div>
        )}
        {stockStatus === "over" && availableStock !== null && (
          <div className="stock-alert warn">
            <AlertTriangle size={15} />
            <div>
              Only <strong>{availableStock}</strong> {type} in stock but <strong>{qtyNum}</strong> requested.
              Clicking <em>Add {availableStock}</em> will record the sale for the available amount only.
            </div>
          </div>
        )}
        {stockStatus === "exact" && availableStock !== null && (
          <div className="stock-alert warn">
            <AlertTriangle size={15} />
            <div>
              This will use <strong>all remaining {availableStock}</strong> {type} — stock will reach zero after this sale.
            </div>
          </div>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="table-card aq-fade-up" style={{ animationDelay: "180ms" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="sales-table" aria-label="Aquatic sales records">
            <thead>
              <tr>
                {["Date", "Fish", "Qty", "Unit", "Total", "Buyer", "Payment", ""].map(
                  (h, i) => <th key={i}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ animationDelay: `${i * 45}ms` }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}>
                        <div
                          className="skel"
                          style={{
                            width: j === 7 ? 28 : `${55 + Math.random() * 30}%`,
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
                    <td style={{ fontWeight: 600 }}>{r.fish_type}</td>
                    <td className="td-mono">{r.quantity}</td>
                    <td className="td-mono">{format(Number(r.unit_price))}</td>
                    <td className="td-total">{format(Number(r.total_revenue))}</td>
                    <td>
                      {r.buyer_name
                        ? <span className="buyer-badge">{r.buyer_name}</span>
                        : <span style={{ color: "var(--c-text3)" }}>—</span>
                      }
                    </td>
                    <td>
                      {r.payment_method
                        ? <span className="pay-chip">{r.payment_method}</span>
                        : <span style={{ color: "var(--c-text3)" }}>—</span>
                      }
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
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Fish size={48} aria-hidden="true" />
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