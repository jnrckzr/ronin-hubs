import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthProvider, CurrencyProvider, ThemeProvider } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Fish } from "lucide-react";

// ─── 404 ──────────────────────────────────────────────────────────────────────

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Big 404 with gradient */}
        <div
          className="font-display text-[clamp(5rem,22vw,9rem)] leading-none font-bold"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary-accent))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl text-foreground">Page not found</h2>
          <p className="text-sm text-muted-foreground">This page swam away into the deep.</p>
        </div>

        <Link
          to="/"
          className={cn(
            "inline-flex items-center justify-center gap-2",
            "rounded-xl bg-primary px-6 py-2.5",
            "text-sm font-medium text-primary-foreground",
            "shadow-md shadow-primary/30",
            "transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5",
            "hover:shadow-lg hover:shadow-primary/40",
            "active:scale-95 touch-manipulation",
          )}
        >
          <Fish className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  if (import.meta.env.DEV) console.error(error);

  const safeMessage = import.meta.env.PROD
    ? "An unexpected error occurred. Please try again."
    : error.message;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Error icon */}
        <div
          className={cn(
            "mx-auto h-16 w-16 rounded-2xl grid place-items-center",
            "bg-destructive/10 border border-destructive/20",
          )}
        >
          <span className="text-3xl">⚠</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-[clamp(1.5rem,5vw,2.25rem)] leading-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground wrap-break-word leading-relaxed">
            {safeMessage}
          </p>
        </div>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className={cn(
            "inline-flex items-center justify-center",
            "rounded-xl bg-primary px-6 py-2.5",
            "text-sm font-medium text-primary-foreground",
            "shadow-md shadow-primary/30",
            "transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5",
            "active:scale-95 touch-manipulation",
          )}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "theme-color", content: "#0F1117" },
      { title: "Ronin's Hub — Aquatic, Timepieces & Lending" },
      {
        name: "description",
        content: "Inventory, sales, expenses and lending dashboard for Ronin's Aquatic, Ronin's Timepieces and Ronin's Lending Money.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { 
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fira+Sans:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// ─── Shell ────────────────────────────────────────────────────────────────────

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* FOUC prevention: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <AuthInvalidator />
            <Outlet />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// ─── Auth Invalidator ─────────────────────────────────────────────────────────

function AuthInvalidator() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);
  return null;
}