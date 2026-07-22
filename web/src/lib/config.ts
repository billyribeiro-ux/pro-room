import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

/**
 * Base URL of the Rust API.
 *
 * - **Local dev (default):** empty string → same-origin `/api/*` via the Vite proxy
 *   (`vite.config.ts`). Session cookies stay first-party on :5173.
 * - **Deployed / direct API:** set `PUBLIC_API_URL=https://api.example.com` (no trailing slash).
 */
export const API_URL = (env.PUBLIC_API_URL ?? '').replace(/\/$/, '');

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
