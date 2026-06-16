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
					<button class="btn btn-sm btn-dark" type="button" title="Zoom">
						<Icon name="search" size={14} class="icon" />
					</button>
					<button class="btn btn-sm btn-dark" type="button" title="Snapshot">
						<Icon name="camera" size={14} class="icon" />
					</button>
					<button class="btn btn-sm btn-dark" type="button" title="Fullscreen">
						<Icon name="expand" size={14} class="icon" />
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
				<div
					class="screencast-pan"
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
					<div class="video-screen-container">
						<video {@attach track(active.track)} autoplay muted playsinline></video>
					</div>
				</div>
			{/key}
		{:else}
			<div class="empty">
				{connected ? 'Waiting for a presenter to share their screen…' : 'Connecting…'}
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
		font-size: 0.820312rem;
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
		place-items: center;
		/* presentation-box bg: var(--presenter-area-bg) #0f2e43. */
		background: #0f2e43;
		color: var(--text-dim);
		font-size: 0.9rem;
		padding: 2rem;
		text-align: center;
	}

	/* .screencast-pan — clips pan/zoom; grab cursor; #000 behind letterbox bars. */
	.screencast-pan {
		position: relative;
		height: 100%;
		overflow: hidden;
		cursor: grab;
		background: #000;
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
		z-index: 1999;
		width: inherit;
		height: inherit;
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
