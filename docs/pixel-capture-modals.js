/* =====================================================================
 * pro-room — REFERENCE MODAL / OVERLAY CAPTURE  (run in DevTools console)
 *
 * Modals on protradingroom.com only exist in the DOM while OPEN (Angular /
 * Bootstrap mounts them on click, usually portaled onto <body>). So this is
 * a PER-OPEN-STATE capture:
 *
 *   1. Open the app full-width (DevTools UNDOCKED, viewport >= 1100px).
 *   2. Open ONE modal / dropdown / overlay (Settings, Post Alert, Share
 *      screen picker, Filter, Scheduled, Advanced Search, AV settings, …).
 *   3. Paste + run this whole file. It downloads
 *        proroom-modal-<title>.json
 *      for every open overlay it finds (dialogs AND open dropdowns/popovers).
 *   4. Close it, open the next one, run again. Repeat for each modal.
 *
 * Set ROLE below to 'presenter' or 'member' so the filename records which
 * side you captured.
 *
 * What each JSON contains, per overlay:
 *   - role, url, viewport, capturedAt, modalTitle, rootSelector
 *   - rootVars         : every resolved --css-var on :root (token hexes)
 *   - nodes[]          : the FULL subtree, each with
 *        path, tag, id, class, attrs, text, icon, rect,
 *        style   (curated computed-style props),
 *        before / after  (::before / ::after content + key props),
 *        matched[]       (the ACTUAL CSS rules that apply, incl :hover/:focus
 *                         — full cssText, with source href)
 *   - stylesheets[]    : full text of every same-origin stylesheet (set
 *                        INCLUDE_FULL_CSS=false to omit — matched[] is usually
 *                        all you need)
 *   - inaccessibleStylesheets[] : cross-origin sheets we could not read
 * ===================================================================== */
(() => {
	const ROLE = 'member'; // <-- you're member-only on the reference; 'presenter' would need presenter access
	const INCLUDE_FULL_CSS = true; // full stylesheet text (big); matched[] is the targeted subset
	const MAX_NODES = 1500; // safety bound per overlay

	/* curated computed-style properties (bounded but covers layout/type/color/box) */
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
		const list = pseudo ? PSEUDO_PROPS : PROPS;
		for (const p of list) o[p] = cs.getPropertyValue(p);
		return o;
	};
	const rect = (el) => {
		const r = el.getBoundingClientRect();
		return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) };
	};
	const pathOf = (el) => {
		const parts = [];
		let c = el;
		while (c && c.nodeType === 1 && parts.length < 9) {
			let s = c.tagName.toLowerCase();
			if (c.id) { s += '#' + c.id; parts.unshift(s); break; }
			const cls = [...c.classList].slice(0, 4).join('.');
			if (cls) s += '.' + cls;
			parts.unshift(s);
			c = c.parentElement;
		}
		return parts.join(' > ');
	};
	const attrsOf = (el) => {
		const o = {};
		for (const a of el.attributes) {
			if (a.name === 'class' || a.name === 'style') continue;
			o[a.name] = a.value.length > 120 ? a.value.slice(0, 120) + '…' : a.value;
		}
		return Object.keys(o).length ? o : undefined;
	};
	const ownText = (el) => {
		const t = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
		return t ? t.slice(0, 120) : undefined;
	};
	const pseudoOf = (el, which) => {
		const cs = getComputedStyle(el, which);
		const content = cs.getPropertyValue('content');
		if (!content || content === 'none' || content === 'normal' || content === '""' || content === "''") return undefined;
		return snap(el, which);
	};

	/* ---- flatten all readable stylesheet rules ONCE (with a match-probe) ---- */
	const stripPseudo = (sel) =>
		sel
			.replace(/::?(before|after|placeholder|first-line|first-letter|selection|marker|backdrop|-webkit-[\w-]+|-moz-[\w-]+|file-selector-button)\b(\([^)]*\))?/g, '')
			.replace(/:(hover|focus|active|visited|focus-within|focus-visible|target|link|enabled|default|read-only|read-write)\b/g, '')
			.trim();

	const flatRules = []; // { selector, probe, cssText, href, tokens:Set }
	const inaccessible = [];
	const sheets = [];
	const collectRules = (ruleList, href) => {
		for (const rule of ruleList) {
			if (rule.type === CSSRule.STYLE_RULE && rule.selectorText) {
				const probe = stripPseudo(rule.selectorText);
				const tokens = new Set((rule.selectorText.toLowerCase().match(/[.#]?[a-z0-9_-]+/g) || []));
				flatRules.push({ selector: rule.selectorText, probe, cssText: rule.cssText, href, tokens });
			} else if (rule.cssRules) {
				// @media / @supports / @layer — recurse
				collectRules(rule.cssRules, href);
			}
		}
	};
	for (const sh of document.styleSheets) {
		const href = sh.href || '(inline)';
		let rules;
		try { rules = sh.cssRules; } catch { inaccessible.push(href); continue; }
		if (!rules) continue;
		try { collectRules(rules, href); } catch (e) { inaccessible.push(href + ' (' + e.name + ')'); }
		if (INCLUDE_FULL_CSS) {
			try { sheets.push({ href, text: [...rules].map((r) => r.cssText).join('\n') }); } catch { /* skip */ }
		}
	}

	const matchedFor = (el, presentTokens) => {
		const out = [];
		const elTokens = new Set([el.tagName.toLowerCase(), ...[...el.classList].map((c) => '.' + c)]);
		if (el.id) elTokens.add('#' + el.id);
		for (const r of flatRules) {
			// fast pre-filter: rule selector must reference a tag/class/id on this element
			let touches = false;
			for (const t of elTokens) { if (r.tokens.has(t)) { touches = true; break; } }
			if (!touches) continue;
			try { if (el.matches(r.probe)) out.push(r.href === '(inline)' ? r.cssText : `/* ${r.href.split('/').pop()} */ ${r.cssText}`); }
			catch { /* invalid probe (e.g. :host) — skip */ }
		}
		return out.length ? out : undefined;
	};

	/* ---- resolved :root custom properties (token hexes) ---- */
	const rootVars = (() => {
		const cs = getComputedStyle(document.documentElement);
		const o = {};
		for (let i = 0; i < cs.length; i++) {
			const p = cs[i];
			if (p.startsWith('--')) o[p] = cs.getPropertyValue(p).trim();
		}
		return o;
	})();

	/* ---- find open overlay roots (dialogs + dropdowns + popovers) ---- */
	const ROOT_SEL = [
		'.modal.show', '.modal.in', '.modal.fade.show', 'ngb-modal-window',
		'.cdk-overlay-pane', '[role="dialog"]', '[aria-modal="true"]',
		'.dropdown-menu.show', '.popover.show', '.tooltip.show', '.mat-dialog-container'
	].join(',');
	let candidates = [...document.querySelectorAll(ROOT_SEL)].filter((el) => {
		const r = el.getBoundingClientRect();
		return r.width > 1 && r.height > 1;
	});
	// keep only OUTERMOST overlays (drop any candidate contained in another candidate)
	const roots = candidates.filter((el) => !candidates.some((o) => o !== el && o.contains(el)));

	if (!roots.length) {
		console.warn('%cNo open modal / overlay found. Open a modal (or dropdown) first, then re-run.', 'color:#fff;background:#bb352a;font-size:13px;padding:4px 10px');
		// also report dropdown/backdrop hints to help
		const backdrop = document.querySelector('.modal-backdrop, .cdk-overlay-backdrop');
		console.log('backdrop present?', !!backdrop, '| candidates seen:', candidates.length);
		return;
	}

	const slug = (s) => (s || 'overlay').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'overlay';
	const titleOf = (root) => {
		const h = root.querySelector('.modal-title, [class*="modal-title"], h1, h2, h3, .title, header');
		return (h?.textContent || root.getAttribute('aria-label') || root.id || 'overlay').trim().slice(0, 60);
	};
	const download = (obj, name) => {
		const a = document.createElement('a');
		a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
		a.download = name;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => a.remove(), 0);
	};

	let totalNodes = 0;
	roots.forEach((root, idx) => {
		const title = titleOf(root);
		const all = [root, ...root.querySelectorAll('*')].slice(0, MAX_NODES);
		const nodes = [];
		for (const el of all) {
			let r;
			try { r = el.getBoundingClientRect(); } catch { continue; }
			if (r.width < 0.5 && r.height < 0.5 && el !== root) continue; // skip truly invisible
			const iconEl = el.querySelector ? el.querySelector('[class*="fa-"], svg, i') : null;
			nodes.push({
				path: pathOf(el),
				tag: el.tagName.toLowerCase(),
				id: el.id || undefined,
				class: el.getAttribute('class') || undefined,
				attrs: attrsOf(el),
				text: ownText(el),
				icon: iconEl ? (iconEl.getAttribute('class') || iconEl.tagName.toLowerCase()) : undefined,
				rect: rect(el),
				style: snap(el),
				before: pseudoOf(el, '::before'),
				after: pseudoOf(el, '::after'),
				matched: matchedFor(el)
			});
		}
		totalNodes += nodes.length;
		const out = {
			role: ROLE,
			capturedAt: new Date().toISOString(),
			url: location.href,
			viewport: { w: window.innerWidth, h: window.innerHeight },
			modalTitle: title,
			rootSelector: pathOf(root),
			overlayIndex: idx,
			rootVars,
			nodeCount: nodes.length,
			nodes,
			...(INCLUDE_FULL_CSS ? { stylesheets: sheets } : {}),
			inaccessibleStylesheets: inaccessible
		};
		const name = `proroom-modal-${slug(title)}${roots.length > 1 ? '-' + idx : ''}.json`;
		download(out, name);
		console.log(`%cDOWNLOADED ${name}  |  ${nodes.length} nodes, ${flatRules.length} rules scanned`, 'color:#fff;background:#92d528;font-size:13px;padding:3px 8px');
	});
	console.log(`%c✓ ${roots.length} overlay(s) captured, ${totalNodes} nodes total. INCLUDE_FULL_CSS=${INCLUDE_FULL_CSS}. ROLE=${ROLE}.`, 'color:#0a6db1;font-weight:700');
})();
