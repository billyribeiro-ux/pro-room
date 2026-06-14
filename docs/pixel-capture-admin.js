/* ============================================================================
 * pro-room ADMIN/PRESENTER ULTIMATE CAPTURE — paste into DevTools Console
 * ON THE REAL APP (chat.protradingroom.com), logged in as an ADMIN/PRESENTER,
 * inside the room, with the presentation area visible.
 *
 *  WHY THIS ONE (vs pixel-capture-ultimate.js): it adds, on top of the generic
 *  capture, three admin-focused sections that guarantee full fidelity:
 *    • subtrees  — EVERY visible descendant of the nav, sidebar, presentation
 *                  area and webcam holder, with full computed styles (exhaustive
 *                  layout — no 4000-element cap can drop an admin control).
 *    • targeted  — curated key elements (nav bits, tabs, presenter regions) with
 *                  computed styles + the MATCHED CSS RULES that style them,
 *                  including :hover / :focus / ::before / ::after declarations.
 *    • controls  — every button / link-button / icon control in the room shell,
 *                  with text, icon class, computed styles AND matched rules.
 *                  This is the "buttons and everything else" the diff needs.
 *
 *  HOW TO RUN
 *    1. Undock DevTools into its OWN WINDOW so the page renders full desktop
 *       width (≥1100px). It won't block if narrow — it just flags meta.tooNarrow.
 *    2. Be in the room as admin/presenter. If presenter controls live behind a
 *       toggle/dropdown, OPEN it first so the buttons are in the DOM.
 *    3. Paste this whole script, hit Enter. It ALWAYS downloads
 *       proroom-ultra-admin-room.json (every section is error-guarded).
 *    4. Send me that JSON + the FONT FILE urls it logs.
 *
 *  Capture admin-only MODALS separately: open the modal (Session Control,
 *  Members, Media For All, AV Settings, Post Alert…), change LABEL accordingly
 *  (e.g. 'session-control'), and re-run. One state per run.
 * ========================================================================== */
(async () => {
	const LABEL = 'admin-room'; // ← change per state before each run

	const OUT = {
		meta: {}, head: { stylesheetLinks: [], fontLinks: [], preloads: [], metas: {} },
		cssVariables: {}, fonts: {}, stylesheets: [], palette: {},
		elements: [], subtrees: {}, targeted: [], controls: [],
		assets: {}, inventory: {}, errors: []
	};
	const guard = (name, fn) => { try { return fn(); } catch (e) { OUT.errors.push(name + ': ' + (e && e.message)); console.warn('section failed:', name, e); } };
	const guardA = async (name, fn) => { try { return await fn(); } catch (e) { OUT.errors.push(name + ': ' + (e && e.message)); console.warn('section failed:', name, e); } };
	const dl = () => {
		try {
			const json = JSON.stringify(OUT, null, 2);
			const a = document.createElement('a');
			a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
			a.download = `proroom-ultra-${LABEL}.json`;
			document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);
			console.log('%cDOWNLOADED proroom-ultra-' + LABEL + '.json — ' + (json.length / 1048576).toFixed(2) + 'MB | ' +
				OUT.elements.length + ' elements, ' + OUT.targeted.length + ' targeted, ' + OUT.controls.length + ' controls',
				'color:#fff;background:#92d528;font-size:14px;padding:3px 8px');
			if (OUT.fonts.fontFileUrls && OUT.fonts.fontFileUrls.length) { console.log('FONT FILES:'); OUT.fonts.fontFileUrls.forEach((u) => console.log('  ' + u)); }
			const blocked = OUT.stylesheets.filter((s) => s.blocked).map((s) => s.href); if (blocked.length) { console.warn('CROSS-ORIGIN CSS not readable (send urls):'); blocked.forEach((u) => console.log('  ' + u)); }
			if (OUT.errors.length) console.warn('sections with errors:', OUT.errors);
		} catch (e) { console.error('DOWNLOAD FAILED — copy(OUT) instead:', e); window.OUT = OUT; }
	};

	const PROPS = ['display', 'visibility', 'box-sizing', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float',
		'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
		'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-color', 'border-top-style', 'border-bottom-color', 'border-right-color', 'border-left-color',
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
	const pseudo = (el, which) => { try { const cs = getComputedStyle(el, which); const c = cs.content; if (!c || c === 'none' || c === 'normal') return null; return { content: c, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, background: cs.backgroundColor }; } catch { return null; } };
	const attrsOf = (el) => { const o = {}; for (const a of el.attributes || []) if (a.name !== 'style') o[a.name] = String(a.value).slice(0, 300); return o; };
	const txt = (el) => (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 80);
	const iconOf = (el) => { const i = el.querySelector && el.querySelector('i[class*="fa"], svg[class*="fa"], [class*="fa-"]'); return i ? (i.getAttribute('class') || undefined) : undefined; };
	const cssPath = (el) => { const p = []; let c = el; while (c && c.nodeType === 1 && p.length < 12) { let s = c.tagName.toLowerCase(); if (c.id) { p.unshift(s + '#' + c.id); break; } const cl = [...c.classList].slice(0, 4).join('.'); if (cl) s += '.' + cl; const par = c.parentElement; if (par) s += `:nth-child(${[...par.children].indexOf(c) + 1})`; p.unshift(s); c = par; } return p.join(' > '); };

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

	// ---- stylesheets (full text) + @font-face -------------------------------
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

	// ---- collect ALL style rules once (for matched-rule lookup) -------------
	const ALLRULES = [];
	const collectRule = (r) => {
		try {
			if (r.cssRules && r.cssRules.length && !r.selectorText) { for (const sub of r.cssRules) collectRule(sub); return; }
			if (r.selectorText) ALLRULES.push({ selector: r.selectorText, cssText: r.cssText });
		} catch {}
	};
	guard('rules.collect', () => { for (const sheet of document.styleSheets) { try { for (const r of sheet.cssRules) collectRule(r); } catch {} } });

	const baseSelector = (s) => s
		.replace(/::[a-z-]+(\([^)]*\))?/gi, '')
		.replace(/:not\([^)]*\)/gi, '')
		.replace(/:is\(([^)]*)\)/gi, '$1')
		.replace(/:where\(([^)]*)\)/gi, '$1')
		.replace(/:nth-[a-z-]+\([^)]*\)/gi, '')
		.replace(/:(hover|focus|focus-visible|focus-within|active|visited|checked|disabled|enabled|required|optional|valid|invalid|first-child|last-child|first-of-type|last-of-type|only-child|read-only|read-write|placeholder-shown|default|target|empty|root)/gi, '')
		.trim();
	const matchedRulesFor = (el, cap = 40) => {
		const out = [];
		for (const r of ALLRULES) {
			let added = false;
			for (const oneSel of r.selector.split(',')) {
				const s = oneSel.trim(); if (!s) continue;
				let base; try { base = baseSelector(s); } catch { continue; }
				if (!base || /[>+~]\s*$/.test(base)) continue;
				let hit = false; try { hit = el.matches(base); } catch { continue; }
				if (hit) { out.push({ selector: s, cssText: r.cssText.slice(0, 1400) }); added = true; break; }
			}
			if (added && out.length >= cap) break;
		}
		return out;
	};

	// ---- deep snapshot of one element ---------------------------------------
	const deep = (el, withRules) => {
		const o = {
			path: cssPath(el), tag: el.tagName.toLowerCase(), id: el.id || undefined,
			class: (el.getAttribute && el.getAttribute('class')) || undefined,
			rect: rectOf(el),
			text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 80) || undefined,
			attrs: attrsOf(el), icon: iconOf(el),
			style: snap(el), before: pseudo(el, '::before'), after: pseudo(el, '::after')
		};
		if (withRules) o.matchedRules = matchedRulesFor(el);
		return o;
	};

	// ---- cssVariables -------------------------------------------------------
	const all = [...document.querySelectorAll('*')];
	guard('cssVariables', () => {
		const grab = (el) => { const cs = getComputedStyle(el); const o = {}; for (const p of cs) if (p.startsWith('--')) o[p] = cs.getPropertyValue(p).trim(); return o; };
		OUT.cssVariables.root = grab(document.documentElement); OUT.cssVariables.body = grab(document.body);
	});

	// ---- generic elements + palette (capped) -------------------------------
	guard('elements+palette', () => {
		const tally = {};
		const bump = (k, v) => { if (!v || ['none', 'normal', 'auto', 'rgba(0, 0, 0, 0)', '0px'].includes(v)) return; (tally[k] ??= {}); tally[k][v] = (tally[k][v] || 0) + 1; };
		const CAP = 4500; let capped = false;
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
				OUT.elements.push({ path: cssPath(el), tag: el.tagName.toLowerCase(), id: el.id || undefined, class: (el.getAttribute && el.getAttribute('class')) || undefined, rect: rectOf(el), text: directText || undefined, attrs: attrsOf(el), icon: iconOf(el), style: snap(el), before: pseudo(el, '::before'), after: pseudo(el, '::after') });
			} catch (e) { /* skip */ }
		}
		OUT.meta.elementsCapped = capped;
		const sort = (m) => Object.entries(m || {}).sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
		OUT.palette = Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, sort(v)]));
	});

	// ---- subtrees: exhaustive layout of the admin/presenter regions ---------
	guard('subtrees', () => {
		const CONTAINERS = {
			topnav: 'nav.mainAppNav, .mainAppNav, app-room-nav, header',
			sidebar: '.room-sidebar, app-room-sidebar, app-room-roster',
			presentation: 'app-presentationarea, .presentation-box, .presentation-area, #mainTabs',
			webcams: 'app-webcam-holder, app-presenter-cams, .webcam-wrapper, .webcamsHolder',
			roomShell: 'app-room, .room-container, as-split'
		};
		const PER = 600;
		for (const [key, sel] of Object.entries(CONTAINERS)) {
			let root = null;
			for (const s of sel.split(',')) { try { root = document.querySelector(s.trim()); } catch {} if (root) break; }
			if (!root) { OUT.subtrees[key] = { found: false, selector: sel }; continue; }
			const nodes = [root, ...root.querySelectorAll('*')].slice(0, PER);
			OUT.subtrees[key] = {
				found: true, rootPath: cssPath(root),
				count: nodes.length,
				nodes: nodes.map((el) => { try { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null; return deep(el, false); } catch { return null; } }).filter(Boolean)
			};
		}
	});

	// ---- targeted: key elements WITH matched CSS rules ----------------------
	guard('targeted', () => {
		const TARGETS = [
			'nav.mainAppNav', '.mainAppNav', 'span.sidebar-menu', '.sidebar-menu', 'span.users', '.users',
			'.fa-mobile', 'span.fa-mobile', 'a.navbar-brand', '.navbar-brand', 'img.brand-logo', '.brand-logo',
			'li.talkingIndicator', '.talkingIndicator', '.volumeControl', '.room-sound-options', '.fa-sync',
			'.room-sidebar', 'a.active-room-users', '.active-room-users', 'app-room-roster', '.room-roster-list',
			'app-presentationarea', '#mainTabs', '.nav-tabs', '.nav-link.active', '.files-badge',
			'app-webcam-holder', '.webcam-wrapper', 'app-presenter-cams', '.card.webcamsHolder',
			'video.webcamsHolderVideo', '.overlay', '.pNameLabel',
			'.presentation-box', '.presentation-area'
		];
		const seen = new Set();
		for (const sel of TARGETS) {
			let els = [];
			try { els = [...document.querySelectorAll(sel)].slice(0, 6); } catch { continue; }
			for (const el of els) {
				if (seen.has(el)) continue; seen.add(el);
				try { OUT.targeted.push({ querySelector: sel, ...deep(el, true) }); } catch {}
			}
		}
	});

	// ---- controls: every button / control in the room shell (with rules) ----
	guard('controls', () => {
		const scope = document.querySelector('app-room, .room-container, body') || document.body;
		const nodes = [...scope.querySelectorAll('button, a.btn, .btn, [role="button"], li[class*="Indicator"], .nav-link, [class*="fa-"][onclick], i[class*="fa"]')];
		const seen = new Set(); let n = 0;
		for (const el of nodes) {
			if (n >= 900) break;
			// de-dup: if an <i.fa> sits inside a button we already captured, skip the bare icon
			if (el.tagName === 'I' && el.closest('button, a.btn, .btn, [role="button"]')) continue;
			if (seen.has(el)) continue; seen.add(el);
			try {
				const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
				OUT.controls.push({ label: txt(el) || el.getAttribute('aria-label') || el.getAttribute('title') || undefined, ...deep(el, true) });
				n++;
			} catch {}
		}
	});

	guard('assets', () => {
		const imgs = new Set(); document.querySelectorAll('img[src]').forEach((i) => imgs.add(i.src));
		const bgs = new Set(); for (const el of all) urlsIn(getComputedStyle(el).backgroundImage).forEach((u) => bgs.add(u));
		OUT.assets = { images: [...imgs], backgroundImages: [...bgs], inlineSvgs: [...document.querySelectorAll('svg')].slice(0, 200).map((s) => ({ class: s.getAttribute('class') || undefined, viewBox: s.getAttribute('viewBox') || undefined })) };
	});

	guard('inventory', () => {
		OUT.inventory = {
			buttons: [...document.querySelectorAll('button, [role="button"], .btn, [class*="btn" i]')].slice(0, 800).map((b) => ({ text: txt(b), ariaLabel: b.getAttribute('aria-label') || undefined, title: b.getAttribute('title') || undefined, class: b.getAttribute('class') || undefined, disabled: b.disabled || undefined, rect: rectOf(b), icon: iconOf(b) })),
			inputs: [...document.querySelectorAll('input, textarea, select')].slice(0, 300).map((i) => ({ type: i.type || i.tagName.toLowerCase(), name: i.name || undefined, placeholder: i.placeholder || undefined, ariaLabel: i.getAttribute('aria-label') || undefined, class: i.getAttribute('class') || undefined, rect: rectOf(i) })),
			links: [...document.querySelectorAll('a[href]')].slice(0, 400).map((a) => ({ text: txt(a), href: a.href, class: a.getAttribute('class') || undefined })),
			menus: [...document.querySelectorAll('[role="menu"], .dropdown-menu, .menu, [class*="dropdown" i]')].slice(0, 200).map((m) => ({ class: m.getAttribute('class') || undefined, items: [...m.querySelectorAll('a, button, [role="menuitem"], li')].slice(0, 40).map(txt).filter(Boolean) })),
			modalsInDom: [...document.querySelectorAll('[role="dialog"], .modal, .modal-content, [class*="modal" i]')].slice(0, 100).map((m) => ({ class: m.getAttribute('class') || undefined, title: txt(m.querySelector('h1,h2,h3,.modal-title,.title')), visible: m.getBoundingClientRect().width > 0 })),
			dataAttributes: (() => { const set = new Set(); for (const el of all) for (const a of el.attributes || []) if (a.name.startsWith('data-')) set.add(a.name); return [...set]; })()
		};
	});

	console.log('%cpro-room ADMIN capture — ' + LABEL + ' | viewport ' + innerWidth + '×' + innerHeight, 'font-weight:bold;font-size:14px;color:#45a2ff');
	dl();
	window.OUT = OUT; // also available as global `OUT` if the download is blocked
	return 'done — check Downloads for proroom-ultra-' + LABEL + '.json';
})();
