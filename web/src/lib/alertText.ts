/**
 * One-line text body for a trade alert: `"SYMBOL side note"` (reference `e.txt`).
 * Shared by the alert feed row, the alert toast, and the logs so the three never
 * drift apart.
 */
export function alertBody(a: { symbol: string; side?: string | null; note?: string | null }): string {
	const head = a.side ? `${a.symbol} ${a.side}` : a.symbol;
	return a.note ? `${head} ${a.note}` : head;
}
