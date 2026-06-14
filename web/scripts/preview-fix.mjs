/*
 * PROPOSED-FIX PREVIEW (non-destructive). Renders OUR live app, screenshots the
 * CURRENT state, injects the proposed CSS at runtime (no source edits), screenshots
 * the PROPOSED state, and composes CURRENT | PROPOSED rows with the reference value.
 * Lets us eyeball whether a fix matches the reference BEFORE changing any code.
 *
 *   cd web && node scripts/preview-fix.mjs <surface>
 */
import { openRoom } from './forensic-lib.mjs';
import fs from 'node:fs';

const SURFACE = process.argv[2] || 'sidebar';
const OUT = `/home/user/pro-room/docs/forensics/shots/preview-${SURFACE}.png`;

const { browser, page, errors } = await openRoom({ role: 'presenter', width: 1440, height: 900 });

// sanity: app actually rendered (guard against blank screenshots)
const topnavText = await page.evaluate(() => document.querySelector('nav.topnav')?.innerText || '');
if (!topnavText.includes('Pro Trading Room')) {
	console.error('ABORT: app did not render (topnav empty) — stack down?');
	await browser.close();
	process.exit(1);
}

// open the sidebar drawer
const ham = await page.$('button[aria-label="Toggle sidebar"]');
if (ham) { await ham.click(); await page.waitForTimeout(600); }

const clip = { x: 0, y: 0, width: 270, height: 820 };

async function nonBlank(buf) {
	// quick heuristic: PNG of a blank white region is tiny; real content is larger
	return buf.length > 3000;
}

// CURRENT
const beforeBuf = await page.screenshot({ clip });
// inject proposed fixes (sidebar): separator opacity, roster mini-btn height, item hover
await page.addStyleTag({ content: `
	/* T1.2 separator opacity 1 -> 0.25 (ref AUD[9].opacity) */
	aside.sidebar hr, .sidebar .sep { opacity: 0.25 !important; }
	/* T1.3 roster mini button height 20 -> 27 (ref AUD[41].height) */
	.sidebar .mini { height: 27px !important; line-height: 21px !important; }
	/* T1.1 item hover bg #e9ecef->#111111, color accent->inherit (ref .sidebar-item:hover) */
	.sidebar .item:hover, .sidebar .sub-item:hover { background: #111111 !important; color: inherit !important; }
` });
// force-hover a representative item so the hover change is visible in a static shot
await page.evaluate(() => {
	const items = [...document.querySelectorAll('.sidebar .item')];
	const target = items.find((e) => /General Settings/i.test(e.textContent)) || items[1] || items[0];
	if (target) target.setAttribute('data-preview-hover', '');
});
await page.addStyleTag({ content: `
	.sidebar .item[data-preview-hover] { background: #111111 !important; color: inherit !important; }
` });
await page.waitForTimeout(300);
const afterBuf = await page.screenshot({ clip });

if (!(await nonBlank(beforeBuf)) || !(await nonBlank(afterBuf))) {
	console.error('ABORT: a screenshot was blank (before=' + beforeBuf.length + ' after=' + afterBuf.length + ')');
	await browser.close();
	process.exit(1);
}

const before64 = beforeBuf.toString('base64');
const after64 = afterBuf.toString('base64');
const notes = [
	'separator opacity 1 → 0.25 (ref AUD[9])',
	'roster mini-btn height 20px → 27px (ref AUD[41])',
	'item hover #e9ecef/blue → #111111/inherit (ref .sidebar-item:hover !important)'
];
await page.setViewportSize({ width: clip.width * 2 + 60, height: clip.height + 160 });
await page.evaluate(({ before64, after64, w, notes }) => {
	document.documentElement.style.cssText = 'margin:0';
	document.body.style.cssText = `margin:0;background:#1b1b1b;color:#fff;font:13px/1.5 'Open Sans',sans-serif`;
	const col = (t, c, img) => `<div style="flex:0 0 ${w}px"><div style="padding:6px 10px;background:${c};font-weight:700">${t}</div><img src="data:image/png;base64,${img}" style="display:block;width:${w}px;border:1px solid #333"></div>`;
	document.body.innerHTML =
		`<div style="display:flex;gap:20px;padding:14px">${col('CURRENT (ours, live)', '#7a3030', before64)}${col('PROPOSED (CSS preview — not yet applied)', '#2d6a2d', after64)}</div>` +
		`<div style="padding:0 14px 14px"><b>Proposed sidebar fixes (preview only, no source changed):</b><ul>${notes.map((n) => '<li>' + n + '</li>').join('')}</ul></div>`;
}, { before64, after64, w: clip.width, notes });
await page.waitForTimeout(200);
const h = await page.evaluate(() => document.body.scrollHeight);
await page.setViewportSize({ width: clip.width * 2 + 60, height: h });
await page.screenshot({ path: OUT, fullPage: true });
console.log('WROTE ' + OUT + ' | before=' + beforeBuf.length + 'B after=' + afterBuf.length + 'B | console errors=' + errors.length);
await browser.close();
