<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';

	export interface ScheduledAlert {
		id: string;
		text: string;
		sendAt: string;
		/** Display name of the trader who scheduled it (reference "Sender" column). */
		sender?: string;
		/** Recurrence label, e.g. "Never", "Daily" (reference "Repeat" column). */
		repeat?: string;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Currently scheduled alerts, newest first. Defaults to the empty state. */
		scheduled?: ScheduledAlert[];
		/** Called when an alert's delete action is clicked. */
		onDelete?: (id: string) => void;
	}
	let { open, onClose, scheduled = [], onDelete }: Props = $props();

	// "2026-06-14T09:30" -> a readable local label, falling back to the raw value
	// if the browser can't parse it (e.g. an empty or malformed sendAt).
	function formatSendAt(value: string): string {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return value;
		return d.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

{#snippet footer()}
	<!-- Reference footer is a single primary Close button. -->
	<button class="btn primary" type="button" onclick={onClose}>Close</button>
{/snippet}

<!-- Reference is a modal-xl, manage-only striped table (no in-modal composer);
     scheduling is created elsewhere. files/file2.html #scheduledAlertsModal. -->
<Modal {open} {onClose} title="Manage Scheduled Alerts" size="xl" {footer}>
	<table class="sched">
		<thead>
			<tr>
				<th scope="col">Date / Time</th>
				<th scope="col">Sender</th>
				<th scope="col">Alert</th>
				<th scope="col">Repeat</th>
				<th scope="col" class="actions-col">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each scheduled as alert (alert.id)}
				<tr>
					<td class="nowrap">{formatSendAt(alert.sendAt)}</td>
					<td>{alert.sender ?? '—'}</td>
					<td class="alert-text">{alert.text}</td>
					<td>{alert.repeat ?? 'Never'}</td>
					<td class="actions-col">
						<button
							class="del"
							type="button"
							onclick={() => onDelete?.(alert.id)}
							aria-label="Delete scheduled alert"
							title="Delete"
						>
							<Icon name="trash-alt" size={14} />
						</button>
					</td>
				</tr>
			{:else}
				<tr>
					<td class="empty" colspan="5">No scheduled alerts.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Modal>

<style>
	/* Reference: <table class="table table-striped text-white w-100"> on the dark
	   Darkly modal. */
	.sched {
		width: 100%;
		border-collapse: collapse;
		color: var(--text);
		font-size: 0.85rem;
	}
	thead th {
		text-align: left;
		font-weight: 700;
		padding: 0.5rem 0.65rem;
		border-bottom: 2px solid var(--border);
		white-space: nowrap;
	}
	tbody td {
		padding: 0.5rem 0.65rem;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}
	/* Bootstrap .table-striped: subtle overlay on odd rows. */
	tbody tr:nth-child(odd) td {
		background: rgba(255, 255, 255, 0.05);
	}
	.nowrap {
		white-space: nowrap;
	}
	.alert-text {
		overflow-wrap: anywhere;
	}
	.actions-col {
		text-align: right;
		white-space: nowrap;
		width: 1%;
	}
	.del {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.25rem;
		line-height: 0;
		cursor: pointer;
	}
	.del:hover {
		color: var(--modal-danger, #e74c3c);
		border-color: var(--modal-danger, #e74c3c);
	}
	.empty {
		text-align: center;
		color: var(--text-dim);
		padding: 1.5rem;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid var(--border);
		cursor: pointer;
	}
	.btn.primary {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.btn.primary:hover {
		opacity: 0.9;
	}
</style>
