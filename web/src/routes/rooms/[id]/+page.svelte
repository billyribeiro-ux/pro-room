<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { api, ApiError } from '$lib/api';
	import { ScreenShareRoom } from '$lib/livekit.svelte';
	import { RoomSocket } from '$lib/realtime.svelte';
	import type {
		Alert,
		LiveKitToken,
		Message,
		PresentUser,
		RoomDetail,
		RoomEvent
	} from '$lib/types';
	import ScreenStage from '$lib/components/ScreenStage.svelte';
	import AlertFeed, { type AlertItem } from '$lib/components/AlertFeed.svelte';
	import ChatPanel, { type ChatItem } from '$lib/components/ChatPanel.svelte';
	import PresenceBar from '$lib/components/PresenceBar.svelte';
	import MembersPanel from '$lib/components/MembersPanel.svelte';
	import { Broadcast, MonitorPlay, StopCircle, Gear, ArrowLeft } from 'phosphor-svelte';

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	let detail = $state<RoomDetail | null>(null);
	let alerts = $state<AlertItem[]>([]);
	let messages = $state<ChatItem[]>([]);
	let present = $state<PresentUser[]>([]);
	let error = $state<string | null>(null);
	let screenDisabled = $state(false);
	let showMembers = $state(false);

	const screen = new ScreenShareRoom();
	let socket: RoomSocket | null = null;

	const caps = $derived(detail?.capabilities);

	function handleEvent(ev: RoomEvent) {
		switch (ev.type) {
			case 'alert':
				alerts = [{ ...ev.alert, author_name: ev.author_name }, ...alerts].slice(0, 100);
				break;
			case 'chat':
				messages = [...messages, { ...ev.message, author_name: ev.author_name }].slice(-100);
				break;
			case 'presence':
				present = ev.users;
				break;
			case 'live':
				if (detail) detail = { ...detail, room: { ...detail.room, is_live: ev.is_live } };
				break;
		}
	}

	async function postAlert(symbol: string, side: string, note: string) {
		await api.post(`/api/rooms/${roomId}/alerts`, { symbol, side, note: note || null });
	}

	async function postMessage(body: string) {
		await api.post(`/api/rooms/${roomId}/messages`, { body });
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
			const [a, m] = await Promise.all([
				api.get<Alert[]>(`/api/rooms/${roomId}/alerts`),
				api.get<Message[]>(`/api/rooms/${roomId}/messages`)
			]);
			alerts = a;
			messages = [...m].reverse();
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
		<a href={resolve('/rooms')}><ArrowLeft size={16} /> Rooms</a> <span>{error}</span>
	</div>
{:else if detail}
	<header class="room-head">
		<a class="back" href={resolve('/rooms')}><ArrowLeft size={18} /></a>
		<h1>{detail.room.name}</h1>
		{#if detail.room.is_live}
			<span class="live"><Broadcast size={13} weight="fill" /> LIVE</span>
		{/if}
		<div class="spacer"></div>
		<PresenceBar users={present} />

		<div class="controls">
			{#if caps?.can_publish_screen && !screenDisabled}
				{#if screen.publishing}
					<button class="ctrl stop" onclick={() => screen.stopSharing()}>
						<StopCircle size={16} weight="fill" /> Stop sharing
					</button>
				{:else}
					<button class="ctrl" onclick={() => screen.startSharing()} disabled={!screen.connected}>
						<MonitorPlay size={16} /> Share screen
					</button>
				{/if}
			{/if}
			{#if caps?.can_manage_room}
				<button class="ctrl" class:live-on={detail.room.is_live} onclick={toggleLive}>
					<Broadcast size={16} weight={detail.room.is_live ? 'fill' : 'regular'} />
					{detail.room.is_live ? 'End broadcast' : 'Go live'}
				</button>
			{/if}
			{#if caps?.can_manage_members}
				<button class="ctrl" onclick={() => (showMembers = !showMembers)}>
					<Gear size={16} /> Members
				</button>
			{/if}
		</div>
	</header>

	{#if screenDisabled}
		<p class="notice">
			Screen sharing is unavailable — the server has no LiveKit credentials configured.
		</p>
	{/if}

	<div class="layout">
		<div class="stage-col">
			<ScreenStage publishers={screen.publishers} connected={screen.connected} />
		</div>
		<aside class="side-col">
			<AlertFeed {alerts} canPost={caps?.can_post_alert ?? false} onPost={postAlert} />
			<ChatPanel {messages} canPost={caps?.can_post_message ?? false} onPost={postMessage} />
		</aside>
	</div>

	{#if showMembers && caps?.can_manage_members}
		<MembersPanel {roomId} onClose={() => (showMembers = false)} />
	{/if}
{:else}
	<p class="dim">Loading room…</p>
{/if}

<style>
	.room-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	.back {
		display: inline-flex;
		color: var(--text-dim);
	}
	.back:hover {
		color: var(--text);
	}
	h1 {
		margin: 0;
		font-size: 1.3rem;
	}
	.live {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--negative);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}
	.spacer {
		flex: 1;
	}
	.controls {
		display: flex;
		gap: 0.5rem;
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
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 1rem;
		height: calc(100vh - 170px);
	}
	.stage-col {
		min-height: 0;
	}
	.side-col {
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 1rem;
		min-height: 0;
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
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
			height: auto;
		}
	}
</style>
