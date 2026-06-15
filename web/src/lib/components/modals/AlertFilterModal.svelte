<script lang="ts">
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	let onlyThesePeople = $state(false);
</script>

<!-- Reference h5: "Filter out alerts from the following:" (file3.html app-alert-filter-modal). -->
<Modal {open} {onClose} title="Filter out alerts from the following:">
	<label class="check">
		<input type="checkbox" bind:checked={onlyThesePeople} />
		Only show alerts from these people:
	</label>

	<!-- Reference shows a plain "List is empty." when no people are selected. -->
	<p class="empty">List is empty.</p>

	{#snippet footer()}
		<!-- Reference footer is a single secondary Close (not a primary "Done"). -->
		<button type="button" class="btn secondary" onclick={onClose}>Close</button>
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
	/* Reference --checkbox-bg-color is teal #00bc8c. */
	.check input[type='checkbox'] {
		accent-color: #00bc8c;
	}
	.empty {
		margin: 0.9rem 0 0;
		color: var(--text-dim);
		font-size: 0.85rem;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
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
