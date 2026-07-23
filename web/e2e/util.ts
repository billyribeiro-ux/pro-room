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
