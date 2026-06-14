<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	let onlyThesePeople = $state(false);
</script>

<Modal {open} {onClose} title="Filter out alerts">
	<label class="check">
		<input type="checkbox" bind:checked={onlyThesePeople} />
		Only show alerts from these people
	</label>

	<div class="list" class:dim={!onlyThesePeople}>
		<div class="empty">
			<Icon name="filter" size={22} />
			<p>No people selected yet.</p>
		</div>
	</div>

	{#snippet footer()}
		<button type="button" class="primary" onclick={onClose}>Done</button>
	{/snippet}
</Modal>

<style>
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.88rem;
		font-weight: 600;
	}
	.list {
		margin-top: 0.9rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-height: 110px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.list.dim {
		opacity: 0.55;
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-dim);
		text-align: center;
	}
	.empty p {
		margin: 0;
		font-size: 0.85rem;
	}
	.primary {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		padding: 0.4rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.primary:hover {
		background: var(--accent-hover);
	}
</style>
