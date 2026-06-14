/*
 * pro-room PIXEL CAPTURE — run in the DevTools console ON THE REAL APP
 * (protradingroom.com / PTRChat), while logged in and viewing the room.
 *
 * It downloads `proroom-pixel-<LABEL>.json` containing the ground truth needed to
 * make our clone pixel-perfect:
 *   - every readable stylesheet's full CSS text (their real rules, not eyeballed)
 *   - @font-face rules + the font FILE urls (download those too)
 *   - all CSS custom properties on :root/body (Bootstrap --bs-* + their overrides)
 *   - frequency-sorted palette + spacing/radius/shadow/type SCALES actually used
 *   - per-element computed styles + pixel rects for every visually-significant node
 *   - image + background-image asset urls
 *
 * Capture each STATE separately: set LABEL, open the view (room, a modal, the
 * sidebar, the post-alert dialog, …), then run. Send me every JSON it downloads,
 * plus the font/CSS urls it prints (anything cross-origin it couldn't read inline).
 */
(async () => {
	const LABEL = 'room'; // ← change per state: 'room' | 'post-alert' | 'sidebar' | 'session-control' | ...

	// Computed-style properties that matter for pixel parity (longhands so
	// getComputedStyle returns real values, not empty shorthands).
	const PROPS = [
		'display', 'box-sizing', 'position', 'top', 'right', 'bottom', 'left',
		'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
		'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
		'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
		'border-top-color', 'border-top-style', 'border-radius',
		'box-shadow', 'outline', 'opacity',
		'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat',
		'color', 'font-family', 'font-size', 'font-weight', 'font-style',
		'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'white-space',
		'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap',
		'grid-template-columns', 'grid-template-rows',
		'z-index', 'overflow-x', 'overflow-y', 'cursor', 'transition', 'transform',
		'backdrop-filter', 'filter'
	];

	const OUT = {
		meta: {
			url: location.href,
			label: LABEL,
			capturedAt: new Date().toISOString(),
			viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
			userAgent: navigator.userAgent
		},
		cssVariables: {},
		fonts: {},
		stylesheets: [],
		palette: {},
		components: {},
		elements: [],
		assets: {}
	};

	const snap = (el) => {
		const cs = getComputedStyle(el);
		const o = {};
		for (const p of PROPS) o[p] = cs.getPropertyValue(p);
		return o;
	};
	const rectOf = (el) => {
		const r = el.getBoundingClientRect();
		return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
	};
	const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
	const urlsIn = (text) => (text.match(/url\(([^)]+)\)/g) || []).map((u) => abs(u.replace(/url\(|\)|["']/g, '')));

	// --- fonts: wait for load, list loaded faces ---
	try { await (document.fonts ? document.fonts.ready : Promise.resolve()); } catch {}
	const loaded = new Set();
	try { document.fonts.forEach((f) => loaded.add(`${f.family} | ${f.style} | ${f.weight} | ${f.status}`)); } catch {}
	OUT.fonts.loaded = [...loaded];

	// --- stylesheets: read inline; fall back to fetch for cross-origin ---
	const fontUrls = new Set();
	const fontFaceRules = [];
	for (const sheet of [...document.styleSheets]) {
		const entry = { href: sheet.href || '(inline)', rules: 0, blocked: false, text: null };
		try {
			const rules = sheet.cssRules; // throws on cross-origin
			entry.rules = rules.length;
			const parts = [];
			for (const r of rules) {
				parts.push(r.cssText);
				if (/@font-face/.test(r.cssText)) {
					fontFaceRules.push(r.cssText);
					urlsIn(r.cssText).forEach((u) => fontUrls.add(u));
				}
			}
			entry.text = parts.join('\n');
		} catch {
			entry.blocked = true;
			if (sheet.href) {
				try {
					const res = await fetch(sheet.href);
					if (res.ok) {
						entry.text = await res.text();
						entry.blocked = false;
						entry.rules = (entry.text.match(/\}/g) || []).length;
						(entry.text.match(/@font-face[^}]*\}/g) || []).forEach((b) => {
							fontFaceRules.push(b);
							urlsIn(b).forEach((u) => fontUrls.add(u));
						});
					}
				} catch {}
			}
		}
		OUT.stylesheets.push(entry);
	}
	OUT.fonts.fontFaceRules = fontFaceRules;
	OUT.fonts.fontFileUrls = [...fontUrls];

	// --- CSS variables ---
	const grabVars = (el) => {
		const cs = getComputedStyle(el);
		const o = {};
		for (const p of cs) if (p.startsWith('--')) o[p] = cs.getPropertyValue(p).trim();
		return o;
	};
	OUT.cssVariables.root = grabVars(document.documentElement);
	OUT.cssVariables.body = grabVars(document.body);

	// --- palette + scales (scan every element once) ---
	const all = [...document.querySelectorAll('*')];
	const tally = {};
	const bump = (k, v) => {
		if (!v || v === 'none' || v === 'normal' || v === 'auto' || v === 'rgba(0, 0, 0, 0)') return;
		(tally[k] ??= {});
		tally[k][v] = (tally[k][v] || 0) + 1;
	};
	for (const el of all) {
		const cs = getComputedStyle(el);
		bump('color', cs.color);
		bump('backgroundColor', cs.backgroundColor);
		bump('borderColor', cs.borderTopColor);
		bump('boxShadow', cs.boxShadow);
		bump('borderRadius', cs.borderRadius);
		bump('fontFamily', cs.fontFamily);
		bump('fontSize', cs.fontSize);
		bump('fontWeight', cs.fontWeight);
		bump('lineHeight', cs.lineHeight);
		bump('gap', cs.gap);
		bump('paddingTop', cs.paddingTop);
		bump('zIndex', cs.zIndex);
	}
	const sortTally = (m) => Object.entries(m || {}).sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
	OUT.palette = Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, sortTally(v)]));

	// --- curated common selectors (Bootstrap/Darkly + generics) ---
	const SEL = ['body', 'a', 'button', '.btn', '.btn-primary', '.btn-secondary', '.btn-outline-primary',
		'.navbar', '.nav-link', '.modal', '.modal-content', '.modal-header', '.modal-body', '.modal-footer',
		'.card', '.card-header', '.form-control', 'input', 'textarea', 'select', '.badge', '.dropdown-menu',
		'.list-group-item', '.nav-tabs', '.nav-link.active', 'h1', 'h2', 'h3', 'h4', 'h5', 'table', 'th', 'td'];
	for (const s of SEL) {
		let el;
		try { el = document.querySelector(s); } catch {}
		if (el) OUT.components[s] = { rect: rectOf(el), style: snap(el) };
	}

	// --- significant visible elements: rects + computed styles ---
	const cssPath = (el) => {
		const parts = [];
		let cur = el;
		while (cur && cur.nodeType === 1 && parts.length < 8) {
			let s = cur.tagName.toLowerCase();
			if (cur.id) { parts.unshift(s + '#' + cur.id); break; }
			const cls = [...cur.classList].slice(0, 3).join('.');
			if (cls) s += '.' + cls;
			const par = cur.parentElement;
			if (par) s += `:nth-child(${[...par.children].indexOf(cur) + 1})`;
			parts.unshift(s);
			cur = par;
		}
		return parts.join(' > ');
	};
	const significant = (el, cs, r) => {
		if (r.width < 1 || r.height < 1) return false;
		if (/^(A|BUTTON|INPUT|TEXTAREA|SELECT|IMG|SVG|LABEL)$/.test(el.tagName)) return true;
		if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none') return true;
		if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0) return true;
		return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length);
	};
	const CAP = 1500;
	for (const el of all) {
		if (OUT.elements.length >= CAP) break;
		const cs = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		if (!significant(el, cs, r)) continue;
		const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 60);
		OUT.elements.push({
			path: cssPath(el),
			tag: el.tagName.toLowerCase(),
			id: el.id || undefined,
			class: (el.getAttribute && el.getAttribute('class')) ? el.getAttribute('class').slice(0, 140) : undefined,
			rect: rectOf(el),
			text: text || undefined,
			style: snap(el)
		});
	}
	OUT.meta.elementsCapped = OUT.elements.length >= CAP;

	// --- assets ---
	const imgs = new Set();
	document.querySelectorAll('img[src]').forEach((i) => imgs.add(i.src));
	const bgs = new Set();
	for (const el of all) urlsIn(getComputedStyle(el).backgroundImage || '').forEach((u) => bgs.add(u));
	OUT.assets = { images: [...imgs], backgroundImages: [...bgs], svgCount: document.querySelectorAll('svg').length };

	// --- download ---
	const json = JSON.stringify(OUT, null, 2);
	const a = document.createElement('a');
	a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
	a.download = `proroom-pixel-${LABEL}.json`;
	document.body.appendChild(a);
	a.click();
	a.remove();

	console.log('%cpro-room pixel capture — ' + LABEL, 'font-weight:bold;font-size:14px;color:#45a2ff');
	console.log(`elements: ${OUT.elements.length}${OUT.meta.elementsCapped ? ' (CAPPED — run again zoomed to a sub-area for more)' : ''} | stylesheets: ${OUT.stylesheets.length} | vars: ${Object.keys(OUT.cssVariables.root).length} | size: ${(json.length / 1024) | 0}KB`);
	if (OUT.fonts.fontFileUrls.length) { console.log('%cFONT FILES — download these (or send me the urls):', 'font-weight:bold'); OUT.fonts.fontFileUrls.forEach((u) => console.log('  ' + u)); }
	const blocked = OUT.stylesheets.filter((s) => s.blocked).map((s) => s.href);
	if (blocked.length) { console.warn('CROSS-ORIGIN CSS we could NOT read (send me these urls):'); blocked.forEach((u) => console.log('  ' + u)); }
	return OUT;
})();
