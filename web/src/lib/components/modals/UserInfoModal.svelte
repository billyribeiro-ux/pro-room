<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';
	import { openPrivateChat } from '$lib/privateChat.svelte';

	interface User {
		display_name?: string;
		user_id?: string;
		online?: boolean;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		user?: User;
	}
	let { open, onClose, user }: Props = $props();

	const name = $derived(user?.display_name?.trim() || user?.user_id || 'Unknown user');
	const initial = $derived(name.charAt(0).toUpperCase() || '?');
	const online = $derived(user?.online ?? false);
</script>

{#snippet header()}
	<!-- Reference puts the identity (avatar + name + status badge) in the modal header. -->
	<div class="identity">
		<span class="avatar" aria-hidden="true">{initial}</span>
		<div class="id-meta">
			<h2 class="id-name">{name}</h2>
			<span class="status-badge" class:offline={!online}>{online ? 'Online' : 'Offline'}</span>
		</div>
	</div>
{/snippet}

{#snippet footer()}
	<button type="button" class="action" aria-label="Mention this user">
		<Icon name="at" size={15} /> @Mention
	</button>
	<button
		type="button"
		class="action"
		aria-label="Open a private chat"
		onclick={() => {
			openPrivateChat({ display_name: user?.display_name, user_id: user?.user_id });
			onClose();
		}}
	>
		<Icon name="comment" size={15} /> Private Chat
	</button>
	<button type="button" class="action" aria-label="Follow this user">
		<Icon name="user-plus" size={15} /> <span>Follow</span>
	</button>
	<button type="button" class="action" aria-label="Mute this user">
		<Icon name="bell-slash" size={15} /> <span>Mute</span>
	</button>
	<button type="button" class="close-btn" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="User Info" {header} {footer}>
	<!-- Reference body: a nav-tabs strip with an #nav-info pane holding a key/value
	     details table. -->
	<div class="tabs" role="tablist" aria-label="User detail tabs">
		<button class="tab active" role="tab" aria-selected="true" type="button">Info</button>
	</div>

	<table class="details">
		<tbody>
			<tr>
				<th scope="row">Name</th>
				<td>{name}</td>
			</tr>
			<tr>
				<th scope="row">Status</th>
				<td>{online ? 'Online' : 'Offline'}</td>
			</tr>
			{#if user?.user_id}
				<tr>
					<th scope="row">User ID</th>
					<td class="mono">{user.user_id}</td>
				</tr>
			{/if}
		</tbody>
	</table>
</Modal>

<style>
	.identity {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
	}
	.avatar {
		flex: 0 0 auto;
		width: 64px;
		height: 64px;
		/* Square avatars (reference --rosterImg-border-radius: 0). */
		border-radius: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elev);
		color: var(--text);
		font-size: 1.5rem;
		font-weight: 700;
	}
	.id-meta {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}
	.id-name {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 700;
		word-break: break-word;
	}
	.status-badge {
		align-self: flex-start;
		font-size: 0.72rem;
		font-weight: 700;
		border-radius: 0.25rem;
		padding: 0.1rem 0.45rem;
		/* Online = Darkly success; Offline = badge-danger (reference). */
		background: var(--modal-success, #00bc8c);
		color: #fff;
	}
	.status-badge.offline {
		background: var(--modal-danger, #e74c3c);
	}
	.tabs {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		margin-bottom: 0.75rem;
	}
	.tab {
		background: transparent;
		border: 1px solid transparent;
		border-bottom: none;
		color: var(--text-dim);
		padding: 0.4rem 0.85rem;
		font-size: 0.85rem;
		font-weight: 600;
		border-radius: var(--radius) var(--radius) 0 0;
		cursor: pointer;
	}
	/* Reference modal active tab: bg #222, teal #00bc8c text. */
	.tab.active {
		background: #222;
		color: var(--modal-success, #00bc8c);
		border-color: var(--border);
	}
	.details {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}
	.details th,
	.details td {
		text-align: left;
		padding: 0.4rem 0.5rem;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}
	.details th {
		width: 35%;
		color: var(--text-dim);
		font-weight: 600;
	}
	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.78rem;
		word-break: break-all;
	}
	.action {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.4rem 0.7rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}
	.action:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.close-btn {
		background: var(--modal-btn-secondary, #444);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		padding: 0.4rem 0.9rem;
		font-size: 0.82rem;
		font-weight: 700;
		cursor: pointer;
	}
	.close-btn:hover {
		opacity: 0.9;
	}
</style>
