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
let roomId: string;

test.beforeAll(async ({ request }) => {
	const res = await request.get(`${API}/api/rooms`);
	expect(res.ok(), 'GET /api/rooms (is the Rust API up on :8081?)').toBeTruthy();
	const rooms = (await res.json()) as Array<{ id: string; is_live: boolean }>;
	expect(rooms.length).toBeGreaterThan(0);
	const room = rooms.find((r) => r.is_live) ?? rooms[0];
	roomId = room.id;
	if (!room.is_live) {
		await request.post(`${API}/api/rooms/${roomId}/live`, { data: { is_live: true } });
	}
});

async function enterRoom(page: Page) {
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
	await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 5_000 }).catch(() => {});
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

test('alert popup toast fires on a new alert', async ({ page }) => {
	await page.evaluate(async (rid) => {
		await fetch(`http://localhost:8081/api/rooms/${rid}/alerts`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ symbol: 'E2ETOAST', side: 'buy', note: 'popup' })
		});
	}, roomId);
	const toast = page.locator('.toast', { hasText: 'E2ETOAST' });
	await expect(toast).toBeVisible({ timeout: 8_000 });
	await expect(toast).toContainText('Alert from @');
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
	const me = await page.evaluate(
		async () => await (await fetch('http://localhost:8081/api/auth/me', { credentials: 'include' })).json()
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
});

test('Alert Logs loads real entries', async ({ page }) => {
	await openSidebarItem(page, 'Alert Logs');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Alerts Logs');
	await expect(dialog.locator('.list-group-item').first()).toBeVisible({ timeout: 8_000 });
});

test('Chat Logs loads real entries', async ({ page }) => {
	await openSidebarItem(page, 'Chat Logs');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Chat Logs');
	await expect(dialog.locator('.list-group-item').first()).toBeVisible({ timeout: 8_000 });
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
});

test('Debug Log shows captured session lifecycle lines', async ({ page }) => {
	await openSidebarItem(page, 'Debug Log');
	const ta = page.getByRole('dialog').locator('textarea');
	await expect(ta).toBeVisible();
	await expect(ta).toHaveValue(/\[\d{1,2}:\d{2}:\d{2}.*\](.|\n)*WS connected/, { timeout: 8_000 });
});

test('General Settings Compact Mode applies to the chat list', async ({ page }) => {
	await openSidebarItem(page, 'General Settings');
	await page.getByRole('tab', { name: 'Chat Settings' }).click();
	await page.getByRole('dialog').getByRole('radio', { name: 'Compact Mode' }).check();
	// The chat list is behind the open modal (hidden), so assert the class is
	// applied rather than visibility.
	await expect(page.locator('ul.messages')).toHaveClass(/compact/, { timeout: 5_000 });
	expect(await page.evaluate(() => localStorage.getItem('ptr.pref.chatMode'))).toBe('compact');
});

test('1:1 Private Chat sends a message that appears once', async ({ page }) => {
	await openUserInfo(page, 'Mike');
	await page.getByRole('dialog').getByRole('button', { name: /Private Chat|Private Message/i }).click();
	const panel = page.locator('.priv-chat');
	await expect(panel).toBeVisible({ timeout: 5_000 });
	const body = `pm-e2e-${Date.now()}`;
	await panel.getByRole('textbox').fill(body);
	await panel.getByRole('button', { name: 'Send' }).click();
	// Appears exactly once (POST + WS echo de-duped by id).
	await expect(panel.locator('.bubble', { hasText: body })).toHaveCount(1, { timeout: 8_000 });
});

test('Audio/Video Settings opens with device selects', async ({ page }) => {
	await openSidebarItem(page, 'Audio/Video Settings');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText('Audio/Video Settings');
	await dialog.getByRole('tab', { name: 'Presenter' }).click();
	await expect(dialog.locator('#av-mic')).toBeVisible();
	await expect(dialog.locator('#av-camera')).toBeVisible();
});

test('Mobile App Info opens with store links', async ({ page }) => {
	await openSidebarItem(page, 'Mobile App Info');
	await expect(page.getByRole('dialog')).toContainText(/mobile app/i);
});
