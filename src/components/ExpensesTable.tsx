import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCurrency } from "@/lib/providers";
import { useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Receipt,
  TrendingDown,
  CalendarDays,
  FileText,
  Plus,
  Sparkles,
} from "lucide-react";

export function ExpensesTable({
  table,
  label,
}: {
  table: "aquatic_expenses" | "timepieces_expenses";
  label: string;
}) {
  const { user } = useAuth();
  const { format } = useCurrency();
  const qc = useQueryClient();

  const { data: rows } = useQuery({
    queryKey: [table, user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from(table)
          .select("*")
          .order("expense_date", { ascending: false })
      ).data ?? [],
  });

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const submit = async () => {
    if (!type || !amount || !user) return toast.error("Fill required fields");
    setIsAdding(true);
    const { error } = await supabase.from(table).insert({
      user_id: user.id,
      expense_date: date,
      expense_type: type,
      amount: Number(amount),
      notes: notes || null,
    });
    setIsAdding(false);
    if (error) return toast.error(error.message);
    setType("");
    setAmount("");
    setNotes("");
    toast.success("Expense added");
    qc.invalidateQueries({ queryKey: [table] });
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    await supabase.from(table).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: [table] });
    setDeletingId(null);
  };

  const total = (rows ?? []).reduce((s, r: any) => s + Number(r.amount), 0);
  const count = (rows ?? []).length;
  const average = count > 0 ? total / count : 0;

  return (
    <div className="et-root">
      <style>{`
        /* ── Tokens — Cinematic Anime Palette ── */
        .et-root {
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
        .dark .et-root {
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

        /* ── Base ── */
        .et-root * { box-sizing: border-box; }
        .et-root { padding: clamp(12px,3vw,28px); min-height: 100vh; }

        /* ── Animations ── */
        @keyframes et-fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes et-fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes et-shimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }
        @keyframes et-pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1); }
        }
        .et-fade-up { animation: et-fadeUp .38s cubic-bezier(.22,.68,0,1.2) both; }
        .et-d1 { animation: et-pulseDot 1.1s ease infinite 0s; }
        .et-d2 { animation: et-pulseDot 1.1s ease infinite 0.18s; }
        .et-d3 { animation: et-pulseDot 1.1s ease infinite 0.36s; }

        /* ── Header ── */
        .et-root .page-header { margin-bottom: 24px; }
        .et-root .page-title {
          font-size: clamp(1.6rem,4.5vw,2.6rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--c-text);
          margin: 0 0 4px;
        }
        .et-root .page-title span { color: var(--c-accent); }
        .et-root .page-sub {
          font-size: clamp(0.8rem,2vw,0.95rem);
          color: var(--c-text2);
          margin: 0;
        }

        /* ── Stat strip ── */
        .et-root .stat-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px,1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        .et-root .stat-card {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-md);
          padding: 14px 16px;
          box-shadow: var(--c-shadow-sm);
          position: relative;
          overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .et-root .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--c-shadow-md);
          border-color: var(--c-border-md);
        }
        .et-root .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--c-danger);
          border-radius: 99px 99px 0 0;
        }
        .et-root .stat-card.accent::before  { background: var(--c-accent); }
        .et-root .stat-card.accent2::before { background: var(--c-accent2); }
        .et-root .stat-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--c-text3);
          display: block;
          margin-bottom: 6px;
        }
        .et-root .stat-value {
          font-size: clamp(1.1rem,2.5vw,1.6rem);
          font-weight: 800;
          color: var(--c-text);
          letter-spacing: -0.02em;
          line-height: 1.2;
          word-break: break-all;
        }

        /* ── Panel ── */
        .et-root .panel {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-xl);
          padding: clamp(16px,3vw,24px);
          box-shadow: var(--c-shadow-sm);
          margin-bottom: 20px;
          transition: border-color .25s, box-shadow .25s;
        }
        .et-root .panel:focus-within {
          border-color: var(--c-border-md);
          box-shadow: var(--c-shadow-md);
        }
        .et-root .panel-heading {
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--c-text3);
          margin: 0 0 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .et-root .panel-heading svg { color: var(--c-accent); flex-shrink: 0; }

        /* ── Form grid ── */
        .et-root .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 480px) {
          .et-root .form-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1024px) {
          .et-root .form-grid { grid-template-columns: 1fr 1fr 1fr 2fr; }
        }
        .et-root .field-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--c-text2);
          display: block;
          margin-bottom: 6px;
        }
        .et-root .form-input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          background: var(--c-elevated);
          border: 1.5px solid var(--c-border);
          border-radius: var(--r-sm);
          color: var(--c-text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
        }
        .et-root .form-input::placeholder { color: var(--c-text3); }
        .et-root .form-input:hover   { border-color: var(--c-border-md); }
        .et-root .form-input:focus   { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }
        .et-root .form-textarea {
          width: 100%;
          min-height: 42px;
          padding: 10px 12px;
          background: var(--c-elevated);
          border: 1.5px solid var(--c-border);
          border-radius: var(--r-sm);
          color: var(--c-text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          resize: none;
          transition: border-color .18s, box-shadow .18s;
        }
        .et-root .form-textarea::placeholder { color: var(--c-text3); }
        .et-root .form-textarea:hover { border-color: var(--c-border-md); }
        .et-root .form-textarea:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }

        /* calendar picker icon */
        .et-root .form-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.4); cursor: pointer;
        }
        .dark .et-root .form-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
        }

        /* ── Submit button ── */
        .et-root .submit-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          height: 44px;
          padding: 0 24px;
          background: var(--c-accent);
          color: #fff;
          border: none;
          border-radius: var(--r-sm);
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          margin-top: 4px;
          width: 100%;
          transition: background .18s, transform .14s, box-shadow .18s;
        }
        @media (min-width: 480px) { .et-root .submit-btn { width: auto; } }
        .et-root .submit-btn:hover:not(:disabled) {
          background: var(--c-hover);
          box-shadow: 0 4px 20px var(--c-accent-glow);
          transform: translateY(-1px);
        }
        .et-root .submit-btn:active:not(:disabled) { transform: scale(.97); box-shadow: none; }
        .et-root .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .et-root .submit-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          transform: translateX(-100%);
          pointer-events: none;
        }
        .et-root .submit-btn:hover:not(:disabled)::after { animation: et-shimmer .55s ease; }

        /* ── Table card ── */
        .et-root .table-card {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-xl);
          box-shadow: var(--c-shadow-sm);
          overflow: hidden;
        }
        .et-root .exp-table { width: 100%; border-collapse: collapse; min-width: 520px; }
        .et-root .exp-table thead tr {
          background: var(--c-elevated);
          border-bottom: 1px solid var(--c-border);
        }
        .et-root .exp-table th {
          padding: 13px 16px;
          font-size: 0.67rem;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--c-text3);
          text-align: left;
          white-space: nowrap;
        }
        .et-root .exp-table td {
          padding: 13px 16px;
          font-size: 13px;
          color: var(--c-text);
          border-bottom: 1px solid var(--c-border);
          vertical-align: middle;
          white-space: nowrap;
        }
        .et-root .exp-table tbody tr:last-child td { border-bottom: none; }
        .et-root .exp-table tbody tr {
          transition: background .15s;
          animation: et-fadeIn .3s ease both;
        }
        .et-root .exp-table tbody tr:hover { background: var(--c-elevated); }

        /* ── Amount badge ── */
        .et-root .amount-badge {
          display: inline-flex; align-items: center;
          font-size: 12px; font-weight: 700;
          letter-spacing: .04em;
          padding: 3px 9px;
          border-radius: 99px;
          background: rgba(199,107,107,.12);
          color: var(--c-danger);
        }
        .dark .et-root .amount-badge {
          background: rgba(214,124,124,.12);
          color: var(--c-danger);
        }

        /* ── Delete button ── */
        .et-root .remove-btn {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none;
          border-radius: var(--r-sm);
          color: var(--c-text3);
          cursor: pointer;
          opacity: 0;
          transform: scale(0.85);
          transition: background .15s, color .15s, transform .12s, opacity .15s;
        }
        .et-root .exp-table tbody tr:hover .remove-btn {
          opacity: 1; transform: scale(1);
        }
        .et-root .remove-btn:hover {
          background: rgba(199,107,107,.12);
          color: var(--c-danger);
          transform: scale(1.1) !important;
        }
        .et-root .remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        /* always show on touch devices */
        @media (hover: none) {
          .et-root .remove-btn { opacity: 1; transform: scale(1); }
        }

        /* ── Deleting row ── */
        .et-root .row-deleting {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity .28s ease, transform .28s ease;
        }

        /* ── Empty state ── */
        .et-root .empty-state {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; padding: 64px 24px;
          color: var(--c-text3); text-align: center;
        }
        .et-root .empty-state svg { opacity: .35; }
        .et-root .empty-state p { margin: 0; font-size: 15px; }

        /* ── Loading dots ── */
        .et-dot {
          display: inline-block;
          height: 6px; width: 6px;
          border-radius: 99px;
          background: currentColor;
        }

        /* ── Responsive tweaks ── */
        @media (max-width: 767px) and (orientation: landscape) {
          .et-root .page-title { font-size: 1.5rem; }
          .et-root .stat-strip  { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 359px) {
          .et-root .page-title { font-size: 1.35rem; }
          .et-root .panel      { padding: 14px; }
        }

        /* notes col hidden on small screens */
        .et-root .col-notes { display: none; }
        @media (min-width: 640px) { .et-root .col-notes { display: table-cell; } }
        .et-root .th-notes  { display: none; }
        @media (min-width: 640px) { .et-root .th-notes { display: table-cell; } }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="page-header et-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="page-title">
          {label}
          <span> · Expenses</span>
        </h1>
        <p className="page-sub">Log every cost, track every peso.</p>
      </header>

      {/* ── Summary strip ──────────────────────────────────── */}
      <div className="stat-strip et-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="stat-card">
          <span className="stat-label">Total spent</span>
          <span className="stat-value">{format(total)}</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-label">Entries logged</span>
          <span className="stat-value">{count}</span>
        </div>
        <div className="stat-card accent2">
          <span className="stat-label">Avg per entry</span>
          <span className="stat-value">{format(average)}</span>
        </div>
      </div>

      {/* ── Add-Expense Form ────────────────────────────────── */}
      <div className="panel et-fade-up" style={{ animationDelay: "120ms" }}>
        <p className="panel-heading">
          <Plus size={16} aria-hidden="true" />
          Add Expense
        </p>

        <div className="form-grid">
          <div>
            <label className="field-label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="field-label">Expense type</label>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. Food, Strap, Rent"
              className="form-input"
            />
          </div>

          <div>
            <label className="field-label">Amount (₱)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="form-input"
            />
          </div>

          <div>
            <label className="field-label">Notes</label>
            <textarea
              rows={1}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="form-textarea"
            />
          </div>
        </div>

        <button
          className="submit-btn"
          onClick={submit}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <LoadingDots /> Adding…
            </>
          ) : (
            <>
              <Plus size={14} aria-hidden="true" />
              Add expense
            </>
          )}
        </button>
      </div>

      {/* ── Expenses Table ──────────────────────────────────── */}
      <div className="table-card et-fade-up" style={{ animationDelay: "180ms" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="exp-table" aria-label="Expense records">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th className="th-notes">Notes</th>
                <th style={{ width: 50 }} />
              </tr>
            </thead>
            <tbody>
              {rows?.map((r: any, idx: number) => (
                <tr
                  key={r.id}
                  className={deletingId === r.id ? "row-deleting" : ""}
                  style={{ animationDelay: `${idx * 35}ms` }}
                >
                  <td style={{ color: "var(--c-text2)" }}>{r.expense_date}</td>
                  <td style={{ fontWeight: 600 }}>{r.expense_type}</td>
                  <td>
                    <span className="amount-badge">
                      {format(Number(r.amount))}
                    </span>
                  </td>
                  <td className="col-notes" style={{ maxWidth: 220 }}>
                    {r.notes ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "var(--c-text2)",
                        }}
                      >
                        <FileText size={13} style={{ opacity: 0.4, flexShrink: 0 }} />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.notes}
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: "var(--c-text3)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => remove(r.id)}
                      disabled={deletingId === r.id}
                      aria-label="Delete expense"
                    >
                      {deletingId === r.id ? (
                        <LoadingDots />
                      ) : (
                        <Trash2 size={14} aria-hidden="true" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {!rows?.length && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <Receipt size={48} aria-hidden="true" />
                      <p>No expenses logged yet.</p>
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

/* ── Loading dots ─────────────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <span className="et-dot et-d1" />
      <span className="et-dot et-d2" />
      <span className="et-dot et-d3" />
    </span>
  );
}