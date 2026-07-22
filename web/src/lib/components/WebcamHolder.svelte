<script lang="ts">
	import Icon from './Icon.svelte';
	import { prefs } from '$lib/stores/prefs.svelte';
	import type { Attachment } from 'svelte/attachments';

	/** A single presenter publishing a camera feed. */
	interface Publisher {
		id: string;
		name?: string;
		track?: MediaStreamTrack | null;
		/** True for the local user's own camera tile. */
		isLocal?: boolean;
	}

	interface Props {
		publishers: Publisher[];
		/** The × on every tile (reference span.closeIcon on each card,
		    report.md:1010-1011,1143). The parent decides semantics: stop the local
		    cam, or hide a remote tile for this viewer only. */
		onClose?: (id: string) => void;
	}

	let { publishers, onClose }: Props = $props();

	function initials(name: string | undefined): string {
		const n = (name ?? 'Presenter').trim();
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '?';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	// Reference card.webcamsHolder is draggable (cursor:move + JS reposition). We
	// translate each card by a per-id offset; pointer-capture keeps the drag alive
	// even when the pointer leaves the card. Offsets reset when a publisher leaves.
	let offsets = $state<Record<string, { x: number; y: number }>>({});
	let dragId = $state<string | null>(null);
	// Non-reactive drag refs (only read inside the move handler).
	let startX = 0;
	let startY = 0;
	let baseX = 0;
	let baseY = 0;

	function onPointerDown(e: PointerEvent, id: string) {
		// Don't start a drag from the close (×) button — let its click through.
		if ((e.target as HTMLElement).closest('.close')) return;
		dragId = id;
		startX = e.clientX;
		startY = e.clientY;
		const o = offsets[id] ?? { x: 0, y: 0 };
		baseX = o.x;
		baseY = o.y;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (dragId === null) return;
		offsets = {
			...offsets,
			[dragId]: { x: baseX + (e.clientX - startX), y: baseY + (e.clientY - startY) }
		};
	}

	function onPointerUp() {
		dragId = null;
	}

	/**
	 * Attach a publisher's MediaStreamTrack to a <video> via `srcObject`.
	 * Returns an attachment so each card's video element is wired up
	 * declaratively and re-runs when the track changes; the MediaStream is
	 * created per attachment and the video is detached on teardown so there
	 * are no dangling references when a presenter leaves.
	 */
	function attachTrack(track: MediaStreamTrack | null | undefined): Attachment<HTMLVideoElement> {
		return (video) => {
			// Guard SSR — MediaStream only exists in the browser.
			if (typeof window === 'undefined' || typeof MediaStream === 'undefined') {
				return;
			}
			if (track) {
				video.srcObject = new MediaStream([track]);
			} else {
				video.srcObject = null;
			}
			return () => {
				video.srcObject = null;
			};
		};
	}
</script>

<div class="holder">
	{#each publishers as publisher (publisher.id)}
		<!-- Draggable card (reference cursor:move). svelte-ignore: the drag is a
		     pointer gesture, not a click target, so no role/keyboard equivalent. -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			id="webcamsHolder-{publisher.id}"
			class="card"
			class:dragging={dragId === publisher.id}
			style:transform="translate({offsets[publisher.id]?.x ?? 0}px, {offsets[publisher.id]?.y ??
				0}px)"
			onpointerdown={(e) => onPointerDown(e, publisher.id)}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
		>
			<!-- "Disable Video (saves bandwidth)" (reference preferences.disableVideo
			     → "Video off to preserve data..."): skip attaching the track and show
			     the placeholder so no video is decoded. -->
			{#if prefs.videoEnabled}
				{#if publisher.track}
					<!-- Reference: object-fit:contain so a non-4:3 stream letterboxes on
					     black rather than cropping (webcamsHolderVideo). -->
					<video
						id="webcamVideo-{publisher.id}"
						{@attach attachTrack(publisher.track)}
						autoplay
						muted
						playsinline
					></video>
				{:else}
					<!-- Camera-off placeholder: centered initials on the black card
					     (report.md:1164). -->
					<div class="cam-off" aria-hidden="true">
						<span class="cam-initials">{initials(publisher.name)}</span>
					</div>
				{/if}
			{:else}
				<div class="video-off">Video off to preserve data...</div>
			{/if}

			<!-- Reference overlay: absolute top:0 (z101); h5.pNameLabel holds the
			     centered name AND the close × (span.closeIcon nested inside the h5 —
			     report.md:1010-1011). -->
			<div class="overlay">
				<h5 class="name" title={publisher.name ?? 'Presenter'}>
					{publisher.name ?? 'Presenter'}
					{#if onClose}
						<button
							class="close"
							type="button"
							aria-label={publisher.isLocal ? 'Turn off your camera' : 'Hide this camera'}
							title={publisher.isLocal ? 'Turn off camera' : 'Hide camera'}
							onclick={() => onClose?.(publisher.id)}
						>
							<Icon name="times" size={20} />
						</button>
					{/if}
				</h5>
			</div>
		</div>
	{/each}
</div>

<style>
	/* Active-tile border accent (reference yellowgreen rgb(154,205,50)); not in
	   the global room palette, so scoped here per the spec. */
	.holder {
		--webcam-active-border: #9acd32;
	}

	.holder {
		display: flex;
		flex-wrap: wrap;
		/* Reference webcam-wrapper: justify-content-center align-items-end w-100 —
		   cards are horizontally centered, wrap, and bottom-align in the holder. */
		justify-content: center;
		align-items: flex-end;
		width: 100%;
	}

	.card {
		/* DELIBERATE parity decision: the reference cards are position:absolute;
		   z-index:105, floating in the holder. We get the same user-visible result —
		   webcams float over the stage (the parent .webcam-overlay is absolute, see
		   MainStage) and each card is freely draggable (transform offset, lifting via
		   z-index while dragging) — but keep position:relative inside a flex .holder so
		   multiple tiles auto-center and wrap instead of overlapping at the same
		   absolute origin. Equivalent behavior, more robust layout. */
		position: relative;
		/* Reference card computes display:flex column (Bootstrap .card,
		   report.md:1079). */
		display: flex;
		flex-direction: column;
		/* Reference card.webcamsHolder: fixed 320x240 (4:3), 5px margin, black
		   card, 1px yellowgreen active border, 6px radius, Open Sans 300 16px/24px
		   (report.md:1083). */
		width: 320px;
		height: 240px;
		margin: 5px;
		background: #000;
		border: 1px solid var(--webcam-active-border);
		border-radius: 6px;
		overflow: hidden;
		color: rgb(33, 37, 41);
		font:
			300 16px/24px 'Open Sans',
			sans-serif;
		/* Reference card is draggable (cursor:move). touch-action:none lets a touch
		   drag the card instead of scrolling; user-select:none avoids selecting the
		   name text mid-drag. */
		cursor: move;
		touch-action: none;
		user-select: none;
	}
	/* The card being dragged floats above its siblings. */
	.card.dragging {
		z-index: 200;
	}

	video {
		display: block;
		/* Reference video declares position:relative (report.md:1092-1097). */
		position: relative;
		width: 100%;
		height: 100%;
		/* Reference webcamsHolderVideo: contain (not cover) so off-ratio streams
		   letterbox against the black card; camera-off shows the black card. */
		object-fit: contain;
		background: transparent;
	}

	/* Camera-off initials placeholder (report.md:1164). */
	.cam-off {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	.cam-initials {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: #222;
		color: #fff;
		font-size: 24px;
		font-weight: 700;
	}

	/* "Disable Video (saves bandwidth)" placeholder — reference verbatim text,
	   shown in place of the <video> when prefs.videoEnabled is off. */
	.video-off {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 0.5rem;
		text-align: center;
		font-size: 0.78rem;
		font-weight: 600;
		color: #cfd3d8;
		background: #000;
	}

	.overlay {
		/* Reference overlay: absolute top:0 spanning the card width, z101, above
		   the video — the name bar lives across the TOP, not the bottom. */
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 101;
	}

	.name {
		/* Reference pNameLabel (h5): full-width centered black bar, white text,
		   20px / weight 500 / 24px line, margin 0. No truncation rules in the
		   captured rule set (report.md:1111-1117). */
		margin: 0;
		width: 100%;
		min-height: 24px;
		line-height: 24px;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		font-size: 20px;
		font-weight: 500;
		text-align: center;
	}

	.close {
		/* Reference closeIcon: absolute top:0 right:5px, z102, plain white 20px
		   fa-times — no pill, no background; cursor inherits the card's `move`
		   (report.md:1080,1143-1144). */
		position: absolute;
		top: 0;
		right: 5px;
		z-index: 102;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		line-height: 0;
		background: transparent;
		border: none;
		color: #fff;
		cursor: move;
	}
	.close:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
</style>
