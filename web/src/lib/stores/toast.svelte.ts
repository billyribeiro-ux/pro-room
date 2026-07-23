/**
 * Ephemeral toast notifications — the in-page popup the reference fires via
 * ngx-toastr (`toastr.info/warning(...)`). House module pattern: a single
 * exported `$state` array (never a reassigned `let`), with plain functions.
 * No persistence — toasts live until they auto-dismiss or are cleared.
 */
import { browser } from '$app/environment';

/** The four ngx-toastr variants (overlays-toasts.md §Global CSS). */
export type ToastType = 'info' | 'error' | 'success' | 'warning';

export interface Toast {
	id: string;
	title: string;
	body: string;
	/** 0 = persistent (reference `disableTimeOut:true`) — stays until cleared. */
	timeoutMs: number;
	type: ToastType;
	/** Trailing spinning cog inside the message — HARD EVIDENCE (bundle offset
	 * 1074987): the media-reconnect toast body is literally
	 * `'Reconnecting to media... <i class="fas fa-cog fa-spin ms-2"></i>'`
	 * (enableHtml). We reproduce that one icon via this flag instead of
	 * rendering arbitrary HTML. */
	spinner: boolean;
	/** Reference `closeButton` option — the presenter reconnect toast passes
	 * `closeButton:false` (bundle offset 1075251). */
	closeButton: boolean;
}

export const toasts = $state<Toast[]>([]);

/** Remove a toast (auto-dismiss timer, the × button, or `toastr.clear`-style
 * programmatic clears keyed by the id `showToast` returned). */
export function dismissToast(id: string): void {
	const i = toasts.findIndex((t) => t.id === id);
	if (i !== -1) toasts.splice(i, 1);
}

/**
 * Show a toast and return its id (the reference keeps `toastr.info(...)`'s
 * handle and later calls `toastr.clear(toastId)` — bundle offset 1076138).
 * `timeoutMs` 0 = persistent. Mirrors toastr's `preventDuplicates`: an
 * identical (title+body) toast already showing is reused, returning its id.
 */
export function showToast(
	title: string,
	body: string,
	timeoutMs = 5000,
	opts: { type?: ToastType; spinner?: boolean; closeButton?: boolean } = {}
): string {
	if (!browser) return '';
	const dup = toasts.find((t) => t.title === title && t.body === body);
	if (dup) return dup.id;
	// crypto.randomUUID requires a secure context — undefined on a plain-HTTP LAN
	// origin, where it would THROW and kill the toast (e.g. the AV-error toast meant
	// to explain a blocked mic). Fall back to a time+random id off the secure path.
	const id =
		globalThis.crypto?.randomUUID?.() ?? `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	toasts.push({
		id,
		title,
		body,
		timeoutMs,
		type: opts.type ?? 'info',
		spinner: opts.spinner ?? false,
		closeButton: opts.closeButton ?? true
	});
	if (timeoutMs > 0) setTimeout(() => dismissToast(id), timeoutMs);
	return id;
}

// Dev-only test hook: lets Playwright drive THIS module instance (a dynamic
// `import()` from page.evaluate gets a separate Vite module, whose $state array
// no ToastContainer reads). Statically stripped from production builds.
if (browser && import.meta.env.DEV) {
	(globalThis as Record<string, unknown>).__showToast = showToast;
}
