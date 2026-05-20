import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCurrency } from "@/lib/providers";
import { Fish, Watch, Coins, Newspaper, TrendingUp, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Home — Ronin's Hub" }] }),

  // Auth guard — redirects before the component ever mounts
  beforeLoad: async ({ location }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/login", // adjust to your actual login route
        search: { redirect: location.href },
      });
    }
  },

  component: () => (
    <AppShell>
      <HomePage />
    </AppShell>
  ),
});

/* ─────────────────────────────────────────────────────────────
   Category → CSS var for badge / accent bar
───────────────────────────────────────────────────────────── */
const CATEGORY_VAR: Record<string, string> = {
  update:    "var(--color-primary)",
  watches:   "var(--color-secondary-accent)",
  fish:      "var(--color-success)",
  inflation: "var(--color-warning)",
  sales:     "var(--color-primary)",
  product:   "var(--color-secondary-accent)",
};

/* ─────────────────────────────────────────────────────────────
   Fade-in hook
───────────────────────────────────────────────────────────── */
function useFadeIn(delayMs = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = `opacity 0.45s ease ${delayMs}ms, transform 0.45s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms`;
    const raf = requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [delayMs]);
  return ref;
}

/* ═══════════════════════════════════════════════════════════
   HomePage
═══════════════════════════════════════════════════════════ */
function HomePage() {
  const { user }   = useAuth();
  const { format } = useCurrency();

  const headerRef = useFadeIn(0);
  const statsRef  = useFadeIn(80);
  const feedRef   = useFadeIn(160);

  /* ── Profile ── */
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const displayName = profile?.display_name ?? "Ronin";

  /* ── Stats ── */
  const { data: stats } = useQuery({
    queryKey: ["home-stats", user?.id],
    enabled:  !!user,
    queryFn:  async () => {
      const [aSales, tSales, lending, aInv, tInv] = await Promise.all([
        supabase.from("aquatic_sales").select("total_revenue"),
        supabase.from("timepieces_sales").select("total_revenue"),
        supabase.from("lending_records").select("capital,interest_rate").eq("status", "active"),
        supabase.from("aquatic_inventory").select("stock_in,stock_out"),
        supabase.from("timepieces_inventory").select("stock_in,stock_out"),
      ]);
      const aRev    = (aSales.data  ?? []).reduce((s, r: any) => s + Number(r.total_revenue ?? 0), 0);
      const tRev    = (tSales.data  ?? []).reduce((s, r: any) => s + Number(r.total_revenue ?? 0), 0);
      const lendOut = (lending.data ?? []).reduce(
        (s, r: any) => s + Number(r.capital ?? 0) * (1 + Number(r.interest_rate ?? 0)), 0,
      );
      const aStock = (aInv.data ?? []).reduce((s, r: any) => s + (r.stock_in - r.stock_out), 0);
      const tStock = (tInv.data ?? []).reduce((s, r: any) => s + (r.stock_in - r.stock_out), 0);
      return { aRev, tRev, lendOut, aStock, tStock };
    },
  });

  /* ── News ── */
  const { data: news, refetch } = useQuery({
    queryKey: ["news", user?.id],
    enabled:  !!user,
    queryFn:  async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  /* ── Form state ── */
  const [title,    setTitle]    = useState("");
  const [body,     setBody]     = useState("");
  const [category, setCategory] = useState("update");
  const [posting,  setPosting]  = useState(false);

  const post = async (): Promise<void> => {
  if (!title.trim() || !user) return;
  setPosting(true);
  const { error } = await supabase
    .from("news_posts")
    .insert({ title, body, category, user_id: user.id });
  setPosting(false);
  if (error) {
    toast.error(error.message);
    return;                      // ← void return, separate from toast call
  }
  setTitle(""); setBody("");
  toast.success("Post added");
  refetch();
};

  return (
    <div className="hp-root">
      <style>{`
        /* ── Tokens — Cinematic Anime Palette ── */
        .hp-root {
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
        .dark .hp-root {
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
        .hp-root * { box-sizing: border-box; }
        .hp-root { padding: clamp(12px,3vw,28px); min-height: 100vh; }

        /* ── Animations ── */
        @keyframes hp-shimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }
        @keyframes hp-float   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }

        /* ── Header ── */
        .hp-root .page-header { margin-bottom: 24px; }
        .hp-root .page-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .hp-root .page-eyebrow-icon {
          color: var(--c-accent);
          animation: hp-float 3s ease-in-out infinite;
        }
        .hp-root .page-eyebrow-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--c-accent);
        }
        .hp-root .page-title {
          font-size: clamp(1.6rem,4.5vw,2.6rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--c-text);
          margin: 0 0 6px;
        }
        .hp-root .page-title span { color: var(--c-accent); }
        .hp-root .page-sub {
          font-size: clamp(0.8rem,2vw,0.95rem);
          color: var(--c-text2);
          margin: 0;
        }

        /* ── Stat strip ── */
        .hp-root .stat-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        .hp-root .stat-card {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-md);
          padding: 18px 20px;
          box-shadow: var(--c-shadow-sm);
          position: relative;
          overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          cursor: default;
        }
        .hp-root .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--c-shadow-md);
          border-color: var(--c-border-md);
        }
        .hp-root .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--c-accent);
          border-radius: 99px 99px 0 0;
        }
        .hp-root .stat-card.accent2::before { background: var(--c-accent2); }
        .hp-root .stat-card.warn::before    { background: var(--c-warn); }

        /* Decorative orb */
        .hp-root .stat-orb {
          position: absolute;
          right: -28px; top: -28px;
          width: 110px; height: 110px;
          border-radius: 50%;
          opacity: .25;
          pointer-events: none;
          filter: blur(28px);
          transition: opacity .4s, transform .4s;
        }
        .hp-root .stat-card:hover .stat-orb { opacity: .5; transform: scale(1.12); }

        .hp-root .stat-icon-wrap {
          width: 34px; height: 34px;
          border-radius: var(--r-sm);
          background: var(--c-accent-lt);
          color: var(--c-accent);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          transition: background .2s, color .2s, transform .2s;
        }
        .hp-root .stat-card:hover .stat-icon-wrap {
          background: var(--c-accent);
          color: #fff;
          transform: scale(1.1);
        }
        .hp-root .stat-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--c-text3);
          display: block;
          margin-bottom: 6px;
        }
        .hp-root .stat-value {
          font-size: clamp(1.1rem,2.5vw,1.6rem);
          font-weight: 800;
          color: var(--c-text);
          letter-spacing: -0.02em;
          line-height: 1.2;
          word-break: break-all;
          margin-bottom: 4px;
        }
        .hp-root .stat-meta {
          font-size: 11.5px;
          color: var(--c-text3);
        }

        /* ── Main grid ── */
        .hp-root .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .hp-root .main-grid { grid-template-columns: 2fr 1fr; }
        }

        /* ── Panels ── */
        .hp-root .panel {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-xl);
          padding: clamp(16px,3vw,24px);
          box-shadow: var(--c-shadow-sm);
          transition: border-color .25s, box-shadow .25s;
        }
        .hp-root .panel:focus-within {
          border-color: var(--c-border-md);
          box-shadow: var(--c-shadow-md);
        }
        .hp-root .panel-heading {
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
        .hp-root .panel-heading svg { color: var(--c-accent); flex-shrink: 0; }
        .hp-root .panel-title {
          font-size: clamp(1rem,2.5vw,1.25rem);
          font-weight: 800;
          color: var(--c-text);
          letter-spacing: -0.02em;
          margin: 0 0 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hp-root .panel-title-icon {
          width: 30px; height: 30px;
          border-radius: var(--r-sm);
          display: flex; align-items: center; justify-content: center;
          background: var(--c-accent-lt);
          color: var(--c-accent);
          flex-shrink: 0;
        }

        /* ── News feed ── */
        .hp-root .news-list { display: flex; flex-direction: column; gap: 10px; }
        .hp-root .news-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; padding: 56px 24px;
          color: var(--c-text3); text-align: center;
        }
        .hp-root .news-empty svg { opacity: .35; }
        .hp-root .news-empty p { margin: 0; font-size: 14px; }

        /* ── News card ── */
        .hp-root .news-card {
          position: relative;
          background: var(--c-elevated);
          border: 1px solid var(--c-border);
          border-radius: var(--r-md);
          padding: 12px 14px;
          overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, padding-left .2s ease;
          cursor: default;
        }
        .hp-root .news-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--c-shadow-sm);
          border-color: var(--c-border-md);
          padding-left: 20px;
        }
        .hp-root .news-card-bar {
          position: absolute;
          left: 0; top: 10px; bottom: 10px;
          width: 3px;
          border-radius: 99px;
          transform: scaleY(0);
          opacity: 0;
          transition: transform .2s ease, opacity .2s ease;
          transform-origin: center;
        }
        .hp-root .news-card:hover .news-card-bar {
          transform: scaleY(1);
          opacity: 1;
        }
        .hp-root .news-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hp-root .news-card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--c-text);
          flex: 1;
          min-width: 0;
          margin: 0;
          line-height: 1.4;
        }
        .hp-root .news-badge {
          display: inline-flex;
          align-items: center;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 99px;
          flex-shrink: 0;
          border: 1px solid transparent;
        }
        .hp-root .news-body {
          font-size: 13px;
          color: var(--c-text2);
          margin: 8px 0 0;
          white-space: pre-wrap;
          line-height: 1.6;
        }
        .hp-root .news-time {
          font-size: 11.5px;
          color: var(--c-text3);
          margin-top: 8px;
          opacity: .8;
        }

        /* ── Form ── */
        .hp-root .form-stack { display: flex; flex-direction: column; gap: 12px; }
        .hp-root .form-input {
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
        .hp-root .form-input::placeholder { color: var(--c-text3); }
        .hp-root .form-input:hover  { border-color: var(--c-border-md); }
        .hp-root .form-input:focus  { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }
        .hp-root .form-textarea {
          width: 100%;
          min-height: 110px;
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
        .hp-root .form-textarea::placeholder { color: var(--c-text3); }
        .hp-root .form-textarea:hover { border-color: var(--c-border-md); }
        .hp-root .form-textarea:focus { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }

        /* ── Submit button ── */
        .hp-root .submit-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          height: 44px;
          width: 100%;
          background: var(--c-accent);
          color: #fff;
          border: none;
          border-radius: var(--r-sm);
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: background .18s, transform .14s, box-shadow .18s, opacity .18s;
        }
        .hp-root .submit-btn:hover:not(:disabled) {
          background: var(--c-hover);
          box-shadow: 0 4px 20px var(--c-accent-glow);
          transform: translateY(-1px);
        }
        .hp-root .submit-btn:active:not(:disabled) { transform: scale(.97); box-shadow: none; }
        .hp-root .submit-btn:disabled { opacity: .45; cursor: not-allowed; }
        .hp-root .submit-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          transform: translateX(-100%);
          pointer-events: none;
        }
        .hp-root .submit-btn:hover:not(:disabled)::after { animation: hp-shimmer .55s ease; }

        /* ── Responsive ── */
        @media (max-width: 767px) and (orientation: landscape) {
          .hp-root .page-title  { font-size: 1.5rem; }
          .hp-root .stat-strip  { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 359px) {
          .hp-root .page-title  { font-size: 1.35rem; }
          .hp-root .panel       { padding: 14px; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <header ref={headerRef} className="page-header">
        <div className="page-eyebrow">
          <Sparkles size={14} className="page-eyebrow-icon" />
          <span className="page-eyebrow-label">Dashboard</span>
        </div>
        <h1 className="page-title">
          Welcome back, <span>{displayName}.</span>
        </h1>
        <p className="page-sub">News, updates and a quick pulse on all three businesses.</p>
      </header>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div ref={statsRef} className="stat-strip" aria-label="Business overview">
        <StatCard
          icon={<Fish size={16} />}
          label="Aquatic revenue"
          value={format(stats?.aRev   ?? 0)}
          sub={`Stock: ${stats?.aStock ?? 0} fish`}
          accentClass=""
          orbColor="#6E8EF7"
        />
        <StatCard
          icon={<Watch size={16} />}
          label="Timepieces revenue"
          value={format(stats?.tRev   ?? 0)}
          sub={`Stock: ${stats?.tStock ?? 0} watches`}
          accentClass="accent2"
          orbColor="#8878FF"
        />
        <StatCard
          icon={<Coins size={16} />}
          label="Lending out"
          value={format(stats?.lendOut ?? 0)}
          sub="Active principal + interest"
          accentClass="warn"
          orbColor="#C9995D"
        />
      </div>

      {/* ── Feed + Form ────────────────────────────────────── */}
      <div ref={feedRef} className="main-grid">

        {/* News feed */}
        <div className="panel">
          <p className="panel-title">
            <span className="panel-title-icon">
              <Newspaper size={15} />
            </span>
            Updates &amp; News
          </p>

          <div className="news-list">
            {news?.length === 0 && (
              <div className="news-empty">
                <Newspaper size={36} />
                <p>No posts yet. Add the first one →</p>
              </div>
            )}
            {news?.map((n: any, i: number) => (
              <NewsCard key={n.id} news={n} index={i} />
            ))}
          </div>
        </div>

        {/* Post form */}
        <div className="panel">
          <p className="panel-title">
            <span
              className="panel-title-icon"
              style={{ background: "rgba(136,120,255,0.12)", color: "var(--c-accent2)" }}
            >
              <TrendingUp size={15} />
            </span>
            Add an update
          </p>

          <div className="form-stack">
            <Input
              placeholder="Title — e.g. Inflation update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="form-input" style={{ height: 42 }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "update",    label: "General Update" },
                  { value: "watches",   label: "Watches"        },
                  { value: "fish",      label: "Fish"           },
                  { value: "inflation", label: "Inflation"      },
                  { value: "sales",     label: "Sales"          },
                  { value: "product",   label: "New Product"    },
                ].map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Write the news…"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="form-textarea"
            />

            <button
              className="submit-btn"
              onClick={post}
              disabled={posting || !title.trim()}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {posting ? "Posting…" : "Post update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   StatCard
═══════════════════════════════════════════════════════════ */
interface StatCardProps {
  icon:        React.ReactNode;
  label:       string;
  value:       string;
  sub:         string;
  accentClass: string;
  orbColor:    string;
}

function StatCard({ icon, label, value, sub, accentClass, orbColor }: StatCardProps) {
  return (
    <div className={`stat-card${accentClass ? ` ${accentClass}` : ""}`}>
      <div className="stat-orb" style={{ background: orbColor }} />
      <div className="stat-icon-wrap">{icon}</div>
      <span className="stat-label">{label}</span>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">{sub}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NewsCard
═══════════════════════════════════════════════════════════ */
function NewsCard({ news: n, index }: { news: any; index: number }) {
  const accentVar = CATEGORY_VAR[n.category] ?? CATEGORY_VAR.update;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity    = "0";
    el.style.transform  = "translateX(-10px)";
    el.style.transition = `opacity 0.35s ease ${index * 60}ms, transform 0.35s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms`;
    const raf = requestAnimationFrame(() => {
      el.style.opacity   = "1";
      el.style.transform = "translateX(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);

  return (
    <article ref={ref} className="news-card">
      <div className="news-card-bar" style={{ background: accentVar }} />

      <div className="news-card-top">
        <h3 className="news-card-title">{n.title}</h3>
        <span
          className="news-badge"
          style={{
            background:  `color-mix(in srgb, ${accentVar} 14%, transparent)`,
            color:       accentVar,
            borderColor: `color-mix(in srgb, ${accentVar} 22%, transparent)`,
          }}
        >
          {n.category}
        </span>
      </div>

      {n.body && <p className="news-body">{n.body}</p>}

      <p className="news-time">
        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
      </p>
    </article>
  );
}