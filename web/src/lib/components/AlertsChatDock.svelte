<script lang="ts">
	import type { ChatChannel } from '$lib/types';
	import AlertFeed, { type AlertItem } from './AlertFeed.svelte';
	import ChatPanel, { type ChatItem } from './ChatPanel.svelte';
	import { DotsSix } from 'phosphor-svelte';

	interface Props {
		alerts: AlertItem[];
		messages: ChatItem[];
		channel: ChatChannel;
		canPostAlert: boolean;
		canPostMessage: boolean;
		onPostAlert: (symbol: string, side: string, note: string) => Promise<void>;
		onPostMessage: (body: string) => Promise<void>;
		onChannel: (channel: ChatChannel) => void;
	}
	let {
		alerts,
		messages,
		channel,
		canPostAlert,
		canPostMessage,
		onPostAlert,
		onPostMessage,
		onChannel
	}: Props = $props();

	const DEFAULT_WIDTH = 360;
	const MIN_WIDTH = 280;
	const MAX_WIDTH = 620;
	const MIN_FRACTION = 0.15;
	const MAX_FRACTION = 0.85;
	const WIDTH_KEY = 'acdock.width';
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

	let columnWidth = $state(clamp(loadNumber(WIDTH_KEY, DEFAULT_WIDTH), MIN_WIDTH, MAX_WIDTH));
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
		window.localStorage.setItem(WIDTH_KEY, String(columnWidth));
	});
	$effect(() => {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(FRACTION_KEY, String(alertsFraction));
	});

	function startWidthDrag(e: PointerEvent) {
		e.preventDefault();
		dragging = true;
		const move = (ev: PointerEvent) => {
			if (!columnEl) return;
			const left = columnEl.getBoundingClientRect().left;
			columnWidth = clamp(ev.clientX - left, MIN_WIDTH, MAX_WIDTH);
		};
		const up = () => {
			dragging = false;
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	}

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

	function resetWidth() {
		columnWidth = DEFAULT_WIDTH;
	}
	function resetHeight() {
		alertsFraction = 0.5;
	}
</script>

<div
	class="dock"
	class:dragging
	{@attach bindColumn}
	style="width: {columnWidth}px; --alerts-fr: {alertsFraction};"
>
	<div class="alerts-pane">
		<AlertFeed {alerts} canPost={canPostAlert} onPost={onPostAlert} />
	</div>

	<div
		class="hsplit"
		role="separator"
		aria-orientation="horizontal"
		aria-label="Resize alerts and chat"
		onpointerdown={startHeightDrag}
		ondblclick={resetHeight}
	>
		<span class="hgrab"><DotsSix size={16} weight="bold" /></span>
	</div>

	<div class="chat-pane">
		<ChatPanel {messages} {channel} canPost={canPostMessage} onPost={onPostMessage} {onChannel} />
	</div>

	<div
		class="vsplit"
		role="separator"
		aria-orientation="vertical"
		aria-label="Resize column width"
		onpointerdown={startWidthDrag}
		ondblclick={resetWidth}
	>
		<span class="vgrab"><DotsSix size={16} weight="bold" /></span>
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
		height: 100%;
		min-height: 0;
		flex-shrink: 0;
		border-radius: 8px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
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
		height: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: row-resize;
		background: #eef0f4;
		border-top: 1px solid #dfe2ea;
		border-bottom: 1px solid #dfe2ea;
		touch-action: none;
	}
	.hgrab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #9aa1b0;
		pointer-events: none;
	}
	.hsplit:hover {
		background: #e3e6ee;
	}

	.vsplit {
		position: absolute;
		top: 0;
		right: -3px;
		width: 12px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: col-resize;
		touch-action: none;
		z-index: 2;
	}
	.vgrab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 12px;
		height: 34px;
		border-radius: 6px;
		background: #cfd4de;
		color: #6b7180;
		transform: rotate(90deg);
		pointer-events: none;
	}
	.vsplit:hover .vgrab {
		background: #b6bcc9;
	}
</style>
