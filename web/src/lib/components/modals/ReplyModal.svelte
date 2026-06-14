<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Called with the trimmed reply text on Send. */
		onSend?: (text: string) => void;
	}
	let { open, onClose, onSend }: Props = $props();

	let text = $state('');
	let canSend = $derived(text.trim().length > 0);

	function send() {
		const trimmed = text.trim();
		if (!trimmed) return;
		onSend?.(trimmed);
		text = '';
		onClose();
	}

	function close() {
		text = '';
		onClose();
	}
</script>

<Modal {open} onClose={close} title="Reply">
	<label class="field">
		<span class="sr-only">Reply text</span>
		<textarea bind:value={text} rows="3" placeholder="Write a reply…"></textarea>
	</label>

	{#snippet footer()}
		<div class="tools">
			<button type="button" class="tool" aria-label="Insert emoji">
				<Icon name="smile" />
			</button>
			<button type="button" class="tool" aria-label="Attach image">
				<Icon name="image" />
			</button>
		</div>
		<button type="button" class="primary" onclick={send} disabled={!canSend}>
			<Icon name="paper-plane" size={14} /> Send
		</button>
	{/snippet}
</Modal>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.field {
		display: block;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
		resize: vertical;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.5rem 0.6rem;
		font: inherit;
		font-size: 0.88rem;
	}
	textarea:focus {
		outline: none;
		border-color: var(--accent);
	}
	.tools {
		display: flex;
		gap: 0.4rem;
		margin-right: auto;
	}
	.tool {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.4rem;
		line-height: 0;
	}
	.tool:hover {
		color: var(--accent);
		border-color: var(--accent);
	}
	.primary {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
