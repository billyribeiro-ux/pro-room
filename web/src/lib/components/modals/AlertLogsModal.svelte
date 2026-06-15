<script lang="ts">
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	// No backend yet — the list is empty and "Reload" is inert until wired.
	const logs: { id: string; date: string; by: string }[] = [];
	function reload() {
		/* fetch the log list — inert until the backend is wired */
	}
</script>

{#snippet footer()}
	<!-- Reference footer: a single secondary Close. -->
	<button class="btn secondary" type="button" onclick={onClose}>Close</button>
{/snippet}

<!-- Reference h5 is the plural "Alerts Logs". -->
<Modal {open} {onClose} title="Alerts Logs" {footer}>
	<!-- Reference: an enabled btn-primary "Reload Log List" (no icon) at the body top. -->
	<button class="btn primary reload" type="button" onclick={reload}>Reload Log List</button>

	<!-- Reference: a Bootstrap list-group of clickable action items (date + By stacked).
	     Empty in capture, so an empty list renders nothing (no placeholder). -->
	<div class="list-group">
		{#each logs as log (log.id)}
			<button type="button" class="list-group-item">
				<div class="lg-date">{log.date}</div>
				<div class="lg-by">By:&nbsp;{log.by}</div>
			</button>
		{/each}
	</div>
</Modal>

<style>
	.reload {
		margin: 0.5rem 0;
	}
	.list-group {
		display: flex;
		flex-direction: column;
	}
	.list-group-item {
		display: block;
		width: 100%;
		text-align: left;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		padding: 0.6rem 0.85rem;
		cursor: pointer;
	}
	.list-group-item + .list-group-item {
		border-top: none;
	}
	.list-group-item:hover {
		background: var(--bg-elev-2);
	}
	.lg-date,
	.lg-by {
		font-weight: 700;
		font-size: 0.85rem;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.45rem 0.9rem;
		font-weight: 700;
		font-size: 0.85rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.primary {
		background: var(--modal-btn-primary, #375a7f);
		border-color: var(--modal-btn-primary, #375a7f);
		color: #fff;
	}
	.btn.primary:hover {
		opacity: 0.9;
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
