/**
 * Pure, DOM-free helpers for rendering canonical `app-st-message` rows.
 *
 * No `{@html}` ever touches message bodies (project hard rule): callers
 * segment-parse the text with `parseMessage` and render each node safely.
 * Everything here is deliberately framework-free so it can be unit-tested
 * in isolation.
 */

/** One parsed piece of a message body. */
export type Segment =
	| { kind: 'text'; value: string }
	| { kind: 'ticker'; value: string }
	| { kind: 'link'; href: string; value: string };

// Bare http/https URLs. Trailing punctuation is trimmed back into a text
// segment so e.g. "see https://x.com." doesn't swallow the period into href.
const URL_RE = /https?:\/\/[^\s]+/g;
// Cashtags like $SPX, $AAOI — 1-6 uppercase letters, word-boundary terminated.
const TICKER_RE = /\$[A-Z]{1,6}\b/g;
// Punctuation we never want hanging off the end of an auto-linked URL.
const TRAILING_PUNCT_RE = /[.,;:!?)\]}'"]+$/;

type Match = { start: number; end: number; seg: Segment };

/**
 * Split `body` into ordered text / ticker / link segments. Original spacing
 * and ordering are preserved; the concatenation of every segment `value`
 * equals the input string. URLs win over tickers when ranges would overlap
 * (a `$` inside a URL stays part of the link).
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
			seg: { kind: 'link', href: raw, value: raw }
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
