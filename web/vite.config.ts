import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';

/** Local Rust API — always hit loopback IPv4 (API binds 0.0.0.0, not [::]). */
const API_TARGET = process.env.PROOM_API_PROXY ?? 'http://127.0.0.1:8080';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	],
	server: {
		// Listen on IPv4 + IPv6 so both http://localhost and http://127.0.0.1 work.
		host: true,
		port: 5173,
		strictPort: true,
		// Same-origin /api in dev → session cookie is first-party (no cross-port CORS cookie pain).
		proxy: {
			'/api': {
				target: API_TARGET,
				changeOrigin: true,
				ws: true
			},
			'/health': {
				target: API_TARGET,
				changeOrigin: true
			}
		}
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
