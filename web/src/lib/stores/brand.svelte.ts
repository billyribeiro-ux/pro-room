import { browser } from '$app/environment';
import { API_URL } from '$lib/config';
import { BRAND as DEFAULT_BRAND } from '$lib/brand';

interface BrandState {
	name: string;
	logo: string;
}

/**
 * Reactive app brand (name + logo). Seeded from the bundled defaults
 * ([`$lib/brand`]) so the UI renders instantly, then overridden by the
 * server-configured branding once [`loadBrand`] runs at startup and again
 * whenever an admin saves via [`applyBranding`]. Exported as a `$state` object
 * (not a reassigned `let`) so the proxy survives module boundaries.
 */
export const brand = $state<BrandState>({
	name: DEFAULT_BRAND.name,
	logo: DEFAULT_BRAND.logo
});

interface BrandingResponse {
	name: string | null;
	logo_url: string | null;
}

/** Resolve a server `logo_url` (relative to the API origin) to an absolute URL an
    `<img>` can load. A null/blank value falls back to the bundled default, which
    is served same-origin and used verbatim. */
function resolveLogo(logoUrl: string | null): string {
	if (!logoUrl) return DEFAULT_BRAND.logo;
	return logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`;
}

/** Apply a branding payload to the live store (after a load or an admin save) so
    every consumer (top nav, global nav) updates reactively and immediately. */
export function applyBranding(data: BrandingResponse): void {
	brand.name = data.name?.trim() || DEFAULT_BRAND.name;
	brand.logo = resolveLogo(data.logo_url);
}

/** Load server-configured branding once at startup. Silent on failure — the
    bundled defaults already render, so a branding outage never blocks the UI. */
export async function loadBrand(): Promise<void> {
	if (!browser) return;
	try {
		const res = await fetch(`${API_URL}/api/branding`, { credentials: 'include' });
		if (!res.ok) return;
		applyBranding((await res.json()) as BrandingResponse);
	} catch {
		// Keep the bundled defaults.
	}
}
