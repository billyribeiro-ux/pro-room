/*
 * Multi-surface PROPOSED-FIX previews (non-destructive). For each surface: render
 * our live app, screenshot CURRENT, apply the proposed change at runtime (CSS
 * inject or a state action), screenshot PROPOSED, compose side-by-side with the
 * reference value. NO source files are modified.
 *
 *   cd web && node scripts/preview-all.mjs
 */
import { openRoom } from './forensic-lib.mjs';

const SHOTS = '/home/user/pro-room/docs/forensics/shots';

async function rectOf(page, sel) {
	return page.evaluate((s) => {
		const el = document.querySelector(s);
		if (!el) return null;
		const r = el.getBoundingClientRect();
		return {
			x: Math.max(0, Math.floor(r.x)),
			y: Math.max(0, Math.floor(r.y)),
			width: Math.ceil(r.width),
			height: Math.ceil(r.height)
		};
	}, sel);
}
function pad(c, p, W, H) {
	return {
		x: Math.max(0, c.x - p),
		y: Math.max(0, c.y - p),
		width: Math.min(W - Math.max(0, c.x - p), c.width + 2 * p),
		height: Math.min(H - Math.max(0, c.y - p), c.height + 2 * p)
	};
}
async function compose(page, name, title, beforeBuf, afterBuf, notes, w) {
	if (beforeBuf.length < 2500 || afterBuf.length < 2500) {
		console.error(
			'SKIP ' + name + ': blank shot (b=' + beforeBuf.length + ' a=' + afterBuf.length + ')'
		);
		return false;
	}
	const b = beforeBuf.toString('base64'),
		a = afterBuf.toString('base64');
	await page.setViewportSize({ width: w * 2 + 60, height: 1400 });
	await page.evaluate(
		({ b, a, w, title, notes }) => {
			document.documentElement.style.cssText = 'margin:0';
			document.body.style.cssText = `margin:0;background:#1b1b1b;color:#fff;font:13px/1.5 'Open Sans',sans-serif`;
			const col = (t, c, img) =>
				`<div style="flex:0 0 ${w}px"><div style="padding:6px 10px;background:${c};font-weight:700">${t}</div><img src="data:image/png;base64,${img}" style="display:block;width:${w}px;border:1px solid #333"></div>`;
			document.body.innerHTML =
				`<div style="padding:10px 14px 4px;font-weight:700;font-size:15px">${title}</div>` +
				`<div style="display:flex;gap:20px;padding:6px 14px">${col('CURRENT (ours, live)', '#7a3030', b)}${col('PROPOSED (preview — not applied)', '#2d6a2d', a)}</div>` +
				`<div style="padding:6px 14px 14px"><ul>${notes.map((n) => '<li>' + n + '</li>').join('')}</ul></div>`;
		},
		{ b, a, w, title, notes }
	);
	await page.waitForTimeout(150);
	const h = await page.evaluate(() => document.body.scrollHeight);
	await page.setViewportSize({ width: w * 2 + 60, height: h });
	await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
	console.log('WROTE ' + name + '.png');
	return true;
}

const W = 1440,
	H = 900;

// ---------- STAGE: default tab Screens -> Notes ----------
{
	const { browser, page } = await openRoom({ role: 'presenter', width: W, height: H });
	const stage = (await rectOf(page, '.main-stage, [class*="main-stage"], [class*="stage"]')) || {
		x: 410,
		y: 49,
		width: 1030,
		height: 760
	};
	const clip = pad(stage, 0, W, H);
	const before = await page.screenshot({ clip });
	// proposed: Notes becomes the default-active tab → click Notes to show that state
	await page.evaluate(() => {
		const t = [
			...document.querySelectorAll('button[role="tab"], .tabbar button, [class*="tab"] button')
		].find((b) => /^\s*Notes/i.test(b.textContent));
		if (t) t.click();
	});
	await page.waitForTimeout(500);
	const after = await page.screenshot({ clip });
	await compose(
		page,
		'preview-stage',
		'Stage default tab — Screens → Notes (P0)',
		before,
		after,
		[
			'Reference loads with the NOTES tab active: targeted[27] a#notes-tab.active, subtrees.presentation #notes.tab-pane.active.show',
			"Fix: MainStage.svelte:63 $state('screens') → 'notes' (locked rooms still force Screens via the derived activeTab)"
		],
		clip.width
	);
	await browser.close();
}

// ---------- TOPNAV: user pill margin/height ----------
{
	const { browser, page } = await openRoom({ role: 'presenter', width: W, height: H });
	const clip = { x: 0, y: 0, width: 360, height: 52 }; // left cluster (bars + user pill + brand)
	const before = await page.screenshot({ clip });
	await page.addStyleTag({
		content: `
		nav.topnav .users { margin: 0 4px !important; gap: 0 !important; height: 18px !important; align-items: center !important; }
	`
	});
	await page.waitForTimeout(200);
	const after = await page.screenshot({ clip });
	await compose(
		page,
		'preview-topnav',
		'Topnav user pill — margin 5→4px, height 25→18px',
		before,
		after,
		[
			'Reference: audit/topnav.json[48] margin-l/r = 4px (Bootstrap ml-1 mr-1), rect.h = 18px',
			'Fix: RoomTopNav.svelte:275 margin 0 5px → 0 4px; :266 reduce gap so the pill resolves to 18px'
		],
		clip.width
	);
	await browser.close();
}

// ---------- CHAT: composer shape & metrics ----------
{
	const { browser, page } = await openRoom({ role: 'presenter', width: W, height: H });
	// chat composer pill is at bottom-left dock; measure it
	const pill = (await rectOf(
		page,
		'.chat-pane form .pill, .chat-pane .pill, [class*="chat"] form .pill'
	)) || { x: 0, y: 840, width: 560, height: 56 };
	const clip = pad(pill, 12, W, H);
	const before = await page.screenshot({ clip });
	await page.addStyleTag({
		content: `
		.chat-pane form .pill, [class*="chat"] .pill { border-radius: 8px !important; }
		.chat-pane form .pill textarea, [class*="chat"] .pill textarea { min-height: 35px !important; font-weight: 400 !important; }
		.chat-pane form .pill textarea::placeholder, [class*="chat"] .pill textarea::placeholder { color: #999999 !important; }
	`
	});
	await page.waitForTimeout(200);
	const after = await page.screenshot({ clip });
	await compose(
		page,
		'preview-chat',
		'Chat composer — pill→8px radius, textarea 30→35px / 300→400, placeholder #999',
		before,
		after,
		[
			'Reference: #textAreaHolder border-radius 8px; .txt-area height/min-height 35px, weight 400; .form-control::placeholder #999999',
			'Fix: ChatPanel.svelte:538 radius 999px→8px; :541-556 min-height 35px + weight 400; add ::placeholder #999999'
		],
		clip.width
	);
	await browser.close();
}
console.log('DONE');
