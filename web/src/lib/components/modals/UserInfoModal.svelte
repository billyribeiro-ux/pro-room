<script lang="ts">
	import Modal from '../Modal.svelte';
	import { AtIcon, ChatCircleIcon, UserPlusIcon, BellSlashIcon } from 'phosphor-svelte';
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

	let name = $derived(user?.display_name?.trim() || user?.user_id || 'Unknown user');
	let initial = $derived(name.charAt(0).toUpperCase() || '?');
	let online = $derived(user?.online ?? false);
</script>

<Modal {open} {onClose} title="User Info">
	<div class="profile">
		<div class="avatar" aria-hidden="true">{initial}</div>
		<div class="meta">
			<p class="name">{name}</p>
			<span class="badge" class:online>
				<span class="dot"></span>
				{online ? 'Online' : 'Offline'}
			</span>
		</div>
	</div>

	{#snippet footer()}
		<button type="button" class="action" aria-label="Mention this user">
			<AtIcon size={15} /> @Mention
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
			<ChatCircleIcon size={15} /> Private Chat
		</button>
		<button type="button" class="action" aria-label="Follow this user">
			<UserPlusIcon size={15} /> Follow
		</button>
		<button type="button" class="action" aria-label="Mute this user">
			<BellSlashIcon size={15} /> Mute
		</button>
		<button type="button" class="close-btn" onclick={onClose}>Close</button>
	{/snippet}
</Modal>

<style>
	.profile {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}
	.avatar {
		flex: 0 0 auto;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent);
		color: #fff;
		font-size: 1.4rem;
		font-weight: 700;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}
	.name {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		word-break: break-word;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		align-self: flex-start;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-dim);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.15rem 0.55rem;
	}
	.badge.online {
		color: var(--positive);
		border-color: color-mix(in srgb, var(--positive) 45%, transparent);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--text-dim);
	}
	.badge.online .dot {
		background: var(--positive);
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
	}
	.action:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.close-btn {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		padding: 0.4rem 0.9rem;
		font-size: 0.82rem;
		font-weight: 700;
	}
	.close-btn:hover {
		background: var(--accent-hover);
	}
</style>
