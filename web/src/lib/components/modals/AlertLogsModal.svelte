<script lang="ts">
	import Modal from '../Modal.svelte';
	import { api, ApiError } from '$lib/api';
	import { formatStamp } from '$lib/message';
	import type { Alert } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
		roomId: string;
	}
	let { open, onClose, roomId }: Props = $props();

	let logs = $state<Alert[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function reload() {
		loading = true;
		error = null;
		try {
			logs = await api.get<Alert[]>(`/api/rooms/${roomId}/alerts`);
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'Failed to load alert log';
		} finally {
			loading = false;
		}
	}

	// Load when the modal opens.
	$effect(() => {
		if (open) void reload();
	});
</script>

{#snippet footer()}
	<!-- Reference footer: a single secondary Close. -->
	<button class="btn secondary" type="button" onclick={onClose}>Close</button>
{/snippet}

<!-- Reference h5 is the plural "Alerts Logs". -->
<Modal {open} {onClose} title="Alerts Logs" maxWidth={1000} {footer}>
	<button class="btn primary reload" type="button" onclick={reload} disabled={loading}>
		{loading ? 'Loading…' : 'Reload Log List'}
	</button>

	{#if error}
		<p class="err" role="alert">{error}</p>
	{:else if !loading && logs.length === 0}
		<div class="empty">No alerts logged yet.</div>
	{:else}
		<div class="list-group">
			{#each logs as log (log.id)}
				<div class="list-group-item">
					<div class="lg-head">
						<strong class="fw-bold lg-date">{formatStamp(log.created_at)}</strong>
						<div class="lg-by">
							<strong class="fw-bold">By:</strong>
							<!-- HONEST GAP: reference shows the author's email in the italic slot;
							     the component only receives author_name, so we render that. -->
							<em>{log.author_name ?? 'Trader'}</em>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Modal>

<style>
	.reload {
		margin: 0.5rem 0 0.75rem;
	}
	.err {
		margin: 0.25rem 0;
		color: var(--negative);
		font-size: 0.82rem;
	}
	.empty {
		text-align: center;
		padding: 1.25rem 0.5rem;
		color: var(--text-dim);
		font-size: 0.9rem;
	}
	.list-group {
		display: flex;
		flex-direction: column;
		max-height: 50vh;
		overflow-y: auto;
	}
	/* Reference log entries are WHITE cards with dark centered text and light
	   #dee2e6 borders (not dark left-aligned rows). */
	.list-group-item {
		display: block;
		width: 100%;
		text-align: center;
		background: #ffffff;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		color: #212529;
		padding: 0.5rem 1rem;
		margin-bottom: 0.4rem;
	}

	/* Reference: each entry is a centered stack — bold date on line 1,
	   bold "By:" + italic author on line 2. */
	.lg-head {
		display: block;
	}
	.lg-date {
		font-weight: 700;
		white-space: nowrap;
	}
	.lg-by {
		margin-top: 0.15rem;
	}
	.lg-by em {
		font-style: italic;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.45rem 0.9rem;
		font-weight: 400;
		font-size: 1rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.primary {
		background: var(--modal-btn-primary, var(--accent));
		border-color: var(--modal-btn-primary, var(--accent));
		color: #fff;
	}
	.btn.primary:hover {
		opacity: 0.9;
	}
	.btn.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
