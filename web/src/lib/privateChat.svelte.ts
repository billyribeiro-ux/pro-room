/**
 * Cross-cutting "open a private chat" intent, so any component (e.g. the
 * User Info modal, rendered deep inside the alert/chat panels) can open the
 * page-level `<PrivateChat />` panel without prop-drilling through every
 * intermediate component. Mirrors the `dialog.svelte.ts` pattern.
 *
 * `<PrivateChat />` is rendered exactly once in the room page and reads the
 * reactive `privateChat.peer` to know whom (if anyone) to show.
 */

export interface PrivatePeer {
	display_name?: string;
	user_id?: string;
}

/**
 * Exported as an object (not a reassigned `let`) so the `$state` proxy
 * survives across module boundaries — see Svelte docs, "Passing state across
 * modules".
 */
export const privateChat = $state<{ peer: PrivatePeer | null }>({ peer: null });

/** Open the private-chat panel with the given peer. */
export function openPrivateChat(peer: PrivatePeer): void {
	privateChat.peer = peer;
}

/** Close the private-chat panel. */
export function closePrivateChat(): void {
	privateChat.peer = null;
}
