<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		log?: string;
	}
	let { open, onClose, log }: Props = $props();

	const placeholder = 'No debug log captured for this session yet.';
	const text = $derived(log?.trim() ? log : placeholder);
	const hasLog = $derived(Boolean(log?.trim()));

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	// Clear the "Copied" confirmation timer if the component is torn down mid-flash.
	$effect(() => () => clearTimeout(copyTimer));

	async function copyLog() {
		if (!hasLog || !navigator.clipboard?.writeText) return;
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard may be blocked (permissions/insecure context); leave state unchanged.
		}
	}
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={copyLog} disabled={!hasLog}>
		{#if copied}
			<Icon name="check" size={14} /> Copied
		{:else}
			<Icon name="copy" size={14} /> Copy
		{/if}
	</button>
	<button class="btn primary" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Debug Log" {footer}>
	<div class="debug-log-body">
		<label class="sr-only" for="debug-log-text">Debug log</label>
		<textarea
			id="debug-log-text"
			class="log"
			readonly
			spellcheck="false"
			wrap="off"
			aria-label="Debug log"
			value={text}></textarea>
	</div>
</Modal>

<style>
	/* Widen the shared Modal shell to "large" only when it hosts this content. */
	:global(.panel:has(.debug-log-body)) {
		max-width: 820px;
	}

	.debug-log-body {
		display: flex;
		min-height: 0;
	}

	.log {
		width: 100%;
		min-height: 360px;
		max-height: 60vh;
		resize: vertical;
		box-sizing: border-box;
		padding: 0.75rem 0.85rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		font-family: ui-monospace, 'SFMono-Regular', 'Menlo', 'Consolas', monospace;
		font-size: 0.8rem;
		line-height: 1.55;
		tab-size: 2;
		white-space: pre;
		overflow: auto;
	}
	.log:focus-visible {
		outline: none;
		border-color: var(--accent);
	}

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
	.btn.ghost:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--accent);
	}
	.btn.ghost:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
