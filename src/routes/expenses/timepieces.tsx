import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ExpensesTable } from "@/components/ExpensesTable";

export const Route = createFileRoute("/expenses/timepieces")({
  head: () => ({ meta: [{ title: "Timepieces Expenses — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <ExpensesTable table="timepieces_expenses" label="Ronin's Timepieces" />
    </AppShell>
  ),
});
