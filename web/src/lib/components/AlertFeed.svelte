<script lang="ts">
	import { tick } from 'svelte';
	import type { Alert, PresentUser, ReactionTally, ReactionTarget } from '$lib/types';
	import { formatStamp, dayKey, formatDayLabel } from '$lib/message';
	import MessageBody from './MessageBody.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import PostAlertModal from './modals/PostAlertModal.svelte';
	import AlertQaModal from './AlertQaModal.svelte';
	import UserInfoModal from './modals/UserInfoModal.svelte';
	import AdvancedSearchModal from './modals/AdvancedSearchModal.svelte';
	import AlertFilterModal from './modals/AlertFilterModal.svelte';
	import ScheduledAlertsModal from './modals/ScheduledAlertsModal.svelte';
	import AlertSendReportModal from './modals/AlertSendReportModal.svelte';
	import Icon from './Icon.svelte';

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
		alerts.length; // re-run whenever an alert is added/removed
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
	let filterOpen = $state(false);
	let scheduledOpen = $state(false);
	// The alert whose delivery report is open (admin), or null.
	let reportAlert = $state<AlertItem | null>(null);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!symbol.trim()) return;
		posting = true;
		// Always scroll our own alert into view when it lands (bypasses the
		// near-bottom guard), even if we'd scrolled up to read history.
		stickNext = true;
		try {
			await onPost(symbol, side, note);
			symbol = '';
			note = '';
		} finally {
			posting = false;
		}
	}

	function initials(name: string | undefined) {
		const n = (name ?? 'Trader').trim();
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '?';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	// Full text body for an alert: "SYMBOL [side] note".
	function bodyText(a: AlertItem): string {
		const head = a.side ? `${a.symbol} ${a.side}` : a.symbol;
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
					<Icon name="cog" /><Icon name="caret-down" size={10} />
				</button>
				{#if settingsOpen}
					<div class="menu settings-dropdown" role="menu">
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								settingsOpen = false;
								filterOpen = true;
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

	<ul class="feed" bind:this={feedEl}>
		{#each alerts as a, i (a.id)}
			{@const prev = alerts[i - 1]}
			{@const newDay = !prev || dayKey(prev.created_at) !== dayKey(a.created_at)}
			{#if newDay}
				<li class="separator-row">
					<span class="separator">{formatDayLabel(a.created_at)}</span>
				</li>
			{/if}
			<li class="msg-box">
				<div class="row1">
					<div class="msg-menu">
						<button
							type="button"
							class="menu-trigger"
							aria-label="Message options"
							aria-haspopup="menu"
							aria-expanded={openMenuId === a.id}
							onclick={() => toggleMenu(a.id)}
						>
							<!-- Reference kebab is "⠇" (U+2807, the single braille column: 3 dots
							     filled on the left, 3 empty on the right) — confirmed by the
							     reference CSS `menuTriger::after { content: "⠇" }`. Alerts keep it
							     on the LEFT. -->
							<span class="ellipsis" aria-hidden="true">⠇</span>
						</button>
						{#if openMenuId === a.id}
							<div class="menu" role="menu">
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

					{#if a.image_url}
						<img class="avatar-img" src={a.image_url} alt="" width="35" height="35" />
					{:else}
						<span class="avatar" aria-hidden="true">{initials(a.author_name)}</span>
					{/if}

					<span class="username" style:color={a.author_color ?? 'var(--username-color)'}
						>{a.author_name ?? 'Trader'}</span
					>

					<!-- Reference .alert-qa button: shown on EVERY row (the "ask a question"
					     affordance) — optional (N) count + fa-question-circle (10px) +
					     trailing ✅ emoji when answered. -->
					<button
						type="button"
						class="alert-qa"
						onclick={() => openQa(a)}
						title="Ask a question"
						aria-label="Ask a question"
					>
						{#if (a.question_count ?? 0) > 0}<span class="qa-count">({a.question_count})</span
							>{/if}<Icon name="question-circle" size={10} />{#if a.answered}<span class="qa-check"
								>✅</span
							>{/if}
					</button>

					<time class="created-at">{formatStamp(a.created_at)}</time>
				</div>

				<p class="body"><MessageBody text={bodyText(a)} /></p>

				{#if a.image_url}
					<img class="alert-img" src={a.image_url} alt="" />
				{/if}

				{#if onReact}
					<ReactionBar
						reactions={reactions[`alert:${a.id}`] ?? []}
						{canReact}
						onToggle={(emoji) => onReact?.('alert', a.id, emoji)}
					/>
				{/if}
			</li>
		{:else}
			<li class="empty">No alerts yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<form onsubmit={submit}>
			<input
				id="alert-symbol"
				name="symbol"
				class="sym"
				placeholder="Symbol"
				bind:value={symbol}
				required
			/>
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
<AlertFilterModal open={filterOpen} onClose={() => (filterOpen = false)} />
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
		background: #ffffff;
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
		background: #0a6db1;
		color: #ffffff;
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
		background: #ffffff;
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
		background: #e8e8e8;
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
		background: #ffffff;
		border-top: 1px solid #e1e1e1;
		border-radius: 0;
		font-size: var(--msg-font-size);
	}
	.row1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		color: #8c8686;
	}
	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 5;
		min-width: 9rem;
		margin-top: 0.2rem;
		background: #ffffff;
		border: 1px solid #e3e5ec;
		border-radius: 8px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
		padding: 0.25rem;
		display: flex;
		flex-direction: column;
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

	.avatar,
	.avatar-img {
		/* Reference avatar img is 35x35, round. */
		width: 35px;
		height: 35px;
		flex-shrink: 0;
		/* Square avatars — reference gravatars are square (Bootstrap "Darkly",
		   --rosterImg-border-radius: 0); object-fit crops the image to the box. */
		border-radius: 0;
		object-fit: cover;
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
	}
	.avatar-img {
		border-radius: 0;
		object-fit: cover;
	}

	.username {
		font-size: 14px;
		font-weight: 900;
		color: var(--username-color);
		/* Reference .username (mx-1) has 4px horizontal margin. */
		margin: 0 4px;
	}

	.alert-qa {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		/* The Q&A badge sits on the RIGHT, immediately before the date/time —
		   auto margin pushes the badge + created-at cluster to the right edge. */
		margin-left: auto;
		/* Reference button.alert-qa is a Bootstrap btn-sm.btn-secondary: gray bg
		   rgb(108,117,125) #6c757d, white text, 400 10px/15px, padding 1px 3px,
		   1px solid #6c757d border (= bg). report.md §06 line 150 (was a custom
		   light-blue badge — the reference is BS secondary gray). */
		background: #6c757d;
		border: 1px solid #6c757d;
		color: #ffffff;
		font-size: 10px;
		font-weight: 400;
		line-height: 15px;
		/* The reference button is 18×19 (line-height 15 + 2 padding + 2 border).
		   inline-flex collapses to the 10px icon, so pin the box height to 19px
		   (border-box) — icon stays centered, box matches. */
		min-height: 19px;
		padding: 1px 3px;
		border-radius: 4px;
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
		/* The .alert-qa before it now carries the auto margin (badge + date cluster
		   right), so created-at just sits after the badge. */
		margin-left: 0;
		/* Reference .created-at mr-2 = 8px from the right edge. */
		margin-right: 8px;
		font-weight: 600;
		font-size: 12px;
		/* Reference .created-at is upright (font-style: normal), color #a8a8a8. */
		font-style: normal;
		color: #a8a8a8;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.body {
		/* Reference body (div.text-formated) sits in the content column to the RIGHT
		   of the avatar gutter, aligned under the username (capture: body x=66 ≈
		   username x=62, both past the avatar) — NOT flush-left under the avatar.
		   Left indent ≈ kebab + avatar + row gaps; right margin stays mr-2 (8px). */
		margin: 0.35rem 8px 0 71px;
		color: #676767;
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

	form {
		display: flex;
		gap: 0.4rem;
		padding: 0.55rem 0.65rem;
		border-top: 1px solid #e1e1e1;
		/* Reference composer surface is white (#fff), not gray. */
		background: #ffffff;
		flex-shrink: 0;
	}
	input,
	select {
		background: #ffffff;
		border: 1px solid #d3d7e0;
		/* Reference .form-control composer fields are flat (border-radius: 0). */
		color: #676767;
		border-radius: 0;
		padding: 0.4rem 0.5rem;
		font-size: 0.82rem;
	}
	.sym {
		width: 5rem;
	}
	.note {
		flex: 1;
		min-width: 0;
	}
	form button {
		background: #0a6db1;
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
