import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { X, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/providers";
import { useProfile } from "@/hooks/use-profile";

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters")
  .max(120, "Keep it under 120 characters");

export function getInitials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const STYLES = `
  .pd-root {
    --pd-surface:#FFFFFF; --pd-elevated:#F4F6FB; --pd-paper:#FBFAF6;
    --pd-border:#D9DEE8; --pd-border-md:#b8c2d8;
    --pd-text:#1C2230; --pd-text2:#6C7380; --pd-text3:#9AA1AE;
    --pd-accent:#6E8EF7; --pd-accent2:#8878FF; --pd-hover:#5C74D8;
    --pd-accent-lt:rgba(110,142,247,.10); --pd-glow:rgba(110,142,247,.28);
    --pd-danger:#C76B6B;
    position:fixed; inset:0; z-index:10000;
    display:flex; align-items:center; justify-content:center;
    padding:16px; font-family:'DM Sans',system-ui,sans-serif;
  }
  .dark .pd-root {
    --pd-surface:#1D2330; --pd-elevated:#252C3D; --pd-paper:#161A22;
    --pd-border:#2C3445; --pd-border-md:#3d4a60;
    --pd-text:#F4F1EA; --pd-text2:#A2AAB8; --pd-text3:#6F7785;
    --pd-accent:#7DA2FF; --pd-accent2:#9A84FF; --pd-hover:#5E7CE2;
    --pd-accent-lt:rgba(125,162,255,.12); --pd-glow:rgba(125,162,255,.30);
    --pd-danger:#D67C7C;
  }
  .pd-root *, .pd-root *::before, .pd-root *::after { box-sizing:border-box; }

  @keyframes pd-fade { from{opacity:0} to{opacity:1} }
  @keyframes pd-pop  { from{opacity:0; transform:translateY(12px) scale(.96)} to{opacity:1; transform:none} }
  @keyframes pd-shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

  .pd-backdrop {
    position:absolute; inset:0;
    background:rgba(15,17,23,.55);
    backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
    animation:pd-fade .18s ease both;
  }
  .pd-card {
    position:relative; width:100%; max-width:440px; max-height:calc(100dvh - 32px); overflow:auto;
    background:var(--pd-surface); border:1px solid var(--pd-border-md); border-radius:26px;
    padding:26px 24px 22px;
    box-shadow:0 2px 8px rgba(28,34,48,.10), 0 24px 64px rgba(28,34,48,.22), 0 8px 40px var(--pd-accent-lt);
    animation:pd-pop .24s cubic-bezier(.22,.68,0,1.2) both;
  }
  .dark .pd-card { box-shadow:0 2px 8px rgba(0,0,0,.4), 0 24px 64px rgba(0,0,0,.5), 0 8px 40px var(--pd-accent-lt); }

  .pd-close {
    position:absolute; top:14px; right:14px; width:32px; height:32px;
    display:flex; align-items:center; justify-content:center;
    background:none; border:1px solid var(--pd-border); border-radius:10px;
    color:var(--pd-text2); cursor:pointer; transition:background .15s,color .15s,border-color .15s;
  }
  .pd-close:hover { background:var(--pd-elevated); color:var(--pd-text); border-color:var(--pd-border-md); }

  .pd-head { display:flex; align-items:center; gap:16px; padding-right:36px; margin-bottom:22px; }
  .pd-avatar {
    flex-shrink:0; width:58px; height:58px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:19px; font-weight:800; letter-spacing:.02em; color:var(--pd-text3);
    background:var(--pd-elevated); border:1.5px dashed var(--pd-border-md);
    transition:background .25s, color .25s, border-color .25s, box-shadow .25s;
  }
  .pd-avatar.has-name {
    color:#fff; border:1.5px solid transparent;
    background:linear-gradient(135deg,var(--pd-accent),var(--pd-accent2));
    box-shadow:0 6px 20px var(--pd-glow);
  }
  .pd-title { margin:0 0 3px; font-size:1.2rem; font-weight:800; letter-spacing:-.02em; color:var(--pd-text); }
  .pd-sub { margin:0; font-size:13px; line-height:1.5; color:var(--pd-text2); }

  .pd-label { display:block; margin-bottom:7px; font-size:13px; font-weight:700; color:var(--pd-text); }
  .pd-input {
    width:100%; height:46px; padding:0 14px;
    background:var(--pd-elevated); border:1.5px solid var(--pd-border); border-radius:12px;
    color:var(--pd-text); font:600 15px/1 'DM Sans',system-ui,sans-serif; outline:none;
    transition:border-color .18s, box-shadow .18s, background .18s;
  }
  .pd-input::placeholder { color:var(--pd-text3); font-weight:500; }
  .pd-input:hover { border-color:var(--pd-border-md); }
  .pd-input:focus { border-color:var(--pd-accent); box-shadow:0 0 0 3px var(--pd-accent-lt); background:var(--pd-surface); }
  .pd-input.invalid { border-color:var(--pd-danger); box-shadow:0 0 0 3px rgba(199,107,107,.12); }
  .pd-hint { margin:7px 2px 0; min-height:18px; font-size:12px; line-height:1.5; color:var(--pd-text3); }
  .pd-hint.error { color:var(--pd-danger); font-weight:600; }

  .pd-paper {
    position:relative; margin-top:16px; padding:16px 18px 16px 20px;
    background:var(--pd-paper); border:1px solid var(--pd-border); border-radius:14px; overflow:hidden;
  }
  .pd-paper::before {
    content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
    background:linear-gradient(180deg,var(--pd-accent),var(--pd-accent2));
  }
  .pd-paper-cap { margin:0 0 10px; font-size:12px; color:var(--pd-text3); }
  .pd-paper-line { margin:0; font-size:13.5px; line-height:1.6; color:var(--pd-text2); }
  .pd-paper-line strong { font-weight:800; color:var(--pd-text); word-break:break-word; }
  .pd-paper-line strong.is-empty { font-weight:500; font-style:italic; color:var(--pd-text3); }
  .pd-sig { margin-top:22px; max-width:240px; }
  .pd-sig-rule { display:block; height:1px; background:var(--pd-text2); opacity:.55; }
  .pd-sig-name { display:block; margin-top:6px; min-height:18px; font-size:12.5px; font-weight:800; color:var(--pd-text); word-break:break-word; }
  .pd-sig-role { display:block; margin-top:1px; font-size:11.5px; color:var(--pd-text3); }

  .pd-actions { display:flex; gap:10px; margin-top:20px; }
  .pd-cancel {
    height:44px; padding:0 18px; background:var(--pd-elevated); border:1.5px solid var(--pd-border);
    border-radius:12px; color:var(--pd-text2); font:700 14px/1 'DM Sans',system-ui,sans-serif; cursor:pointer;
    transition:background .15s,color .15s,border-color .15s;
  }
  .pd-cancel:hover { background:var(--pd-border); color:var(--pd-text); }
  .pd-save {
    position:relative; overflow:hidden; flex:1; height:44px; border:none; border-radius:12px;
    background:var(--pd-accent); color:#fff; font:700 14px/1 'DM Sans',system-ui,sans-serif; cursor:pointer;
    transition:background .18s, transform .14s, box-shadow .18s, opacity .18s;
  }
  .pd-save:not(:disabled):hover { background:var(--pd-hover); box-shadow:0 6px 22px var(--pd-glow); transform:translateY(-1px); }
  .pd-save:not(:disabled):active { transform:scale(.98); }
  .pd-save::after {
    content:''; position:absolute; inset:0; pointer-events:none; transform:translateX(-100%);
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
  }
  .pd-save:not(:disabled):hover::after { animation:pd-shimmer .55s ease; }
  .pd-save:disabled { opacity:.45; cursor:not-allowed; }

  .pd-root button:focus-visible, .pd-root input:focus-visible { outline:2px solid var(--pd-accent); outline-offset:2px; }
  .pd-input:focus-visible { outline:none; }

  @media (prefers-reduced-motion: reduce) {
    .pd-backdrop, .pd-card { animation:none; }
    .pd-save:hover::after { animation:none; }
  }
  @media (max-width:420px) {
    .pd-card { padding:22px 18px 18px; border-radius:22px; }
    .pd-head { gap:12px; }
  }
`;

export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const stored = profile?.full_name?.trim() ?? "";
  const [fullName, setFullName] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset the form each time the dialog opens
  useEffect(() => {
    if (!open) return;
    setFullName(stored);
    setTouched(false);
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape to close + lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  const parsed = fullNameSchema.safeParse(fullName);
  const error = touched && !parsed.success ? (parsed.error.issues[0]?.message ?? "Invalid name") : null;
  const canSave = parsed.success && parsed.data !== stored && !saving;
  const name = fullName.trim();
  const initials = getInitials(name);

  const save = async () => {
    if (!parsed.success) {
      setTouched(true);
      inputRef.current?.focus();
      return;
    }
    if (parsed.data === stored) {
      onOpenChange(false);
      return;
    }
    if (!user) return;

    setSaving(true);

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data })
      .eq("id", user.id)
      .select("id");

    let failure = updateError?.message ?? null;

    // No profile row yet (rare): create it
    if (!failure && (!updated || updated.length === 0)) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id, email: user.email ?? null, full_name: parsed.data });
      failure = insertError?.message ?? null;
    }

    setSaving(false);

    if (failure) {
      toast.error(failure);
      return;
    }

    await qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Changes saved");
    onOpenChange(false);
  };

  return createPortal(
    <div className="pd-root">
      <style>{STYLES}</style>
      <div className="pd-backdrop" onMouseDown={() => onOpenChange(false)} />

      <div className="pd-card" role="dialog" aria-modal="true" aria-labelledby="pd-title">
        <button className="pd-close" onClick={() => onOpenChange(false)} aria-label="Close">
          <X size={15} />
        </button>

        <div className="pd-head">
          <div className={`pd-avatar${initials ? " has-name" : ""}`} aria-hidden="true">
            {initials || <UserRound size={24} />}
          </div>
          <div>
            <h2 id="pd-title" className="pd-title">Lender profile</h2>
            <p className="pd-sub">Your name appears as the Lender on every loan contract.</p>
          </div>
        </div>

        <label className="pd-label" htmlFor="pd-name">Full name</label>
        <input
          id="pd-name"
          ref={inputRef}
          className={`pd-input${error ? " invalid" : ""}`}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
          }}
          placeholder="e.g. Juan Dela Cruz"
          autoComplete="name"
          maxLength={120}
          aria-invalid={!!error}
          aria-describedby="pd-hint"
        />
        <p id="pd-hint" className={`pd-hint${error ? " error" : ""}`}>
          {error ?? "Use your legal name, the way you would sign it."}
        </p>

        <div className="pd-paper">
          <p className="pd-paper-cap">How it will read on the contract</p>
          <p className="pd-paper-line">
            <strong className={name ? "" : "is-empty"}>{name || "Your full name"}</strong>
            , hereinafter called the “Lender”;
          </p>
          <div className="pd-sig">
            <span className="pd-sig-rule" />
            <span className="pd-sig-name">{name}</span>
            <span className="pd-sig-role">Lender</span>
          </div>
        </div>

        <div className="pd-actions">
          <button className="pd-cancel" onClick={() => onOpenChange(false)}>Cancel</button>
          <button className="pd-save" onClick={() => void save()} disabled={!canSave}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
