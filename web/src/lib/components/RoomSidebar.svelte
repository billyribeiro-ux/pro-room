<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PresentUser } from '$lib/types';
	import {
		DeviceMobile,
		Plug,
		Gear,
		Archive,
		Bell,
		ChatCircle,
		ClosedCaptioning,
		SpeakerSlash,
		UserCheck,
		Users,
		SortAscending,
		MagnifyingGlass,
		ArrowsClockwise,
		X
	} from 'phosphor-svelte';
	import MobileAppInfoModal from './modals/MobileAppInfoModal.svelte';
	import ConnectivityCheckModal from './modals/ConnectivityCheckModal.svelte';
	import AlertLogsModal from './modals/AlertLogsModal.svelte';
	import ChatLogsModal from './modals/ChatLogsModal.svelte';
	import MutedUsersModal from './modals/MutedUsersModal.svelte';
	import FollowedUsersModal from './modals/FollowedUsersModal.svelte';

	interface Props {
		open: boolean;
		present: PresentUser[];
		onClose?: () => void;
	}
	let { open, present, onClose }: Props = $props();

	let mobileAppOpen = $state(false);
	let connectivityOpen = $state(false);
	let alertLogsOpen = $state(false);
	let chatLogsOpen = $state(false);
	let mutedUsersOpen = $state(false);
	let followedUsersOpen = $state(false);

	function initialOf(name: string): string {
		return name.trim().charAt(0).toUpperCase() || '?';
	}
</script>

<aside class="sidebar" class:closed={!open} aria-hidden={!open}>
	<div class="powered">
		<div class="powered-text">
			<span class="powered-by">Powered by Revolution Trading Room</span>
			<span class="version">v0.0.1</span>
		</div>
		{#if onClose}
			<button class="close" onclick={onClose} aria-label="Close sidebar" title="Close sidebar">
				<X size={16} />
			</button>
		{/if}
	</div>

	<nav class="menu">
		<button
			class="item"
			aria-label="Mobile App Info"
			title="Mobile App Info"
			onclick={() => (mobileAppOpen = true)}
		>
			<DeviceMobile size={16} /><span>Mobile App Info</span>
		</button>

		<button
			class="item"
			aria-label="Connectivity Check"
			title="Connectivity Check"
			onclick={() => (connectivityOpen = true)}
		>
			<Plug size={16} /><span>Connectivity Check</span>
		</button>

		<a class="item" href={resolve('/settings')}>
			<Gear size={16} /><span>General Settings</span>
		</a>

		<div class="group">
			<span class="group-head"><Archive size={16} /> Archives</span>
			<button
				class="sub-item"
				aria-label="Alert Logs"
				title="Alert Logs"
				onclick={() => (alertLogsOpen = true)}
			>
				<Bell size={14} /><span>Alert Logs</span>
			</button>
			<button
				class="sub-item"
				aria-label="Chat Logs"
				title="Chat Logs"
				onclick={() => (chatLogsOpen = true)}
			>
				<ChatCircle size={14} /><span>Chat Logs</span>
			</button>
			<button class="sub-item" aria-label="Transcript History" title="Transcript History" disabled>
				<ClosedCaptioning size={14} /><span>Transcript History</span>
			</button>
		</div>

		<button
			class="item"
			aria-label="Manage Muted Users"
			title="Manage Muted Users"
			onclick={() => (mutedUsersOpen = true)}
		>
			<SpeakerSlash size={16} /><span>Manage Muted Users</span>
		</button>

		<button
			class="item"
			aria-label="Manage Followed Users"
			title="Manage Followed Users"
			onclick={() => (followedUsersOpen = true)}
		>
			<UserCheck size={16} /><span>Manage Followed Users</span>
		</button>
	</nav>

	<div class="roster">
		<div class="roster-head">
			<span class="roster-title">
				<Users size={16} /> Users: <span class="roster-count">{present.length}</span>
			</span>
			<span class="roster-actions">
				<button class="mini" aria-label="Sort users" title="Sort users" disabled>
					<SortAscending size={14} />
				</button>
				<button class="mini" aria-label="Search users" title="Search users" disabled>
					<MagnifyingGlass size={14} />
				</button>
				<button class="mini" aria-label="Reload users" title="Reload users" disabled>
					<ArrowsClockwise size={14} />
				</button>
			</span>
		</div>

		<ul class="roster-list">
			{#each present as u (u.user_id)}
				<li class="roster-item">
					<span class="avatar" aria-hidden="true">{initialOf(u.display_name)}</span>
					<span class="roster-name" title={u.display_name}>{u.display_name}</span>
				</li>
			{:else}
				<li class="roster-empty">No one here yet.</li>
			{/each}
		</ul>
	</div>
</aside>

<MobileAppInfoModal open={mobileAppOpen} onClose={() => (mobileAppOpen = false)} />
<ConnectivityCheckModal open={connectivityOpen} onClose={() => (connectivityOpen = false)} />
<AlertLogsModal open={alertLogsOpen} onClose={() => (alertLogsOpen = false)} />
<ChatLogsModal open={chatLogsOpen} onClose={() => (chatLogsOpen = false)} />
<MutedUsersModal open={mutedUsersOpen} onClose={() => (mutedUsersOpen = false)} />
<FollowedUsersModal open={followedUsersOpen} onClose={() => (followedUsersOpen = false)} />

<style>
	.sidebar {
		width: 250px;
		flex: 0 0 250px;
		height: 100%;
		background: var(--bg-elev);
		border-right: 1px solid var(--border);
		color: var(--text);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		transition: margin-left 0.2s ease;
	}
	.sidebar.closed {
		margin-left: -250px;
	}
	.powered {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.85rem 0.9rem;
		border-bottom: 1px solid var(--border);
	}
	.powered-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.25rem;
		line-height: 0;
		flex: 0 0 auto;
	}
	.close:hover {
		color: var(--text);
		border-color: var(--accent);
	}
	.powered-by {
		font-size: 0.8rem;
		font-weight: 700;
	}
	.version {
		font-size: 0.7rem;
		color: var(--text-dim);
	}
	.menu {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		gap: 0.2rem;
		border-bottom: 1px solid var(--border);
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.5rem 0.6rem;
		font-size: 0.85rem;
	}
	.item:hover:not(:disabled) {
		background: var(--bg-elev-2);
		color: var(--accent);
	}
	.item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.group-head {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.5rem 0.6rem 0.25rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-dim);
	}
	.sub-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.4rem 0.6rem 0.4rem 1.4rem;
		font-size: 0.82rem;
	}
	.sub-item:hover:not(:disabled) {
		background: var(--bg-elev-2);
		color: var(--accent);
	}
	.sub-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.roster {
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 0.5rem;
	}
	.roster-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.3rem 0.4rem 0.5rem;
	}
	.roster-title {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--text-dim);
	}
	.roster-count {
		font-weight: 700;
		color: var(--text);
	}
	.roster-actions {
		display: inline-flex;
		gap: 0.25rem;
	}
	.mini {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.25rem;
		line-height: 0;
	}
	.mini:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.roster-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.roster-item {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.35rem 0.45rem;
		border-radius: var(--radius);
	}
	.roster-item:hover {
		background: var(--bg-elev-2);
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		flex: 0 0 26px;
		border-radius: 50%;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.roster-name {
		font-size: 0.85rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.roster-empty {
		padding: 0.5rem 0.45rem;
		color: var(--text-dim);
		font-size: 0.82rem;
	}
</style>
