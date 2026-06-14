<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	// No backend yet — the list is always empty. The header action is inert.
	const logs: { id: string; date: string; by: string }[] = [];
</script>

<Modal {open} {onClose} title="Alert Logs">
	<div class="toolbar">
		<button class="reload" type="button" disabled>
			<Icon name="sync" size={14} /> Reload Log List
		</button>
	</div>

	{#if logs.length === 0}
		<div class="empty">
			<Icon name="bell" size={28} />
			<p>No logs yet.</p>
		</div>
	{:else}
		<ul class="list">
			{#each logs as log (log.id)}
				<li class="entry">
					<span class="date">{log.date}</span>
					<span class="by">by {log.by}</span>
				</li>
			{/each}
		</ul>
	{/if}
</Modal>

<style>
	.toolbar {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.75rem;
	}
	.reload {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text-dim);
		padding: 0.4rem 0.7rem;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.reload:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
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
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.entry {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.5rem 0.7rem;
		font-size: 0.85rem;
	}
	.date {
		font-weight: 600;
	}
	.by {
		color: var(--text-dim);
	}
</style>
