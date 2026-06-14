<script lang="ts">
	import Modal from '../Modal.svelte';
	import { ClockIcon } from 'phosphor-svelte';

	interface ScheduledAlert {
		id: string;
		when: string;
		sender: string;
		alert: string;
		repeat: string;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Presentational: caller may pass rows; defaults to the empty state. */
		alerts?: ScheduledAlert[];
	}
	let { open, onClose, alerts = [] }: Props = $props();
</script>

<Modal {open} {onClose} title="Scheduled Alerts">
	{#if alerts.length === 0}
		<div class="empty">
			<ClockIcon size={22} />
			<p>No scheduled alerts.</p>
		</div>
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Date/Time</th>
						<th>Sender</th>
						<th>Alert</th>
						<th>Repeat</th>
						<th class="actions-col">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each alerts as a (a.id)}
						<tr>
							<td>{a.when}</td>
							<td>{a.sender}</td>
							<td>{a.alert}</td>
							<td>{a.repeat}</td>
							<td class="actions-col">
								<button type="button" class="link" aria-label="Edit scheduled alert">Edit</button>
								<button type="button" class="link danger" aria-label="Delete scheduled alert"
									>Delete</button
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#snippet footer()}
		<button type="button" class="primary" onclick={onClose}>Close</button>
	{/snippet}
</Modal>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-dim);
		padding: 1.5rem 0;
		text-align: center;
	}
	.empty p {
		margin: 0;
		font-size: 0.88rem;
	}
	.table-wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.45rem 0.55rem;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}
	th {
		color: var(--text-dim);
		font-weight: 600;
		font-size: 0.74rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	tbody tr:last-child td {
		border-bottom: none;
	}
	.actions-col {
		text-align: right;
	}
	.link {
		background: transparent;
		border: none;
		color: var(--accent);
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.1rem 0.3rem;
	}
	.link:hover {
		text-decoration: underline;
	}
	.link.danger {
		color: var(--negative);
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
