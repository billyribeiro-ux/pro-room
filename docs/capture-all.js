/* ============================================================================
 * CAPTURE-ALL — DevTools Console, ON THE REAL APP, logged in, inside the room.
 * Based on the proven pixel-capture-fullstates.js (which produced the existing
 * dumps), extended with: sidebar/archives/kebab/MODAL auto-reveal and a manual
 * SNAP('label') command for LIVE states (broadcasting / recording / CC) that
 * downloads its own JSON immediately.
 *
 *  ⚠ CHROME BLOCKS CONSOLE PASTES BY DEFAULT: if pasting does nothing, type
 *     allow pasting   in the Console first, press Enter, then paste again.
 *
 *  ONE PRESENTER RUN CAPTURES BOTH SIDES. You only need to be logged in as a
 *  PRESENTER/ADMIN — the presenter DOM is a SUPERSET of the member DOM (member =
 *  presenter minus the broadcast/admin controls). The script tags every
 *  presenter-only node with  presenterOnly:true , so the MEMBER view is derived
 *  by dropping those. No member login required. Role is auto-detected for the
 *  filename; override with  window.__ROLE='admin'  before pasting if ever wrong.
 *
 *  WHAT IT DOES
 *   - Captures the complete BASE evidence once: every stylesheet (full CSS incl
 *     :hover/::before), all CSS variables, fonts/@font-face, the colour+type
 *     palette, every visible element's computed styles + layout, assets, and an
 *     inventory of buttons/inputs/links/menus/modals.
 *   - Then AUTO-REVEALS each view-only state and snapshots it into `states`:
 *       • main tabs:  Screens, Streams, Notes, Files
 *       • Notes sub-tabs (each note) and Files sub-tabs (Files / Images / Sounds)
 *       • dropdown toggles (volume, chat/alert gears) — opened, captured, closed
 *     Each state snapshot has full computed styles + the MATCHED CSS RULES.
 *
 *  SAFETY: it ONLY clicks tabs, sub-tabs and dropdown TOGGLES (view-only). It
 *  NEVER clicks action buttons (no Post / Save / Send / Go live / etc.), so it
 *  cannot change anything on the real service. It restores the original tab when
 *  done.
 *
 *  HOW TO RUN
 *   1. Open the room on the REAL app, DevTools → Console (undock to a separate
 *      window so the page keeps full desktop width ≥ 1100px).
 *   2. Paste this whole file, Enter. (If nothing happens: type  allow pasting
 *      first.) It runs ~5-10s and downloads proroom-all-<role>.json.
 *   3. For live states (recording / sharing / CC), trigger the state then run
 *      SNAP('recording-live') etc. — each downloads its own file instantly.
 *   4. Send me proroom-all-presenter.json + every SNAP file. That's everything —
 *      no separate member run needed (member = the presenterOnly:false subset).
 * ========================================================================== */
(async () => {
	// AUTO-DETECT role — no editing. Admin/presenter markers: broadcast/go-live/
	// record/screen-share controls, the presenter cams holder, or the admin-only
	// sidebar items (Session Control / Branding / Play YouTube For All). Anything
	// else is a member. Override if ever wrong: window.__ROLE = 'admin'  before run.
	const ADMIN_MARKERS = [
		'[class*="go-live" i]', '[class*="golive" i]', '[title*="Go Live" i]',
		'[class*="record" i]', '[title*="Record" i]', '[class*="screen-share" i]',
		'[class*="start-screen" i]', 'app-presenter-cams', '[id*="session-control" i]',
		'[data-bs-target*="session" i]', '[data-bs-target*="branding" i]',
		'[class*="mic-record" i]', '[class*="broadcast" i]'
	];
	const detected = ADMIN_MARKERS.some((s) => { try { return !!document.querySelector(s); } catch { return false; } });
	const ROLE = (window.__ROLE || (detected ? 'admin' : 'member')).toLowerCase();
	const LABEL = ROLE;
	console.log('%cDetected role: ' + ROLE + (window.__ROLE ? ' (overridden)' : '') + ' — run this once as admin AND once as a member.', 'color:#000;background:#45a2ff;padding:3px 8px;font-weight:bold');

	const OUT = {
		meta: {}, head: { stylesheetLinks: [], fontLinks: [], preloads: [], metas: {} },
		cssVariables: {}, fonts: {}, stylesheets: [], palette: {},
		elements: [], assets: {}, inventory: {}, states: {}, errors: []
	};
	const guard = (name, fn) => { try { return fn(); } catch (e) { OUT.errors.push(name + ': ' + (e && e.message)); console.warn('section failed:', name, e); } };
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const dl = () => {
		try {
			const json = JSON.stringify(OUT, null, 2);
			const a = document.createElement('a');
			a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
			a.download = `proroom-all-${LABEL}.json`;
			document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);
			console.log('%cDOWNLOADED proroom-all-' + LABEL + '.json — ' + (json.length / 1048576).toFixed(2) + 'MB | base ' +
				OUT.elements.length + ' els, states: ' + Object.keys(OUT.states).join(', '),
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
	const txt = (el) => (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
	const iconOf = (el) => { const i = el.querySelector && el.querySelector('i[class*="fa"], svg[class*="fa"], [class*="fa-"]'); return i ? (i.getAttribute('class') || undefined) : undefined; };
	const cssPath = (el) => { const p = []; let c = el; while (c && c.nodeType === 1 && p.length < 12) { let s = c.tagName.toLowerCase(); if (c.id) { p.unshift(s + '#' + c.id); break; } const cl = [...c.classList].slice(0, 4).join('.'); if (cl) s += '.' + cl; const par = c.parentElement; if (par) s += `:nth-child(${[...par.children].indexOf(c) + 1})`; p.unshift(s); c = par; } return p.join(' > '); };

	guard('meta', () => {
		OUT.meta = {
			role: ROLE, url: location.href, title: document.title,
			viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio }, screen: { w: screen.width, h: screen.height },
			tooNarrow: innerWidth < 1100,
			theme: { htmlClass: document.documentElement.className, bodyClass: document.body.className, dataTheme: document.documentElement.dataset.theme || document.body.dataset.theme || null },
			userAgent: navigator.userAgent
		};
		if (innerWidth < 1100) console.warn('%c⚠ window is ' + innerWidth + 'px — undock DevTools + re-run for usable layout (capturing anyway).', 'color:#000;background:#f39c12;padding:3px 8px');
	});

	guard('head', () => {
		document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => OUT.head.stylesheetLinks.push(l.href));
		document.querySelectorAll('link[rel="preload"]').forEach((l) => OUT.head.preloads.push({ href: l.href, as: l.as }));
		document.querySelectorAll('link[href*="font" i]').forEach((l) => OUT.head.fontLinks.push(l.href));
		document.querySelectorAll('meta[name]').forEach((m) => (OUT.head.metas[m.name] = m.content));
	});

	try { await (document.fonts ? document.fonts.ready : Promise.resolve()); } catch {}
	guard('fonts.loaded', () => { const s = new Set(); document.fonts.forEach((f) => s.add(`${f.family} | ${f.style} | ${f.weight} | ${f.status}`)); OUT.fonts.loaded = [...s]; });

	// ---- stylesheets (full text) + @font-face ----
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

	// ---- all style rules once, for matched-rule lookup ----
	const ALLRULES = [];
	const collectRule = (r) => { try { if (r.cssRules && r.cssRules.length && !r.selectorText) { for (const sub of r.cssRules) collectRule(sub); return; } if (r.selectorText) ALLRULES.push({ selector: r.selectorText, cssText: r.cssText }); } catch {} };
	guard('rules.collect', () => { for (const sheet of document.styleSheets) { try { for (const r of sheet.cssRules) collectRule(r); } catch {} } });
	const baseSelector = (s) => s
		.replace(/::[a-z-]+(\([^)]*\))?/gi, '').replace(/:not\([^)]*\)/gi, '')
		.replace(/:is\(([^)]*)\)/gi, '$1').replace(/:where\(([^)]*)\)/gi, '$1')
		.replace(/:nth-[a-z-]+\([^)]*\)/gi, '')
		.replace(/:(hover|focus|focus-visible|focus-within|active|visited|checked|disabled|enabled|required|optional|valid|invalid|first-child|last-child|first-of-type|last-of-type|only-child|read-only|read-write|placeholder-shown|default|target|empty|root)/gi, '').trim();
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
	const deep = (el, withRules) => {
		const o = {
			path: cssPath(el), tag: el.tagName.toLowerCase(), id: el.id || undefined,
			class: (el.getAttribute && el.getAttribute('class')) || undefined, rect: rectOf(el),
			text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 100) || undefined,
			attrs: attrsOf(el), icon: iconOf(el), presenterOnly: presenterOnly.has(el) || undefined,
			style: snap(el), before: pseudo(el, '::before'), after: pseudo(el, '::after')
		};
		if (withRules) o.matchedRules = matchedRulesFor(el);
		return o;
	};

	const all = [...document.querySelectorAll('*')];

	// Mark presenter-only nodes (broadcast/admin controls) + all their descendants
	// so the MEMBER view = every node WITHOUT presenterOnly. Derived from a single
	// presenter session — no member login needed.
	const presenterOnly = new WeakSet();
	guard('presenterOnly', () => {
		const roots = new Set();
		for (const sel of ADMIN_MARKERS) { try { document.querySelectorAll(sel).forEach((n) => roots.add(n)); } catch {} }
		// Also treat the whole nav broadcast cluster + admin sidebar group as presenter-only.
		['#navbarsRoom .nav-item', '.presenter-controls', '.broadcast-controls', '[class*="admin" i] .sidebar-item'].forEach((sel) => { try { document.querySelectorAll(sel).forEach((n) => roots.add(n)); } catch {} });
		for (const root of roots) { presenterOnly.add(root); root.querySelectorAll('*').forEach((d) => presenterOnly.add(d)); }
		OUT.meta.presenterOnlyRoots = roots.size;
	});
	const isPresenterOnly = (el) => presenterOnly.has(el) || undefined;

	guard('cssVariables', () => {
		const grab = (el) => { const cs = getComputedStyle(el); const o = {}; for (const p of cs) if (p.startsWith('--')) o[p] = cs.getPropertyValue(p).trim(); return o; };
		OUT.cssVariables.root = grab(document.documentElement); OUT.cssVariables.body = grab(document.body);
	});

	guard('elements+palette', () => {
		const tally = {};
		const bump = (k, v) => { if (!v || ['none', 'normal', 'auto', 'rgba(0, 0, 0, 0)', '0px'].includes(v)) return; (tally[k] ??= {}); tally[k][v] = (tally[k][v] || 0) + 1; };
		const CAP = 5000; let capped = false;
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
				const directText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 100);
				OUT.elements.push({ path: cssPath(el), tag: el.tagName.toLowerCase(), id: el.id || undefined, class: (el.getAttribute && el.getAttribute('class')) || undefined, rect: rectOf(el), text: directText || undefined, attrs: attrsOf(el), icon: iconOf(el), style: snap(el), before: pseudo(el, '::before'), after: pseudo(el, '::after') });
			} catch (e) { /* skip */ }
		}
		OUT.meta.elementsCapped = capped;
		const sort = (m) => Object.entries(m || {}).sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
		OUT.palette = Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, sort(v)]));
	});

	guard('assets', () => {
		const imgs = new Set(); document.querySelectorAll('img[src]').forEach((i) => imgs.add(i.src));
		const bgs = new Set(); for (const el of all) urlsIn(getComputedStyle(el).backgroundImage).forEach((u) => bgs.add(u));
		OUT.assets = { images: [...imgs], backgroundImages: [...bgs], inlineSvgs: [...document.querySelectorAll('svg')].slice(0, 300).map((s) => ({ class: s.getAttribute('class') || undefined, viewBox: s.getAttribute('viewBox') || undefined, html: s.outerHTML.slice(0, 400) })) };
	});

	guard('inventory', () => {
		OUT.inventory = {
			buttons: [...document.querySelectorAll('button, [role="button"], .btn, [class*="btn" i]')].slice(0, 900).map((b) => ({ text: txt(b).slice(0, 60), ariaLabel: b.getAttribute('aria-label') || undefined, title: b.getAttribute('title') || undefined, class: b.getAttribute('class') || undefined, disabled: b.disabled || undefined, rect: rectOf(b), icon: iconOf(b) })),
			inputs: [...document.querySelectorAll('input, textarea, select')].slice(0, 400).map((i) => ({ type: i.type || i.tagName.toLowerCase(), name: i.name || undefined, placeholder: i.placeholder || undefined, ariaLabel: i.getAttribute('aria-label') || undefined, class: i.getAttribute('class') || undefined, rect: rectOf(i) })),
			links: [...document.querySelectorAll('a[href]')].slice(0, 500).map((a) => ({ text: txt(a).slice(0, 60), href: a.href, class: a.getAttribute('class') || undefined })),
			menus: [...document.querySelectorAll('[role="menu"], .dropdown-menu, .menu, [class*="dropdown" i]')].slice(0, 300).map((m) => ({ class: m.getAttribute('class') || undefined, items: [...m.querySelectorAll('a, button, [role="menuitem"], li')].slice(0, 40).map((x) => txt(x).slice(0, 40)).filter(Boolean) })),
			modalsInDom: [...document.querySelectorAll('[role="dialog"], .modal, .modal-content, [class*="modal" i]')].slice(0, 120).map((m) => ({ class: m.getAttribute('class') || undefined, title: txt(m.querySelector('h1,h2,h3,.modal-title,.title')).slice(0, 60), visible: m.getBoundingClientRect().width > 0 })),
			dataAttributes: (() => { const set = new Set(); for (const el of all) for (const a of el.attributes || []) if (a.name.startsWith('data-')) set.add(a.name); return [...set]; })()
		};
	});

	// ---- AUTO-REVEAL: snapshot view-only states ----
	const captureState = (stateLabel) => {
		const ROOTS = [
			'app-presentationarea', '.presentation-box', '.presentation-area', '#mainTabs',
			'app-webcam-holder', '.modal.show', '.modal[style*="display: block"]', '[role="dialog"]',
			'.dropdown-menu.show', '.show > .dropdown-menu', '.volumeControl'
		];
		const groups = [];
		const seenRoots = new Set();
		for (const sel of ROOTS) {
			let nodes = []; try { nodes = [...document.querySelectorAll(sel)]; } catch { continue; }
			for (const root of nodes) {
				if (seenRoots.has(root)) continue; seenRoots.add(root);
				const r = root.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
				const els = [root, ...root.querySelectorAll('*')].slice(0, 500);
				groups.push({ selector: sel, rootPath: cssPath(root), count: els.length, nodes: els.map((el) => { try { const rr = el.getBoundingClientRect(); if (rr.width < 1 || rr.height < 1) return null; return deep(el, true); } catch { return null; } }).filter(Boolean) });
			}
		}
		OUT.states[stateLabel] = { groups };
	};

	// click a view-only control whose trimmed text exactly equals one of `labels`
	const clickEl = (el) => { if (el) { try { el.click(); return el; } catch {} } return null; };
	const byId = (id) => document.getElementById(id);
	// Text fallback scoped to a SPECIFIC container (so it can't match the chat tab bar).
	const clickTextIn = (containerSel, label) => {
		const c = document.querySelector(containerSel); if (!c) return null;
		const el = [...c.querySelectorAll('.nav-link, a, button')].find((x) => txt(x).toLowerCase() === label.toLowerCase());
		return clickEl(el);
	};

	// remember the originally-active main tab id, to restore at the end
	let originalTabId = null;
	guard('reveal.init', () => { const a = document.querySelector('#mainTabs .nav-link.active'); originalTabId = a ? a.id : null; });

	// 1) main presentation tabs — click by their STABLE ids. (The previous
	//    text-scan matched the chat tab bar, which precedes #mainTabs in the DOM.)
	const MAIN = [['screens-tab', 'Screens'], ['streams-tab', 'Streams'], ['notes-tab', 'Notes'], ['files-tab', 'Files']];
	for (const [id, label] of MAIN) {
		await guard('reveal.tab.' + label, async () => {
			const el = clickEl(byId(id)) || clickTextIn('#mainTabs', label);
			if (!el) { OUT.states['tab:' + label] = { groups: [], note: 'tab not found' }; return; }
			await sleep(400);
			captureState('tab:' + label);
			if (label === 'Notes') {
				const noteTabs = [...document.querySelectorAll('#notesTabs .nav-link, #notesTabs a')];
				for (const nt of noteTabs.slice(0, 12)) { const lbl = (txt(nt) || nt.id || 'note').slice(0, 30); clickEl(nt); await sleep(300); captureState('note:' + lbl); }
			}
			if (label === 'Files') {
				const pane = byId('files') || document.querySelector('#mainTabsContent .tab-pane.active') || document.querySelector('#mainTabsContent');
				for (const sub of ['Files', 'Images', 'Sounds']) {
					const s = pane ? [...pane.querySelectorAll('.nav-link, a, button')].find((x) => txt(x).toLowerCase() === sub.toLowerCase()) : null;
					if (clickEl(s)) { await sleep(300); captureState('files:' + sub); }
				}
			}
		});
	}

	// 2) dropdown toggles (view-only)
	await guard('reveal.dropdowns', async () => {
		const toggles = [...document.querySelectorAll('.dropdown-toggle, [data-bs-toggle="dropdown"], .volumeControl, a[id*="Volume" i]')].slice(0, 8);
		let i = 0;
		for (const tg of toggles) { i++; try { tg.click(); await sleep(250); if (document.querySelector('.dropdown-menu.show, .show > .dropdown-menu')) captureState('dropdown:' + i); tg.click(); await sleep(120); } catch {} }
	});

	// 2b) sidebar + archives + roster cog + first alert kebab (view-only toggles)
	await guard('reveal.sidebar', async () => {
		const burger = document.querySelector('.sidebar-menu, [title="Open Sidebar"]');
		if (!burger) return;
		burger.click(); await sleep(400); captureState('sidebar:open');
		const arch = document.querySelector('#archivesDropdown, .sidebar-item.dropdown-toggle');
		if (arch) { arch.click(); await sleep(300); captureState('sidebar:archives-open'); arch.click(); await sleep(150); }
		const cog = document.querySelector('#user-options-btn');
		if (cog) { cog.click(); await sleep(300); captureState('sidebar:roster-cog-open'); cog.click(); await sleep(150); }
		burger.click(); await sleep(250);
	});
	await guard('reveal.kebab', async () => {
		const kebab = document.querySelector('#dropdownMenuLink, a.msgMenu');
		if (!kebab) return;
		kebab.click(); await sleep(300); captureState('kebab:open'); kebab.click(); await sleep(150);
	});

	// 2c) MODALS — open each data-bs-toggle="modal" trigger, snapshot, close.
	// View-only: only the trigger and the ✕/Escape are used; no action buttons.
	await guard('reveal.modals', async () => {
		const seen = new Set();
		const triggers = [...document.querySelectorAll('[data-bs-toggle="modal"]')].slice(0, 40);
		for (const tg of triggers) {
			const target = tg.getAttribute('data-bs-target') || tg.getAttribute('href') || '?';
			if (seen.has(target)) continue; seen.add(target);
			try {
				tg.click(); await sleep(600);
				const open = document.querySelector('.modal.show, .modal[style*="display: block"]');
				if (open) {
					captureState('modal:' + target.replace(/[^\w-]/g, ''));
					const x = open.querySelector('.btn-close, [data-bs-dismiss="modal"]');
					if (x) x.click();
					else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
					await sleep(400);
				}
			} catch (e) { OUT.errors.push('modal ' + target + ': ' + (e && e.message)); }
		}
	});

	// ---- MANUAL LIVE SNAPSHOTS ------------------------------------------------
	// After the auto run finishes, put the app into a LIVE state (broadcasting,
	// sharing, RECORDING, CC on, music menu open, …) and run  SNAP('label') —
	// it captures every visible element (full computed styles + matched rules)
	// and DOWNLOADS proroom-live-<role>-<label>.json IMMEDIATELY.
	window.SNAP = (label) => {
		try {
			const els = [];
			let n = 0;
			for (const el of document.querySelectorAll('*')) {
				if (n >= 4000) break;
				const r = el.getBoundingClientRect();
				const cs = getComputedStyle(el);
				if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') continue;
				els.push(deep(el, true)); n++;
			}
			const payload = { meta: { ...OUT.meta, label, at: new Date().toISOString() }, count: els.length, elements: els };
			const json = JSON.stringify(payload);
			const a = document.createElement('a');
			a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
			a.download = 'proroom-live-' + ROLE + '-' + String(label).replace(/[^\w-]+/g, '_') + '.json';
			document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);
			console.log('%cSNAP ' + label + ' — ' + els.length + ' els, ' + (json.length / 1048576).toFixed(1) + 'MB downloaded', 'color:#fff;background:#0a6db1;padding:2px 8px');
		} catch (e) { console.error('SNAP failed:', e); }
	};

	// 3) restore the original tab
	guard('reveal.restore', () => { clickEl((originalTabId && byId(originalTabId)) || byId('notes-tab')); });

	console.log('%cCAPTURE-ALL — ' + ROLE + ' | auto states: ' + Object.keys(OUT.states).length, 'font-weight:bold;font-size:14px;color:#45a2ff');
	console.log('%cNOW: go live / share / RECORD / CC etc., then run  SNAP(\'recording-live\')  etc. Each SNAP downloads instantly.', 'color:#000;background:#f7fd37;padding:2px 8px');
	dl();
	window.OUT = OUT;
	return 'done — check Downloads for proroom-all-' + LABEL + '.json (+ run SNAP(\'label\') for live states)';
})();
