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
	import MediaPlayer from '$lib/components/MediaPlayer.svelte';
	import MediaForAllModal from '$lib/components/modals/MediaForAllModal.svelte';
	import { privateChat, closePrivateChat } from '$lib/privateChat.svelte';
	import { layout } from '$lib/stores/layout.svelte';
	import { listPolls, type PollDetail } from '$lib/poll';
	import { toggleReaction } from '$lib/reactions';
	import { broadcastMedia } from '$lib/media';
	import { deleteAlert, deleteMessage } from '$lib/admin';
	import { playSound } from '$lib/sound.svelte';
	import type { ReactionTally, ReactionTarget, MediaKind } from '$lib/types';
	import Icon from '$lib/components/Icon.svelte';

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
	let showMediaModal = $state(false);
	let captionsOn = $state(false);
	// Screen-share source picker (Browser vs OBS/XSplit virtual cam).
	let screenMenuOpen = $state(false);
	let screenMenuEl = $state<HTMLDivElement | undefined>();
	// Admin "mute all" broadcast — disables the chat composer for non-admins.
	let mutedAll = $state(false);
	// Presenter "lock this screen" broadcast — holds non-admin viewers on Screens.
	let screenLocked = $state(false);
	let mediaVolume = $state(70);
	// Presenter media-for-all currently playing for the room (SoundCloud/YouTube
	// iframe, or a direct mp3/video file).
	let currentMedia = $state<{
		kind: Exclude<MediaKind, 'stop'>;
		url: string;
	} | null>(null);
	// Aggregated reactions per target, keyed `${kind}:${id}`. `mine` is recomputed
	// from our own local set so another user's reaction event can't flip our pill.
	let reactionsByTarget = $state<Record<string, ReactionTally[]>>({});
	// Intentionally a plain (non-reactive) side-table: it only feeds onReact's
	// recompute of reactionsByTarget; it is never read in the template.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const myReactions = new Map<string, Set<string>>();

	const screen = new ScreenShareRoom();
	// $state so the template reacts both to the socket being created in onMount
	// and to its internal `connected` flag (drives the ConnectionOverlay).
	let socket = $state<RoomSocket | null>(null);

	const caps = $derived(detail?.capabilities);
	const messages = $derived(channel === 'main' ? mainMessages : offTopicMessages);
	// "Mute all" silences non-admins; admins can always post.
	const canChat = $derived(
		(caps?.can_post_message ?? false) && !(mutedAll && !(caps?.can_manage_room ?? false))
	);

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
		// Measured from the live reference at desktop width: the alerts/chat column
		// is ~21.24% and the presentation area ~78.76%. Pane A is the dock for
		// left/top and the stage for right/bottom. (Ratios scale a little with
		// viewport; this matches the captured 1989px desktop split.)
		narrow.current
			? 45
			: layout.position === 'left'
				? 21.5
				: layout.position === 'top'
					? 40
					: layout.position === 'right'
						? 78.5
						: 60
	);

	// Map LiveKit camera publishers (local + remote) to the webcam strip's shape.
	// WebcamHolder is LiveKit-agnostic, so hand it the raw MediaStreamTrack.
	const webcamPublishers = $derived(
		screen.cameraPublishers.map((p) => ({
			id: p.identity,
			name: p.name,
			isLocal: p.isLocal,
			track: p.track.mediaStreamTrack
		}))
	);

	// "Is speaking" indicator: LiveKit reports speaking identities (= user_id);
	// map the first present one to its roster display name for the top nav.
	const speakingName = $derived.by(() => {
		const id = screen.activeSpeakers.find((i) => present.some((u) => u.user_id === i));
		return id ? (present.find((u) => u.user_id === id)?.display_name ?? null) : null;
	});

	// Toggle an emoji reaction on a message/alert. The POST response's `mine` is
	// authoritative for us, so we rebuild our local set from it.
	async function onReact(targetKind: ReactionTarget, targetId: string, emoji: string) {
		const key = `${targetKind}:${targetId}`;
		try {
			const summary = await toggleReaction(roomId, targetKind, targetId, emoji);
			myReactions.set(key, new Set(summary.reactions.filter((t) => t.mine).map((t) => t.emoji)));
			reactionsByTarget = { ...reactionsByTarget, [key]: summary.reactions };
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not react';
		}
	}

	async function playMedia(kind: Exclude<MediaKind, 'stop'>, url: string) {
		currentMedia = { kind, url };
		try {
			await broadcastMedia(roomId, kind, url);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not start media';
		}
	}
	async function stopMedia() {
		currentMedia = null;
		try {
			await broadcastMedia(roomId, 'stop');
		} catch {
			/* stop is best-effort */
		}
	}

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
				// Newest alert appended to the END so it lands at the BOTTOM of the feed
				// (matches chat + the reference: latest is always at the bottom). Keep the
				// last 100. The feed auto-scrolls to it when the viewer is at the bottom.
				alerts = [...alerts, { ...ev.alert, author_name: ev.author_name }].slice(-100);
				// DND-aware chime (suppressed by the matching Do-Not-Disturb flag).
				playSound('alert');
				break;
			case 'chat': {
				const item = { ...ev.message, author_name: ev.author_name, author_role: ev.author_role };
				if (ev.message.channel === 'off_topic') {
					offTopicMessages = [...offTopicMessages, item].slice(-100);
				} else {
					mainMessages = [...mainMessages, item].slice(-100);
				}
				playSound('chat');
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
			case 'reaction': {
				const r = ev.reaction;
				const key = `${r.target_kind}:${r.target_id}`;
				const mineSet = myReactions.get(key);
				reactionsByTarget = {
					...reactionsByTarget,
					[key]: r.reactions.map((t) => ({ ...t, mine: mineSet?.has(t.emoji) ?? false }))
				};
				break;
			}
			case 'media':
				currentMedia = ev.kind === 'stop' ? null : { kind: ev.kind, url: ev.url ?? '' };
				break;
			case 'mute_all':
				mutedAll = ev.muted;
				break;
			case 'chat_cleared':
				mainMessages = [];
				offTopicMessages = [];
				break;
			case 'message_deleted':
				mainMessages = mainMessages.filter((m) => m.id !== ev.id);
				offTopicMessages = offTopicMessages.filter((m) => m.id !== ev.id);
				break;
			case 'alert_deleted':
				alerts = alerts.filter((a) => a.id !== ev.id);
				break;
			case 'kicked':
				present = present.filter((u) => u.user_id !== ev.user_id);
				break;
			case 'room_locked':
				// Enforced server-side at join; no client-visible change needed here.
				break;
			case 'screen_locked':
				// Hold non-admin viewers on the Screens tab (enforced in MainStage).
				screenLocked = ev.locked;
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
			// The API returns alerts newest-first; reverse so the newest sits at the
			// BOTTOM of the feed (same ordering as chat — latest always at the bottom).
			alerts = [...a].reverse();
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

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') screenMenuOpen = false;
	}}
	onclick={(e) => {
		// Close the screen-share source menu when clicking outside it.
		if (screenMenuOpen && screenMenuEl && !screenMenuEl.contains(e.target as Node)) {
			screenMenuOpen = false;
		}
	}}
/>

{#if error}
	<div class="banner">
		<a href={resolve('/rooms')}><Icon name="arrow-left" /> Rooms</a> <span>{error}</span>
	</div>
{:else if detail}
	<RoomTopNav
		roomName={detail.room.name}
		userCount={present.length}
		speaker={speakingName}
		onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
		onMobileInfo={() => (showMobileInfo = true)}
		onReload={() => location.reload()}
		actions={stageActions}
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
					<Split direction={splitDir} initial={splitInitial} min={12} collapsePx={100}>
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

	<MediaForAllModal
		open={showMediaModal}
		onClose={() => (showMediaModal = false)}
		onPlay={playMedia}
		onStop={stopMedia}
	/>

	{#if currentMedia}
		<aside class="media-float" aria-label="Now playing">
			<MediaPlayer media={currentMedia} volume={mediaVolume} onVolume={(v) => (mediaVolume = v)} />
			{#if caps?.can_manage_room}
				<button class="media-stop" type="button" onclick={stopMedia}>Stop for everyone</button>
			{/if}
		</aside>
	{/if}
{:else}
	<p class="dim">Loading room…</p>
{/if}

<!-- Presenter broadcast controls — icon-only with tooltips (title/aria-label),
     rendered in the RIGHT cluster of the main nav. New poll is NOT here; it lives
     in the Alerts section (header + bottom). -->
{#snippet stageActions()}
	{#if caps?.can_publish_screen && !screenDisabled}
		{#if screen.publishing}
			<button
				class="ctrl stop"
				onclick={() => screen.stopSharing()}
				title="Stop sharing"
				aria-label="Stop sharing"
			>
				<Icon name="stop-circle" />
			</button>
		{:else}
			<!-- Reference: the screen-share button opens a small menu to pick the
			     source — Browser (getDisplayMedia) or an external encoder (OBS Virtual
			     Camera / XSplit VCam), captured as a video device + published as the
			     screen feed. -->
			<div class="ctrl-menu" bind:this={screenMenuEl}>
				<button
					class="ctrl"
					onclick={() => (screenMenuOpen = !screenMenuOpen)}
					disabled={!screen.connected}
					title="Share screen"
					aria-label="Share screen"
					aria-haspopup="menu"
					aria-expanded={screenMenuOpen}
				>
					<Icon name="desktop" /><Icon name="caret-down" size={10} />
				</button>
				{#if screenMenuOpen}
					<div class="share-menu" role="menu">
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								screenMenuOpen = false;
								void screen.startSharing();
							}}
						>
							<Icon name="desktop" size={14} /> Browser
						</button>
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								screenMenuOpen = false;
								void screen.startSharingExternalCam();
							}}
						>
							<Icon name="video" size={14} /> OBS / XSplit Cam
						</button>
					</div>
				{/if}
			</div>
		{/if}
		{#if screen.cameraPublishing}
			<button
				class="ctrl stop"
				onclick={() => screen.stopCamera()}
				title="Stop camera"
				aria-label="Stop camera"
			>
				<Icon name="video-slash" />
			</button>
		{:else}
			<button
				class="ctrl"
				onclick={() => screen.startCamera()}
				disabled={!screen.connected}
				title="Camera"
				aria-label="Camera"
			>
				<Icon name="video" />
			</button>
		{/if}
		{#if screen.micPublishing}
			<button
				class="ctrl"
				class:stop={!screen.micMuted}
				onclick={() => screen.toggleMicMute()}
				title={screen.micMuted ? 'Unmute microphone' : 'Mute microphone'}
				aria-label={screen.micMuted ? 'Unmute microphone' : 'Mute microphone'}
			>
				<Icon name={screen.micMuted ? 'microphone-slash' : 'microphone'} />
			</button>
			<button
				class="ctrl"
				onclick={() => screen.stopMic()}
				title="Stop microphone"
				aria-label="Stop microphone"
			>
				<Icon name="microphone-slash" />
			</button>
		{:else}
			<button
				class="ctrl"
				onclick={() => screen.startMic()}
				disabled={!screen.connected}
				title="Microphone"
				aria-label="Microphone"
			>
				<Icon name="microphone" />
			</button>
		{/if}
		<button
			class="ctrl"
			class:live-on={captionsOn}
			onclick={() => (captionsOn = !captionsOn)}
			title="Captions (CC)"
			aria-label="Captions"
		>
			<Icon name="closed-captioning" />
		</button>
		<button class="ctrl" onclick={() => (showMediaModal = true)} title="Music" aria-label="Music">
			<Icon name="music" />
		</button>
	{/if}
	{#if caps?.can_manage_room}
		<button class="ctrl" onclick={() => (showRecPreview = true)} title="Record" aria-label="Record">
			<Icon name="dot-circle" />
		</button>
	{/if}
	{#if caps?.can_manage_room}
		<button
			class="ctrl"
			class:live-on={detail?.room.is_live}
			onclick={toggleLive}
			title={detail?.room.is_live ? 'End broadcast' : 'Go live'}
			aria-label={detail?.room.is_live ? 'End broadcast' : 'Go live'}
		>
			<Icon name="broadcast-tower" />
		</button>
	{/if}
	{#if caps?.can_manage_members}
		<button
			class="ctrl"
			onclick={() => (showMembers = !showMembers)}
			title="Members"
			aria-label="Members"
		>
			<Icon name="cog" />
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
		reactions={reactionsByTarget}
		canReact={caps?.can_post_message ?? false}
		{onReact}
		canManage={caps?.can_manage_room ?? false}
		onDeleteAlert={(id) => deleteAlert(roomId, id)}
		onDeleteMessage={(id) => deleteMessage(roomId, id)}
		canPostAlert={caps?.can_post_alert ?? false}
		canPostMessage={canChat}
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
		{webcamPublishers}
		onWebcamClose={() => screen.stopCamera()}
		captionsActive={captionsOn}
		{screenLocked}
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
		/* Keep full size when the tab bar scrolls horizontally (no squish). */
		flex-shrink: 0;
		white-space: nowrap;
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
	/* Screen-share source picker (Browser / OBS-XSplit). */
	.ctrl-menu {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
	}
	.share-menu {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 30;
		margin-top: 0.25rem;
		min-width: 11rem;
		display: flex;
		flex-direction: column;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		padding: 0.25rem;
	}
	.share-menu button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		color: var(--text);
		font-size: 0.85rem;
		text-align: left;
		padding: 0.45rem 0.6rem;
		border-radius: 6px;
		cursor: pointer;
		white-space: nowrap;
	}
	.share-menu button:hover {
		background: var(--accent-hover);
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
	.media-float {
		position: fixed;
		left: 1rem;
		bottom: 1rem;
		z-index: 55;
		width: min(360px, calc(100vw - 2rem));
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.5rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}
	.media-stop {
		align-self: flex-end;
		background: transparent;
		border: 1px solid var(--negative);
		color: var(--negative);
		border-radius: var(--radius);
		padding: 0.3rem 0.6rem;
		font-size: 0.78rem;
		font-weight: 600;
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
