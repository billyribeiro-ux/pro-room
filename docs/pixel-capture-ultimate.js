/* ============================================================================
 * pro-room ULTIMATE PIXEL CAPTURE (bulletproof) — DevTools Console, ON THE REAL APP
 * (chat.protradingroom.com), logged in, in the room.
 *
 *  - Set LABEL below for the state you're capturing.
 *  - For usable LAYOUT, undock DevTools (its own window) so the page is full width.
 *    It no longer blocks on a narrow window — it just flags it (meta.tooNarrow).
 *  - It ALWAYS downloads proroom-ultra-<label>.json (every section is error-guarded).
 *  - Run once per state: member-room, admin-room, sidebar, post-alert,
 *    session-control, members, settings, av-settings, media-for-all, poll, ...
 *  - Send me the downloaded JSON(s) + the font/CSS urls it logs.
 * ========================================================================== */
(async () => {
	const LABEL = 'member-room'; // ← change per state before each run

	const OUT = {
		meta: {}, head: { stylesheetLinks: [], fontLinks: [], preloads: [], metas: {} },
		cssVariables: {}, fonts: {}, stylesheets: [], palette: {}, elements: [], assets: {}, inventory: {}, errors: []
	};
	const guard = (name, fn) => { try { fn(); } catch (e) { OUT.errors.push(name + ': ' + (e && e.message)); console.warn('section failed:', name, e); } };
	const dl = () => {
		try {
			const json = JSON.stringify(OUT, null, 2);
			const a = document.createElement('a');
			a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
			a.download = `proroom-ultra-${LABEL}.json`;
			document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);
			console.log('%cDOWNLOADED proroom-ultra-' + LABEL + '.json — ' + (json.length / 1048576).toFixed(2) + 'MB, ' + OUT.elements.length + ' elements',
				'color:#fff;background:#92d528;font-size:14px;padding:3px 8px');
			if (OUT.fonts.fontFileUrls && OUT.fonts.fontFileUrls.length) { console.log('FONT FILES:'); OUT.fonts.fontFileUrls.forEach((u) => console.log('  ' + u)); }
			const blocked = OUT.stylesheets.filter((s) => s.blocked).map((s) => s.href); if (blocked.length) { console.warn('CROSS-ORIGIN CSS not readable (send urls):'); blocked.forEach((u) => console.log('  ' + u)); }
			if (OUT.errors.length) console.warn('sections with errors:', OUT.errors);
		} catch (e) { console.error('DOWNLOAD FAILED — copy(OUT) instead:', e); window.OUT = OUT; }
	};

	const PROPS = ['display', 'visibility', 'box-sizing', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float',
		'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
		'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-color', 'border-top-style', 'border-bottom-color',
		'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
		'outline', 'box-shadow', 'opacity', 'overflow-x', 'overflow-y',
		'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-clip',
		'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'word-spacing',
		'text-transform', 'text-align', 'text-decoration-line', 'text-overflow', 'white-space', 'text-shadow',
		'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-self', 'flex-grow', 'flex-shrink', 'flex-basis', 'gap', 'order',
		'grid-template-columns', 'grid-template-rows', 'cursor', 'pointer-events', 'transition', 'transform', 'transform-origin',
		'filter', 'backdrop-filter', 'object-fit', 'aspect-ratio', 'vertical-align', 'list-style-type'];

	const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
	const urlsIn = (t) => (String(t || '').match(/url\(([^)]+)\)/g) || []).map((u) => abs(u.replace(/url\(|\)|["']/g, '')));
	const rectOf = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
	const snap = (el) => { const cs = getComputedStyle(el); const o = {}; for (const p of PROPS) o[p] = cs.getPropertyValue(p); return o; };
	const pseudo = (el, which) => { try { const cs = getComputedStyle(el, which); const c = cs.content; if (!c || c === 'none' || c === 'normal') return null; return { content: c, fontFamily: cs.fontFamily, fontSize: cs.fontSize, color: cs.color }; } catch { return null; } };
	const attrsOf = (el) => { const o = {}; for (const a of el.attributes || []) if (a.name !== 'style') o[a.name] = String(a.value).slice(0, 300); return o; };
	const txt = (el) => (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 80);

	guard('meta', () => {
		OUT.meta = {
			label: LABEL, url: location.href, title: document.title,
			viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio }, screen: { w: screen.width, h: screen.height },
			tooNarrow: innerWidth < 1100,
			theme: { htmlClass: document.documentElement.className, bodyClass: document.body.className, dataTheme: document.documentElement.dataset.theme || document.body.dataset.theme || null },
			userAgent: navigator.userAgent
		};
		if (innerWidth < 1100) console.warn('%c⚠ window is ' + innerWidth + 'px — layout rects are squished. Undock DevTools + re-run for usable layout (capturing anyway).', 'color:#000;background:#f39c12;padding:3px 8px');
	});

	guard('head', () => {
		document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => OUT.head.stylesheetLinks.push(l.href));
		document.querySelectorAll('link[rel="preload"]').forEach((l) => OUT.head.preloads.push({ href: l.href, as: l.as }));
		document.querySelectorAll('link[href*="font" i]').forEach((l) => OUT.head.fontLinks.push(l.href));
		document.querySelectorAll('meta[name]').forEach((m) => (OUT.head.metas[m.name] = m.content));
	});

	try { await (document.fonts ? document.fonts.ready : Promise.resolve()); } catch {}
	guard('fonts.loaded', () => { const s = new Set(); document.fonts.forEach((f) => s.add(`${f.family} | ${f.style} | ${f.weight} | ${f.status}`)); OUT.fonts.loaded = [...s]; });

	const fontUrls = new Set(), faceRules = [];
	for (const sheet of [...document.styleSheets]) {
		const entry = { href: sheet.href || '(inline)', rules: 0, blocked: false, text: null };
		try {
			const rules = sheet.cssRules; entry.rules = rules.length; const parts = [];
			for (const r of rules) { parts.push(r.cssText); if (/@font-face/.test(r.cssText)) { faceRules.push(r.cssText); urlsIn(r.cssText).forEach((u) => fontUrls.add(u)); } }
			entry.text = parts.join('\n');
		} catch {
			entry.blocked = true;
			if (sheet.href) { try { const res = await fetch(sheet.href); if (res.ok) { entry.text = await res.text(); entry.blocked = false; (entry.text.match(/@font-face[^}]*\}/g) || []).forEach((b) => { faceRules.push(b); urlsIn(b).forEach((u) => fontUrls.add(u)); }); } } catch {} }
		}
		OUT.stylesheets.push(entry);
	}
	OUT.fonts.fontFaceRules = faceRules; OUT.fonts.fontFileUrls = [...fontUrls];

	const all = [...document.querySelectorAll('*')];
	guard('cssVariables', () => {
		const grab = (el) => { const cs = getComputedStyle(el); const o = {}; for (const p of cs) if (p.startsWith('--')) o[p] = cs.getPropertyValue(p).trim(); return o; };
		OUT.cssVariables.root = grab(document.documentElement); OUT.cssVariables.body = grab(document.body);
	});

	guard('elements+palette', () => {
		const tally = {};
		const bump = (k, v) => { if (!v || ['none', 'normal', 'auto', 'rgba(0, 0, 0, 0)', '0px'].includes(v)) return; (tally[k] ??= {}); tally[k][v] = (tally[k][v] || 0) + 1; };
		const cssPath = (el) => { const p = []; let c = el; while (c && c.nodeType === 1 && p.length < 10) { let s = c.tagName.toLowerCase(); if (c.id) { p.unshift(s + '#' + c.id); break; } const cl = [...c.classList].slice(0, 4).join('.'); if (cl) s += '.' + cl; const par = c.parentElement; if (par) s += `:nth-child(${[...par.children].indexOf(c) + 1})`; p.unshift(s); c = par; } return p.join(' > '); };
		const CAP = 4000; let capped = false;
		for (const el of all) {
			try {
				const cs = getComputedStyle(el);
				bump('color', cs.color); bump('backgroundColor', cs.backgroundColor); bump('borderColor', cs.borderTopColor); bump('boxShadow', cs.boxShadow);
				bump('borderRadius', cs.borderTopLeftRadius); bump('fontFamily', cs.fontFamily); bump('fontSize', cs.fontSize); bump('fontWeight', cs.fontWeight);
				bump('fontStyle', cs.fontStyle); bump('lineHeight', cs.lineHeight); bump('letterSpacing', cs.letterSpacing); bump('gap', cs.gap);
				bump('paddingTop', cs.paddingTop); bump('paddingLeft', cs.paddingLeft); bump('marginTop', cs.marginTop); bump('zIndex', cs.zIndex);
				bump('borderTopWidth', cs.borderTopWidth); bump('textTransform', cs.textTransform); bump('opacity', cs.opacity);
				if (OUT.elements.length >= CAP) { capped = true; continue; }
				const r = el.getBoundingClientRect();
				if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') continue;
				const directText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 80);
				OUT.elements.push({ path: cssPath(el), tag: el.tagName.toLowerCase(), id: el.id || undefined, class: (el.getAttribute && el.getAttribute('class')) || undefined, rect: rectOf(el), text: directText || undefined, attrs: attrsOf(el), style: snap(el), before: pseudo(el, '::before'), after: pseudo(el, '::after') });
			} catch (e) { /* skip bad element */ }
		}
		OUT.meta.elementsCapped = capped;
		const sort = (m) => Object.entries(m || {}).sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
		OUT.palette = Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, sort(v)]));
	});

	guard('assets', () => {
		const imgs = new Set(); document.querySelectorAll('img[src]').forEach((i) => imgs.add(i.src));
		const bgs = new Set(); for (const el of all) urlsIn(getComputedStyle(el).backgroundImage).forEach((u) => bgs.add(u));
		OUT.assets = { images: [...imgs], backgroundImages: [...bgs], inlineSvgs: [...document.querySelectorAll('svg')].slice(0, 200).map((s) => ({ class: s.getAttribute('class') || undefined, viewBox: s.getAttribute('viewBox') || undefined })) };
	});

	guard('inventory', () => {
		OUT.inventory = {
			buttons: [...document.querySelectorAll('button, [role="button"], .btn, [class*="btn" i]')].slice(0, 600).map((b) => ({ text: txt(b), ariaLabel: b.getAttribute('aria-label') || undefined, title: b.getAttribute('title') || undefined, class: b.getAttribute('class') || undefined, disabled: b.disabled || undefined, rect: rectOf(b), icon: (b.querySelector('i[class*="fa"]') || {}).className || undefined })),
			inputs: [...document.querySelectorAll('input, textarea, select')].slice(0, 300).map((i) => ({ type: i.type || i.tagName.toLowerCase(), name: i.name || undefined, placeholder: i.placeholder || undefined, ariaLabel: i.getAttribute('aria-label') || undefined, class: i.getAttribute('class') || undefined, rect: rectOf(i) })),
			links: [...document.querySelectorAll('a[href]')].slice(0, 400).map((a) => ({ text: txt(a), href: a.href, class: a.getAttribute('class') || undefined })),
			menus: [...document.querySelectorAll('[role="menu"], .dropdown-menu, .menu, [class*="dropdown" i]')].slice(0, 200).map((m) => ({ class: m.getAttribute('class') || undefined, items: [...m.querySelectorAll('a, button, [role="menuitem"], li')].slice(0, 40).map(txt).filter(Boolean) })),
			modalsInDom: [...document.querySelectorAll('[role="dialog"], .modal, .modal-content, [class*="modal" i]')].slice(0, 100).map((m) => ({ class: m.getAttribute('class') || undefined, title: txt(m.querySelector('h1,h2,h3,.modal-title,.title')), visible: m.getBoundingClientRect().width > 0 })),
			dataAttributes: (() => { const set = new Set(); for (const el of all) for (const a of el.attributes || []) if (a.name.startsWith('data-')) set.add(a.name); return [...set]; })()
		};
	});

	console.log('%cpro-room ULTRA capture — ' + LABEL + ' | viewport ' + innerWidth + '×' + innerHeight, 'font-weight:bold;font-size:14px;color:#45a2ff');
	dl();
	window.OUT = OUT; // also available as global `OUT` if the download is blocked
	return 'done — check Downloads for proroom-ultra-' + LABEL + '.json';
})();
