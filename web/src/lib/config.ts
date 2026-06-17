import { env } from '$env/dynamic/public';

/** Base URL of the Rust API. Configured via PUBLIC_API_URL. */
export const API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

/** WebSocket origin derived from the API URL (http→ws, https→wss). */
export const WS_URL = API_URL.replace(/^http/, 'ws');

/**
 * GIPHY API key for the chat GIF picker. OPTIONAL — when unset, the composer's GIF
 * button stays disabled (the picker never half-wires against a missing provider).
 * Get a free key at https://developers.giphy.com (Create an App → "API" → copy the
 * API Key) and add it to web/.env as `PUBLIC_GIPHY_KEY=...`, then restart the dev
 * server. Public by design (GIPHY web keys are client-side; scope/rotate via their
 * dashboard).
 */
export const GIPHY_KEY = env.PUBLIC_GIPHY_KEY ?? '';
