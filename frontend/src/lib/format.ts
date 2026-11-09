/** "2026-02-26" -> "Feb 26, 2026" (parsed as a local date, not UTC). */
export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function sum<T>(items: T[], pick: (item: T) => number | undefined): number {
  return items.reduce((total, item) => total + (pick(item) ?? 0), 0);
}
