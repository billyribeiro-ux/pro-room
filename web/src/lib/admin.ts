/**
 * Admin moderation commands. Each is RBAC-gated server-side and broadcasts a
 * room WebSocket event (`kicked` / `mute_all` / `chat_cleared` / `room_locked` /
 * `message_deleted` / `alert_deleted`) so every client reacts live.
 */
import { api } from './api';

export function kickUser(roomId: string, userId: string, message?: string): Promise<unknown> {
	return api.post(
		`/api/rooms/${roomId}/admin/kick`,
		message ? { user_id: userId, message } : { user_id: userId }
	);
}

export function muteAll(roomId: string, muted: boolean): Promise<unknown> {
	return api.post(`/api/rooms/${roomId}/admin/mute-all`, { muted });
}

export function clearChat(roomId: string): Promise<unknown> {
	return api.post(`/api/rooms/${roomId}/admin/clear-chat`);
}

export function lockRoom(roomId: string, locked: boolean): Promise<unknown> {
	return api.post(`/api/rooms/${roomId}/admin/lock`, { locked });
}

/** Hold non-admin viewers on the current screen share (broadcasts `screen_locked`). */
export function lockScreen(roomId: string, locked: boolean): Promise<unknown> {
	return api.post(`/api/rooms/${roomId}/admin/lock-screen`, { locked });
}

/** Drop duplicate/ghost sessions, keeping each user's newest connection. */
export function kickDuplicates(roomId: string): Promise<unknown> {
	return api.post(`/api/rooms/${roomId}/admin/kick-duplicates`);
}

export function deleteMessage(roomId: string, messageId: string): Promise<unknown> {
	return api.delete(`/api/rooms/${roomId}/messages/${messageId}`);
}

export function deleteAlert(roomId: string, alertId: string): Promise<unknown> {
	return api.delete(`/api/rooms/${roomId}/alerts/${alertId}`);
}
