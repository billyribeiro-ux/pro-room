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

	function bodyText(a: Alert): string {
		const head = a.side ? `${a.symbol} ${a.side}` : a.symbol;
		return a.note ? `${head} ${a.note}` : head;
	}
</script>

{#snippet footer()}
	<!-- Reference footer: a single secondary Close. -->
	<button class="btn secondary" type="button" onclick={onClose}>Close</button>
{/snippet}

<!-- Reference h5 is the plural "Alerts Logs". -->
<Modal {open} {onClose} title="Alerts Logs" {footer}>
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
						<span class="lg-by">{log.author_name ?? 'Trader'}</span>
						<span class="lg-date">{formatStamp(log.created_at)}</span>
					</div>
					<div class="lg-body">{bodyText(log)}</div>
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
	.list-group-item {
		display: block;
		width: 100%;
		text-align: left;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		padding: 0.5rem 0.7rem;
	}
	.list-group-item + .list-group-item {
		border-top: none;
	}
	.lg-head {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.15rem;
	}
	.lg-by {
		font-weight: 700;
		font-size: 0.82rem;
	}
	.lg-date {
		font-size: 0.75rem;
		color: var(--text-dim);
		white-space: nowrap;
	}
	.lg-body {
		font-size: 0.85rem;
		word-break: break-word;
		white-space: pre-wrap;
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
