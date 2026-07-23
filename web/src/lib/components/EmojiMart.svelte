<script lang="ts">
	/**
	 * EmojiMart — a static, dependency-free Svelte 5 replica of ngx-emoji-mart's
	 * `<emoji-mart>` picker as compiled into the reference live bundle. Decode +
	 * evidence: docs/reference/decoded/emoji-mart.md. Every class name is the
	 * reference's own `.emoji-mart-*`, and the style block below is the global
	 * `.emoji-mart` stylesheet from styles.d622cb9ed2bbc221.css transferred
	 * verbatim (the reference element selector `emoji-mart` is adapted to the root
	 * `<div class="emoji-mart">`; Svelte scopes the classes to this component).
	 *
	 * Compiled reference defaults reproduced here (bundle class `Za`):
	 *   perLine=9, emojiSize=24, showPreview=true, enableSearch=true, autoFocus=false,
	 *   title="Emoji Mart™", idle emoji="department_store" (🏬), color="#ae65c5"
	 *   (selected anchor + bar), hideObsolete=true, hideRecent=false ("Frequently Used"
	 *   shown), NAMESPACE="emoji-mart". The app binds ZERO inputs — only (emojiSelect)
	 *   — so these defaults are the effective runtime values (emoji-mart.md §7).
	 *
	 * HONEST DIVERGENCE (emoji-mart.md §7 / data.ts header): the reference default is
	 * isNative=false → it paints Apple sprite sheets from a jsDelivr CDN. We render the
	 * NATIVE Unicode glyph (`.emoji-mart-emoji-native` mode, which the reference CSS
	 * fully styles) — task-directed, and an external sprite CDN is not viable here.
	 *
	 * Skin-tone swatches: the reference renders the swatch chrome by default, but with
	 * native glyphs the tone modifier would need per-emoji application. We render the
	 * faithful swatch chrome + selection; applying the tone to native glyphs is left as
	 * a documented follow-up (see the swatch handler comment) rather than faked.
	 */
	import { tick } from 'svelte';
	import {
		EMOJI_CATEGORIES,
		I18N,
		I18N_CATEGORIES,
		ANCHOR_ICONS,
		SEARCH_ICON,
		CLEAR_ICON,
		DEFAULT_FREQUENT,
		FREQUENTLY_KEY,
		LAST_KEY,
		RECENT_CATEGORY_ID,
		type Emoji,
		type EmojiCategory
	} from '$lib/emoji/data';

	interface Props {
		/** Fires with the selected native glyph (reference: `(emojiSelect)=selectEmoji`). */
		onSelect: (native: string) => void;
		/** Grid columns. Reference default 9 (drives width = perLine*(emojiSize+12)+12+2). */
		perLine?: number;
		/** Focus the search box on mount. Reference default false. */
		autoFocusSearch?: boolean;
	}
	let { onSelect, perLine = 9, autoFocusSearch = false }: Props = $props();

	// Reference emojiSize=24 → cell width 24+12=36; content width = perLine*36 + 12 + 2.
	const EMOJI_SIZE = 24;
	const width = $derived(perLine * (EMOJI_SIZE + 12) + 12 + 2);

	// --- Frequently Used: persisted in localStorage["emoji-mart.frequently"] as a
	// {shortcode:count} map (reference service OR). On first run (no storage) the
	// reference get(perLine, totalFrequentLines=4) returns DEFAULTS.slice(0, perLine).
	function loadFrequent(): Emoji[] {
		let counts: Record<string, number> | null = null;
		try {
			const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(FREQUENTLY_KEY) : null;
			counts = raw ? (JSON.parse(raw) as Record<string, number>) : null;
		} catch {
			counts = null;
		}
		if (!counts || Object.keys(counts).length === 0) {
			return DEFAULT_FREQUENT.slice(0, perLine);
		}
		const byShort = new Map<string, Emoji>();
		for (const c of EMOJI_CATEGORIES) for (const e of c.emojis) byShort.set(e.shortcode, e);
		const ordered = Object.keys(counts)
			.sort((a, b) => counts![b] - counts![a])
			.map((sc) => byShort.get(sc))
			.filter((e): e is Emoji => !!e)
			.slice(0, perLine * 4); // totalFrequentLines = 4
		return ordered.length ? ordered : DEFAULT_FREQUENT.slice(0, perLine);
	}

	function bumpFrequent(e: Emoji) {
		try {
			if (typeof localStorage === 'undefined') return;
			const raw = localStorage.getItem(FREQUENTLY_KEY);
			const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
			counts[e.shortcode] = (counts[e.shortcode] ?? 0) + 1;
			localStorage.setItem(FREQUENTLY_KEY, JSON.stringify(counts));
			localStorage.setItem(LAST_KEY, e.shortcode);
		} catch {
			/* storage unavailable — non-fatal, matches lib's guarded writes */
		}
		frequent = loadFrequent();
	}

	let frequent = $state<Emoji[]>(loadFrequent());

	// Category list in reference order: RECENT_CATEGORY unshifted before the 8 real ones.
	const categories = $derived<EmojiCategory[]>([
		{ id: RECENT_CATEGORY_ID, name: I18N_CATEGORIES[RECENT_CATEGORY_ID], emojis: frequent },
		...EMOJI_CATEGORIES
	]);

	// --- Search: reference filters name/shortcode/keywords; we match name + shortcode
	// (the fields carried in data.ts), tokenised like the lib (/[\s,\-_]+/), capped 75.
	let query = $state('');
	const isSearching = $derived(query.trim().length > 0);

	const searchResults = $derived.by<Emoji[]>(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		const tokens = q.split(/[\s,\-_]+/).filter(Boolean).slice(0, 2);
		const seen = new Set<string>();
		const out: Emoji[] = [];
		for (const cat of EMOJI_CATEGORIES) {
			for (const e of cat.emojis) {
				if (seen.has(e.native)) continue;
				const hay = (e.name + ' ' + e.shortcode).toLowerCase();
				if (tokens.every((t) => hay.includes(t))) {
					seen.add(e.native);
					out.push(e);
					if (out.length >= 75) return out;
				}
			}
		}
		return out;
	});

	// --- Selected anchor tracking (reference: selected follows scroll / anchor click).
	let selectedId = $state<string>(RECENT_CATEGORY_ID);
	let scrollEl = $state<HTMLElement | null>(null);
	let searchInput = $state<HTMLInputElement | null>(null);
	// section elements keyed by category id, for scroll-into-view + position tracking.
	const sectionEls: Record<string, HTMLElement> = {};

	function registerSection(node: HTMLElement, id: string) {
		sectionEls[id] = node;
		return {
			destroy() {
				delete sectionEls[id];
			}
		};
	}

	async function handleAnchorClick(id: string) {
		const wasSearching = isSearching;
		if (wasSearching) {
			// reference clears the search then re-runs the anchor scroll (category list
			// must be back in the DOM before we can read section offsets).
			query = '';
			await tick();
		}
		selectedId = id;
		const target = sectionEls[id];
		const scroller = scrollEl;
		if (target && scroller) {
			// reference: scrollTop = category.top (0 for the first category)
			scroller.scrollTop = id === categories[0].id ? 0 : target.offsetTop;
		}
	}

	function handleScroll() {
		if (isSearching) return;
		const scroller = scrollEl;
		if (!scroller) return;
		const top = scroller.scrollTop;
		// bottom → last category (reference handleScroll)
		if (Math.ceil(scroller.scrollHeight - top) <= scroller.clientHeight + 1) {
			selectedId = categories[categories.length - 1].id;
			return;
		}
		if (top === 0) {
			selectedId = categories[0].id;
			return;
		}
		let current = categories[0].id;
		for (const cat of categories) {
			const el = sectionEls[cat.id];
			if (el && el.offsetTop <= top + 1) current = cat.id;
			else break;
		}
		selectedId = current;
	}

	// --- Preview footer (reference showPreview=true). Idle = title "Emoji Mart™" + 🏬.
	const IDLE_TITLE = 'Emoji Mart™';
	const IDLE_EMOJI = '🏬'; // department_store 🏬 (reference idle emoji default)
	let previewEmoji = $state<Emoji | null>(null);

	function pick(e: Emoji) {
		bumpFrequent(e);
		onSelect(e.native);
	}

	// --- Skin swatches (reference chrome; native tone application is a follow-up).
	const SKIN_TONES = [1, 2, 3, 4, 5, 6];
	let skin = $state(1);
	let skinsOpen = $state(false);
	function handleSkinClick(tone: number) {
		if (skinsOpen) {
			skinsOpen = false;
			// FOLLOW-UP: with native glyphs, applying the tone means appending the
			// Unicode skin-tone modifier to skin-capable emojis. Chrome + selection are
			// faithful; per-emoji native tone application is intentionally not faked.
			skin = tone;
		} else {
			skinsOpen = true;
		}
	}

	$effect(() => {
		if (autoFocusSearch && searchInput) searchInput.focus();
	});

	const inputId = 'emoji-mart-search-' + Math.random().toString(36).slice(2, 8);
</script>

<div class="emoji-mart" style="width: {width}px">
	<!-- Top bar: category anchors -->
	<div class="emoji-mart-bar">
		<div class="emoji-mart-anchors" role="tablist" aria-label="Emoji categories">
			{#each categories as cat (cat.id)}
				<span
					class="emoji-mart-anchor"
					class:emoji-mart-anchor-selected={cat.id === selectedId}
					style:color={cat.id === selectedId ? '#ae65c5' : null}
					role="tab"
					tabindex="0"
					aria-selected={cat.id === selectedId}
					title={I18N_CATEGORIES[cat.id]}
					aria-label={I18N_CATEGORIES[cat.id]}
					onclick={() => handleAnchorClick(cat.id)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleAnchorClick(cat.id);
						}
					}}
				>
					<div>
						<svg viewBox="0 0 24 24" width="24" height="24">
							<path d={ANCHOR_ICONS[cat.id]} />
						</svg>
					</div>
					<span class="emoji-mart-anchor-bar" style:background-color="#ae65c5"></span>
				</span>
			{/each}
		</div>
	</div>

	<!-- Search -->
	<div class="emoji-mart-search">
		<input
			bind:this={searchInput}
			bind:value={query}
			type="search"
			id={inputId}
			placeholder={I18N.search}
			autocomplete="off"
		/>
		<label class="emoji-mart-sr-only" for={inputId}>{I18N.search}</label>
		<button
			type="button"
			class="emoji-mart-search-icon"
			disabled={!isSearching}
			aria-label={I18N.clear}
			onclick={() => (query = '')}
		>
			<svg viewBox="0 0 20 20" width="13" height="13" opacity="0.5">
				<path d={isSearching ? CLEAR_ICON : SEARCH_ICON} />
			</svg>
		</button>
	</div>

	<!-- Scroll region -->
	<section
		class="emoji-mart-scroll"
		bind:this={scrollEl}
		onscroll={handleScroll}
		aria-label={I18N.emojilist}
	>
		{#if isSearching}
			<!-- Search results (reference: only the Search category renders) -->
			<section
				class="emoji-mart-category"
				class:emoji-mart-no-results={searchResults.length === 0}
				aria-label={I18N_CATEGORIES.people}
			>
				<div class="emoji-mart-category-label">
					<span aria-hidden="true"> Search Results </span>
				</div>
				{#if searchResults.length === 0}
					<div>
						<span class="emoji-mart-emoji emoji-mart-emoji-native"><span>{'🕵'}</span></span>
					</div>
					<div class="emoji-mart-no-results-label">{I18N.notfound}</div>
				{:else}
					{#each searchResults as e (e.native)}
						<span
							class="emoji-mart-emoji emoji-mart-emoji-native"
							role="button"
							tabindex="0"
							title={e.name}
							aria-label={e.name}
							onmouseenter={() => (previewEmoji = e)}
							onmouseleave={() => (previewEmoji = null)}
							onfocus={() => (previewEmoji = e)}
							onblur={() => (previewEmoji = null)}
							onclick={() => pick(e)}
							onkeydown={(ev) => {
								if (ev.key === 'Enter' || ev.key === ' ') {
									ev.preventDefault();
									pick(e);
								}
							}}
						>
							<span>{e.native}</span>
						</span>
					{/each}
				{/if}
			</section>
		{:else}
			{#each categories as cat (cat.id)}
				<section
					class="emoji-mart-category"
					use:registerSection={cat.id}
					aria-label={I18N_CATEGORIES[cat.id]}
				>
					<div class="emoji-mart-category-label" data-name={cat.name}>
						<span aria-hidden="true"> {I18N_CATEGORIES[cat.id]} </span>
					</div>
					{#each cat.emojis as e (cat.id + '|' + e.native)}
						<span
							class="emoji-mart-emoji emoji-mart-emoji-native"
							role="button"
							tabindex="0"
							title={e.name}
							aria-label={e.name}
							onmouseenter={() => (previewEmoji = e)}
							onmouseleave={() => (previewEmoji = null)}
							onfocus={() => (previewEmoji = e)}
							onblur={() => (previewEmoji = null)}
							onclick={() => pick(e)}
							onkeydown={(ev) => {
								if (ev.key === 'Enter' || ev.key === ' ') {
									ev.preventDefault();
									pick(e);
								}
							}}
						>
							<span>{e.native}</span>
						</span>
					{/each}
				</section>
			{/each}
		{/if}
	</section>

	<!-- Preview footer -->
	<div class="emoji-mart-bar">
		<div class="emoji-mart-preview">
			{#if previewEmoji}
				<div class="emoji-mart-preview-emoji">
					<span class="emoji-mart-emoji emoji-mart-emoji-native" style="font-size:38px">
						<span>{previewEmoji.native}</span>
					</span>
				</div>
				<div class="emoji-mart-preview-data">
					<div class="emoji-mart-preview-name">{previewEmoji.name}</div>
					<div class="emoji-mart-preview-shortname">:{previewEmoji.shortcode}:</div>
				</div>
			{:else}
				<div class="emoji-mart-preview-emoji">
					<span class="emoji-mart-emoji emoji-mart-emoji-native" style="font-size:38px">
						<span>{IDLE_EMOJI}</span>
					</span>
				</div>
				<div class="emoji-mart-preview-data">
					<span class="emoji-mart-title-label">{IDLE_TITLE}</span>
				</div>
			{/if}
			<div class="emoji-mart-preview-skins">
				<section class="emoji-mart-skin-swatches" class:opened={skinsOpen}>
					{#each SKIN_TONES as tone (tone)}
						<span class="emoji-mart-skin-swatch" class:selected={tone === skin}>
							<span
								class="emoji-mart-skin emoji-mart-skin-tone-{tone}"
								role="button"
								tabindex={skinsOpen || tone === skin ? 0 : -1}
								aria-label="Skin tone {tone}"
								onclick={() => handleSkinClick(tone)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleSkinClick(tone);
									}
								}}
							></span>
						</span>
					{/each}
				</section>
			</div>
		</div>
	</div>
</div>

<style>
	/* Global `.emoji-mart` stylesheet, verbatim from
	   docs/reference/live-bundle/styles.d622cb9ed2bbc221.css (every rule whose
	   selector mentions emoji-mart, extracted with grep). All 80 rules; the
	   `.emoji-mart-dark` rules are retained for fidelity though the room boots
	   lightTheme (darkMode=false, so they never apply). Selectors are unchanged
	   so every class maps 1:1 to the reference. Some rules (-list, .custom
	   skins) target elements this replica doesn't emit; they are kept verbatim
	   and simply don't match — a faithful copy, not a trimmed one. */
	.emoji-mart,
	.emoji-mart * {
		box-sizing: border-box;
		line-height: 1.15;
	}
	.emoji-mart {
		font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif;
		font-size: 16px;
		display: inline-block;
		color: #222427;
		border: 1px solid #d9d9d9;
		border-radius: 5px;
		background: #fff;
	}
	.emoji-mart .emoji-mart-emoji {
		padding: 6px;
	}
	.emoji-mart-bar {
		border: 0 solid #d9d9d9;
	}
	.emoji-mart-bar:first-child {
		border-bottom-width: 1px;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
	}
	.emoji-mart-bar:last-child {
		border-top-width: 1px;
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
	}
	.emoji-mart-anchors {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 0 6px;
		line-height: 0;
	}
	.emoji-mart-anchor {
		position: relative;
		display: block;
		flex: 1 1 auto;
		color: #858585;
		text-align: center;
		padding: 12px 4px;
		overflow: hidden;
		transition: color 0.1s ease-out;
		margin: 0;
		box-shadow: none;
		background: none;
		border: none;
		cursor: pointer;
	}
	.emoji-mart-anchor:focus {
		outline: 0;
	}
	.emoji-mart-anchor:hover,
	.emoji-mart-anchor:focus,
	.emoji-mart-anchor-selected {
		color: #464646;
	}
	.emoji-mart-anchor-selected .emoji-mart-anchor-bar {
		bottom: 0;
	}
	.emoji-mart-anchor-bar {
		position: absolute;
		bottom: -3px;
		left: 0;
		width: 100%;
		height: 3px;
		background-color: #464646;
	}
	.emoji-mart-anchors i {
		display: inline-block;
		width: 100%;
		max-width: 22px;
	}
	.emoji-mart-anchors svg,
	.emoji-mart-anchors img {
		fill: currentColor;
		height: 18px;
	}
	.emoji-mart-scroll {
		overflow-y: scroll;
		height: 270px;
		padding: 0 6px 6px;
		will-change: transform;
	}
	.emoji-mart-search {
		margin-top: 6px;
		padding: 0 6px;
		position: relative;
	}
	.emoji-mart-search input {
		font-size: 16px;
		display: block;
		width: 100%;
		padding: 5px 25px 6px 10px;
		border-radius: 5px;
		border: 1px solid #d9d9d9;
		outline: 0;
	}
	.emoji-mart-search input,
	.emoji-mart-search input::-webkit-search-decoration,
	.emoji-mart-search input::-webkit-search-cancel-button,
	.emoji-mart-search input::-webkit-search-results-button,
	.emoji-mart-search input::-webkit-search-results-decoration {
		-webkit-appearance: none;
	}
	.emoji-mart-search-icon {
		position: absolute;
		top: 3px;
		right: 11px;
		z-index: 2;
		padding: 2px 5px 1px;
		border: none;
		background: none;
		cursor: pointer;
	}
	.emoji-mart-category .emoji-mart-emoji span {
		z-index: 1;
		position: relative;
		text-align: center;
		cursor: default;
	}
	.emoji-mart-category .emoji-mart-emoji:hover:before {
		z-index: 0;
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #f4f4f4;
		border-radius: 100%;
	}
	.emoji-mart-category-label {
		z-index: 2;
		position: relative;
		position: sticky;
		top: 0;
	}
	.emoji-mart-category-label span {
		display: block;
		width: 100%;
		font-weight: 500;
		padding: 5px 6px;
		background-color: #fff;
		background-color: #fffffff2;
	}
	.emoji-mart-category-list {
		margin: 0;
		padding: 0;
	}
	.emoji-mart-category-list li {
		list-style: none;
		margin: 0;
		padding: 0;
		display: inline-block;
	}
	.emoji-mart-emoji {
		position: relative;
		display: inline-block;
		font-size: 0;
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		box-shadow: none;
		cursor: pointer;
	}
	.emoji-mart-emoji-native {
		font-family:
			'Segoe UI Emoji', Segoe UI Symbol, Segoe UI, 'Apple Color Emoji', Twemoji Mozilla,
			'Noto Color Emoji', 'Android Emoji';
	}
	.emoji-mart-no-results {
		font-size: 14px;
		text-align: center;
		padding-top: 70px;
		color: #858585;
	}
	.emoji-mart-no-results .emoji-mart-category-label {
		display: none;
	}
	.emoji-mart-no-results .emoji-mart-no-results-label {
		margin-top: 0.2em;
	}
	.emoji-mart-no-results .emoji-mart-emoji:hover:before {
		content: none;
	}
	.emoji-mart-preview {
		position: relative;
		height: 70px;
	}
	.emoji-mart-preview-emoji,
	.emoji-mart-preview-data,
	.emoji-mart-preview-skins {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
	}
	.emoji-mart-preview-emoji {
		left: 12px;
	}
	.emoji-mart-preview-data {
		left: 68px;
		right: 12px;
		word-break: break-all;
	}
	.emoji-mart-preview-skins {
		right: 30px;
		text-align: right;
	}
	.emoji-mart-preview-skins.custom {
		right: 10px;
		text-align: right;
	}
	.emoji-mart-preview-name {
		font-size: 14px;
	}
	.emoji-mart-preview-shortname {
		font-size: 12px;
		color: #888;
	}
	.emoji-mart-preview-shortname + .emoji-mart-preview-shortname,
	.emoji-mart-preview-shortname + .emoji-mart-preview-emoticon,
	.emoji-mart-preview-emoticon + .emoji-mart-preview-emoticon {
		margin-left: 0.5em;
	}
	.emoji-mart-preview-emoticon {
		font-size: 11px;
		color: #bbb;
	}
	.emoji-mart-title span {
		display: inline-block;
		vertical-align: middle;
	}
	.emoji-mart-title .emoji-mart-emoji {
		padding: 0;
	}
	.emoji-mart-title-label {
		color: #999a9c;
		font-size: 26px;
		font-weight: 300;
	}
	.emoji-mart-skin-swatches {
		font-size: 0;
		padding: 2px 0;
		border: 1px solid #d9d9d9;
		border-radius: 12px;
		background-color: #fff;
	}
	.emoji-mart-skin-swatches.custom {
		font-size: 0;
		border: none;
		background-color: #fff;
	}
	.emoji-mart-skin-swatches.opened .emoji-mart-skin-swatch {
		width: 16px;
		padding: 0 2px;
	}
	.emoji-mart-skin-swatches.opened .emoji-mart-skin-swatch.selected:after {
		opacity: 0.75;
	}
	.emoji-mart-skin-swatch {
		display: inline-block;
		width: 0;
		vertical-align: middle;
		transition-property: width, padding;
		transition-duration: 0.125s;
		transition-timing-function: ease-out;
	}
	.emoji-mart-skin-swatch:nth-child(1) {
		transition-delay: 0s;
	}
	.emoji-mart-skin-swatch:nth-child(2) {
		transition-delay: 0.03s;
	}
	.emoji-mart-skin-swatch:nth-child(3) {
		transition-delay: 0.06s;
	}
	.emoji-mart-skin-swatch:nth-child(4) {
		transition-delay: 0.09s;
	}
	.emoji-mart-skin-swatch:nth-child(5) {
		transition-delay: 0.12s;
	}
	.emoji-mart-skin-swatch:nth-child(6) {
		transition-delay: 0.15s;
	}
	.emoji-mart-skin-swatch.selected {
		position: relative;
		width: 16px;
		padding: 0 2px;
	}
	.emoji-mart-skin-swatch.selected:after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 4px;
		height: 4px;
		margin: -2px 0 0 -2px;
		background-color: #fff;
		border-radius: 100%;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease-out;
	}
	.emoji-mart-skin-swatch.custom {
		display: inline-block;
		width: 0;
		height: 38px;
		overflow: hidden;
		vertical-align: middle;
		transition-property: width, height;
		transition-duration: 0.125s;
		transition-timing-function: ease-out;
		cursor: default;
	}
	.emoji-mart-skin-swatch.custom.selected {
		position: relative;
		width: 36px;
		height: 38px;
		padding: 0 2px 0 0;
	}
	.emoji-mart-skin-swatch.custom.selected:after {
		content: '';
		width: 0;
		height: 0;
	}
	.emoji-mart-skin-swatches.custom .emoji-mart-skin-swatch.custom:hover {
		background-color: #f4f4f4;
		border-radius: 10%;
	}
	.emoji-mart-skin-swatches.custom.opened .emoji-mart-skin-swatch.custom {
		width: 36px;
		height: 38px;
		padding: 0 2px 0 0;
	}
	.emoji-mart-skin-swatches.custom.opened .emoji-mart-skin-swatch.custom.selected:after {
		opacity: 0.75;
	}
	.emoji-mart-skin-text.opened {
		display: inline-block;
		vertical-align: middle;
		text-align: left;
		color: #888;
		font-size: 11px;
		padding: 5px 2px;
		width: 95px;
		height: 40px;
		border-radius: 10%;
		background-color: #fff;
	}
	.emoji-mart-skin {
		display: inline-block;
		width: 100%;
		padding-top: 100%;
		max-width: 12px;
		border-radius: 100%;
		cursor: pointer;
	}
	.emoji-mart-skin-tone-1 {
		background-color: #ffc93a;
	}
	.emoji-mart-skin-tone-2 {
		background-color: #fadcbc;
	}
	.emoji-mart-skin-tone-3 {
		background-color: #e0bb95;
	}
	.emoji-mart-skin-tone-4 {
		background-color: #bf8f68;
	}
	.emoji-mart-skin-tone-5 {
		background-color: #9b643d;
	}
	.emoji-mart-skin-tone-6 {
		background-color: #594539;
	}
	.emoji-mart-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
	.emoji-mart-dark {
		color: #fff;
		border-color: #555453;
		background-color: #222;
	}
	.emoji-mart-dark .emoji-mart-bar {
		border-color: #555453;
	}
	.emoji-mart-dark .emoji-mart-search input {
		color: #fff;
		border-color: #555453;
		background-color: #2f2f2f;
	}
	.emoji-mart-dark .emoji-mart-search-icon svg {
		fill: #fff;
	}
	.emoji-mart-dark .emoji-mart-category .emoji-mart-emoji:hover:before {
		background-color: #444;
	}
	.emoji-mart-dark .emoji-mart-category-label span {
		background-color: #222;
		color: #fff;
	}
	.emoji-mart-dark .emoji-mart-skin-swatches {
		border-color: #555453;
		background-color: #222;
	}
	.emoji-mart-dark .emoji-mart-anchor:hover,
	.emoji-mart-dark .emoji-mart-anchor:focus,
	.emoji-mart-dark .emoji-mart-anchor-selected {
		color: #bfbfbf;
	}

	/* Native-glyph sizing: the reference paints sprites sized by emojiSize; with native
	   glyphs the cell font-size must be restored (the base .emoji-mart-emoji sets
	   font-size:0 to hide sprite whitespace). 24px matches the reference emojiSize. */
	.emoji-mart-emoji-native > span {
		font-size: 24px;
		line-height: 1;
	}
	.emoji-mart-preview-emoji .emoji-mart-emoji-native > span {
		font-size: 38px;
	}
</style>
