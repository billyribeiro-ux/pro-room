/**
 * Minimal GIPHY client for the chat GIF picker. The reference room's GIF button is
 * GIPHY-backed (the `.giphy-search` panel + results grid); this mirrors it.
 *
 * Keyless by default: `giphyEnabled()` is false until `PUBLIC_GIPHY_KEY` is set, so
 * the composer keeps the GIF button disabled rather than half-wiring against a
 * missing provider. Errors are thrown (never swallowed — CLAUDE.md) so the picker
 * can surface them.
 */
import { GIPHY_KEY } from './config';

/** A single GIF, normalized to just the fields the picker needs. */
export interface Gif {
	id: string;
	/** Full-size animated GIF URL — what gets posted into chat. */
	url: string;
	/** Small preview URL for the results grid. */
	preview: string;
	title: string;
	/** Preview intrinsic size (px) so the grid can reserve space (no CLS). */
	width: number;
	height: number;
}

/** Whether a GIPHY key is configured. The composer gates the GIF button on this. */
export function giphyEnabled(): boolean {
	return GIPHY_KEY.length > 0;
}

/** One image rendition from the GIPHY response (only the fields we read). */
interface GiphyImage {
	url?: string;
	width?: string;
	height?: string;
}
interface GiphyImages {
	original?: GiphyImage;
	downsized_medium?: GiphyImage;
	fixed_width?: GiphyImage;
	fixed_width_small?: GiphyImage;
}
interface GiphyItem {
	id: string;
	title: string;
	images: GiphyImages;
}

/**
 * Search GIPHY (or trending when the query is empty). Returns `[]` when no key is
 * configured. Uses the `messaging_non_clips` bundle + a `pg-13` rating ceiling,
 * matching a chat use-case. Throws on network/HTTP failure.
 */
export async function searchGifs(query: string, limit = 24): Promise<Gif[]> {
	if (!GIPHY_KEY) return [];
	const q = query.trim();
	const base = q
		? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q)}`
		: `https://api.giphy.com/v1/gifs/trending?`;
	const url =
		`${base}&api_key=${encodeURIComponent(GIPHY_KEY)}` +
		`&limit=${limit}&rating=pg-13&bundle=messaging_non_clips`;

	const res = await fetch(url);
	if (!res.ok) throw new Error(`GIPHY request failed (${res.status})`);
	const json = (await res.json()) as { data?: GiphyItem[] };

	return (json.data ?? [])
		.map((g): Gif => {
			const full = g.images.downsized_medium ?? g.images.original;
			const prev = g.images.fixed_width_small ?? g.images.fixed_width ?? full;
			return {
				id: g.id,
				url: full?.url ?? '',
				preview: prev?.url ?? full?.url ?? '',
				title: g.title || 'GIF',
				width: Number(prev?.width ?? 0),
				height: Number(prev?.height ?? 0)
			};
		})
		.filter((g) => g.url.length > 0);
}
