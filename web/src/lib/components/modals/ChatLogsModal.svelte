<script lang="ts">
	import Modal from '../Modal.svelte';
	import { api, ApiError } from '$lib/api';
	import { formatStamp } from '$lib/message';
	import type { Message } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
		roomId: string;
	}
	let { open, onClose, roomId }: Props = $props();

	let channel = $state<'main' | 'off_topic'>('main');
	let logs = $state<Message[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function reload() {
		loading = true;
		error = null;
		try {
			logs = await api.get<Message[]>(`/api/rooms/${roomId}/messages?channel=${channel}`);
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'Failed to load chat log';
		} finally {
			loading = false;
		}
	}

	// Load when the modal opens or the channel changes.
	$effect(() => {
		if (open) {
			channel;
			void reload();
		}
	});
</script>

{#snippet footer()}
	<button class="btn secondary" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Chat Logs" {footer}>
	<div class="bar">
		<select aria-label="Channel" bind:value={channel}>
			<option value="main">Main Chat</option>
			<option value="off_topic">Off Topic</option>
		</select>
		<button class="btn primary reload" type="button" onclick={reload} disabled={loading}>
			{loading ? 'Loading…' : 'Reload Log List'}
		</button>
	</div>

	{#if error}
		<p class="err" role="alert">{error}</p>
	{:else if !loading && logs.length === 0}
		<div class="empty">No chat messages logged for this channel yet.</div>
	{:else}
		<div class="list-group">
			{#each logs as log (log.id)}
				<div class="list-group-item">
					<div class="lg-head">
						<span class="lg-by">{log.author_name ?? 'trader'}</span>
						<span class="lg-date">{formatStamp(log.created_at)}</span>
					</div>
					<div class="lg-body">{log.body}</div>
				</div>
			{/each}
		</div>
	{/if}
</Modal>

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0.5rem 0 0.75rem;
	}
	.bar select {
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.4rem 0.5rem;
		font-size: 0.82rem;
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
