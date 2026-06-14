/**
 * Promise-based confirm/prompt dialog primitive.
 *
 * House rule forbids `window.confirm` / `window.prompt` / `window.alert`
 * (they are unstyled and break the dark theme). Call `confirmDialog(...)`
 * or `promptDialog(...)` from anywhere; each returns a Promise that
 * resolves once the user acts on the dialog rendered by `<DialogHost />`.
 *
 * `<DialogHost />` is mounted exactly once in the root layout and reads the
 * reactive `dialog.current` to know what to show.
 */

export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmLabel?: string;
	/** Style the confirm action as destructive (red). */
	danger?: boolean;
}

export interface PromptOptions {
	title?: string;
	message: string;
	value?: string;
	placeholder?: string;
}

interface ConfirmRequest {
	kind: 'confirm';
	title?: string;
	message: string;
	confirmLabel?: string;
	danger?: boolean;
}

interface PromptRequest {
	kind: 'prompt';
	title?: string;
	message: string;
	value?: string;
	placeholder?: string;
}

export type DialogRequest = ConfirmRequest | PromptRequest;

/**
 * Reactive holder for the active request. Exported as an object (not a
 * reassigned `let`) so the `$state` proxy survives across module
 * boundaries — see Svelte docs, "Passing state across modules".
 */
export const dialog = $state<{ current: DialogRequest | null }>({ current: null });

/**
 * The resolver for the active request is kept out of reactive state on
 * purpose: it never needs to drive the UI, and storing a function in a
 * `$state` proxy would proxy it needlessly. Only one dialog is active at a
 * time, so a single module-private slot is sufficient.
 */
let resolveConfirm: ((value: boolean) => void) | null = null;
let resolvePrompt: ((value: string | null) => void) | null = null;

/**
 * Open a confirm dialog. Resolves `true` if the user confirms, `false` if
 * they cancel or dismiss it.
 */
export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
	// A new request supersedes any in-flight one; cancel the old promise so
	// its caller is never left hanging.
	cancelPending();
	return new Promise<boolean>((resolve) => {
		resolveConfirm = resolve;
		dialog.current = {
			kind: 'confirm',
			title: opts.title,
			message: opts.message,
			confirmLabel: opts.confirmLabel,
			danger: opts.danger
		};
	});
}

/**
 * Open a prompt dialog. Resolves the entered string on OK, or `null` if the
 * user cancels or dismisses it.
 */
export function promptDialog(opts: PromptOptions): Promise<string | null> {
	cancelPending();
	return new Promise<string | null>((resolve) => {
		resolvePrompt = resolve;
		dialog.current = {
			kind: 'prompt',
			title: opts.title,
			message: opts.message,
			value: opts.value,
			placeholder: opts.placeholder
		};
	});
}

/** Host helper: resolve the active confirm and clear the dialog. */
export function resolveConfirmDialog(confirmed: boolean): void {
	const resolve = resolveConfirm;
	clear();
	resolve?.(confirmed);
}

/** Host helper: resolve the active prompt and clear the dialog. */
export function resolvePromptDialog(value: string | null): void {
	const resolve = resolvePrompt;
	clear();
	resolve?.(value);
}

/**
 * Host helper for backdrop/Escape dismissal: resolve the active request with
 * its "cancelled" value (`false` for confirm, `null` for prompt).
 */
export function dismissDialog(): void {
	const request = dialog.current;
	if (request?.kind === 'confirm') {
		resolveConfirmDialog(false);
	} else if (request?.kind === 'prompt') {
		resolvePromptDialog(null);
	}
}

/** Reset all pending resolvers and clear the active request. */
function clear(): void {
	resolveConfirm = null;
	resolvePrompt = null;
	dialog.current = null;
}

/** Resolve any in-flight request with its cancelled value before replacing it. */
function cancelPending(): void {
	resolveConfirm?.(false);
	resolvePrompt?.(null);
	resolveConfirm = null;
	resolvePrompt = null;
}
