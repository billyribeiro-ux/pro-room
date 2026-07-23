/**
 * Position a popover so it escapes ancestor overflow clipping — the equivalent
 * of the reference's ngbPopover `container="body"` (the emoji/GIF popovers are
 * portaled to <body> there, so the chat panel's `overflow-y: hidden` never
 * clips them — chat-composer.md §emoji). We keep the popover in-tree (Svelte
 * scoping) but switch it to `position: fixed`, anchored to the trigger's rect
 * at open time.
 *
 * Anchors the popover's bottom-right to the trigger's top-right (opens
 * upward, like the reference composer popovers), clamped to the viewport.
 */
export function fixedPopoverStyle(
	trigger: HTMLElement,
	opts: { width?: number; height?: number; gap?: number } = {}
): string {
	const { width = 340, height = 434, gap = 6 } = opts;
	const r = trigger.getBoundingClientRect();
	const right = Math.max(gap, Math.min(window.innerWidth - r.right, window.innerWidth - width - gap));
	// Prefer opening upward; if there isn't room above, anchor below the trigger.
	if (r.top - gap - height >= gap) {
		const bottom = window.innerHeight - r.top + gap;
		return `position:fixed;bottom:${bottom}px;right:${right}px;z-index:1060;`;
	}
	const top = Math.min(r.bottom + gap, Math.max(gap, window.innerHeight - height - gap));
	return `position:fixed;top:${top}px;right:${right}px;z-index:1060;`;
}
