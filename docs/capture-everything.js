/*
 * capture-everything.js — TOTAL capture of the original app for 1:1 rebuilding.
 *
 * HOW TO RUN (Chrome, on the ORIGINAL app, logged in as PRESENTER/ADMIN):
 *   1. Open the room. Undock DevTools (⋮ → Dock side → separate window) so the
 *      page keeps its full width. Window ≥ 1400px wide.
 *   2. Paste this whole file into the Console. It prints the checklist below.
 *   3. Baseline is captured automatically. Then, for EVERY state you can reach,
 *      trigger it and run  CAP.snap('state-name')  — e.g.:
 *        - open the share-screen menu            → CAP.snap('share-menu-open')
 *        - actually START a screen share         → CAP.snap('sharing-live')
 *        - start the camera                      → CAP.snap('camera-live')
 *        - start the mic / talk                  → CAP.snap('mic-live-talking')
 *        - START RECORDING                       → CAP.snap('recording-live')
 *        - recording preview visible             → CAP.snap('rec-preview')
 *        - CC / subtitles overlay on             → CAP.snap('cc-overlay-on')
 *        - CC history mode                       → CAP.snap('cc-history')
 *        - music/soundcloud menu open            → CAP.snap('music-menu-open')
 *        - per-screen cog menu open              → CAP.snap('screen-cog-open')
 *        - volume dropdown open                  → CAP.snap('volume-open')
 *        - sidebar open + Archives open          → CAP.snap('archives-open')
 *        - roster search open / cog menu open    → CAP.snap('roster-tools-open')
 *        - EVERY modal, one by one               → CAP.snap('modal-<name>')
 *        - alert kebab menu open                 → CAP.snap('alert-kebab-open')
 *        - chat gear menu open                   → CAP.snap('chat-gear-open')
 *        - Screens/Notes/Files tabs ACTIVE panes → CAP.snap('pane-notes') etc.
 *        - hover a nav control, then within 3s   → CAP.hover('.nav-link', 'nav-hover')
 *   4. When done:  CAP.save()  — downloads one or more JSON files.
 *   5. Drop the files into docs/reference/captures/ in the repo.
 *
 * Everything is read-only; nothing is sent anywhere — files download locally.
 */
(() => {
	const MAX_ELEMENTS_PER_SNAP = 20000;
	const started = new Date().toISOString();

	const cap = {
		meta: {
			started,
			url: location.href,
			viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
			ua: navigator.userAgent
		},
		snapshots: [],
		css: null,
		assets: null,
		listeners: []
	};

	// ---- helpers -------------------------------------------------------------
	const attrsOf = (el) => {
		const o = {};
		for (const a of el.attributes) o[a.name] = a.value;
		return o;
	};

	const styleOf = (el, pseudo) => {
		const cs = getComputedStyle(el, pseudo || null);
		const o = {};
		for (let i = 0; i < cs.length; i++) {
			const p = cs[i];
			o[p] = cs.getPropertyValue(p);
		}
		return o;
	};

	const pseudoOf = (el, which) => {
		const cs = getComputedStyle(el, which);
		const content = cs.getPropertyValue('content');
		if (!content || content === 'none' || content === 'normal') return null;
		return {
			content,
			color: cs.color,
			'font-family': cs.fontFamily,
			'font-size': cs.fontSize,
			'font-weight': cs.fontWeight,
			display: cs.display,
			position: cs.position,
			border: cs.border,
			background: cs.background,
			transform: cs.transform,
			width: cs.width,
			height: cs.height,
			top: cs.top,
			left: cs.left,
			right: cs.right,
			bottom: cs.bottom
		};
	};

	const pathOf = (el) => {
		const parts = [];
		let n = el;
		while (n && n.nodeType === 1 && parts.length < 24) {
			let s = n.tagName.toLowerCase();
			if (n.id) s += `#${n.id}`;
			else {
				const cls = (n.className && typeof n.className === 'string' ? n.className : '')
					.trim()
					.split(/\s+/)
					.slice(0, 3)
					.filter(Boolean);
				if (cls.length) s += '.' + cls.join('.');
				const parent = n.parentElement;
				if (parent) {
					const sibs = Array.from(parent.children).filter((c) => c.tagName === n.tagName);
					if (sibs.length > 1) s += `:nth-of-type(${sibs.indexOf(n) + 1})`;
				}
			}
			parts.unshift(s);
			n = n.parentElement;
		}
		return parts.join(' > ');
	};

	// ---- full-page element snapshot -----------------------------------------
	function snap(label) {
		const t0 = performance.now();
		const all = document.querySelectorAll('*');
		const elements = [];
		let truncated = false;
		for (const el of all) {
			if (elements.length >= MAX_ELEMENTS_PER_SNAP) {
				truncated = true;
				break;
			}
			const r = el.getBoundingClientRect();
			const rec = {
				path: pathOf(el),
				tag: el.tagName.toLowerCase(),
				id: el.id || undefined,
				class: typeof el.className === 'string' ? el.className : undefined,
				attrs: attrsOf(el),
				rect: {
					x: Math.round(r.x * 100) / 100,
					y: Math.round(r.y * 100) / 100,
					w: Math.round(r.width * 100) / 100,
					h: Math.round(r.height * 100) / 100
				},
				scroll:
					el.scrollHeight !== el.clientHeight || el.scrollWidth !== el.clientWidth
						? { sw: el.scrollWidth, sh: el.scrollHeight, st: el.scrollTop, sl: el.scrollLeft }
						: undefined,
				// OWN text only (not descendants) — enough to identify labels.
				text:
					Array.from(el.childNodes)
						.filter((n) => n.nodeType === 3)
						.map((n) => n.textContent.trim())
						.filter(Boolean)
						.join(' ')
						.slice(0, 200) || undefined,
				style: styleOf(el),
				before: pseudoOf(el, '::before'),
				after: pseudoOf(el, '::after')
			};
			if (el.tagName === 'IMG') rec.src = el.currentSrc || el.src;
			if (el.tagName === 'VIDEO')
				rec.video = { w: el.videoWidth, h: el.videoHeight, muted: el.muted, paused: el.paused };
			elements.push(rec);
		}
		cap.snapshots.push({
			label,
			at: new Date().toISOString(),
			url: location.href,
			viewport: { w: innerWidth, h: innerHeight },
			count: elements.length,
			truncated,
			elements
		});
		console.log(
			`✅ CAP.snap('${label}') — ${elements.length} elements in ${Math.round(performance.now() - t0)}ms${truncated ? ' (TRUNCATED)' : ''}. Total snapshots: ${cap.snapshots.length}`
		);
	}

	// Snapshot 3s after you start hovering something (gives you time to hover).
	function hover(selector, label) {
		console.log(`Hover ${selector} now — capturing in 3s…`);
		setTimeout(() => snap(label || `hover:${selector}`), 3000);
	}

	// ---- all CSS: every rule of every stylesheet + all custom properties -----
	function css() {
		const sheets = [];
		for (const sh of document.styleSheets) {
			const entry = { href: sh.href || '(inline)', rules: [] };
			try {
				for (const rule of sh.cssRules) entry.rules.push(rule.cssText);
			} catch (e) {
				entry.error = `unreadable (${e.name}) — likely cross-origin; fetch ${sh.href} manually`;
			}
			sheets.push(entry);
		}
		// Every custom property that reaches :root, with resolved values.
		const rootCS = getComputedStyle(document.documentElement);
		const vars = {};
		for (let i = 0; i < rootCS.length; i++) {
			const p = rootCS[i];
			if (p.startsWith('--')) vars[p] = rootCS.getPropertyValue(p).trim();
		}
		// Some browsers don't enumerate --vars via length; also scrape rule text.
		for (const sh of sheets)
			for (const r of sh.rules || [])
				for (const m of r.matchAll(/--[\w-]+\s*:\s*[^;]+/g)) {
					const [name, ...rest] = m[0].split(':');
					if (!(name.trim() in vars)) vars[name.trim()] = rest.join(':').trim();
				}
		cap.css = { sheets, vars, fonts: Array.from(document.fonts).map((f) => `${f.family} ${f.weight} ${f.style} (${f.status})`) };
		console.log(
			`✅ CAP.css() — ${sheets.length} sheets, ${Object.keys(vars).length} custom properties, ${cap.css.fonts.length} fonts`
		);
	}

	// ---- assets: every image/svg/media URL + same-origin ones inlined --------
	async function assets() {
		const urls = new Set();
		document.querySelectorAll('img[src]').forEach((i) => urls.add(i.currentSrc || i.src));
		document.querySelectorAll('[style*="background"]').forEach((el) => {
			const bg = getComputedStyle(el).backgroundImage;
			for (const m of bg.matchAll(/url\("?([^")]+)"?\)/g)) urls.add(m[1]);
		});
		for (const sh of cap.css?.sheets || [])
			for (const r of sh.rules || [])
				for (const m of r.matchAll(/url\(("|')?([^)"']+)\1?\)/g)) urls.add(m[2]);
		const list = [];
		for (const u of urls) {
			const entry = { url: u };
			try {
				if (new URL(u, location.href).origin === location.origin && !u.startsWith('data:')) {
					const res = await fetch(u);
					const blob = await res.blob();
					if (blob.size < 2_000_000) {
						entry.base64 = await new Promise((ok) => {
							const fr = new FileReader();
							fr.onload = () => ok(fr.result);
							fr.readAsDataURL(blob);
						});
					} else entry.skipped = `too large (${blob.size}b)`;
				}
			} catch (e) {
				entry.error = String(e).slice(0, 120);
			}
			list.push(entry);
		}
		cap.assets = list;
		console.log(`✅ CAP.assets() — ${list.length} asset URLs (same-origin ones inlined as base64)`);
	}

	// ---- event listeners (DevTools console API, if available) ----------------
	function listeners(selector) {
		if (typeof getEventListeners !== 'function') {
			console.warn('getEventListeners is DevTools-only — run this from the Console panel.');
			return;
		}
		const out = [];
		document.querySelectorAll(selector || 'a,button,[role=button],[data-bs-toggle],input,li').forEach(
			(el) => {
				const ls = getEventListeners(el);
				const types = Object.keys(ls);
				if (types.length) out.push({ path: pathOf(el), types });
			}
		);
		cap.listeners.push({ selector: selector || '(default interactive)', at: new Date().toISOString(), out });
		console.log(`✅ CAP.listeners() — ${out.length} elements with listeners`);
	}

	// ---- save: chunked JSON downloads ---------------------------------------
	function save() {
		const stamp = started.replace(/[:.]/g, '-');
		const dl = (obj, name) => {
			const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = name;
			document.body.appendChild(a);
			a.click();
			a.remove();
			console.log(`⬇︎ ${name} (${(blob.size / 1e6).toFixed(1)} MB)`);
		};
		dl({ meta: cap.meta, css: cap.css, assets: cap.assets, listeners: cap.listeners }, `capture-${stamp}-base.json`);
		// One file per snapshot keeps each JSON well under browser limits.
		cap.snapshots.forEach((s, i) =>
			dl({ meta: cap.meta, snapshot: s }, `capture-${stamp}-snap${String(i).padStart(2, '0')}-${s.label.replace(/[^\w-]+/g, '_')}.json`)
		);
		console.log('✅ CAP.save() done — move the files into docs/reference/captures/');
	}

	window.CAP = { snap, hover, css, assets, listeners, save, data: cap };

	// Baseline: full page + css + listeners immediately.
	css();
	snap('baseline');
	listeners();
	console.log(
		'%cCAP ready.',
		'font-weight:bold',
		"Trigger each state, then CAP.snap('name'). Async assets: await CAP.assets(). Finish with CAP.save().\n" +
			'PRESENTER checklist: share-menu-open, sharing-live, camera-live, mic-live-talking, recording-live, rec-preview, ' +
			'cc-overlay-on, cc-history, music-menu-open, screen-cog-open, volume-open, archives-open, roster-tools-open, ' +
			'alert-kebab-open, chat-gear-open, pane-notes, pane-files, every modal-<name>.'
	);
})();
