<script lang="ts">
	import { YoutubeLogoIcon } from 'phosphor-svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		onPlay?: (url: string) => void;
	}
	let { open, onClose, onPlay }: Props = $props();

	let url = $state('');
	let error = $state('');

	function isYouTubeUrl(value: string): boolean {
		return /youtube\.com|youtu\.be/i.test(value);
	}

	// Reset transient state whenever the modal is dismissed so a reopen starts clean.
	function close() {
		url = '';
		error = '';
		onClose();
	}

	function save() {
		const trimmed = url.trim();
		if (!isYouTubeUrl(trimmed)) {
			error = 'Enter a valid YouTube URL (youtube.com or youtu.be).';
			return;
		}
		error = '';
	}

	function playForAll() {
		const trimmed = url.trim();
		if (!isYouTubeUrl(trimmed)) {
			error = 'Enter a valid YouTube URL (youtube.com or youtu.be).';
			return;
		}
		error = '';
		onPlay?.(trimmed);
		close();
	}
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={save}>Save</button>
	<button class="btn primary" type="button" onclick={playForAll}>Play For All</button>
{/snippet}

<Modal {open} onClose={close} title="Play YouTube Video" {footer}>
	<div class="intro">
		<YoutubeLogoIcon size={20} weight="fill" />
		<p>Broadcast a YouTube video to everyone in the room.</p>
	</div>

	<label class="field">
		<span class="label">YouTube URL</span>
		<input
			class="input"
			class:invalid={error}
			type="url"
			inputmode="url"
			placeholder="Paste a YouTube URL"
			bind:value={url}
			oninput={() => (error = '')}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? 'yt-url-error' : undefined}
		/>
	</label>

	{#if error}
		<p id="yt-url-error" class="error" role="alert">{error}</p>
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
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-top: 1rem;
	}
	.label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	.input {
		width: 100%;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.55rem 0.75rem;
		font-size: 0.9rem;
	}
	.input::placeholder {
		color: var(--text-dim);
	}
	.input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.input.invalid {
		border-color: var(--negative);
	}
	.error {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: var(--negative);
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
