/* ============================================================================
 * pro-room PRESENTER DEEP CAPTURE — DevTools Console, ON THE REAL APP
 * (chat.protradingroom.com), logged in as ADMIN/PRESENTER, inside the room.
 * Undock DevTools so the window is full desktop width (>= 1100px).
 *
 *  WHY: earlier diffs leaned on partly-empty audit slices, a non-light-theme
 *  capture, and hand-resolved cascades. This pulls GROUND TRUTH for the exact
 *  elements under question:
 *    1. the FINAL resolved getComputedStyle (what the browser actually paints)
 *    2. the cascade-resolved :hover / :active winners (specificity + !important
 *       + source order computed IN-SCRIPT, so hover/active are evidence not guesses)
 *    3. each element's rect + the resolved CSS variables + theme + window width.
 *
 *  HOW TO RUN
 *    1. Be in the room as PRESENTER/ADMIN. Undock DevTools, full width.
 *    2. Paste + Enter. It opens the sidebar drawer (to measure it), captures,
 *       restores, and downloads proroom-presenter-deep.json. Send me that file.
 *  SAFETY: only clicks the sidebar toggle (view-only); never posts/sends/saves.
 * ========================================================================== */
(async () => {
	const ROLE = 'presenter';
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const OUT = { meta: {}, cssVariables: {}, targets: {}, errors: [] };

	// ---- broad property set we care about (resolved values) ----
	const PROPS = ['display','position','box-sizing','width','height','min-width','min-height','max-width','max-height',
		'background-color','background-image','color','opacity',
		'font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-transform','text-align','text-decoration-line','white-space',
		'margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left',
		'border-top-width','border-right-width','border-bottom-width','border-left-width',
		'border-top-color','border-right-color','border-bottom-color','border-left-color','border-top-style',
		'border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius',
		'box-shadow','gap','flex-direction','justify-content','align-items','cursor','vertical-align'];

	// ---- specificity calculator (a=ids, b=classes/attrs/pseudo-classes, c=elements/pseudo-elements) ----
	const specificity = (sel) => {
		let s = sel.replace(/\s*[>+~]\s*/g, ' ');
		const a = (s.match(/#[\w-]+/g) || []).length;
		const b = (s.match(/\.[\w-]+/g) || []).length + (s.match(/\[[^\]]+\]/g) || []).length + (s.match(/:(?!:)(hover|focus|active|checked|disabled|not|is|where|first-child|last-child|nth-child|visited|focus-within|focus-visible|read-only|empty|target)[\w-]*(\([^)]*\))?/g) || []).length;
		const c = (s.replace(/[#.][\w-]+/g, ' ').replace(/\[[^\]]+\]/g, ' ').replace(/::?[\w-]+(\([^)]*\))?/g, ' ').match(/\b[a-z][\w-]*\b/gi) || []).length + (s.match(/::[\w-]+/g) || []).length;
		return a * 10000 + b * 100 + c;
	};
	// strip pseudo-classes/elements to get a base selector that can be element.matches()'d
	const PSEUDO = /:{1,2}(hover|active|focus|focus-visible|focus-within|visited|checked|disabled|enabled|first-child|last-child|first-of-type|last-of-type|only-child|read-only|read-write|placeholder-shown|default|target|empty|before|after|placeholder|root)(\([^)]*\))?/gi;
	const baseSel = (s) => s.replace(/::[\w-]+(\([^)]*\))?/g, '').replace(PSEUDO, '').replace(/:is\(([^)]*)\)/gi,'$1').replace(/:where\(([^)]*)\)/gi,'$1').replace(/:not\([^)]*\)/gi,'').trim();
	const stateOf = (s) => (/:hover/i.test(s) ? 'hover' : /:active/i.test(s) ? 'active' : /:focus/i.test(s) ? 'focus' : 'base');

	// ---- collect every style rule once: {selector, decls:{prop:{value,important}}, order} ----
	const RULES = [];
	let order = 0;
	const addRule = (r) => {
		try {
			if (r.cssRules && !r.selectorText) { for (const sub of r.cssRules) addRule(sub); return; }
			if (!r.selectorText || !r.style) return;
			const decls = {};
			for (const p of r.style) decls[p] = { value: r.style.getPropertyValue(p), important: r.style.getPropertyPriority(p) === 'important' };
			RULES.push({ selector: r.selectorText, decls, order: order++ });
		} catch {}
	};
	for (const sheet of [...document.styleSheets]) {
		try { for (const r of sheet.cssRules) addRule(r); }
		catch (e) { if (sheet.href) { try { const t = await (await fetch(sheet.href)).text(); const s = document.createElement('style'); s.textContent = t; document.head.appendChild(s); for (const r of s.sheet.cssRules) addRule(r); s.remove(); } catch { OUT.errors.push('sheet blocked: ' + sheet.href); } } }
	}

	// winning declaration for a property in a given state ('base' | 'hover' | 'active')
	const resolve = (el, prop, state) => {
		let best = null;
		for (const rule of RULES) {
			for (const oneSel of rule.selector.split(',')) {
				const sel = oneSel.trim(); if (!sel) continue;
				const st = stateOf(sel);
				// base state: only base rules; hover state: base + hover rules (hover layers on base)
				if (state === 'base' && st !== 'base') continue;
				if (state === 'hover' && !(st === 'base' || st === 'hover')) continue;
				if (state === 'active' && !(st === 'base' || st === 'active')) continue;
				const bs = baseSel(sel); if (!bs || /[>+~]\s*$/.test(bs)) continue;
				let m = false; try { m = el.matches(bs); } catch { continue; }
				if (!m) continue;
				const d = rule.decls[prop]; if (!d || d.value === '') continue;
				const stateBonus = (state !== 'base' && st === state) ? 1 : 0; // same-state rules win ties over base
				const rank = [d.important ? 1 : 0, stateBonus, specificity(sel), rule.order];
				if (!best || cmp(rank, best.rank) > 0) best = { value: d.value, important: d.important, selector: sel, state: st, rank };
			}
		}
		return best ? { value: best.value, important: best.important, selector: best.selector, fromState: best.state } : null;
	};
	const cmp = (a, b) => { for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return a[i] - b[i]; } return 0; };

	const rectOf = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
	const computedOf = (el) => { const cs = getComputedStyle(el); const o = {}; for (const p of PROPS) o[p] = cs.getPropertyValue(p); return o; };
	const HOVER_PROPS = ['background-color','color','border-top-color','opacity','text-decoration-line'];
	// RAW transparency: every rule whose base selector matches el, with its hover/color decls + specificity + !important + order.
	const matchingRules = (el) => {
		const out = [];
		for (const rule of RULES) {
			for (const oneSel of rule.selector.split(',')) {
				const sel = oneSel.trim(); if (!sel) continue;
				const bs = baseSel(sel); if (!bs || /[>+~]\s*$/.test(bs)) continue;
				let m = false; try { m = el.matches(bs); } catch { continue; }
				if (!m) continue;
				const decls = {};
				for (const p of HOVER_PROPS) if (rule.decls[p]) decls[p] = rule.decls[p].value + (rule.decls[p].important ? ' !important' : '');
				if (Object.keys(decls).length) out.push({ selector: sel, state: stateOf(sel), specificity: specificity(sel), order: rule.order, decls });
			}
		}
		return out.sort((a, b) => b.specificity - a.specificity).slice(0, 24);
	};
	const capture = (el) => {
		const o = { tag: el.tagName.toLowerCase(), id: el.id || undefined, class: el.getAttribute('class') || undefined,
			text: (el.textContent || '').replace(/\s+/g,' ').trim().slice(0,60), rect: rectOf(el),
			computed: computedOf(el), hover: {}, active: {}, matchingRules: matchingRules(el) };
		for (const p of HOVER_PROPS) { const h = resolve(el, p, 'hover'); if (h) o.hover[p] = h; const a = resolve(el, p, 'active'); if (a) o.active[p] = a; }
		return o;
	};

	// ---- TARGETS (real-app selectors). For each: capture up to N matches. "note" documents what we're checking. ----
	const TARGETS = [
		{ key: 'navbar', sel: 'nav.navbar, .navbar', n: 1, note: 'top navbar shell' },
		{ key: 'userPill', sel: 'span.users, .users', n: 1, note: 'user-count pill — TRUE resting height/margin/box' },
		{ key: 'userPillIcon', sel: '.users i.fa-user, .users .fa-user', n: 1, note: 'fa-user glyph' },
		{ key: 'sidebarDrawer', sel: '.sidebar, app-sidebar .sidebar, .room-sidebar', n: 1, note: 'white drawer — width/bg' },
		{ key: 'sidebarItem', sel: '.sidebar-item', n: 4, note: 'menu item — TRUE resting + :hover winners (bg/color)' },
		{ key: 'chatHolder', sel: '#textAreaHolder', n: 1, note: 'chat composer holder — radius/border/bg' },
		{ key: 'chatTextarea', sel: '.txt-area, #textAreaHolder textarea', n: 1, note: 'chat textarea — height/min-height/weight/color' },
		{ key: 'mainTabs', sel: '#mainTabs .nav-link', n: 6, note: 'Screens/Notes/Files tabs — which has .active (default tab)' },
		{ key: 'notesTabActive', sel: '#notes-tab', n: 1, note: 'notes tab' },
		{ key: 'screensTabActive', sel: '#screens-tab', n: 1, note: 'screens tab' },
		{ key: 'alertQa', sel: '.alert-qa', n: 2, note: 'Q&A badge — bg/color/border (btn-secondary?)' },
		{ key: 'alertHeader', sel: 'nav.alertHeader, .alertHeader', n: 1, note: 'alerts header bar' }
	];

	// open the sidebar drawer so it is measurable (view-only toggle)
	const opener = document.querySelector('.sidebar-menu, .menu-btn, button[aria-label*="idebar" i], .navbar .fa-bars');
	let openedSidebar = false;
	try { if (opener && !document.querySelector('.sidebar-item')) { (opener.closest('a,button,span') || opener).click(); openedSidebar = true; await sleep(500); } } catch {}

	for (const t of TARGETS) {
		try {
			const els = [...document.querySelectorAll(t.sel)].slice(0, t.n);
			OUT.targets[t.key] = { selector: t.sel, note: t.note, found: els.length,
				active: t.key === 'mainTabs' ? ([...document.querySelectorAll('#mainTabs .nav-link.active')].map((e) => e.id || e.textContent.trim())) : undefined,
				items: els.map((el) => capture(el)) };
		} catch (e) { OUT.targets[t.key] = { selector: t.sel, error: String(e && e.message) }; }
	}

	// resolved CSS variables + meta
	try { const cs = getComputedStyle(document.documentElement); const v = {}; for (const p of cs) if (p.startsWith('--')) v[p] = cs.getPropertyValue(p).trim(); OUT.cssVariables = v; } catch {}
	OUT.meta = { role: ROLE, url: location.href, title: document.title, innerWidth, innerHeight, dpr: devicePixelRatio,
		htmlClass: document.documentElement.className, bodyClass: document.body.className, openedSidebar, rulesCollected: RULES.length, capturedAt: new Date().toISOString() };
	if (innerWidth < 1100) console.warn('%c⚠ window is ' + innerWidth + 'px — undock DevTools + re-run full width', 'background:#f39c12;color:#000;padding:2px 8px');

	// download
	try {
		const json = JSON.stringify(OUT, null, 2);
		const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
		a.download = 'proroom-presenter-deep.json'; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);
		console.log('%cDOWNLOADED proroom-presenter-deep.json — ' + (json.length / 1024).toFixed(1) + 'KB | width ' + innerWidth + ' | targets: ' + Object.keys(OUT.targets).join(', '), 'background:#92d528;color:#000;font-size:13px;padding:3px 8px');
		for (const [k, v] of Object.entries(OUT.targets)) console.log(k + ': found ' + (v.found ?? 'ERR') + (v.active ? ' | active=' + JSON.stringify(v.active) : ''));
	} catch (e) { console.error('download failed — copy(OUT):', e); window.OUT = OUT; }
	window.OUT = OUT;
	return 'done — send proroom-presenter-deep.json';
})();
