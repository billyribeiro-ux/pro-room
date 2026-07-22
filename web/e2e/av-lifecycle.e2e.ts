import { test, expect } from '@playwright/test';

/**
 * AV lifecycle regression specs — the camera/mic "black tile that won't clear"
 * bug (BUG A). Root cause: livekit-client's setCameraEnabled(false) /
 * setMicrophoneEnabled(false) only MUTE the track (they don't unpublish), so the
 * publication lingered with a now-ended track and #refresh kept rendering a BLACK
 * tile. The fix unpublishes the track on stop.
 *
 * Needs synthetic media (playwright.config.ts passes
 * --use-fake-device-for-media-stream) so getUserMedia resolves headlessly, plus
 * the Rust API on :8081 (AUTH_DEV_BYPASS → the dev super-admin has
 * can_publish_screen, so the camera/mic controls are reachable) and a live room.
 */

const API = 'http://localhost:8081';
let roomId: string;

test.beforeAll(async ({ request }) => {
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

test('camera X removes the tile — no lingering black tile (BUG A)', async ({ page }) => {
	await page.goto(`/rooms/${roomId}`);

	// The Camera control enables once LiveKit connects.
	const startCam = page.getByRole('button', { name: 'Camera', exact: true });
	await expect(startCam).toBeEnabled({ timeout: 25_000 });
	await startCam.click();

	// The local webcam tile appears — only the local tile carries the X.
	const closeX = page.getByRole('button', { name: 'Turn off your camera' });
	await expect(closeX).toHaveCount(1, { timeout: 15_000 });
	await page.screenshot({ path: 'e2e/screenshots/f13-camera-on.png' });

	// Click the X. THE FIX: the tile is fully removed (pre-fix it lingered, black,
	// because the muted-but-published track kept #refresh re-adding it).
	await closeX.click();
	await expect(closeX).toHaveCount(0, { timeout: 10_000 });

	// Toolbar returns to the start-Camera state.
	await expect(page.getByRole('button', { name: 'Camera', exact: true })).toBeVisible();
});

test('mic start/stop completes without a thrown error (BUG A + AV-Settings regression)', async ({
	page
}) => {
	const consoleErrors: string[] = [];
	page.on('console', (m) => {
		if (m.type() === 'error') consoleErrors.push(m.text());
	});

	await page.goto(`/rooms/${roomId}`);
	const startMic = page.getByRole('button', { name: 'Microphone', exact: true });
	await expect(startMic).toBeEnabled({ timeout: 25_000 });
	await startMic.click();

	// Mic is publishing -> the Stop-microphone control appears.
	const stopMic = page.getByRole('button', { name: 'Stop microphone' });
	await expect(stopMic).toBeVisible({ timeout: 15_000 });
	await page.screenshot({ path: 'e2e/screenshots/f14-mic-on.png' });

	// Stop unpublishes cleanly and returns to the start state.
	await stopMic.click();
	await expect(page.getByRole('button', { name: 'Microphone', exact: true })).toBeVisible({
		timeout: 10_000
	});

	expect(
		consoleErrors.filter((e) => /OverconstrainedError|getUserMedia|microphone/i.test(e)),
		'no mic acquisition errors (switchActiveDevice exact=false fix)'
	).toEqual([]);
});
