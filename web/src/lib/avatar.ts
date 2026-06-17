/**
 * Gravatar URL for an email — the reference derives the avatar from the email
 * (its `emailHash`). We hash with SHA-256 (which Gravatar accepts alongside the
 * legacy md5), computed via the built-in Web Crypto API so there's no md5 dep.
 * `d=mp` falls back to a generic "mystery-person" silhouette when the email has
 * no Gravatar. Async because `crypto.subtle.digest` is async.
 */
export async function gravatarUrl(email: string, size = 80): Promise<string> {
	const normalized = email.trim().toLowerCase();
	// crypto.subtle is gated to secure contexts — undefined on a plain-HTTP origin,
	// where calling .digest() throws and the unhandled rejection logs to the console
	// (Edit-my-Info avatar). Fall back to the generic mystery-person glyph instead.
	const subtle = globalThis.crypto?.subtle;
	if (!subtle) return `https://www.gravatar.com/avatar/?d=mp&s=${size}`;
	const data = new TextEncoder().encode(normalized);
	const buf = await subtle.digest('SHA-256', data);
	const hash = Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
}
