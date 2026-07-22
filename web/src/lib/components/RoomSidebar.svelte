<script lang="ts">
	import type { PresentUser } from '$lib/types';
	import type { ScreenShareRoom } from '$lib/livekit.svelte';
	import { resolve } from '$app/paths';
	import Icon from './Icon.svelte';
	import MobileAppInfoModal from './modals/MobileAppInfoModal.svelte';
	import ConnectivityCheckModal from './modals/ConnectivityCheckModal.svelte';
	import AVSettingsModal from './modals/AVSettingsModal.svelte';
	import AlertLogsModal from './modals/AlertLogsModal.svelte';
	import ChatLogsModal from './modals/ChatLogsModal.svelte';
	import MutedUsersModal from './modals/MutedUsersModal.svelte';
	import FollowedUsersModal from './modals/FollowedUsersModal.svelte';
	import SettingsModal from './modals/SettingsModal.svelte';
	import EditProfileModal from './modals/EditProfileModal.svelte';
	import PlayYouTubeModal from './modals/PlayYouTubeModal.svelte';
	import SessionControlModal from './modals/SessionControlModal.svelte';
	import DebugLogModal from './modals/DebugLogModal.svelte';
	import AllUserPmModal from './modals/AllUserPmModal.svelte';
	import BrandingModal from './modals/BrandingModal.svelte';
	import BadgesModal from './modals/BadgesModal.svelte';
	import AddUserModal from './modals/AddUserModal.svelte';
	import { debugLogText, logEvent } from '$lib/stores/sessionLog.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	interface Props {
		open: boolean;
		present: PresentUser[];
		canManage?: boolean;
		roomId: string;
		/** Live LiveKit room — lets AV Settings apply device changes to the call. */
		screen?: ScreenShareRoom;
		/** Broadcast a YouTube video to the room (Play YouTube modal → media-for-all). */
		onPlayMedia?: (kind: 'youtube', url: string) => void;
		/** Stop the room-wide video for everyone. */
		onStopMedia?: () => void;
		/** Live chat (WS) connection state — gates the "Chat ✓" tick (reference
		    renders the check only when connected, report.md:636). */
		chatConnected?: boolean;
		/** Live media (SFU) connection state — gates the "Media ✓" tick. */
		mediaConnected?: boolean;
		/** Refetch the presence roster (the toolbar sync button, report.md:677). */
		onReloadUsers?: () => void;
	}
	let {
		open,
		present,
		canManage = false,
		roomId,
		screen,
		onPlayMedia,
		onStopMedia,
		chatConnected = false,
		mediaConnected = false,
		onReloadUsers
	}: Props = $props();

	let mobileAppOpen = $state(false);
	let connectivityOpen = $state(false);
	let avSettingsOpen = $state(false);
	let alertLogsOpen = $state(false);
	let chatLogsOpen = $state(false);
	let mutedUsersOpen = $state(false);
	let followedUsersOpen = $state(false);
	let settingsOpen = $state(false);
	let editProfileOpen = $state(false);
	let playYoutubeOpen = $state(false);
	let sessionControlOpen = $state(false);
	let debugLogOpen = $state(false);
	let allPmOpen = $state(false);
	let brandingOpen = $state(false);
	let badgesOpen = $state(false);
	let addUserOpen = $state(false);

	// Branding is account-wide: gate on the global RoomManage capability (admin+),
	// mirroring the backend Action::ManageBranding gate — NOT on `canManage` (which
	// is room-scoped to the owner/super-admin), so any global admin can reach it.
	const canManageBranding = $derived(auth.can('room.manage'));
	// "Add User" is super-admin-only — mirrors the backend Action::ManageUsers gate
	// (UserManage is held only by super_admin), not the admin+ room.manage above.
	const canManageUsers = $derived(auth.can('user.manage'));

	function initialOf(name: string): string {
		return name.trim().charAt(0).toUpperCase() || '?';
	}

	// ── Archives dropdown (reference: click-toggled dropdown of three text-only
	// `dropdown-item small` entries, report.md:651,1836,1840-1842). ──────────────
	let archivesOpen = $state(false);

	// ── Roster toolbar (reference behaviors, report.md:677,702-705,1987-1994) ──
	// search → inline user-search input; sort → alpha toggle; sync → refetch;
	// cog → user-options dropdown (single captured item "Sort by Trials",
	// report.md:1848-1852).
	let rosterSearchOpen = $state(false);
	let rosterQuery = $state('');
	let sortAlpha = $state(false);
	let userOptsOpen = $state(false);
	// Roster header toggles/focuses the roster (report.md:701).
	let rosterCollapsed = $state(false);

	const rosterShown = $derived.by(() => {
		let list = present;
		const q = rosterQuery.trim().toLowerCase();
		if (q) list = list.filter((u) => u.display_name.toLowerCase().includes(q));
		if (sortAlpha) {
			list = [...list].sort((a, b) => a.display_name.localeCompare(b.display_name));
		}
		return list;
	});
</script>

<aside class="sidebar" class:closed={!open} aria-hidden={!open}>
	<div class="sidebar-inner">
		<!-- Reference info-block children are exactly p / a / p / p>button / hr / p —
		     the hr and the Chat/Media tick row live INSIDE the block; there is no
		     in-drawer close control (the top-nav hamburger toggles the drawer)
		     (report.md:499-505). -->
		<div class="powered">
			<p class="powered-by">
				Powered by: <a class="ptr-website-link" href={resolve('/rooms')}>Trick Trades</a>
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

			<hr class="sep" />

			<!-- Reference renders each check only while that feature is connected
			     (*ngIf ng-star-inserted, report.md:635-636). -->
			<p class="caps">
				Chat
				{#if chatConnected}<Icon name="check" size={14} />{/if}<span class="cap-media"
					>Media
					{#if mediaConnected}<Icon name="check" size={14} />{/if}</span
				>
			</p>
		</div>

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
					aria-label="General Settings"
					title="General Settings"
					onclick={() => (settingsOpen = true)}
				>
					<Icon name="cogs" size={14} /><span class="label">General Settings</span>
				</button>
			</div>

			<div class="nav-item">
				<!-- Reference Archives is a click-toggled dropdown (a.nav-link
				     .sidebar-item.dropdown-toggle with a caret) whose menu renders three
				     TEXT-ONLY `dropdown-item small` entries on the
				     --archives-dropdown-menu tokens #0e3651/#45a2ff
				     (report.md:649,651,1836,1840-1844). -->
				<div class="archives">
					<button
						class="item dropdown-toggle"
						aria-label="Archives"
						title="Archives"
						aria-haspopup="menu"
						aria-expanded={archivesOpen}
						onclick={() => (archivesOpen = !archivesOpen)}
					>
						<Icon name="archive" size={14} /><span class="label">Archives</span>
					</button>
					{#if archivesOpen}
						<!-- Admin capture (dropdown:1): each a.dropdown-item.small has a
						     leading icon (fa-bell / fa-comment / fa-closed-captioning) + a
						     span.pl-2 label. -->
						<div class="archives-menu" role="menu">
							<button
								type="button"
								class="archives-item"
								role="menuitem"
								onclick={() => {
									archivesOpen = false;
									alertLogsOpen = true;
								}}><Icon name="bell" size={14} /><span class="label">Alert Logs</span></button
							>
							<button
								type="button"
								class="archives-item"
								role="menuitem"
								onclick={() => {
									archivesOpen = false;
									chatLogsOpen = true;
								}}><Icon name="comment" size={14} /><span class="label">Chat Logs</span></button
							>
							<button
								type="button"
								class="archives-item"
								role="menuitem"
								title="Transcript history needs caption persistence (pending backend)"
								disabled
								><Icon name="closed-captioning" size={14} /><span class="label"
									>Transcript History</span
								></button
							>
						</div>
					{/if}
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
							aria-label="Audio/Video Settings"
							title="Audio/Video Settings"
							onclick={() => (avSettingsOpen = true)}
						>
							<Icon name="video" size={14} /><span class="label">Audio/Video Settings</span>
						</button>
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

			{#if canManageBranding}
				<div class="nav-item">
					<div class="group">
						<span class="group-head"><Icon name="palette" size={14} /> App</span>
						<button
							class="sub-item"
							aria-label="Branding"
							title="Branding (logo & app name)"
							onclick={() => (brandingOpen = true)}
						>
							<Icon name="image" size={14} /><span class="label">Branding</span>
						</button>
						<button
							class="sub-item"
							aria-label="Badges"
							title="Badges (rank/role badges)"
							onclick={() => (badgesOpen = true)}
						>
							<Icon name="star" size={14} /><span class="label">Badges</span>
						</button>
						{#if canManageUsers}
							<button
								class="sub-item"
								aria-label="Users"
								title="Manage users (add / delete)"
								onclick={() => (addUserOpen = true)}
							>
								<Icon name="users" size={14} /><span class="label">Users</span>
							</button>
						{/if}
					</div>
				</div>
			{/if}
		</nav>

		<div class="roster">
			<div class="roster-head" title="Users">
				<!-- Reference roster header is a pointer-cursor link that toggles/
				     focuses the roster (report.md:701,2359). -->
				<button
					type="button"
					class="roster-title"
					onclick={() => (rosterCollapsed = !rosterCollapsed)}
					aria-expanded={!rosterCollapsed}
				>
					<Icon name="user" size={14} /> <span class="label">Users:</span>
					<span class="roster-count">{present.length}</span>
				</button>
				<!-- Reference visual order (float-right reversed): search · sort · sync ·
				     cog — all live controls (report.md:677,1987-1994). -->
				<span class="roster-actions">
					<button
						class="mini mini-search"
						aria-label="Search Users"
						title="Search Users"
						aria-expanded={rosterSearchOpen}
						onclick={() => {
							rosterSearchOpen = !rosterSearchOpen;
							if (!rosterSearchOpen) rosterQuery = '';
						}}
					>
						<Icon name="search" size={14} />
					</button>
					<button
						class="mini mini-sort"
						aria-label="Sort Users"
						title="Sort Users"
						aria-pressed={sortAlpha}
						onclick={() => (sortAlpha = !sortAlpha)}
					>
						<Icon name="sort-alpha-down" size={14} />
					</button>
					<button
						class="mini mini-reload"
						aria-label="Reload Users"
						title="Reload Users"
						onclick={() => onReloadUsers?.()}
					>
						<Icon name="sync" size={14} />
					</button>
					<span class="cog-wrap">
						<button
							class="mini mini-cog"
							aria-label="User options"
							aria-haspopup="menu"
							aria-expanded={userOptsOpen}
							onclick={() => (userOptsOpen = !userOptsOpen)}
						>
							<Icon name="cog" size={14} />
						</button>
						{#if userOptsOpen}
							<!-- Captured menu holds exactly one item: "Sort by Trials"
							     (report.md:1848-1852). Presence carries no trial/role field
							     yet, so the item is honestly disabled. -->
							<div class="cog-menu" role="menu">
								<button
									type="button"
									role="menuitem"
									title="Needs a role field on presence (pending backend)"
									disabled>Sort by Trials</button
								>
							</div>
						{/if}
					</span>
				</span>
			</div>

			{#if rosterSearchOpen}
				<input
					id="roster-search"
					name="roster-search"
					class="roster-search"
					type="search"
					placeholder="Search users…"
					bind:value={rosterQuery}
				/>
			{/if}

			{#if !rosterCollapsed}
				<ul class="roster-list">
					{#each rosterShown as u (u.user_id)}
						<li class="roster-item">
							<span class="avatar" aria-hidden="true">{initialOf(u.display_name)}</span>
							<span class="roster-name" title={u.display_name}>{u.display_name}</span>
						</li>
					{:else}
						<li class="roster-empty">
							{rosterQuery ? 'No users match.' : 'No one here yet.'}
						</li>
					{/each}
				</ul>
			{/if}
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
<SettingsModal
	open={settingsOpen}
	onClose={() => (settingsOpen = false)}
	onEditProfile={() => {
		settingsOpen = false;
		editProfileOpen = true;
	}}
/>
<EditProfileModal open={editProfileOpen} onClose={() => (editProfileOpen = false)} />
<PlayYouTubeModal
	open={playYoutubeOpen}
	onClose={() => (playYoutubeOpen = false)}
	{roomId}
	onPlay={onPlayMedia}
	onStop={onStopMedia}
/>
<SessionControlModal open={sessionControlOpen} onClose={() => (sessionControlOpen = false)} />
<DebugLogModal open={debugLogOpen} onClose={() => (debugLogOpen = false)} log={debugLogText()} />
<AllUserPmModal open={allPmOpen} onClose={() => (allPmOpen = false)} {roomId} {present} />
<BrandingModal open={brandingOpen} onClose={() => (brandingOpen = false)} />
{#if badgesOpen}
	<BadgesModal open onClose={() => (badgesOpen = false)} {present} />
{/if}
{#if addUserOpen}
	<AddUserModal open onClose={() => (addUserOpen = false)} />
{/if}

<style>
	/* In-flow push rail (matches the reference room-sidebar): when open it takes
	   real layout width and the split content reflows; when closed it collapses
	   to zero. The inner stays a fixed 250px so content doesn't squish mid-
	   collapse — the outer clips it via overflow:hidden. */
	.sidebar {
		flex: 0 0 250px;
		width: 250px;
		align-self: stretch;
		background: var(--sidebar-wrapper-bg, #ffffff);
		/* No border — the captured wrapper rule lists none (report.md:543,2346). */
		overflow: hidden;
		transition:
			flex-basis 0.2s ease,
			width 0.2s ease;
	}
	.sidebar.closed {
		flex-basis: 0;
		width: 0;
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
	/* Reference p (Powered by:): margin-bottom 8px, no padding, 14px/400/lh21. */
	.powered-by {
		margin: 0 0 8px;
		padding: 0;
		font-size: 14px;
		font-weight: 400;
		line-height: 21px;
		color: #676767;
	}
	/* Reference a.ptr-website-link: #45a2ff, margin 0 5px, always underlined,
	   a real anchor with cursor:pointer (report.md:625). */
	.ptr-website-link {
		color: var(--sidebar-accent, #45a2ff);
		margin: 0 5px;
		text-decoration: underline;
		cursor: pointer;
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
		/* Bootstrap button transition (report.md:1639). */
		transition:
			color 0.15s ease-in-out,
			background-color 0.15s ease-in-out,
			border-color 0.15s ease-in-out,
			box-shadow 0.15s ease-in-out;
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
	/* Reference li.nav-item: padding 5px 2px + a 1px WHITE bottom separator on
	   every li (report.md:553-561). */
	.nav-item {
		padding: 5px 2px;
		border-bottom: 1px solid var(--sidebar-navitem-border, #ffffff);
	}
	/* Reference li.nav-item.py-0 (Manage Muted / Manage Followed Users):
	   0 vertical padding → 38px rows vs the 48px default rows. */
	.nav-item.compact {
		padding: 0 2px;
	}
	/* Reference a.nav-link.sidebar-item: display block, padding 8px 0, margin
	   0 5px, 14px, weight 700, color #676767, no border — the row is 37px
	   (report.md:1656-1661,567). */
	.item {
		display: block;
		width: calc(100% - 10px);
		text-align: left;
		background: transparent;
		border: none;
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
	/* Reference .sidebar-item:hover (matchedRule winner): a #e9ecef background
	   fill; the text color stays #676767 (report.md:1969,1977). */
	.item:hover:not(:disabled) {
		background: #e9ecef;
	}
	/* Bootstrap dropdown-toggle caret on the Archives header (report.md:649). */
	.dropdown-toggle::after {
		display: inline-block;
		margin-left: 0.255em;
		vertical-align: 0.255em;
		content: '';
		border-top: 0.3em solid;
		border-right: 0.3em solid transparent;
		border-bottom: 0;
		border-left: 0.3em solid transparent;
	}
	.archives {
		position: relative;
	}
	/* Reference archives dropdown: --archives-dropdown-menu-bg-color #0e3651,
	   --archives-dropdown-menu-color #45a2ff; items are text-only
	   `dropdown-item small` (report.md:1840-1844). */
	.archives-menu {
		position: absolute;
		top: 100%;
		left: 5px;
		z-index: 1000;
		min-width: 10rem;
		background: #0e3651;
		border-radius: 6px;
		padding: 0.5rem 0;
		display: flex;
		flex-direction: column;
	}
	.archives-item {
		display: flex;
		align-items: center;
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		color: #45a2ff;
		/* Absolute 14px (reference .dropdown-item.small = 0.875em of a 16px menu
		   = 14px; ours inherits 14px so em would give 12.25px). */
		font-size: 14px;
		padding: 0.25rem 1rem;
		cursor: pointer;
	}
	/* span.pl-2 — 8px between the icon and the label. */
	.archives-item .label {
		padding-left: 8px;
	}
	.archives-item:hover:not(:disabled) {
		opacity: 0.85;
	}
	.archives-item:disabled {
		opacity: 0.55;
		cursor: not-allowed;
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
		border: none;
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
		background: transparent;
	}
	.sub-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Roster — reference li.nav-item.d-flex.flex-column.h-100 fills the
	   remaining drawer height (report.md:663,517). */
	.roster {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		padding: 5px 2px;
	}
	/* Reference a.nav-link.active-room-users: row with title + toolbar,
	   padding-bottom 8px, margin 0 5px, cursor pointer (report.md:701,2359). */
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
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
	}
	.roster-count {
		font-weight: 700;
		color: #676767;
		padding-left: 4px;
	}
	.roster-search {
		margin: 0 5px 8px;
		padding: 3px 6px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
		font-size: 13px;
		color: #676767;
		background: #ffffff;
	}
	.roster-actions {
		display: inline-flex;
		align-items: center;
	}
	/* Reference roster toolbar buttons: padding 3px 6px, 26x27, radius 4px
	   (report.md:668,1991-1994). 21px line box → 27px total height. */
	.mini {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 3px 6px;
		min-height: 27px;
		margin-left: 4px;
		border: none;
		border-radius: 4px;
		line-height: 21px;
		cursor: pointer;
	}
	.cog-wrap {
		position: relative;
		display: inline-flex;
	}
	.cog-menu {
		position: absolute;
		top: 100%;
		right: 0;
		z-index: 1000;
		min-width: 9rem;
		background: #ffffff;
		border: 1px solid #d9d9d9;
		border-radius: 6px;
		padding: 0.5rem 0;
	}
	.cog-menu button {
		display: block;
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		/* Reference roster-cog item text #212529 (dropdown2.json), 14px, 5px 2px. */
		color: #212529;
		font-size: 14px;
		padding: 5px 2px;
	}
	.cog-menu button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	/* The reference cog is a plain `fas fa-cog` glyph inside the users-btns
	   div with no captured colored-button background — its exact bg/color is
	   not in the evidence, so this styling is unverified (flagged). */
	.mini-cog {
		background: #212529;
		color: #ffffff;
	}
	/* Reference reload btn-default: bg #f4f4f4, icon #45a2ff (report.md:674). */
	.mini-reload {
		background: #f4f4f4;
		color: var(--sidebar-accent, #45a2ff);
	}
	/* Reference sort btn-secondary: bg #6c757d, icon #fff (report.md:673). */
	.mini-sort {
		background: #6c757d;
		color: #ffffff;
	}
	/* Reference search: bg #45a2ff, icon #f4f4f4, margin-left 0 (report.md:672). */
	.mini-search {
		background: var(--sidebar-accent, #45a2ff);
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
		/* Roster avatars are CIRCULAR — --rosterImg-border-radius: 50%
		   (report.md:2885,3004). Message-row avatars stay square (measured
		   radius 0, report.md:1314). */
		border-radius: 50%;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.roster-name {
		font-size: 14px;
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
