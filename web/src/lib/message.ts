/**
 * Pure, DOM-free helpers for rendering canonical `app-st-message` rows.
 *
 * No `{@html}` ever touches message bodies (project hard rule): callers
 * segment-parse the text with `parseMessage` and render each node safely.
 * Everything here is deliberately framework-free so it can be unit-tested
 * in isolation.
 */

/** The discriminant tags a parsed segment can carry. */
export type SegmentKind = 'text' | 'ticker' | 'mention' | 'link' | 'image';

/**
 * One parsed piece of a message body.
 *
 * - `text`    — a plain run that carries no styling.
 * - `ticker`  — a `$CASHTAG` (e.g. `$SPX`); `value` keeps the leading `$`.
 * - `mention` — an `@username` (e.g. `@jane_doe`); `value` keeps the leading
 *               `@`, and `handle` is the bare username without it.
 * - `link`    — a bare http/https URL; `href` is the navigable target and
 *               `value` is the visible label (identical to `href` here).
 *
 * The concatenation of every segment's `value` equals the original input, so
 * callers can render each node safely without ever reaching for `{@html}`.
 */
export type Segment =
	| { kind: 'text'; value: string }
	| { kind: 'ticker'; value: string }
	| { kind: 'mention'; value: string; handle: string }
	| { kind: 'link'; href: string; value: string }
	// `image` — a URL that points at an image (renders inline as a thumbnail
	// instead of a link). `gif` flags an animated GIF (muted-by-default when the
	// "Animated GIFs in chat" DND flag is set). `value` stays the original text so
	// the concatenation invariant holds.
	| { kind: 'image'; href: string; value: string; gif: boolean };

// A URL is treated as an image when its path ends in an image extension (the
// reference's CDN images + GIPHY .gif URLs) OR it is one of our own inline-upload
// download URLs (`/api/rooms/{id}/files/{uuid}/download`, which the server only
// serves for image uploads via the chat composer). Optional query string allowed.
const IMG_EXT_RE = /\.(?:png|jpe?g|gif|webp|avif)(?:\?[^\s]*)?$/i;
const UPLOAD_DOWNLOAD_RE = /\/api\/rooms\/[^/\s]+\/files\/[^/\s]+\/download(?:\?[^\s]*)?$/i;
function isImageUrl(href: string): boolean {
	return IMG_EXT_RE.test(href) || UPLOAD_DOWNLOAD_RE.test(href);
}
function isGifUrl(href: string): boolean {
	return /\.gif(?:\?[^\s]*)?$/i.test(href);
}

// Bare http/https URLs. Trailing punctuation is trimmed back into a text
// segment so e.g. "see https://x.com." doesn't swallow the period into href.
const URL_RE = /https?:\/\/[^\s]+/g;
// Cashtags like $SPX, $AAOI — 1-6 uppercase letters, word-boundary terminated.
const TICKER_RE = /\$[A-Z]{1,6}\b/g;
// Mentions like @jane, @jane_doe, @trader-1 — a leading `@` (only when it
// starts a word, so emails like a@b.com don't match) followed by 1-30 chars
// from the username alphabet [A-Za-z0-9_-].
const MENTION_RE = /(^|[^\w@])@([A-Za-z0-9_-]{1,30})/g;
// Punctuation we never want hanging off the end of an auto-linked URL.
const TRAILING_PUNCT_RE = /[.,;:!?)\]}'"]+$/;

type Match = { start: number; end: number; seg: Segment };

/**
 * Split `body` into ordered text / ticker / mention / link segments. Original
 * spacing and ordering are preserved; the concatenation of every segment
 * `value` equals the input string. URLs win over tickers and mentions when
 * ranges would overlap (a `$` or `@` inside a URL stays part of the link).
 */
export function parseMessage(body: string): Segment[] {
	if (!body) return [];

	const matches: Match[] = [];

	for (const m of body.matchAll(URL_RE)) {
		const start = m.index ?? 0;
		let raw = m[0];
		// Trim trailing punctuation back out of the link.
		const trimmed = raw.replace(TRAILING_PUNCT_RE, '');
		raw = trimmed.length > 0 ? trimmed : raw;
		matches.push({
			start,
			end: start + raw.length,
			seg: isImageUrl(raw)
				? { kind: 'image', href: raw, value: raw, gif: isGifUrl(raw) }
				: { kind: 'link', href: raw, value: raw }
		});
	}

	for (const m of body.matchAll(TICKER_RE)) {
		const start = m.index ?? 0;
		const end = start + m[0].length;
		// Skip a ticker that falls inside an already-claimed URL range.
		const overlaps = matches.some((x) => start < x.end && end > x.start);
		if (overlaps) continue;
		matches.push({ start, end, seg: { kind: 'ticker', value: m[0] } });
	}

	for (const m of body.matchAll(MENTION_RE)) {
		const handle = m[2];
		// m[1] is the leading boundary char (or empty at string start); the
		// `@handle` token begins after it, so offset the index past the prefix.
		const start = (m.index ?? 0) + m[1].length;
		const value = `@${handle}`;
		const end = start + value.length;
		// Skip a mention that falls inside an already-claimed URL or ticker range.
		const overlaps = matches.some((x) => start < x.end && end > x.start);
		if (overlaps) continue;
		matches.push({ start, end, seg: { kind: 'mention', value, handle } });
	}

	matches.sort((a, b) => a.start - b.start);

	const out: Segment[] = [];
	let cursor = 0;
	for (const match of matches) {
		if (match.start < cursor) continue; // defensive: drop any residual overlap
		if (match.start > cursor) {
			out.push({ kind: 'text', value: body.slice(cursor, match.start) });
		}
		out.push(match.seg);
		cursor = match.end;
	}
	if (cursor < body.length) {
		out.push({ kind: 'text', value: body.slice(cursor) });
	}
	return out;
}

/**
 * Whole-message heuristic: does this body read as a question? Used by callers
 * to apply question styling to the entire row (parsing stays per-segment).
 *
 * Simple and intentionally cheap: true when the trimmed text ends in a `?`
 * (ignoring trailing closing punctuation/quotes like `?)` or `?"`).
 */
export function isQuestion(text: string): boolean {
	if (!text) return false;
	// Strip trailing whitespace and closing wrappers, then test the last char.
	const trimmed = text.replace(/[\s)\]}'"»”]+$/, '');
	return trimmed.endsWith('?');
}

/**
 * Format an ISO timestamp as `M/D/YY, h:MM AM` in local time
 * (e.g. `6/8/26, 8:00 AM`) — no leading zero on month/day/hour, two-digit
 * minutes, two-digit year. Returns the raw input if it can't be parsed.
 */
export function formatStamp(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;

	const month = d.getMonth() + 1;
	const day = d.getDate();
	const year = d.getFullYear() % 100;
	const yy = String(year).padStart(2, '0');

	let hour = d.getHours();
	const ampm = hour >= 12 ? 'PM' : 'AM';
	hour = hour % 12;
	if (hour === 0) hour = 12;
	const minute = String(d.getMinutes()).padStart(2, '0');

	return `${month}/${day}/${yy}, ${hour}:${minute} ${ampm}`;
}

/**
 * Local calendar-day key (`YYYY-M-D`) for an ISO timestamp, used to detect
 * day boundaries between consecutive rows. Returns the raw input when it
 * can't be parsed so distinct unparseable stamps don't collapse together.
 */
export function dayKey(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Long, human day label for a separator pill (e.g. "Tuesday, June 9, 2026")
 * in local time. Returns the raw input if it can't be parsed.
 */
export function formatDayLabel(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString(undefined, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
