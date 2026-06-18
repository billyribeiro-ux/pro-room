<script lang="ts">
	import type { SharePublisher } from '$lib/livekit.svelte';
	import type { Track } from 'livekit-client';
	import type { Attachment } from 'svelte/attachments';
	import Icon from './Icon.svelte';

	interface Props {
		publishers: SharePublisher[];
		connected: boolean;
	}
	let { publishers, connected }: Props = $props();

	// The reference renders one sub-tab pill per shared screen; selecting a pill
	// swaps which publisher fills the single pan/zoom video surface below.
	let selected = $state<string | null>(null);

	// The publisher shown in the surface: the selected one, else the first.
	const active = $derived(publishers.find((p) => p.identity === selected) ?? publishers[0] ?? null);

	// Attachment that binds a LiveKit track to a <video> element. Re-runs (with
	// cleanup) automatically when the track changes.
	function track(t: Track): Attachment<HTMLVideoElement> {
		return (node) => {
			t.attach(node);
			return () => {
				t.detach(node);
			};
		};
	}

	// We render initials (no external gravatar requests, consistent with the rest
	// of the app) in the reference's 20×20 presenter-img box.
	function initials(name: string | undefined): string {
		const n = (name ?? '?').trim();
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '?';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function fullScreen(node: HTMLElement) {
		if (document.fullscreenElement) {
			void document.exitFullscreen();
		} else {
			void node.requestFullscreen?.();
		}
	}

	// --- Stage controls: zoom (+ drag-to-pan), snapshot, fullscreen -----------
	let videoEl = $state<HTMLVideoElement | null>(null);
	let panEl = $state<HTMLElement | null>(null);
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);

	const ZOOM_STEPS = [1, 1.5, 2, 3];
	/** Search/zoom icon cycles the zoom level; resets pan at 1×. */
	function cycleZoom() {
		const i = ZOOM_STEPS.indexOf(zoom);
		zoom = ZOOM_STEPS[(i + 1) % ZOOM_STEPS.length];
		if (zoom === 1) {
			panX = 0;
			panY = 0;
		}
	}

	// Reset zoom/pan when the active screen changes.
	$effect(() => {
		void active?.identity;
		zoom = 1;
		panX = 0;
		panY = 0;
	});

	// Drag-to-pan once zoomed in. Plain (non-reactive) refs — only read in handlers.
	let dragging = false;
	let startX = 0;
	let startY = 0;
	let baseX = 0;
	let baseY = 0;
	function onPanDown(e: PointerEvent) {
		if (zoom <= 1) return;
		dragging = true;
		startX = e.clientX;
		startY = e.clientY;
		baseX = panX;
		baseY = panY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onPanMove(e: PointerEvent) {
		if (!dragging) return;
		panX = baseX + (e.clientX - startX);
		panY = baseY + (e.clientY - startY);
	}
	function onPanUp() {
		dragging = false;
	}

	/** Snapshot the current video frame → download a PNG. */
	function snapshot() {
		const v = videoEl;
		if (!v || !v.videoWidth) return;
		const canvas = document.createElement('canvas');
		canvas.width = v.videoWidth;
		canvas.height = v.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(v, 0, 0);
		canvas.toBlob((blob) => {
			if (!blob) return;
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = `proom-screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
			a.click();
			URL.revokeObjectURL(a.href);
		}, 'image/png');
	}

	function toggleFullscreen() {
		if (panEl) fullScreen(panEl);
	}
</script>

<div class="screens">
	<!-- Per-screen sub-tab strip (#screenTabs): one pill per publisher, plus a
	     right-aligned zoom/snapshot/fullscreen control group (li.ms-auto). -->
	<ul class="screens-tabs" role="tablist">
		{#each publishers as pub (pub.identity)}
			{@const isActive = active?.identity === pub.identity}
			<li class="nav-item" role="presentation">
				<button
					class="nav-link"
					class:active={isActive}
					role="tab"
					aria-selected={isActive}
					onclick={() => (selected = pub.identity)}
				>
					<span class="presenter-img" aria-hidden="true">{initials(pub.name)}</span>
					<span class="mx-1">{pub.name}{pub.isLocal ? ' (you)' : ''}</span>
					<span class="d-inline-block">
						<span class="dropdown-toggle" aria-expanded="false" aria-hidden="true">
							<Icon name="cog" size={12} />
						</span>
					</span>
				</button>
			</li>
		{/each}

		{#if active}
			<li class="nav-item ms-auto" role="presentation">
				<div class="zoom-controls-container">
					<button
						class="btn btn-sm btn-dark"
						type="button"
						title="Zoom ({zoom}×)"
						aria-label="Zoom"
						onclick={cycleZoom}
					>
						<Icon name="search" size={14} class="icon" />
					</button>
					<button
						class="btn btn-sm btn-dark"
						type="button"
						title="Snapshot"
						aria-label="Snapshot"
						onclick={snapshot}
					>
						<Icon name="camera" size={14} class="icon" />
					</button>
					<button
						class="btn btn-sm btn-dark"
						type="button"
						title="Fullscreen"
						aria-label="Fullscreen"
						onclick={toggleFullscreen}
					>
						<!-- Reference fullscreen control uses fa-compress-arrows-alt (the
						     four-arrows-inward glyph), not fa-expand — matched to the bundle. -->
						<Icon name="compress-arrows-alt" size={14} class="icon" />
					</button>
				</div>
			</li>
		{/if}
	</ul>

	<!-- Video viewport (#screensTabsContent): a single pan/zoom surface showing
	     the selected publisher; double-click toggles fullscreen. -->
	<div class="tabs-content">
		{#if active}
			{#key active.identity}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="screencast-pan"
					class:zoomed={zoom > 1}
					bind:this={panEl}
					onpointerdown={onPanDown}
					onpointermove={onPanMove}
					onpointerup={onPanUp}
					onpointercancel={onPanUp}
					{@attach (node) => {
						const ondbl = () => fullScreen(node);
						node.addEventListener('dblclick', ondbl);
						return () => node.removeEventListener('dblclick', ondbl);
					}}
				>
					<div class="pan-zoom-frame">
						<div class="pan-element">
							<div class="zoom-element"></div>
						</div>
					</div>
					<div
						class="video-screen-container"
						style:transform="translate({panX}px, {panY}px) scale({zoom})"
					>
						<video bind:this={videoEl} {@attach track(active.track)} autoplay muted playsinline
						></video>
					</div>
				</div>
			{/key}
		{:else}
			<!-- Reference presenter-absent copy (h3.text-center): "No one is presenting
			     right now...". -->
			<div class="empty">
				{connected ? 'No one is presenting right now...' : 'Connecting…'}
			</div>
		{/if}
	</div>
</div>

<style>
	.screens {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 360px;
		/* presentation-box bg: var(--presenter-area-bg) #0f2e43 (idle/letterbox base). */
		background: #0f2e43;
		overflow: hidden;
	}

	/* #screenTabs ul.nav-tabs.screens-tabs — flat navy strip, 40px tall. */
	.screens-tabs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		margin: 0;
		padding: 0;
		list-style: none;
		min-height: 40px;
		/* var(--notes-tabs-bg) #0c2434; flat (transparent border); above video (z 1). */
		background-color: #0c2434;
		border-color: transparent;
		position: relative;
		z-index: 1;
	}
	.nav-item {
		display: block;
	}

	/* .screens-tabs .nav-link — per-screen pill. Base padding overridden to 4px. */
	.nav-link {
		display: flex;
		align-items: center;
		margin: 5px;
		padding: 4px;
		font-size: 12px;
		line-height: 12px;
		font-weight: 300;
		color: #ffffff;
		background: transparent;
		/* Reserve a 1px transparent border so the hover border doesn't shift layout. */
		border: 1px solid transparent;
		border-radius: 3px;
		cursor: pointer;
		transition:
			color 0.15s ease-in-out,
			background-color 0.15s ease-in-out,
			border-color 0.15s ease-in-out;
	}
	.nav-link:hover {
		/* hover (inactive): 1px solid var(--tabs-border-color) #0a6db1; radius 3px. */
		border-color: #0a6db1;
	}
	.nav-link.active {
		/* active: var(--tab-active-bg) #45a2ff; border transparent; #fff text. */
		background-color: #45a2ff;
		border-color: transparent;
		color: #ffffff;
	}
	.nav-link.active:hover {
		cursor: default;
		border-color: transparent;
	}

	/* presenter-img — fixed 20×20 square initials avatar (reference is a 20×20
	   gravatar; we render initials, no external request, square per
	   --rosterImg-border-radius: 0). */
	.presenter-img {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 20px;
		width: 20px;
		height: 20px;
		background: var(--bg-elev-2);
		color: #ffffff;
		font-size: 9px;
		font-weight: 700;
		border-radius: 0;
	}
	/* span.mx-1 — presenter name, .25rem horizontal margin. */
	.mx-1 {
		margin-left: 0.25rem;
		margin-right: 0.25rem;
		color: #ffffff;
		font-size: 12px;
	}
	.d-inline-block {
		display: inline-block;
	}

	/* span#dropdownMenuScreen.dropdown-toggle — cog + Bootstrap caret triangle. */
	.dropdown-toggle {
		display: inline-flex;
		align-items: center;
		color: inherit;
	}
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

	/* li.ms-auto — pushes the zoom group to the far right. */
	.ms-auto {
		margin-left: auto;
	}

	/* .zoom-controls-container — transparent, dimmed (opacity .5) idle. */
	.zoom-controls-container {
		display: inline-flex;
		align-items: center;
		background-color: transparent;
		opacity: 0.5;
		z-index: 10;
		margin-top: 4px;
		position: relative;
	}

	/* Bootstrap 5 .btn .btn-sm .btn-dark — the reference COMPUTED fill is
	   --bs-dark #212529 with white text (admin-room capture), NOT the app's
	   --dark #adb5bd light gray (that was the wrong token). */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		cursor: pointer;
		transition:
			color 0.15s ease-in-out,
			background-color 0.15s ease-in-out,
			border-color 0.15s ease-in-out;
	}
	.btn-sm {
		padding: 0.25rem 0.5rem;
		/* Bootstrap 5 .btn-sm default (bundle: .btn-sm{font-size:.875rem}). */
		font-size: 0.875rem;
		line-height: 1.5;
		border-radius: 0.2rem;
	}
	.btn-dark {
		color: #ffffff;
		background-color: #212529;
		border-color: #212529;
	}
	/* The three control icons: FA 14px, white (currentColor overridden white). */
	.zoom-controls-container :global(.icon) {
		color: #ffffff;
	}

	/* #screensTabsContent — video viewport below the strip. */
	.tabs-content {
		flex: 1;
		min-height: 0;
		position: relative;
	}

	.empty {
		height: 100%;
		display: grid;
		/* Reference is an <h3 class="text-center mt-4"> — a heading near the TOP,
		   horizontally centered (not vertically centered in the viewport). */
		place-items: start center;
		/* presentation-box bg: var(--presenter-area-bg) #0f2e43. */
		background: #0f2e43;
		color: var(--text-dim);
		font-size: 1.3rem;
		font-weight: 400;
		padding: 2rem 2rem 0;
		text-align: center;
	}

	/* .screencast-pan — clips pan/zoom; grab cursor; #000 behind letterbox bars. */
	.screencast-pan {
		position: relative;
		height: 100%;
		overflow: hidden;
		cursor: default;
		background: #000;
	}
	.screencast-pan.zoomed {
		cursor: grab;
	}
	.screencast-pan.zoomed:active {
		cursor: grabbing;
	}
	.pan-zoom-frame {
		position: static;
		height: inherit;
		width: 100%;
	}
	.pan-element {
		position: absolute;
		transform: matrix(1, 0, 0, 1, 0, 0);
		height: inherit;
		width: 100%;
	}
	.zoom-element {
		transform: matrix(1, 0, 0, 1, 0, 0);
		height: inherit;
		width: 100%;
	}
	.video-screen-container {
		position: relative;
		top: 0;
		left: 0;
		/* Reference has no high z-index here; as the last positioned child of
		   .screencast-pan it naturally stacks above the pan/zoom scaffold. */
		width: inherit;
		height: inherit;
		/* Zoom/pan from the centre, applied via inline transform on this box. */
		transform-origin: center center;
		transition: transform 0.12s ease-out;
	}
	/* video.webcamScreen — fills, contains, no own pointer events. */
	video {
		width: 100%;
		height: 100%;
		object-fit: contain;
		vertical-align: top;
		pointer-events: none;
		max-height: 100vh;
	}
</style>
