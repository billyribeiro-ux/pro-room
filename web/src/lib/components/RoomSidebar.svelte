<script lang="ts">
	import type { PresentUser } from '$lib/types';
	import type { ScreenShareRoom } from '$lib/livekit.svelte';
	import Icon from './Icon.svelte';
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
	import { debugLogText, logEvent } from '$lib/stores/sessionLog.svelte';

	interface Props {
		open: boolean;
		present: PresentUser[];
		canManage?: boolean;
		onClose?: () => void;
		roomId: string;
		/** Live LiveKit room — lets AV Settings apply device changes to the call. */
		screen?: ScreenShareRoom;
		/** Broadcast a YouTube video to the room (Play YouTube modal → media-for-all). */
		onPlayMedia?: (kind: 'youtube', url: string) => void;
		/** Stop the room-wide video for everyone. */
		onStopMedia?: () => void;
	}
	let {
		open,
		present,
		canManage = false,
		onClose,
		roomId,
		screen,
		onPlayMedia,
		onStopMedia
	}: Props = $props();

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
			{#if onClose}
				<button class="close" onclick={onClose} aria-label="Close sidebar" title="Close sidebar">
					<Icon name="times" />
				</button>
			{/if}
			<p class="powered-by">
				Powered by:
				<a
					class="ptr-website-link"
					href="https://www.protradingroom.com"
					target="_blank"
					rel="noopener noreferrer">ProTradingRoom.com</a
				>
			</p>
			<p class="version">Version: v0.0.1</p>
			<p class="powered-cta">
				<button
					class="app-info-btn"
					aria-label="Mobile App Info"
					title="Mobile App Info"
					onclick={() => (mobileAppOpen = true)}
				>
					Mobile App Info
				</button>
			</p>
		</div>

		<hr class="sep" />

		<p class="caps">
			Chat <Icon name="check" size={14} /><span class="cap-media"
				>Media <Icon name="check" size={14} /></span
			>
		</p>

		<nav class="menu">
			<div class="nav-item">
				<button
					class="item"
					aria-label="Connectivity Check"
					title="Connectivity Check"
					onclick={() => (connectivityOpen = true)}
				>
					<Icon name="network-wired" size={14} /><span class="label">Connectivity Check</span>
				</button>
			</div>

			<div class="nav-item">
				<button
					class="item"
					aria-label="Audio/Video Settings"
					title="Audio/Video Settings"
					onclick={() => (avSettingsOpen = true)}
				>
					<Icon name="video" size={14} /><span class="label">Audio/Video Settings</span>
				</button>
			</div>

			<div class="nav-item">
				<button
					class="item"
					aria-label="General Settings"
					title="General Settings"
					onclick={() => (settingsOpen = true)}
				>
					<Icon name="cogs" size={14} /><span class="label">General Settings</span>
				</button>
			</div>

			<div class="nav-item">
				<div class="group">
					<button
						class="item"
						aria-label="Archives"
						title="Archives"
						onclick={() => (alertLogsOpen = true)}
					>
						<Icon name="archive" size={14} /><span class="label">Archives</span>
					</button>
					<button
						class="sub-item"
						aria-label="Alert Logs"
						title="Alert Logs"
						onclick={() => (alertLogsOpen = true)}
					>
						<Icon name="bell" size={14} /><span class="label">Alert Logs</span>
					</button>
					<button
						class="sub-item"
						aria-label="Chat Logs"
						title="Chat Logs"
						onclick={() => (chatLogsOpen = true)}
					>
						<Icon name="comment" size={14} /><span class="label">Chat Logs</span>
					</button>
					<button
						class="sub-item"
						aria-label="Transcript History"
						title="Transcript History"
						disabled
					>
						<Icon name="closed-captioning" size={14} /><span class="label">Transcript History</span>
					</button>
				</div>
			</div>

			<div class="nav-item compact">
				<button
					class="item item-ps"
					aria-label="Manage Muted Users"
					title="Manage Muted Users"
					onclick={() => (mutedUsersOpen = true)}
				>
					<Icon name="comments" size={14} /><span class="label">Manage Muted Users</span>
				</button>
			</div>

			<div class="nav-item compact">
				<button
					class="item item-ps"
					aria-label="Manage Followed Users"
					title="Manage Followed Users"
					onclick={() => (followedUsersOpen = true)}
				>
					<Icon name="users" size={14} /><span class="label">Manage Followed Users</span>
				</button>
			</div>

			{#if canManage}
				<div class="nav-item">
					<div class="group">
						<span class="group-head"><Icon name="shield-alt" size={14} /> Admin</span>
						<button
							class="sub-item"
							aria-label="All Private Messages"
							title="All Private Messages"
							onclick={() => (allPmOpen = true)}
						>
							<Icon name="envelope" size={14} /><span class="label">All Private Messages</span>
						</button>
						<button
							class="sub-item"
							aria-label="Play YouTube Video"
							title="Play YouTube Video"
							onclick={() => (playYoutubeOpen = true)}
						>
							<Icon name="youtube" family="brands" size={14} /><span class="label"
								>Play YouTube Video</span
							>
						</button>
						<button
							class="sub-item"
							aria-label="Session Control"
							title="Session Control"
							onclick={() => (sessionControlOpen = true)}
						>
							<Icon name="sliders-h" size={14} /><span class="label">Session Control</span>
						</button>
						<button
							class="sub-item"
							aria-label="Debug Log"
							title="Debug Log"
							onclick={() => {
								logEvent('Debug log opened');
								debugLogOpen = true;
							}}
						>
							<Icon name="bug" size={14} /><span class="label">Debug Log</span>
						</button>
					</div>
				</div>
			{/if}
		</nav>

		<div class="roster">
			<div class="roster-head">
				<span class="roster-title">
					<Icon name="user" size={14} /> <span class="label">Users:</span>
					<span class="roster-count">{present.length}</span>
				</span>
				<!-- Reference visual order (float-right reversed): search · sort · sync · cog. -->
				<span class="roster-actions">
					<button class="mini mini-search" aria-label="Search users" title="Search users" disabled>
						<Icon name="search" size={14} />
					</button>
					<button class="mini mini-sort" aria-label="Sort users" title="Sort users" disabled>
						<Icon name="sort-alpha-down" size={14} />
					</button>
					<button class="mini mini-reload" aria-label="Reload users" title="Reload users" disabled>
						<Icon name="sync" size={14} />
					</button>
					<button class="mini mini-cog" aria-label="User options" title="User options" disabled>
						<Icon name="cog" size={14} />
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
<AVSettingsModal
	open={avSettingsOpen}
	onClose={() => (avSettingsOpen = false)}
	onChangeDevices={(audioInputId, videoInputId) => {
		if (audioInputId) screen?.switchDevice('audioinput', audioInputId);
		if (videoInputId) screen?.switchDevice('videoinput', videoInputId);
	}}
	onSave={({ speakerId, audioInputId, videoInputId }) => {
		if (audioInputId) screen?.switchDevice('audioinput', audioInputId);
		if (videoInputId) screen?.switchDevice('videoinput', videoInputId);
		if (speakerId) screen?.switchDevice('audiooutput', speakerId);
	}}
/>
<AlertLogsModal open={alertLogsOpen} onClose={() => (alertLogsOpen = false)} {roomId} />
<ChatLogsModal open={chatLogsOpen} onClose={() => (chatLogsOpen = false)} {roomId} />
<MutedUsersModal open={mutedUsersOpen} onClose={() => (mutedUsersOpen = false)} />
<FollowedUsersModal open={followedUsersOpen} onClose={() => (followedUsersOpen = false)} />
<SettingsModal open={settingsOpen} onClose={() => (settingsOpen = false)} />
<PlayYouTubeModal
	open={playYoutubeOpen}
	onClose={() => (playYoutubeOpen = false)}
	{roomId}
	onPlay={onPlayMedia}
	onStop={onStopMedia}
/>
<SessionControlModal open={sessionControlOpen} onClose={() => (sessionControlOpen = false)} />
<DebugLogModal open={debugLogOpen} onClose={() => (debugLogOpen = false)} log={debugLogText()} />
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
		background: #ffffff;
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
		color: #676767;
		/* Reference .navbar-nav.small: 14px base. */
		font-size: 14px;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	/* Powered block — reference li.nav-item.text-center, padding 5px 2px. */
	.powered {
		position: relative;
		padding: 5px 2px;
		text-align: center;
	}
	.close {
		position: absolute;
		top: 4px;
		right: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 4px;
		padding: 0.25rem;
		line-height: 0;
	}
	.close:hover {
		color: var(--text);
		border-color: var(--accent);
	}
	/* Reference p (Powered by:): margin-bottom 8px, no padding, 14px/400/lh21. */
	.powered-by {
		margin: 0 0 8px;
		padding: 0;
		font-size: 14px;
		font-weight: 400;
		line-height: 21px;
		color: #676767;
	}
	/* Reference a.ptr-website-link: #45a2ff, margin 0 5px, always underlined. */
	.ptr-website-link {
		color: #45a2ff;
		margin: 0 5px;
		text-decoration: underline;
	}
	/* Reference p (Version): margin-bottom 8px, no padding. */
	.version {
		margin: 0 0 8px;
		padding: 0;
		font-size: 14px;
		font-weight: 400;
		line-height: 21px;
		color: #676767;
	}
	/* Reference p (button wrapper): margin-bottom 8px, no padding. */
	.powered-cta {
		margin: 0 0 8px;
		padding: 0;
	}
	/* Reference button.btn.btn-sm.btn-secondary: bg #6c757d, color #fff,
	   padding 4px 8px, radius 4px, 14px. */
	.app-info-btn {
		display: inline-block;
		padding: 4px 8px;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.5;
		color: #ffffff;
		background-color: #6c757d;
		border: 1px solid #6c757d;
		border-radius: 4px;
		cursor: pointer;
	}
	.app-info-btn:hover {
		background-color: #5c636a;
		border-color: #565e64;
	}

	/* Reference hr: margin 5px 0, border-top 1px solid #676767 (246px wide),
	   opacity 0.25 (Bootstrap default hr) so the line reads as a faint
	   ~#c9c9c9 rather than a solid mid-gray. */
	.sep {
		margin: 5px 0;
		border: none;
		border-top: 1px solid #676767;
		opacity: 0.25;
	}

	/* Reference p (Chat/Media ticks): margin-bottom 8px, no padding, centered. */
	.caps {
		margin: 0 0 8px;
		padding: 0;
		text-align: center;
		font-size: 14px;
		font-weight: 400;
		line-height: 21px;
		color: #676767;
	}
	/* Reference Media span: no margin (spacing is the inter-word whitespace). */
	.cap-media {
		margin-left: 4px;
	}
	.caps :global(i) {
		margin-left: 4px;
	}

	.menu {
		display: flex;
		flex-direction: column;
	}
	/* Reference li.nav-item: padding 5px 2px. */
	.nav-item {
		padding: 5px 2px;
	}
	/* Reference li.nav-item.py-0 (Manage Muted / Manage Followed Users):
	   0 vertical padding → 38px rows vs the 48px default rows. */
	.nav-item.compact {
		padding: 0 2px;
	}
	/* Reference a.nav-link.sidebar-item: padding 8px 0, margin 0 5px, 14px,
	   weight 700, color #676767, full-width (236px inside 250). */
	.item {
		display: flex;
		align-items: center;
		width: auto;
		text-align: left;
		background: transparent;
		/* Reserve the 1px transparent border in the base state (reference
		   .sidebar-item) so the :hover border doesn't shift the row geometry. */
		border: 1px solid transparent;
		color: #676767;
		border-radius: 0;
		padding: 8px 0;
		margin: 0 5px;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
	}
	/* Reference a.nav-link.sidebar-item.ps-1: padding-left 4px. */
	.item-ps {
		padding-left: 4px;
	}
	/* Reference .sidebar-item:hover (presenter-deep matchedRule): a #e9ecef
	   background fill, and the text color STAYS the resting #676767 (the
	   .sidebar-item rule is color:inherit !important, so hover does not darken it).
	   Border stays transparent (reserved in the base rule, no geometry shift). */
	.item:hover:not(:disabled) {
		background: #e9ecef;
		border-color: transparent;
	}
	.item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	/* Reference span.pl-2 (icon→label gap): padding-left 8px. */
	.label {
		padding-left: 8px;
	}
	.group {
		display: flex;
		flex-direction: column;
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
		width: auto;
		text-align: left;
		background: transparent;
		/* Reserve the 1px transparent border so :hover doesn't shift geometry. */
		border: 1px solid transparent;
		color: #676767;
		border-radius: 0;
		padding: 8px 0.6rem 8px 1.4rem;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
	}
	/* Reference .sidebar-menu:hover: text→darker readable gray, transparent
	   border, NO #e9ecef background fill. */
	.sub-item:hover:not(:disabled) {
		color: #212529;
		border-color: transparent;
		background: transparent;
	}
	.sub-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Roster — reference li.nav-item.d-flex.flex-column, padding 5px 2px. */
	.roster {
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 5px 2px;
	}
	/* Reference a.nav-link.active-room-users: row with title + toolbar,
	   padding-bottom 8px, margin 0 5px. */
	.roster-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0 8px;
		margin: 0 5px;
	}
	.roster-title {
		display: inline-flex;
		align-items: center;
		font-size: 14px;
		font-weight: 700;
		color: #676767;
	}
	.roster-count {
		font-weight: 700;
		color: #676767;
		padding-left: 4px;
	}
	.roster-actions {
		display: inline-flex;
		align-items: center;
	}
	/* Reference roster toolbar buttons: padding 3px 6px, 26x27, radius 4px. */
	.mini {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 3px 6px;
		margin-left: 4px;
		border: none;
		border-radius: 4px;
		line-height: 0;
		cursor: pointer;
	}
	/* The reference cog is a plain `fas fa-cog` glyph inside the users-btns
	   div with no captured colored-button background — its exact bg/color is
	   not in the evidence, so this styling is unverified (flagged). */
	.mini-cog {
		background: #212529;
		color: #ffffff;
	}
	/* Reference reload btn-default: bg #f4f4f4, icon #45a2ff. */
	.mini-reload {
		background: #f4f4f4;
		color: #45a2ff;
	}
	/* Reference sort btn-secondary: bg #6c757d, icon #fff. */
	.mini-sort {
		background: #6c757d;
		color: #ffffff;
	}
	/* Reference search btn-default: bg #45a2ff, icon #f4f4f4, margin-left 0
	   (leftmost float-right button in the reference toolbar). */
	.mini-search {
		background: #45a2ff;
		color: #f4f4f4;
		margin-left: 0;
	}
	.mini:disabled {
		opacity: 0.65;
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
		border-radius: 0;
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
		/* Square avatars — reference gravatars are square (Bootstrap "Darkly",
		   --rosterImg-border-radius: 0). */
		border-radius: 0;
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
