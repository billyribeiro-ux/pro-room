/*
 * Shared forensic harness for pixel/behaviour matching OUR live app against the
 * reference captures. Used by the docs/forensics/* investigation.
 *
 * Why this exists: every forensic agent must measure identically — same width as
 * the reference capture, fonts actually loaded (the container's TLS interception
 * breaks Google Fonts unless ignoreHTTPSErrors is set), and a reliable way to
 * render the MEMBER view live (we intercept the /api/rooms/:id response and
 * rewrite capabilities/your_role to member level — no backend changes).
 *
 * Run scripts that import this from the web/ dir so node resolves @playwright/test:
 *   cd web && node scripts/<your-script>.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

export const ROOM_ID = 'aea3ca10-30b3-4b16-9763-2bab0a545a0d';
export const ROOM_URL = `http://localhost:5174/rooms/${ROOM_ID}`;

// Member capability set: everything an admin can do, off — only basic chat on.
const MEMBER_CAPS = {
	can_manage_room: false,
	can_manage_members: false,
	can_post_alert: false,
	can_publish_screen: false,
	can_post_message: true
};

/**
 * Launch a room page as `presenter` (default, dev-bypass super-admin) or `member`
 * (capabilities rewritten via response interception). Reference full captures are
 * 1988px (proroom-full-*) / 2027px (proroom-ultra-admin) — pass the matching width.
 * Returns { browser, context, page, errors, failed }.
 */
export async function openRoom({ role = 'presenter', width = 1988, height = 1200 } = {}) {
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width, height },
		ignoreHTTPSErrors: true, // so Open Sans / Lato actually load
		deviceScaleFactor: 1
	});
	const page = await context.newPage();
	const errors = [];
	const failed = [];
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
	page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));

	if (role === 'member') {
		await context.route(`**/api/rooms/${ROOM_ID}`, async (route) => {
			const resp = await route.fetch();
			let json;
			try {
				json = await resp.json();
			} catch {
				return route.fulfill({ response: resp });
			}
			json.your_role = 'member';
			json.is_member = true;
			json.capabilities = { ...json.capabilities, ...MEMBER_CAPS };
			route.fulfill({ response: resp, body: JSON.stringify(json) });
		});
	}

	await page
		.goto(ROOM_URL, { waitUntil: 'networkidle', timeout: 45000 })
		.catch((e) => errors.push('GOTO: ' + e.message));
	await page.waitForTimeout(1500);
	// Guarantee web fonts are applied before any measurement (Open Sans / Lato).
	await page.evaluate(() => (document.fonts ? document.fonts.ready : null)).catch(() => {});
	await page.waitForTimeout(300);
	return { browser, context, page, errors, failed };
}

/** Visual computed-style props to diff (mirrors web/scripts/pixel-diff.mjs). */
export const PROPS = [
	'display',
	'position',
	'box-sizing',
	'width',
	'height',
	'background-color',
	'color',
	'font-family',
	'font-size',
	'font-weight',
	'font-style',
	'line-height',
	'letter-spacing',
	'text-transform',
	'text-align',
	'padding-top',
	'padding-right',
	'padding-bottom',
	'padding-left',
	'margin-top',
	'margin-right',
	'margin-bottom',
	'margin-left',
	'border-top-width',
	'border-right-width',
	'border-bottom-width',
	'border-left-width',
	'border-top-color',
	'border-top-style',
	'border-top-left-radius',
	'border-top-right-radius',
	'border-bottom-right-radius',
	'border-bottom-left-radius',
	'gap',
	'opacity',
	'box-shadow',
	'flex-direction',
	'justify-content',
	'align-items'
];

/** Normalise a CSS value the way pixel-diff does (rgb→hex, round px) for clean equality. */
export function norm(v) {
	if (v == null) return v;
	const m = String(v).match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
	if (m) {
		const a = m[4] === undefined ? 1 : parseFloat(m[4]);
		if (a === 0) return 'transparent';
		const hex = '#' + [m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, '0')).join('');
		return a === 1 ? hex : `${hex}@${a}`;
	}
	return String(v).replace(/(\d+\.\d+)px/g, (_, n) => Math.round(+n) + 'px');
}

/** getComputedStyle for the first match of `selector`, limited to `props`, normalised. */
export async function computed(page, selector, props = PROPS) {
	return page.evaluate(
		({ selector, props }) => {
			const el = document.querySelector(selector);
			if (!el) return null;
			const cs = getComputedStyle(el);
			const out = {};
			for (const p of props) out[p] = cs.getPropertyValue(p);
			const r = el.getBoundingClientRect();
			out['__rect'] = { x: r.x, y: r.y, w: r.width, h: r.height };
			return out;
		},
		{ selector, props }
	);
}

/** Bounding rect for the first match. */
export async function rect(page, selector) {
	return page.evaluate((s) => {
		const el = document.querySelector(s);
		if (!el) return null;
		const r = el.getBoundingClientRect();
		return { x: r.x, y: r.y, w: r.width, h: r.height };
	}, selector);
}

export async function shot(page, absPath, opts = {}) {
	await page.screenshot({ path: absPath, fullPage: opts.fullPage ?? false, ...opts });
	return absPath;
}

export function loadAudit(surface) {
	return JSON.parse(
		fs.readFileSync(new URL(`../../script-results/audit/${surface}.json`, import.meta.url))
	);
}
export function loadCapture(name) {
	return JSON.parse(
		fs.readFileSync(new URL(`../../docs/reference/captures/${name}.json`, import.meta.url))
	);
}
