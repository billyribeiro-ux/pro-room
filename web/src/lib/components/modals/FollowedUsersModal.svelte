<script lang="ts">
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();
</script>

{#snippet footer()}
	<!-- Reference Close is Darkly btn-light (deliberately distinct from Muted's btn-primary). -->
	<button class="btn light" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Followed Chat Users" {footer}>
	<!-- Reference body is a single centered text node, no icon. -->
	<div class="empty">You don't have any followed users.</div>
</Modal>

<style>
	.empty {
		text-align: center;
		padding: 1.25rem 0.5rem;
		color: var(--text-dim);
		font-size: 0.9rem;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 700;
		font-size: 0.85rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	/* Darkly btn-light. */
	.btn.light {
		background: #f8f9fa;
		border-color: #f8f9fa;
		color: #212529;
	}
	.btn.light:hover {
		opacity: 0.9;
	}
</style>
