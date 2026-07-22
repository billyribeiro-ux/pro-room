<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';

	interface Props {
		/** Axis the panes are laid out along. `horizontal` = side-by-side. */
		direction?: 'horizontal' | 'vertical';
		/** Starting size of pane A, as a percentage of the container. */
		initial?: number;
		/** Minimum size (%) either pane may shrink to. */
		min?: number;
		/**
		 * When > 0, dragging the gutter within this many pixels of either edge
		 * collapses that pane to 0 (and the other to full) — matches the reference
		 * where dragging the alerts/chat column hard against the stage closes it.
		 * 0 disables collapsing.
		 */
		collapsePx?: number;
		/** Pane A content (left / top). */
		a: Snippet;
		/** Pane B content (right / bottom). */
		b: Snippet;
	}

	let { direction = 'horizontal', initial = 50, min = 15, collapsePx = 0, a, b }: Props = $props();

	const clampMin = $derived(Math.min(Math.max(min, 0), 50));
	const isHorizontal = $derived(direction === 'horizontal');

	function clamp(value: number): number {
		const lo = clampMin;
		const hi = 100 - clampMin;
		return Math.min(Math.max(value, lo), hi);
	}

	// Size of pane A as a percentage, seeded once from `initial`. After mount
	// the user's drag/keyboard input owns this value, so it is plain $state
	// (not derived from `initial`) — re-passing `initial` does not reset it.
	// `untrack` makes the "read initial value only" intent explicit.
	let split = $state(untrack(() => clamp(initial)));

	let container: HTMLDivElement | undefined = $state();
	let dragging = $state(false);

	function positionToPercent(clientX: number, clientY: number): number {
		if (!container) return split;
		const rect = container.getBoundingClientRect();
		const total = isHorizontal ? rect.width : rect.height;
		if (total <= 0) return split;
		const offset = isHorizontal ? clientX - rect.left : clientY - rect.top;
		// Collapse a pane entirely when the gutter is dragged within `collapsePx`
		// of an edge (the reference closes the alerts/chat column past a threshold).
		if (collapsePx > 0) {
			if (offset <= collapsePx) return 0;
			if (offset >= total - collapsePx) return 100;
		}
		return clamp((offset / total) * 100);
	}

	function onPointerDown(event: PointerEvent) {
		// Only react to the primary pointer/button.
		if (event.button !== 0) return;
		event.preventDefault();
		dragging = true;
		(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
	}

	// While dragging, listen on the document so the gutter keeps tracking the
	// pointer even when it leaves the thin gutter hit-area. The listeners are
	// attached only for the duration of a drag and torn down by the effect.
	$effect(() => {
		if (!dragging) return;

		function onMove(event: PointerEvent) {
			split = positionToPercent(event.clientX, event.clientY);
		}
		function onUp() {
			dragging = false;
		}

		document.addEventListener('pointermove', onMove);
		document.addEventListener('pointerup', onUp);
		document.addEventListener('pointercancel', onUp);

		return () => {
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
			document.removeEventListener('pointercancel', onUp);
		};
	});

	function onKeydown(event: KeyboardEvent) {
		const step = 2;
		let next: number;
		if (isHorizontal) {
			if (event.key === 'ArrowLeft') next = split - step;
			else if (event.key === 'ArrowRight') next = split + step;
			else return;
		} else {
			if (event.key === 'ArrowUp') next = split - step;
			else if (event.key === 'ArrowDown') next = split + step;
			else return;
		}
		event.preventDefault();
		split = clamp(next);
	}

	// Reference gutter declares `gutterdblclickduration="400"` (report.md:236) —
	// double-click snaps the split back to its seeded ratio, mirroring the
	// dock's vertical-gutter double-click reset.
	function onDblClick() {
		split = clamp(initial);
	}

	// angular-split "as-percent" sizing: each area is `flex-basis:
	// calc(<pct>% - <its share of the gutter>px)` with flex-shrink 0, so the
	// single 11px gutter is deducted proportionally (report.md:117-121,126).
	const GUTTER_PX = 11;
	const basisA = $derived(`calc(${split}% - ${((split / 100) * GUTTER_PX).toFixed(3)}px)`);
	const basisB = $derived(
		`calc(${100 - split}% - ${(((100 - split) / 100) * GUTTER_PX).toFixed(3)}px)`
	);
</script>

<div class="split" class:vertical={!isHorizontal} class:dragging bind:this={container}>
	<div class="pane" style:flex-basis={basisA}>
		{@render a()}
	</div>

	<!-- A focusable, keyboard-operable resize separator: the ARIA `separator`
	     role with aria-valuenow is the canonical pattern for a splitter, so the
	     noninteractive-tabindex / element-interactions warnings are expected.
	     Reference: horizontal (col-resize) gutter reports
	     aria-orientation="horizontal" (report.md:152); the row-resize one
	     reports "vertical" (report.md:176). -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="gutter"
		role="separator"
		tabindex="0"
		aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
		aria-valuemin={clampMin}
		aria-valuemax={100 - clampMin}
		aria-valuenow={Math.round(split)}
		aria-valuetext="{Math.round(split)} percent"
		aria-label="Resize panes"
		onpointerdown={onPointerDown}
		onkeydown={onKeydown}
		ondblclick={onDblClick}
	>
		<span class="grip" aria-hidden="true"></span>
	</div>

	<div class="pane" style:flex-basis={basisB}>
		{@render b()}
	</div>
</div>

<style>
	.split {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		min-width: 0;
		min-height: 0;
		/* Reference as-split host computes overflow hidden/hidden (report.md:107). */
		overflow: hidden;
	}
	.split.vertical {
		flex-direction: column;
	}

	.pane {
		/* Reference `> .as-split-area { flex-grow:0; flex-shrink:0;
		   overflow: hidden auto; }` (report.md:126). */
		flex-grow: 0;
		flex-shrink: 0;
		/* Allow children (scroll regions) to shrink below content size. */
		min-width: 0;
		min-height: 0;
		overflow: hidden auto;
	}

	.gutter {
		flex: 0 0 auto;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Reference as-split-gutter computes rgb(10,109,177) — the brand blue
		   (report.md:150). */
		background: var(--split-gutter-bg, #0a6db1);
		/* Prevent the browser from hijacking the drag as a scroll/zoom gesture. */
		touch-action: none;
		user-select: none;
	}
	/* Horizontal split → vertical gutter you drag left/right.
	   11px matches the reference angular-split gutter thickness. */
	.split:not(.vertical) > .gutter {
		width: 11px;
		cursor: col-resize;
	}
	/* Vertical split → horizontal gutter you drag up/down. */
	.split.vertical > .gutter {
		height: 11px;
		cursor: row-resize;
	}

	.gutter:hover,
	.split.dragging > .gutter {
		filter: brightness(1.15);
	}
	.gutter:focus-visible {
		outline: 2px solid var(--accent, #3b82f6);
		outline-offset: -2px;
	}

	/* Exact reference grip: angular-split `as-split-gutter-icon` — a centered PNG
	   of three light-grey dots oriented along the gutter. Same data-URIs the
	   reference ships: vertical dots for a col-resize gutter, horizontal dots for
	   a row-resize gutter. */
	.grip {
		background-position: 50% 50%;
		background-repeat: no-repeat;
		pointer-events: none;
	}
	.split:not(.vertical) > .gutter .grip {
		width: 5px;
		height: 30px;
		background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
	}
	.split.vertical > .gutter .grip {
		width: 30px;
		height: 5px;
		background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC');
	}
</style>
