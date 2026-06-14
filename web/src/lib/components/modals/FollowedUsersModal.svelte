<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Followed Users" {footer}>
	<div class="empty">
		<Icon name="users" size={28} />
		<p>You don't have any followed users.</p>
	</div>
</Modal>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 0.5rem;
		color: var(--text-dim);
	}
	.empty :global(svg),
	.empty :global(i) {
		color: var(--text-dim);
		opacity: 0.7;
	}
	.empty p {
		margin: 0;
		font-size: 0.9rem;
	}
	.btn {
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
</style>
