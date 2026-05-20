import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/providers";
import { Fish, Watch, Coins, ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

/* ─────────────────────────────────────────────────────────────
   Ronin's Hub SVG Logo
───────────────────────────────────────────────────────────── */
function RoninLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="lp-rl-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1f2e" />
          <stop offset="100%" stopColor="#0d1017" />
        </radialGradient>
        <radialGradient id="lp-rl-gold" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f0c040" />
          <stop offset="60%" stopColor="#c8960a" />
          <stop offset="100%" stopColor="#8a6200" />
        </radialGradient>
      </defs>

      {/* Background */}
      <circle cx="256" cy="256" r="256" fill="#0d1017" />
      <circle cx="256" cy="256" r="240" fill="url(#lp-rl-bg)" />
      <circle cx="256" cy="256" r="240" fill="none" stroke="url(#lp-rl-gold)" strokeWidth="6" />

      {/* Torii — top beam */}
      <rect x="88" y="148" width="336" height="28" rx="4" fill="url(#lp-rl-gold)" />
      <rect x="72" y="138" width="60" height="18" rx="3" fill="url(#lp-rl-gold)" />
      <rect x="380" y="138" width="60" height="18" rx="3" fill="url(#lp-rl-gold)" />

      {/* Torii — second beam */}
      <rect x="120" y="196" width="272" height="18" rx="2" fill="#c8960a" opacity="0.9" />

      {/* Torii — pillars */}
      <rect x="136" y="214" width="28" height="172" rx="3" fill="url(#lp-rl-gold)" />
      <rect x="348" y="214" width="28" height="172" rx="3" fill="url(#lp-rl-gold)" />
      <rect x="122" y="380" width="56" height="12" rx="2" fill="#c8960a" />
      <rect x="334" y="380" width="56" height="12" rx="2" fill="#c8960a" />

      {/* Central coin */}
      <circle cx="256" cy="282" r="52" fill="#0d1017" />
      <circle cx="256" cy="282" r="46" fill="url(#lp-rl-gold)" />
      <circle cx="256" cy="282" r="38" fill="#0d1017" />

      {/* R monogram */}
      <rect x="242" y="256" width="7" height="50" rx="2" fill="#c8960a" />
      <path d="M249 256 Q274 256 274 270 Q274 284 249 284" fill="none" stroke="#c8960a" strokeWidth="6.5" strokeLinecap="round" />
      <line x1="249" y1="284" x2="271" y2="306" stroke="#c8960a" strokeWidth="6.5" strokeLinecap="round" />

      {/* Coin tick marks */}
      <g stroke="#c8960a" strokeWidth="2" opacity="0.5">
        <line x1="256" y1="228" x2="256" y2="238" />
        <line x1="256" y1="326" x2="256" y2="336" />
        <line x1="202" y1="282" x2="212" y2="282" />
        <line x1="300" y1="282" x2="310" y2="282" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Client-only fade-in — avoids SSR opacity:0 blank-screen trap.
───────────────────────────────────────────────────────────── */
function useFadeUp(delayMs = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity    = "0";
    el.style.transform  = "translateY(16px)";
    el.style.transition = `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms,
                            transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms`;
    const id = requestAnimationFrame(() => {
      el.style.opacity   = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(id);
  }, [delayMs]);
  return ref;
}

/* ─────────────────────────────────────────────────────────────
   Business pill data
───────────────────────────────────────────────────────────── */
const PILLS = [
  { icon: <Fish  className="h-3.5 w-3.5" />, label: "Aquatic"    },
  { icon: <Watch className="h-3.5 w-3.5" />, label: "Timepieces" },
  { icon: <Coins className="h-3.5 w-3.5" />, label: "Lending"    },
];

/* ═══════════════════════════════════════════════════════════
   LoginPage
═══════════════════════════════════════════════════════════ */
function LoginPage() {
  const navigate               = useNavigate();
  const { user }               = useAuth();
  const [email,    setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading] = useState(false);
  const [focused,  setFocused] = useState<"email" | "password" | null>(null);

  const headerRef = useFadeUp(60);
  const cardRef   = useFadeUp(120);
  const footerRef = useFadeUp(180);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  setLoading(false);
  if (error) { toast.error(error.message); return; }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.user.id)
    .maybeSingle();

  const name = profile?.display_name ?? "Ronin";
  toast.success(`Welcome back, ${name}.`);
  navigate({ to: "/" });
};
  return (
    <div className="lp-root">
      <style>{`
        /* ── Tokens ── */
        .lp-root {
          --c-bg:          #F7F4EE;
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
          --c-accent-glow: rgba(110,142,247,0.28);
          --c-hover:       #5C74D8;
          --c-shadow-sm:   0 1px 3px rgba(28,34,48,.05), 0 4px 16px rgba(110,142,247,.07);
          --c-shadow-md:   0 2px 8px rgba(28,34,48,.07), 0 8px 32px rgba(110,142,247,.14);
          --c-shadow-lg:   0 8px 40px rgba(110,142,247,.22), 0 1px 4px rgba(28,34,48,.06);
          --r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 26px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .lp-root {
          --c-bg:          #0F1117;
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
          --c-accent-glow: rgba(125,162,255,0.30);
          --c-hover:       #5E7CE2;
          --c-shadow-sm:   0 1px 3px rgba(0,0,0,.30), 0 4px 16px rgba(0,0,0,.20);
          --c-shadow-md:   0 2px 8px rgba(0,0,0,.35), 0 8px 32px rgba(0,0,0,.25);
          --c-shadow-lg:   0 8px 40px rgba(0,0,0,.45), 0 1px 4px rgba(0,0,0,.30);
        }

        .lp-root * { box-sizing: border-box; }
        .lp-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--c-bg);
        }
        @media (min-width: 1024px) { .lp-root { flex-direction: row; } }

        @keyframes lp-orb-a {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(28px,18px) scale(1.08); }
          66%     { transform: translate(-12px,24px) scale(0.96); }
        }
        @keyframes lp-orb-b {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(-24px,-20px) scale(1.1); }
          70%     { transform: translate(16px,-8px) scale(0.95); }
        }
        @keyframes lp-orb-c {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50%     { transform: translate(-50%,-50%) scale(1.25); }
        }
        @keyframes lp-sweep {
          0%,100% { background-position: -100% 0%; }
          50%     { background-position:  200% 0%; }
        }
        @keyframes lp-fade-left {
          from { opacity:0; transform: translateX(-18px); }
          to   { opacity:1; transform: translateX(0); }
        }
        @keyframes lp-pill {
          from { opacity:0; transform: scale(0.8) translateY(6px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes lp-shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        /* ── Brand panel ── */
        .lp-brand {
          position: relative;
          overflow: hidden;
          padding: clamp(32px,5vw,40px) clamp(20px,4vw,40px);
          background: linear-gradient(145deg, var(--c-accent) 0%, var(--c-accent2) 55%, var(--c-hover) 100%);
          flex-shrink: 0;
        }
        @media (min-width: 1024px) {
          .lp-brand {
            width: 50%; min-height: 100vh; padding: 56px;
            display: flex; flex-direction: column; justify-content: space-between;
          }
        }

        .lp-orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .lp-orb-a {
          top: -128px; left: -128px; width: 384px; height: 384px;
          background: radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 65%);
          animation: lp-orb-a 9s ease-in-out infinite;
        }
        .lp-orb-b {
          bottom: -80px; right: -80px; width: 288px; height: 288px;
          background: radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%);
          animation: lp-orb-b 12s ease-in-out infinite;
        }
        .lp-orb-c {
          top: 50%; left: 50%; width: 192px; height: 192px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
          animation: lp-orb-c 7s ease-in-out infinite;
        }
        .lp-grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .lp-sweep-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
          background-size: 200% 200%;
          animation: lp-sweep 6s ease-in-out infinite;
        }

        .lp-brand-content {
          position: relative; z-index: 10; color: #fff;
          display: flex; flex-direction: column; gap: 24px;
        }
        @media (min-width: 1024px) {
          .lp-brand-content { height: 100%; justify-content: space-between; gap: 0; }
        }

        /* Logo — SVG replaces the old icon box */
        .lp-logo {
          display: flex; align-items: center; gap: 12px;
          animation: lp-fade-left 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lp-logo-icon {
          /* Removed background/border — SVG is self-contained */
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .lp-logo:hover .lp-logo-icon { transform: scale(1.08); }
        .lp-logo-name {
          font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; color: #fff;
        }

        .lp-hero { animation: lp-fade-left 0.6s 0.08s cubic-bezier(0.22,1,0.36,1) both; }
        @media (max-width: 379px) { .lp-hero { display: none; } }
        .lp-hero-title {
          font-size: clamp(1.6rem,5vw,3rem); font-weight: 800;
          letter-spacing: -0.03em; line-height: 1.1; color: #fff; margin: 0 0 10px;
        }
        .lp-hero-title .muted { color: rgba(255,255,255,0.65); }
        .lp-hero-sub {
          font-size: 13px; color: rgba(255,255,255,0.50); font-weight: 400;
          letter-spacing: .06em; margin: 0 0 20px; text-transform: uppercase;
        }

        .lp-pills {
          display: flex; flex-wrap: wrap; gap: 8px;
          animation: lp-fade-left 0.6s 0.16s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lp-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 99px;
          font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          color: rgba(255,255,255,0.90);
          background: rgba(255,255,255,0.13); border: 1px solid rgba(255,255,255,0.22);
          backdrop-filter: blur(6px); cursor: default;
          transition: background .2s, transform .2s;
        }
        .lp-pill:hover { background: rgba(255,255,255,0.25); transform: translateY(-2px) scale(1.05); }

        .lp-brand-footer {
          font-size: 11px; color: rgba(255,255,255,0.32); font-weight: 400;
          display: none;
          animation: lp-fade-left 0.6s 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        @media (min-width: 1024px) { .lp-brand-footer { display: block; } }

        /* ── Form side ── */
        .lp-form-side {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: clamp(28px,5vw,48px) clamp(16px,4vw,48px);
          background: var(--c-bg);
        }
        .lp-form-inner { width: 100%; max-width: 420px; }
        .lp-form-header { margin-bottom: 24px; }
        .lp-form-title {
          font-size: clamp(1.5rem,4vw,2rem); font-weight: 800;
          letter-spacing: -0.03em; color: var(--c-text); margin: 0 0 6px;
        }
        .lp-form-sub { font-size: 14px; color: var(--c-text2); margin: 0; }

        .lp-card {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: var(--r-xl); padding: clamp(20px,4vw,32px);
          box-shadow: var(--c-shadow-lg); margin-bottom: 20px;
        }
        .lp-form-fields { display: flex; flex-direction: column; gap: 16px; }

        .lp-field-label {
          font-size: 0.72rem; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; color: var(--c-text2); display: block; margin-bottom: 6px;
        }
        .lp-field-wrap {
          position: relative; border-radius: var(--r-sm); overflow: hidden;
          background: var(--c-elevated); border: 1.5px solid var(--c-border);
          transition: border-color .18s, box-shadow .18s;
        }
        .lp-field-wrap.focused { border-color: var(--c-accent); box-shadow: 0 0 0 3px var(--c-accent-lt); }
        .lp-field-wrap:not(.focused):hover { border-color: var(--c-border-md); }
        .lp-field-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: var(--c-text3); transition: color .18s;
          display: flex; align-items: center;
        }
        .lp-field-wrap.focused .lp-field-icon { color: var(--c-accent); }
        .lp-field-input {
          width: 100%; height: 44px; padding: 0 12px 0 40px;
          background: transparent; border: none; outline: none;
          color: var(--c-text); font-size: 14px; font-family: inherit;
        }
        .lp-field-input::placeholder { color: var(--c-text3); }

        .lp-submit {
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 46px; margin-top: 4px;
          background: var(--c-accent); color: #fff; border: none;
          border-radius: var(--r-sm); font-size: 14px; font-weight: 700; font-family: inherit;
          cursor: pointer; box-shadow: 0 4px 14px var(--c-accent-glow);
          transition: background .18s, transform .16s cubic-bezier(0.34,1.56,0.64,1), box-shadow .18s, opacity .18s;
        }
        .lp-submit:hover:not(:disabled) {
          background: var(--c-hover); transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--c-accent-glow);
        }
        .lp-submit:active:not(:disabled) { transform: scale(0.97) translateY(0); box-shadow: none; }
        .lp-submit:disabled { opacity: .55; cursor: not-allowed; }
        .lp-submit::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          transform: translateX(-100%); pointer-events: none;
        }
        .lp-submit:hover:not(:disabled)::after { animation: lp-shimmer .55s ease; }

        .lp-submit-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: lp-spin 0.7s linear infinite; flex-shrink: 0;
        }
        .lp-submit-arrow { transition: transform .2s ease; }
        .lp-submit:hover:not(:disabled) .lp-submit-arrow { transform: translateX(3px); }

        .lp-footnote {
          font-size: 11.5px; text-align: center;
          color: var(--c-text3); line-height: 1.6; opacity: .8;
        }

        @media (max-width: 359px) {
          .lp-card { padding: 16px; }
          .lp-form-side { padding: 20px 14px; }
        }
      `}</style>

      {/* ════ LEFT — Brand panel ════ */}
      <div className="lp-brand">
        <div className="lp-orb lp-orb-a" />
        <div className="lp-orb lp-orb-b" />
        <div className="lp-orb lp-orb-c" />
        <div className="lp-grid-overlay" />
        <div className="lp-sweep-overlay" />

        <div className="lp-brand-content">

          {/* ── Logo — SVG replaces Fish icon ── */}
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <RoninLogo size={42} />
            </div>
            <span className="lp-logo-name">Ronin's Hub</span>
          </div>

          {/* Hero copy */}
          <div className="lp-hero">
            <h1 className="lp-hero-title">
              Three businesses.
              <br />
              <span className="muted">One quiet</span>
              <br />
              command center.
            </h1>
            <p className="lp-hero-sub">Track. Manage. Grow.</p>

            <div className="lp-pills">
              {PILLS.map(({ icon, label }, i) => (
                <div
                  key={label}
                  className="lp-pill"
                  style={{ animation: `lp-pill 0.5s ${0.24 + i * 0.07}s cubic-bezier(0.34,1.56,0.64,1) both` }}
                >
                  {icon}
                  {label}
                </div>
              ))}
            </div>
          </div>

          <p className="lp-brand-footer">Private — Owner access only.</p>
        </div>
      </div>

      {/* ════ RIGHT — Sign-in form ════ */}
      <div className="lp-form-side">
        <div className="lp-form-inner">

          <div ref={headerRef} className="lp-form-header">
            <h2 className="lp-form-title">Sign in</h2>
            <p className="lp-form-sub">Enter your credentials to access the dashboard.</p>
          </div>

          <div ref={cardRef} className="lp-card">
            <form onSubmit={handleSubmit} className="lp-form-fields">

              <div>
                <label className="lp-field-label" htmlFor="email">Email</label>
                <div className={`lp-field-wrap${focused === "email" ? " focused" : ""}`}>
                  <span className="lp-field-icon"><Mail size={15} /></span>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="lp-field-input"
                    style={{ boxShadow: "none", border: "none", background: "transparent" }}
                  />
                </div>
              </div>

              <div>
                <label className="lp-field-label" htmlFor="password">Password</label>
                <div className={`lp-field-wrap${focused === "password" ? " focused" : ""}`}>
                  <span className="lp-field-icon"><Lock size={15} /></span>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="lp-field-input"
                    style={{ boxShadow: "none", border: "none", background: "transparent" }}
                  />
                </div>
              </div>

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="lp-submit-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} className="lp-submit-arrow" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p ref={footerRef} className="lp-footnote">
            Account creation is closed.{" "}
            <span style={{ opacity: 1, color: "var(--c-text2)" }}>Contact the owner</span>{" "}
            if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}