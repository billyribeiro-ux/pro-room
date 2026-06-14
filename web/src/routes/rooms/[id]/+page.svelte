<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { api, ApiError } from '$lib/api';
	import { ScreenShareRoom } from '$lib/livekit.svelte';
	import { RoomSocket } from '$lib/realtime.svelte';
	import type { ChatChannel, LiveKitToken, PresentUser, RoomDetail, RoomEvent } from '$lib/types';
	import MainStage from '$lib/components/MainStage.svelte';
	import { type AlertItem } from '$lib/components/AlertFeed.svelte';
	import { type ChatItem } from '$lib/components/ChatPanel.svelte';
	import AlertsChatDock from '$lib/components/AlertsChatDock.svelte';
	import MembersPanel from '$lib/components/MembersPanel.svelte';
	// PresenceBar removed from the room chrome (matches the reference — presence is
	// shown via the top-nav user count + the sidebar roster).
	import RoomTopNav from '$lib/components/RoomTopNav.svelte';
	import RoomSidebar from '$lib/components/RoomSidebar.svelte';
	import PollPanel from '$lib/components/PollPanel.svelte';
	import PollModal from '$lib/components/PollModal.svelte';
	import RecPreview from '$lib/components/RecPreview.svelte';
	import PrivateChat from '$lib/components/PrivateChat.svelte';
	import ConnectionOverlay from '$lib/components/ConnectionOverlay.svelte';
	import MobileAppInfoModal from '$lib/components/modals/MobileAppInfoModal.svelte';
	import Split from '$lib/components/Split.svelte';
	import { privateChat, closePrivateChat } from '$lib/privateChat.svelte';
	import { layout } from '$lib/stores/layout.svelte';
	import { listPolls, type PollDetail } from '$lib/poll';
	import {
		BroadcastIcon,
		MonitorPlayIcon,
		StopCircleIcon,
		GearIcon,
		ArrowLeftIcon,
		ChartBarIcon,
		RecordIcon
	} from 'phosphor-svelte';

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	let detail = $state<RoomDetail | null>(null);
	let alerts = $state<AlertItem[]>([]);
	// Keep both channels' history so switching tabs is instant and incoming
	// WS messages can be filed into the right channel even when not shown.
	let mainMessages = $state<ChatItem[]>([]);
	let offTopicMessages = $state<ChatItem[]>([]);
	let channel = $state<ChatChannel>('main');
	let present = $state<PresentUser[]>([]);
	let error = $state<string | null>(null);
	let screenDisabled = $state(false);
	let showMembers = $state(false);
	// Off-canvas by default (matches the reference) — the top-nav hamburger
	// reveals it; content fills the width when closed.
	let sidebarOpen = $state(false);
	let polls = $state<PollDetail[]>([]);
	let showCreatePoll = $state(false);
	let showRecPreview = $state(false);
	let showMobileInfo = $state(false);

	const screen = new ScreenShareRoom();
	// $state so the template reacts both to the socket being created in onMount
	// and to its internal `connected` flag (drives the ConnectionOverlay).
	let socket = $state<RoomSocket | null>(null);

	const caps = $derived(detail?.capabilities);
	const messages = $derived(channel === 'main' ? mainMessages : offTopicMessages);

	// Room layout (from the General Settings "Room Layout" radios). The reference
	// uses a resizable angular-split: alerts+chat ≈ ⅓, presentation ≈ ⅔. We map
	// the chosen position onto a <Split> — direction, which pane comes first, and
	// the initial size of pane A. On narrow viewports we force a vertical stack
	// (a ⅓/⅔ horizontal split is unusable at phone widths). The shell is re-keyed
	// on position+breakpoint so the split re-seeds (Split reads `initial` once).
	const narrow = new MediaQuery('(max-width: 900px)');
	const splitDir = $derived<'horizontal' | 'vertical'>(
		narrow.current || layout.position === 'top' || layout.position === 'bottom'
			? 'vertical'
			: 'horizontal'
	);
	const dockFirst = $derived(
		narrow.current ? true : layout.position === 'left' || layout.position === 'top'
	);
	const splitInitial = $derived(
		narrow.current
			? 45
			: layout.position === 'left'
				? 33.5
				: layout.position === 'top'
					? 42
					: layout.position === 'right'
						? 66.5
						: 58
	);

	// Insert a new poll or replace an existing one in place (keyed by id) so a
	// vote/close update never duplicates, and a closed poll keeps showing its
	// final tallies until the next full load.
	function upsertPoll(updated: PollDetail) {
		const idx = polls.findIndex((p) => p.id === updated.id);
		polls =
			idx === -1 ? [updated, ...polls] : polls.map((p) => (p.id === updated.id ? updated : p));
	}

	function handleEvent(ev: RoomEvent) {
		switch (ev.type) {
			case 'alert':
				alerts = [{ ...ev.alert, author_name: ev.author_name }, ...alerts].slice(0, 100);
				break;
			case 'chat': {
				const item = { ...ev.message, author_name: ev.author_name };
				if (ev.message.channel === 'off_topic') {
					offTopicMessages = [...offTopicMessages, item].slice(-100);
				} else {
					mainMessages = [...mainMessages, item].slice(-100);
				}
				break;
			}
			case 'presence':
				present = ev.users;
				break;
			case 'live':
				if (detail) detail = { ...detail, room: { ...detail.room, is_live: ev.is_live } };
				break;
			case 'poll':
				upsertPoll(ev.poll);
				break;
		}
	}

	async function loadMessages(ch: ChatChannel) {
		const m = await api.get<ChatItem[]>(`/api/rooms/${roomId}/messages?channel=${ch}`);
		const ordered = [...m].reverse();
		if (ch === 'off_topic') offTopicMessages = ordered;
		else mainMessages = ordered;
	}

	let loaded = $state<Record<ChatChannel, boolean>>({ main: false, off_topic: false });

	async function selectChannel(ch: ChatChannel) {
		channel = ch;
		if (!loaded[ch]) {
			loaded = { ...loaded, [ch]: true };
			try {
				await loadMessages(ch);
			} catch (err) {
				error = err instanceof ApiError ? err.message : 'Failed to load messages';
			}
		}
	}

	async function postAlert(symbol: string, side: string, note: string) {
		await api.post(`/api/rooms/${roomId}/alerts`, { symbol, side, note: note || null });
	}

	async function postMessage(body: string) {
		await api.post(`/api/rooms/${roomId}/messages`, { body, channel });
	}

	async function toggleLive() {
		if (!detail) return;
		const next = !detail.room.is_live;
		await api.post(`/api/rooms/${roomId}/live`, { is_live: next });
		// `live` event will also arrive over WS; update optimistically too.
		detail = { ...detail, room: { ...detail.room, is_live: next } };
	}

	async function connectLiveKit() {
		try {
			const tok = await api.post<LiveKitToken>(`/api/rooms/${roomId}/livekit-token`);
			await screen.connect(tok.url, tok.token);
		} catch (err) {
			if (err instanceof ApiError && err.status === 503) {
				screenDisabled = true;
			} else {
				error = err instanceof ApiError ? err.message : 'Failed to connect media';
			}
		}
	}

	onMount(async () => {
		try {
			detail = await api.get<RoomDetail>(`/api/rooms/${roomId}`);
			const [a, m, p] = await Promise.all([
				api.get<AlertItem[]>(`/api/rooms/${roomId}/alerts`),
				api.get<ChatItem[]>(`/api/rooms/${roomId}/messages?channel=main`),
				listPolls(roomId)
			]);
			alerts = a;
			mainMessages = [...m].reverse();
			polls = p;
			loaded = { ...loaded, main: true };
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load room';
			return;
		}

		socket = new RoomSocket(roomId, handleEvent);
		socket.open();
		await connectLiveKit();
	});

	onDestroy(() => {
		socket?.close();
		void screen.disconnect();
	});
</script>

{#if error}
	<div class="banner">
		<a href={resolve('/rooms')}><ArrowLeftIcon size={16} /> Rooms</a> <span>{error}</span>
	</div>
{:else if detail}
	<RoomTopNav
		roomName={detail.room.name}
		userCount={present.length}
		onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
		onMobileInfo={() => (showMobileInfo = true)}
		onReload={() => location.reload()}
	/>

	<!-- Surfaces the realtime socket state: green "Connected" flash on reconnect,
	     persistent "Reconnecting…" banner when the WS drops. Treats "no socket
	     yet" (initial load) as connected so it doesn't flash on first paint. -->
	<ConnectionOverlay connected={socket?.connected ?? true} />

	<div class="room-body">
		{#if screenDisabled}
			<p class="notice">
				Screen sharing is unavailable — the server has no LiveKit credentials configured.
			</p>
		{/if}

		<div class="shell-body">
			<RoomSidebar
				open={sidebarOpen}
				{present}
				canManage={caps?.can_manage_room ?? false}
				onClose={() => (sidebarOpen = false)}
			/>

			<div class="layout">
				{#key `${layout.position}:${narrow.current}`}
					<Split direction={splitDir} initial={splitInitial} min={12}>
						{#snippet a()}
							{#if dockFirst}{@render dockPane()}{:else}{@render stagePane()}{/if}
						{/snippet}
						{#snippet b()}
							{#if dockFirst}{@render stagePane()}{:else}{@render dockPane()}{/if}
						{/snippet}
					</Split>
				{/key}
			</div>
		</div>
	</div>

	<!-- Active polls float over the room so the Alerts+Chat column keeps its full
	height (matching the reference). Closed polls remain to show final tallies. -->
	{#if polls.length > 0}
		<aside class="poll-overlay" aria-label="Active polls">
			{#each polls as poll (poll.id)}
				<PollPanel {poll} canManage={caps?.can_post_alert ?? false} onChange={upsertPoll} />
			{/each}
		</aside>
	{/if}

	{#if showMembers && caps?.can_manage_members}
		<MembersPanel {roomId} onClose={() => (showMembers = false)} />
	{/if}

	<PollModal
		open={showCreatePoll}
		onClose={() => (showCreatePoll = false)}
		onCreated={upsertPoll}
	/>

	<RecPreview open={showRecPreview} {roomId} onClose={() => (showRecPreview = false)} />

	<PrivateChat
		open={privateChat.peer !== null}
		peer={privateChat.peer ?? undefined}
		onClose={closePrivateChat}
	/>

	<MobileAppInfoModal open={showMobileInfo} onClose={() => (showMobileInfo = false)} />
{:else}
	<p class="dim">Loading room…</p>
{/if}

{#snippet stageActions()}
	{#if caps?.can_publish_screen && !screenDisabled}
		{#if screen.publishing}
			<button class="ctrl stop" onclick={() => screen.stopSharing()}>
				<StopCircleIcon size={16} weight="fill" /> Stop sharing
			</button>
		{:else}
			<button class="ctrl" onclick={() => screen.startSharing()} disabled={!screen.connected}>
				<MonitorPlayIcon size={16} /> Share screen
			</button>
		{/if}
	{/if}
	{#if caps?.can_post_alert}
		<button class="ctrl" onclick={() => (showCreatePoll = true)}>
			<ChartBarIcon size={16} /> New poll
		</button>
	{/if}
	{#if caps?.can_manage_room}
		<button class="ctrl" onclick={() => (showRecPreview = true)}>
			<RecordIcon size={16} weight="fill" /> Record
		</button>
	{/if}
	{#if caps?.can_manage_room}
		<button class="ctrl" class:live-on={detail?.room.is_live} onclick={toggleLive}>
			<BroadcastIcon size={16} weight={detail?.room.is_live ? 'fill' : 'regular'} />
			{detail?.room.is_live ? 'End broadcast' : 'Go live'}
		</button>
	{/if}
	{#if caps?.can_manage_members}
		<button class="ctrl" onclick={() => (showMembers = !showMembers)}>
			<GearIcon size={16} /> Members
		</button>
	{/if}
{/snippet}

<!-- The two resizable panes of the room shell, placed by the Split above in an
     order that depends on the chosen Room Layout. -->
{#snippet dockPane()}
	<AlertsChatDock
		{alerts}
		{messages}
		{present}
		{channel}
		canPostAlert={caps?.can_post_alert ?? false}
		canPostMessage={caps?.can_post_message ?? false}
		onPostAlert={postAlert}
		onPostMessage={postMessage}
		onChannel={selectChannel}
	/>
{/snippet}

{#snippet stagePane()}
	<MainStage
		{roomId}
		canManage={caps?.can_manage_room ?? false}
		publishers={screen.publishers}
		connected={screen.connected}
		actions={stageActions}
	/>
{/snippet}

<style>
	.room-body {
		/* Clear the 49px fixed top nav, then fill the rest of the viewport. */
		margin-top: 49px;
		height: calc(100vh - 49px);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.shell-body {
		position: relative;
		flex: 1;
		display: flex;
		align-items: stretch;
		min-height: 0;
		/* In-flow sidebar collapses to width 0 when closed; clip during the
		   transition so nothing spills. */
		overflow: hidden;
	}
	.shell-body .layout {
		flex: 1;
		min-width: 0;
	}
	.ctrl {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 8px;
		padding: 0.45rem 0.7rem;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.ctrl:hover {
		border-color: var(--accent);
	}
	.ctrl:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.ctrl.stop {
		color: var(--negative);
		border-color: var(--negative);
	}
	.ctrl.live-on {
		color: var(--negative);
		border-color: var(--negative);
	}
	.layout {
		height: 100%;
		min-width: 0;
		min-height: 0;
	}
	.poll-overlay {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 50;
		width: min(340px, calc(100vw - 2rem));
		max-height: 70vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.notice {
		background: color-mix(in srgb, var(--warn) 12%, transparent);
		border: 1px solid var(--warn);
		color: #ffe9a8;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}
	.banner {
		display: flex;
		gap: 1rem;
		align-items: center;
		color: #ffd7da;
	}
	.banner a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.dim {
		color: var(--text-dim);
	}
</style>
