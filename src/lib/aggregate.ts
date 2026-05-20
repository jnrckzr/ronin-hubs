export function bucketByMonth(rows: { date: string; amount: number }[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + r.amount);
  }
  return [...map.entries()].sort().map(([k, v]) => ({ label: k, value: v }));
}

export function bucketByYear(rows: { date: string; amount: number }[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = String(new Date(r.date).getFullYear());
    map.set(key, (map.get(key) ?? 0) + r.amount);
  }
  return [...map.entries()].sort().map(([k, v]) => ({ label: k, value: v }));
}

export function mergeRevExp(
  rev: { label: string; value: number }[],
  exp: { label: string; value: number }[],
) {
  const labels = new Set<string>([...rev.map((r) => r.label), ...exp.map((r) => r.label)]);
  return [...labels].sort().map((l) => ({
    label: l,
    revenue: rev.find((r) => r.label === l)?.value ?? 0,
    expenses: exp.find((e) => e.label === l)?.value ?? 0,
  }));
}
