<script lang="ts">
	import { tick } from 'svelte';
	import type { Alert, PresentUser, ReactionTally, ReactionTarget } from '$lib/types';
	import { formatStamp, dayKey, formatDayLabel } from '$lib/message';
	import MessageBody from './MessageBody.svelte';
	import Badges from './Badges.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import PostAlertModal from './modals/PostAlertModal.svelte';
	import AlertQaModal from './AlertQaModal.svelte';
	import UserInfoModal from './modals/UserInfoModal.svelte';
	import AdvancedSearchModal from './modals/AdvancedSearchModal.svelte';
	import AlertFilterModal from './modals/AlertFilterModal.svelte';
	import ScheduledAlertsModal from './modals/ScheduledAlertsModal.svelte';
	import AlertSendReportModal from './modals/AlertSendReportModal.svelte';
	import Icon from './Icon.svelte';
	import { prefs } from '$lib/stores/prefs.svelte';
	import { alertFilter, isAlertVisible, type FilterTrader } from '$lib/stores/alertFilter.svelte';
	import { shouldThrottle } from '$lib/stores/visibility.svelte';

	export type AlertItem = Alert & {
		author_name?: string;
		image_url?: string;
		/** Per-message username colour; wins over the theme token when set. */
		author_color?: string;
		/** Q&A: number of questions threaded on this alert (0/absent = none). */
		question_count?: number;
		/** Q&A: whether the thread has been answered/resolved. */
		answered?: boolean;
	};

	interface Props {
		alerts: AlertItem[];
		present?: PresentUser[];
		canPost: boolean;
		onPost: (symbol: string, side: string, note: string) => Promise<void>;
		/** Optional: open the Q&A thread for an alert (inert when omitted). */
		onOpenQa?: (alert: AlertItem) => void;
		/** Aggregated reactions keyed `${target_kind}:${target_id}`. */
		reactions?: Record<string, ReactionTally[]>;
		canReact?: boolean;
		onReact?: (targetKind: ReactionTarget, targetId: string, emoji: string) => void;
		/** Admin: delete any alert (shown in the row menu). */
		canManage?: boolean;
		onDelete?: (id: string) => void;
	}
	let {
		alerts,
		present = [],
		canPost,
		onPost,
		onOpenQa,
		reactions = {},
		canReact = false,
		onReact,
		canManage = false,
		onDelete
	}: Props = $props();

	let symbol = $state('');
	let side = $state('buy');
	let note = $state('');
	let posting = $state(false);

	// Trader options for the Advanced Search multi-select = the present roster.
	const traderOptions = $derived(present.map((p) => ({ value: p.user_id, label: p.display_name })));

	// Filter-checklist source: present roster ∪ distinct alert authors (so a trader
	// who posted but isn't currently present stays selectable), keyed by author_id.
	const filterTraders = $derived.by<FilterTrader[]>(() => {
		const map = new Map<string, string>();
		for (const p of present) map.set(p.user_id, p.display_name);
		for (const a of alerts) if (a.author_id) map.set(a.author_id, a.author_name ?? 'Trader');
		return [...map].map(([id, name]) => ({ id, name }));
	});
	// Apply the trader filter to the feed (reference doFilteredAlerts predicate).
	const visibleAlerts = $derived(alerts.filter((a) => isAlertVisible(a.author_id)));

	// Which row's ⠇ menu is open (alert id), or null when none.
	let openMenuId = $state<string | null>(null);

	// The scrollable feed; auto-scrolls to the newest alert (the bottom) when one
	// arrives — but only if the viewer is already near the bottom, so reading
	// older alerts isn't interrupted. Measured BEFORE the DOM updates ($effect.pre,
	// the canonical Svelte 5 chat-autoscroll pattern). `stickNext` is a one-shot
	// override set when WE post, so our own alert always scrolls into view even if
	// we'd scrolled up. It's a plain (non-reactive) let so toggling it doesn't
	// re-run the effect — only an alerts change does.
	let feedEl = $state<HTMLUListElement | undefined>();
	let stickNext = false;
	$effect.pre(() => {
		if (!feedEl) return; // not yet mounted
		visibleAlerts.length; // re-run whenever the (filtered) list changes
		// "Tab sleep optimization": skip autoscroll layout work while hidden.
		if (shouldThrottle()) return;
		const atBottom = feedEl.offsetHeight + feedEl.scrollTop > feedEl.scrollHeight - 40;
		if (atBottom || stickNext) {
			stickNext = false;
			tick().then(() => feedEl?.scrollTo(0, feedEl.scrollHeight));
		}
	});

	// The alert whose Q&A thread modal is open, or null when closed. Self-
	// contained: opening the modal requires no new props from the parent.
	let qaAlert = $state<AlertItem | null>(null);

	// User-info modal target (a row's author), or null when closed.
	let infoUser = $state<{ display_name?: string; user_id?: string; online?: boolean } | null>(null);
	// Header affordances: advanced-search modal, plus the gear settings dropdown
	// and the two alert-settings modals it opens.
	let searchOpen = $state(false);
	let settingsOpen = $state(false);
	let postAlertOpen = $state(false);
	let scheduledOpen = $state(false);
	// The alert whose delivery report is open (admin), or null.
	let reportAlert = $state<AlertItem | null>(null);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		const ticker = symbol.trim();
		if (!ticker) return;
		posting = true;
		// Always scroll our own alert into view when it lands (bypasses the
		// near-bottom guard), even if we'd scrolled up to read history.
		stickNext = true;
		try {
			// Post the ticker with a leading "$" (the field strips it for editing and
			// shows it as a fixed prefix). bodyText de-dupes, so this is safe.
			await onPost(`$${ticker}`, side, note);
			symbol = '';
			note = '';
		} finally {
			posting = false;
		}
	}

	// Ticker field: force UPPERCASE and strip non-ticker characters (including a
	// typed "$", which is shown as a fixed prefix instead). Lets a trader type
	// "aapl" and get "$AAPL" without Caps Lock. Same length on the common path
	// (letters only), so the caret never jumps.
	function onSymbolInput(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		symbol = el.value.toUpperCase().replace(/[^A-Z0-9.]/g, '');
	}

	function initials(name: string | undefined) {
		const n = (name ?? 'Trader').trim();
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '?';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	// Full text body for an alert: "$SYMBOL [side] note". The symbol is normalized
	// to an UPPERCASE "$TICKER" (de-dupes any stored "$", so older or modal-posted
	// alerts render consistently too).
	function bodyText(a: AlertItem): string {
		const sym = a.symbol ? `$${a.symbol.replace(/^\$+/, '').toUpperCase()}` : '';
		const head = a.side ? `${sym} ${a.side}` : sym;
		return a.note ? `${head} ${a.note}` : head;
	}

	function toggleMenu(id: string) {
		openMenuId = openMenuId === id ? null : id;
	}

	async function copyBody(a: AlertItem) {
		try {
			await navigator.clipboard.writeText(bodyText(a));
		} catch {
			// Clipboard can reject (permissions/insecure context); nothing to recover.
		}
		openMenuId = null;
	}

	function openQa(a: AlertItem) {
		// Notify the parent if it wants to react, then open the thread inline.
		onOpenQa?.(a);
		qaAlert = a;
	}

	function openUserInfo(a: AlertItem) {
		infoUser = {
			display_name: a.author_name,
			user_id: a.author_id,
			online: present.some((p) => p.user_id === a.author_id)
		};
		openMenuId = null;
	}

	// "Mention" drops "@name " into the note composer so the next alert can
	// address that trader. Harmless when the user can't post (no input rendered).
	function mention(a: AlertItem) {
		const name = (a.author_name ?? 'Trader').trim();
		note = note ? `${note} @${name} ` : `@${name} `;
		openMenuId = null;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			openMenuId = null;
			settingsOpen = false;
		}
	}}
/>

<section class="panel">
	<header>
		<div class="title"><Icon name="bell" size={20} /> Alerts</div>
		<div class="actions">
			{#if canPost}
				<button
					type="button"
					aria-label="Post an alert"
					title="Post Alert"
					onclick={() => (postAlertOpen = true)}><Icon name="plus-circle" size={18} /></button
				>
			{/if}
			<button type="button" aria-label="Search alerts" onclick={() => (searchOpen = true)}
				><Icon name="search" /></button
			>
			<div class="settings-menu">
				<button
					type="button"
					class="gear"
					aria-label="Alert settings"
					aria-haspopup="menu"
					aria-expanded={settingsOpen}
					onclick={() => (settingsOpen = !settingsOpen)}
				>
					<Icon name="cog" />
				</button>
				{#if settingsOpen}
					<div class="menu settings-dropdown" role="menu">
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								settingsOpen = false;
								alertFilter.open = true;
							}}
						>
							<Icon name="filter" size={14} /> Filter alerts
						</button>
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								settingsOpen = false;
								scheduledOpen = true;
							}}
						>
							<Icon name="clock" size={14} /> Scheduled alerts
						</button>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<ul
		class="feed"
		class:compact={prefs.alertMode === 'compact'}
		class:small-images={prefs.smallImagePreview}
		bind:this={feedEl}
	>
		{#each visibleAlerts as a, i (a.id)}
			{@const prev = visibleAlerts[i - 1]}
			{@const newDay = !prev || dayKey(prev.created_at) !== dayKey(a.created_at)}
			{#if newDay}
				<li class="separator-row">
					<span class="separator">{formatDayLabel(a.created_at)}</span>
				</li>
			{/if}
			<li class="msg-box">
				<div class="msg-row">
					<div class="gutter">
						<div class="msg-menu">
							<button
								type="button"
								class="menu-trigger"
								aria-label="Message options"
								aria-haspopup="menu"
								aria-expanded={openMenuId === a.id}
								onclick={() => toggleMenu(a.id)}
							>
								<!-- Reference kebab is "⠇" (U+2807, the single braille column). Reference
							     CSS `menuTriger::after { content: "⠇" }`. Alerts keep it on the LEFT,
							     beside the avatar in the gutter (dropright menu). -->
								<span class="ellipsis" aria-hidden="true">⠇</span>
							</button>
							{#if openMenuId === a.id}
								<div class="menu row-menu" role="menu">
									<button type="button" role="menuitem" onclick={() => openUserInfo(a)}>
										<Icon name="user" size={14} /> User Info
									</button>
									<button type="button" role="menuitem" onclick={() => mention(a)}>
										<Icon name="reply" size={14} /> Mention
									</button>
									<button type="button" role="menuitem" onclick={() => copyBody(a)}>
										<Icon name="copy" size={14} /> Copy
									</button>
									{#if canPost}
										<button
											type="button"
											role="menuitem"
											onclick={() => {
												reportAlert = a;
												openMenuId = null;
											}}
										>
											<Icon name="chart-bar" size={14} /> Delivery report
										</button>
									{/if}
									{#if canManage && onDelete}
										<button
											type="button"
											role="menuitem"
											class="danger"
											onclick={() => {
												onDelete?.(a.id);
												openMenuId = null;
											}}
										>
											<Icon name="trash-alt" size={14} /> Delete
										</button>
									{/if}
								</div>
							{/if}
						</div>
						<!-- Avatar is ALWAYS author identity (initials). The alert image_url is the
						     ATTACHMENT, rendered inline in the body below — never as the avatar. -->
						<span class="avatar" aria-hidden="true">{initials(a.author_name)}</span>
					</div>

					<div class="content">
						<div class="meta-line">
							<div class="name-wrap">
								<span class="username" style:color={a.author_color ?? 'var(--username-color)'}
									>{a.author_name ?? 'Trader'}</span
								>
								<Badges data={a.author_badges} />
							</div>
							<div class="meta-right">
								<!-- Reference .alert-qa: optional (N) count + fa-question-circle (10px) +
								     trailing ✅ when answered. Pinned right by the meta-line space-between. -->
								<button
									type="button"
									class="alert-qa"
									onclick={() => openQa(a)}
									title="Ask a question"
									aria-label="Ask a question"
								>
									{#if (a.question_count ?? 0) > 0}<span class="qa-count">({a.question_count})</span
										>{/if}<Icon name="question-circle" size={10} />{#if a.answered}<span
											class="qa-check">✅</span
										>{/if}
								</button>
								<time class="created-at">{formatStamp(a.created_at)}</time>
							</div>
						</div>

						<!-- Body in the content column, aligned under the username (reference
						     .msg-left.text-formated.ml-2); image nested INSIDE, not a sibling. -->
						<div class="body">
							<MessageBody text={bodyText(a)} />
							{#if a.image_url}
								<img class="alert-img" src={a.image_url} alt="" />
							{/if}
						</div>

						{#if onReact}
							<ReactionBar
								reactions={reactions[`alert:${a.id}`] ?? []}
								{canReact}
								onToggle={(emoji) => onReact?.('alert', a.id, emoji)}
							/>
						{/if}
					</div>
				</div>
			</li>
		{:else}
			<li class="empty">No alerts yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<form onsubmit={submit}>
			<div class="sym-wrap">
				<span class="sym-prefix" aria-hidden="true">$</span>
				<input
					id="alert-symbol"
					name="symbol"
					class="sym"
					placeholder="Ticker"
					value={symbol}
					oninput={onSymbolInput}
					autocapitalize="characters"
					autocomplete="off"
					autocorrect="off"
					spellcheck="false"
					required
				/>
			</div>
			<select id="alert-side" name="side" bind:value={side} aria-label="Side">
				<option value="buy">Buy</option>
				<option value="sell">Sell</option>
				<option value="watch">Watch</option>
			</select>
			<input
				id="alert-note"
				name="note"
				class="note"
				placeholder="Note (optional)"
				bind:value={note}
			/>
			<button type="submit" disabled={posting}>Post</button>
		</form>
	{/if}
</section>

<AlertQaModal alert={qaAlert} onClose={() => (qaAlert = null)} />
<UserInfoModal
	open={infoUser !== null}
	user={infoUser ?? undefined}
	onClose={() => (infoUser = null)}
/>
<AdvancedSearchModal
	open={searchOpen}
	traders={traderOptions}
	onClose={() => (searchOpen = false)}
/>
<AlertFilterModal
	open={alertFilter.open}
	onClose={() => (alertFilter.open = false)}
	traders={filterTraders}
/>
<ScheduledAlertsModal open={scheduledOpen} onClose={() => (scheduledOpen = false)} />
<PostAlertModal
	open={postAlertOpen}
	onClose={() => (postAlertOpen = false)}
	onPosted={() => (stickNext = true)}
/>
<AlertSendReportModal
	open={reportAlert !== null}
	alertId={reportAlert?.id}
	onClose={() => (reportAlert = null)}
/>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		background: var(--content-bg);
		/* Reference room-shell surfaces are flat (border-radius: 0). */
		border-radius: 0;
		overflow: hidden;
		height: 100%;
		min-height: 0;
		color: #1f2430;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		/* Reference chat-nav header padding is 4px (p-1). */
		padding: 4px;
		min-height: 48px;
		background: var(--content-header-bg);
		color: var(--content-header-color);
		flex-shrink: 0;
	}
	.title {
		display: flex;
		align-items: center;
		/* Reference .navbar-brand bell (me-1) sits 4px from the "Alerts" text. */
		gap: 4px;
		/* Reference a.navbar-brand: 20px / weight 300 / line-height 30px. */
		font-weight: 300;
		font-size: 20px;
		line-height: 30px;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}
	.actions button {
		display: inline-flex;
		align-items: center;
		gap: 0.1rem;
		background: transparent;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.actions button:hover {
		background: rgba(255, 255, 255, 0.18);
	}
	.settings-menu {
		position: relative;
		display: inline-flex;
	}
	.menu.settings-dropdown {
		left: auto;
		right: 0;
	}
	.feed {
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1;
		overflow-y: auto;
		background: var(--content-bg);
	}
	.empty {
		padding: 0.6rem 0.85rem;
		color: #8a909c;
		text-align: center;
		font-size: 0.85rem;
	}

	.separator-row {
		display: flex;
		justify-content: center;
		padding: 0;
	}
	.separator {
		/* Reference .separator is a flat, full-width gray bar (#e8e8e8) with
		   light-gray centered text, not a rounded pill. */
		display: block;
		width: 100%;
		text-align: center;
		background: var(--content-separator-bg);
		/* The date text is the reference's readable light-theme separator color
		   (#373c42); the #ccc the capture shows is the container default, not the
		   date link itself. */
		color: #373c42;
		font-size: 13px;
		font-weight: 300;
		padding: 0;
		line-height: 1.5;
		border-radius: 0;
		white-space: nowrap;
	}

	.msg-box {
		position: relative;
		/* Reference app-st-message .msg-box is tight (pb-1 only); trim the loose top
		   padding so rows aren't taller than the reference (insets come from the
		   avatar gutter + body 8px margins). */
		padding: 0.3rem 0.85rem 0.25rem;
		/* Reference rows are white with a top divider (#e1e1e1) and flat corners. */
		background: var(--content-bg);
		border-top: 1px solid var(--content-border);
		border-radius: 0;
		font-size: var(--msg-font-size);
	}
	/* Reference row: a flex-row of [gutter | content] (.mr-1.d-flex.flex-row). */
	.msg-row {
		display: flex;
		flex-direction: row;
		/* Reference gutter is align-items:start (.align-items-start) — the kebab +
		   avatar stay pinned to the TOP so a multi-line body doesn't re-center them. */
		align-items: flex-start;
	}
	/* Left gutter: kebab + avatar side by side, top-aligned, 4px down (.mt-1). */
	.gutter {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		margin-top: 4px;
		flex-shrink: 0;
	}
	/* Content column to the right of the gutter (.w-100): meta line + body stack. */
	.content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	/* Meta line: username/badges (left) ↔ qa + timestamp (right). */
	.meta-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		gap: 0.5rem;
	}
	/* Username + badges; min-width:0 so a long name truncates BEFORE it can crowd
	   the right-pinned timestamp (the narrow-width badge/timestamp collision). */
	.name-wrap {
		display: flex;
		align-items: center;
		min-width: 0;
		overflow: hidden;
	}
	/* qa + timestamp; never compresses (the name side yields first). */
	.meta-right {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.msg-menu {
		position: relative;
		flex-shrink: 0;
	}
	.menu-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		/* Reference .msgMenu: the ⠇ glyph at 20px / weight 600, flat (no radius),
		   hover #8c8686. Same kebab as the chat row (alerts keep it on the left). */
		color: var(--username-color);
		font-weight: 600;
		cursor: pointer;
		padding: 0.1rem;
		border-radius: 0;
	}
	.menu-trigger .ellipsis {
		font-size: 20px;
		line-height: 1;
	}
	.menu-trigger:hover {
		font-weight: 900;
		color: var(--kebab-color);
	}
	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 5;
		min-width: 9rem;
		margin-top: 0.2rem;
		background: var(--content-bg);
		border: 1px solid #e3e5ec;
		border-radius: 8px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
		padding: 0.25rem;
		display: flex;
		flex-direction: column;
	}
	/* Reference per-row kebab is a `dropright` (msgMenu.dropright): the ⠇ sits in the
	   far-left gutter, so its menu flies out to the RIGHT of the trigger rather than
	   dropping down over the row content. (The header gear keeps its drop-down via
	   the .menu.settings-dropdown rule.) */
	.menu.row-menu {
		top: 0;
		left: 100%;
		margin-top: 0;
		margin-left: 0.3rem;
	}
	.menu button {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		background: transparent;
		border: none;
		color: #2b3140;
		font-size: 0.82rem;
		text-align: left;
		padding: 0.4rem 0.55rem;
		border-radius: 6px;
		cursor: pointer;
	}
	.menu button:hover {
		background: #f0f4fb;
	}
	.menu button.danger {
		color: var(--negative, #bb352a);
	}

	.avatar {
		/* Reference in-message avatar is 32x32; square (Bootstrap "Darkly",
		   --rosterImg-border-radius: 0). Sits in the gutter 4px right of the kebab
		   (.avatar.pl-1). Always initials — the alert image is the body attachment. */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		margin-left: 4px;
		border-radius: 0;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.username {
		font-size: 14px;
		font-weight: 900;
		color: var(--username-color);
		/* Reference .username (mx-1) has 4px horizontal margin. */
		margin: 0 4px;
		/* Truncate (not wrap) so a long name yields to the right-pinned timestamp. */
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.alert-qa {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		/* Q&A badge sits in .meta-right (the right side of the space-between meta
		   line), immediately before the timestamp — no auto-margin needed now. */
		/* Reference button.alert-qa is a Bootstrap btn-sm.btn-secondary: gray bg
		   rgb(108,117,125) #6c757d, white text, 400 10px/15px, padding 1px 3px,
		   1px solid #6c757d border (= bg). report.md §06 line 150 (was a custom
		   light-blue badge — the reference is BS secondary gray). */
		background: var(--qa-badge-bg);
		border: 1px solid var(--qa-badge-bg);
		color: #ffffff;
		font-size: 10px;
		font-weight: 400;
		line-height: 15px;
		/* The reference button is 18×19 (line-height 15 + 2 padding + 2 border).
		   inline-flex collapses to the 10px icon, so pin the box height to 19px
		   (border-box) — icon stays centered, box matches. */
		min-height: 19px;
		padding: 1px 3px;
		/* Reference btn-sm radius is 0.2rem (3.2px). */
		border-radius: 0.2rem;
		cursor: pointer;
	}
	.alert-qa:hover {
		/* BS btn-secondary hover darken (#5c636a / border #565e64). */
		background: #5c636a;
		border-color: #565e64;
	}
	.qa-count {
		font-weight: 700;
	}
	.qa-check {
		font-size: 10px;
		margin-left: 1px;
	}

	.created-at {
		/* Sits after the qa badge inside .meta-right. */
		margin-left: 0;
		/* Reference .created-at mr-2 = 8px from the right edge. */
		margin-right: 8px;
		font-weight: 600;
		font-size: 12px;
		/* Reference .created-at is upright (font-style: normal), color #a8a8a8. */
		font-style: normal;
		color: var(--content-meta);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.body {
		/* Body lives in the content column (right of the gutter) so it aligns under
		   the username naturally — no magic left margin. Reference is
		   .msg-left.text-formated.ml-2.mr-2 → 8px each side, small top gap. */
		margin: 0.2rem 8px 0 8px;
		color: var(--content-text);
		/* Reference .text-formated body is font-weight 100 (Open Sans Thin, now
		   loaded). Very thin per the capture. */
		font-weight: 100;
		/* Reference .text-formated line-height is 1.5 (19.5px @ 13px). */
		line-height: 1.5;
		word-break: break-word;
		white-space: pre-wrap;
		font-size: var(--msg-font-size);
	}
	.alert-img {
		display: block;
		max-width: 300px;
		width: 100%;
		margin-top: 0.5rem;
		border-radius: 6px;
		object-fit: cover;
	}
	/* "Smaller image preview" (reference smallImagePreview): shrink the inline
	   posted alert image. */
	.feed.small-images .alert-img {
		max-width: 120px;
	}
	/* "Compact Mode" (reference switchAlertMode 'c'): denser alert rows. */
	.feed.compact .msg-box {
		padding-top: 0.15rem;
		padding-bottom: 0.1rem;
	}
	.feed.compact .msg-row {
		align-items: center;
	}
	.feed.compact .body {
		font-size: 0.82em;
		line-height: 1.25;
	}

	form {
		display: flex;
		gap: 0.4rem;
		padding: 0.55rem 0.65rem;
		border-top: 1px solid var(--content-border);
		/* Reference composer surface is white (#fff), not gray. */
		background: var(--content-bg);
		flex-shrink: 0;
	}
	input,
	select {
		background: var(--content-bg);
		border: 1px solid #d3d7e0;
		/* Reference .form-control composer fields are flat (border-radius: 0). */
		color: var(--content-text);
		border-radius: 0;
		padding: 0.4rem 0.5rem;
		font-size: 0.82rem;
	}
	/* Ticker field with a fixed "$" prefix adornment. */
	.sym-wrap {
		position: relative;
		width: 5rem;
		flex-shrink: 0;
	}
	.sym-prefix {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--content-text);
		font-size: 0.82rem;
		font-weight: 700;
		pointer-events: none;
	}
	.sym {
		width: 100%;
		/* Room for the "$" prefix. */
		padding-left: 1.05rem;
		/* Belt-and-suspenders uppercase (onSymbolInput also uppercases the value). */
		text-transform: uppercase;
	}
	.note {
		flex: 1;
		min-width: 0;
	}
	form button {
		background: var(--accent);
		color: #fff;
		border: none;
		/* Small button: keep a subtle radius (~4px) per the flat-surface rule. */
		border-radius: 4px;
		padding: 0.4rem 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}
	form button:hover {
		background: #095a93;
	}
	form button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
