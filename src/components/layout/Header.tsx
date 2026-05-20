import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, LogOut, Fish, Watch, Coins, ChevronDown, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useCurrency, useTheme } from "@/lib/providers";
import { useRole } from "@/hooks/use-role";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = { to: string; label: string; icon: React.ReactNode; desc?: string };

// ─── Ronin's Hub SVG Logo ─────────────────────────────────────────────────────

function RoninLogo({ size = 34 }: { size?: number }) {
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
        <radialGradient id="rl-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1f2e" />
          <stop offset="100%" stopColor="#0d1017" />
        </radialGradient>
        <radialGradient id="rl-gold" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f0c040" />
          <stop offset="60%" stopColor="#c8960a" />
          <stop offset="100%" stopColor="#8a6200" />
        </radialGradient>
      </defs>
      <circle cx="256" cy="256" r="256" fill="#0d1017" />
      <circle cx="256" cy="256" r="240" fill="url(#rl-bg)" />
      <circle cx="256" cy="256" r="240" fill="none" stroke="url(#rl-gold)" strokeWidth="6" />
      <rect x="88" y="148" width="336" height="28" rx="4" fill="url(#rl-gold)" />
      <rect x="72" y="138" width="60" height="18" rx="3" fill="url(#rl-gold)" />
      <rect x="380" y="138" width="60" height="18" rx="3" fill="url(#rl-gold)" />
      <rect x="120" y="196" width="272" height="18" rx="2" fill="#c8960a" opacity="0.9" />
      <rect x="136" y="214" width="28" height="172" rx="3" fill="url(#rl-gold)" />
      <rect x="348" y="214" width="28" height="172" rx="3" fill="url(#rl-gold)" />
      <rect x="122" y="380" width="56" height="12" rx="2" fill="#c8960a" />
      <rect x="334" y="380" width="56" height="12" rx="2" fill="#c8960a" />
      <circle cx="256" cy="282" r="52" fill="#0d1017" />
      <circle cx="256" cy="282" r="46" fill="url(#rl-gold)" />
      <circle cx="256" cy="282" r="38" fill="#0d1017" />
      <rect x="242" y="256" width="7" height="50" rx="2" fill="#c8960a" />
      <path d="M249 256 Q274 256 274 270 Q274 284 249 284" fill="none" stroke="#c8960a" strokeWidth="6.5" strokeLinecap="round" />
      <line x1="249" y1="284" x2="271" y2="306" stroke="#c8960a" strokeWidth="6.5" strokeLinecap="round" />
      <g stroke="#c8960a" strokeWidth="2" opacity="0.5">
        <line x1="256" y1="228" x2="256" y2="238" />
        <line x1="256" y1="326" x2="256" y2="336" />
        <line x1="202" y1="282" x2="212" y2="282" />
        <line x1="300" y1="282" x2="310" y2="282" />
      </g>
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const HEADER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .rh-header {
    --bg-main:        #F7F4EE;
    --bg-secondary:   #EFE9DD;
    --bg-card:        #FFFFFF;
    --bg-elevated:    #F4F6FB;
    --text-primary:   #1C2230;
    --text-secondary: #6C7380;
    --text-muted:     #9AA1AE;
    --accent:         #6E8EF7;
    --accent-soft:    #8878FF;
    --accent-hover:   #5C74D8;
    --accent-tint:    rgba(110,142,247,0.10);
    --accent-glow:    rgba(110,142,247,0.20);
    --border:         #D9DEE8;
    --border-strong:  #b8c2d8;
    --danger:         #C76B6B;
    --shadow:         0 2px 8px rgba(28,34,48,.06), 0 8px 24px rgba(110,142,247,.08);
    --r-sm: 10px; --r-md: 14px; --r-lg: 18px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .dark .rh-header {
    --bg-main:        #0F1117;
    --bg-secondary:   #161A22;
    --bg-card:        #1D2330;
    --bg-elevated:    #252C3D;
    --text-primary:   #F4F1EA;
    --text-secondary: #A2AAB8;
    --text-muted:     #6F7785;
    --accent:         #7DA2FF;
    --accent-soft:    #9A84FF;
    --accent-hover:   #5E7CE2;
    --accent-tint:    rgba(125,162,255,0.12);
    --accent-glow:    rgba(125,162,255,0.22);
    --border:         #2C3445;
    --border-strong:  #3d4a60;
    --danger:         #D67C7C;
    --shadow:         0 2px 8px rgba(0,0,0,.30), 0 8px 24px rgba(0,0,0,.20);
  }

  .rh-header {
    position: sticky; top: 0; z-index: 40;
    background: rgba(247,244,238,0.90);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow .3s ease, border-color .3s ease;
  }
  .dark .rh-header { background: rgba(15,17,23,0.90); }
  .rh-header.scrolled { box-shadow: var(--shadow); border-color: var(--border-strong); }
  .rh-header-inner {
    position: relative; max-width: 1400px; margin: 0 auto;
    display: flex; align-items: center; height: 60px;
    padding: 0 clamp(12px,3vw,24px); gap: 8px;
  }

  .rh-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; transition: opacity .2s; }
  .rh-logo:hover { opacity: .85; }
  .rh-logo-icon {
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1);
  }
  .rh-logo:hover .rh-logo-icon { transform: scale(1.08); }
  .rh-logo-name { font-size: 1.05rem; font-weight: 800; letter-spacing: -0.025em; color: var(--text-primary); }
  .rh-logo-name span { color: var(--accent); }

  .rh-nav-desktop {
    display: none; position: absolute; left: 50%; transform: translateX(-50%);
    align-items: center; gap: 2px;
  }
  @media (min-width: 768px) { .rh-nav-desktop { display: flex; } }

  .rh-navlink {
    position: relative; display: inline-flex; align-items: center;
    padding: 6px 11px; font-size: 13.5px; font-weight: 600;
    color: var(--text-secondary); text-decoration: none;
    border-radius: var(--r-sm); transition: color .18s, background .18s; white-space: nowrap;
  }
  .rh-navlink:hover { color: var(--text-primary); background: var(--bg-elevated); }
  .rh-navlink[data-status="active"] { color: var(--accent); font-weight: 700; }
  .rh-navlink-bar {
    position: absolute; bottom: 2px; left: 11px; right: 11px;
    height: 2px; border-radius: 99px; background: var(--accent);
    transform: scaleX(0); transition: transform .25s cubic-bezier(.34,1.56,.64,1); transform-origin: center;
  }
  .rh-navlink:hover .rh-navlink-bar, .rh-navlink[data-status="active"] .rh-navlink-bar { transform: scaleX(1); }

  .rh-dd-trigger {
    position: relative; display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 11px; font-size: 13.5px; font-weight: 600;
    color: var(--text-secondary); background: none; border: none;
    border-radius: var(--r-sm); cursor: pointer; font-family: inherit;
    transition: color .18s, background .18s; outline: none; white-space: nowrap;
  }
  .rh-dd-trigger:hover { color: var(--text-primary); background: var(--bg-elevated); }
  .rh-dd-trigger.active { color: var(--accent); font-weight: 700; }
  .rh-dd-trigger-bar {
    position: absolute; bottom: 2px; left: 11px; right: 11px;
    height: 2px; border-radius: 99px; background: var(--accent);
    transform: scaleX(0); transition: transform .25s cubic-bezier(.34,1.56,.64,1); transform-origin: center;
  }
  .rh-dd-trigger:hover .rh-dd-trigger-bar, .rh-dd-trigger.active .rh-dd-trigger-bar { transform: scaleX(1); }
  .rh-dd-chevron { width: 13px; height: 13px; transition: transform .25s ease; flex-shrink: 0; }
  [data-state="open"] .rh-dd-chevron { transform: rotate(180deg); }

  .rh-dd-content {
    background: #EFE9DD !important; border: 1px solid #b8c2d8 !important;
    border-radius: var(--r-md) !important;
    box-shadow: 0 8px 32px rgba(28,34,48,.18), 0 2px 8px rgba(110,142,247,.12) !important;
    padding: 6px !important; min-width: 260px; margin-top: 4px;
  }
  .dark .rh-dd-content {
    background: #1D2330 !important; border-color: #2C3445 !important;
    box-shadow: 0 8px 32px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.25) !important;
  }

  @keyframes rh-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

  .rh-dd-item {
    display: flex !important; align-items: flex-start; gap: 10px;
    padding: 10px 12px !important; border-radius: var(--r-sm) !important;
    cursor: pointer; text-decoration: none; position: relative; overflow: hidden;
    border: 1px solid transparent; color: #1C2230 !important;
    transition: background .18s, border-color .18s, transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s !important;
  }
  .dark .rh-dd-item { color: #F4F1EA !important; }
  .rh-dd-item:hover {
    background: #D9DEE8 !important; border-color: #b8c2d8 !important;
    transform: translateY(-1px) !important; box-shadow: 0 4px 12px rgba(110,142,247,.15) !important;
  }
  .dark .rh-dd-item:hover { background: #252C3D !important; border-color: #2C3445 !important; box-shadow: 0 4px 12px rgba(0,0,0,.30) !important; }
  .rh-dd-item::before {
    content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
    width: 2.5px; border-radius: 99px; background: var(--accent);
    transform: scaleY(0); opacity: 0;
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), opacity .18s; transform-origin: center;
  }
  .rh-dd-item:hover::before { transform: scaleY(1); opacity: 1; }
  .rh-dd-item::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(110,142,247,.06), transparent);
    transform: translateX(-100%); pointer-events: none;
  }
  .rh-dd-item:hover::after { animation: rh-shimmer .5s ease; }
  .rh-dd-item-icon {
    width: 32px; height: 32px; border-radius: var(--r-sm);
    background: var(--accent-tint); color: var(--accent);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
    transition: background .2s, color .2s, transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  }
  .rh-dd-item:hover .rh-dd-item-icon { background: var(--accent); color: #fff; transform: scale(1.12) rotate(-4deg); box-shadow: 0 4px 12px var(--accent-glow); }
  .rh-dd-item-label { font-size: 13px; font-weight: 700; color: #1C2230; transition: color .15s; }
  .dark .rh-dd-item-label { color: #F4F1EA; }
  .rh-dd-item:hover .rh-dd-item-label { color: var(--accent); }
  .rh-dd-item-desc { font-size: 11.5px; color: #6C7380; margin-top: 2px; transition: color .15s; }
  .dark .rh-dd-item-desc { color: #6F7785; }
  .rh-dd-item:hover .rh-dd-item-desc { color: var(--text-secondary); }
  .rh-dd-label { font-size: 10px !important; font-weight: 800 !important; letter-spacing: .12em !important; text-transform: uppercase !important; color: #6C7380 !important; padding: 6px 10px 4px !important; }
  .dark .rh-dd-label { color: #6F7785 !important; }
  .rh-dd-sep { background: #b8c2d8 !important; margin: 4px 0 !important; }
  .dark .rh-dd-sep { background: #2C3445 !important; }
  .rh-dd-item[style] { color: #1C2230 !important; font-size: 13px !important; font-weight: 600 !important; }
  .dark .rh-dd-item[style] { color: #F4F1EA !important; }

  .rh-controls { display: flex; align-items: center; gap: 4px; margin-left: auto; }
  .rh-icon-btn {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    background: none; border: none; border-radius: var(--r-sm);
    color: var(--text-secondary); cursor: pointer; font-family: inherit;
    transition: background .15s, color .15s, transform .15s;
  }
  .rh-icon-btn:hover { background: var(--bg-elevated); color: var(--text-primary); transform: scale(1.05); }
  .rh-text-btn {
    display: none; align-items: center; gap: 6px; padding: 0 12px; height: 34px;
    background: none; border: 1.5px solid var(--border); border-radius: var(--r-sm);
    font-size: 12px; font-weight: 700; font-family: inherit;
    color: var(--text-secondary); cursor: pointer; white-space: nowrap;
    transition: background .15s, border-color .15s, color .15s;
  }
  @media (min-width: 640px) { .rh-text-btn { display: inline-flex; } }
  .rh-text-btn:hover { background: var(--bg-elevated); border-color: var(--border-strong); color: var(--text-primary); }
  .rh-text-btn.danger:hover { background: rgba(199,107,107,.08); border-color: var(--danger); color: var(--danger); }

  .rh-hamburger {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    background: none; border: none; border-radius: var(--r-sm);
    color: var(--text-secondary); cursor: pointer; transition: background .15s, color .15s;
  }
  @media (min-width: 768px) { .rh-hamburger { display: none; } }
  .rh-hamburger:hover { background: var(--bg-elevated); color: var(--text-primary); }

  [data-slot="sheet-content"].rh-sheet {
    background-color: #FFFFFF !important; border-left: 1px solid #D9DEE8 !important;
    padding: 0 !important; display: flex !important; flex-direction: column !important;
    width: 300px !important; max-width: 85vw !important; overflow: hidden !important;
  }
  .dark [data-slot="sheet-content"].rh-sheet { background-color: #1D2330 !important; border-left-color: #2C3445 !important; }
  .rh-sheet-header {
    display: flex !important; align-items: center !important; padding: 16px 18px !important;
    background-color: #F4F6FB !important; border-bottom: 1px solid #D9DEE8 !important; flex-shrink: 0 !important;
  }
  .dark .rh-sheet-header { background-color: #252C3D !important; border-bottom-color: #2C3445 !important; }
  .rh-sheet-logo-name { font-size: 1rem; font-weight: 800; letter-spacing: -0.025em; color: #1C2230; }
  .dark .rh-sheet-logo-name { color: #F4F1EA; }
  .rh-sheet-logo-name span { color: #6E8EF7; }
  .dark .rh-sheet-logo-name span { color: #7DA2FF; }
  .rh-sheet-nav { flex: 1; overflow-y: auto; padding: 12px 10px; background-color: #FFFFFF; }
  .dark .rh-sheet-nav { background-color: #1D2330; }
  .rh-sheet-nav::-webkit-scrollbar { width: 3px; }
  .rh-sheet-nav::-webkit-scrollbar-track { background: transparent; }
  .rh-sheet-nav::-webkit-scrollbar-thumb { background: #D9DEE8; border-radius: 99px; }
  .dark .rh-sheet-nav::-webkit-scrollbar-thumb { background: #2C3445; }
  .rh-sheet-section-label {
    font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
    color: #9AA1AE; padding: 14px 12px 6px; display: flex; align-items: center; gap: 8px;
  }
  .dark .rh-sheet-section-label { color: #6F7785; }
  .rh-sheet-section-label::after { content: ''; flex: 1; height: 1px; background: #D9DEE8; border-radius: 99px; }
  .dark .rh-sheet-section-label::after { background: #2C3445; }
  .rh-sheet-link {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 12px; font-size: 14px; font-weight: 600; color: #6C7380; text-decoration: none;
    transition: background .15s, color .15s; margin-bottom: 2px;
  }
  .dark .rh-sheet-link { color: #A2AAB8; }
  .rh-sheet-link:hover { background: #F4F6FB; color: #1C2230; }
  .dark .rh-sheet-link:hover { background: #252C3D; color: #F4F1EA; }
  .rh-sheet-link[data-status="active"] { background: rgba(110,142,247,0.10); color: #6E8EF7; font-weight: 700; }
  .dark .rh-sheet-link[data-status="active"] { background: rgba(125,162,255,0.12); color: #7DA2FF; }
  .rh-sheet-group-trigger {
    display: flex; width: 100%; align-items: center; justify-content: space-between;
    padding: 10px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
    color: #6C7380; background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif; transition: background .15s, color .15s; margin-bottom: 2px;
  }
  .dark .rh-sheet-group-trigger { color: #A2AAB8; }
  .rh-sheet-group-trigger:hover { background: #F4F6FB; color: #1C2230; }
  .dark .rh-sheet-group-trigger:hover { background: #252C3D; color: #F4F1EA; }
  .rh-sheet-group-trigger.active { color: #6E8EF7; font-weight: 700; }
  .dark .rh-sheet-group-trigger.active { color: #7DA2FF; }
  .rh-sheet-group-chevron { width: 15px; height: 15px; flex-shrink: 0; color: #9AA1AE; transition: transform .25s ease, color .15s; }
  .dark .rh-sheet-group-chevron { color: #6F7785; }
  .rh-sheet-group-trigger:hover .rh-sheet-group-chevron { color: #1C2230; }
  .dark .rh-sheet-group-trigger:hover .rh-sheet-group-chevron { color: #F4F1EA; }
  .rh-sheet-group-chevron.open { transform: rotate(180deg); }
  .rh-sheet-sub-list { padding: 4px 0 4px 8px; }
  .rh-sheet-sublink {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: 10px; font-size: 13.5px; font-weight: 600; color: #6C7380; text-decoration: none;
    transition: background .15s, color .15s; margin-bottom: 2px;
  }
  .dark .rh-sheet-sublink { color: #A2AAB8; }
  .rh-sheet-sublink:hover { background: #F4F6FB; color: #1C2230; }
  .dark .rh-sheet-sublink:hover { background: #252C3D; color: #F4F1EA; }
  .rh-sheet-sublink[data-status="active"] { background: rgba(110,142,247,0.10); color: #6E8EF7; }
  .dark .rh-sheet-sublink[data-status="active"] { background: rgba(125,162,255,0.12); color: #7DA2FF; }
  .rh-sheet-sublink-icon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    background: rgba(110,142,247,0.10); color: #6E8EF7;
    display: flex; align-items: center; justify-content: center; transition: background .18px, color .18s;
  }
  .dark .rh-sheet-sublink-icon { background: rgba(125,162,255,0.12); color: #7DA2FF; }
  .rh-sheet-sublink:hover .rh-sheet-sublink-icon { background: #6E8EF7; color: #fff; }
  .dark .rh-sheet-sublink:hover .rh-sheet-sublink-icon { background: #7DA2FF; color: #fff; }
  .rh-sheet-sublink-body { display: flex; flex-direction: column; }
  .rh-sheet-sublink-label { font-size: 13px; font-weight: 700; color: #1C2230; line-height: 1.25; }
  .dark .rh-sheet-sublink-label { color: #F4F1EA; }
  .rh-sheet-sublink-desc { font-size: 11px; color: #9AA1AE; margin-top: 1px; line-height: 1.25; }
  .dark .rh-sheet-sublink-desc { color: #6F7785; }
  .rh-sheet-footer {
    border-top: 1px solid #D9DEE8; background-color: #F4F6FB;
    padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-shrink: 0;
  }
  .dark .rh-sheet-footer { border-top-color: #2C3445; background-color: #252C3D; }
  .rh-sheet-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; height: 34px;
    background: #FFFFFF; border: 1.5px solid #D9DEE8; border-radius: 10px;
    font-size: 12px; font-weight: 700; font-family: 'DM Sans', system-ui, sans-serif;
    color: #6C7380; cursor: pointer; white-space: nowrap;
    transition: background .15s, border-color .15s, color .15s;
  }
  .dark .rh-sheet-btn { background: #1D2330; border-color: #2C3445; color: #A2AAB8; }
  .rh-sheet-btn:hover { background: #EFE9DD; border-color: #b8c2d8; color: #1C2230; }
  .dark .rh-sheet-btn:hover { background: #161A22; border-color: #3d4a60; color: #F4F1EA; }
  .rh-sheet-btn.danger:hover { background: rgba(199,107,107,.08); border-color: #C76B6B; color: #C76B6B; }
  .dark .rh-sheet-btn.danger:hover { background: rgba(214,124,124,.08); border-color: #D67C7C; color: #D67C7C; }
  .rh-sheet-icon-btn {
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    background: #FFFFFF; border: 1.5px solid #D9DEE8; border-radius: 10px;
    color: #6C7380; cursor: pointer; transition: background .15s, color .15s, border-color .15s;
  }
  .dark .rh-sheet-icon-btn { background: #1D2330; border-color: #2C3445; color: #A2AAB8; }
  .rh-sheet-icon-btn:hover { background: #EFE9DD; border-color: #b8c2d8; color: #1C2230; }
  .dark .rh-sheet-icon-btn:hover { background: #161A22; border-color: #3d4a60; color: #F4F1EA; }
`;

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} activeOptions={{ exact: true }} className="rh-navlink">
      {children}
      <span className="rh-navlink-bar" />
    </Link>
  );
}

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────

function DDMenu({ label, items }: { label: string; items: NavItem[] }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const active = items.some((i) => path.startsWith(i.to));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`rh-dd-trigger${active ? " active" : ""}`}>
          {label}
          <ChevronDown className="rh-dd-chevron" />
          <span className="rh-dd-trigger-bar" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rh-dd-content">
        {items.map((it, i) => (
          <DropdownMenuItem key={it.to} asChild>
            <Link to={it.to} className="rh-dd-item" style={{ animationDelay: `${i * 30}ms` }}>
              <span className="rh-dd-item-icon">{it.icon}</span>
              <span>
                <div className="rh-dd-item-label">{it.label}</div>
                {it.desc && <div className="rh-dd-item-desc">{it.desc}</div>}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Mobile Collapsible Group ─────────────────────────────────────────────────

function MobileGroup({ label, items, onNavigate }: { label: string; items: NavItem[]; onNavigate: () => void }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const active = items.some((i) => path.startsWith(i.to));
  const [open, setOpen] = useState(active);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className={`rh-sheet-group-trigger${active ? " active" : ""}`}>
          <span>{label}</span>
          <ChevronDown className={`rh-sheet-group-chevron${open ? " open" : ""}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="rh-sheet-sub-list">
        {items.map((it) => (
          <Link key={it.to} to={it.to} onClick={onNavigate} className="rh-sheet-sublink">
            <span className="rh-sheet-sublink-icon">{it.icon}</span>
            <span className="rh-sheet-sublink-body">
              <span className="rh-sheet-sublink-label">{it.label}</span>
              {it.desc && <span className="rh-sheet-sublink-desc">{it.desc}</span>}
            </span>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const { theme, toggle } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { signOut, user } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ── Fetch display_name from profiles ──
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // cache 5 min — shared with dashboard query
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Falls back to "Ronin" if display_name isn't set
  const n = profile?.display_name ?? "Ronin";

  // ── Nav items built with dynamic name ──
  const SALES_ITEMS: NavItem[] = [
    { to: "/sales/aquatic",    label: `${n}'s Aquatic`,    desc: "Fish sales tracker",   icon: <Fish className="h-4 w-4" /> },
    { to: "/sales/timepieces", label: `${n}'s Timepieces`, desc: "Watch sales tracker",  icon: <Watch className="h-4 w-4" /> },
  ];
  const EXPENSES_ITEMS: NavItem[] = [
    { to: "/expenses/aquatic",    label: `${n}'s Aquatic`,    desc: "Aquarium expenses",   icon: <Fish className="h-4 w-4" /> },
    { to: "/expenses/timepieces", label: `${n}'s Timepieces`, desc: "Watch shop expenses", icon: <Watch className="h-4 w-4" /> },
  ];
  const BUSINESSES_ITEMS_ADMIN: NavItem[] = [
    { to: "/businesses/aquatic",    label: `${n}'s Aquatic`,       desc: "Inventory of every fish breed", icon: <Fish className="h-4 w-4" /> },
    { to: "/businesses/timepieces", label: `${n}'s Timepieces`,    desc: "Inventory of luxury watches",   icon: <Watch className="h-4 w-4" /> },
    { to: "/businesses/lending",    label: `${n}'s Lending Money`, desc: "5–6 lending ledger",            icon: <Coins className="h-4 w-4" /> },
  ];
  const BUSINESSES_ITEMS_LIMITED: NavItem[] = [
    { to: "/businesses/lending", label: `${n}'s Lending Money`, desc: "5–6 lending ledger", icon: <Coins className="h-4 w-4" /> },
  ];

  const businessesItems = isAdmin ? BUSINESSES_ITEMS_ADMIN : BUSINESSES_ITEMS_LIMITED;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={`rh-header${scrolled ? " scrolled" : ""}`}>
      <style>{HEADER_STYLES}</style>

      <div className="rh-header-inner">

        {/* ── Logo ── */}
        <Link to="/" className="rh-logo">
          <div className="rh-logo-icon">
            <RoninLogo size={34} />
          </div>
          <span className="rh-logo-name">{n}'s <span>Hub</span></span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="rh-nav-desktop">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          {isAdmin && <DDMenu label="Sales"    items={SALES_ITEMS} />}
          {isAdmin && <DDMenu label="Expenses" items={EXPENSES_ITEMS} />}
          <DDMenu label="Businesses" items={businessesItems} />
        </nav>

        {/* ── Right Controls ── */}
        <div className="rh-controls">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rh-text-btn">{currency === "PHP" ? "₱ PHP" : "$ USD"}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rh-dd-content">
              <DropdownMenuLabel className="rh-dd-label">Currency</DropdownMenuLabel>
              <DropdownMenuSeparator className="rh-dd-sep" />
              <DropdownMenuItem onClick={() => setCurrency("PHP")} className="rh-dd-item" style={{ flexDirection: "row", alignItems: "center" }}>₱ Philippine Peso</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency("USD")} className="rh-dd-item" style={{ flexDirection: "row", alignItems: "center" }}>$ US Dollar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="rh-icon-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user && (
            <button className="rh-text-btn danger" onClick={handleSignOut}>
              <LogOut size={14} /> Sign out
            </button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="rh-hamburger" aria-label="Open navigation menu">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="rh-sheet">
              <SheetHeader className="rh-sheet-header">
                <SheetTitle asChild>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <RoninLogo size={30} />
                    <span className="rh-sheet-logo-name">{n}'s <span>Hub</span></span>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <nav className="rh-sheet-nav">
                <Link to="/" onClick={closeMobile} activeOptions={{ exact: true }} className="rh-sheet-link">Home</Link>
                <Link to="/dashboard" onClick={closeMobile} className="rh-sheet-link">Dashboard</Link>
                {isAdmin && (
                  <>
                    <div className="rh-sheet-section-label">Finances</div>
                    <MobileGroup label="Sales"    items={SALES_ITEMS}    onNavigate={closeMobile} />
                    <MobileGroup label="Expenses" items={EXPENSES_ITEMS} onNavigate={closeMobile} />
                  </>
                )}
                <div className="rh-sheet-section-label">Businesses</div>
                <MobileGroup label="Businesses" items={businessesItems} onNavigate={closeMobile} />
              </nav>

              <div className="rh-sheet-footer">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rh-sheet-btn">{currency === "PHP" ? "₱ PHP" : "$ USD"}</button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rh-dd-content">
                    <DropdownMenuLabel className="rh-dd-label">Currency</DropdownMenuLabel>
                    <DropdownMenuSeparator className="rh-dd-sep" />
                    <DropdownMenuItem onClick={() => setCurrency("PHP")} className="rh-dd-item" style={{ flexDirection: "row", alignItems: "center" }}>₱ Philippine Peso</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrency("USD")} className="rh-dd-item" style={{ flexDirection: "row", alignItems: "center" }}>$ US Dollar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button className="rh-sheet-icon-btn" onClick={toggle} aria-label="Toggle theme">
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                  {user && (
                    <button className="rh-sheet-btn danger" onClick={() => { closeMobile(); handleSignOut(); }}>
                      <LogOut size={13} /> Sign out
                    </button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}