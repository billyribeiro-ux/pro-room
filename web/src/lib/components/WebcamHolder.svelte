<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Attachment } from 'svelte/attachments';

	/** A single presenter publishing a camera feed. */
	interface Publisher {
		id: string;
		name?: string;
		track?: MediaStreamTrack | null;
		/** True for the local user's own camera — only that tile shows the × (stop). */
		isLocal?: boolean;
	}

	interface Props {
		publishers: Publisher[];
		onClose?: (id: string) => void;
	}

	let { publishers, onClose }: Props = $props();

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

{#if publishers.length === 0}
	<div class="empty">No presenters</div>
{:else}
	<div class="holder">
		{#each publishers as publisher (publisher.id)}
			<!-- Draggable card (reference cursor:move). svelte-ignore: the drag is a
			     pointer gesture, not a click target, so no role/keyboard equivalent. -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="card"
				class:dragging={dragId === publisher.id}
				style:transform="translate({offsets[publisher.id]?.x ?? 0}px, {offsets[publisher.id]?.y ??
					0}px)"
				onpointerdown={(e) => onPointerDown(e, publisher.id)}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointercancel={onPointerUp}
			>
				<!-- Reference: object-fit:contain so a non-4:3 stream letterboxes on
				     black rather than cropping (webcamsHolderVideo). -->
				<video {@attach attachTrack(publisher.track)} autoplay muted playsinline></video>

				<!-- Reference overlay sits absolute top:0 above the video (z101); the
				     name is a full-width centered bar, the close X floats top-right. -->
				<div class="overlay">
					<h5 class="name" title={publisher.name ?? 'Presenter'}>
						{publisher.name ?? 'Presenter'}{publisher.isLocal ? ' (you)' : ''}
					</h5>
				</div>

				{#if onClose && publisher.isLocal}
					<button
						class="close"
						type="button"
						aria-label="Turn off your camera"
						title="Turn off camera"
						onclick={() => onClose?.(publisher.id)}
					>
						<Icon name="times" size={20} />
					</button>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	/* Active-tile border accent (reference yellowgreen rgb(154,205,50)); not in
	   the global room palette, so scoped here per the spec. */
	.holder {
		--webcam-active-border: #9acd32;
	}

	.empty {
		padding: 0.4rem 0.6rem;
		font-size: 0.75rem;
		color: var(--text-dim);
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
		position: relative;
		/* Reference card.webcamsHolder: fixed 320x240 (4:3), 5px margin, black
		   card, 1px yellowgreen active border, 6px radius, Open Sans 300/16. */
		width: 320px;
		height: 240px;
		margin: 5px;
		background: #000;
		border: 1px solid var(--webcam-active-border);
		border-radius: 6px;
		overflow: hidden;
		color: rgb(33, 37, 41);
		font:
			300 16px 'Open Sans',
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
		width: 100%;
		height: 100%;
		/* Reference webcamsHolderVideo: contain (not cover) so off-ratio streams
		   letterbox against the black card; camera-off shows the black card. */
		object-fit: contain;
		background: transparent;
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
		   20px / weight 500 / 24px line, margin 0, height collapses to content
		   (~24px) — let it size to the line rather than forcing 20px. */
		margin: 0;
		width: 100%;
		min-height: 24px;
		line-height: 24px;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		font-size: 20px;
		font-weight: 500;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close {
		/* Reference closeIcon: absolute top:0 right:5px, z102, plain white 20px
		   fa-times — no pill, no background. */
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
		cursor: pointer;
	}
	.close:focus-visible {
		outline: 2px solid var(--accent, #45a2ff);
		outline-offset: 1px;
	}
</style>
