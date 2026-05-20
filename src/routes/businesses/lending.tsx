import React, { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCurrency } from "@/lib/providers";
import { toast } from "sonner";
import { addDays, format as fmtDate } from "date-fns";

export const Route = createFileRoute("/businesses/lending")({
  head: () => ({ meta: [{ title: "Lending — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <Page />
    </AppShell>
  ),
});

/* ─── Constants ─────────────────────────────────────────────────────────── */
const TIERS = [
  { days: 5,   rate: 0.025  },
  { days: 10,  rate: 0.05   },
  { days: 15,  rate: 0.075  },
  { days: 20,  rate: 0.10   },
  { days: 25,  rate: 0.125  },
  { days: 30,  rate: 0.15   },
  { days: 40,  rate: 0.20   },
  { days: 50,  rate: 0.25   },
  { days: 60,  rate: 0.30   },
  { days: 75,  rate: 0.375  },
  { days: 90,  rate: 0.45   },
  { days: 120, rate: 0.60   },
];

function getRateForDays(days: number): number {
  if (days <= 0) return 0;
  const s = [...TIERS].sort((a, b) => a.days - b.days);
  const first = s[0];
  const last  = s[s.length - 1];
  const prev  = s[s.length - 2];

  if (!first || !last || !prev) return 0;
  if (days <= first.days) return first.rate;

  if (days >= last.days) {
    const slope = (last.rate - prev.rate) / (last.days - prev.days);
    return last.rate + slope * (days - last.days);
  }

  for (let i = 0; i < s.length - 1; i++) {
    const lo = s[i];
    const hi = s[i + 1];
    if (lo && hi && days >= lo.days && days <= hi.days) {
      const t = (days - lo.days) / (hi.days - lo.days);
      return lo.rate + t * (hi.rate - lo.rate);
    }
  }

  return last.rate;
}

function getGuarantorCut(interest: number): number {
  return interest * 0.20;
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface LendingWallet {
  id: string;
  user_id: string;
  investment_fund: number;
  interest_savings: number;
}

interface LoanRow {
  id: string;
  user_id: string;
  borrower_name: string;
  guarantor_name: string | null;
  capital: number;
  interest_rate: number;
  term_days: number;
  date_borrowed: string;
  due_date: string | null;
  received_date: string | null;
  notes: string | null;
  status: string;
  guarantor_cut: number | null;
  net_interest: number | null;
}

interface InstallmentPayment {
  id: string;
  loan_id: string;
  amount: number;
  notes: string | null;
  paid_at: string;
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
function Page() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const qc = useQueryClient();

  /* ── Loans ── */
  const { data: rows = [] } = useQuery({
    queryKey: ["lending", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("lending_records").select("*").eq("user_id", user!.id)
        .order("date_borrowed", { ascending: false });
      return (data ?? []) as LoanRow[];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("display_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data as { display_name: string } | null;
    },
  });

  const displayName = profile?.display_name ?? "Ronin";

  /* ── Wallet ── */
  const { data: wallet } = useQuery({
    queryKey: ["lending-wallet", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("lending_wallet").select("*").eq("user_id", user!.id).maybeSingle();
      return data as LendingWallet | null;
    },
  });

  /* ── Savings withdrawals ── */
  const { data: withdrawals = [] } = useQuery({
    queryKey: ["savings-withdrawals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("savings_withdrawals").select("*").eq("user_id", user!.id)
        .order("withdrawn_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  /* ── Guarantor payout records ── */
  const { data: guarantorPayouts = [] } = useQuery({
    queryKey: ["guarantor-payouts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("guarantor_payout_records").select("*").eq("user_id", user!.id)
        .order("paid_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  /* ── Installment payments ── */
  const { data: installments = [] } = useQuery({
    queryKey: ["installment-payments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("installment_payments").select("*").eq("user_id", user!.id)
        .order("paid_at", { ascending: false });
      return (data ?? []) as InstallmentPayment[];
    },
  });

  const investmentFund  = wallet?.investment_fund  ?? 0;
  const interestSavings = wallet?.interest_savings ?? 0;

  /* ── Form state ── */
  const [borrower,     setBorrower]     = useState("");
  const [guarantor,    setGuarantor]    = useState("");
  const [capital,      setCapital]      = useState("");
  const [customDays,   setCustomDays]   = useState("40");
  const [dateBorrowed, setDateBorrowed] = useState(new Date().toISOString().slice(0, 10));
  const [notes,        setNotes]        = useState("");
  const [calcOpen,     setCalcOpen]     = useState(false);

  /* ── Modal state ── */
  type ModalType = "add-invest" | "move-savings" | "withdraw-savings" | "pay-guarantor" | "installment" | null;
  const [modal,          setModal]          = useState<ModalType>(null);
  const [modalAmt,       setModalAmt]       = useState("");
  const [modalNote,      setModalNote]      = useState("");
  const [modalGuarantor, setModalGuarantor] = useState<{ name: string; loanId: string; maxAmt: number } | null>(null);
  const [modalLoan,      setModalLoan]      = useState<LoanRow | null>(null);

  /* ── Panel toggles ── */
  const [showWithdrawHistory, setShowWithdrawHistory] = useState(false);
  const [showGuarantorPanel,  setShowGuarantorPanel]  = useState(false);
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

  /* ── Derived calculations ── */
  const days       = Math.max(1, parseInt(customDays) || 1);
  const rate       = getRateForDays(days);
  const capitalNum = Number(capital) || 0;
  const interest   = capitalNum * rate;
  const totalCost  = capitalNum + interest;
  const dueDate    = fmtDate(addDays(new Date(dateBorrowed), days), "yyyy-MM-dd");
  const perDay     = days > 0 ? totalCost / days : 0;
  const perWeek    = totalCost / Math.ceil(days / 7);
  const hasGuarantor  = guarantor.trim().length > 0;
  const guarantorCut  = hasGuarantor ? getGuarantorCut(interest) : 0;
  const netInterest   = interest - guarantorCut;

  /* ── Totals ── */
  const totals = useMemo(() => {
    const active = rows.filter((x) => x.status === "active");
    const totalCapital       = active.reduce((s, x) => s + Number(x.capital), 0);
    const totalInterest      = active.reduce((s, x) => s + Number(x.capital) * Number(x.interest_rate), 0);
    const totalGuarantorCuts = active
      .filter((x) => x.guarantor_name)
      .reduce((s, x) => s + getGuarantorCut(Number(x.capital) * Number(x.interest_rate)), 0);
    return {
      totalCapital,
      totalInterest,
      totalGuarantorCuts,
      netInterest: totalInterest - totalGuarantorCuts,
      total: totalCapital + totalInterest,
    };
  }, [rows]);

  /* ── Guarantor summary ── */
  const guarantorSummary = useMemo(() => {
    const paidWithGuarantor = rows.filter((r) => r.status === "paid" && r.guarantor_name);
    const map: Record<string, { name: string; totalCut: number; loans: LoanRow[] }> = {};
    for (const r of paidWithGuarantor) {
      const rawInt = Number(r.capital) * Number(r.interest_rate);
      const cut    = Number(r.guarantor_cut ?? getGuarantorCut(rawInt));
      const key    = r.guarantor_name!;
      if (!map[key]) map[key] = { name: key, totalCut: 0, loans: [] };
      map[key]!.totalCut += cut;
      map[key]!.loans.push(r);
    }
    for (const p of guarantorPayouts as any[]) {
      if (map[p.guarantor_name]) {
        map[p.guarantor_name]!.totalCut -= Number(p.amount);
      }
    }
    return Object.values(map).filter((g) => g.totalCut > 0.005);
  }, [rows, guarantorPayouts]);

  const totalPaidOutGuarantor = useMemo(
    () => (guarantorPayouts as any[]).reduce((s, p) => s + Number(p.amount), 0),
    [guarantorPayouts]
  );
  const totalWithdrawn = useMemo(
    () => (withdrawals as any[]).reduce((s, w) => s + Number(w.amount), 0),
    [withdrawals]
  );

  /* ── Per-loan installment totals ── */
  const installmentsByLoan = useMemo(() => {
    const map: Record<string, InstallmentPayment[]> = {};
    for (const inst of installments) {
      if (!map[inst.loan_id]) map[inst.loan_id] = [];
      map[inst.loan_id]!.push(inst);
    }
    return map;
  }, [installments]);

  /* ── Total fund ── */
  const totalFund  = investmentFund + interestSavings;
  const activeLent = rows.filter((r) => r.status === "active").reduce((s, r) => s + Number(r.capital), 0);

  /* ── Ensure wallet row ── */
  const ensureWallet = async (): Promise<void> => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("lending_wallet").select("id").eq("user_id", user.id).maybeSingle();
    if (!data) {
      await (supabase as any).from("lending_wallet")
        .insert({ user_id: user.id, investment_fund: 0, interest_savings: 0 });
    }
  };

  /* ── Invalidate common queries ── */
  const invalidateLending = (): void => {
    qc.invalidateQueries({ queryKey: ["lending"] });
    qc.invalidateQueries({ queryKey: ["lending-wallet"] });
  };

  /* ── Submit loan ── */
  const submit = async (): Promise<void> => {
    if (!borrower || !capital || !user) {
      toast.error("Fill borrower & capital");
      return;
    }
    const finalRate         = getRateForDays(days);
    const finalInterest     = capitalNum * finalRate;
    const finalGuarantorCut = hasGuarantor ? getGuarantorCut(finalInterest) : 0;
    const finalNetInterest  = finalInterest - finalGuarantorCut;

    const { error } = await (supabase as any).from("lending_records").insert({
      user_id:        user.id,
      borrower_name:  borrower,
      guarantor_name: guarantor || null,
      capital:        capitalNum,
      interest_rate:  finalRate,
      term_days:      days,
      date_borrowed:  dateBorrowed,
      due_date:       dueDate,
      notes:          notes || null,
      status:         "active",
      guarantor_cut:  finalGuarantorCut,
      net_interest:   finalNetInterest,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    await ensureWallet();

    if (investmentFund > 0) {
      await (supabase as any).from("lending_wallet")
        .update({ investment_fund: Math.max(0, investmentFund - capitalNum) })
        .eq("user_id", user.id);
    }

    setBorrower(""); setGuarantor(""); setCapital(""); setNotes(""); setCustomDays("40");
    toast.success("Loan recorded");
    invalidateLending();
  };

  /* ── Mark paid ── */
  const markPaid = async (r: LoanRow): Promise<void> => {
    await (supabase as any).from("lending_records")
      .update({ status: "paid", received_date: new Date().toISOString().slice(0, 10) })
      .eq("id", r.id);

    await ensureWallet();

    const capital         = Number(r.capital);
    const rawInt          = capital * Number(r.interest_rate);
    const guarantorDeduct = r.guarantor_name ? getGuarantorCut(rawInt) : 0;
    const earnedInterest  = Number(r.net_interest ?? (rawInt - guarantorDeduct));

    // Sum up all installment payments already recorded for this loan
    const totalInstPaid = (installmentsByLoan[r.id] ?? []).reduce(
      (s, inst) => s + Number(inst.amount), 0
    );

    // Installments fill interest first, then capital
    // So figure out how much of each has already been covered
    const interestCoveredByInst = Math.min(totalInstPaid, earnedInterest);
    const capitalCoveredByInst  = Math.max(0, totalInstPaid - interestCoveredByInst);

    // Only add back the capital that hasn't already been returned via installments
    const capitalStillOwed   = Math.max(0, capital - capitalCoveredByInst);
    // Only add interest that hasn't already been saved via installments
    const interestStillOwed  = Math.max(0, earnedInterest - interestCoveredByInst);

    const newFund    = investmentFund + capitalStillOwed;
    const newSavings = interestSavings + interestStillOwed;

    await (supabase as any).from("lending_wallet")
      .update({ investment_fund: newFund, interest_savings: newSavings })
      .eq("user_id", user!.id);

    toast.success(`Marked paid — ₱${earnedInterest.toFixed(2)} interest saved`);
    invalidateLending();
  };

  /* ── Remove loan ── */
  const remove = async (id: string): Promise<void> => {
    await (supabase as any).from("lending_records").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["lending"] });
  };

  /* ── Record installment ── */
  const recordInstallment = async (): Promise<void> => {
    const amt = Number(modalAmt);
    if (!amt || amt <= 0 || !modalLoan || !user) {
      toast.error("Enter a valid amount");
      return;
    }

    const loanTotalDue = Number(modalLoan.capital) * (1 + Number(modalLoan.interest_rate));
    const alreadyPaid  = (installmentsByLoan[modalLoan.id] ?? []).reduce((s, i) => s + Number(i.amount), 0);
    const remaining    = loanTotalDue - alreadyPaid;

    if (amt > remaining + 0.01) {
      toast.error(`Amount exceeds remaining balance (${format(remaining)})`);
      return;
    }

    await ensureWallet();

    const { error } = await (supabase as any).from("installment_payments").insert({
      user_id: user.id,
      loan_id: modalLoan.id,
      amount:  amt,
      notes:   modalNote || null,
      paid_at: new Date().toISOString().slice(0, 10),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const rawInt          = Number(modalLoan.capital) * Number(modalLoan.interest_rate);
    const guarantorPct    = modalLoan.guarantor_name ? 0.20 : 0;
    const netInt          = rawInt * (1 - guarantorPct);

    // How much of the net interest has already been covered by prior installments?
    const interestAlreadyCovered = Math.min(alreadyPaid, netInt);
    const interestStillOwed      = Math.max(0, netInt - interestAlreadyCovered);

    // This payment covers interest first, then capital
    const interestPortion = Math.min(amt, interestStillOwed);
    const capitalPortion  = Math.max(0, amt - interestPortion);

    await (supabase as any).from("lending_wallet")
      .update({
        interest_savings: interestSavings + interestPortion,
        investment_fund:  investmentFund  + capitalPortion,
      })
      .eq("user_id", user.id);

    if (alreadyPaid + amt >= loanTotalDue - 0.01) {
      await (supabase as any).from("lending_records")
        .update({ status: "paid", received_date: new Date().toISOString().slice(0, 10) })
        .eq("id", modalLoan.id);
      toast.success("Loan fully paid via installments! 🎉");
    } else {
      toast.success(`Installment of ${format(amt)} recorded`);
    }

    setModalAmt(""); setModalNote(""); setModal(null); setModalLoan(null);
    invalidateLending();
    qc.invalidateQueries({ queryKey: ["installment-payments"] });
  };

  /* ── Modal confirm ── */
  const handleModalAction = async (): Promise<void> => {
    if (modal === "installment") {
      await recordInstallment();
      return;
    }

    const amt = Number(modalAmt);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    await ensureWallet();

    if (modal === "add-invest") {
      await (supabase as any).from("lending_wallet")
        .update({ investment_fund: investmentFund + amt })
        .eq("user_id", user!.id);
      toast.success(`Added ₱${amt.toLocaleString()} to investment fund`);

    } else if (modal === "move-savings") {
      if (amt > interestSavings) {
        toast.error("Not enough in savings");
        return;
      }
      await (supabase as any).from("lending_wallet")
        .update({ interest_savings: interestSavings - amt, investment_fund: investmentFund + amt })
        .eq("user_id", user!.id);
      toast.success(`Moved ₱${amt.toLocaleString()} → Investment fund`);

    } else if (modal === "withdraw-savings") {
      if (amt > interestSavings) {
        toast.error("Not enough in savings");
        return;
      }
      await (supabase as any).from("lending_wallet")
        .update({ interest_savings: interestSavings - amt })
        .eq("user_id", user!.id);
      await (supabase as any).from("savings_withdrawals").insert({
        user_id:      user!.id,
        amount:       amt,
        notes:        modalNote || null,
        withdrawn_at: new Date().toISOString().slice(0, 10),
      });
      toast.success(`Withdrew ₱${amt.toLocaleString()} for personal use`);
      qc.invalidateQueries({ queryKey: ["savings-withdrawals"] });

    } else if (modal === "pay-guarantor" && modalGuarantor) {
      if (amt > modalGuarantor.maxAmt + 0.01) {
        toast.error("Amount exceeds owed cut");
        return;
      }
      await (supabase as any).from("guarantor_payout_records").insert({
        user_id:        user!.id,
        guarantor_name: modalGuarantor.name,
        amount:         amt,
        loan_id:        modalGuarantor.loanId || null,
        notes:          modalNote || null,
        paid_at:        new Date().toISOString().slice(0, 10),
      });
      toast.success(`Recorded ₱${amt.toLocaleString()} payout to ${modalGuarantor.name}`);
      qc.invalidateQueries({ queryKey: ["guarantor-payouts"] });
    }

    setModalAmt(""); setModalNote(""); setModal(null); setModalGuarantor(null);
    qc.invalidateQueries({ queryKey: ["lending-wallet"] });
  };

  const closeModal = (): void => {
    setModal(null); setModalGuarantor(null); setModalLoan(null);
  };

  const toggleLoanExpand = (id: string): void => {
    setExpandedLoans((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* ── Installment Modal Content ── */
  const InstallmentModalContent = (): React.ReactElement | null => {
    if (!modalLoan) return null;
    const loanTotal   = Number(modalLoan.capital) * (1 + Number(modalLoan.interest_rate));
    const alreadyPaid = (installmentsByLoan[modalLoan.id] ?? []).reduce((s, i) => s + Number(i.amount), 0);
    const remaining   = Math.max(0, loanTotal - alreadyPaid);
    const progressPct = Math.min(100, (alreadyPaid / loanTotal) * 100);
    return (
      <>
        <p className="modal-title">📦 Record Installment</p>
        <p className="modal-sub">
          Borrower: <strong>{modalLoan.borrower_name}</strong>
        </p>
        <div className="modal-progress">
          <div className="modal-progress-bar">
            <div className="modal-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="modal-progress-label">
            <span>Paid: {format(alreadyPaid)}</span>
            <span style={{ color: "var(--c-text3)" }}>
              Remaining: <span style={{ color: "var(--c-danger)", fontWeight: 700 }}>{format(remaining)}</span>
            </span>
          </div>
        </div>
        <div className="modal-field" style={{ marginTop: 14 }}>
          <label className="field-label">Amount (₱) — max {format(remaining)}</label>
          <input
            type="number"
            className="form-input"
            value={modalAmt}
            onChange={(e) => setModalAmt(e.target.value)}
            placeholder={remaining.toFixed(2)}
            autoFocus
          />
        </div>
        <div className="modal-field">
          <label className="field-label">Notes (optional)</label>
          <input
            type="text"
            className="form-input"
            value={modalNote}
            onChange={(e) => setModalNote(e.target.value)}
            placeholder="e.g. weekly, cash, partial…"
          />
        </div>
        <div style={{ fontSize: 11, color: "var(--c-text3)", marginTop: 10, padding: "8px 10px", background: "var(--c-elevated)", borderRadius: "var(--r-sm)", lineHeight: 1.6 }}>
          💡 Interest portion goes to <strong style={{ color: "var(--c-accent2)" }}>Interest Savings</strong> first, excess capital to <strong style={{ color: "var(--c-accent)" }}>Investment Fund</strong>.
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={() => { setModal(null); setModalLoan(null); }}>Cancel</button>
          <button className="confirm-btn accent2-confirm" onClick={handleModalAction}>Record Installment</button>
        </div>
      </>
    );
  };

  /* ─────────────────────────── RENDER ─────────────────────────────────── */
  return (
    <div className="ld-root">
      <style>{`
        .ld-root {
          --c-bg:#F7F4EE;--c-bg2:#EFE9DD;--c-surface:#FFFFFF;
          --c-elevated:#F4F6FB;--c-border:#D9DEE8;--c-border-md:#b8c2d8;
          --c-text:#1C2230;--c-text2:#6C7380;--c-text3:#9AA1AE;
          --c-accent:#6E8EF7;--c-accent2:#8878FF;
          --c-accent-lt:rgba(110,142,247,0.10);--c-accent-glow:rgba(110,142,247,0.22);
          --c-hover:#5C74D8;--c-ok:#6E9F7A;--c-warn:#C9995D;--c-danger:#C76B6B;
          --c-shadow-sm:0 1px 3px rgba(28,34,48,.05),0 4px 16px rgba(110,142,247,.07);
          --c-shadow-md:0 2px 8px rgba(28,34,48,.07),0 8px 32px rgba(110,142,247,.14);
          --r-sm:10px;--r-md:14px;--r-lg:20px;--r-xl:26px;
          font-family:'DM Sans',system-ui,sans-serif;
        }
        .dark .ld-root {
          --c-bg:#0F1117;--c-bg2:#161A22;--c-surface:#1D2330;
          --c-elevated:#252C3D;--c-border:#2C3445;--c-border-md:#3d4a60;
          --c-text:#F4F1EA;--c-text2:#A2AAB8;--c-text3:#6F7785;
          --c-accent:#7DA2FF;--c-accent2:#9A84FF;
          --c-accent-lt:rgba(125,162,255,0.12);--c-accent-glow:rgba(125,162,255,0.24);
          --c-hover:#5E7CE2;--c-ok:#89B89A;--c-warn:#D6A86A;--c-danger:#D67C7C;
          --c-shadow-sm:0 1px 3px rgba(0,0,0,.30),0 4px 16px rgba(0,0,0,.20);
          --c-shadow-md:0 2px 8px rgba(0,0,0,.35),0 8px 32px rgba(0,0,0,.25);
        }
        .ld-root*{box-sizing:border-box;}
        .ld-root{padding:clamp(12px,3vw,28px);min-height:100vh;}
        @keyframes ld-fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ld-fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes ld-shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
        @keyframes ld-modalIn{from{opacity:0;transform:scale(.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .ld-fade-up{animation:ld-fadeUp .38s cubic-bezier(.22,.68,0,1.2) both;}

        .ld-root .page-header{margin-bottom:24px;}
        .ld-root .page-title{font-size:clamp(1.6rem,4.5vw,2.6rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1;color:var(--c-text);margin:0 0 4px;}
        .ld-root .page-title span{color:var(--c-accent);}
        .ld-root .page-sub{font-size:clamp(0.8rem,2vw,0.95rem);color:var(--c-text2);margin:0;}

        .ld-root .wallet-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:14px;}
        .ld-root .wallet-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:14px 16px;box-shadow:var(--c-shadow-sm);position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s;}
        .ld-root .wallet-card:hover{transform:translateY(-2px);box-shadow:var(--c-shadow-md);border-color:var(--c-border-md);}
        .ld-root .wallet-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:99px 99px 0 0;background:var(--c-accent);}
        .ld-root .wallet-card.ok::before{background:var(--c-ok);}
        .ld-root .wallet-card.warn::before{background:var(--c-warn);}
        .ld-root .wallet-card.accent2::before{background:var(--c-accent2);}
        .ld-root .wallet-card.danger::before{background:var(--c-danger);}
        .ld-root .wallet-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);display:block;margin-bottom:4px;}
        .ld-root .wallet-value{font-size:clamp(1rem,2.5vw,1.4rem);font-weight:800;color:var(--c-text);letter-spacing:-0.02em;line-height:1.2;word-break:break-all;}
        .ld-root .wallet-value.accent{color:var(--c-accent);}
        .ld-root .wallet-value.ok{color:var(--c-ok);}
        .ld-root .wallet-value.warn{color:var(--c-warn);}
        .ld-root .wallet-value.danger{color:var(--c-danger);}
        .ld-root .wallet-sub{font-size:11px;color:var(--c-text3);margin-top:4px;line-height:1.4;}
        .ld-root .wallet-sub span{color:var(--c-text2);font-weight:600;}
        .ld-root .wallet-actions{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;}
        .ld-root .wallet-btn{height:28px;padding:0 10px;font-size:11px;font-weight:700;border-radius:8px;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:4px;transition:background .15s,transform .12s,box-shadow .15s;border:1.5px solid var(--c-accent);background:var(--c-accent-lt);color:var(--c-accent);}
        .ld-root .wallet-btn:hover{background:var(--c-accent);color:#fff;transform:translateY(-1px);box-shadow:0 3px 10px var(--c-accent-glow);}
        .ld-root .wallet-btn.ok-btn{border-color:var(--c-ok);background:rgba(110,159,122,.10);color:var(--c-ok);}
        .ld-root .wallet-btn.ok-btn:hover{background:var(--c-ok);color:#fff;box-shadow:0 3px 10px rgba(110,159,122,.3);}
        .ld-root .wallet-btn.warn-btn{border-color:var(--c-warn);background:rgba(201,153,93,.10);color:var(--c-warn);}
        .ld-root .wallet-btn.warn-btn:hover{background:var(--c-warn);color:#fff;}
        .ld-root .wallet-btn.danger-btn{border-color:var(--c-danger);background:rgba(199,107,107,.10);color:var(--c-danger);}
        .ld-root .wallet-btn.danger-btn:hover{background:var(--c-danger);color:#fff;}

        .ld-root .stat-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:20px;}
        .ld-root .stat-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:14px 16px;box-shadow:var(--c-shadow-sm);position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s;}
        .ld-root .stat-card:hover{transform:translateY(-2px);box-shadow:var(--c-shadow-md);border-color:var(--c-border-md);}
        .ld-root .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--c-accent);border-radius:99px 99px 0 0;}
        .ld-root .stat-card.accent2::before{background:var(--c-accent2);}
        .ld-root .stat-card.ok::before{background:var(--c-ok);}
        .ld-root .stat-card.warn::before{background:var(--c-warn);}
        .ld-root .stat-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);display:block;margin-bottom:6px;}
        .ld-root .stat-value{font-size:clamp(1rem,2.5vw,1.4rem);font-weight:800;color:var(--c-text);letter-spacing:-0.02em;line-height:1.2;word-break:break-all;}

        .ld-root .main-grid{display:grid;grid-template-columns:1fr;gap:16px;margin-bottom:20px;}
        @media(min-width:1024px){.ld-root .main-grid{grid-template-columns:2fr 1fr;}}

        .ld-root .panel{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);padding:clamp(16px,3vw,24px);box-shadow:var(--c-shadow-sm);transition:border-color .25s,box-shadow .25s;}
        .ld-root .panel:focus-within{border-color:var(--c-border-md);box-shadow:var(--c-shadow-md);}
        .ld-root .panel-heading{font-size:.82rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);margin:0 0 18px;display:flex;align-items:center;gap:8px;}
        .ld-root .panel-heading svg{color:var(--c-accent);flex-shrink:0;}

        .ld-root .form-grid{display:grid;grid-template-columns:1fr;gap:14px;}
        @media(min-width:480px){.ld-root .form-grid{grid-template-columns:1fr 1fr;}}
        .ld-root .field-label{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-text2);display:block;margin-bottom:6px;}
        .ld-root .form-input{width:100%;height:42px;padding:0 12px;background:var(--c-elevated);border:1.5px solid var(--c-border);border-radius:var(--r-sm);color:var(--c-text);font-size:14px;font-family:inherit;outline:none;transition:border-color .18s,box-shadow .18s;}
        .ld-root .form-input:hover{border-color:var(--c-border-md);}
        .ld-root .form-input:focus{border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-lt);}
        .ld-root .form-textarea{width:100%;min-height:42px;padding:10px 12px;background:var(--c-elevated);border:1.5px solid var(--c-border);border-radius:var(--r-sm);color:var(--c-text);font-size:14px;font-family:inherit;outline:none;resize:none;transition:border-color .18s,box-shadow .18s;}
        .ld-root .form-textarea:hover{border-color:var(--c-border-md);}
        .ld-root .form-textarea:focus{border-color:var(--c-accent);box-shadow:0 0 0 3px var(--c-accent-lt);}
        .ld-root .days-row{display:flex;align-items:center;gap:8px;}
        .ld-root .days-input{flex:1;}
        .ld-root .rate-pill{display:inline-flex;align-items:center;gap:4px;height:42px;padding:0 12px;background:var(--c-accent-lt);border:1.5px solid var(--c-accent);border-radius:var(--r-sm);color:var(--c-accent);font-size:13px;font-weight:800;white-space:nowrap;flex-shrink:0;}
        .ld-root .guarantor-info{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:var(--r-sm);background:rgba(201,153,93,.09);border:1px solid rgba(201,153,93,.25);font-size:12px;color:var(--c-warn);font-weight:600;animation:ld-fadeIn .2s ease;}
        .ld-root .submit-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:44px;padding:0 24px;background:var(--c-accent);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;margin-top:4px;width:100%;transition:background .18s,transform .14s,box-shadow .18s;}
        @media(min-width:480px){.ld-root .submit-btn{width:auto;}}
        .ld-root .submit-btn:hover{background:var(--c-hover);box-shadow:0 4px 20px var(--c-accent-glow);transform:translateY(-1px);}
        .ld-root .submit-btn:active{transform:scale(.97);}
        .ld-root .submit-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transform:translateX(-100%);pointer-events:none;}
        .ld-root .submit-btn:hover::after{animation:ld-shimmer .55s ease;}

        .ld-root .calc-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 16px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);font-size:13px;font-weight:700;color:var(--c-text2);cursor:pointer;margin-bottom:10px;font-family:inherit;transition:background .15s,border-color .15s;}
        .ld-root .calc-toggle:hover{background:var(--c-elevated);border-color:var(--c-border-md);}
        @media(min-width:1024px){.ld-root .calc-toggle{display:none;}}
        .ld-root .calc-body-mobile{display:none;}
        .ld-root .calc-body-mobile.open{display:block;}
        .ld-root .calc-body-desktop{display:none;}
        @media(min-width:1024px){.ld-root .calc-body-mobile{display:none !important;}.ld-root .calc-body-desktop{display:block;}}
        .ld-root .calc-panel{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);padding:clamp(16px,3vw,24px);box-shadow:var(--c-shadow-sm);}
        .ld-root .calc-heading{font-size:.82rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);margin:0 0 16px;display:none;align-items:center;gap:8px;}
        @media(min-width:1024px){.ld-root .calc-heading{display:flex;}}
        .ld-root .calc-row{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:7px 0;border-bottom:1px solid var(--c-border);font-size:13px;}
        .ld-root .calc-row:last-of-type{border-bottom:none;}
        .ld-root .calc-row-label{color:var(--c-text2);}
        .ld-root .calc-row-value{font-weight:700;color:var(--c-text);text-align:right;}
        .ld-root .calc-row-value.big{font-size:1.15rem;color:var(--c-accent);}
        .ld-root .calc-row-value.warn{color:var(--c-warn);}
        .ld-root .calc-row-value.ok{color:var(--c-ok);}
        .ld-root .calc-divider{height:1px;background:var(--c-border);margin:12px 0;}
        .ld-root .calc-pay-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;gap:8px;}
        .ld-root .calc-pay-label{color:var(--c-text2);}
        .ld-root .calc-pay-value{font-weight:600;color:var(--c-text);text-align:right;}
        .ld-root .calc-note{font-size:12px;color:var(--c-text3);line-height:1.6;margin-top:10px;padding-top:10px;border-top:1px solid var(--c-border);}
        .ld-root .calc-note strong{color:var(--c-text2);font-weight:700;}

        .ld-root .section-panel{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);box-shadow:var(--c-shadow-sm);overflow:hidden;margin-bottom:20px;}
        .ld-root .section-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;transition:background .15s;border-bottom:1px solid transparent;}
        .ld-root .section-header:hover{background:var(--c-elevated);}
        .ld-root .section-header.open{border-bottom-color:var(--c-border);}
        .ld-root .section-header-left{display:flex;align-items:center;gap:10px;}
        .ld-root .section-title{font-size:.82rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);}
        .ld-root .section-badge{font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;background:rgba(201,153,93,.15);color:var(--c-warn);}
        .ld-root .section-badge.ok{background:rgba(110,159,122,.15);color:var(--c-ok);}
        .ld-root .section-badge.danger{background:rgba(199,107,107,.15);color:var(--c-danger);}
        .ld-root .section-body{padding:0 20px 20px;animation:ld-fadeIn .2s ease;}
        .ld-root .section-sub-title{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);margin:14px 0 10px;}

        .ld-root .guarantor-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--c-border);gap:12px;flex-wrap:wrap;}
        .ld-root .guarantor-row:last-child{border-bottom:none;}
        .ld-root .guarantor-name-cell{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--c-text);}
        .ld-root .guarantor-loan-count{font-size:11px;color:var(--c-text3);font-weight:400;margin-top:1px;}
        .ld-root .guarantor-owed{font-size:14px;font-weight:800;color:var(--c-warn);}
        .ld-root .give-cut-btn{height:32px;padding:0 14px;background:rgba(201,153,93,.10);border:1.5px solid var(--c-warn);border-radius:var(--r-sm);color:var(--c-warn);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:background .15s,color .15s,transform .12px;}
        .ld-root .give-cut-btn:hover{background:var(--c-warn);color:#fff;transform:translateY(-1px);}

        .ld-root .payout-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--c-elevated);border-radius:var(--r-sm);margin-bottom:6px;font-size:12px;}
        .ld-root .payout-row-name{font-weight:700;color:var(--c-text);}
        .ld-root .payout-row-amt{font-weight:700;color:var(--c-ok);}
        .ld-root .payout-row-date{color:var(--c-text3);font-size:11px;}

        .ld-root .withdraw-row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 12px;background:var(--c-elevated);border-radius:var(--r-sm);margin-bottom:6px;gap:12px;}
        .ld-root .withdraw-row-amt{font-size:14px;font-weight:800;color:var(--c-danger);}
        .ld-root .withdraw-row-note{font-size:12px;color:var(--c-text2);margin-top:2px;}
        .ld-root .withdraw-row-date{font-size:11px;color:var(--c-text3);text-align:right;flex-shrink:0;}

        .ld-root .table-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);box-shadow:var(--c-shadow-sm);overflow:hidden;}
        .ld-root .inv-table{width:100%;border-collapse:collapse;min-width:1020px;}
        .ld-root .inv-table thead tr{background:var(--c-elevated);border-bottom:1px solid var(--c-border);}
        .ld-root .inv-table th{padding:13px 16px;font-size:.67rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-text3);text-align:left;white-space:nowrap;}
        .ld-root .inv-table td{padding:13px 16px;font-size:13px;color:var(--c-text);border-bottom:1px solid var(--c-border);vertical-align:middle;white-space:nowrap;}
        .ld-root .inv-table tbody tr:last-child td{border-bottom:none;}
        .ld-root .inv-table tbody tr{transition:background .15s;animation:ld-fadeIn .3s ease both;}
        .ld-root .inv-table tbody tr:hover{background:var(--c-elevated);}
        .ld-root .badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;letter-spacing:.05em;padding:3px 9px;border-radius:99px;}
        .ld-root .badge-active{background:rgba(110,142,247,.12);color:#6E8EF7;}
        .ld-root .badge-paid{background:rgba(110,159,122,.12);color:#6E9F7A;}
        .ld-root .guarantor-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:2px 7px;border-radius:6px;background:rgba(201,153,93,.10);color:var(--c-warn);border:1px solid rgba(201,153,93,.22);}
        .ld-root .action-row{display:flex;align-items:center;gap:6px;}
        .ld-root .paid-btn{height:30px;padding:0 10px;background:var(--c-elevated);border:1.5px solid var(--c-border);border-radius:var(--r-sm);color:var(--c-text2);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,color .15s,transform .12s;}
        .ld-root .paid-btn:hover{background:rgba(110,159,122,.12);border-color:var(--c-ok);color:var(--c-ok);transform:translateY(-1px);}
        .ld-root .installment-btn{height:30px;padding:0 10px;background:rgba(136,120,255,.10);border:1.5px solid var(--c-accent2);border-radius:var(--r-sm);color:var(--c-accent2);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;transition:background .15s,color .15s,transform .12s;}
        .ld-root .installment-btn:hover{background:var(--c-accent2);color:#fff;transform:translateY(-1px);}
        .ld-root .expand-btn{height:30px;width:30px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid var(--c-border);border-radius:var(--r-sm);color:var(--c-text3);cursor:pointer;transition:background .15s,color .15s,border-color .15s,transform .2s;}
        .ld-root .expand-btn:hover{background:var(--c-elevated);color:var(--c-text2);border-color:var(--c-border-md);}
        .ld-root .expand-btn.expanded{transform:rotate(180deg);background:var(--c-accent-lt);color:var(--c-accent);border-color:var(--c-accent);}
        .ld-root .remove-btn{width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:none;border:none;border-radius:var(--r-sm);color:var(--c-text3);cursor:pointer;transition:background .15s,color .15s,transform .12s;}
        .ld-root .remove-btn:hover{background:rgba(199,107,107,.12);color:var(--c-danger);transform:scale(1.1);}
        .ld-root .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:64px 24px;color:var(--c-text3);text-align:center;}
        .ld-root .empty-state svg{opacity:.35;}
        .ld-root .empty-state p{margin:0;font-size:15px;}

        .ld-root .inst-history-row td{padding:0 !important;border-bottom:1px solid var(--c-border) !important;background:var(--c-bg) !important;}
        .dark .ld-root .inst-history-row td{background:var(--c-bg2) !important;}
        .ld-root .inst-history-inner{padding:12px 20px 16px;animation:ld-fadeIn .2s ease;}
        .ld-root .inst-history-title{font-size:.65rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-text3);margin-bottom:10px;}
        .ld-root .inst-payment-row{display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:var(--c-surface);border-radius:var(--r-sm);margin-bottom:5px;font-size:12px;border:1px solid var(--c-border);}
        .ld-root .inst-payment-amt{font-weight:800;color:var(--c-accent2);}
        .ld-root .inst-payment-note{color:var(--c-text2);flex:1;margin:0 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .ld-root .inst-payment-date{color:var(--c-text3);font-size:11px;}
        .ld-root .inst-progress-bar{height:6px;border-radius:99px;background:var(--c-border);margin-top:10px;overflow:hidden;}
        .ld-root .inst-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--c-accent2),var(--c-accent));transition:width .4s ease;}
        .ld-root .inst-progress-label{font-size:11px;color:var(--c-text3);margin-top:5px;display:flex;justify-content:space-between;}
        .ld-root .inst-progress-label span{color:var(--c-accent2);font-weight:700;}

        .ld-root .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:ld-fadeIn .15s ease;}
        .ld-root .modal-box{background:var(--c-surface);border:1px solid var(--c-border-md);border-radius:var(--r-xl);padding:24px;width:100%;max-width:400px;box-shadow:0 16px 64px rgba(0,0,0,.2);animation:ld-modalIn .22s cubic-bezier(.22,.68,0,1.2);}
        .ld-root .modal-title{font-size:15px;font-weight:800;color:var(--c-text);margin:0 0 4px;}
        .ld-root .modal-sub{font-size:13px;color:var(--c-text2);margin:0 0 16px;}
        .ld-root .modal-footer{display:flex;gap:8px;margin-top:18px;}
        .ld-root .modal-field+.modal-field{margin-top:12px;}
        .ld-root .cancel-btn{height:40px;padding:0 16px;background:var(--c-elevated);border:1.5px solid var(--c-border);border-radius:var(--r-sm);color:var(--c-text2);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:background .15s,color .15s;}
        .ld-root .cancel-btn:hover{background:var(--c-border);color:var(--c-text);}
        .ld-root .confirm-btn{flex:1;height:40px;background:var(--c-accent);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:background .15s,transform .12s;}
        .ld-root .confirm-btn:hover{background:var(--c-hover);transform:translateY(-1px);}
        .ld-root .confirm-btn.warn-confirm{background:var(--c-warn);}
        .ld-root .confirm-btn.warn-confirm:hover{background:#b8843a;}
        .ld-root .confirm-btn.danger-confirm{background:var(--c-danger);}
        .ld-root .confirm-btn.danger-confirm:hover{background:#b05555;}
        .ld-root .confirm-btn.accent2-confirm{background:var(--c-accent2);}
        .ld-root .confirm-btn.accent2-confirm:hover{background:#7060e0;}
        .ld-root .modal-progress{margin-top:12px;margin-bottom:4px;}
        .ld-root .modal-progress-bar{height:6px;border-radius:99px;background:var(--c-border);overflow:hidden;margin-bottom:4px;}
        .ld-root .modal-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--c-accent2),var(--c-accent));transition:width .4s ease;}
        .ld-root .modal-progress-label{font-size:11px;color:var(--c-text3);display:flex;justify-content:space-between;}

        @media(max-width:359px){.ld-root .page-title{font-size:1.35rem;}.ld-root .panel{padding:14px;}}
      `}</style>

      {/* ── Modal ─────────────────────────────────────────── */}
      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            {modal === "add-invest" && (
              <>
                <p className="modal-title">Add to Investment Fund</p>
                <p className="modal-sub">Current fund: {format(investmentFund)}</p>
                <div className="modal-field">
                  <label className="field-label">Amount (₱)</label>
                  <input type="number" className="form-input" value={modalAmt} onChange={(e) => setModalAmt(e.target.value)} placeholder="0" autoFocus />
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => setModal(null)}>Cancel</button>
                  <button className="confirm-btn" onClick={handleModalAction}>Confirm</button>
                </div>
              </>
            )}

            {modal === "move-savings" && (
              <>
                <p className="modal-title">Move Savings → Investment Fund</p>
                <p className="modal-sub">Available savings: {format(interestSavings)}</p>
                <div className="modal-field">
                  <label className="field-label">Amount (₱)</label>
                  <input type="number" className="form-input" value={modalAmt} onChange={(e) => setModalAmt(e.target.value)} placeholder="0" autoFocus />
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => setModal(null)}>Cancel</button>
                  <button className="confirm-btn" onClick={handleModalAction}>Move Funds</button>
                </div>
              </>
            )}

            {modal === "withdraw-savings" && (
              <>
                <p className="modal-title">💸 Withdraw for Personal Use</p>
                <p className="modal-sub">Available savings: <strong style={{ color: "var(--c-ok)" }}>{format(interestSavings)}</strong></p>
                <div className="modal-field">
                  <label className="field-label">Amount (₱)</label>
                  <input type="number" className="form-input" value={modalAmt} onChange={(e) => setModalAmt(e.target.value)} placeholder="0" autoFocus />
                </div>
                <div className="modal-field">
                  <label className="field-label">Notes (optional)</label>
                  <input type="text" className="form-input" value={modalNote} onChange={(e) => setModalNote(e.target.value)} placeholder="e.g. groceries, bills, personal…" />
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => setModal(null)}>Cancel</button>
                  <button className="confirm-btn danger-confirm" onClick={handleModalAction}>Withdraw</button>
                </div>
              </>
            )}

            {modal === "pay-guarantor" && modalGuarantor && (
              <>
                <p className="modal-title">Pay Guarantor Cut</p>
                <p className="modal-sub">Paying <strong>{modalGuarantor.name}</strong> — owed: <strong style={{ color: "var(--c-warn)" }}>{format(modalGuarantor.maxAmt)}</strong></p>
                <div className="modal-field">
                  <label className="field-label">Amount (₱)</label>
                  <input type="number" className="form-input" value={modalAmt} onChange={(e) => setModalAmt(e.target.value)} placeholder={modalGuarantor.maxAmt.toFixed(2)} autoFocus />
                </div>
                <div className="modal-field">
                  <label className="field-label">Notes (optional)</label>
                  <input type="text" className="form-input" value={modalNote} onChange={(e) => setModalNote(e.target.value)} placeholder="e.g. cash, GCash, partial…" />
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => { setModal(null); setModalGuarantor(null); }}>Cancel</button>
                  <button className="confirm-btn warn-confirm" onClick={handleModalAction}>Record Payout</button>
                </div>
              </>
            )}

            {modal === "installment" && modalLoan && <InstallmentModalContent />}

          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="page-header ld-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="page-title">{displayName}'s <span>Lending Money</span></h1>
        <p className="page-sub">5–6 lending ledger · Interest scales continuously past 40 days · Installments auto-split to savings & fund</p>
      </header>

      {/* ── Wallet Strip ───────────────────────────────────── */}
      <div className="wallet-strip ld-fade-up" style={{ animationDelay: "40ms" }}>
        <div className="wallet-card">
          <span className="wallet-label">Investment Fund</span>
          <div className="wallet-value accent">{format(investmentFund)}</div>
          <div className="wallet-actions">
            <button className="wallet-btn" onClick={() => { setModal("add-invest"); setModalAmt(""); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="12" height="12"><path d="M12 5v14M5 12h14"/></svg>
              Add Funds
            </button>
          </div>
        </div>

        <div className="wallet-card warn">
          <span className="wallet-label">Lent Out (Active)</span>
          <div className="wallet-value warn">{format(activeLent)}</div>
        </div>

        <div className="wallet-card ok">
          <span className="wallet-label">Total Fund</span>
          <div className="wallet-value ok">{format(totalFund)}</div>
          <div className="wallet-sub">
            <span>{format(investmentFund)}</span> invest + <span>{format(interestSavings)}</span> savings
          </div>
        </div>

        <div className="wallet-card accent2">
          <span className="wallet-label">Interest Savings</span>
          <div className="wallet-value accent">{format(interestSavings)}</div>
          <div className="wallet-actions">
            <button className="wallet-btn ok-btn" onClick={() => { setModal("move-savings"); setModalAmt(""); setModalNote(""); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              Invest
            </button>
            <button className="wallet-btn danger-btn" onClick={() => { setModal("withdraw-savings"); setModalAmt(""); setModalNote(""); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M12 2v13M5 9l7 7 7-7"/><path d="M3 21h18"/></svg>
              Withdraw
            </button>
          </div>
          {(withdrawals as any[]).length > 0 && (
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--c-text3)" }}>
              Withdrawn: <span style={{ color: "var(--c-danger)", fontWeight: 700 }}>{format(totalWithdrawn)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Strip ──────────────────────────────────── */}
      <div className="stat-strip ld-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="stat-card">
          <span className="stat-label">Active capital out</span>
          <span className="stat-value">{format(totals.totalCapital)}</span>
        </div>
        <div className="stat-card accent2">
          <span className="stat-label">Projected interest</span>
          <span className="stat-value">{format(totals.totalInterest)}</span>
        </div>
        <div className="stat-card warn">
          <span className="stat-label">Guarantor cuts (active)</span>
          <span className="stat-value">{format(totals.totalGuarantorCuts)}</span>
        </div>
        <div className="stat-card ok">
          <span className="stat-label">Net interest (yours)</span>
          <span className="stat-value">{format(totals.netInterest)}</span>
        </div>
      </div>

      {/* ── Savings Withdrawal History ─────── */}
      {(withdrawals as any[]).length > 0 && (
        <div className="section-panel ld-fade-up" style={{ animationDelay: "80ms" }}>
          <div className={`section-header${showWithdrawHistory ? " open" : ""}`}
            onClick={() => setShowWithdrawHistory((v) => !v)}>
            <div className="section-header-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-danger)" strokeWidth="1.8" width="16" height="16">
                <path d="M12 2v13M5 9l7 7 7-7"/><path d="M3 21h18" strokeLinecap="round"/>
              </svg>
              <span className="section-title">Personal Withdrawals</span>
              <span className="section-badge danger">{format(totalWithdrawn)} total</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
              style={{ transform: showWithdrawHistory ? "rotate(180deg)" : "none", transition: "transform .2s", color: "var(--c-text3)" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          {showWithdrawHistory && (
            <div className="section-body">
              <p className="section-sub-title">Withdrawal History</p>
              {(withdrawals as any[]).map((w) => (
                <div key={w.id} className="withdraw-row">
                  <div>
                    <div className="withdraw-row-amt">− {format(Number(w.amount))}</div>
                    {w.notes && <div className="withdraw-row-note">{w.notes}</div>}
                  </div>
                  <div className="withdraw-row-date">{w.withdrawn_at}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Guarantor Cuts Panel ───────────── */}
      <div className="section-panel ld-fade-up" style={{ animationDelay: "100ms" }}>
        <div className={`section-header${showGuarantorPanel ? " open" : ""}`}
          onClick={() => setShowGuarantorPanel((v) => !v)}>
          <div className="section-header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-warn)" strokeWidth="1.8" width="16" height="16">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="section-title">Guarantor Cuts</span>
            {guarantorSummary.length > 0 && (
              <span className="section-badge">{guarantorSummary.length} pending</span>
            )}
            {guarantorSummary.length === 0 && (guarantorPayouts as any[]).length > 0 && (
              <span className="section-badge ok">All settled ✓</span>
            )}
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
            style={{ transform: showGuarantorPanel ? "rotate(180deg)" : "none", transition: "transform .2s", color: "var(--c-text3)" }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        {showGuarantorPanel && (
          <div className="section-body">
            <p className="section-sub-title">Pending Payouts</p>
            {guarantorSummary.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--c-text3)", paddingBottom: 4 }}>
                No pending guarantor cuts — all paid out 🎉
              </p>
            ) : (
              guarantorSummary.map((g) => (
                <div key={g.name} className="guarantor-row">
                  <div>
                    <div className="guarantor-name-cell">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" style={{ color: "var(--c-warn)", flexShrink: 0 }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      </svg>
                      {g.name}
                    </div>
                    <div className="guarantor-loan-count">{g.loans.length} loan{g.loans.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="guarantor-owed">{format(g.totalCut)}</div>
                    <button className="give-cut-btn" onClick={() => {
                      setModalGuarantor({ name: g.name, loanId: g.loans[0]?.id ?? "", maxAmt: g.totalCut });
                      setModalAmt(g.totalCut.toFixed(2));
                      setModalNote("");
                      setModal("pay-guarantor");
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                      </svg>
                      Give Cut
                    </button>
                  </div>
                </div>
              ))
            )}

            {(guarantorPayouts as any[]).length > 0 && (
              <>
                <p className="section-sub-title" style={{ marginTop: 20 }}>
                  Payout History — Total paid out: <span style={{ color: "var(--c-ok)" }}>{format(totalPaidOutGuarantor)}</span>
                </p>
                {(guarantorPayouts as any[]).map((p) => (
                  <div key={p.id} className="payout-row">
                    <div>
                      <div className="payout-row-name">{p.guarantor_name}</div>
                      {p.notes && <div style={{ fontSize: 11, color: "var(--c-text3)", marginTop: 1 }}>{p.notes}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="payout-row-amt">{format(Number(p.amount))}</div>
                      <div className="payout-row-date">{p.paid_at}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Form + Calculator ──────────────────────────────── */}
      <div className="main-grid ld-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="panel">
          <p className="panel-heading">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M15 6.17A6 6 0 1 1 6.17 15" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Record a loan
          </p>
          <div className="form-grid">
            <div>
              <label className="field-label">Borrower name</label>
              <input className="form-input" value={borrower} onChange={(e) => setBorrower(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="field-label">Guarantor (optional)</label>
              <input className="form-input" value={guarantor} onChange={(e) => setGuarantor(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="field-label">Capital (₱)</label>
              <input className="form-input" type="number" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="field-label">Term (days) — scales past 40d</label>
              <div className="days-row">
                <input className="form-input days-input" type="number" min="1" value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)} placeholder="e.g. 41" />
                <div className="rate-pill">{(rate * 100).toFixed(2)}%</div>
              </div>
            </div>
            <div>
              <label className="field-label">Date borrowed</label>
              <input className="form-input" type="date" value={dateBorrowed} onChange={(e) => setDateBorrowed(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Notes</label>
              <Textarea rows={1} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional" className="form-textarea" style={{ resize: "none" }} />
            </div>
          </div>
          {hasGuarantor && capitalNum > 0 && (
            <div className="guarantor-info" style={{ marginTop: 14 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Guarantor cut: <strong style={{ marginLeft: 2 }}>{format(guarantorCut)}</strong>
              &nbsp;— Your net interest: <strong>{format(netInterest)}</strong>
            </div>
          )}
          <button className="submit-btn" onClick={submit} style={{ marginTop: 16 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
            Record loan
          </button>
        </div>

        <div>
          <button className="calc-toggle" onClick={() => setCalcOpen((v) => !v)} aria-expanded={calcOpen}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Calculator
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
              style={{ transform: calcOpen ? "rotate(180deg)" : "none", transition: "transform .2s", color: "var(--c-text3)" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div className={`calc-body-mobile${calcOpen ? " open" : ""}`}>
            <CalcPanel format={format} capitalNum={capitalNum} interest={interest} netInterest={netInterest}
              totalCost={totalCost} dueDate={dueDate} days={days} rate={rate}
              perDay={perDay} perWeek={perWeek} hasGuarantor={hasGuarantor} guarantorCut={guarantorCut} />
          </div>
          <div className="calc-body-desktop">
            <CalcPanel format={format} capitalNum={capitalNum} interest={interest} netInterest={netInterest}
              totalCost={totalCost} dueDate={dueDate} days={days} rate={rate}
              perDay={perDay} perWeek={perWeek} showHeading hasGuarantor={hasGuarantor} guarantorCut={guarantorCut} />
          </div>
        </div>
      </div>

      {/* ── Loans Table ────────────────────────────────────── */}
      <div className="table-card ld-fade-up" style={{ animationDelay: "180ms" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="inv-table" aria-label="Lending records">
            <thead>
              <tr>
                <th>Borrower</th><th>Guarantor</th><th>Capital</th><th>Rate</th>
                <th>Days</th><th>Borrowed</th><th>Due</th><th>Total Due</th>
                <th>Paid (Inst.)</th><th>Remaining</th>
                <th>Guar. Cut</th><th>Net Int.</th><th>Status</th>
                <th style={{ width: 130 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx): React.ReactNode[] => {
                const tot         = Number(r.capital) * (1 + Number(r.interest_rate));
                const rawInt      = Number(r.capital) * Number(r.interest_rate);
                const gCut        = r.guarantor_name ? getGuarantorCut(rawInt) : 0;
                const netInt      = rawInt - gCut;
                const loanInsts   = installmentsByLoan[r.id] ?? [];
                const instPaid    = loanInsts.reduce((s, i) => s + Number(i.amount), 0);
                const remaining   = Math.max(0, tot - instPaid);
                const progressPct = Math.min(100, (instPaid / tot) * 100);
                const hasInsts    = loanInsts.length > 0;
                const isExpanded  = expandedLoans.has(r.id);

                return [
                  <tr key={r.id} style={{ animationDelay: `${idx * 35}ms` }}>
                    <td style={{ fontWeight: 600 }}>{r.borrower_name}</td>
                    <td>
                      {r.guarantor_name
                        ? <span className="guarantor-badge">{r.guarantor_name}</span>
                        : <span style={{ color: "var(--c-text3)" }}>—</span>}
                    </td>
                    <td>{format(Number(r.capital))}</td>
                    <td>{(Number(r.interest_rate) * 100).toFixed(2)}%</td>
                    <td>{r.term_days}</td>
                    <td style={{ color: "var(--c-text2)" }}>{r.date_borrowed}</td>
                    <td style={{ color: "var(--c-text2)" }}>{r.due_date ?? "—"}</td>
                    <td style={{ fontWeight: 700 }}>{format(tot)}</td>
                    <td>
                      {hasInsts ? (
                        <div>
                          <span style={{ color: "var(--c-accent2)", fontWeight: 700 }}>{format(instPaid)}</span>
                          <div style={{ width: 60, height: 4, borderRadius: 99, background: "var(--c-border)", marginTop: 4, overflow: "hidden" }}>
                            <div style={{ width: `${progressPct}%`, height: "100%", borderRadius: 99, background: "var(--c-accent2)" }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--c-text3)" }}>—</span>
                      )}
                    </td>
                    <td style={{ color: remaining > 0 ? "var(--c-danger)" : "var(--c-ok)", fontWeight: 700 }}>
                      {remaining > 0 ? format(remaining) : "✓ Done"}
                    </td>
                    <td style={{ color: "var(--c-warn)", fontWeight: 600 }}>
                      {r.guarantor_name ? format(gCut) : "—"}
                    </td>
                    <td style={{ color: "var(--c-ok)", fontWeight: 700 }}>{format(netInt)}</td>
                    <td>
                      <span className={`badge ${r.status === "paid" ? "badge-paid" : "badge-active"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-row">
                        {r.status !== "paid" && (
                          <>
                            <button className="installment-btn" onClick={() => {
                              setModalLoan(r);
                              setModalAmt("");
                              setModalNote("");
                              setModal("installment");
                            }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                                <path d="M12 2v13M5 9l7 7 7-7"/><path d="M3 21h18"/>
                              </svg>
                              Install
                            </button>
                            <button className="paid-btn" onClick={() => markPaid(r)}>✓ Paid</button>
                          </>
                        )}
                        {hasInsts && (
                          <button
                            className={`expand-btn${isExpanded ? " expanded" : ""}`}
                            onClick={() => toggleLoanExpand(r.id)}
                            title="View installment history"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                              <path d="M6 9l6 6 6-6"/>
                            </svg>
                          </button>
                        )}
                        <button className="remove-btn" onClick={() => remove(r.id)} aria-label="Remove">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>,
                  isExpanded && hasInsts ? (
                    <tr key={`${r.id}-inst`} className="inst-history-row">
                      <td colSpan={14}>
                        <div className="inst-history-inner">
                          <div className="inst-history-title">
                            Installment History ({loanInsts.length} payment{loanInsts.length !== 1 ? "s" : ""})
                          </div>
                          {loanInsts.map((inst) => (
                            <div key={inst.id} className="inst-payment-row">
                              <span className="inst-payment-amt">{format(Number(inst.amount))}</span>
                              <span className="inst-payment-note">{inst.notes ?? "—"}</span>
                              <span className="inst-payment-date">{inst.paid_at}</span>
                            </div>
                          ))}
                          <div className="inst-progress-bar">
                            <div className="inst-progress-fill" style={{ width: `${progressPct}%` }} />
                          </div>
                          <div className="inst-progress-label">
                            <span>{progressPct.toFixed(1)}% paid</span>
                            <span style={{ color: "var(--c-text3)" }}>
                              {format(instPaid)} of {format(tot)} · <span>{format(remaining)} left</span>
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null,
                ];
              })}
              {!rows.length && (
                <tr><td colSpan={14}>
                  <div className="empty-state">
                    <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
                      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 32h20M32 22v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p>No loans yet</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Calculator Panel ───────────────────────────────────────────────────── */
function CalcPanel({
  format, capitalNum, interest, netInterest, totalCost, dueDate,
  days, rate, perDay, perWeek, showHeading, hasGuarantor, guarantorCut,
}: {
  format: (n: number) => string;
  capitalNum: number; interest: number; netInterest: number;
  totalCost: number; dueDate: string; days: number; rate: number;
  perDay: number; perWeek: number; showHeading?: boolean;
  hasGuarantor: boolean; guarantorCut: number;
}) {
  return (
    <div className="calc-panel">
      <p className="calc-heading" style={{ display: showHeading ? "flex" : "none" }}>
        <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Calculator
      </p>
      <div className="calc-row">
        <span className="calc-row-label">Capital</span>
        <span className="calc-row-value">{format(capitalNum)}</span>
      </div>
      <div className="calc-row">
        <span className="calc-row-label">Term</span>
        <span className="calc-row-value">{days} days @ {(rate * 100).toFixed(2)}%</span>
      </div>
      <div className="calc-row">
        <span className="calc-row-label">Gross interest</span>
        <span className="calc-row-value">{format(interest)}</span>
      </div>
      {hasGuarantor && (
        <div className="calc-row">
          <span className="calc-row-label">Guarantor cut (20%)</span>
          <span className="calc-row-value warn">− {format(guarantorCut)}</span>
        </div>
      )}
      <div className="calc-row">
        <span className="calc-row-label">Net interest (yours)</span>
        <span className="calc-row-value ok">{format(netInterest)}</span>
      </div>
      <div className="calc-row">
        <span className="calc-row-label">Total cost to borrower</span>
        <span className="calc-row-value big">{format(totalCost)}</span>
      </div>
      <div className="calc-row">
        <span className="calc-row-label">Due date</span>
        <span className="calc-row-value">{dueDate}</span>
      </div>
      <div className="calc-divider" />
      <div className="calc-pay-row">
        <span className="calc-pay-label">Daily payment</span>
        <span className="calc-pay-value">{format(perDay)} × {days}d</span>
      </div>
      <div className="calc-pay-row">
        <span className="calc-pay-label">Weekly payment</span>
        <span className="calc-pay-value">{format(perWeek)}</span>
      </div>
      <div className="calc-pay-row">
        <span className="calc-pay-label">Lump sum</span>
        <span className="calc-pay-value">{format(totalCost)}</span>
      </div>
      <p className="calc-note">
        Renewal: pay only the interest of <strong>{format(interest)}</strong> every {days} days.
        {hasGuarantor && <> Your net after guarantor: <strong>{format(netInterest)}</strong>.</>}
      </p>
    </div>
  );
}