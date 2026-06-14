import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the pro-room web app.
 *
 * Network shape: the SvelteKit app talks DIRECTLY to the Rust API at
 * `PUBLIC_API_URL` (default http://localhost:8081) with `credentials: 'include'`
 * — there is no vite proxy. So two servers must be up for a run:
 *
 *   1. The Rust API on :8081 with `AUTH_DEV_BYPASS=true` (every request is served
 *      as a synthetic super-admin, so the suite needs no login). Start it with
 *      `cd server && ./target/debug/server` (or `cargo run`).
 *   2. The web dev server — managed by Playwright below.
 *
 * We use `vite dev` (NOT `build && preview`): the app reads `$env/dynamic/public`
 * at runtime, which `vite preview` of a static build does not inject, so a preview
 * build would fall back to the wrong API port and bounce every test to /login.
 * `vite dev` honours `.env` (PUBLIC_API_URL=http://localhost:8081) correctly.
 *
 * Port 5174 (not the Playwright-default 4173) is deliberate: the API only echoes
 * CORS `Access-Control-Allow-Origin` for the dev origins in `APP_CORS_ORIGINS`
 * (http://localhost:5173,5174). A credentialed `/api/auth/me` from any other
 * origin is blocked by the browser → no user → redirect to /login. So the e2e web
 * server must run on an allow-listed origin. `reuseExistingServer` lets it attach
 * to an already-running `vite dev` on 5174.
 */
export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',
	timeout: 60_000,
	expect: { timeout: 10_000 },
	fullyParallel: false,
	workers: 1,
	reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
	use: {
		baseURL: 'http://localhost:5174',
		viewport: { width: 1680, height: 950 },
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
		...devices['Desktop Chrome'],
	},
	webServer: {
		command: 'vite dev --port 5174 --strictPort',
		port: 5174,
		reuseExistingServer: true,
		timeout: 120_000,
	},
});
