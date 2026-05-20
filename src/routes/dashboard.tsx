import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCurrency } from "@/lib/providers";
import { bucketByMonth, bucketByYear, mergeRevExp } from "@/lib/aggregate";
import { MonthYearChart } from "@/components/MonthYearChart";
import {
  Fish, Watch, Coins, TrendingUp, TrendingDown, Minus, PiggyBank,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie, Legend, CartesianGrid,
} from "recharts";
import { format as fmtDate, parseISO, startOfMonth } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LendingRecord {
  id: string;
  user_id: string;
  capital: number | string;
  interest_rate: number | string;
  date_borrowed: string;
  due_date?: string;
  received_date?: string;
  status: "active" | "paid";
  guarantor_name?: string | null;
  guarantor_cut?: number | string | null;
  net_interest?: number | string | null;
}

interface LendingWallet {
  id: string;
  user_id: string;
  investment_fund: number | string;
  interest_savings: number | string;
}

interface SavingsWithdrawal {
  amount: number | string;
  withdrawn_at: string;
}

interface GuarantorPayoutRecord {
  amount: number | string;
  guarantor_name: string;
  paid_at: string;
}

interface DashboardData {
  a: {
    sales: { date: string; amount: number }[];
    exp:   { date: string; amount: number }[];
  };
  t: {
    sales: { date: string; amount: number }[];
    exp:   { date: string; amount: number }[];
  };
  lending:          LendingRecord[];
  wallet:           LendingWallet | null;
  withdrawals:      SavingsWithdrawal[];
  guarantorPayouts: GuarantorPayoutRecord[];
}

// ─── Route ───────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Ronin's Hub" }] }),

  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },

  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const GUARANTOR_CUT_RATE = 0.20;

function calcGuarantorCut(interest: number): number {
  return interest * GUARANTOR_CUT_RATE;
}

function fmtM(iso: string): string {
  try { return fmtDate(startOfMonth(parseISO(iso)), "MMM yy"); } catch { return iso; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function DashboardPage() {
  const { user }   = useAuth();
  const { format } = useCurrency();

  // FIX: avoid hydration mismatch — derive today's date client-side only
  const [today, setToday] = useState<string>("");
  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);

  // ── Profile ──
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const displayName = profile?.display_name ?? "Ronin";

  // ── Main data ──
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("Unauthenticated");
      const uid = user.id;

      const [aS, tS, aE, tE, lend, wallet, withdrawals, guarantorPayouts] = await Promise.all([
        supabase.from("aquatic_sales").select("sale_date,total_revenue").eq("user_id", uid),
        supabase.from("timepieces_sales").select("sale_date,total_revenue").eq("user_id", uid),
        supabase.from("aquatic_expenses").select("expense_date,amount").eq("user_id", uid),
        supabase.from("timepieces_expenses").select("expense_date,amount").eq("user_id", uid),
        supabase.from("lending_records").select("*").eq("user_id", uid).order("date_borrowed", { ascending: true }),
        (supabase as any).from("lending_wallet").select("*").eq("user_id", uid).maybeSingle(),
        (supabase as any).from("savings_withdrawals").select("amount,withdrawn_at").eq("user_id", uid).order("withdrawn_at", { ascending: true }),
        (supabase as any).from("guarantor_payout_records").select("amount,guarantor_name,paid_at").eq("user_id", uid),
      ]);

      return {
        a: {
          sales: (aS.data ?? []).map((r) => ({ date: r.sale_date,    amount: Number(r.total_revenue) })),
          exp:   (aE.data ?? []).map((r) => ({ date: r.expense_date, amount: Number(r.amount) })),
        },
        t: {
          sales: (tS.data ?? []).map((r) => ({ date: r.sale_date,    amount: Number(r.total_revenue) })),
          exp:   (tE.data ?? []).map((r) => ({ date: r.expense_date, amount: Number(r.amount) })),
        },
        lending:          (lend.data              ?? []) as LendingRecord[],
        wallet:           (wallet.data            ?? null) as LendingWallet | null,
        withdrawals:      ((withdrawals.data      ?? []) as unknown) as SavingsWithdrawal[],
        guarantorPayouts: ((guarantorPayouts.data ?? []) as unknown) as GuarantorPayoutRecord[],
      };
    },
  });

  // ── Business aggregates ──
  const aMonth = useMemo(() => data ? mergeRevExp(bucketByMonth(data.a.sales), bucketByMonth(data.a.exp)) : [], [data]);
  const aYear  = useMemo(() => data ? mergeRevExp(bucketByYear(data.a.sales),  bucketByYear(data.a.exp))  : [], [data]);
  const tMonth = useMemo(() => data ? mergeRevExp(bucketByMonth(data.t.sales), bucketByMonth(data.t.exp)) : [], [data]);
  const tYear  = useMemo(() => data ? mergeRevExp(bucketByYear(data.t.sales),  bucketByYear(data.t.exp))  : [], [data]);

  const aRev = data?.a.sales.reduce((s, r) => s + r.amount, 0) ?? 0;
  const aExp = data?.a.exp.reduce((s, r)   => s + r.amount, 0) ?? 0;
  const tRev = data?.t.sales.reduce((s, r) => s + r.amount, 0) ?? 0;
  const tExp = data?.t.exp.reduce((s, r)   => s + r.amount, 0) ?? 0;

  // ── Lending derived ──
  const allLoans    = data?.lending ?? [];
  const activeLoans = useMemo(() => allLoans.filter((l) => l.status === "active"), [allLoans]);
  const paidLoans   = useMemo(() => allLoans.filter((l) => l.status === "paid"),   [allLoans]);

  const activeLent      = activeLoans.reduce((s, l) => s + Number(l.capital), 0);
  const projInterest    = activeLoans.reduce((s, l) => s + Number(l.capital) * Number(l.interest_rate), 0);
  const projGuarCuts    = activeLoans
    .filter((l) => l.guarantor_name)
    .reduce((s, l) => s + calcGuarantorCut(Number(l.capital) * Number(l.interest_rate)), 0);
  const projNetInterest = projInterest - projGuarCuts;

  const investmentFund   = Number(data?.wallet?.investment_fund  ?? 0);
  const interestSavings  = Number(data?.wallet?.interest_savings ?? 0);
  const availableToLend  = Math.max(0, investmentFund - activeLent);
  const totalWithdrawn   = (data?.withdrawals    ?? []).reduce((s, w) => s + Number(w.amount), 0);
  const totalGuarPaidOut = (data?.guarantorPayouts ?? []).reduce((s, p) => s + Number(p.amount), 0);

  // ── Pending guarantor cuts ──
  const { pendingGuarEntries, pendingGuarTotal } = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of paidLoans) {
      if (!l.guarantor_name) continue;
      const cut = Number(l.guarantor_cut ?? calcGuarantorCut(Number(l.capital) * Number(l.interest_rate)));
      map[l.guarantor_name] = (map[l.guarantor_name] ?? 0) + cut;
    }
    for (const p of (data?.guarantorPayouts ?? [])) {
      const name = p.guarantor_name?.trim();
      if (map[name]) map[name] -= Number(p.amount) || 0;
    }
    const entries = Object.values(map).filter((v) => v > 0.005);
    return { pendingGuarEntries: entries, pendingGuarTotal: entries.reduce((s, v) => s + v, 0) };
  }, [paidLoans, data?.guarantorPayouts]);

  const pendingGuarCount = pendingGuarEntries.length;

  const allTimeEarned = useMemo(() => paidLoans.reduce((s, l) => {
    const rawInt = Number(l.capital) * Number(l.interest_rate);
    const gCut   = l.guarantor_name ? calcGuarantorCut(rawInt) : 0;
    return s + Number(l.net_interest ?? (rawInt - gCut));
  }, 0), [paidLoans]);

  // FIX: today is "" on first render (SSR), so overdueCount is 0 — no mismatch
  const overdueCount = useMemo(
    () => today ? activeLoans.filter((l) => l.due_date && l.due_date < today).length : 0,
    [activeLoans, today],
  );

  // ── Lending chart data ──
  const monthlyCapital = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of allLoans) {
      if (!l.date_borrowed) continue;
      const key = fmtM(l.date_borrowed);
      map[key] = (map[key] ?? 0) + Number(l.capital);
    }
    return Object.entries(map).map(([month, capital]) => ({ month, capital }));
  }, [allLoans]);

  const monthlyInterest = useMemo(() => {
    const map: Record<string, { net: number; guarantorCut: number }> = {};
    for (const l of allLoans) {
      if (!l.date_borrowed) continue;
      const key    = fmtM(l.date_borrowed);
      const rawInt = Number(l.capital) * Number(l.interest_rate);
      const gCut   = l.guarantor_name ? calcGuarantorCut(rawInt) : 0;
      if (!map[key]) map[key] = { net: 0, guarantorCut: 0 };
      map[key].net          += rawInt - gCut;
      map[key].guarantorCut += gCut;
    }
    return Object.entries(map).map(([month, v]) => ({ month, ...v }));
  }, [allLoans]);

  const statusDonut = useMemo(() => ([
    { name: "Active", value: activeLoans.length, color: "#6E8EF7" },
    { name: "Paid",   value: paidLoans.length,   color: "#6E9F7A" },
  ] as const).filter((d) => d.value > 0), [activeLoans, paidLoans]);

  const savingsGrowth = useMemo(() => {
    const events: { date: string; delta: number }[] = [];
    for (const l of paidLoans) {
      const date = l.received_date ?? l.due_date ?? l.date_borrowed;
      if (!date) continue;
      const rawInt = Number(l.capital) * Number(l.interest_rate);
      const gCut   = l.guarantor_name ? calcGuarantorCut(rawInt) : 0;
      events.push({ date, delta: Number(l.net_interest ?? (rawInt - gCut)) });
    }
    for (const w of (data?.withdrawals ?? [])) {
      events.push({ date: w.withdrawn_at, delta: -Number(w.amount) });
    }
    events.sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    const byMonth: Record<string, number> = {};
    for (const e of events) {
      running += e.delta;
      byMonth[fmtM(e.date)] = Math.max(0, running);
    }
    return Object.entries(byMonth).map(([month, savings]) => ({ month, savings }));
  }, [paidLoans, data?.withdrawals]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="db-root">
      <style>{`
        .db-root {
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
        .dark .db-root {
          --c-bg:#0F1117;--c-bg2:#161A22;--c-surface:#1D2330;
          --c-elevated:#252C3D;--c-border:#2C3445;--c-border-md:#3d4a60;
          --c-text:#F4F1EA;--c-text2:#A2AAB8;--c-text3:#6F7785;
          --c-accent:#7DA2FF;--c-accent2:#9A84FF;
          --c-accent-lt:rgba(125,162,255,0.12);--c-accent-glow:rgba(125,162,255,0.24);
          --c-hover:#5E7CE2;--c-ok:#89B89A;--c-warn:#D6A86A;--c-danger:#D67C7C;
          --c-shadow-sm:0 1px 3px rgba(0,0,0,.30),0 4px 16px rgba(0,0,0,.20);
          --c-shadow-md:0 2px 8px rgba(0,0,0,.35),0 8px 32px rgba(0,0,0,.25);
        }
        .db-root*{box-sizing:border-box;}
        .db-root{padding:clamp(12px,3vw,28px);min-height:100vh;}

        @keyframes db-fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes db-shimmer{from{background-position:-200% center}to{background-position:200% center}}
        .db-fade-up{animation:db-fadeUp .38s cubic-bezier(.22,.68,0,1.2) both;}

        .db-root .page-header{margin-bottom:24px;}
        .db-root .page-header-inner{display:flex;align-items:center;gap:14px;}
        .db-root .page-icon{width:44px;height:44px;border-radius:var(--r-md);background:var(--c-accent);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 16px var(--c-accent-glow);flex-shrink:0;}
        .db-root .page-title{font-size:clamp(1.6rem,4.5vw,2.6rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1;color:var(--c-text);margin:0 0 4px;}
        .db-root .page-title span{color:var(--c-accent);}
        .db-root .page-sub{font-size:clamp(0.8rem,2vw,0.95rem);color:var(--c-text2);margin:0;}

        .db-root .section-label{font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--c-text3);margin:0 0 10px;display:flex;align-items:center;gap:8px;}
        .db-root .section-label::after{content:'';flex:1;height:1px;background:var(--c-border);}

        .db-root .stat-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:20px;}
        .db-root .stat-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:18px 20px;box-shadow:var(--c-shadow-sm);position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s;}
        .db-root .stat-card:hover{transform:translateY(-2px);box-shadow:var(--c-shadow-md);border-color:var(--c-border-md);}
        .db-root .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--c-accent);border-radius:99px 99px 0 0;}
        .db-root .stat-card.accent2::before{background:var(--c-accent2);}
        .db-root .stat-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .db-root .stat-icon-wrap{width:32px;height:32px;border-radius:var(--r-sm);background:var(--c-accent-lt);color:var(--c-accent);display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;}
        .db-root .stat-card:hover .stat-icon-wrap{background:var(--c-accent);color:#fff;}
        .db-root .stat-trend{display:flex;align-items:center;}
        .db-root .stat-trend.positive{color:var(--c-ok);}
        .db-root .stat-trend.negative{color:var(--c-danger);}
        .db-root .stat-trend.neutral{color:var(--c-text3);}
        .db-root .stat-label{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);display:block;margin-bottom:6px;}
        .db-root .stat-value{font-size:clamp(1.1rem,2.5vw,1.6rem);font-weight:800;color:var(--c-text);letter-spacing:-0.02em;line-height:1.2;word-break:break-all;}
        .db-root .stat-value.negative{color:var(--c-danger);}
        .db-root .stat-meta{font-size:11.5px;color:var(--c-text3);margin-top:4px;}

        .db-root .lending-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:12px;}
        .db-root .lending-mini{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:14px 16px;box-shadow:var(--c-shadow-sm);position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s;}
        .db-root .lending-mini:hover{transform:translateY(-2px);box-shadow:var(--c-shadow-md);border-color:var(--c-border-md);}
        .db-root .lending-mini::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:99px 99px 0 0;background:var(--c-accent);}
        .db-root .lending-mini.ok::before{background:var(--c-ok);}
        .db-root .lending-mini.warn::before{background:var(--c-warn);}
        .db-root .lending-mini.accent2::before{background:var(--c-accent2);}
        .db-root .lm-label{font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text3);display:block;margin-bottom:5px;}
        .db-root .lm-value{font-size:clamp(.9rem,2vw,1.15rem);font-weight:800;color:var(--c-text);letter-spacing:-0.02em;line-height:1.2;word-break:break-all;}
        .db-root .lm-value.accent{color:var(--c-accent);}
        .db-root .lm-value.ok{color:var(--c-ok);}
        .db-root .lm-value.warn{color:var(--c-warn);}
        .db-root .lm-sub{font-size:10.5px;color:var(--c-text3);margin-top:3px;}

        .db-root .overdue-alert{display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(199,107,107,.08);border:1px solid rgba(199,107,107,.28);border-radius:var(--r-md);margin-bottom:14px;font-size:13px;color:var(--c-danger);font-weight:600;}

        .db-root .earned-banner{display:flex;align-items:center;justify-content:space-between;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:14px 20px;box-shadow:var(--c-shadow-sm);gap:16px;flex-wrap:wrap;margin-bottom:20px;}

        .db-root .chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;}
        @media(max-width:860px){.db-root .chart-grid{grid-template-columns:1fr;}}
        .db-root .chart-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);padding:clamp(16px,3vw,22px);box-shadow:var(--c-shadow-sm);transition:border-color .25s,box-shadow .25s;overflow:hidden;}
        .db-root .chart-card:hover{border-color:var(--c-border-md);box-shadow:var(--c-shadow-md);}
        .db-root .chart-card-title{font-size:.9rem;font-weight:800;color:var(--c-text);letter-spacing:-0.01em;margin:0 0 2px;}
        .db-root .chart-card-sub{font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-text3);margin:0 0 16px;}

        .db-root .biz-chart-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);padding:clamp(16px,3vw,24px);box-shadow:var(--c-shadow-sm);margin-bottom:16px;transition:border-color .25s,box-shadow .25s;overflow:hidden;}
        .db-root .biz-chart-card:hover{border-color:var(--c-border-md);box-shadow:var(--c-shadow-md);}
        .db-root .biz-chart-title{font-size:clamp(1rem,2vw,1.15rem);font-weight:800;color:var(--c-text);letter-spacing:-0.02em;margin:0 0 3px;}
        .db-root .biz-chart-sub{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-text3);margin:0 0 20px;}

        .db-root .tab-bar{display:flex;gap:4px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:5px;width:fit-content;margin-bottom:20px;box-shadow:var(--c-shadow-sm);}
        .db-root .tab-btn{height:34px;padding:0 20px;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;text-transform:capitalize;transition:background .18s,color .18s,box-shadow .18s;color:var(--c-text2);background:transparent;}
        .db-root .tab-btn:hover{color:var(--c-text);background:var(--c-elevated);}
        .db-root .tab-btn.active{background:var(--c-accent);color:#fff;box-shadow:0 2px 10px var(--c-accent-glow);}

        .db-root .skel{background-size:200% 100%;background-image:linear-gradient(90deg,var(--c-elevated) 25%,var(--c-border) 50%,var(--c-elevated) 75%);animation:db-shimmer 1.6s ease-in-out infinite;border-radius:var(--r-sm);}

        @media(max-width:359px){.db-root .page-title{font-size:1.35rem;}.db-root .chart-card{padding:14px;}}
      `}</style>

      {/* Header */}
      <header className="page-header db-fade-up" style={{ animationDelay: "0ms" }}>
        <div className="page-header-inner">
          <div className="page-icon"><TrendingUp size={20} /></div>
          <div>
            <h1 className="page-title">
              {displayName}&apos;s <span>Dashboard</span>
            </h1>
            <p className="page-sub">
              Welcome back, {displayName}! Revenue, expenses &amp; lending across all businesses.
            </p>
          </div>
        </div>
      </header>

      {/* Business Overview */}
      <p className="section-label db-fade-up" style={{ animationDelay: "30ms" }}>Business Overview</p>
      <div className="stat-strip db-fade-up" style={{ animationDelay: "60ms" }}>
        {isLoading ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <SummaryCard
              accentClass=""
              icon={<Fish size={16} />}
              label="Ronin's Aquatic"
              net={format(aRev - aExp)}
              revenue={format(aRev)}
              expense={format(aExp)}
              positive={aRev - aExp >= 0}
              neutral={aRev - aExp === 0}
            />
            <SummaryCard
              accentClass="accent2"
              icon={<Watch size={16} />}
              label="Ronin's Timepieces"
              net={format(tRev - tExp)}
              revenue={format(tRev)}
              expense={format(tExp)}
              positive={tRev - tExp >= 0}
              neutral={tRev - tExp === 0}
            />
          </>
        )}
      </div>

      {/* Lending */}
      <p className="section-label db-fade-up" style={{ animationDelay: "90ms" }}>
        <Coins size={12} style={{ color: "var(--c-warn)" }} />
        Ronin&apos;s Lending
      </p>

      {!isLoading && overdueCount > 0 && (
        <div className="overdue-alert db-fade-up" style={{ animationDelay: "95ms" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {overdueCount} active loan{overdueCount !== 1 ? "s are" : " is"} past due — check the lending page.
        </div>
      )}

      {/* Fund health */}
      <div className="lending-strip db-fade-up" style={{ animationDelay: "110ms" }}>
        {isLoading ? (
          <><SkeletonMini /><SkeletonMini /><SkeletonMini /></>
        ) : (
          <>
            <div className="lending-mini">
              <span className="lm-label">Investment Fund</span>
              <div className="lm-value accent">{format(investmentFund)}</div>
              <div className="lm-sub">Total capital pool</div>
            </div>
            <div className="lending-mini warn">
              <span className="lm-label">Lent Out (Active)</span>
              <div className="lm-value warn">{format(activeLent)}</div>
              <div className="lm-sub">{activeLoans.length} active loan{activeLoans.length !== 1 ? "s" : ""}</div>
            </div>
            <div className="lending-mini ok">
              <span className="lm-label">Available to Lend</span>
              <div className="lm-value ok">{format(availableToLend)}</div>
              <div className="lm-sub">Fund minus active capital</div>
            </div>
          </>
        )}
      </div>

      {/* Earnings */}
      <div className="lending-strip db-fade-up" style={{ animationDelay: "125ms" }}>
        {isLoading ? (
          <><SkeletonMini /><SkeletonMini /><SkeletonMini /><SkeletonMini /></>
        ) : (
          <>
            <div className="lending-mini accent2">
              <span className="lm-label">Projected Interest</span>
              <div className="lm-value" style={{ color: "var(--c-accent2)" }}>{format(projInterest)}</div>
              <div className="lm-sub">If all active loans pay</div>
            </div>
            <div className="lending-mini ok">
              <span className="lm-label">Net Interest (Yours)</span>
              <div className="lm-value ok">{format(projNetInterest)}</div>
              <div className="lm-sub">After guarantor cuts</div>
            </div>
            <div className="lending-mini ok">
              <span className="lm-label">Interest Savings</span>
              <div className="lm-value ok">{format(interestSavings)}</div>
              <div className="lm-sub">{format(totalWithdrawn)} withdrawn</div>
            </div>
            <div className={`lending-mini${pendingGuarTotal > 0 ? " warn" : " ok"}`}>
              <span className="lm-label">Guarantor Cuts Owed</span>
              <div className={`lm-value${pendingGuarTotal > 0 ? " warn" : " ok"}`}>
                {pendingGuarTotal > 0 ? format(pendingGuarTotal) : "All settled ✓"}
              </div>
              <div className="lm-sub">
                {pendingGuarTotal > 0
                  ? `${pendingGuarCount} guarantor${pendingGuarCount !== 1 ? "s" : ""} pending`
                  : `${format(totalGuarPaidOut)} total paid out`}
              </div>
            </div>
          </>
        )}
      </div>

      {/* All-time earned banner */}
      {!isLoading && paidLoans.length > 0 && (
        <div className="earned-banner db-fade-up" style={{ animationDelay: "138ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", background: "rgba(110,159,122,.12)", color: "var(--c-ok)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PiggyBank size={16} />
            </div>
            <div>
              <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--c-text3)", marginBottom: 2 }}>All-Time Earned (Paid Loans)</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--c-ok)", letterSpacing: "-0.02em" }}>{format(allTimeEarned)}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--c-text3)", marginBottom: 2 }}>Loans Completed</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--c-text)" }}>{paidLoans.length}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--c-text3)", marginBottom: 2 }}>Capital Recovered</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--c-text)" }}>
                {format(paidLoans.reduce((s, l) => s + Number(l.capital), 0))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lending Charts */}
      {!isLoading && allLoans.length > 0 && (
        <div className="chart-grid db-fade-up" style={{ animationDelay: "150ms" }}>

          <div className="chart-card">
            <h3 className="chart-card-title">Capital Lent Out</h3>
            <p className="chart-card-sub">Monthly lending volume</p>
            {monthlyCapital.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyCapital} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--c-text3)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--c-text3)" }} axisLine={false} tickLine={false} width={72} tickFormatter={(v: number) => format(v)} />
                  <Tooltip
                    contentStyle={{ background: "var(--c-surface)", border: "1px solid var(--c-border-md)", borderRadius: 10, fontSize: 12, fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }}
                    formatter={(v: number) => [format(v), "Capital"]}
                    cursor={{ fill: "var(--c-accent-lt)" }}
                  />
                  <Bar dataKey="capital" fill="var(--c-accent)" radius={[5, 5, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h3 className="chart-card-title">Loan Status</h3>
            <p className="chart-card-sub">Active vs paid breakdown</p>
            {statusDonut.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusDonut} cx="50%" cy="45%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusDonut.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--c-surface)", border: "1px solid var(--c-border-md)", borderRadius: 10, fontSize: 12, fontFamily: "'DM Sans',system-ui,sans-serif" }}
                    formatter={(v: number, name: string) => [`${v} loan${v !== 1 ? "s" : ""}`, name]}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "var(--c-text2)", fontWeight: 600 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h3 className="chart-card-title">Interest Split</h3>
            <p className="chart-card-sub">Your net interest vs guarantor cuts</p>
            {monthlyInterest.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyInterest} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--c-text3)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--c-text3)" }} axisLine={false} tickLine={false} width={72} tickFormatter={(v: number) => format(v)} />
                  <Tooltip
                    contentStyle={{ background: "var(--c-surface)", border: "1px solid var(--c-border-md)", borderRadius: 10, fontSize: 12, fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }}
                    formatter={(v: number, name: string) => [format(v), name === "net" ? "Your Net" : "Guarantor Cut"]}
                    cursor={{ fill: "var(--c-accent-lt)" }}
                  />
                  <Bar dataKey="net" name="net" stackId="a" fill="var(--c-ok)" maxBarSize={40} />
                  <Bar dataKey="guarantorCut" name="guarantorCut" stackId="a" fill="var(--c-warn)" radius={[5, 5, 0, 0]} maxBarSize={40} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => (
                      <span style={{ fontSize: 12, color: "var(--c-text2)", fontWeight: 600 }}>
                        {v === "net" ? "Your Net" : "Guarantor Cut"}
                      </span>
                    )} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h3 className="chart-card-title">Savings Growth</h3>
            <p className="chart-card-sub">Cumulative interest savings over time</p>
            {savingsGrowth.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={savingsGrowth}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6E9F7A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6E9F7A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--c-text3)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--c-text3)" }} axisLine={false} tickLine={false} width={72} tickFormatter={(v: number) => format(v)} />
                  <Tooltip
                    contentStyle={{ background: "var(--c-surface)", border: "1px solid var(--c-border-md)", borderRadius: 10, fontSize: 12, fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }}
                    formatter={(v: number) => [format(v), "Savings"]}
                  />
                  <Area type="monotone" dataKey="savings" stroke="var(--c-ok)" strokeWidth={2.5}
                    fill="url(#savingsGrad)" dot={false} activeDot={{ r: 5, fill: "var(--c-ok)", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      )}

      {/* Business Revenue Charts */}
      <p className="section-label db-fade-up" style={{ animationDelay: "180ms" }}>Revenue vs Expenses</p>
      <div className="db-fade-up" style={{ animationDelay: "200ms" }}>
        <ChartTabs aMonth={aMonth} aYear={aYear} tMonth={tMonth} tYear={tYear} />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyChart() {
  return (
    <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--c-text3)" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28" style={{ opacity: .4 }}>
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 600 }}>No data yet</span>
    </div>
  );
}

function ChartTabs({ aMonth, aYear, tMonth, tYear }: {
  aMonth: ReturnType<typeof mergeRevExp>;
  aYear:  ReturnType<typeof mergeRevExp>;
  tMonth: ReturnType<typeof mergeRevExp>;
  tYear:  ReturnType<typeof mergeRevExp>;
}) {
  const [active, setActive] = useState<"monthly" | "yearly">("monthly");
  const datasets = active === "monthly"
    ? [{ title: "Ronin's Aquatic", sub: "Monthly revenue vs expenses", data: aMonth }, { title: "Ronin's Timepieces", sub: "Monthly revenue vs expenses", data: tMonth }]
    : [{ title: "Ronin's Aquatic", sub: "Yearly revenue vs expenses",  data: aYear  }, { title: "Ronin's Timepieces", sub: "Yearly revenue vs expenses",  data: tYear  }];

  return (
    <>
      <div className="tab-bar">
        {(["monthly", "yearly"] as const).map((v) => (
          <button key={v} className={`tab-btn${active === v ? " active" : ""}`} onClick={() => setActive(v)}>{v}</button>
        ))}
      </div>
      {datasets.map(({ title, sub, data }) => (
        <div key={title} className="biz-chart-card">
          <h3 className="biz-chart-title">{title}</h3>
          <p className="biz-chart-sub">{sub}</p>
          <div style={{ minWidth: 0, width: "100%" }}>
            <MonthYearChart title={`${title} — ${active}`} data={data} />
          </div>
        </div>
      ))}
    </>
  );
}

function SummaryCard({ icon, label, net, revenue, expense, positive, neutral, accentClass }: {
  icon: React.ReactNode;
  label: string;
  net: string;
  revenue: string;
  expense: string;
  positive: boolean;
  neutral: boolean;
  accentClass: string;
}) {
  const TrendIcon = neutral ? Minus : positive ? TrendingUp : TrendingDown;
  const trendCls  = neutral ? "neutral" : positive ? "positive" : "negative";
  return (
    <div className={`stat-card${accentClass ? ` ${accentClass}` : ""}`}>
      <div className="stat-card-top">
        <div className="stat-icon-wrap">{icon}</div>
        <div className={`stat-trend ${trendCls}`}><TrendIcon size={16} /></div>
      </div>
      <span className="stat-label">{label}</span>
      <div className={`stat-value${!positive && !neutral ? " negative" : ""}`}>{net}</div>
      <div className="stat-meta">Rev {revenue}{expense ? ` · Exp ${expense}` : ""}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="skel" style={{ width: 32, height: 32 }} />
        <div className="skel" style={{ width: 16, height: 16, borderRadius: "50%" }} />
      </div>
      <div className="skel" style={{ height: 10, width: 90, marginBottom: 10 }} />
      <div className="skel" style={{ height: 28, width: 120, marginBottom: 8 }} />
      <div className="skel" style={{ height: 10, width: 150 }} />
    </div>
  );
}

function SkeletonMini() {
  return (
    <div className="lending-mini">
      <div className="skel" style={{ height: 9, width: 70, marginBottom: 8 }} />
      <div className="skel" style={{ height: 22, width: 100, marginBottom: 6 }} />
      <div className="skel" style={{ height: 9, width: 80 }} />
    </div>
  );
}