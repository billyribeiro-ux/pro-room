<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
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
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import MobileAppInfoModal from '$lib/components/modals/MobileAppInfoModal.svelte';
	import Split from '$lib/components/Split.svelte';
	import MediaPlayer from '$lib/components/MediaPlayer.svelte';
	import MediaForAllModal from '$lib/components/modals/MediaForAllModal.svelte';
	import AVSettingsModal from '$lib/components/modals/AVSettingsModal.svelte';
	import ScreensharePreview from '$lib/components/ScreensharePreview.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import {
		privateChat,
		closePrivateChat,
		setPmContext,
		receivePrivate
	} from '$lib/privateChat.svelte';
	import { layout } from '$lib/stores/layout.svelte';
	import { prefs, setPref } from '$lib/stores/prefs.svelte';
	import { listPolls, type PollDetail } from '$lib/poll';
	import { toggleReaction } from '$lib/reactions';
	import { broadcastMedia } from '$lib/media';
	import { deleteAlert, deleteMessage } from '$lib/admin';
	import { playSound } from '$lib/sound.svelte';
	import { isMuted } from '$lib/stores/dnd.svelte';
	import { logEvent } from '$lib/stores/sessionLog.svelte';
	import { showToast } from '$lib/stores/toast.svelte';
	import { alertBody } from '$lib/alertText';
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
	// Per-channel unread counts (the reference's "Off Topic (3)" badge): incremented
	// when a message lands on the NON-active channel, reset when you switch to it.
	let unread = $state<Record<ChatChannel, number>>({ main: 0, off_topic: 0 });
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
	// Live recording flag lifted from RecPreview — drives the top-nav [ REC ]
	// indicator (reference li.recIndicator, report.md:1957).
	let recActive = $state(false);
	// Mic gear (reference .mic-gear-btn, presenter capture nav-css.txt:249-250)
	// opens the AV device settings.
	let micSettingsOpen = $state(false);
	// Closed-captions overlay is now a shared preference (prefs.captionsOverlay) so
	// the sidebar CC button and the General Settings toggle stay in sync.
	// Screen-share source picker (Browser vs OBS/XSplit virtual cam). The menu is
	// position:fixed and anchored to the trigger's viewport rect, because the
	// .nav-controls cluster scrolls horizontally (overflow-x:auto, which also clips
	// overflow-y) — an absolute dropdown would be clipped by that scroll container.
	let screenMenuOpen = $state(false);
	let screenMenuEl = $state<HTMLDivElement | undefined>();
	let shareMenuPos = $state({ top: 0, left: 0 });
	function toggleShareMenu(btn: HTMLElement) {
		if (!screenMenuOpen) {
			const r = btn.getBoundingClientRect();
			shareMenuPos = { top: Math.round(r.bottom + 4), left: Math.round(r.left) };
		}
		screenMenuOpen = !screenMenuOpen;
	}
	// Admin "mute all" broadcast — disables the chat composer for non-admins.
	let mutedAll = $state(false);
	// Presenter "lock this screen" broadcast — holds non-admin viewers on Screens.
	let screenLocked = $state(false);
	// Live closed-caption from the presenter (speaker + latest phrase). Cleared a
	// few seconds after the last phrase so a stale caption doesn't linger.
	let liveCaption = $state<{ speaker: string; text: string } | null>(null);
	let captionTimer: ReturnType<typeof setTimeout> | undefined;
	function showCaption(speaker: string, text: string) {
		liveCaption = { speaker, text };
		clearTimeout(captionTimer);
		captionTimer = setTimeout(() => (liveCaption = null), 8000);
	}
	// Broadcast a finalized caption phrase (presenter only; best-effort).
	async function postCaption(text: string) {
		try {
			await api.post(`/api/rooms/${roomId}/captions`, { text });
		} catch {
			// Captions are ephemeral + best-effort; a dropped phrase is non-fatal.
		}
	}
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
		// Captured desktop split: alerts/chat 21.2364% / presentation 78.7636%
		// (aria-valuenow 21.23640617096612 — report.md:121,154). Pane A is the
		// dock for left/top and the stage for right/bottom.
		narrow.current
			? 45
			: layout.position === 'left'
				? 21.2364
				: layout.position === 'top'
					? 40
					: layout.position === 'right'
						? 78.7636
						: 60
	);

	// Per-viewer hidden remote cams (the × on a remote tile hides it locally —
	// reference renders the × on every tile, report.md:1143).
	let hiddenCams = $state<ReadonlySet<string>>(new Set());
	// Map camera publishers to the webcam strip (MediaStreamTrack already).
	const webcamPublishers = $derived(
		screen.cameraPublishers
			.filter((p) => !hiddenCams.has(p.identity))
			.map((p) => ({
				id: p.identity,
				name: p.name,
				isLocal: p.isLocal,
				track: p.track ?? null
			}))
	);
	function onWebcamClose(id: string) {
		const pub = screen.cameraPublishers.find((p) => p.identity === id);
		if (pub?.isLocal) {
			void screen.stopCamera();
		} else {
			hiddenCams = new Set([...hiddenCams, id]);
		}
	}

	// "Is speaking" indicator: LiveKit reports speaking identities (= user_id);
	// map the first present one to its roster display name for the top nav.
	const speakingName = $derived.by(() => {
		const id = screen.activeSpeakers.find((i) => present.some((u) => u.user_id === i));
		return id ? (present.find((u) => u.user_id === id)?.display_name ?? null) : null;
	});

	// Surface AV failures (mic/cam/screen-share permission or device errors). The
	// LiveKit wrapper sets `screen.error` but renders it nowhere — so a blocked mic
	// just looked dead. Toast it (with the actionable message). `lastShownError` is a
	// PLAIN (non-reactive) guard: the effect must NOT write the same `screen.error`
	// it reads, or it self-triggers (state_unsafe_mutation).
	let lastShownError: string | null = null;
	$effect(() => {
		const e = screen.error;
		if (e && e !== lastShownError) {
			lastShownError = e;
			showToast('Audio / Video', e, 9000);
		}
	});

	// Toggle an emoji reaction on a message/alert. The POST response's `mine` is
	// authoritative for us, so we rebuild our local set from it.
	async function onReact(targetKind: ReactionTarget, targetId: string, emoji: string) {
		const key = `${targetKind}:${targetId}`;
		try {
			const summary = await toggleReaction(roomId, targetKind, targetId, emoji);
			const mine = new Set(summary.reactions.filter((t) => t.mine).map((t) => t.emoji));
			// Reaction cue (reference reactionsPopup) when WE add a reaction — gated by
			// the Settings "Reactions Response" preference inside playSound.
			if (mine.has(emoji) && !myReactions.get(key)?.has(emoji)) playSound('reaction');
			myReactions.set(key, mine);
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
				alerts = [
					...alerts,
					{ ...ev.alert, author_name: ev.author_name, author_badges: ev.author_badges }
				].slice(-100);
				// The server echoes the alert back to its author too; don't self-notify
				// (no chime, no "Alert from @you" toast) — only notify on others' alerts.
				if (ev.alert.author_id !== detail?.viewer_id) {
					// DND-aware chime (suppressed by the matching Do-Not-Disturb flag).
					playSound('alert');
					// Top-right toast (reference toastr.warning on new alert): 10s when the
					// "Longer alert popup" pref is on, else 5s; suppressed by the alertPopup
					// DND flag (isMuted folds in the master dnd.app switch too).
					if (!isMuted('alertPopup')) {
						showToast(
							`Alert from @${ev.author_name ?? 'Trader'}`,
							alertBody(ev.alert),
							prefs.longerAlertPopup ? 10000 : 5000
						);
					}
				}
				break;
			case 'chat': {
				const item = {
					...ev.message,
					author_name: ev.author_name,
					author_role: ev.author_role,
					author_badges: ev.author_badges
				};
				if (ev.message.channel === 'off_topic') {
					offTopicMessages = [...offTopicMessages, item].slice(-100);
				} else {
					mainMessages = [...mainMessages, item].slice(-100);
				}
				// Bump the unread badge on the OTHER tab (not the one you're viewing, and
				// not for your own echo) — the reference's "Off Topic (3)" indicator.
				if (ev.message.channel !== channel && ev.message.author_id !== detail?.viewer_id) {
					unread[ev.message.channel] += 1;
				}
				// The server broadcasts the message back to its sender; don't chime on
				// your own echo (matches the private_message guard below).
				if (ev.message.author_id !== detail?.viewer_id) playSound('chat');
				break;
			}
			case 'private_message':
				// Targeted to sender+recipient only (server per-user channel). File it
				// into the open thread, or pop the panel for an incoming PM.
				receivePrivate(ev.message);
				if (ev.message.sender_id !== detail?.viewer_id) playSound('chat');
				break;
			case 'caption':
				// Live presenter caption — shown in the stage bar when CC is on.
				showCaption(ev.speaker_name, ev.text);
				break;
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
				if (ev.user_id === detail?.viewer_id) {
					// It's us: the server already removed us from membership + presence.
					// Tear down our own connections (close() flips RoomSocket's closed flag
					// so it does NOT auto-reconnect), tell the user why, and leave the room.
					socket?.close();
					void screen.disconnect();
					showToast('Removed from room', ev.message ?? 'You were removed from this room.', 8000);
					void goto(resolve('/rooms'));
				} else {
					// Another user was kicked: drop them from the roster.
					present = present.filter((u) => u.user_id !== ev.user_id);
				}
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
		unread[ch] = 0; // viewing a channel clears its unread badge
		if (!loaded[ch]) {
			loaded = { ...loaded, [ch]: true };
			try {
				await loadMessages(ch);
			} catch (err) {
				error = err instanceof ApiError ? err.message : 'Failed to load messages';
			}
		}
	}

	async function postMessageTo(ch: ChatChannel, body: string) {
		await api.post(`/api/rooms/${roomId}/messages`, { body, channel: ch });
	}
	async function postMessage(body: string) {
		await postMessageTo(channel, body);
	}

	async function toggleLive() {
		if (!detail) return;
		const next = !detail.room.is_live;
		await api.post(`/api/rooms/${roomId}/live`, { is_live: next });
		// `live` event will also arrive over WS; update optimistically too.
		detail = { ...detail, room: { ...detail.room, is_live: next } };
	}

	/**
	 * Connect to LiveKit SFU (self-hosted free open-source or LiveKit Cloud free tier).
	 * Token is minted by our API; URL comes from LIVEKIT_URL env.
	 */
	async function connectLiveKit() {
		try {
			const tok = await api.post<LiveKitToken>(`/api/rooms/${roomId}/livekit-token`);
			// Preflight: catch a down SFU before the client retries/spams console.
			const probe = tok.url.replace(/^ws/i, 'http').replace(/\/$/, '') + '/';
			try {
				await fetch(probe, { mode: 'no-cors', cache: 'no-store' });
			} catch {
				throw new Error(
					`LiveKit SFU unreachable at ${tok.url}. For local free SFU: docker compose up -d livekit`
				);
			}
			await screen.connect(tok.url, tok.token);
			screenDisabled = false;
		} catch (err) {
			if (err instanceof ApiError && err.status === 503) {
				// Server has no LIVEKIT_* config — media disabled until env is set.
				screenDisabled = true;
			} else if (err instanceof ApiError) {
				error = err.message;
			} else {
				const detailMsg = err instanceof Error ? err.message : String(err);
				error = detailMsg
					? `Failed to connect media: ${detailMsg}`
					: 'Failed to connect media (is LiveKit running?)';
			}
		}
	}

	// (Re)hydrate the HTTP-backed lists (alerts, chat, polls). Called on mount and
	// again on every WS RE-connect, so anything broadcast while the socket was down
	// is recovered. A full refetch REPLACES each list with the server's truth, so
	// missed/duplicate events self-heal (no manual de-dupe needed).
	async function resyncRoomState() {
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
		// The off-topic channel is lazy; only refetch it if it was already loaded.
		if (loaded.off_topic) {
			const o = await api.get<ChatItem[]>(`/api/rooms/${roomId}/messages?channel=off_topic`);
			offTopicMessages = [...o].reverse();
		}
	}

	onMount(async () => {
		try {
			detail = await api.get<RoomDetail>(`/api/rooms/${roomId}`);
			// Wire PM context so deep callers (UserInfoModal) can open/send threads and
			// we can mark our own messages.
			setPmContext(roomId, detail.viewer_id);
			await resyncRoomState();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load room';
			return;
		}

		// On reconnect, resync state (best-effort) — recovers events missed during the
		// outage; the next live frame would otherwise be the first thing we see.
		socket = new RoomSocket(roomId, handleEvent, () => {
			void resyncRoomState().catch(() => logEvent('Room state resync after reconnect failed'));
		});
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
		// The first in-room click unblocks autoplay-blocked remote audio (presenter
		// mic / screen audio) — browsers require a user gesture to start playback, so
		// without this members never hear the mic.
		if (screen.audioBlocked) void screen.resumeAudio();
		// Close the screen-share source menu when clicking outside it.
		if (screenMenuOpen && screenMenuEl && !screenMenuEl.contains(e.target as Node)) {
			screenMenuOpen = false;
		}
	}}
/>

<!-- Mounted unconditionally (NOT inside {:else if detail}) so an AV-error toast
     fired during the connect/load window is never dropped before its container
     exists — the toast store is SSR-safe and no-ops on the server. -->
<ToastContainer />

{#if error}
	<div class="banner">
		<a href={resolve('/rooms')}><Icon name="arrow-left" /> Rooms</a> <span>{error}</span>
	</div>
{:else if detail}
	<RoomTopNav
		roomName={detail.room.name}
		userCount={present.length}
		speaker={speakingName}
		recording={recActive}
		onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
		onMobileInfo={() => (showMobileInfo = true)}
		onReload={() => location.reload()}
		actions={stageActions}
		onVolume={(v) => screen.setRemoteAudioVolume(v)}
		onMuteAudio={(m) => screen.muteRemoteAudio(m)}
	/>

	<!-- Surfaces the realtime socket state: green "Connected" flash on reconnect,
	     persistent "Reconnecting…" banner when the WS drops. Treats "no socket
	     yet" (initial load) as connected so it doesn't flash on first paint. -->
	<ConnectionOverlay connected={socket?.connected ?? true} />

	<!-- Browsers block autoplay of the presenter's mic/screen audio until a user
	     gesture. A passing click unblocks it (svelte:window onclick), but a listener
	     who just sits and listens never clicks — so they'd hear nothing. This visible
	     one-tap affordance is the reliable path; it appears only while audio is
	     actually blocked and disappears the moment playback is unlocked. -->
	{#if screen.audioBlocked}
		<button type="button" class="audio-unblock" onclick={() => void screen.resumeAudio()}>
			<Icon name="volume-up" /> Click to enable presenter audio
		</button>
	{/if}

	<div class="room-body">
		{#if screenDisabled}
			<p class="notice">
				Media is unavailable — set LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET on the server
				(local free SFU: <code>docker compose up -d livekit</code>, or LiveKit Cloud free tier keys
				from cloud.livekit.io).
			</p>
		{/if}

		<div class="shell-body">
			<RoomSidebar
				open={sidebarOpen}
				{present}
				canManage={caps?.can_manage_room ?? false}
				{roomId}
				{screen}
				onPlayMedia={playMedia}
				onStopMedia={stopMedia}
				chatConnected={socket?.connected ?? false}
				mediaConnected={screen.connected}
				onReloadUsers={() => void resyncRoomState()}
			/>

			<div class="layout">
				{#key `${layout.position}:${narrow.current}`}
					<!-- Reference as-split declares minsize="0" (report.md:113,153). -->
					<Split direction={splitDir} initial={splitInitial} min={0} collapsePx={100}>
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

	<RecPreview
		open={showRecPreview}
		{roomId}
		onClose={() => (showRecPreview = false)}
		onRecordingChange={(r) => (recActive = r)}
		source={() => screen.recordingSource()}
	/>

	<!-- Reference floating local screen-share preview (app-screenshare-preview,
	     components-media-misc.md:10-66) — renders while the local user shares. -->
	{#if screen.publishing}
		<ScreensharePreview
			publishers={screen.publishers}
			onStop={() => void screen.stopSharing()}
			onShareScreen={() => void screen.startSharing()}
			onShareVirtualCam={() => void screen.startSharingExternalCam()}
		/>
	{/if}

	<AVSettingsModal
		open={micSettingsOpen}
		onClose={() => (micSettingsOpen = false)}
		onChangeDevices={(audioInputId, videoInputId) => {
			if (audioInputId) screen.switchDevice('audioinput', audioInputId);
			if (videoInputId) screen.switchDevice('videoinput', videoInputId);
		}}
		onSave={({ speakerId, audioInputId, videoInputId }) => {
			if (audioInputId) screen.switchDevice('audioinput', audioInputId);
			if (videoInputId) screen.switchDevice('videoinput', videoInputId);
			if (speakerId) screen.switchDevice('audiooutput', speakerId);
		}}
	/>

	<Lightbox />

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
				onclick={() => void screen.stopSharing()}
				title="Stop sharing"
				aria-label="Stop sharing"
			>
				<Icon name="stop-circle" />
			</button>
		{:else}
			<!-- Reference (decoded from the protradingroom Angular bundle main.*.js, the
			     HPe template): a "Start/Stop Screen Sharing" control opening a menu with
			     "Share Screen" → startScreenSharing(512000) = browser getDisplayMedia, and
			     "OBS / XSPLIT/ Share Virtual Cam" → startScreenSharing("camera") =
			     getUserMedia on the virtual-cam device. Labels are verbatim from the bundle. -->
			<div class="ctrl-menu" bind:this={screenMenuEl}>
				<button
					class="ctrl"
					onclick={(e) => toggleShareMenu(e.currentTarget)}
					disabled={!screen.connected}
					title="Start/Stop Screen Sharing"
					aria-label="Start/Stop Screen Sharing"
					aria-haspopup="menu"
					aria-expanded={screenMenuOpen}
				>
					<Icon name="desktop" /><Icon name="caret-down" size={10} />
				</button>
				{#if screenMenuOpen}
					<div
						class="share-menu"
						role="menu"
						style:top="{shareMenuPos.top}px"
						style:left="{shareMenuPos.left}px"
					>
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								screenMenuOpen = false;
								void screen.startSharing();
							}}
						>
							<Icon name="desktop" size={14} /> Share Screen
						</button>
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								screenMenuOpen = false;
								void screen.startSharingExternalCam();
							}}
						>
							<Icon name="video" size={14} /> OBS / XSPLIT/ Share Virtual Cam
						</button>
					</div>
				{/if}
			</div>
		{/if}
		{#if screen.cameraPublishing}
			<button
				class="ctrl stop"
				onclick={() => void screen.stopCamera()}
				title="Stop camera"
				aria-label="Stop camera"
			>
				<Icon name="video-slash" />
			</button>
		{:else}
			<button
				class="ctrl"
				onclick={() => void screen.startCamera()}
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
				onclick={() => void screen.toggleMicMute()}
				title={screen.micMuted ? 'Unmute microphone' : 'Mute microphone'}
				aria-label={screen.micMuted ? 'Unmute microphone' : 'Mute microphone'}
			>
				<Icon name={screen.micMuted ? 'microphone-slash' : 'microphone'} />
			</button>
			<button
				class="ctrl"
				onclick={() => void screen.stopMic()}
				title="Stop microphone"
				aria-label="Stop microphone"
			>
				<Icon name="microphone-slash" />
			</button>
		{:else}
			<button
				class="ctrl"
				onclick={() => void screen.startMic()}
				disabled={!screen.connected}
				title="Microphone"
				aria-label="Microphone"
			>
				<Icon name="microphone" />
			</button>
		{/if}
		<!-- Reference .mic-gear-btn: a tiny gear attached to the mic control
		     (.7rem, #abb0b5, margin-left -7px, hover #fff — presenter capture
		     nav-css.txt:249-250). Opens the AV device settings. -->
		<button
			class="ctrl mic-gear-btn"
			onclick={() => (micSettingsOpen = true)}
			title="Mic settings"
			aria-label="Mic settings"
		>
			<Icon name="cog" size={11} />
		</button>
		<button
			class="ctrl"
			class:live-on={prefs.captionsOverlay}
			onclick={() => setPref('captionsOverlay', !prefs.captionsOverlay)}
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
		{roomId}
		{alerts}
		{messages}
		{offTopicMessages}
		{present}
		{channel}
		{unread}
		reactions={reactionsByTarget}
		canReact={caps?.can_post_message ?? false}
		{onReact}
		canManage={caps?.can_manage_room ?? false}
		onDeleteAlert={(id) =>
			deleteAlert(roomId, id).catch((e) =>
				showToast(
					'Delete failed',
					e instanceof ApiError ? e.message : 'Could not delete alert',
					6000
				)
			)}
		onDeleteMessage={(id) =>
			deleteMessage(roomId, id).catch((e) =>
				showToast(
					'Delete failed',
					e instanceof ApiError ? e.message : 'Could not delete message',
					6000
				)
			)}
		canPostAlert={caps?.can_post_alert ?? false}
		canPostMessage={canChat}
		onPostMessage={postMessage}
		onPostOffTopic={(body) => postMessageTo('off_topic', body)}
		onChannel={selectChannel}
		onCreatePoll={caps?.can_post_alert ? () => (showCreatePoll = true) : undefined}
	/>
{/snippet}

{#snippet stagePane()}
	<MainStage
		{roomId}
		canManage={caps?.can_manage_room ?? false}
		publishers={screen.publishers}
		connected={screen.connected}
		{webcamPublishers}
		{onWebcamClose}
		captionsActive={prefs.captionsOverlay}
		captionSpeaker={liveCaption?.speaker}
		captionText={liveCaption?.text}
		captureCaptions={screen.publishing && prefs.captionsOverlay}
		onCaption={postCaption}
		{screenLocked}
	/>
{/snippet}

<style>
	.room-body {
		/* Clear the 49px fixed top nav, then fill the rest of the viewport.
		   Reference div.wrapper: bg rgb(17,17,17) #111, text #ccc
		   (report.md:103,225). */
		margin-top: 49px;
		height: calc(100vh - 49px);
		display: flex;
		flex-direction: column;
		min-height: 0;
		background: var(--darker-black, #111);
		color: #ccc;
		/* Anchor for the absolute .notice overlay. */
		position: relative;
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
		/* Fixed (not absolute) so it escapes the .nav-controls scroll container's
		   overflow clipping; anchored to the trigger rect via inline top/left.
		   Evidenced picker surface (.screen-options-start-screen, presenter
		   capture stylesheet @692295): WHITE bg, --darker-black text, width
		   350px, padding 5px, 16px, li:hover cursor pointer; shadowless
		   (report.md:3009). */
		position: fixed;
		z-index: 1040; /* above the z-1030 nav */
		width: 350px;
		display: flex;
		flex-direction: column;
		background: #fff;
		color: #111;
		border-radius: 6px;
		padding: 5px;
		font-size: 16px;
	}
	.share-menu button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		color: #111;
		font-size: 16px;
		text-align: left;
		padding: 4px 6px;
		border-radius: 0;
		cursor: pointer;
		white-space: nowrap;
	}
	.share-menu button:hover {
		cursor: pointer;
	}
	/* Reference .mic-gear-btn: .7rem glyph, #abb0b5, pulled -7px against the mic
	   control, hover #fff (nav-css.txt:249-250). */
	.ctrl.mic-gear-btn {
		font-size: 0.7rem;
		color: #abb0b5;
		margin-left: -7px;
		padding: 0;
	}
	.ctrl.mic-gear-btn:hover {
		color: #fff;
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
		z-index: 1040; /* floating layer: above the z-1030 nav, below modals */
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
		z-index: 1040; /* floating layer: above the z-1030 nav, below modals */
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
		/* Overlay (not in-flow) so the split always occupies the full 49px→bottom
		   band (report.md:92). */
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 44;
		background: color-mix(in srgb, var(--warn) 30%, #111);
		border: 1px solid var(--warn);
		color: #ffe9a8;
		padding: 0.5rem 0.75rem;
		border-radius: 0;
		font-size: 0.85rem;
		margin: 0;
	}
	/* One-tap affordance to unblock autoplay-blocked presenter audio. A floating
	   bottom-center pill so it never covers the tab strip / alert header. */
	.audio-unblock {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 45;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--accent, #45a2ff);
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent, #45a2ff) 30%, #111);
		color: var(--text, #fff);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
	}
	.audio-unblock:hover {
		background: color-mix(in srgb, var(--accent, #2563eb) 26%, transparent);
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
