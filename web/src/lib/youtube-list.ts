// Per-room saved YouTube videos, persisted to localStorage — mirrors the reference
// protradingroom app, where the presenter keeps a `ytVideoList` / `videoList` of
// recently-used videos in localStorage (keyed by room) so they can be replayed
// with one click. There is NO backend for the list (the actual "play for all" is
// the existing media-for-all broadcast); this is just a per-device convenience.

export interface SavedVideo {
	/** The YouTube URL exactly as pasted (start offset is stored separately). */
	url: string;
	/** Human-readable label for the list row (host + path). */
	label: string;
	/** Optional start offset in whole seconds (reference `ytVideoStartTime`). */
	start?: number;
}

const KEY = (roomId: string) => `ptr.youtube.list.${roomId}`;
const MAX = 20;

export function loadVideos(roomId: string): SavedVideo[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const v = JSON.parse(localStorage.getItem(KEY(roomId)) ?? '[]');
		return Array.isArray(v) ? v.filter((x) => x && typeof x.url === 'string') : [];
	} catch {
		return [];
	}
}

export function saveVideos(roomId: string, videos: SavedVideo[]): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(KEY(roomId), JSON.stringify(videos.slice(0, MAX)));
	} catch {
		// private mode / quota — the in-memory list still works for this session.
	}
}
