/*
 * Evidence-based pixel diff. Captures OUR app at the reference width (1017px) and
 * diffs computed styles, property-by-property, against the reference capture.
 * Precise element pairs + noise filtering so every reported delta is actionable.
 *
 * Run: node scripts/pixel-diff.mjs   (needs web dev server :5174 + Rust API :8081)
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';

const REF = JSON.parse(fs.readFileSync(os.homedir() + '/Downloads/proroom-ultra-member-room.json', 'utf8'));
const ROOM = 'http://localhost:5174/rooms/aea3ca10-30b3-4b16-9763-2bab0a545a0d';

const norm = (v) => {
	if (v == null) return v;
	const m = String(v).match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
	if (m) {
		const a = m[4] === undefined ? 1 : parseFloat(m[4]);
		if (a === 0) return 'transparent';
		const hex = '#' + [m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, '0')).join('');
		return a === 1 ? hex : `${hex}@${a}`;
	}
	return String(v).replace(/(\d+\.\d+)px/g, (_, n) => Math.round(+n) + 'px');
};

// Compared properties (visual). height/min-height/font-family/gap/text-align excluded as noise.
const PROPS = [
	'background-color', 'color', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform',
	'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
	'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
	'border-top-width', 'border-bottom-width', 'border-left-width', 'border-right-width',
	'border-top-color', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
	'opacity'
];

// role -> [ our CSS selector , reference element predicate(e) ]
const MAP = [
	['dock panel', '.dock', (e) => (e.class || '').includes('alert-chat-box')],
	['stage panel', '.main-stage', (e) => (e.class || '').includes('presentation-box')],
	['top nav', '.topnav', (e) => (e.class || '').includes('navbar') && (e.class || '').includes('fixed-top')],
	['alerts header', '.alerts-pane section.panel > header', (e) => (e.class || '').includes('chat-nav') && !(e.class || '').includes('pm')],
	['msg row', '.alerts-pane li.msg-box', (e) => (e.class || '').includes('msg-box') && !(e.class || '').includes('adm')],
	['username', '.alerts-pane .username', (e) => (e.class || '').split(' ').includes('username')],
	['timestamp', '.alerts-pane .created-at', (e) => (e.class || '').includes('created-at')],
	['body text', '.alerts-pane .body .message-body', (e) => (e.class || '').includes('text-formated')],
	['date separator', '.alerts-pane .separator', (e) => (e.class || '').split(' ').includes('separator')],
	['menu trigger', '.alerts-pane .menu-trigger', (e) => (e.class || '').includes('msgMenu')],
	['sidebar item', 'aside.sidebar .item', (e) => (e.class || '').includes('sidebar-item')],
	['stage tab active', '.tabbar button.active', (e) => (e.class || '').includes('nav-link') && (e.class || '').includes('active') && norm(e.style['background-color']) === '#45a2ff']
];

function refStyleFor(pred) { for (const e of REF.elements) if (pred(e)) return e.style; return null; }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1017, height: 1244 } });
await page.goto(ROOM, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.main-stage', { timeout: 20000 });
await page.waitForTimeout(800);

let total = 0;
for (const [role, sel, pred] of MAP) {
	const refStyle = refStyleFor(pred);
	const ourStyle = await page.evaluate((s) => {
		const el = document.querySelector(s);
		if (!el) return null;
		const cs = getComputedStyle(el);
		const o = {};
		for (const p of cs) o[p] = cs.getPropertyValue(p);
		return o;
	}, sel);
	if (!ourStyle) { console.log(`\n### ${role}  — OUR selector not found: ${sel}`); continue; }
	if (!refStyle) { console.log(`\n### ${role}  — reference element not found`); continue; }
	const deltas = [];
	for (const p of PROPS) {
		// skip border color/radius noise when the corresponding edge has no width
		if (p === 'border-top-color' && norm(ourStyle['border-top-width']) === '0px' && norm(refStyle['border-top-width']) === '0px') continue;
		const o = norm(ourStyle[p]);
		const r = norm(refStyle[p]);
		if (o !== r) deltas.push(`    ${p}: ours=${o}  ref=${r}`);
	}
	total += deltas.length;
	if (deltas.length) { console.log(`\n### ${role}  — ${deltas.length} deltas`); console.log(deltas.join('\n')); }
	else console.log(`### ${role}  ✓`);
}
console.log(`\n===== TOTAL ACTIONABLE DELTAS: ${total} =====`);
await browser.close();
