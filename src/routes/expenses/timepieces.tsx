import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ExpensesTable } from "@/components/ExpensesTable";
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useRole } from '@/hooks/use-role'

export default function AquaticPage() {
  const { isLimited, loading } = useRole()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isLimited) {
      navigate({ to: '/dashboard' })
    }
  }, [isLimited, loading])

  if (loading) return null

  return (
    <div>
      {/* your existing content */}
    </div>
  )
}

export const Route = createFileRoute("/expenses/timepieces")({
  head: () => ({ meta: [{ title: "Timepieces Expenses — Ronin's Hub" }] }),
  component: () => (
    <AppShell>
      <ExpensesTable table="timepieces_expenses" label="Ronin's Timepieces" />
    </AppShell>
  ),
});