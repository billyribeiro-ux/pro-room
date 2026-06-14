<script lang="ts">
	import { MusicNotesIcon, PlayIcon, StopIcon, WarningCircleIcon } from 'phosphor-svelte';
	import Modal from '../Modal.svelte';

	type MediaKind = 'soundcloud' | 'youtube';

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

	// Detect the provider from the URL. Returns null when it matches neither —
	// the regexes are deliberately loose (host match) so we don't reject valid
	// but uncommon path shapes; the embed builder does the strict parsing.
	function detectKind(raw: string): MediaKind | null {
		const trimmed = raw.trim();
		if (/(^|\.)soundcloud\.com\//i.test(trimmed) || /(^|\.)snd\.sc\//i.test(trimmed)) {
			return 'soundcloud';
		}
		if (/(^|\.)youtube\.com\//i.test(trimmed) || /(^|\.)youtu\.be\//i.test(trimmed)) {
			return 'youtube';
		}
		return null;
	}

	// Reactive detection drives the inline provider hint without firing on submit.
	const detected = $derived(url.trim() ? detectKind(url) : null);

	function play() {
		const trimmed = url.trim();
		if (!trimmed) {
			error = 'Paste a SoundCloud or YouTube URL.';
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
			error = 'Only SoundCloud and YouTube links are supported.';
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
		<StopIcon size={14} /> Stop for everyone
	</button>
	<button class="btn primary" type="button" onclick={play}>
		<PlayIcon size={14} /> Play for everyone
	</button>
{/snippet}

<Modal {open} {onClose} title="Play music for all" {footer}>
	<div class="intro">
		<MusicNotesIcon size={20} />
		<p>Paste a SoundCloud or YouTube link to play it for everyone in the room.</p>
	</div>

	<label class="field">
		<span class="field-label">Media URL</span>
		<input
			class="url-input"
			class:invalid={!!error}
			type="url"
			inputmode="url"
			placeholder="https://soundcloud.com/… or https://youtu.be/…"
			bind:value={url}
			oninput={onUrlInput}
			aria-invalid={!!error}
			aria-describedby={error ? 'media-error' : undefined}
		/>
	</label>

	{#if detected}
		<p class="detected">
			Detected: <strong>{detected === 'soundcloud' ? 'SoundCloud' : 'YouTube'}</strong>
		</p>
	{/if}

	{#if error}
		<p class="error" id="media-error" role="alert">
			<WarningCircleIcon size={14} />
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
	.intro :global(svg) {
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
	.error :global(svg) {
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
