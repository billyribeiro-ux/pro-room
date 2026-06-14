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
		/** Pane A content (left / top). */
		a: Snippet;
		/** Pane B content (right / bottom). */
		b: Snippet;
	}

	let { direction = 'horizontal', initial = 50, min = 15, a, b }: Props = $props();

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
</script>

<div class="split" class:vertical={!isHorizontal} class:dragging bind:this={container}>
	<div class="pane" style:flex-basis="{split}%">
		{@render a()}
	</div>

	<!-- A focusable, keyboard-operable resize separator: the ARIA `separator`
	     role with aria-valuenow is the canonical pattern for a splitter, so the
	     noninteractive-tabindex / element-interactions warnings are expected. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="gutter"
		role="separator"
		tabindex="0"
		aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
		aria-valuemin={clampMin}
		aria-valuemax={100 - clampMin}
		aria-valuenow={Math.round(split)}
		aria-label="Resize panes"
		onpointerdown={onPointerDown}
		onkeydown={onKeydown}
	>
		<span class="grip" aria-hidden="true"></span>
	</div>

	<div class="pane" style:flex-basis="{100 - split}%">
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
	}
	.split.vertical {
		flex-direction: column;
	}

	.pane {
		flex-grow: 0;
		flex-shrink: 1;
		/* Allow children (scroll regions) to shrink below content size. */
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}

	.gutter {
		flex: 0 0 auto;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--ptr-gutter-bg, #0a6db1);
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

	/* Subtle grip in the centre of the gutter. */
	.grip {
		background: rgba(255, 255, 255, 0.55);
		border-radius: 999px;
	}
	.split:not(.vertical) > .gutter .grip {
		width: 2px;
		height: 26px;
	}
	.split.vertical > .gutter .grip {
		width: 26px;
		height: 2px;
	}
</style>
