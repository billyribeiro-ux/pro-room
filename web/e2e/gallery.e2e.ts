import { test, expect, type Page } from '@playwright/test';

/**
 * Visual feature gallery — captures a labelled snapshot of every major screen/
 * modal/control that the functional specs (proroom/features/screen-share/
 * av-lifecycle) don't already shoot, so the e2e/screenshots/ folder is a complete
 * hard-evidence gallery of the app's features. Drives the real UI against the Rust
 * API (:8081, AUTH_DEV_BYPASS → super-admin) and a live room.
 */

const API = 'http://localhost:8081';
const SHOTS = 'e2e/screenshots';
let roomId: string;

async function shot(page: Page, name: string) {
	await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

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

// ─────────────────────────────── Standalone routes ───────────────────────────────

/** Force the app to treat the visitor as logged-OUT so auth pages render their
 *  forms instead of the dev-bypass redirect to /rooms. */
async function asLoggedOut(page: Page) {
	await page.route('**/api/auth/me', (route) =>
		route.fulfill({
			status: 401,
			contentType: 'application/json',
			body: '{"error":"unauthorized"}'
		})
	);
}

test('route: login page (form + OAuth + magic-link)', async ({ page }) => {
	await asLoggedOut(page);
	await page.goto('/login');
	await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 15_000 });
	await shot(page, 'r01-login');
});

test('route: register page', async ({ page }) => {
	await asLoggedOut(page);
	await page.goto('/register');
	await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible({
		timeout: 15_000
	});
	await shot(page, 'r02-register');
});

test('route: magic-link verify (invalid-token state)', async ({ page }) => {
	await page.goto('/auth/magic?token=invalid-demo-token');
	// Whatever state renders (verifying → error/back-to-login), the shell is up.
	await expect(page.locator('body')).toBeVisible();
	await page.waitForLoadState('networkidle');
	await shot(page, 'r03-magic-verify');
});

test('route: rooms list (authenticated)', async ({ page }) => {
	await page.goto('/rooms');
	await expect(page.getByRole('heading', { name: 'Trading Rooms' })).toBeVisible({
		timeout: 15_000
	});
	await shot(page, 'r04-rooms-list');
});

test('route: settings / appearance theme editor', async ({ page }) => {
	await page.goto('/settings');
	await expect(page.getByRole('heading', { name: 'Appearance' })).toBeVisible({ timeout: 15_000 });
	await shot(page, 'r05-settings-appearance');
});

test('route: admin user administration', async ({ page }) => {
	await page.goto('/admin/users');
	await expect(page.getByRole('heading', { name: 'User Administration' })).toBeVisible({
		timeout: 15_000
	});
	await shot(page, 'r06-admin-users');
});

// ─────────────────────────────── Room sidebar modals ───────────────────────────────

async function enterRoom(page: Page) {
	await page.addInitScript(() => localStorage.setItem('acdock.fraction', '0.35'));
	await page.goto(`/rooms/${roomId}`);
	await expect(page.locator('.main-stage')).toBeVisible({ timeout: 20_000 });
	await expect(page.locator('.alerts-pane')).toBeVisible();
}

async function openSidebar(page: Page) {
	const open = page.getByRole('button', { name: 'Open Sidebar' }).first();
	if ((await open.count()) > 0 && (await open.isVisible().catch(() => false))) {
		await open.click();
		await expect(page.getByRole('button', { name: 'Close sidebar' })).toBeVisible({
			timeout: 5_000
		});
	}
}

async function openSidebarItem(page: Page, name: string) {
	await openSidebar(page);
	await page.getByRole('button', { name, exact: true }).first().click();
}

const SIDEBAR_MODALS: Array<{ label: string; shot: string }> = [
	{ label: 'Branding', shot: 'm01-branding' },
	{ label: 'Badges', shot: 'm02-badges' },
	{ label: 'Users', shot: 'm03-add-user' },
	{ label: 'Play YouTube Video', shot: 'm04-play-youtube' },
	{ label: 'All Private Messages', shot: 'm05-all-private-messages' },
	{ label: 'Manage Followed Users', shot: 'm06-followed-users' }
	// 'Transcript History' is intentionally a disabled placeholder in RoomSidebar
	// (not-yet-wired, matching the reference) — no modal to snapshot.
];

for (const m of SIDEBAR_MODALS) {
	test(`sidebar modal: ${m.label}`, async ({ page }) => {
		await enterRoom(page);
		await openSidebarItem(page, m.label);
		await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 });
		await shot(page, m.shot);
	});
}

// ─────────────────────────────── Composer / toolbar / alerts controls ───────────────────────────────

test('composer: emoji picker opens', async ({ page }) => {
	await enterRoom(page);
	await page.getByRole('button', { name: 'Add Emojis' }).first().click();
	// The picker is a role="menu" popover (aria-label "Pick an emoji"), not a button.
	await expect(page.getByRole('menu', { name: 'Pick an emoji' }).first()).toBeVisible({
		timeout: 5_000
	});
	await shot(page, 't01-emoji-picker');
});

test('toolbar: volume settings dropdown', async ({ page }) => {
	await enterRoom(page);
	await page.getByRole('button', { name: 'Volume settings' }).click();
	await expect(page.getByRole('button', { name: 'Close volume settings' })).toBeVisible({
		timeout: 5_000
	});
	await shot(page, 't02-volume-dropdown');
});

test('alerts: Ask a question (Q&A) modal', async ({ page }) => {
	await enterRoom(page);
	await page.getByRole('button', { name: 'Ask a question' }).first().click();
	await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 });
	await shot(page, 't03-qa-modal');
});

test('alerts: Advanced Search modal', async ({ page }) => {
	await enterRoom(page);
	await page.getByRole('button', { name: 'Search alerts' }).first().click();
	await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 });
	await shot(page, 't04-advanced-search');
});

test('toolbar: recording preview panel', async ({ page }) => {
	await enterRoom(page);
	await page.getByRole('button', { name: 'Record', exact: true }).first().click();
	await expect(page.locator('.rec')).toBeVisible({ timeout: 8_000 });
	await shot(page, 't05-record-panel');
});
