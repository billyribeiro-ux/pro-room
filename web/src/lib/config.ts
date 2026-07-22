import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

/**
 * Base URL of the Rust API.
 *
 * - **Vite dev:** always same-origin (`''`) so `/api/*` is proxied to the Rust API
 *   (`vite.config.ts`). Ignores a stale `PUBLIC_API_URL=http://localhost:8080` that
 *   would make the browser call `:8080` directly and break session cookies.
 * - **Production / preview:** use `PUBLIC_API_URL` if set (no trailing slash).
 */
export const API_URL = import.meta.env.DEV
	? ''
	: (env.PUBLIC_API_URL ?? '').replace(/\/$/, '');

/**
 * WebSocket origin for the room hub.
 * Same-origin when `API_URL` is empty; otherwise http→ws / https→wss on the API host.
 */
export const WS_URL = API_URL
	? API_URL.replace(/^http/, 'ws')
	: browser
		? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`
		: 'ws://127.0.0.1:8080';

/**
 * GIPHY API key for the chat GIF picker. OPTIONAL — when unset, the composer's GIF
 * button stays disabled (the picker never half-wires against a missing provider).
 * Get a free key at https://developers.giphy.com (Create an App → "API" → copy the
 * API Key) and add it to web/.env as `PUBLIC_GIPHY_KEY=...`, then restart the dev
 * server. Public by design (GIPHY web keys are client-side; scope/rotate via their
 * dashboard).
 */
export const GIPHY_KEY = env.PUBLIC_GIPHY_KEY ?? '';
