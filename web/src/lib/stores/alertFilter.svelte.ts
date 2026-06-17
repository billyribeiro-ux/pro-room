/**
 * Client-side alert filter — the reference "Filter out alerts" modal, a checklist
 * of traders applied to the alert feed. Mirrors the bundle: `alertFilterFor` is a
 * map keyed by trader id; `showAlertsFrom` flips between allow-list ("only show
 * from these") and block-list ("filter out these"):
 *   keep = showAlertsFrom ? (author in map) : !(author in map)
 * No server round-trip (the reference syncs via socket; we have none), so this is
 * a per-device localStorage store, same idiom as dnd/prefs.
 */
import { browser } from '$app/environment';

export interface FilterTrader {
	id: string;
	name: string;
}

const MAP_KEY = 'ptr.alertFilter.map';
const SHOW_KEY = 'ptr.alertFilter.showFrom';

function loadMap(): Record<string, string> {
	if (!browser) return {};
	try {
		const v = JSON.parse(localStorage.getItem(MAP_KEY) ?? '{}');
		return v && typeof v === 'object' ? (v as Record<string, string>) : {};
	} catch {
		return {};
	}
}
function loadShow(): boolean {
	if (!browser) return false;
	try {
		return localStorage.getItem(SHOW_KEY) === 'true';
	} catch {
		return false;
	}
}

/**
 * Reactive alert-filter state. `filtered` maps trader_id -> display_name (presence
 * is what matters, mirroring alertFilterFor). `open` is the shared modal-open flag
 * so both the AlertFeed gear menu and the Settings "Filter out alerts" button can
 * open the single modal instance.
 */
export const alertFilter = $state<{
	filtered: Record<string, string>;
	showAlertsFrom: boolean;
	open: boolean;
}>({
	filtered: loadMap(),
	showAlertsFrom: loadShow(),
	open: false
});

function persist(): void {
	if (!browser) return;
	try {
		localStorage.setItem(MAP_KEY, JSON.stringify(alertFilter.filtered));
		localStorage.setItem(SHOW_KEY, String(alertFilter.showAlertsFrom));
	} catch {
		// private mode / quota — in-memory state still works.
	}
}

/** Add the trader if absent, remove if present (reference toggleTraders). */
export function toggleTrader(id: string, name: string): void {
	const next = { ...alertFilter.filtered };
	if (next[id]) delete next[id];
	else next[id] = name;
	alertFilter.filtered = next;
	persist();
}

/** Add every trader to the map (reference selectAll). */
export function selectAll(traders: FilterTrader[]): void {
	const next = { ...alertFilter.filtered };
	for (const t of traders) next[t.id] = t.name;
	alertFilter.filtered = next;
	persist();
}

/** Empty the map (reference unselectAll). */
export function unselectAll(): void {
	alertFilter.filtered = {};
	persist();
}

export function setShowAlertsFrom(value: boolean): void {
	alertFilter.showAlertsFrom = value;
	persist();
}

/** Whether any filter is active (reference doFilteredAlerts). */
export function isFiltering(): boolean {
	return Object.keys(alertFilter.filtered).length > 0;
}

/**
 * Whether an alert from `authorId` should be shown. Empty map = show everything;
 * otherwise allow-list when showAlertsFrom, else block-list.
 */
export function isAlertVisible(authorId: string | undefined | null): boolean {
	if (!authorId || !isFiltering()) return true;
	const inMap = authorId in alertFilter.filtered;
	return alertFilter.showAlertsFrom ? inMap : !inMap;
}

export function openFilter(): void {
	alertFilter.open = true;
}
export function closeFilter(): void {
	alertFilter.open = false;
}
