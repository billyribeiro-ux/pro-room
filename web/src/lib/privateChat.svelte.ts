/**
 * Cross-cutting private-chat state + API, so any component (e.g. the User Info
 * modal, deep inside the alert/chat panels) can open a 1:1 thread without
 * prop-drilling. `<PrivateChat />` is rendered once in the room page and reads
 * the reactive `privateChat` store.
 *
 * Backend (see server http/private_messages.rs):
 *   POST   /api/rooms/{id}/pm            { recipient_id, body } -> PrivateMessageView
 *   GET    /api/rooms/{id}/pm/{peer_id}  -> PrivateMessageView[] (newest-first)
 * Live delivery arrives over the room WS as { type:'private_message', message },
 * targeted to sender + recipient only (never room-broadcast).
 */
import { api } from './api';
import type { PrivateMessageView } from './types';

export interface PrivatePeer {
	display_name?: string;
	user_id?: string;
}

/**
 * Exported as an object (not a reassigned `let`) so the `$state` proxy survives
 * across module boundaries.
 */
export const privateChat = $state<{
	peer: PrivatePeer | null;
	messages: PrivateMessageView[];
	loading: boolean;
}>({ peer: null, messages: [], loading: false });

// Room + self context, set once by the room page so deep callers (UserInfoModal)
// don't have to thread them through. Plain module vars — not reactive state.
let roomId = '';
let selfId = '';

/** Wire the room id + current user id (called once from the room page). */
export function setPmContext(rid: string, sid: string): void {
	roomId = rid;
	selfId = sid;
}

/** Whether a message was sent by us (drives bubble alignment). */
export function isMine(m: PrivateMessageView): boolean {
	return m.sender_id === selfId;
}

/** Open the panel with a peer and load that thread's history. */
export async function openPrivateChat(peer: PrivatePeer): Promise<void> {
	// Guard against opening a thread with yourself (reference "Chatting with
	// yourself again?").
	if (peer.user_id && peer.user_id === selfId) return;
	privateChat.peer = peer;
	privateChat.messages = [];
	if (!peer.user_id || !roomId) return;
	privateChat.loading = true;
	try {
		const thread = await api.get<PrivateMessageView[]>(`/api/rooms/${roomId}/pm/${peer.user_id}`);
		// Backend returns newest-first; render oldest-first (newest at the bottom).
		privateChat.messages = thread.slice().reverse();
	} catch {
		// Leave the thread empty on failure; the composer still works.
	} finally {
		privateChat.loading = false;
	}
}

/** Close the panel. */
export function closePrivateChat(): void {
	privateChat.peer = null;
	privateChat.messages = [];
}

/**
 * Send a PM to the open peer. The POST returns the persisted row; the WS echo is
 * de-duped by id in `receivePrivate`, so the bubble never doubles.
 */
export async function sendPrivate(body: string): Promise<void> {
	const peer = privateChat.peer;
	const text = body.trim();
	if (!peer?.user_id || !roomId || !text) return;
	const msg = await api.post<PrivateMessageView>(`/api/rooms/${roomId}/pm`, {
		recipient_id: peer.user_id,
		body: text
	});
	receivePrivate(msg);
}

/**
 * File an incoming/echoed PM (from the WS or the POST response) into the open
 * thread. De-dupes by uuid. If no thread is open and the message is INCOMING,
 * pop the panel for its sender so the recipient sees it (reference startPrivChat).
 */
export function receivePrivate(m: PrivateMessageView): void {
	const incoming = m.sender_id !== selfId;
	const peer = privateChat.peer;

	if (!peer?.user_id) {
		if (incoming) {
			privateChat.peer = { user_id: m.sender_id, display_name: m.sender_name };
			privateChat.messages = [m];
		}
		return;
	}

	// Only file messages that belong to the currently-open pair.
	const other = m.sender_id === selfId ? m.recipient_id : m.sender_id;
	if (other !== peer.user_id) return;
	if (privateChat.messages.some((x) => x.id === m.id)) return;
	privateChat.messages = [...privateChat.messages, m];
}
