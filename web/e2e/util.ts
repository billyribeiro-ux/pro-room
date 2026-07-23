import type { Page } from '@playwright/test';

/**
 * Recover from an auth bounce to /login. With AUTH_DEV_BYPASS the server
 * answers /api/auth/me with a super-admin and no bounce happens; without it
 * the app redirects to /login — sign in via the dev-login helper button so
 * the suite is green under BOTH server configurations.
 */
export async function devLoginIfBounced(page: Page, roomPath: string): Promise<void> {
	try {
		await page.waitForURL(/\/login/, { timeout: 3_000 });
	} catch {
		return; // no bounce — bypass active
	}
	await page.getByRole('button', { name: /demo admin/i }).click();
	try {
		await page.waitForURL(/\/rooms\//, { timeout: 10_000 });
	} catch {
		await page.goto(roomPath);
	}
}

import type { APIRequestContext } from '@playwright/test';

/**
 * Resolve the Rust API base: honor PROOM_API, else probe 8080 (the Vite proxy
 * default) then 8081 (the documented standalone port). The dev environment has
 * drifted between the two mid-session; probing keeps the suite green wherever
 * the server actually listens.
 */
export async function resolveApi(request: APIRequestContext): Promise<string> {
	const candidates = [process.env.PROOM_API, 'http://localhost:8080', 'http://localhost:8081'];
	for (const base of candidates) {
		if (!base) continue;
		try {
			const r = await request.get(`${base}/api/rooms`, { timeout: 2_000 });
			if (r.ok()) return base;
		} catch {
			/* not listening — try next */
		}
	}
	throw new Error('No Rust API answering /api/rooms on PROOM_API/:8080/:8081 — start the server');
}
