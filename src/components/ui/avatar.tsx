"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Palette tokens ───────────────────────────────────────────────────────────
const paletteStyle = `
  :root {
    --avatar-bg:          #F4F6FB;
    --avatar-border:      #D9DEE8;
    --avatar-text:        #1C2230;
    --avatar-text-sub:    #6C7380;
    --avatar-accent-1:    #6E8EF7;
    --avatar-accent-2:    #8878FF;
    --avatar-success:     #6E9F7A;
    --avatar-warning:     #C9995D;
    --avatar-error:       #C76B6B;
    --avatar-ring-offset: #FFFFFF;
  }
  .dark {
    --avatar-bg:          #252C3D;
    --avatar-border:      #2C3445;
    --avatar-text:        #F4F1EA;
    --avatar-text-sub:    #A2AAB8;
    --avatar-accent-1:    #7DA2FF;
    --avatar-accent-2:    #9A84FF;
    --avatar-success:     #89B89A;
    --avatar-warning:     #D6A86A;
    --avatar-error:       #D67C7C;
    --avatar-ring-offset: #1D2330;
  }

  .cai-avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--avatar-border);
    background: var(--avatar-bg);
    transition: box-shadow 180ms ease, border-color 180ms ease;
  }

  .cai-avatar-xs  { width: 24px;  height: 24px; }
  .cai-avatar-sm  { width: 32px;  height: 32px; }
  .cai-avatar-md  { width: 40px;  height: 40px; }
  .cai-avatar-lg  { width: 52px;  height: 52px; }
  .cai-avatar-xl  { width: 64px;  height: 64px; }
  .cai-avatar-2xl { width: 80px;  height: 80px; }

  .cai-avatar-ring-accent  { border-color: var(--avatar-accent-1);  box-shadow: 0 0 0 3px var(--avatar-ring-offset), 0 0 0 5px var(--avatar-accent-1); }
  .cai-avatar-ring-success { border-color: var(--avatar-success);   box-shadow: 0 0 0 3px var(--avatar-ring-offset), 0 0 0 5px var(--avatar-success); }
  .cai-avatar-ring-warning { border-color: var(--avatar-warning);   box-shadow: 0 0 0 3px var(--avatar-ring-offset), 0 0 0 5px var(--avatar-warning); }
  .cai-avatar-ring-error   { border-color: var(--avatar-error);     box-shadow: 0 0 0 3px var(--avatar-ring-offset), 0 0 0 5px var(--avatar-error); }

  .cai-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    aspect-ratio: 1 / 1;
  }

  .cai-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -.02em;
    line-height: 1;
    color: #fff;
    user-select: none;
    background: linear-gradient(135deg, var(--avatar-accent-1), var(--avatar-accent-2));
  }

  .cai-avatar-fallback-blue   { background: linear-gradient(135deg, #6E8EF7, #8878FF); }
  .cai-avatar-fallback-green  { background: linear-gradient(135deg, #6E9F7A, #89B89A); }
  .cai-avatar-fallback-amber  { background: linear-gradient(135deg, #C9995D, #D6A86A); }
  .cai-avatar-fallback-rose   { background: linear-gradient(135deg, #C76B6B, #D67C7C); }
  .cai-avatar-fallback-indigo { background: linear-gradient(135deg, #8878FF, #7DA2FF); }
  .cai-avatar-fallback-slate  { background: linear-gradient(135deg, #3D4455, #6C7380); }

  .cai-avatar-xs  .cai-avatar-fallback { font-size: 9px; }
  .cai-avatar-sm  .cai-avatar-fallback { font-size: 11px; }
  .cai-avatar-md  .cai-avatar-fallback { font-size: 14px; }
  .cai-avatar-lg  .cai-avatar-fallback { font-size: 18px; }
  .cai-avatar-xl  .cai-avatar-fallback { font-size: 22px; }
  .cai-avatar-2xl .cai-avatar-fallback { font-size: 28px; }

  .cai-avatar-status {
    position: absolute;
    bottom: 1px;
    right: 1px;
    border-radius: 50%;
    border: 2px solid var(--avatar-ring-offset);
    z-index: 10;
  }
  .cai-avatar-xs  .cai-avatar-status { width: 7px;  height: 7px; }
  .cai-avatar-sm  .cai-avatar-status { width: 9px;  height: 9px; }
  .cai-avatar-md  .cai-avatar-status { width: 11px; height: 11px; }
  .cai-avatar-lg  .cai-avatar-status { width: 13px; height: 13px; }
  .cai-avatar-xl  .cai-avatar-status { width: 15px; height: 15px; }
  .cai-avatar-2xl .cai-avatar-status { width: 18px; height: 18px; }

  .cai-status-online  { background: var(--avatar-success); }
  .cai-status-busy    { background: var(--avatar-error); }
  .cai-status-away    { background: var(--avatar-warning); }
  .cai-status-offline { background: var(--avatar-text-sub); }
`;

// ─── Plain literal union types (no VariantProps — avoids interface conflict) ──

type AvatarSize    = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type AvatarRing    = "none" | "accent" | "success" | "warning" | "error";
type AvatarStatus  = "online" | "busy" | "away" | "offline";
type FallbackColor = "blue" | "green" | "amber" | "rose" | "indigo" | "slate";

// ─── CVA — used only for className generation, never spread as props ──────────

const avatarVariants = cva("cai-avatar", {
  variants: {
    size: {
      xs:    "cai-avatar-xs",
      sm:    "cai-avatar-sm",
      md:    "cai-avatar-md",
      lg:    "cai-avatar-lg",
      xl:    "cai-avatar-xl",
      "2xl": "cai-avatar-2xl",
    },
    ring: {
      none:    "",
      accent:  "cai-avatar-ring-accent",
      success: "cai-avatar-ring-success",
      warning: "cai-avatar-ring-warning",
      error:   "cai-avatar-ring-error",
    },
  },
  defaultVariants: { size: "md", ring: "none" },
});

const fallbackVariants = cva("cai-avatar-fallback", {
  variants: {
    fallbackColor: {
      blue:   "cai-avatar-fallback-blue",
      green:  "cai-avatar-fallback-green",
      amber:  "cai-avatar-fallback-amber",
      rose:   "cai-avatar-fallback-rose",
      indigo: "cai-avatar-fallback-indigo",
      slate:  "cai-avatar-fallback-slate",
    },
  },
  defaultVariants: { fallbackColor: "blue" },
});

// ─── Plain prop interfaces — no VariantProps, no naming collisions ────────────

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?:   AvatarSize;
  ring?:   AvatarRing;
  status?: AvatarStatus;
}

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  fallbackColor?: FallbackColor;
}

// ─── Components ──────────────────────────────────────────────────────────────

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "md", ring = "none", status, children, ...props }, ref) => (
  <>
    <style dangerouslySetInnerHTML={{ __html: paletteStyle }} />
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, ring }), className)}
      {...props}
    >
      {children}
      {status && (
        <span
          className={cn("cai-avatar-status", `cai-status-${status}`)}
          aria-label={`Status: ${status}`}
        />
      )}
    </AvatarPrimitive.Root>
  </>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("cai-avatar-image", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, fallbackColor = "blue", ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(fallbackVariants({ fallbackColor }), className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };