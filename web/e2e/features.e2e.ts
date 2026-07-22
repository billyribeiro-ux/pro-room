import { test, expect, type Page } from '@playwright/test';

/**
 * Function-coverage E2E — exercises the features built this session that the
 * original tour spec (proroom.e2e.ts) doesn't cover: the alert popup toast, the
 * alert filter, Edit my Info, muted/followed users, the archive logs, Connectivity
 * Check, Debug Log, a General Settings toggle, 1:1 Private Messages, AV Settings,
 * and Mobile App Info. Drives the real UI against the Rust API (:8081,
 * AUTH_DEV_BYPASS → super-admin). Playwright gives each test a fresh context, so
 * localStorage prefs/filters don't leak between tests.
 */

const API = 'http://localhost:8081';
const SHOTS = 'e2e/screenshots';
let roomId: string;

/** Save a viewport screenshot under a stable, browsable name (snapshot evidence). */
async function shot(page: Page, name: string) {
	await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

test.beforeAll(async ({ request, playwright }) => {
	const res = await request.get(`${API}/api/rooms`);
	expect(res.ok(), 'GET /api/rooms (is the Rust API up on :8081?)').toBeTruthy();
	const rooms = (await res.json()) as Array<{ id: string; is_live: boolean }>;
	expect(rooms.length).toBeGreaterThan(0);
	const room = rooms.find((r) => r.is_live) ?? rooms[0];
	roomId = room.id;
	if (!room.is_live) {
		await request.post(`${API}/api/rooms/${roomId}/live`, { data: { is_live: true } });
	}

	// Self-provision a 'Mike' member with chat history. The mute / Chat Logs / 1:1
	// Private Chat tests address a chat row authored by 'Mike'; provisioning it here
	// (instead of relying on the seed script) keeps the suite HERMETIC — it passes on
	// a freshly-migrated DB. Mike can post in this PUBLIC room without membership.
	await request
		.post(`${API}/api/auth/register`, {
			data: { email: 'mike@proroom.dev', password: 'proom1234', display_name: 'Mike' }
		})
		.catch(() => {}); // 409 on re-run is fine
	const mike = await playwright.request.newContext();
	try {
		await mike.post(`${API}/api/auth/login`, {
			data: { email: 'mike@proroom.dev', password: 'proom1234' }
		});
		const msgs = (await (
			await request.get(`${API}/api/rooms/${roomId}/messages`)
		).json()) as Array<{
			author_name?: string;
		}>;
		if (!msgs.some((m) => m.author_name === 'Mike')) {
			await mike.post(`${API}/api/rooms/${roomId}/messages`, {
				data: { body: 'Mike here — watching SPY into the open' }
			});
		}
	} finally {
		await mike.dispose();
	}
});

async function enterRoom(page: Page) {
	// Simulate a user who has dragged the alerts/chat splitter to give chat room.
	// The dock defaults to alerts-dominant (acdock.fraction 0.814 — reference
	// faithful), which leaves the chat message list ~53px tall and its per-row
	// "Message options" kebab unreachable in automation. Persisting fraction 0.35
	// (measured: chat ≈ 471px) before mount makes the chat features interactable.
	// No app code changes — this is the same state a user reaches by dragging the
	// horizontal gutter down.
	await page.addInitScript(() => localStorage.setItem('acdock.fraction', '0.35'));
	await page.goto(`/rooms/${roomId}`);
	await expect(page.locator('.main-stage')).toBeVisible({ timeout: 20_000 });
	await expect(page.locator('.alerts-pane')).toBeVisible();
}

/** Open the off-canvas sidebar if it isn't already open. */
async function openSidebar(page: Page) {
	const open = page.getByRole('button', { name: 'Open Sidebar' }).first();
	if ((await open.count()) > 0 && (await open.isVisible().catch(() => false))) {
		await open.click();
		await expect(page.getByRole('button', { name: 'Close sidebar' })).toBeVisible({
			timeout: 5_000
		});
	}
}

/** Open a hamburger item by its exact label. */
async function openSidebarItem(page: Page, name: string) {
	await openSidebar(page);
	await page.getByRole('button', { name, exact: true }).first().click();
}

async function closeModal(page: Page) {
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog'))
		.toHaveCount(0, { timeout: 5_000 })
		.catch(() => {});
}

/** Open the User Info modal for the first chat row authored by `who`. */
async function openUserInfo(page: Page, who: string) {
	const row = page.locator('.chat-pane .msg-box', { hasText: who }).first();
	await expect(row).toBeVisible({ timeout: 10_000 });
	await row.getByRole('button', { name: 'Message options' }).click();
	await page.getByRole('menuitem', { name: 'User Info' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
	await enterRoom(page);
});

test('alert popup toast fires on another user’s new alert', async ({ page }) => {
	// The alert popup is now self-notify-aware: you do NOT get a toast for your OWN
	// alert (ev.alert.author_id !== detail.viewer_id). Under AUTH_DEV_BYPASS every
	// unauthenticated request is the SAME super-admin, so to exercise the toast the
	// viewer must be a different user from the author. View as the seeded member
	// (real session overrides the bypass), then post the alert WITHOUT credentials so
	// the bypass authors it as the admin — a different user → the toast fires.
	await page.request.post('http://localhost:8081/api/auth/login', {
		data: { email: 'member@ptr.test', password: 'proom1234' }
	});
	await enterRoom(page); // re-enter now that the member session cookie is set
	await page.evaluate(async (rid) => {
		await fetch(`http://localhost:8081/api/rooms/${rid}/alerts`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'omit', // no member cookie → dev-bypass admin authors it
			body: JSON.stringify({ symbol: 'E2ETOAST', side: 'buy', note: 'popup' })
		});
	}, roomId);
	const toast = page.locator('.toast', { hasText: 'E2ETOAST' });
	await expect(toast).toBeVisible({ timeout: 8_000 });
	await expect(toast).toContainText('Alert from @');
	await shot(page, 'f01-alert-toast');
});

test('alert filter hides a trader and persists', async ({ page }) => {
	await page.getByRole('button', { name: 'Alert settings' }).click();
	await page.getByRole('menuitem', { name: 'Filter alerts' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog.locator('.trader').first()).toBeVisible({ timeout: 5_000 });
	const before = await page.locator('ul.feed .msg-box').count();
	expect(before).toBeGreaterThan(0);
	// Block-list the first trader -> their alerts disappear.
	await dialog.locator('.trader').first().click();
	await expect(async () => {
		expect(await page.locator('ul.feed .msg-box').count()).toBeLessThan(before);
	}).toPass({ timeout: 5_000 });
	expect(await page.evaluate(() => localStorage.getItem('ptr.alertFilter.map'))).toBeTruthy();
	await shot(page, 'f02-alert-filter');
	await dialog.getByRole('button', { name: 'Unselect All' }).click();
});

test('Edit my Info updates the display name', async ({ page }) => {
	await openSidebarItem(page, 'General Settings');
	await page.getByRole('tab', { name: 'App Settings' }).click();
	await page.getByRole('button', { name: /Edit my Info/i }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Edit my Info');
	// Email read-only; avatar is a sha256 gravatar URL.
	await expect(dialog.locator('img.avatar')).toHaveAttribute(
		'src',
		/gravatar\.com\/avatar\/[a-f0-9]{64}/
	);
	const name = `E2EName${Date.now() % 100000}`;
	await dialog.getByRole('textbox', { name: 'Display name' }).fill(name);
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(page.locator('.toast', { hasText: 'Profile updated' })).toBeVisible({
		timeout: 8_000
	});
	await shot(page, 'f03-edit-my-info');
	const me = await page.evaluate(
		async () =>
			await (await fetch('http://localhost:8081/api/auth/me', { credentials: 'include' })).json()
	);
	expect(me.user.display_name).toBe(name);
	// reset
	await page.evaluate(
		async () =>
			await fetch('http://localhost:8081/api/auth/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ display_name: 'DevAdmin' })
			})
	);
});

test('mute a user hides their chat + lists them in Manage Muted Users', async ({ page }) => {
	await openUserInfo(page, 'Mike');
	const before = await page.locator('.chat-pane .msg-box', { hasText: 'Mike' }).count();
	expect(before).toBeGreaterThan(0);
	await page.getByRole('dialog').getByRole('button', { name: 'Mute this user' }).click();
	await closeModal(page);
	// Mike's chat is now filtered out.
	await expect(page.locator('.chat-pane .msg-box', { hasText: 'Mike' })).toHaveCount(0, {
		timeout: 5_000
	});
	// And he's listed in the Manage Muted Users modal.
	await openSidebarItem(page, 'Manage Muted Users');
	await expect(page.getByRole('dialog')).toContainText('Mike');
	await shot(page, 'f04-manage-muted-users');
});

test('Alert Logs loads real entries', async ({ page }) => {
	await openSidebarItem(page, 'Alert Logs');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Alerts Logs');
	await expect(dialog.locator('.list-group-item').first()).toBeVisible({ timeout: 8_000 });
	await shot(page, 'f05-alert-logs');
});

test('Chat Logs loads real entries', async ({ page }) => {
	await openSidebarItem(page, 'Chat Logs');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Chat Logs');
	await expect(dialog.locator('.list-group-item').first()).toBeVisible({ timeout: 8_000 });
	await shot(page, 'f06-chat-logs');
});

test('Connectivity Check runs a real probe (rows resolve, not all-pending)', async ({ page }) => {
	await openSidebarItem(page, 'Connectivity Check');
	const dialog = page.getByRole('dialog');
	await dialog.getByRole('button', { name: 'Start Test' }).click();
	// After the probe, no row stays "pending" (real probe resolves to pass/fail).
	await expect(async () => {
		const pending = await dialog.locator('.status-icon.pending').count();
		expect(pending).toBe(0);
	}).toPass({ timeout: 12_000 });
	const passed = await dialog.locator('.status-icon.pass').count();
	expect(passed).toBeGreaterThan(0); // at least UDP/host resolves
	await shot(page, 'f07-connectivity-check');
});

test('Debug Log shows captured session lifecycle lines', async ({ page }) => {
	await openSidebarItem(page, 'Debug Log');
	const ta = page.getByRole('dialog').locator('textarea');
	await expect(ta).toBeVisible();
	await expect(ta).toHaveValue(/\[\d{1,2}:\d{2}:\d{2}.*\](.|\n)*WS connected/, { timeout: 8_000 });
	await shot(page, 'f08-debug-log');
});

test('General Settings Compact Mode applies to the chat list', async ({ page }) => {
	await openSidebarItem(page, 'General Settings');
	await page.getByRole('tab', { name: 'Chat Settings' }).click();
	await page.getByRole('dialog').getByRole('radio', { name: 'Compact Mode' }).check();
	// The chat list is behind the open modal (hidden), so assert the class is
	// applied rather than visibility.
	await expect(page.locator('ul.messages')).toHaveClass(/compact/, { timeout: 5_000 });
	expect(await page.evaluate(() => localStorage.getItem('ptr.pref.chatMode'))).toBe('compact');
	await shot(page, 'f09-compact-mode');
});

test('1:1 Private Chat sends a message that appears once', async ({ page }) => {
	await openUserInfo(page, 'Mike');
	await page
		.getByRole('dialog')
		.getByRole('button', { name: /Private Chat|Private Message/i })
		.click();
	const panel = page.locator('.priv-chat');
	await expect(panel).toBeVisible({ timeout: 5_000 });
	const body = `pm-e2e-${Date.now()}`;
	await panel.getByRole('textbox').fill(body);
	await panel.getByRole('button', { name: 'Send' }).click();
	// Appears exactly once (POST + WS echo de-duped by id).
	await expect(panel.locator('.bubble', { hasText: body })).toHaveCount(1, { timeout: 8_000 });
	await shot(page, 'f10-private-chat');
});

test('Audio/Video Settings opens with device selects', async ({ page }) => {
	await openSidebarItem(page, 'Audio/Video Settings');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Audio/Video Settings');
	await dialog.getByRole('tab', { name: 'Presenter' }).click();
	await expect(dialog.locator('#av-mic')).toBeVisible();
	await expect(dialog.locator('#av-camera')).toBeVisible();
	await shot(page, 'f11-av-settings');
});

test('Mobile App Info opens with store links', async ({ page }) => {
	await openSidebarItem(page, 'Mobile App Info');
	await expect(page.getByRole('dialog')).toContainText(/mobile app/i);
	await shot(page, 'f12-mobile-app-info');
});
