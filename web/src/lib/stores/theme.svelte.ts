/**
 * Runtime-customizable color theme, backed by Svelte 5 runes.
 *
 * The tokens here mirror the CSS custom properties declared under `:root` in
 * `src/routes/layout.css`. Applying a value sets an inline custom property on
 * `document.documentElement`, which wins over the `:root` declaration so the
 * whole app re-themes live. Overrides persist to `localStorage` and are
 * validated with valibot on the way in (untrusted storage / user input).
 */
import { browser } from '$app/environment';
import { parseHexColor, parseFontSizePx } from '$lib/schemas';

/** Customizable color tokens (subset of the layout tokens worth recoloring). */
export type ThemeTokens = {
	'--bg': string;
	'--bg-elev': string;
	'--bg-elev-2': string;
	'--border': string;
	'--text': string;
	'--text-dim': string;
	'--accent': string;
	'--accent-hover': string;
	'--positive': string;
	'--negative': string;
	'--warn': string;
	'--username-color': string;
	'--ticker-color': string;
};

export type ThemeTokenKey = keyof ThemeTokens;

/** Defaults copied verbatim from layout.css `:root` — the navy "Revolution
 * Trading Room" palette that matches the reference app. */
const DEFAULTS: ThemeTokens = {
	'--bg': '#0c2434',
	'--bg-elev': '#0f2e43',
	'--bg-elev-2': '#103d5c',
	'--border': '#1a4f74',
	'--text': '#ffffff',
	'--text-dim': '#9fc4dd',
	'--accent': '#45a2ff',
	'--accent-hover': '#0a6db1',
	'--positive': '#92d528',
	'--negative': '#bb352a',
	'--warn': '#f39c12',
	'--username-color': '#0a6db1',
	'--ticker-color': '#1a1a1a'
};

/** Default message font size in px (mirrors layout.css `--msg-font-size`). */
const DEFAULT_FONT_SIZE = 13;

/**
 * Light / dark mode is orthogonal to the recolorable token overrides above:
 * the *mode* swaps the whole base palette by toggling
 * `document.documentElement.dataset.theme`, which `layout.css` keys a
 * `:root[data-theme='light'] { ... }` override block off of. The navy app
 * ships dark by default.
 */
export type ThemeMode = 'light' | 'dark';

const DEFAULT_MODE: ThemeMode = 'dark';

export type ThemePreset = {
	id: string;
	name: string;
	tokens: ThemeTokens;
};

/** Built-in presets. "Midnight" is the current default palette. */
export const PRESETS: ThemePreset[] = [
	{
		// Faithful dark-blue brand palette captured from the live trading-room app
		// (dark blue over a bright link/accent), shipped as the Revolution Trading
		// Room theme.
		id: 'revolution',
		name: 'Revolution Trading Room',
		tokens: {
			'--bg': '#0c2434',
			'--bg-elev': '#0f2e43',
			'--bg-elev-2': '#103d5c',
			'--border': '#1a4f74',
			'--text': '#ffffff',
			'--text-dim': '#9fc4dd',
			'--accent': '#45a2ff',
			'--accent-hover': '#0a6db1',
			'--positive': '#92d528',
			'--negative': '#bb352a',
			'--warn': '#f39c12',
			'--username-color': '#0a6db1',
			'--ticker-color': '#1a1a1a'
		}
	},
	{
		id: 'midnight',
		name: 'Midnight',
		tokens: {
			'--bg': '#0b0e14',
			'--bg-elev': '#141925',
			'--bg-elev-2': '#1c2230',
			'--border': '#28303f',
			'--text': '#e6e9ef',
			'--text-dim': '#9aa4b5',
			'--accent': '#3b82f6',
			'--accent-hover': '#2f6fe0',
			'--positive': '#16c784',
			'--negative': '#ea3943',
			'--warn': '#f0b90b',
			'--username-color': '#e6e9ef',
			'--ticker-color': '#3b82f6'
		}
	},
	{
		id: 'emerald',
		name: 'Emerald',
		tokens: {
			'--bg': '#0a1410',
			'--bg-elev': '#0f1d17',
			'--bg-elev-2': '#16291f',
			'--border': '#22382c',
			'--text': '#e7f0ea',
			'--text-dim': '#94b3a3',
			'--accent': '#10b981',
			'--accent-hover': '#0e9f72',
			'--positive': '#22d3a6',
			'--negative': '#ef4444',
			'--warn': '#f59e0b',
			'--username-color': '#e7f0ea',
			'--ticker-color': '#10b981'
		}
	},
	{
		id: 'slate',
		name: 'Slate',
		tokens: {
			'--bg': '#0f172a',
			'--bg-elev': '#1e293b',
			'--bg-elev-2': '#283549',
			'--border': '#334155',
			'--text': '#f1f5f9',
			'--text-dim': '#94a3b8',
			'--accent': '#6366f1',
			'--accent-hover': '#4f51d6',
			'--positive': '#10b981',
			'--negative': '#f43f5e',
			'--warn': '#eab308',
			'--username-color': '#f1f5f9',
			'--ticker-color': '#6366f1'
		}
	},
	{
		id: 'amber',
		name: 'Amber',
		tokens: {
			'--bg': '#14100a',
			'--bg-elev': '#1e1810',
			'--bg-elev-2': '#2a2117',
			'--border': '#3b2f1f',
			'--text': '#f5ead9',
			'--text-dim': '#b5a487',
			'--accent': '#f0b90b',
			'--accent-hover': '#d8a609',
			'--positive': '#16c784',
			'--negative': '#ea3943',
			'--warn': '#fb923c',
			'--username-color': '#f5ead9',
			'--ticker-color': '#f0b90b'
		}
	}
];

const STORAGE_KEY = 'ptr.theme.tokens';
const FONT_STORAGE_KEY = 'ptr.theme.fontSize';
const MODE_STORAGE_KEY = 'ptr.theme.mode';

function loadOverrides(): Partial<ThemeTokens> {
	if (typeof window === 'undefined') return {};
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as Partial<Record<ThemeTokenKey, unknown>>;
		// Only keep keys we recognise whose values pass hex validation.
		const out: Partial<ThemeTokens> = {};
		for (const key of Object.keys(DEFAULTS) as ThemeTokenKey[]) {
			const value = parsed[key];
			if (typeof value !== 'string') continue;
			const hex = parseHexColor(value);
			if (hex) out[key] = hex;
		}
		return out;
	} catch {
		return {};
	}
}

function loadFontSize(): number {
	if (typeof window === 'undefined') return DEFAULT_FONT_SIZE;
	try {
		const raw = window.localStorage.getItem(FONT_STORAGE_KEY);
		if (!raw) return DEFAULT_FONT_SIZE;
		return parseFontSizePx(Number(raw)) ?? DEFAULT_FONT_SIZE;
	} catch {
		return DEFAULT_FONT_SIZE;
	}
}

function loadMode(): ThemeMode {
	if (!browser) return DEFAULT_MODE;
	try {
		const raw = window.localStorage.getItem(MODE_STORAGE_KEY);
		return raw === 'light' || raw === 'dark' ? raw : DEFAULT_MODE;
	} catch {
		return DEFAULT_MODE;
	}
}

class ThemeStore {
	/** Current effective token values (defaults merged with persisted overrides). */
	tokens = $state<ThemeTokens>({ ...DEFAULTS, ...loadOverrides() });

	/** Current message font size in px. */
	fontSize = $state<number>(loadFontSize());

	/** Current light/dark mode (selects the base palette via `data-theme`). */
	mode = $state<ThemeMode>(loadMode());

	/** The full set of selectable token keys. */
	get keys(): ThemeTokenKey[] {
		return Object.keys(DEFAULTS) as ThemeTokenKey[];
	}

	/** Built-in presets for the UI. */
	get presets(): ThemePreset[] {
		return PRESETS;
	}

	/** Write current tokens as inline custom properties on the document root. */
	apply(): void {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		for (const key of this.keys) {
			root.style.setProperty(key, this.tokens[key]);
		}
		root.style.setProperty('--msg-font-size', `${this.fontSize}px`);
		this.applyMode();
	}

	/**
	 * Reflect the current mode onto `document.documentElement.dataset.theme`,
	 * which `layout.css` keys its `:root[data-theme='light']` override block off
	 * of. Guarded with the `$app/environment` browser check for SSR safety.
	 */
	applyMode(): void {
		if (!browser) return;
		document.documentElement.dataset.theme = this.mode;
	}

	private persist(): void {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tokens));
			window.localStorage.setItem(FONT_STORAGE_KEY, String(this.fontSize));
			window.localStorage.setItem(MODE_STORAGE_KEY, this.mode);
		} catch {
			// Storage may be unavailable (private mode, quota); ignore.
		}
	}

	/**
	 * Set a single token, then re-apply and persist. Invalid hex values are
	 * rejected (validated with valibot) so the theme can't be corrupted.
	 * Returns true when applied.
	 */
	set(key: ThemeTokenKey, value: string): boolean {
		const hex = parseHexColor(value);
		if (!hex) return false;
		this.tokens = { ...this.tokens, [key]: hex };
		this.apply();
		this.persist();
		return true;
	}

	/** Set the message font size in px (validated/bounded). Returns true when applied. */
	setFontSize(px: number): boolean {
		const size = parseFontSizePx(px);
		if (size === null) return false;
		this.fontSize = size;
		this.apply();
		this.persist();
		return true;
	}

	/** Switch the light/dark mode, then re-apply and persist. */
	setMode(mode: ThemeMode): void {
		if (mode !== 'light' && mode !== 'dark') return;
		this.mode = mode;
		this.applyMode();
		this.persist();
	}

	/** Replace all tokens with a named preset's palette. */
	applyPreset(id: string): void {
		const preset = PRESETS.find((p) => p.id === id);
		if (!preset) return;
		this.tokens = { ...preset.tokens };
		this.apply();
		this.persist();
	}

	/** Restore the default (navy "Revolution Trading Room") palette and clear
	 * persisted overrides. */
	reset(): void {
		this.tokens = { ...DEFAULTS };
		this.fontSize = DEFAULT_FONT_SIZE;
		this.mode = DEFAULT_MODE;
		this.apply();
		if (typeof window !== 'undefined') {
			try {
				window.localStorage.removeItem(STORAGE_KEY);
				window.localStorage.removeItem(FONT_STORAGE_KEY);
				window.localStorage.removeItem(MODE_STORAGE_KEY);
			} catch {
				// ignore
			}
		}
	}
}

export const theme = new ThemeStore();
