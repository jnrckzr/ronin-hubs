import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cinematic Anime-Inspired OTP Input
 *
 * CSS variables expected in your globals.css:
 *
 * Dark mode  (.dark or [data-theme="dark"])
 *   --otp-bg:           #0F1117   (Midnight Black Blue)
 *   --otp-surface:      #1D2330   (Card Surface)
 *   --otp-elevated:     #252C3D   (Elevated Surface)
 *   --otp-text:         #F4F1EA   (Warm White)
 *   --otp-muted:        #A2AAB8   (Cool Muted Gray)
 *   --otp-disabled:     #6F7785   (Faded Gray)
 *   --otp-accent:       #7DA2FF   (Cinematic Blue)
 *   --otp-accent-hover: #5E7CE2   (Glowing Indigo)
 *   --otp-success:      #89B89A   (Sage Green)
 *   --otp-warning:      #D6A86A   (Muted Amber)
 *   --otp-error:        #D67C7C   (Dusty Rose)
 *   --otp-border:       #2C3445   (Subtle Slate Border)
 *
 * Light mode (:root or [data-theme="light"])
 *   --otp-bg:           #FFFFFF   (Soft White)
 *   --otp-surface:      #F4F6FB   (Pale Blue White)
 *   --otp-elevated:     #EFE9DD   (Soft Cream)
 *   --otp-text:         #1C2230   (Deep Slate)
 *   --otp-muted:        #6C7380   (Muted Gray)
 *   --otp-disabled:     #9AA1AE   (Light Gray)
 *   --otp-accent:       #6E8EF7   (Cinematic Blue)
 *   --otp-accent-hover: #5C74D8   (Deep Indigo)
 *   --otp-success:      #6E9F7A   (Sage Green)
 *   --otp-warning:      #C9995D   (Soft Amber)
 *   --otp-error:        #C76B6B   (Muted Rose)
 *   --otp-border:       #D9DEE8   (Soft Border Gray)
 */

// ─── Root container ───────────────────────────────────────────────────────────

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-3 has-[:disabled]:opacity-45",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

// ─── Slot group ────────────────────────────────────────────────────────────────

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

// ─── Individual slot ───────────────────────────────────────────────────────────

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    index: number;
    /**
     * Pass "error" | "success" to show semantic border/text colour.
     * Omit (or pass undefined) for the default state.
     */
    variant?: "default" | "error" | "success";
  }
>(({ index, className, variant = "default", ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        // layout
        "relative flex h-13 w-11 items-center justify-center",
        // typography
        "text-[20px] font-semibold tracking-widest",
        // borders — shared sides
        "border-y border-r",
        // first / last rounding
        "first:rounded-l-[10px] first:border-l last:rounded-r-[10px]",
        // transition
        "transition-all duration-150 ease-out",
        className,
      )}
      style={{
        ...({
          "--slot-border-color":
            variant === "error"
              ? "var(--otp-error)"
              : variant === "success"
                ? "var(--otp-success)"
                : isActive
                  ? "var(--otp-accent)"
                  : "var(--otp-border)",
          "--slot-text-color":
            variant === "error"
              ? "var(--otp-error)"
              : variant === "success"
                ? "var(--otp-success)"
                : char
                  ? "var(--otp-accent)"
                  : "var(--otp-disabled)",
          "--slot-bg":
            isActive && variant === "default"
              ? "color-mix(in srgb, var(--otp-accent) 6%, var(--otp-bg))"
              : "var(--otp-bg)",
          "--slot-ring":
            isActive && variant === "default"
              ? "0 0 0 1px var(--otp-accent)"
              : variant === "error"
                ? "0 0 0 1px var(--otp-error)"
                : variant === "success"
                  ? "0 0 0 1px var(--otp-success)"
                  : "none",
          borderColor: "var(--slot-border-color)",
          color: "var(--slot-text-color)",
          backgroundColor: "var(--slot-bg)",
          boxShadow: "var(--slot-ring)",
          zIndex: isActive ? 2 : undefined,
        } as React.CSSProperties),
      }}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="h-5 w-0.5 rounded-full animate-caret-blink duration-1000"
            style={{ backgroundColor: "var(--otp-accent)" }}
          />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

// ─── Separator ─────────────────────────────────────────────────────────────────

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("flex items-center justify-center w-5", className)}
    {...props}
  >
    {/* Thin pill instead of the default Minus icon — matches the palette aesthetic */}
    <span
      className="block h-0.5 w-2 rounded-full"
      style={{ backgroundColor: "var(--otp-border)" }}
      aria-hidden="true"
    />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

// ─── Exports ───────────────────────────────────────────────────────────────────

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

// ─── Usage example ─────────────────────────────────────────────────────────────
//
// <InputOTP maxLength={6} value={value} onChange={setValue}>
//   <InputOTPGroup>
//     <InputOTPSlot index={0} />
//     <InputOTPSlot index={1} />
//     <InputOTPSlot index={2} />
//   </InputOTPGroup>
//   <InputOTPSeparator />
//   <InputOTPGroup>
//     <InputOTPSlot index={3} />
//     <InputOTPSlot index={4} />
//     <InputOTPSlot index={5} />
//   </InputOTPGroup>
// </InputOTP>
//
// Error state:
// <InputOTPSlot index={0} variant="error" />
//
// Success state:
// <InputOTPSlot index={0} variant="success" />