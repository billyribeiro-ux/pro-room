<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	type MediaKind = 'soundcloud' | 'youtube' | 'mp3' | 'video';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Presenter starts playback for everyone with a validated URL. */
		onPlay?: (kind: MediaKind, url: string) => void;
		/** Presenter stops playback for everyone. */
		onStop?: () => void;
	}

	let { open, onClose, onPlay, onStop }: Props = $props();

	let url = $state('');
	let error = $state('');

	// File extensions that map to a direct <audio>/<video> element. The host is
	// irrelevant for these — any http(s) link ending in one of these is a direct
	// file we can play natively.
	const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|wav|flac)$/i;
	const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;

	// Pull the extension off the URL's path only — query/hash must be ignored so
	// `…/song.mp3?token=abc#t=5` still resolves to mp3. Falls back to a plain
	// suffix check when the string isn't a parseable URL.
	function pathExtKind(raw: string): MediaKind | null {
		let path: string;
		try {
			path = new URL(raw).pathname;
		} catch {
			// Not a full URL — strip any query/hash by hand before matching.
			path = raw.split(/[?#]/)[0];
		}
		if (AUDIO_EXT.test(path)) return 'mp3';
		if (VIDEO_EXT.test(path)) return 'video';
		return null;
	}

	// Detect the provider/source from the URL. Returns null when nothing matches.
	// SoundCloud/YouTube host detection takes precedence; only then do we fall
	// back to direct-file extension sniffing. We match on the PARSED host (exact
	// or a true subdomain) — a prior regex anchored on `(^|\.)` silently rejected
	// the most common bare-host share links (`https://youtu.be/…`,
	// `https://soundcloud.com/…`), since the char before the host is `/`, not a
	// dot. Parsing the host also makes `*.evil-soundcloud.com` spoofs impossible.
	function detectKind(raw: string): MediaKind | null {
		const trimmed = raw.trim();
		let host: string | null;
		try {
			host = new URL(trimmed).hostname.toLowerCase().replace(/^www\./, '');
		} catch {
			host = null;
		}
		if (host === 'soundcloud.com' || host?.endsWith('.soundcloud.com') || host === 'snd.sc') {
			return 'soundcloud';
		}
		if (host === 'youtube.com' || host?.endsWith('.youtube.com') || host === 'youtu.be') {
			return 'youtube';
		}
		return pathExtKind(trimmed);
	}

	// Human-readable label for the inline "Detected:" hint.
	function kindLabel(kind: MediaKind): string {
		switch (kind) {
			case 'soundcloud':
				return 'SoundCloud';
			case 'youtube':
				return 'YouTube';
			case 'mp3':
				return 'MP3 (audio)';
			case 'video':
				return 'Video';
		}
	}

	// Reactive detection drives the inline provider hint without firing on submit.
	const detected = $derived(url.trim() ? detectKind(url) : null);

	function play() {
		const trimmed = url.trim();
		if (!trimmed) {
			error = 'Paste a SoundCloud, YouTube, MP3, or video link.';
			return;
		}
		let parsed: URL;
		try {
			parsed = new URL(trimmed);
		} catch {
			error = 'That does not look like a valid URL.';
			return;
		}
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			error = 'URL must start with http:// or https://.';
			return;
		}
		const kind = detectKind(trimmed);
		if (!kind) {
			error = 'Paste a SoundCloud, YouTube, MP3, or video link.';
			return;
		}
		error = '';
		onPlay?.(kind, trimmed);
		url = '';
		onClose();
	}

	function stop() {
		onStop?.();
	}

	// Clear the stale error as soon as the presenter edits the field.
	function onUrlInput() {
		if (error) error = '';
	}
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={stop}>
		<Icon name="stop" size={14} /> Stop for everyone
	</button>
	<button class="btn primary" type="button" onclick={play}>
		<Icon name="play" size={14} /> Play for everyone
	</button>
{/snippet}

<Modal {open} {onClose} title="Play music for all" {footer}>
	<div class="intro">
		<Icon name="music" size={20} />
		<p>Paste a SoundCloud, YouTube, MP3, or video link to play it for everyone in the room.</p>
	</div>

	<label class="field">
		<span class="field-label">Media URL</span>
		<input
			class="url-input"
			class:invalid={!!error}
			type="url"
			inputmode="url"
			placeholder="https://youtu.be/… or https://example.com/clip.mp4"
			bind:value={url}
			oninput={onUrlInput}
			aria-invalid={!!error}
			aria-describedby={error ? 'media-error' : undefined}
		/>
	</label>

	{#if detected}
		<p class="detected">
			Detected: <strong>{kindLabel(detected)}</strong>
		</p>
	{/if}

	{#if error}
		<p class="error" id="media-error" role="alert">
			<Icon name="exclamation-circle" size={14} />
			{error}
		</p>
	{/if}
</Modal>

<style>
	.intro {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		color: var(--text-dim);
	}
	.intro :global(svg),
	.intro :global(i) {
		color: var(--accent);
		flex: 0 0 auto;
		margin-top: 0.15rem;
	}
	.intro p {
		margin: 0;
	}
	.field {
		display: block;
		margin-top: 1rem;
	}
	.field-label {
		display: block;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-dim);
		margin-bottom: 0.35rem;
	}
	.url-input {
		width: 100%;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.55rem 0.7rem;
		font-size: 0.9rem;
	}
	.url-input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.url-input.invalid {
		border-color: var(--negative);
	}
	.detected {
		margin: 0.6rem 0 0;
		font-size: 0.82rem;
		color: var(--text-dim);
	}
	.detected strong {
		color: var(--text);
	}
	.error {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin: 0.6rem 0 0;
		font-size: 0.82rem;
		color: var(--negative);
	}
	.error :global(svg),
	.error :global(i) {
		flex: 0 0 auto;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
	}
	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--accent);
	}
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
</style>
