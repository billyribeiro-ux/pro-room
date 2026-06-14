/**
 * Presenter "media-for-all" API helper — broadcasts a SoundCloud/YouTube URL to
 * the whole room (or stops it). The broadcast arrives for every member over the
 * room WebSocket as `{ type: 'media', kind, url? }`.
 */
import { api } from './api';
import type { MediaKind } from './types';

export interface MediaBroadcast {
	kind: MediaKind;
	url?: string;
}

/** `POST /api/rooms/{roomId}/media-for-all` — presenter/admin only. */
export function broadcastMedia(
	roomId: string,
	kind: MediaKind,
	url?: string
): Promise<MediaBroadcast> {
	return api.post<MediaBroadcast>(
		`/api/rooms/${roomId}/media-for-all`,
		url ? { kind, url } : { kind }
	);
}
