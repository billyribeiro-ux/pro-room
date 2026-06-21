import { test, expect } from '@playwright/test';

/**
 * Screen-share lifecycle + the stage controls (zoom / snapshot / fullscreen).
 * getDisplayMedia is mocked with a live <canvas> capture stream so the whole
 * publish→render path runs headlessly (no real desktop picker). Needs the Rust
 * API on :8081 (AUTH_DEV_BYPASS → super-admin can_publish_screen).
 */

const API = 'http://localhost:8081';
let roomId: string;

test.beforeAll(async ({ request }) => {
	const res = await request.get(`${API}/api/rooms`);
	expect(res.ok()).toBeTruthy();
	const rooms = (await res.json()) as Array<{ id: string; is_live: boolean }>;
	const room = rooms.find((r) => r.is_live) ?? rooms[0];
	roomId = room.id;
	if (!room.is_live)
		await request.post(`${API}/api/rooms/${roomId}/live`, { data: { is_live: true } });
});

// Replace getDisplayMedia with a moving canvas stream (headless screen capture).
const MOCK_DISPLAY_MEDIA = () => {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 360;
	const ctx = canvas.getContext('2d');
	let f = 0;
	setInterval(() => {
		if (!ctx) return;
		ctx.fillStyle = `hsl(${(f++ * 4) % 360}, 70%, 45%)`;
		ctx.fillRect(0, 0, 640, 360);
		ctx.fillStyle = '#fff';
		ctx.font = '32px sans-serif';
		ctx.fillText('SHARED SCREEN ' + f, 24, 190);
	}, 100);
	navigator.mediaDevices.getDisplayMedia = async () =>
		(canvas as HTMLCanvasElement & { captureStream(fps: number): MediaStream }).captureStream(10);
};

test('screen share renders in the stage and the zoom/snapshot/stop controls work', async ({
	page
}) => {
	await page.addInitScript(MOCK_DISPLAY_MEDIA);
	await page.goto(`/rooms/${roomId}`);
	await expect(page.locator('.main-stage')).toBeVisible({ timeout: 20_000 });

	// Wait for LiveKit to connect (the share control enables).
	const shareBtn = page.getByRole('button', { name: 'Start/Stop Screen Sharing' });
	await expect(shareBtn).toBeEnabled({ timeout: 25_000 });

	// Open the source menu → "Share Screen" (browser getDisplayMedia, now mocked).
	await shareBtn.click();
	await page.getByRole('menuitem', { name: 'Share Screen' }).click();

	// THE FIX TARGET: the shared screen loads in the stage.
	await expect(page.locator('.screencast-pan video')).toBeVisible({ timeout: 15_000 });
	await expect(page.locator('.screens-tabs .nav-link')).toContainText('(you)');

	// Zoom control changes the video transform (1× → 1.5×).
	const container = page.locator('.video-screen-container');
	const t0 = await container.evaluate((el) => getComputedStyle(el).transform);
	await page.getByRole('button', { name: 'Zoom' }).click();
	await expect
		.poll(async () => container.evaluate((el) => getComputedStyle(el).transform), {
			timeout: 3_000
		})
		.not.toBe(t0);

	// Snapshot control downloads a PNG.
	const dl = page.waitForEvent('download', { timeout: 6_000 });
	await page.getByRole('button', { name: 'Snapshot' }).click();
	expect((await dl).suggestedFilename()).toMatch(/proom-screenshot.*\.png/);

	// Stop sharing clears the stage.
	await page.getByRole('button', { name: 'Stop sharing' }).click();
	await expect(page.locator('.screencast-pan video')).toHaveCount(0, { timeout: 8_000 });
});
