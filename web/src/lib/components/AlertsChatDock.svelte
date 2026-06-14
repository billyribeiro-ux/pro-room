<script lang="ts">
	import type { ChatChannel, PresentUser, ReactionTally, ReactionTarget } from '$lib/types';
	import AlertFeed, { type AlertItem } from './AlertFeed.svelte';
	import ChatPanel, { type ChatItem } from './ChatPanel.svelte';

	interface Props {
		alerts: AlertItem[];
		messages: ChatItem[];
		channel: ChatChannel;
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
		onChannel: (channel: ChatChannel) => void;
		/** Current user's id — forwarded to ChatPanel to right-align own messages. */
		meId?: string;
	}
	let {
		alerts,
		messages,
		channel,
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
		onChannel,
		meId
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

	let alertsFraction = $state(clamp(loadNumber(FRACTION_KEY, 0.5), MIN_FRACTION, MAX_FRACTION));
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
		alertsFraction = 0.5;
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

	<div class="chat-pane">
		<ChatPanel
			{messages}
			{present}
			{channel}
			{reactions}
			{canReact}
			{onReact}
			{canManage}
			onDelete={onDeleteMessage}
			canPost={canPostMessage}
			onPost={onPostMessage}
			{onChannel}
			{meId}
		/>
	</div>
</div>

<style>
	.dock {
		position: relative;
		display: grid;
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
		background: #ffffff;
	}
	.dock.dragging {
		user-select: none;
	}
	.alerts-pane,
	.chat-pane {
		min-height: 0;
		overflow: hidden;
	}

	.hsplit {
		position: relative;
		height: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: row-resize;
		/* Reference as-split-gutter is rgb(10, 109, 177) = #0a6db1, same as the
		   outer <Split> gutter — a solid blue bar, not a grey divider. */
		background: #0a6db1;
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
