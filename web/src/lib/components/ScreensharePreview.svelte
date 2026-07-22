<script lang="ts">
	import type { SharePublisher } from '$lib/livekit.svelte';
	import type { Attachment } from 'svelte/attachments';
	import Icon from './Icon.svelte';

	interface Props {
		/** All share publishers; the preview renders the LOCAL one. */
		publishers: SharePublisher[];
		/** Stop the local share (the card's ✕, reference fa-times close). */
		onStop: () => void;
		/** Switch source: browser screen vs OBS/XSplit virtual cam. */
		onShareScreen: () => void;
		onShareVirtualCam: () => void;
	}
	let { publishers, onStop, onShareScreen, onShareVirtualCam }: Props = $props();

	const local = $derived(publishers.find((p) => p.isLocal) ?? null);

	let sourceOpen = $state(false);

	// Draggable like the reference's jQuery-UI draggable card.
	let dx = $state(0);
	let dy = $state(0);
	let dragging = $state(false);
	let sx = 0;
	let sy = 0;
	let bx = 0;
	let by = 0;
	function onDown(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button')) return;
		dragging = true;
		sx = e.clientX;
		sy = e.clientY;
		bx = dx;
		by = dy;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onMove(e: PointerEvent) {
		if (!dragging) return;
		dx = bx + (e.clientX - sx);
		dy = by + (e.clientY - sy);
	}
	function onUp() {
		dragging = false;
	}

	function attachTrack(t: MediaStreamTrack | null | undefined): Attachment<HTMLVideoElement> {
		return (node) => {
			if (!t || typeof MediaStream === 'undefined') return;
			node.srcObject = new MediaStream([t]);
			node.muted = true;
			void node.play().catch(() => {
				/* preview autoplay is best-effort */
			});
			return () => {
				node.srcObject = null;
			};
		};
	}
</script>

{#if local}
	<!-- Reference app-screenshare-preview: #screenshareLocalPreviewHolder.card
	     .webcamsHolderScreen — a 350x260 fixed bottom-right draggable card with a
	     source-picker dropdown button and an fa-times close
	     (components-media-misc.md:10-66). -->
	<aside
		class="card"
		class:dragging
		style:transform="translate({dx}px, {dy}px)"
		aria-label="Screen share preview"
		onpointerdown={onDown}
		onpointermove={onMove}
		onpointerup={onUp}
		onpointercancel={onUp}
	>
		<div class="bar">
			<span class="src">
				<button
					type="button"
					class="src-btn"
					aria-haspopup="menu"
					aria-expanded={sourceOpen}
					title="Change share source"
					onclick={() => (sourceOpen = !sourceOpen)}
				>
					Source <Icon name="caret-down" size={10} />
				</button>
				{#if sourceOpen}
					<div class="src-menu" role="menu">
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								sourceOpen = false;
								onShareScreen();
							}}>Share Screen</button
						>
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								sourceOpen = false;
								onShareVirtualCam();
							}}>OBS / XSPLIT/ Share Virtual Cam</button
						>
					</div>
				{/if}
			</span>
			<button type="button" class="close" onclick={onStop} aria-label="Stop sharing" title="Close">
				<Icon name="times" size={16} />
			</button>
		</div>
		<video {@attach attachTrack(local.track)} autoplay muted playsinline></video>
	</aside>
{/if}

<style>
	.card {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 105;
		width: 350px;
		height: 260px;
		display: flex;
		flex-direction: column;
		background: #000;
		border: 1px solid var(--border, #444);
		border-radius: 6px;
		overflow: hidden;
		cursor: move;
		touch-action: none;
		user-select: none;
	}
	.card.dragging {
		z-index: 200;
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2px 5px;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		flex-shrink: 0;
	}
	.src {
		position: relative;
		display: inline-flex;
	}
	/* Reference source picker: button#dropdownBasic1.dropdown-toggle
	   .btn-outline-dark (components-media-misc.md:24). */
	.src-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: transparent;
		border: 1px solid #6c757d;
		color: #fff;
		border-radius: 4px;
		font-size: 12px;
		padding: 1px 6px;
		cursor: pointer;
	}
	.src-menu {
		position: absolute;
		bottom: calc(100% + 2px);
		left: 0;
		z-index: 1000;
		min-width: 220px;
		/* Evidenced picker surface: white, --darker-black text, padding 5px, 16px
		   (.screen-options-start-screen, presenter capture stylesheet @692295). */
		background: #fff;
		color: #111;
		border-radius: 6px;
		padding: 5px;
		font-size: 16px;
		display: flex;
		flex-direction: column;
	}
	.src-menu button {
		background: transparent;
		border: none;
		color: #111;
		text-align: left;
		padding: 4px 6px;
		cursor: pointer;
		white-space: nowrap;
	}
	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #fff;
		padding: 0 2px;
		cursor: pointer;
	}
	video {
		flex: 1;
		width: 100%;
		min-height: 0;
		object-fit: contain;
		background: transparent;
	}
</style>
