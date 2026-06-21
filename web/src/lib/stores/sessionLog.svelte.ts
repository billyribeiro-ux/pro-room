/**
 * In-memory session debug log — a ring buffer of timestamped client lifecycle
 * events (WebSocket + LiveKit connect/disconnect/error/reconnect, media errors).
 *
 * Mirrors the reference protradingroom buffer: the global logger `I(msg)` builds
 * `"[HH:MM:SS] " + msg`, pushes to an array `L_`, and caps it at 900 entries
 * (shift oldest). The reference HARVESTS a user's buffer over socket.io
 * (getDebugLog → debugLogResp) so an ADMIN can inspect ANOTHER user's log; our
 * one-way RoomEvent WS has no client→client round-trip, so this is a SELF-view of
 * the current client's own session — the faithful, achievable port. (A true
 * admin-fetch-other-user clone would need new backend + WS plumbing.)
 *
 * House module pattern (see dnd.svelte.ts / layout.svelte.ts): a single reactive
 * `$state` object is exported (never a reassigned `let`, so the proxy survives
 * module boundaries), with plain functions. In-memory ONLY — not persisted (the
 * reference buffer is in-memory and clears on reload). NEVER log PII/tokens: keep
 * lines to event names + room id + error messages (the LiveKit/WS auth tokens
 * never reach here).
 */

const MAX_ENTRIES = 900;

/** The reactive ring buffer. Mutated in place (push/shift) so importers share it. */
export const sessionLog = $state<{ entries: string[] }>({ entries: [] });

/** Append a timestamped line, enforcing the 900-entry ring cap (reference parity). */
export function logEvent(message: string): void {
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- one-shot timestamp string, formatted then discarded; not reactive state
	sessionLog.entries.push(`[${new Date().toLocaleTimeString()}] ${message}`);
	if (sessionLog.entries.length > MAX_ENTRIES) sessionLog.entries.shift();
}

/** The buffer as a newline-joined string (reference `se.join("\n")`). Reactive. */
export function debugLogText(): string {
	return sessionLog.entries.join('\n');
}

/** Clear the buffer. */
export function clearLog(): void {
	sessionLog.entries = [];
}
