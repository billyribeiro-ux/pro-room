<script lang="ts">
	import type { ChatChannel, PresentUser, ReactionTally, ReactionTarget } from '$lib/types';
	import AlertFeed, { type AlertItem } from './AlertFeed.svelte';
	import ChatPanel, { type ChatItem } from './ChatPanel.svelte';
	import { prefs } from '$lib/stores/prefs.svelte';

	interface Props {
		/** Room id — forwarded to the chat composers for inline image uploads. */
		roomId: string;
		alerts: AlertItem[];
		messages: ChatItem[];
		/** Off-topic channel history — rendered as the second column when the
		    "Extra chat column" preference is on. */
		offTopicMessages?: ChatItem[];
		channel: ChatChannel;
		/** Per-channel unread counts for the chat tab badges. */
		unread?: Record<ChatChannel, number>;
		present: PresentUser[];
		/** Aggregated reactions keyed `${target_kind}:${target_id}`. */
		reactions?: Record<string, ReactionTally[]>;
		canReact?: boolean;
		onReact?: (targetKind: ReactionTarget, targetId: string, emoji: string) => void;
		/** Admin: delete any alert/message (shown in the row menu when canManage). */
		canManage?: boolean;
		onDeleteAlert?: (id: string) => void;
		onDeleteMessage?: (id: string) => void;
		canPostAlert: boolean;
		canPostMessage: boolean;
		onPostAlert: (symbol: string, side: string, note: string) => Promise<void>;
		onPostMessage: (body: string) => Promise<void>;
		/** Post into the off-topic channel (used by the extra column). */
		onPostOffTopic?: (body: string) => Promise<void>;
		onChannel: (channel: ChatChannel) => void;
	}
	let {
		roomId,
		alerts,
		messages,
		offTopicMessages = [],
		channel,
		unread,
		present,
		reactions = {},
		canReact = false,
		onReact,
		canManage = false,
		onDeleteAlert,
		onDeleteMessage,
		canPostAlert,
		canPostMessage,
		onPostAlert,
		onPostMessage,
		onPostOffTopic,
		onChannel
	}: Props = $props();

	// The column's WIDTH is now owned by the outer <Split> gutter in the room
	// shell; the dock just fills its pane. Only the internal alerts/chat split
	// fraction lives here.
	const MIN_FRACTION = 0.15;
	const MAX_FRACTION = 0.85;
	const FRACTION_KEY = 'acdock.fraction';

	function loadNumber(key: string, fallback: number): number {
		if (typeof window === 'undefined') return fallback;
		const raw = window.localStorage.getItem(key);
		if (raw === null) return fallback;
		const n = Number(raw);
		return Number.isFinite(n) ? n : fallback;
	}

	function clamp(n: number, lo: number, hi: number): number {
		return Math.min(hi, Math.max(lo, n));
	}

	// Reference dock is alerts-dominant: the alert-chat-box vertical split puts the
	// alerts pane at ~0.814 of the column height (capture), not an even 50/50.
	let alertsFraction = $state(clamp(loadNumber(FRACTION_KEY, 0.814), MIN_FRACTION, MAX_FRACTION));
	let dragging = $state(false);

	let columnEl: HTMLDivElement | null = null;
	const bindColumn = (node: HTMLDivElement) => {
		columnEl = node;
		return () => {
			columnEl = null;
		};
	};

	$effect(() => {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(FRACTION_KEY, String(alertsFraction));
	});

	function startHeightDrag(e: PointerEvent) {
		e.preventDefault();
		dragging = true;
		const move = (ev: PointerEvent) => {
			if (!columnEl) return;
			const rect = columnEl.getBoundingClientRect();
			const frac = (ev.clientY - rect.top) / rect.height;
			alertsFraction = clamp(frac, MIN_FRACTION, MAX_FRACTION);
		};
		const up = () => {
			dragging = false;
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	}

	function resetHeight() {
		alertsFraction = 0.814;
	}
</script>

<div class="dock" class:dragging {@attach bindColumn} style="--alerts-fr: {alertsFraction};">
	<div class="alerts-pane">
		<AlertFeed
			{alerts}
			{present}
			{reactions}
			{canReact}
			{onReact}
			{canManage}
			onDelete={onDeleteAlert}
			canPost={canPostAlert}
			onPost={onPostAlert}
		/>
	</div>

	<div
		class="hsplit"
		role="separator"
		aria-orientation="horizontal"
		aria-label="Resize alerts and chat"
		onpointerdown={startHeightDrag}
		ondblclick={resetHeight}
	>
		<span class="hgrab" aria-hidden="true"></span>
	</div>

	<div class="chat-pane" class:two-col={prefs.extraChatColumn}>
		<div class="chat-col">
			<ChatPanel
				{roomId}
				{messages}
				{present}
				{channel}
				{unread}
				{reactions}
				{canReact}
				{onReact}
				{canManage}
				onDelete={onDeleteMessage}
				canPost={canPostMessage}
				onPost={onPostMessage}
				{onChannel}
			/>
		</div>
		{#if prefs.extraChatColumn}
			<!-- "Extra chat column" (reference extraChatColumn): a second pane locked to
			     the Off-Topic channel, shown alongside the main one. -->
			<div class="chat-col">
				<ChatPanel
					{roomId}
					messages={offTopicMessages}
					{present}
					channel="off_topic"
					{reactions}
					{canReact}
					{onReact}
					{canManage}
					onDelete={onDeleteMessage}
					canPost={canPostMessage}
					onPost={onPostOffTopic ?? onPostMessage}
					onChannel={() => {}}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	.dock {
		position: relative;
		display: grid;
		/* Explicit full-width-but-shrinkable column. Without this the implicit grid
		   column is `auto` (content-sized); the two-column chat pane has flex
		   children that shrink to 0 min-content, which collapses an auto column to
		   ~0. minmax(0, 1fr) pins it to the dock width while still letting the inner
		   flex columns split. Single-column layout is unchanged (still full width). */
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows:
			minmax(80px, calc(var(--alerts-fr, 0.5) * 100%))
			auto
			minmax(80px, 1fr);
		width: 100%;
		height: 100%;
		min-height: 0;
		min-width: 0;
		/* Reference alert-chat-box is a FLAT surface (border-radius: 0). The dock
		   sits flush against the flat blue split gutter on its right edge — any
		   rounded corner here leaks past the gutter (the "round right radius next
		   to the flat bar" glitch). Keep overflow:hidden so the square blue header
		   children stay clipped to the panel box. No box-shadow in the reference. */
		border-radius: 0;
		overflow: hidden;
		background: var(--content-bg);
	}
	.dock.dragging {
		user-select: none;
	}
	.alerts-pane,
	.chat-pane {
		min-height: 0;
		overflow: hidden;
	}
	/* Each chat column fills its pane. In single-column mode there's just one,
	   filling the whole chat-pane (no layout change from before). */
	.chat-col {
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}
	/* "Extra chat column": split the chat pane into two equal side-by-side columns
	   (main + off-topic) with a thin reference divider between them. */
	.chat-pane.two-col {
		display: flex;
		flex-direction: row;
	}
	.chat-pane.two-col .chat-col {
		flex: 1 1 0;
		min-width: 0;
	}
	.chat-pane.two-col .chat-col + .chat-col {
		border-left: 1px solid var(--content-border);
	}

	.hsplit {
		position: relative;
		height: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: row-resize;
		/* Reference as-split-gutter is the dark split gutter (--split-gutter-bg #000), same as the
		   outer <Split> gutter — a solid blue bar, not a grey divider. */
		background: var(--bg);
		touch-action: none;
		user-select: none;
	}
	.hgrab {
		/* Exact reference grip: angular-split `as-split-gutter-icon` — a centered
		   30x5 PNG of three light-grey dots, HORIZONTAL for this row-resize gutter.
		   Same data-URI the reference ships (not a Font Awesome glyph). */
		width: 100%;
		height: 100%;
		background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC');
		background-position: 50% 50%;
		background-repeat: no-repeat;
		pointer-events: none;
	}
	.hsplit:hover {
		filter: brightness(1.15);
	}
</style>
