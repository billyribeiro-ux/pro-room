<script lang="ts">
	import Modal from '../Modal.svelte';
	import { api, ApiError } from '$lib/api';
	import type { ChatChannel, ChatLogEntry } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
		roomId: string;
	}
	let { open, onClose, roomId }: Props = $props();

	let logs = $state<ChatLogEntry[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	// Admin-only endpoint (ManageMembers-gated): one combined index across all
	// channels, newest-first, that includes author emails. Reference has no channel
	// picker.
	async function reload() {
		loading = true;
		error = null;
		try {
			logs = await api.get<ChatLogEntry[]>(`/api/rooms/${roomId}/chat-logs`);
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'Failed to load chat log';
		} finally {
			loading = false;
		}
	}

	// Reference date line, e.g. "Jul 21, 2026".
	function formatLogDate(iso: string): string {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	const CHANNEL_LABELS: Record<ChatChannel, string> = {
		main: 'Main Chat',
		off_topic: 'Off Topic'
	};

	// Load when the modal opens.
	$effect(() => {
		if (open) {
			void reload();
		}
	});
</script>

{#snippet footer()}
	<button class="btn secondary" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Chat Logs" maxWidth={1000} {footer}>
	<div class="bar">
		<button class="btn primary reload" type="button" onclick={reload} disabled={loading}>
			{loading ? 'Loading…' : 'Reload Log List'}
		</button>
	</div>

	{#if error}
		<p class="err" role="alert">{error}</p>
	{:else if !loading && logs.length === 0}
		<div class="empty">No chat messages logged yet.</div>
	{:else}
		<div class="list-group">
			{#each logs as log (log.id)}
				<div class="list-group-item">
					<strong class="lg-date">{formatLogDate(log.created_at)}</strong>
					<!-- The author's email, matching the reference. Sourced from the
					     admin-only /chat-logs endpoint (ManageMembers-gated), so member emails
					     only ever reach admins. -->
					<div class="lg-line"><strong>By:</strong> <em>{log.author_email}</em></div>
					<div class="lg-line">
						<strong>Channel:</strong> <em>{CHANNEL_LABELS[log.channel] ?? log.channel}</em>
					</div>
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
	/* Reference log entries are WHITE cards with dark CENTERED text (a stack of
	   three lines) and light #dee2e6 borders. */
	.list-group-item {
		display: block;
		width: 100%;
		text-align: center;
		background: #ffffff;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		color: #212529;
		padding: 0.5rem 0.7rem;
		margin-bottom: 0.4rem;
	}
	.lg-date {
		display: block;
		font-weight: 700;
		margin-bottom: 0.15rem;
	}
	.lg-line {
		font-size: 0.9rem;
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
