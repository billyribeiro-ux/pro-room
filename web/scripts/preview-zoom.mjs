/*
 * ZOOMED CURRENT-vs-PROPOSED previews for the topnav user pill and chat composer,
 * with MEASURED current values vs ground-truth targets overlaid. Non-destructive
 * (CSS injected at runtime). Magnifies tight crops so small deltas are visible.
 *   cd web && node scripts/preview-zoom.mjs
 */
import { openRoom } from './forensic-lib.mjs';
const SHOTS = '/home/user/pro-room/docs/forensics/shots';
const W = 1440, H = 900, SCALE = 3;

const measure = (page, sel, props) => page.evaluate(({ sel, props }) => {
	const el = document.querySelector(sel); if (!el) return null;
	const cs = getComputedStyle(el); const o = {};
	for (const p of props) o[p] = cs.getPropertyValue(p);
	const r = el.getBoundingClientRect(); o.__rect = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
	return o;
}, { sel, props });

async function composeZoom(page, name, title, clip, before, after, rows) {
	const b = before.toString('base64'), a = after.toString('base64');
	const dispW = clip.width * SCALE, dispH = clip.height * SCALE;
	await page.setViewportSize({ width: dispW * 2 + 60, height: dispH + 220 });
	await page.evaluate(({ b, a, dw, dh, title, rows }) => {
		document.documentElement.style.cssText = 'margin:0';
		document.body.style.cssText = "margin:0;background:#1b1b1b;color:#fff;font:14px/1.6 'Open Sans',sans-serif";
		const col = (t, c, img) => `<div style="flex:0 0 ${dw}px"><div style="padding:6px 10px;background:${c};font-weight:700">${t}</div><img src="data:image/png;base64,${img}" style="display:block;width:${dw}px;height:${dh}px;image-rendering:-webkit-optimize-contrast;border:1px solid #333;background:#0c2434"></div>`;
		const table = '<table style="border-collapse:collapse;margin:10px 14px">' +
			'<tr style="text-align:left"><th style="padding:3px 14px 3px 0">property</th><th style="padding:3px 24px 3px 0;color:#e08a8a">CURRENT (measured)</th><th style="color:#8ad28a">PROPOSED = ground truth</th></tr>' +
			rows.map((r) => `<tr><td style="padding:2px 14px 2px 0">${r[0]}</td><td style="padding:2px 24px 2px 0;color:#e08a8a">${r[1]}</td><td style="color:#8ad28a">${r[2]}</td></tr>`).join('') + '</table>';
		document.body.innerHTML = `<div style="padding:12px 14px 2px;font-weight:700;font-size:16px">${title}</div>` +
			`<div style="display:flex;gap:20px;padding:6px 14px">${col('CURRENT (ours, live)', '#7a3030', b)}${col('PROPOSED (preview — not applied)', '#2d6a2d', a)}</div>` + table;
	}, { b, a, dw: dispW, dh: dispH, title, rows });
	await page.waitForTimeout(150);
	const hh = await page.evaluate(() => document.body.scrollHeight);
	await page.setViewportSize({ width: dispW * 2 + 60, height: hh });
	await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

// ---------------- TOPNAV PILL ----------------
{
	const { browser, page } = await openRoom({ role: 'presenter', width: W, height: H });
	const sel = '.users, nav.topnav .users';
	const cur = await measure(page, sel, ['height', 'margin-left', 'margin-right', 'gap', 'padding-top', 'line-height']);
	console.log('TOPNAV .users CURRENT =', JSON.stringify(cur));
	const clip = { x: 0, y: 0, width: 200, height: 50 };
	const before = await page.screenshot({ clip });
	await page.addStyleTag({ content: `.users, nav.topnav .users { margin-left:4px !important; margin-right:4px !important; gap:0 !important; height:18px !important; align-items:center !important; }` });
	await page.waitForTimeout(150);
	const aft = await measure(page, sel, ['height', 'margin-left', 'margin-right']);
	const after = await page.screenshot({ clip });
	await composeZoom(page, 'preview-zoom-topnav', 'Topnav user pill (zoom ×3) — ground truth: height 18px, margin 4px', clip, before, after, [
		['height', (cur ? cur.height : '?') + '  (rect h=' + (cur && cur.__rect ? cur.__rect.h : '?') + ')', '18px'],
		['margin-left / right', (cur ? cur['margin-left'] + ' / ' + cur['margin-right'] : '?'), '4px / 4px'],
		['line-height', cur ? cur['line-height'] : '?', '21px (unchanged)'],
		['border', '1px solid #fff (unchanged)', '1px solid #fff']
	]);
	console.log('TOPNAV after-inject height =', aft && aft.height);
	await browser.close();
}

// ---------------- CHAT COMPOSER ----------------
{
	const { browser, page } = await openRoom({ role: 'presenter', width: W, height: H });
	const pillSel = '.chat-pane .pill, .chat-pane form .pill, [class*="chat"] .pill';
	const taSel = '.chat-pane .pill textarea, [class*="chat"] .pill textarea';
	const curPill = await measure(page, pillSel, ['border-top-left-radius', 'border-top-width', 'background-color']);
	const curTa = await measure(page, taSel, ['min-height', 'height', 'font-weight', 'color']);
	console.log('CHAT pill CURRENT =', JSON.stringify(curPill));
	console.log('CHAT textarea CURRENT =', JSON.stringify(curTa));
	const pr = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }, pillSel);
	const clip = pr ? { x: Math.max(0, pr.x - 6), y: Math.max(0, pr.y - 8), width: Math.min(W, pr.w + 12), height: pr.h + 16 } : { x: 0, y: H - 70, width: 560, height: 64 };
	const before = await page.screenshot({ clip });
	await page.addStyleTag({ content: `
		.chat-pane .pill, [class*="chat"] .pill { border-radius:8px !important; border-width:0 !important; background:#fff !important; }
		.chat-pane .pill textarea, [class*="chat"] .pill textarea { min-height:35px !important; font-weight:400 !important; }
		.chat-pane .pill textarea::placeholder, [class*="chat"] .pill textarea::placeholder { color:#999999 !important; }
	` });
	await page.waitForTimeout(150);
	const after = await page.screenshot({ clip });
	await composeZoom(page, 'preview-zoom-chat', 'Chat composer (zoom ×3) — ground truth: #textAreaHolder radius 8px / border 0, .txt-area 35px / weight 400, placeholder #999', clip, before, after, [
		['holder radius', curPill ? curPill['border-top-left-radius'] : '?', '8px'],
		['holder border', curPill ? curPill['border-top-width'] : '?', '0px'],
		['textarea min-height', curTa ? (curTa['min-height'] + ' / h=' + curTa.height) : '?', '35px'],
		['textarea font-weight', curTa ? curTa['font-weight'] : '?', '400'],
		['placeholder color', 'inherited (~#6a7282)', '#999999']
	]);
	await browser.close();
}
console.log('DONE');
