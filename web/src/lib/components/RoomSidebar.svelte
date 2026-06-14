<script lang="ts">
	import type { PresentUser } from '$lib/types';
	import {
		DeviceMobileIcon,
		PlugIcon,
		GearIcon,
		ArchiveIcon,
		BellIcon,
		ChatCircleIcon,
		ClosedCaptioningIcon,
		SpeakerSlashIcon,
		UserCheckIcon,
		UsersIcon,
		SortAscendingIcon,
		MagnifyingGlassIcon,
		ArrowsClockwiseIcon,
		XIcon,
		ShieldStarIcon,
		YoutubeLogoIcon,
		SlidersHorizontalIcon,
		BugIcon,
		EnvelopeIcon,
		VideoCameraIcon
	} from 'phosphor-svelte';
	import MobileAppInfoModal from './modals/MobileAppInfoModal.svelte';
	import ConnectivityCheckModal from './modals/ConnectivityCheckModal.svelte';
	import AVSettingsModal from './modals/AVSettingsModal.svelte';
	import AlertLogsModal from './modals/AlertLogsModal.svelte';
	import ChatLogsModal from './modals/ChatLogsModal.svelte';
	import MutedUsersModal from './modals/MutedUsersModal.svelte';
	import FollowedUsersModal from './modals/FollowedUsersModal.svelte';
	import SettingsModal from './modals/SettingsModal.svelte';
	import PlayYouTubeModal from './modals/PlayYouTubeModal.svelte';
	import SessionControlModal from './modals/SessionControlModal.svelte';
	import DebugLogModal from './modals/DebugLogModal.svelte';
	import AllUserPmModal from './modals/AllUserPmModal.svelte';

	interface Props {
		open: boolean;
		present: PresentUser[];
		canManage?: boolean;
		onClose?: () => void;
	}
	let { open, present, canManage = false, onClose }: Props = $props();

	let mobileAppOpen = $state(false);
	let connectivityOpen = $state(false);
	let avSettingsOpen = $state(false);
	let alertLogsOpen = $state(false);
	let chatLogsOpen = $state(false);
	let mutedUsersOpen = $state(false);
	let followedUsersOpen = $state(false);
	let settingsOpen = $state(false);
	let playYoutubeOpen = $state(false);
	let sessionControlOpen = $state(false);
	let debugLogOpen = $state(false);
	let allPmOpen = $state(false);

	function initialOf(name: string): string {
		return name.trim().charAt(0).toUpperCase() || '?';
	}
</script>

<aside class="sidebar" class:closed={!open} aria-hidden={!open}>
	<div class="sidebar-inner">
		<div class="powered">
			<div class="powered-text">
				<span class="powered-by">Powered by Revolution Trading Room</span>
				<span class="version">v0.0.1</span>
			</div>
			{#if onClose}
				<button class="close" onclick={onClose} aria-label="Close sidebar" title="Close sidebar">
					<XIcon size={16} />
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
				<DeviceMobileIcon size={16} /><span>Mobile App Info</span>
			</button>

			<button
				class="item"
				aria-label="Connectivity Check"
				title="Connectivity Check"
				onclick={() => (connectivityOpen = true)}
			>
				<PlugIcon size={16} /><span>Connectivity Check</span>
			</button>

			<button
				class="item"
				aria-label="Audio/Video Settings"
				title="Audio/Video Settings"
				onclick={() => (avSettingsOpen = true)}
			>
				<VideoCameraIcon size={16} /><span>Audio/Video Settings</span>
			</button>

			<button
				class="item"
				aria-label="General Settings"
				title="General Settings"
				onclick={() => (settingsOpen = true)}
			>
				<GearIcon size={16} /><span>General Settings</span>
			</button>

			<div class="group">
				<span class="group-head"><ArchiveIcon size={16} /> Archives</span>
				<button
					class="sub-item"
					aria-label="Alert Logs"
					title="Alert Logs"
					onclick={() => (alertLogsOpen = true)}
				>
					<BellIcon size={14} /><span>Alert Logs</span>
				</button>
				<button
					class="sub-item"
					aria-label="Chat Logs"
					title="Chat Logs"
					onclick={() => (chatLogsOpen = true)}
				>
					<ChatCircleIcon size={14} /><span>Chat Logs</span>
				</button>
				<button
					class="sub-item"
					aria-label="Transcript History"
					title="Transcript History"
					disabled
				>
					<ClosedCaptioningIcon size={14} /><span>Transcript History</span>
				</button>
			</div>

			<button
				class="item"
				aria-label="Manage Muted Users"
				title="Manage Muted Users"
				onclick={() => (mutedUsersOpen = true)}
			>
				<SpeakerSlashIcon size={16} /><span>Manage Muted Users</span>
			</button>

			<button
				class="item"
				aria-label="Manage Followed Users"
				title="Manage Followed Users"
				onclick={() => (followedUsersOpen = true)}
			>
				<UserCheckIcon size={16} /><span>Manage Followed Users</span>
			</button>

			{#if canManage}
				<div class="group">
					<span class="group-head"><ShieldStarIcon size={16} /> Admin</span>
					<button
						class="sub-item"
						aria-label="All Private Messages"
						title="All Private Messages"
						onclick={() => (allPmOpen = true)}
					>
						<EnvelopeIcon size={14} /><span>All Private Messages</span>
					</button>
					<button
						class="sub-item"
						aria-label="Play YouTube Video"
						title="Play YouTube Video"
						onclick={() => (playYoutubeOpen = true)}
					>
						<YoutubeLogoIcon size={14} /><span>Play YouTube Video</span>
					</button>
					<button
						class="sub-item"
						aria-label="Session Control"
						title="Session Control"
						onclick={() => (sessionControlOpen = true)}
					>
						<SlidersHorizontalIcon size={14} /><span>Session Control</span>
					</button>
					<button
						class="sub-item"
						aria-label="Debug Log"
						title="Debug Log"
						onclick={() => (debugLogOpen = true)}
					>
						<BugIcon size={14} /><span>Debug Log</span>
					</button>
				</div>
			{/if}
		</nav>

		<div class="roster">
			<div class="roster-head">
				<span class="roster-title">
					<UsersIcon size={16} /> Users: <span class="roster-count">{present.length}</span>
				</span>
				<span class="roster-actions">
					<button class="mini" aria-label="Sort users" title="Sort users" disabled>
						<SortAscendingIcon size={14} />
					</button>
					<button class="mini" aria-label="Search users" title="Search users" disabled>
						<MagnifyingGlassIcon size={14} />
					</button>
					<button class="mini" aria-label="Reload users" title="Reload users" disabled>
						<ArrowsClockwiseIcon size={14} />
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
	</div>
</aside>

<MobileAppInfoModal open={mobileAppOpen} onClose={() => (mobileAppOpen = false)} />
<ConnectivityCheckModal open={connectivityOpen} onClose={() => (connectivityOpen = false)} />
<AVSettingsModal open={avSettingsOpen} onClose={() => (avSettingsOpen = false)} />
<AlertLogsModal open={alertLogsOpen} onClose={() => (alertLogsOpen = false)} />
<ChatLogsModal open={chatLogsOpen} onClose={() => (chatLogsOpen = false)} />
<MutedUsersModal open={mutedUsersOpen} onClose={() => (mutedUsersOpen = false)} />
<FollowedUsersModal open={followedUsersOpen} onClose={() => (followedUsersOpen = false)} />
<SettingsModal open={settingsOpen} onClose={() => (settingsOpen = false)} />
<PlayYouTubeModal open={playYoutubeOpen} onClose={() => (playYoutubeOpen = false)} />
<SessionControlModal open={sessionControlOpen} onClose={() => (sessionControlOpen = false)} />
<DebugLogModal open={debugLogOpen} onClose={() => (debugLogOpen = false)} />
<AllUserPmModal open={allPmOpen} onClose={() => (allPmOpen = false)} />

<style>
	/* In-flow push rail (matches the reference room-sidebar): when open it takes
	   real layout width and the split content reflows; when closed it collapses
	   to zero. The inner stays a fixed 250px so content doesn't squish mid-
	   collapse — the outer clips it via overflow:hidden. */
	.sidebar {
		flex: 0 0 250px;
		width: 250px;
		align-self: stretch;
		background: var(--bg-elev);
		border-right: 1px solid var(--border);
		overflow: hidden;
		transition:
			flex-basis 0.2s ease,
			width 0.2s ease;
	}
	.sidebar.closed {
		flex-basis: 0;
		width: 0;
		border-right: none;
	}
	.sidebar-inner {
		width: 250px;
		height: 100%;
		color: var(--text);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
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
