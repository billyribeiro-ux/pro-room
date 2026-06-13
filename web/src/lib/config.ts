import { env } from '$env/dynamic/public';

/** Base URL of the Rust API. Configured via PUBLIC_API_URL. */
export const API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

/** WebSocket origin derived from the API URL (http→ws, https→wss). */
export const WS_URL = API_URL.replace(/^http/, 'ws');
