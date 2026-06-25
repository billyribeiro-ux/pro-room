import { test, expect, type Page } from '@playwright/test';

/**
 * End-to-end tour of the pro-room trading room. Drives the real UI against the
 * running Rust API (:8081, AUTH_DEV_BYPASS → every request is a super-admin, so
 * no login step is needed) and captures a screenshot at every meaningful moment
 * into `e2e/screenshots/`.
 *
 * Selectors below were mapped from the component source (see the recon notes in
 * the PR); where the app isn't optimistic (reactions, chat, deletes all land via
 * a WebSocket broadcast) we lean on Playwright's web-first auto-retrying
 * assertions instead of fixed waits.
 *
 * Prereqs: `cd server && ./target/debug/server` (8081, AUTH_DEV_BYPASS=true) and
 * a live room. The web server is started by playwright.config.ts (vite dev:4173).
 */

const API = 'http://localhost:8081';
const SHOTS = 'e2e/screenshots';

let roomId: string;

/** Save a viewport screenshot under a stable, browsable name. */
async function shot(page: Page, name: string) {
	await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

/** Navigate into the room and wait for the shell to be interactive. */
async function enterRoom(page: Page) {
	await page.goto(`/rooms/${roomId}`);
	// The layout calls /api/auth/me on mount; dev-bypass returns a super-admin so
	// we land in the room rather than bouncing to /login.
	await expect(page.locator('.main-stage')).toBeVisible({ timeout: 20_000 });
	await expect(page.locator('.alerts-pane')).toBeVisible();
}

/**
 * Click a stage-action toolbar button (New poll / Music / Members / …). That bar
 * can overflow and clip its right-most buttons at some widths, so fall back to a
 * direct DOM click when the element isn't hit-testable.
 */
async function clickAction(page: Page, name: string) {
	// Broadcast controls are now icon-only `.ctrl` buttons (aria-label) in the
	// top-nav cluster (`.nav-controls`), not a labelled `.stage-actions` bar.
	const btn = page.locator(`.nav-controls .ctrl[aria-label="${name}"]`).first();
	try {
		await btn.click({ timeout: 2500 });
	} catch {
		await page.evaluate((label) => {
			const el = [...document.querySelectorAll('.nav-controls .ctrl, button.ctrl')].find(
				(b) => b.getAttribute('aria-label') === label
			);
			(el as HTMLElement | undefined)?.click();
		}, name);
	}
}

/** Dismiss whatever modal/dialog is open (Modal.svelte closes on Escape). */
async function closeModal(page: Page) {
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog'))
		.toHaveCount(0, { timeout: 5_000 })
		.catch(() => {});
}

test.beforeAll(async ({ request }) => {
	// Discover a room and make sure it is live so presenter capabilities are on.
	const res = await request.get(`${API}/api/rooms`);
	expect(res.ok(), 'GET /api/rooms should succeed (is the Rust API up on :8081?)').toBeTruthy();
	const rooms = (await res.json()) as Array<{ id: string; is_live: boolean }>;
	expect(rooms.length, 'expected at least one room').toBeGreaterThan(0);
	const room = rooms.find((r) => r.is_live) ?? rooms[0];
	roomId = room.id;
	if (!room.is_live) {
		await request.post(`${API}/api/rooms/${roomId}/live`, { data: { is_live: true } });
	}
});

test.beforeEach(async ({ page }) => {
	await enterRoom(page);
});

test('room loads with the three stage tabs (Screens / Notes / Files)', async ({ page }) => {
	await shot(page, '01-room-loaded');

	// The Streams tab is intentionally absent (matches the reference, which hides it).
	await expect(page.getByRole('tab', { name: 'Streams' })).toHaveCount(0);

	// Notes + Files panels render.
	await page.getByRole('tab', { name: 'Notes' }).click();
	await shot(page, '03-tab-notes');
	await page.getByRole('tab', { name: 'Files' }).click();
	await shot(page, '04-tab-files');

	await page.getByRole('tab', { name: 'Screens' }).click();
	await expect(page.getByRole('tab', { name: 'Screens' })).toHaveAttribute('aria-selected', 'true');
});

test('post an alert through the Post Alert modal', async ({ page }) => {
	const stamp = `E2E-${Date.now()}`;

	await page.getByRole('button', { name: 'Post an alert' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	// All three reference tabs are present (Image/GIF/Video is one combined tab).
	for (const t of ['Text Alert', 'Text Url', 'Image / GIF / Video']) {
		await expect(dialog.getByRole('tab', { name: t })).toBeVisible();
	}
	await shot(page, '05-alert-modal');

	await dialog.locator('textarea').fill(`$NVDA breakout, runner to 920 — ${stamp}`);
	// Exercise a checkbox (appends the not-financial-advice disclosure server-side).
	await dialog.getByText('Add Legal Disclosure?').click();
	await shot(page, '06-alert-modal-filled');

	await dialog.getByRole('button', { name: 'Post Alert' }).click();
	await expect(dialog).toBeHidden();

	// The new alert arrives in the feed via the WS broadcast.
	const posted = page.locator('.alerts-pane li.msg-box', { hasText: stamp });
	await expect(posted).toBeVisible({ timeout: 10_000 });
	await shot(page, '07-alert-posted');
});

test('"Post on X" opens a pre-filled tweet intent', async ({ page }) => {
	// External-link feature: the app calls window.open('https://x.com/intent/tweet?text=…')
	// (PostAlertModal shareToX). x.com is NOT reachable from CI (no external egress) and
	// is not the unit under test — so capture the exact URL the app asks to open and assert
	// it is the correct pre-filled intent. Deterministic; no dependency on x.com loading.
	await page.addInitScript(() => {
		(window as unknown as { __opened: string[] }).__opened = [];
		window.open = ((url?: string | URL) => {
			(window as unknown as { __opened: string[] }).__opened.push(String(url ?? ''));
			return null;
		}) as typeof window.open;
	});
	await enterRoom(page); // re-enter so the init-script stub is installed before any window.open

	await page.getByRole('button', { name: 'Post an alert' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.locator('textarea').fill('$SPY pin risk into the close — watch 540');
	await dialog.getByText('Post on X? (tweet)').click();
	await shot(page, '06b-post-on-x');
	await dialog.getByRole('button', { name: 'Post Alert' }).click();
	await expect(dialog).toBeHidden();

	const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
	expect(opened.length).toBe(1);
	// twitter.com/intent/tweet 301-redirects to x.com/intent/tweet — accept either host.
	expect(opened[0]).toMatch(/(twitter|x)\.com\/intent\/tweet/);
	expect(decodeURIComponent(opened[0])).toContain('$SPY');
});

test('admin deletes an alert via the row ⋮ menu', async ({ page }) => {
	const stamp = `DEL-${Date.now()}`;
	// Post a throwaway alert to delete.
	await page.getByRole('button', { name: 'Post an alert' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.locator('textarea').fill(`$AMD scratch ${stamp}`);
	await dialog.getByRole('button', { name: 'Post Alert' }).click();
	await expect(dialog).toBeHidden();

	const row = page.locator('.alerts-pane li.msg-box', { hasText: stamp });
	await expect(row).toBeVisible({ timeout: 10_000 });

	// Open the row's ⋮ menu and screenshot the admin Delete item.
	await row.getByRole('button', { name: 'Message options' }).click();
	const del = page.locator("[role='menu'] button.danger", { hasText: 'Delete' });
	await expect(del).toBeVisible();
	await shot(page, '08-alert-row-menu');

	await del.click();
	// Removal lands via the `alert_deleted` WS broadcast.
	await expect(row).toHaveCount(0, { timeout: 10_000 });
});

test('send chat messages and switch channels', async ({ page }) => {
	const stamp = `chat-${Date.now()}`;
	const composer = page.locator('.chat-pane .pill textarea');

	await composer.fill(`gm room, watching $TSLA ${stamp}`);
	await composer.press('Enter');
	await expect(page.locator('.chat-pane li.msg-box', { hasText: stamp })).toBeVisible({
		timeout: 10_000
	});
	await shot(page, '09-chat-main');

	// Off Topic channel.
	await page.getByRole('tab', { name: 'Off Topic' }).click();
	const ot = `offtopic-${Date.now()}`;
	await composer.fill(`coffee break ${ot}`);
	await composer.press('Enter');
	await expect(page.locator('.chat-pane li.msg-box', { hasText: ot })).toBeVisible({
		timeout: 10_000
	});
	await shot(page, '10-chat-offtopic');

	await page.getByRole('tab', { name: 'Main Chat' }).click();
});

test('react to an alert with an emoji', async ({ page }) => {
	// React to a FRESHLY-posted alert. Reactions persist in the DB, so reacting to a
	// pre-existing alert toggles non-deterministically (a prior run may have already
	// added 🚀 → this click would remove it). A unique fresh alert has no prior
	// reaction, so the 🚀 toggle deterministically lands as "mine".
	const symbol = `RX${Date.now() % 1_000_000}`;
	await page.evaluate(
		async ({ rid, sym }) => {
			await fetch(`http://localhost:8081/api/rooms/${rid}/alerts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ symbol: sym, side: 'buy', note: 'react-test' })
			});
		},
		{ rid: roomId, sym: symbol }
	);

	const row = page.locator('.alerts-pane li.msg-box', { hasText: symbol });
	await expect(row).toBeVisible({ timeout: 10_000 });

	await row.getByRole('button', { name: 'Add reaction' }).click();
	const picker = page.locator("[role='menu'][aria-label='Pick a reaction']");
	await expect(picker).toBeVisible();
	await shot(page, '11-reaction-picker');

	await picker.getByRole('menuitem', { name: '🚀' }).click();
	// Pills are server-aggregated (not optimistic) — wait for the broadcast, then for
	// the mine state to settle (WS echo can render mine=false a beat before the POST
	// response sets it true).
	const pill = row.locator("button[class*='pill']", { hasText: '🚀' });
	await expect(pill).toBeVisible({ timeout: 10_000 });
	await expect(pill).toHaveClass(/mine/, { timeout: 7_000 });
	await shot(page, '12-reaction-added');
});

// "Create Poll" lives in the ALERTS header next to Post Alert (matches the
// reference, where doPollUI sits beside doPostAlertUI — not the main navbar).
test('create, vote on, and close a poll', async ({ page }) => {
	await page.getByRole('button', { name: 'Create a poll' }).click();
	// PollModal is a draggable floating "Polls" panel (not a role=dialog).
	const panel = page.locator("section[aria-label='Polls']");
	await expect(panel).toBeVisible();
	await panel.locator('#pollQuestionTxt').fill('Best setup for tomorrow? $SPY');
	// Choices are added one at a time via the choice input + "Add Choice".
	for (const choice of ['Breakout', 'Pullback', 'Range-bound']) {
		await panel.locator('#pollChoiceTxt').fill(choice);
		await panel.getByRole('button', { name: 'Add Choice' }).click();
	}
	await shot(page, '13-poll-modal');

	await panel.getByRole('button', { name: 'Send Poll' }).click();

	const poll = page.locator("section[aria-label='Poll']", { hasText: 'Best setup for tomorrow' });
	await expect(poll).toBeVisible({ timeout: 10_000 });
	await shot(page, '14-poll-created');

	// Vote for the first option.
	await poll.locator('button.option-btn').first().click();
	await expect(poll.locator('.total')).toContainText('vote', { timeout: 10_000 });
	await shot(page, '15-poll-voted');

	// Close the poll (admin only).
	await poll.locator('button.close-btn').click();
	await expect(poll.locator('.badge.closed')).toBeVisible({ timeout: 10_000 });
	await shot(page, '16-poll-closed');
});

test('play media for all (YouTube) and stop it', async ({ page }) => {
	await clickAction(page, 'Music');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();

	await dialog.locator("input[type='url']").fill('https://youtu.be/dQw4w9WgXcQ');
	await expect(dialog.getByText('Detected:')).toContainText('YouTube');
	await shot(page, '17-media-modal');

	await dialog.getByRole('button', { name: 'Play for everyone' }).click();
	const float = page.locator("[aria-label='Now playing']");
	await expect(float).toBeVisible({ timeout: 10_000 });
	await expect(float.locator("iframe[title='YouTube player']")).toBeVisible();
	await shot(page, '18-media-playing');

	await float.getByRole('button', { name: 'Stop for everyone' }).click();
	await expect(float).toBeHidden({ timeout: 10_000 });
});

test('open Session Control and preview the Clear-chat confirm', async ({ page }) => {
	await page.getByRole('button', { name: 'Open Sidebar' }).click();
	await page.getByRole('button', { name: 'Session Control' }).click();

	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog.locator('ul.actions button.action')).toHaveCount(6);
	await shot(page, '19-session-control');

	// "Clear chat" pops the styled confirmDialog (not window.confirm). Preview it,
	// then cancel — we don't actually wipe the log here.
	await dialog.locator('ul.actions button.action', { hasText: 'Clear chat' }).click();
	await expect(page.locator('p.message')).toContainText('Permanently clear');
	await shot(page, '20-confirm-clear-chat');
	await page.getByRole('button', { name: 'Cancel' }).click();

	await closeModal(page);
});

test('open the Members panel and see the online roster', async ({ page }) => {
	await clickAction(page, 'Members');
	const drawer = page.locator('aside.drawer');
	await expect(drawer).toBeVisible({ timeout: 10_000 });

	// The current dev-admin session is present, so the "Online now" roster shows it.
	await expect(drawer.locator('section.online')).toBeVisible({ timeout: 10_000 });
	await expect(drawer.locator('li.online-row').first()).toBeVisible();
	await shot(page, '21-members-online');

	await drawer.locator('header button.close').click();
	await expect(drawer).toBeHidden();
});
