/* ============================================================================
 * pro-room EVIDENCE-GAP CAPTURE — DevTools Console, ON THE REAL APP
 * (chat.protradingroom.com), logged in, inside the room. Full desktop width
 * (undock DevTools so the window is >= 1100px).
 *
 *  WHY THIS EXISTS
 *   The full-state captures miss the CLICK-TRIGGERED UI: chat/alert GEAR
 *   dropdowns, the SHARE-SCREEN source picker, every MODAL's internals, the
 *   active Screens/Files PANES, and real ALERT/CHAT message ROWS (rows were
 *   collapsed before). This script closes those gaps. Same JSON schema as
 *   proroom-full-*.json: every snapshot is deep computed styles + the MATCHED
 *   CSS RULES (incl :hover/::before), so it diffs straight against our app.
 *
 *  IMPORTANT — Angular portals its overlays/dropdowns/modals into
 *   `.cdk-overlay-container` at the end of <body> (that's why the old script
 *   never saw the gear menus). This script captures that container explicitly.
 *
 *  HOW TO RUN
 *   1. Set ROLE below ('presenter' when logged in as admin/presenter, 'member'
 *      otherwise).
 *   2. Paste + Enter. It does an AUTO pass (base CSS + tabs + active panes +
 *      alert/chat rows + gear dropdowns) and downloads proroom-gaps-<ROLE>.json.
 *   3. THEN fill any remaining gap BY HAND and snapshot it. Two globals are left
 *      on `window`:
 *         GRAB('share-screen-picker')   // open the picker, then run this
 *         GRAB('modal:Settings')        // open a modal, then run this
 *         GRAB('alert-gear-menu')       // open the alert gear dropdown, then run
 *         SAVE()                        // re-download with everything you GRABbed
 *      GRAB snapshots ALL currently-visible overlays (modals, dropdowns, menus,
 *      cdk-overlay panes) + an optional extra selector: GRAB('x', '.my-sel').
 *
 *  SAFETY: the AUTO pass only clicks view-only tabs + dropdown TOGGLES; it NEVER
 *   clicks Post/Send/Save/Go-live, and it NEVER auto-clicks Share-screen (that
 *   triggers a screen-capture prompt) — open that one yourself, then GRAB it.
 *   The auto pass restores the original tab when done.
 *   Run once as PRESENTER and once as MEMBER.
 * ========================================================================== */
(async () => {
	const ROLE = 'presenter'; // ← 'presenter' (admin) or 'member'

	const OUT = {
		meta: {}, cssVariables: {}, stylesheets: [], fonts: {}, states: {}, errors: []
	};
	const guard = (name, fn) => { try { return fn(); } catch (e) { OUT.errors.push(name + ': ' + (e && e.message)); console.warn('section failed:', name, e); } };
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
	const pseudo = (el, which) => { try { const cs = getComputedStyle(el, which); const c = cs.content; if (!c || c === 'none' || c === 'normal') return null; return { content: c, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, background: cs.backgroundColor, width: cs.width, height: cs.height }; } catch { return null; } };
	const attrsOf = (el) => { const o = {}; for (const a of el.attributes || []) if (a.name !== 'style') o[a.name] = String(a.value).slice(0, 300); return o; };
	const txt = (el) => (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
	const iconOf = (el) => { const i = el.querySelector && el.querySelector('i[class*="fa"], svg[class*="fa"], [class*="fa-"]'); return i ? (i.getAttribute('class') || undefined) : undefined; };
	const cssPath = (el) => { const p = []; let c = el; while (c && c.nodeType === 1 && p.length < 12) { let s = c.tagName.toLowerCase(); if (c.id) { p.unshift(s + '#' + c.id); break; } const cl = [...c.classList].slice(0, 4).join('.'); if (cl) s += '.' + cl; const par = c.parentElement; if (par) s += `:nth-child(${[...par.children].indexOf(c) + 1})`; p.unshift(s); c = par; } return p.join(' > '); };

	guard('meta', () => {
		OUT.meta = { role: ROLE, url: location.href, title: document.title, viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio }, tooNarrow: innerWidth < 1100, capturedAt: new Date().toISOString() };
		if (innerWidth < 1100) console.warn('%c⚠ window is ' + innerWidth + 'px — undock DevTools + re-run for usable layout.', 'color:#000;background:#f39c12;padding:3px 8px');
	});
	try { await (document.fonts ? document.fonts.ready : Promise.resolve()); } catch {}
	guard('cssVariables', () => { const grab = (el) => { const cs = getComputedStyle(el); const o = {}; for (const p of cs) if (p.startsWith('--')) o[p] = cs.getPropertyValue(p).trim(); return o; }; OUT.cssVariables.root = grab(document.documentElement); OUT.cssVariables.body = grab(document.body); });

	// ---- stylesheets (full text) + ALLRULES for matched-rule lookup ----
	const ALLRULES = [];
	const collectRule = (r) => { try { if (r.cssRules && r.cssRules.length && !r.selectorText) { for (const sub of r.cssRules) collectRule(sub); return; } if (r.selectorText) ALLRULES.push({ selector: r.selectorText, cssText: r.cssText }); } catch {} };
	for (const sheet of [...document.styleSheets]) {
		const entry = { href: sheet.href || '(inline)', rules: 0, blocked: false };
		try { const rules = sheet.cssRules; entry.rules = rules.length; for (const r of rules) collectRule(r); }
		catch { entry.blocked = true; if (sheet.href) { try { const res = await fetch(sheet.href); if (res.ok) { const text = await res.text(); const s = document.createElement('style'); s.textContent = text; document.head.appendChild(s); try { for (const r of s.sheet.cssRules) collectRule(r); } catch {} s.remove(); entry.blocked = false; } } catch {} } }
		OUT.stylesheets.push(entry);
	}
	const baseSelector = (s) => s
		.replace(/::[a-z-]+(\([^)]*\))?/gi, '').replace(/:not\([^)]*\)/gi, '')
		.replace(/:is\(([^)]*)\)/gi, '$1').replace(/:where\(([^)]*)\)/gi, '$1')
		.replace(/:nth-[a-z-]+\([^)]*\)/gi, '')
		.replace(/:(hover|focus|focus-visible|focus-within|active|visited|checked|disabled|enabled|required|optional|valid|invalid|first-child|last-child|first-of-type|last-of-type|only-child|read-only|read-write|placeholder-shown|default|target|empty|root)/gi, '').trim();
	const matchedRulesFor = (el, cap = 40) => {
		const out = [];
		for (const r of ALLRULES) {
			for (const oneSel of r.selector.split(',')) {
				const s = oneSel.trim(); if (!s) continue;
				let base; try { base = baseSelector(s); } catch { continue; }
				if (!base || /[>+~]\s*$/.test(base)) continue;
				let hit = false; try { hit = el.matches(base); } catch { continue; }
				if (hit) { out.push({ selector: s, cssText: r.cssText.slice(0, 1400) }); break; }
			}
			if (out.length >= cap) break;
		}
		return out;
	};
	const deep = (el, withRules) => {
		const o = { path: cssPath(el), tag: el.tagName.toLowerCase(), id: el.id || undefined, class: (el.getAttribute && el.getAttribute('class')) || undefined, rect: rectOf(el),
			text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 120) || undefined,
			attrs: attrsOf(el), icon: iconOf(el), style: snap(el), before: pseudo(el, '::before'), after: pseudo(el, '::after') };
		if (withRules) o.matchedRules = matchedRulesFor(el);
		return o;
	};
	const captureSubtree = (root, cap = 600) => {
		const els = [root, ...root.querySelectorAll('*')].slice(0, cap);
		return { rootPath: cssPath(root), rootClass: root.getAttribute('class') || undefined, count: els.length,
			nodes: els.map((el) => { try { const rr = el.getBoundingClientRect(); if (rr.width < 1 || rr.height < 1) return null; return deep(el, true); } catch { return null; } }).filter(Boolean) };
	};

	// ---- the heart: snapshot named state = all current overlays + an extra selector ----
	const OVERLAY_ROOTS = [
		'.cdk-overlay-container', '.cdk-overlay-pane', '.modal.show', '.modal.in', '.modal[style*="display: block"]',
		'[role="dialog"]', '.dropdown-menu.show', '.show > .dropdown-menu', '.dropdown-menu[style*="display: block"]',
		'[role="menu"]', '.popover.show', '.tooltip.show', '.mat-mdc-menu-panel', '.mat-menu-panel'
	];
	const captureState = (label, extraSelector) => {
		const groups = []; const seen = new Set();
		const sels = [...OVERLAY_ROOTS]; if (extraSelector) sels.push(extraSelector);
		for (const sel of sels) {
			let nodes = []; try { nodes = [...document.querySelectorAll(sel)]; } catch { continue; }
			for (const root of nodes) { if (seen.has(root)) continue; seen.add(root); const r = root.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue; groups.push({ selector: sel, ...captureSubtree(root) }); }
		}
		OUT.states[label] = { groups, capturedAt: new Date().toISOString() };
		const total = groups.reduce((n, g) => n + g.count, 0);
		console.log('%cGRAB ' + label + ' → ' + groups.length + ' overlay group(s), ' + total + ' nodes' + (groups.length ? '' : '  ⚠ nothing visible — open it first!'),
			'color:#fff;background:' + (groups.length ? '#45a2ff' : '#e67e22') + ';padding:2px 8px');
		return groups.length;
	};
	// capture an explicit element subtree by selector (for rows / panes / controls that aren't "overlays")
	const captureTarget = (label, selector, cap = 600) => {
		const root = document.querySelector(selector);
		if (!root) { OUT.states[label] = { groups: [], note: 'selector not found: ' + selector }; console.log('%c' + label + ' — selector not found: ' + selector, 'color:#e67e22'); return 0; }
		OUT.states[label] = { groups: [{ selector, ...captureSubtree(root, cap) }], capturedAt: new Date().toISOString() };
		console.log('%cTARGET ' + label + ' → ' + selector, 'color:#45a2ff'); return 1;
	};

	const dl = () => {
		try {
			const json = JSON.stringify(OUT, null, 2);
			const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
			a.download = `proroom-gaps-${ROLE}.json`; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);
			console.log('%cDOWNLOADED proroom-gaps-' + ROLE + '.json — ' + (json.length / 1048576).toFixed(2) + 'MB | states: ' + Object.keys(OUT.states).join(', '), 'color:#fff;background:#92d528;font-size:14px;padding:3px 8px');
		} catch (e) { console.error('DOWNLOAD FAILED — copy(OUT) instead:', e); window.OUT = OUT; }
	};

	const clickEl = (el) => { if (el) { try { el.click(); return el; } catch {} } return null; };
	const byId = (id) => document.getElementById(id);
	const find = (sel) => { try { return document.querySelector(sel); } catch { return null; } };

	// ===================== AUTO PASS (view-only) =====================
	let originalTabId = null;
	guard('reveal.init', () => { const a = find('#mainTabs .nav-link.active'); originalTabId = a ? a.id : null; });

	// 1) main tabs + the ACTIVE PANE internals (Screens/Files panes are a known gap)
	const MAIN = [['screens-tab', 'Screens'], ['notes-tab', 'Notes'], ['files-tab', 'Files']];
	for (const [id, label] of MAIN) {
		await guard('tab.' + label, async () => {
			const el = clickEl(byId(id)); if (!el) { OUT.states['pane:' + label] = { groups: [], note: 'tab id not found: ' + id }; return; }
			await sleep(450);
			const pane = find('#mainTabsContent .tab-pane.active') || find('#mainTabsContent') || find('.presentation-box');
			if (pane) OUT.states['pane:' + label] = { groups: [{ selector: 'active-pane', ...captureSubtree(pane) }], capturedAt: new Date().toISOString() };
			if (label === 'Files') for (const sub of ['Files', 'Images', 'Sounds']) { const s = pane ? [...pane.querySelectorAll('.nav-link, a, button')].find((x) => txt(x).toLowerCase() === sub.toLowerCase()) : null; if (clickEl(s)) { await sleep(300); const ap = find('#mainTabsContent .tab-pane.active') || pane; OUT.states['files:' + sub] = { groups: [{ selector: 'files-sub', ...captureSubtree(ap) }] }; } }
		});
	}

	// 2) ALERT + CHAT message ROWS (rows were collapsed before — capture the real lists deep)
	guard('rows', () => {
		const ROW_TARGETS = [
			['alerts-list', '.alert-chat-box .alerts, .alertHolder, [class*="alert" i] [class*="list" i]'],
			['alert-row', '.alert-chat-box .alert-item, .alertItem, [class*="alert" i] [class*="item" i]'],
			['chat-list', '.chatHolder, [class*="chat" i] [class*="messages" i], [class*="chat" i] [class*="list" i]'],
			['chat-row', '.chatMessage, .chat-message, [class*="message" i][class*="row" i], [class*="chat" i] [class*="item" i]']
		];
		for (const [label, sel] of ROW_TARGETS) { const el = find(sel); if (el) captureTarget(label, sel); }
	});

	// 3) GEAR dropdowns (alert + chat) — toggle, capture overlay (incl cdk portal), close
	await guard('gears', async () => {
		const gears = [...document.querySelectorAll('.chat-header-gear, .alertHeader .dropdown-toggle, .chat-nav .dropdown-toggle, a.dropdown-toggle i.fa-cog')].map((e) => e.closest('a,button') || e);
		let i = 0; const seen = new Set();
		for (const g of gears) { if (!g || seen.has(g)) continue; seen.add(g); i++; try { g.click(); await sleep(300); captureState('gear-menu:' + i); g.click(); await sleep(150); } catch {} }
		if (!i) OUT.states['gear-menu:none'] = { groups: [], note: 'no gear toggles found by selector — open manually + GRAB("gear-menu")' };
	});

	// 4) presenter broadcast controls — exact sizes (never rendered in idle/member captures)
	guard('broadcast-controls', () => { const bars = ['.nav-controls', '.navbar .controls', 'app-broadcast-controls', '[class*="broadcast" i]']; for (const b of bars) { const el = find(b); if (el) { captureTarget('broadcast-controls', b); break; } } });

	// 5) restore original tab
	guard('restore', () => { clickEl((originalTabId && byId(originalTabId)) || byId('notes-tab')); });

	// ---- expose manual gap-capture API + save ----
	window.GRAB = (label, extraSelector) => { captureState(label || ('grab:' + (Object.keys(OUT.states).length + 1)), extraSelector); return 'grabbed — call SAVE() when done'; };
	window.TARGET = (label, selector, cap) => { captureTarget(label, selector, cap); return 'targeted — call SAVE() when done'; };
	window.SAVE = () => { dl(); return 'saved'; };
	window.OUT = OUT;

	console.log('%cpro-room GAP capture (' + ROLE + ') — auto states: ' + Object.keys(OUT.states).length, 'font-weight:bold;font-size:14px;color:#45a2ff');
	console.log('%cNOW fill the remaining gaps by hand:', 'font-weight:bold');
	console.log('  • open the SHARE-SCREEN picker → GRAB("share-screen-picker")');
	console.log('  • open each MODAL → GRAB("modal:<Name>")   (e.g. Settings, Post-alert, Advanced-search)');
	console.log('  • open the alert/chat GEAR menu if auto missed it → GRAB("gear-menu")');
	console.log('  • then SAVE()   ← re-downloads proroom-gaps-' + ROLE + '.json with everything');
	dl();
	return 'AUTO pass done. Use GRAB(label) for each gap, then SAVE(). Run once as presenter, once as member.';
})();
