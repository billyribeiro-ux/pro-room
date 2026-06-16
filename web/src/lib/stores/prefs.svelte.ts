/**
 * Client-side user preferences — the General Settings toggles that aren't theme,
 * layout, or DND. Mirrors the reference protradingroom model: every Settings
 * toggle calls `setPreference(key, value)` which writes `globals.preferences[key]`,
 * persists via `savePreferences()` (localStorage), and emits a LOCAL event — NO
 * server round-trip. So these are per-device prefs, exactly like our
 * `dnd.svelte.ts` / `layout.svelte.ts` stores.
 *
 * House module pattern: a single reactive `$state` object is exported (never a
 * reassigned `let`, so the proxy survives module boundaries), with a `setPref`
 * setter that persists to `localStorage` under `ptr.pref.<key>`, guarded by
 * `browser`. SettingsModal is the producer; the chat/alert/webcam/captions
 * components are the consumers (they read `prefs.<key>` reactively).
 *
 * DEFAULTS + POLARITY are copied from the reference preference object so behaviour
 * matches: note `videoEnabled` is the INVERSE of the reference `disableVideo`
 * (which defaults false → video ON), and `trimChatLogs`/`tabSleep`/`captionsOverlay`
 * default ON.
 */
import { browser } from '$app/environment';

/** Compact vs regular row density for the alert/chat feeds (reference 'r'/'c'). */
export type TextMode = 'regular' | 'compact';

export interface Prefs {
	/** Render presenter webcams, or show the "video off to preserve data" placeholder. */
	videoEnabled: boolean;
	/** Show the speech-reco closed-captions overlay (reference showSpeechRecoOverlay). */
	captionsOverlay: boolean;
	/** Alert feed row density. */
	alertMode: TextMode;
	/** Chat feed row density. */
	chatMode: TextMode;
	/** Render inline chat images at a smaller size (reference smallImagePreview). */
	smallImagePreview: boolean;
	/** Alert toast stays up 10s instead of 5s (reference longerAlertPopup). */
	longerAlertPopup: boolean;
	/** Chat log always snaps to bottom on new messages, ignoring scroll position. */
	alwaysScrollToBottom: boolean;
	/** Cap the in-memory chat log to save memory (reference trimChatLogs). */
	trimChatLogs: boolean;
	/** Throttle background work while the tab is hidden (reference visibilityChangeEnabled). */
	tabSleep: boolean;
	/** Show a second (Off-Topic) chat column alongside the main one. */
	extraChatColumn: boolean;
	/** Play a sound when recording starts. */
	startRecordingSound: boolean;
	/** Play a sound when recording stops. */
	stopRecordingSound: boolean;
	/** Play a sound on a reaction response. */
	reactionsResponse: boolean;
	/** Play a sound on a Q&A reaction response. */
	reactionsQaResponse: boolean;
	/** Play a sound on a Q&A reaction (Alert tab "QA Reactions Sound"). */
	qaReactionsSound: boolean;
}

export type PrefKey = keyof Prefs;

/** Reference-faithful defaults (polarity matches the original preference object). */
const DEFAULTS: Prefs = {
	videoEnabled: true,
	captionsOverlay: true,
	alertMode: 'regular',
	chatMode: 'regular',
	smallImagePreview: false,
	longerAlertPopup: false,
	alwaysScrollToBottom: false,
	trimChatLogs: true,
	tabSleep: true,
	extraChatColumn: false,
	startRecordingSound: true,
	stopRecordingSound: true,
	reactionsResponse: true,
	reactionsQaResponse: true,
	qaReactionsSound: true
};

const KEYS = Object.keys(DEFAULTS) as PrefKey[];

function storageKey(key: PrefKey): string {
	return `ptr.pref.${key}`;
}

/** Read one persisted pref, falling back to its default when unset/unavailable. */
function load<K extends PrefKey>(key: K): Prefs[K] {
	const fallback = DEFAULTS[key];
	if (!browser) return fallback;
	try {
		const raw = window.localStorage.getItem(storageKey(key));
		if (raw === null) return fallback;
		// 'regular'/'compact' string prefs round-trip as-is; booleans via String().
		if (typeof fallback === 'boolean') return (raw === 'true') as Prefs[K];
		return raw as Prefs[K];
	} catch {
		return fallback;
	}
}

function loadAll(): Prefs {
	return KEYS.reduce((acc, k) => {
		// @ts-expect-error index write is sound — K is constrained to each key in turn.
		acc[k] = load(k);
		return acc;
	}, {} as Prefs);
}

/**
 * Reactive preferences. Exported as an object (not a reassigned `let`) so the
 * `$state` proxy survives across module boundaries.
 */
export const prefs = $state<Prefs>(loadAll());

/** Set one preference, persisting it to localStorage (reference setPreference). */
export function setPref<K extends PrefKey>(key: K, value: Prefs[K]): void {
	if (!KEYS.includes(key)) return;
	prefs[key] = value;
	if (!browser) return;
	try {
		window.localStorage.setItem(storageKey(key), String(value));
	} catch {
		// Storage may be unavailable (private mode, quota); the in-memory value still works.
	}
}
