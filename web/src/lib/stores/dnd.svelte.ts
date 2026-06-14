/**
 * Granular per-channel Do Not Disturb preferences, backed by Svelte 5 runes.
 *
 * Mirrors the reference room's per-channel DND switches: a master "Don't
 * Disturb" toggle (`app`) plus independent flags for each notification surface
 * (alerts, chat, presenter, Q&A, etc.). A flag being `true` means that channel
 * is *disturbed* — i.e. its sounds and popups are suppressed. The default is
 * ALL `false` (nothing suppressed; sounds/popups ON).
 *
 * Follows the house module pattern (`layout.svelte.ts`,
 * `privateChat.svelte.ts`): a single reactive `$state` object is exported
 * (never a reassigned `let`, so the proxy survives module boundaries — see
 * Svelte docs, "Passing state across modules"), alongside plain setter
 * functions. Each flag is persisted to `localStorage` under `ptr.dnd.<key>`,
 * guarded by `browser`, and rehydrated on init.
 *
 * This store only *holds* the preferences. The Settings modal is the producer
 * (flipping flags via `setDnd`); the alert/chat/sound consumers read the flags
 * reactively via `isMuted(channel)`. The sound service
 * (`$lib/sound.svelte.ts`) imports this module to gate playback.
 */
import { browser } from '$app/environment';

/**
 * The set of Do Not Disturb channels. Every flag defaults to `false`
 * (not disturbed). `app` is the master switch that disturbs everything.
 */
export interface DndFlags {
	/** Master "Don't Disturb": when true, ALL channels are treated as muted. */
	app: boolean;
	/** Trade-alert feed notifications. */
	alert: boolean;
	/** Pop-up toast when a new alert arrives. */
	alertPopup: boolean;
	/** Chat message notifications. */
	chat: boolean;
	/** Pop-up toast for chat messages. */
	chatPopup: boolean;
	/** Animated GIFs in chat. */
	chatGif: boolean;
	/** Role/level badges next to chat authors. */
	chatBadges: boolean;
	/** Presenter (host going live / screen-share) notifications. */
	presenter: boolean;
	/** Alert Q&A (question asked / resolved) notifications. */
	qa: boolean;
	/** Non-trade alerts (general announcements). */
	nonTradeAlert: boolean;
}

/** A single Do Not Disturb flag key. */
export type DndKey = keyof DndFlags;

const DND_KEYS: readonly DndKey[] = [
	'app',
	'alert',
	'alertPopup',
	'chat',
	'chatPopup',
	'chatGif',
	'chatBadges',
	'presenter',
	'qa',
	'nonTradeAlert'
];

/** localStorage key for a given flag, e.g. `ptr.dnd.alert`. */
function storageKey(key: DndKey): string {
	return `ptr.dnd.${key}`;
}

/** Read one persisted flag; defaults to `false` (not disturbed) when unset. */
function loadFlag(key: DndKey): boolean {
	if (!browser) return false;
	try {
		return window.localStorage.getItem(storageKey(key)) === 'true';
	} catch {
		// Storage may be unavailable (private mode, quota); default to ON.
		return false;
	}
}

/** Build the initial flag set from localStorage (all `false` on the server). */
function loadAll(): DndFlags {
	return {
		app: loadFlag('app'),
		alert: loadFlag('alert'),
		alertPopup: loadFlag('alertPopup'),
		chat: loadFlag('chat'),
		chatPopup: loadFlag('chatPopup'),
		chatGif: loadFlag('chatGif'),
		chatBadges: loadFlag('chatBadges'),
		presenter: loadFlag('presenter'),
		qa: loadFlag('qa'),
		nonTradeAlert: loadFlag('nonTradeAlert')
	};
}

/**
 * Reactive Do Not Disturb preferences. Exported as an object (not a reassigned
 * `let`) so the `$state` proxy survives across module boundaries.
 */
export const dnd = $state<DndFlags>(loadAll());

/** Set one DND flag, persisting the choice to localStorage. */
export function setDnd(key: DndKey, value: boolean): void {
	if (!DND_KEYS.includes(key)) return;
	dnd[key] = value;
	if (!browser) return;
	try {
		window.localStorage.setItem(storageKey(key), String(value));
	} catch {
		// Storage may be unavailable (private mode, quota); ignore.
	}
}

/**
 * Whether a channel is currently muted. The master `app` switch overrides every
 * channel, so a channel is muted when either `dnd.app` or its own flag is set.
 */
export function isMuted(channel: DndKey): boolean {
	return dnd.app || dnd[channel];
}
