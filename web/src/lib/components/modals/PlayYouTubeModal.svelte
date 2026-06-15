<script lang="ts">
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		onPlay?: (url: string) => void;
		/** Optional: persist the pasted URL without playing (reference "Save"). */
		onSave?: (url: string) => void;
	}
	let { open, onClose, onPlay, onSave }: Props = $props();

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

	function validate(): string | null {
		const trimmed = url.trim();
		if (!isYouTubeUrl(trimmed)) {
			error = 'Enter a valid YouTube URL (youtube.com or youtu.be).';
			return null;
		}
		error = '';
		return trimmed;
	}

	function save() {
		const v = validate();
		if (v) onSave?.(v);
	}

	function playForAll() {
		const v = validate();
		if (!v) return;
		onPlay?.(v);
		close();
	}
</script>

{#snippet footer()}
	<!-- Reference footer is a single secondary Close (actions live in the input-group). -->
	<button class="btn secondary" type="button" onclick={close}>Close</button>
{/snippet}

<Modal {open} onClose={close} title="Play YouTube For All" {footer}>
	<!-- Reference body: a Bootstrap input-group — URL input with Save + Play For All
	     appended as input-group-text btn addons (files/file2.html, file8.html). -->
	<div class="input-group">
		<input
			class="input"
			class:invalid={error}
			type="url"
			inputmode="url"
			placeholder="Paste YouTube URL"
			bind:value={url}
			oninput={() => (error = '')}
			aria-label="YouTube URL"
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? 'yt-url-error' : undefined}
		/>
		<button type="button" class="addon" onclick={save}>Save</button>
		<button type="button" class="addon" onclick={playForAll}>Play For All</button>
	</div>

	{#if error}
		<p id="yt-url-error" class="error" role="alert">{error}</p>
	{/if}
</Modal>

<style>
	.input-group {
		display: flex;
		align-items: stretch;
	}
	.input {
		flex: 1;
		min-width: 0;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-right: none;
		border-radius: var(--radius) 0 0 var(--radius);
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
	/* Reference span.input-group-text.btn addons — #444 (--modal-input-group-bg). */
	.addon {
		display: inline-flex;
		align-items: center;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		padding: 0 0.85rem;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}
	.addon:last-child {
		border-radius: 0 var(--radius) var(--radius) 0;
	}
	.addon:hover {
		opacity: 0.9;
	}
	.error {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: var(--negative);
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 700;
		font-size: 0.85rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		border-color: var(--modal-btn-secondary, #444);
		color: #fff;
	}
	.btn.secondary:hover {
		opacity: 0.9;
	}
</style>
