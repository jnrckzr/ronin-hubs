import { Header } from "./Header";
import { useAuth } from "@/lib/providers";
import { Navigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Fish } from "lucide-react";
import { useRole } from "@/hooks/use-role";

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen grid place-items-center bg-background transition-colors duration-300">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className={cn("absolute inset-0 rounded-2xl","bg-linear-to-br from-primary to-secondary-accent","opacity-20 blur-xl scale-150 animate-pulse")} />
          <div className={cn("relative h-14 w-14 rounded-2xl grid place-items-center","bg-linear-to-br from-primary to-secondary-accent","text-primary-foreground shadow-lg")} style={{ animation: "rh-float 2s ease-in-out infinite" }}>
            <Fish className="h-6 w-6" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl tracking-tight text-foreground">
            Ronin's <span className="text-primary">Hub</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Loading your command center…</p>
        </div>
        <div className="h-0.5 w-40 rounded-full overflow-hidden bg-border">
          <div className="h-full w-1/3 rounded-full bg-linear-to-r from-primary to-secondary-accent" style={{ animation: "rh-loading-slide 1.4s ease-in-out infinite" }} />
        </div>
      </div>
      <style>{`
        @keyframes rh-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes rh-loading-slide {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { loading: roleLoading } = useRole();

  if (loading || roleLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />   {/* ← no prop needed, Header calls useRole itself */}

      <div className="fixed inset-0 pointer-events-none -z-10 opacity-40 dark:opacity-20" aria-hidden>
        <div className="absolute -top-40 -right-40 h-150 w-150 rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 h-125 w-125 rounded-full"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-secondary-accent) 10%, transparent) 0%, transparent 70%)" }} />
      </div>

      <main
        className="container mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10"
        style={{ animation: "rh-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
      >
        {children}
      </main>

      <style>{`
        @keyframes rh-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}