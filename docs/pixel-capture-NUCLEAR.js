/* =====================================================================
 * pro-room — NUCLEAR REFERENCE CAPTURE  (run in DevTools console)
 *
 * Pulls EVERYTHING the page can give in one file:
 *   - the full DOM tree (every element) with curated computed styles,
 *     rects, attrs, text, icon, ::before/::after pseudo content,
 *   - the ACTUAL matched CSS rules per element (incl :hover / ::before),
 *   - every revealed STATE it can safely reach: each tab panel, each
 *     dropdown menu, and each ALLOW-LISTED modal (opened then closed),
 *   - all same-origin stylesheets (full text) + cross-origin hrefs,
 *   - every resolved --css-var (token hexes) on :root,
 *   - loaded fonts, image/background/font assets, and a UI inventory.
 *
 * HOW TO RUN
 *   1. Open protradingroom.com FULL-WIDTH, DevTools UNDOCKED (>= 1100px).
 *   2. You're member-only on the reference, so run it logged in as a MEMBER
 *      (ROLE is preset to 'member'). It captures only what your account can
 *      open — presenter-only modals won't render for you. File:
 *      proroom-NUCLEAR-member.json.
 *   3. Paste this whole file, run. Wait for the green "DONE" log, then
 *      the download fires (it can take 10-40s + be tens of MB — that's
 *      the point).
 *
 * SAFETY (it's a LIVE app):
 *   - AUTO_REVEAL clicks ONLY tabs, dropdown toggles, and modal triggers
 *     whose label matches SAFE_MODAL. It SKIPS anything matching DANGER
 *     (go live / share / record / post / send / delete / kick / buy …).
 *   - It restores the active tab and closes what it opened (Esc/backdrop).
 *   - It reads NO cookies, localStorage, sessionStorage, or tokens.
 *   - Set AUTO_REVEAL=false for a pure read-only snapshot (no clicks).
 *
 * SIZE/SPEED KNOBS: MATCHED_RULES and INCLUDE_FULL_CSS are the heavy bits
 * — turn either off to shrink the file / speed it up.
 * ===================================================================== */
(async () => {
	const ROLE = 'member'; // <-- you're member-only on the reference; 'presenter' would need presenter access
	const AUTO_REVEAL = true; // cycle tabs/dropdowns + open allow-listed modals
	const MATCHED_RULES = true; // per-element matched CSS (the gold)
	const INCLUDE_FULL_CSS = true; // full stylesheet text
	const MAX_NODES = 6000; // safety bound per captured root
	const SETTLE = 150; // ms to let Angular render after a click

	const DANGER =
		/\b(go ?live|end|share|present|record|start|stop|post|send|submit|upload|delete|remove|kick|ban|mute|unmute|broadcast|publish|leave|log ?out|sign ?out|buy|sell|pay|checkout|cancel|confirm|reset|clear|save|apply)\b/i;
	const SAFE_MODAL =
		/\b(setting|search|filter|schedul|info|member|help|about|preference|theme|layout|notification|profile|advanced|report|detail|view)\b/i;
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	const PROPS = [
		'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'box-sizing', 'float', 'clear',
		'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
		'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
		'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'align-self',
		'gap', 'row-gap', 'column-gap', 'order', 'flex-grow', 'flex-shrink', 'flex-basis',
		'grid-template-columns', 'grid-template-rows', 'grid-auto-flow', 'grid-column', 'grid-row',
		'color', 'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'opacity',
		'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing',
		'text-align', 'text-transform', 'text-decoration-line', 'text-decoration-color', 'white-space', 'text-overflow', 'vertical-align',
		'overflow', 'overflow-x', 'overflow-y',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
		'border-top-style', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
		'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
		'box-shadow', 'outline-width', 'outline-color', 'transform', 'transform-origin',
		'transition', 'animation-name', 'cursor', 'visibility', 'pointer-events', 'backdrop-filter', 'filter', 'list-style-type'
	];
	const PSEUDO_PROPS = ['content', 'font-family', 'font-size', 'font-weight', 'color', 'background-color', 'background-image',
		'width', 'height', 'display', 'position', 'border-top-width', 'border-top-color', 'vertical-align', 'margin-left', 'margin-right'];

	const round = (n) => Math.round(n * 100) / 100;
	const snap = (el, pseudo) => {
		const cs = getComputedStyle(el, pseudo || undefined);
		const o = {};
		for (const p of (pseudo ? PSEUDO_PROPS : PROPS)) o[p] = cs.getPropertyValue(p);
		return o;
	};
	const rect = (el) => { const r = el.getBoundingClientRect(); return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) }; };
	const pathOf = (el) => {
		const parts = []; let c = el;
		while (c && c.nodeType === 1 && parts.length < 10) {
			let s = c.tagName.toLowerCase();
			if (c.id) { s += '#' + c.id; parts.unshift(s); break; }
			const cls = [...c.classList].slice(0, 4).join('.'); if (cls) s += '.' + cls;
			parts.unshift(s); c = c.parentElement;
		}
		return parts.join(' > ');
	};
	const attrsOf = (el) => {
		const o = {};
		for (const a of el.attributes) { if (a.name === 'class' || a.name === 'style') continue; o[a.name] = a.value.length > 140 ? a.value.slice(0, 140) + '…' : a.value; }
		return Object.keys(o).length ? o : undefined;
	};
	const ownText = (el) => { const t = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim(); return t ? t.slice(0, 140) : undefined; };
	const pseudoOf = (el, which) => {
		const c = getComputedStyle(el, which).getPropertyValue('content');
		if (!c || c === 'none' || c === 'normal' || c === '""' || c === "''") return undefined;
		return snap(el, which);
	};

	/* ---- flatten every readable CSS rule once (with match-probe + tokens) ---- */
	const stripPseudo = (sel) => sel
		.replace(/::?(before|after|placeholder|first-line|first-letter|selection|marker|backdrop|-webkit-[\w-]+|-moz-[\w-]+|file-selector-button)\b(\([^)]*\))?/g, '')
		.replace(/:(hover|focus|active|visited|focus-within|focus-visible|target|link|enabled|default|read-only|read-write)\b/g, '').trim();
	const flatRules = []; const inaccessible = []; const sheets = [];
	const collect = (rules, href) => {
		for (const r of rules) {
			if (r.type === CSSRule.STYLE_RULE && r.selectorText) {
				flatRules.push({ probe: stripPseudo(r.selectorText), cssText: r.cssText, href, tokens: new Set((r.selectorText.toLowerCase().match(/[.#]?[a-z0-9_-]+/g) || [])) });
			} else if (r.cssRules) collect(r.cssRules, href);
		}
	};
	for (const sh of document.styleSheets) {
		const href = sh.href || '(inline)';
		let rl; try { rl = sh.cssRules; } catch { inaccessible.push(href); continue; }
		if (!rl) continue;
		try { collect(rl, href); } catch (e) { inaccessible.push(href + ' (' + e.name + ')'); }
		if (INCLUDE_FULL_CSS) { try { sheets.push({ href, text: [...rl].map((r) => r.cssText).join('\n') }); } catch { /* skip */ } }
	}
	const matchedFor = (el) => {
		if (!MATCHED_RULES) return undefined;
		const toks = new Set([el.tagName.toLowerCase(), ...[...el.classList].map((c) => '.' + c)]);
		if (el.id) toks.add('#' + el.id);
		const out = [];
		for (const r of flatRules) {
			let hit = false; for (const t of toks) { if (r.tokens.has(t)) { hit = true; break; } }
			if (!hit) continue;
			try { if (el.matches(r.probe)) out.push(r.href === '(inline)' ? r.cssText : `/* ${(r.href || '').split('/').pop()} */ ${r.cssText}`); } catch { /* skip */ }
		}
		return out.length ? out : undefined;
	};

	/* ---- one subtree -> structured nodes ---- */
	const captureSubtree = (root, name, trigger) => {
		const all = [root, ...root.querySelectorAll('*')].slice(0, MAX_NODES);
		const nodes = [];
		for (const el of all) {
			let r; try { r = el.getBoundingClientRect(); } catch { continue; }
			if (el !== root && r.width < 0.5 && r.height < 0.5 && !el.matches('script,style,meta,link,title,head')) {
				if (el.tagName.match(/^(SCRIPT|STYLE|META|LINK|TITLE|HEAD|NOSCRIPT)$/)) continue;
			}
			if (el.tagName.match(/^(SCRIPT|STYLE|META|LINK|TITLE|NOSCRIPT)$/)) continue;
			const iconEl = el.querySelector ? el.querySelector('[class*="fa-"], svg, i') : null;
			nodes.push({
				path: pathOf(el), tag: el.tagName.toLowerCase(), id: el.id || undefined,
				class: el.getAttribute('class') || undefined, attrs: attrsOf(el), text: ownText(el),
				icon: iconEl ? (iconEl.getAttribute('class') || iconEl.tagName.toLowerCase()) : undefined,
				rect: rect(el), style: snap(el), before: pseudoOf(el, '::before'), after: pseudoOf(el, '::after'),
				matched: matchedFor(el)
			});
		}
		return { name, trigger: trigger || undefined, nodeCount: nodes.length, nodes };
	};

	const states = [];
	console.log('%c☢ NUCLEAR capture starting — base page…', 'color:#fff;background:#0a6db1;font-size:13px;padding:3px 8px');
	states.push(captureSubtree(document.body, 'base', null));

	/* ---- AUTO-REVEAL: tabs, dropdowns, allow-listed modals (safe) ---- */
	const labelOf = (el) => (el.getAttribute('aria-label') || el.title || el.textContent || '').trim();
	const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 && el.offsetParent !== null; };
	const openDialog = () => [...document.querySelectorAll('.modal.show, ngb-modal-window, [role="dialog"], [aria-modal="true"], .cdk-overlay-pane')].find(visible);
	const closeAny = async () => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, keyCode: 27 }));
		const bd = document.querySelector('.modal-backdrop, .cdk-overlay-backdrop, .backdrop'); if (bd && bd.click) try { bd.click(); } catch { /* */ }
		await sleep(SETTLE);
	};

	if (AUTO_REVEAL) {
		// 1) Tabs — capture each tab's panel, then restore the originally-active one.
		for (const bar of document.querySelectorAll('ul.nav-tabs, [role="tablist"], #mainTabs')) {
			const tabs = [...bar.querySelectorAll('[role="tab"], .nav-link, a, button')].filter(visible);
			const active = tabs.find((t) => t.classList.contains('active') || t.getAttribute('aria-selected') === 'true');
			for (const tab of tabs) {
				const label = labelOf(tab); if (!label || DANGER.test(label) || tab === active) continue;
				try {
					tab.click(); await sleep(SETTLE);
					const pid = tab.getAttribute('aria-controls');
					const panel = (pid && document.getElementById(pid)) || document.querySelector('.tab-content .active, .tab-pane.active, [role="tabpanel"]:not([hidden])');
					if (panel) { states.push(captureSubtree(panel, 'tab:' + label, label)); console.log('  ▸ tab:', label); }
				} catch { /* */ }
			}
			if (active) { try { active.click(); await sleep(SETTLE); } catch { /* */ } }
		}
		// 2) Dropdown menus — open, capture, close.
		for (const tg of [...document.querySelectorAll('.dropdown-toggle, [aria-haspopup="menu"], [aria-haspopup="true"], [data-toggle="dropdown"], [data-bs-toggle="dropdown"]')].filter(visible)) {
			const label = labelOf(tg).slice(0, 30); if (DANGER.test(label)) continue;
			try {
				tg.click(); await sleep(SETTLE);
				const menu = [...document.querySelectorAll('.dropdown-menu.show, [role="menu"], .dropdown-menu')].filter(visible)[0];
				if (menu) { states.push(captureSubtree(menu, 'dropdown:' + (label || 'menu'), label)); console.log('  ▸ dropdown:', label); }
				try { tg.click(); } catch { /* */ } await sleep(60); document.body.click(); await sleep(60);
			} catch { /* */ }
		}
		// 3) Allow-listed modals — open by label, capture, close.
		const seen = new Set();
		for (const b of [...document.querySelectorAll('button, a, [role="button"], .nav-link, .ctrl')].filter(visible)) {
			const label = labelOf(b); if (!label || DANGER.test(label) || !SAFE_MODAL.test(label) || seen.has(label.toLowerCase())) continue;
			seen.add(label.toLowerCase());
			try {
				b.click(); await sleep(SETTLE + 80);
				const dlg = openDialog();
				if (dlg) {
					const title = (dlg.querySelector('.modal-title, h1, h2, h3, .title')?.textContent || label).trim();
					states.push(captureSubtree(dlg, 'modal:' + title, label)); console.log('  ▸ modal:', title);
				}
				await closeAny();
			} catch { await closeAny(); }
		}
	}

	/* ---- resolved --css-vars (token hexes) ---- */
	const rootVars = (() => { const cs = getComputedStyle(document.documentElement); const o = {}; for (let i = 0; i < cs.length; i++) { const p = cs[i]; if (p.startsWith('--')) o[p] = cs.getPropertyValue(p).trim(); } return o; })();

	/* ---- fonts + assets + inventory ---- */
	const fonts = (() => { try { return [...document.fonts].map((f) => ({ family: f.family, weight: f.weight, style: f.style, status: f.status })); } catch { return []; } })();
	const bgImages = new Set();
	for (const el of document.querySelectorAll('*')) { const bg = getComputedStyle(el).backgroundImage; if (bg && bg !== 'none') bgImages.add(bg.slice(0, 300)); }
	const assets = {
		images: [...new Set([...document.images].map((i) => i.currentSrc || i.src).filter(Boolean))].slice(0, 500),
		backgroundImages: [...bgImages].slice(0, 500),
		stylesheetHrefs: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
		scripts: [...document.scripts].map((s) => s.src).filter(Boolean).slice(0, 300)
	};
	const inventory = {
		buttons: [...document.querySelectorAll('button, [role="button"]')].map((b) => labelOf(b)).filter(Boolean).slice(0, 400),
		links: [...document.querySelectorAll('a')].map((a) => ({ t: (a.textContent || '').trim().slice(0, 40), href: a.getAttribute('href') })).slice(0, 400),
		inputs: [...document.querySelectorAll('input, textarea, select')].map((i) => ({ tag: i.tagName.toLowerCase(), type: i.type, name: i.name, ph: i.placeholder })).slice(0, 300),
		icons: [...new Set([...document.querySelectorAll('[class*="fa-"]')].map((i) => i.getAttribute('class')))].slice(0, 600)
	};

	/* ---- assemble + download ---- */
	const out = {
		role: ROLE, capturedAt: new Date().toISOString(), url: location.href, title: document.title,
		viewport: { w: window.innerWidth, h: window.innerHeight }, dpr: window.devicePixelRatio, userAgent: navigator.userAgent,
		flags: { AUTO_REVEAL, MATCHED_RULES, INCLUDE_FULL_CSS },
		rootVars, fonts,
		states, // [base, tab:*, dropdown:*, modal:*]
		assets, inventory,
		...(INCLUDE_FULL_CSS ? { stylesheets: sheets } : {}),
		inaccessibleStylesheets: inaccessible
	};
	const json = JSON.stringify(out, null, 2);
	const a = document.createElement('a');
	a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
	a.download = `proroom-NUCLEAR-${ROLE}.json`;
	document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);

	const mb = (json.length / 1048576).toFixed(1);
	console.log(`%c☢ DONE — proroom-NUCLEAR-${ROLE}.json  |  ${out.states.length} states, ${out.states.reduce((n, s) => n + s.nodeCount, 0)} nodes, ${flatRules.length} rules, ${Object.keys(rootVars).length} vars, ${mb} MB`,
		'color:#fff;background:#92d528;font-size:14px;padding:4px 10px');
	console.log('states:', out.states.map((s) => `${s.name} (${s.nodeCount})`).join('  |  '));
})();
