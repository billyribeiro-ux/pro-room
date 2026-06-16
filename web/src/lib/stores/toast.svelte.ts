/**
 * Ephemeral toast notifications — the in-page popup the reference fires on each
 * new alert via `toastr.warning(text, title, { timeOut })`. House module pattern:
 * a single exported `$state` array (never a reassigned `let`), with plain
 * functions. No persistence — toasts live only until they auto-dismiss.
 */
import { browser } from '$app/environment';

export interface Toast {
	id: string;
	title: string;
	body: string;
	timeoutMs: number;
}

export const toasts = $state<Toast[]>([]);

/** Remove a toast (used by the auto-dismiss timer + click-to-dismiss). */
export function dismissToast(id: string): void {
	const i = toasts.findIndex((t) => t.id === id);
	if (i !== -1) toasts.splice(i, 1);
}

/**
 * Show a toast for `timeoutMs`, then auto-dismiss. Mirrors toastr's
 * `preventDuplicates`: an identical (title+body) toast already showing is skipped.
 */
export function showToast(title: string, body: string, timeoutMs = 5000): void {
	if (!browser) return;
	if (toasts.some((t) => t.title === title && t.body === body)) return;
	const id = crypto.randomUUID();
	toasts.push({ id, title, body, timeoutMs });
	setTimeout(() => dismissToast(id), timeoutMs);
}
