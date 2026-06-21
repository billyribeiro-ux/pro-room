<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';
	import { api, ApiError } from '$lib/api';
	import { formatStamp } from '$lib/message';
	import type { PresentUser, PrivateMessageView } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
		roomId: string;
		/** Roster to pick which user's PMs to inspect (admin getAllUserPM). */
		present?: PresentUser[];
	}
	let { open, onClose, roomId, present = [] }: Props = $props();

	// The reference "All private messages" is an ADMIN per-user view (getAllUserPM):
	// pick a user, see every PM they sent or received. Gated server-side by
	// Action::ReadAllPrivateMessages (admin/super only).
	let peerId = $state('');
	let messages = $state<PrivateMessageView[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function reload() {
		if (!peerId) {
			messages = [];
			return;
		}
		loading = true;
		error = null;
		try {
			messages = await api.get<PrivateMessageView[]>(`/api/rooms/${roomId}/admin/pm/${peerId}`);
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'Failed to load private messages';
		} finally {
			loading = false;
		}
	}

	// Fetch whenever the modal is open and a peer is selected.
	$effect(() => {
		if (open) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- bare read registers the $effect dependency on peerId
			peerId;
			void reload();
		}
	});

	/** First letter of the name, upper-cased, for the avatar fallback. */
	function initial(name: string): string {
		return name.trim().charAt(0).toUpperCase() || '?';
	}
</script>

{#snippet footer()}
	<button class="btn secondary" type="button" onclick={onClose}>Close</button>
{/snippet}

<!-- Reference h5 is "All private messages:" (trailing colon + dynamic count slot). -->
<Modal {open} {onClose} title="All private messages:" {footer}>
	<div class="picker">
		<label for="pm-peer">User:</label>
		<select id="pm-peer" bind:value={peerId}>
			<option value="">Select a user…</option>
			{#each present as u (u.user_id)}
				<option value={u.user_id}>{u.display_name}</option>
			{/each}
		</select>
		<button class="btn primary" type="button" onclick={reload} disabled={!peerId || loading}>
			Reload
		</button>
	</div>

	{#if loading}
		<!-- Reference loading body: centered "Loading..." spinner while PMs fetch. -->
		<div class="loading">
			<h5>
				<Icon name="spinner" size={20} class="fa-spin" />
				Loading...
			</h5>
		</div>
	{:else if error}
		<p class="err" role="alert">{error}</p>
	{:else if !peerId}
		<div class="empty">
			<Icon name="envelope" size={28} />
			<p>Select a user to view their private messages.</p>
		</div>
	{:else if messages.length === 0}
		<div class="empty">
			<Icon name="envelope" size={28} />
			<p>No private messages.</p>
		</div>
	{:else}
		<ul class="threads">
			{#each messages as m (m.id)}
				<li class="thread">
					<span class="avatar" aria-hidden="true">{initial(m.sender_name)}</span>
					<span class="meta">
						<span class="name">{m.sender_name} → {m.recipient_name}</span>
						<span class="preview">{m.body}</span>
					</span>
					<time class="when">{formatStamp(m.created_at)}</time>
				</li>
			{/each}
		</ul>
	{/if}
</Modal>

<style>
	.picker {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	.picker label {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	.picker select {
		flex: 1;
		min-width: 0;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.4rem 0.5rem;
		font-size: 0.85rem;
	}
	.err {
		margin: 0.25rem 0;
		color: var(--negative);
		font-size: 0.82rem;
	}
	.btn.primary {
		background: var(--modal-btn-primary, var(--accent));
		border-color: var(--modal-btn-primary, var(--accent));
		color: #fff;
	}
	.btn.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.loading {
		text-align: center;
		margin: 1.5rem 0;
		color: var(--text-dim);
	}
	.loading h5 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.loading :global(svg),
	.loading :global(i) {
		color: var(--text-dim);
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
	.threads {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.thread {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.6rem 0.75rem;
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		flex: 0 0 36px;
		border-radius: 50%;
		background: var(--accent);
		color: #fff;
		font-weight: 700;
		font-size: 0.95rem;
		text-transform: uppercase;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
		flex: 1;
	}
	.name {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.preview {
		font-size: 0.8rem;
		color: var(--text-dim);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.when {
		font-size: 0.75rem;
		color: var(--text-dim);
		flex: 0 0 auto;
		white-space: nowrap;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
	}
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		color: #fff;
		border-color: var(--modal-btn-secondary, #444);
	}
	.btn.secondary:hover {
		opacity: 0.9;
	}
</style>
