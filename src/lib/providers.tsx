import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

// ---------------- Theme ----------------
type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    const initial: Theme = saved ?? "dark";
    setTheme(initial);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <ThemeCtx.Provider
      value={{ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}
export const useTheme = () => useContext(ThemeCtx);

// ---------------- Currency ----------------
type Currency = "PHP" | "USD";
const RATES: Record<Currency, number> = { PHP: 1, USD: 1 / 61.59 }; // approximate static rate
const SYMBOL: Record<Currency, string> = { PHP: "₱", USD: "$" };
const CurCtx = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (phpAmount: number) => string;
}>({ currency: "PHP", setCurrency: () => {}, format: (n) => `₱${n}` });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("PHP");
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("currency")) as Currency | null;
    if (saved === "PHP" || saved === "USD") setCurrencyState(saved);
  }, []);
  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };
  const format = (phpAmount: number) => {
    const v = phpAmount * RATES[currency];
    return `${SYMBOL[currency]}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  return <CurCtx.Provider value={{ currency, setCurrency, format }}>{children}</CurCtx.Provider>;
}
export const useCurrency = () => useContext(CurCtx);

// ---------------- Auth ----------------
const AuthCtx = createContext<{
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
    setSession(s);
    setLoading(false);
  });
  return () => sub.subscription.unsubscribe();
}, []);
  return (
    <AuthCtx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
export const useAuth = () => useContext(AuthCtx);
