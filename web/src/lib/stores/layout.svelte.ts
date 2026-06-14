/**
 * Room layout preferences, backed by Svelte 5 runes.
 *
 * Mirrors the `privateChat.svelte.ts` / `dialog.svelte.ts` module pattern: a
 * single reactive `$state` object is exported (never a reassigned `let`, so the
 * proxy survives module boundaries — see Svelte docs, "Passing state across
 * modules"), alongside plain setter functions.
 *
 * This store only *holds* the preference. Actually rearranging the room shell
 * (moving the chat/alerts column to the chosen edge, and the PM logs to the
 * right) is wired by the room page (`routes/rooms/[id]/+page.svelte`) which
 * reads `layout.position` / `layout.pmLogsRight` reactively. The Settings modal
 * is the producer; the room page is the consumer.
 */
import { browser } from '$app/environment';

/** Where the combined Chat + Alerts column sits relative to the main stage. */
export type LayoutPosition = 'left' | 'top' | 'right' | 'bottom';

const POSITIONS: readonly LayoutPosition[] = ['left', 'top', 'right', 'bottom'];

const DEFAULT_POSITION: LayoutPosition = 'left';
const DEFAULT_PM_LOGS_RIGHT = false;

const POSITION_KEY = 'ptr.layout.position';
const PM_LOGS_KEY = 'ptr.layout.pmLogsRight';

function isPosition(value: unknown): value is LayoutPosition {
	return typeof value === 'string' && (POSITIONS as readonly string[]).includes(value);
}

function loadPosition(): LayoutPosition {
	if (!browser) return DEFAULT_POSITION;
	try {
		const raw = window.localStorage.getItem(POSITION_KEY);
		return isPosition(raw) ? raw : DEFAULT_POSITION;
	} catch {
		return DEFAULT_POSITION;
	}
}

function loadPmLogsRight(): boolean {
	if (!browser) return DEFAULT_PM_LOGS_RIGHT;
	try {
		return window.localStorage.getItem(PM_LOGS_KEY) === 'true';
	} catch {
		return DEFAULT_PM_LOGS_RIGHT;
	}
}

/**
 * Reactive room-layout preferences. Exported as an object (not a reassigned
 * `let`) so the `$state` proxy survives across module boundaries.
 */
export const layout = $state<{ position: LayoutPosition; pmLogsRight: boolean }>({
	position: loadPosition(),
	pmLogsRight: loadPmLogsRight()
});

/** Set where the Chat + Alerts column sits, persisting the choice. */
export function setLayoutPosition(position: LayoutPosition): void {
	if (!isPosition(position)) return;
	layout.position = position;
	if (!browser) return;
	try {
		window.localStorage.setItem(POSITION_KEY, position);
	} catch {
		// Storage may be unavailable (private mode, quota); ignore.
	}
}

/** Toggle whether the PM logs panel is pinned to the right, persisting it. */
export function setPmLogsRight(value: boolean): void {
	layout.pmLogsRight = value;
	if (!browser) return;
	try {
		window.localStorage.setItem(PM_LOGS_KEY, String(value));
	} catch {
		// ignore
	}
}
