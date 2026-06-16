/**
 * Tab visibility, with a "tab sleep" throttle gate.
 *
 * Mirrors the reference protradingroom `visibilityChangeEnabled` preference: when
 * the tab is hidden AND the user has tab-sleep on, background work (here: the
 * chat/alert autoscroll DOM writes) is skipped so a backgrounded room doesn't
 * burn layout/CPU. The single `document.visibilitychange` listener is installed
 * once on first import (client only) and lives for the app's lifetime — exactly
 * what a global visibility tracker wants.
 */
import { browser } from '$app/environment';
import { prefs } from './prefs.svelte';

const vis = $state<{ hidden: boolean }>({ hidden: false });

if (browser) {
	vis.hidden = document.hidden;
	document.addEventListener('visibilitychange', () => {
		vis.hidden = document.hidden;
	});
}

/** Whether the tab is currently hidden (reactive). */
export function tabHidden(): boolean {
	return vis.hidden;
}

/**
 * Whether consumers should throttle background work right now — true only when
 * the tab is hidden AND the tab-sleep preference is enabled.
 */
export function shouldThrottle(): boolean {
	return vis.hidden && prefs.tabSleep;
}
