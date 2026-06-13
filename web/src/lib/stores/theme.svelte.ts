/**
 * Runtime-customizable color theme, backed by Svelte 5 runes.
 *
 * The tokens here mirror the CSS custom properties declared under `:root` in
 * `src/routes/layout.css`. Applying a value sets an inline custom property on
 * `document.documentElement`, which wins over the `:root` declaration so the
 * whole app re-themes live. Overrides persist to `localStorage`.
 */

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
};

export type ThemeTokenKey = keyof ThemeTokens;

/** Defaults copied verbatim from layout.css `:root`. */
const DEFAULTS: ThemeTokens = {
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
	'--warn': '#f0b90b'
};

export type ThemePreset = {
	id: string;
	name: string;
	tokens: ThemeTokens;
};

/** Built-in presets. "Midnight" is the current default palette. */
export const PRESETS: ThemePreset[] = [
	{
		id: 'midnight',
		name: 'Midnight',
		tokens: { ...DEFAULTS }
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
			'--warn': '#f59e0b'
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
			'--warn': '#eab308'
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
			'--warn': '#fb923c'
		}
	}
];

const STORAGE_KEY = 'ptr.theme.tokens';

function loadOverrides(): Partial<ThemeTokens> {
	if (typeof window === 'undefined') return {};
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as Partial<ThemeTokens>;
		// Only keep keys we recognise.
		const out: Partial<ThemeTokens> = {};
		for (const key of Object.keys(DEFAULTS) as ThemeTokenKey[]) {
			const value = parsed[key];
			if (typeof value === 'string') out[key] = value;
		}
		return out;
	} catch {
		return {};
	}
}

class ThemeStore {
	/** Current effective token values (defaults merged with persisted overrides). */
	tokens = $state<ThemeTokens>({ ...DEFAULTS, ...loadOverrides() });

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
	}

	private persist(): void {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tokens));
		} catch {
			// Storage may be unavailable (private mode, quota); ignore.
		}
	}

	/** Set a single token, then re-apply and persist. */
	set(key: ThemeTokenKey, value: string): void {
		this.tokens = { ...this.tokens, [key]: value };
		this.apply();
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

	/** Restore the default ("Midnight") palette and clear persisted overrides. */
	reset(): void {
		this.tokens = { ...DEFAULTS };
		this.apply();
		if (typeof window !== 'undefined') {
			try {
				window.localStorage.removeItem(STORAGE_KEY);
			} catch {
				// ignore
			}
		}
	}
}

export const theme = new ThemeStore();
