import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ExpensesTable } from "@/components/ExpensesTable";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "@/hooks/use-role";

function AquaticExpensesPage() {
  const { isLimited, loading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isLimited) {
      navigate({ to: "/dashboard" });
    }
  }, [isLimited, loading, navigate]);

  if (loading) return null;
  if (isLimited) return null;

  return (
    <ExpensesTable table="aquatic_expenses" label="Ronin's Aquatic" />
  );
}

export const Route = createFileRoute("/expenses/aquatic")({
  head: () => ({ meta: [{ title: "Aquatic Expenses — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <AquaticExpensesPage />
    </AppShell>
  ),
});