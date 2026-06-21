<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Recipient/target name shown in the title (private-reply target). */
		recipient?: string;
		/** Called with the trimmed reply text on send (Enter). */
		onSend?: (text: string) => void;
	}
	let { open, onClose, recipient, onSend }: Props = $props();

	let text = $state('');
	// Reference title is the recipient name + colon (the private-reply target).
	const title = $derived(recipient ? `${recipient}:` : 'Reply');

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

	// Reference has no Send button — Enter (no Shift) sends, Shift+Enter newlines.
	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<Modal {open} onClose={close} {title}>
	<!-- Reference body: textarea with the emoji/image buttons inline in a right
	     column beside it (odds-and-ends.html app-reply-modal). -->
	<div class="reply-row">
		<textarea
			bind:value={text}
			rows="1"
			spellcheck="true"
			placeholder="Type your message here.."
			aria-label="Reply text"
			onkeydown={onKeydown}></textarea>
		<div class="tools">
			<button type="button" class="tool" aria-label="Add emoji" title="Add Emojis">
				<Icon name="smile" family="regular" />
			</button>
			<button type="button" class="tool" aria-label="Upload an image" title="Upload an Image">
				<Icon name="image" />
			</button>
		</div>
	</div>

	{#snippet footer()}
		<!-- Reference footer is a single secondary Close (no Send; Enter sends). -->
		<button type="button" class="btn secondary" onclick={close}>Close</button>
	{/snippet}
</Modal>

<style>
	.reply-row {
		display: flex;
		align-items: stretch;
		gap: 0.5rem;
	}
	textarea {
		flex: 1;
		min-width: 0;
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
		flex-direction: column;
		gap: 0.4rem;
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
		cursor: pointer;
	}
	.tool:hover {
		color: var(--accent);
		border-color: var(--accent);
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid transparent;
		cursor: pointer;
	}
	/* Darkly btn-secondary. */
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		border-color: var(--modal-btn-secondary, #444);
		color: #fff;
	}
	.btn.secondary:hover {
		opacity: 0.9;
	}
</style>
