<script lang="ts">
	import type { Alert } from '$lib/types';
	import { parseMessage, formatStamp, dayKey, formatDayLabel } from '$lib/message';
	import {
		Bell,
		MagnifyingGlass,
		Gear,
		CaretDown,
		DotsThreeVertical,
		Question,
		CheckCircle,
		User,
		ArrowBendUpLeft,
		Copy
	} from 'phosphor-svelte';

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
		canPost: boolean;
		onPost: (symbol: string, side: string, note: string) => Promise<void>;
		/** Optional: open the Q&A thread for an alert (inert when omitted). */
		onOpenQa?: (alert: AlertItem) => void;
	}
	let { alerts, canPost, onPost, onOpenQa }: Props = $props();

	let symbol = $state('');
	let side = $state('buy');
	let note = $state('');
	let posting = $state(false);

	// Which row's ⠇ menu is open (alert id), or null when none.
	let openMenuId = $state<string | null>(null);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!symbol.trim()) return;
		posting = true;
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
		onOpenQa?.(a);
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (openMenuId = null)} />

<section class="panel">
	<header>
		<div class="title"><Bell size={17} weight="fill" /> Alerts</div>
		<div class="actions">
			<button type="button" aria-label="Search alerts"
				><MagnifyingGlass size={16} weight="bold" /></button
			>
			<button type="button" class="gear" aria-label="Alert settings">
				<Gear size={16} weight="fill" /><CaretDown size={10} weight="bold" />
			</button>
		</div>
	</header>

	<ul class="feed">
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
							<DotsThreeVertical size={18} weight="bold" />
						</button>
						{#if openMenuId === a.id}
							<div class="menu" role="menu">
								<button type="button" role="menuitem" onclick={() => (openMenuId = null)}>
									<User size={14} weight="fill" /> User Info
								</button>
								<button type="button" role="menuitem" onclick={() => (openMenuId = null)}>
									<ArrowBendUpLeft size={14} weight="bold" /> Mention
								</button>
								<button type="button" role="menuitem" onclick={() => copyBody(a)}>
									<Copy size={14} weight="bold" /> Copy
								</button>
							</div>
						{/if}
					</div>

					{#if a.image_url}
						<img class="avatar-img" src={a.image_url} alt="" width="36" height="36" />
					{:else}
						<span class="avatar" aria-hidden="true">{initials(a.author_name)}</span>
					{/if}

					<span class="username" style:color={a.author_color ?? 'var(--username-color)'}
						>{a.author_name ?? 'Trader'}</span
					>

					{#if (a.question_count ?? 0) > 0 || a.answered}
						<button type="button" class="alert-qa" onclick={() => openQa(a)}>
							{#if (a.question_count ?? 0) > 0}<span class="qa-count">({a.question_count})</span
								>{/if}<Question size={11} weight="fill" />{#if a.answered}<CheckCircle
									size={11}
									weight="fill"
									class="qa-check"
								/>{/if}
						</button>
					{/if}

					<time class="created-at">{formatStamp(a.created_at)}</time>
				</div>

				<p class="body">
					{#each parseMessage(bodyText(a)) as seg, si (si)}{#if seg.kind === 'ticker'}<span
								class="ticker">{seg.value}</span
							>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
								href={seg.href}
								target="_blank"
								rel="noopener noreferrer">{seg.value}</a
							>{:else}{seg.value}{/if}{/each}
				</p>

				{#if a.image_url}
					<img class="alert-img" src={a.image_url} alt="" />
				{/if}
			</li>
		{:else}
			<li class="empty">No alerts yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<form onsubmit={submit}>
			<input class="sym" placeholder="Symbol" bind:value={symbol} required />
			<select bind:value={side} aria-label="Side">
				<option value="buy">Buy</option>
				<option value="sell">Sell</option>
				<option value="watch">Watch</option>
			</select>
			<input class="note" placeholder="Note (optional)" bind:value={note} />
			<button type="submit" disabled={posting}>Post</button>
		</form>
	{/if}
</section>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		background: #ffffff;
		border-radius: 8px 8px 0 0;
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
		padding: 0.55rem 0.85rem;
		background: #1f86d6;
		color: #ffffff;
		flex-shrink: 0;
	}
	.title {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-weight: 600;
		font-size: 0.95rem;
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
		padding: 0.5rem 0.85rem 0.3rem;
	}
	.separator {
		display: inline-block;
		background: var(--ptr-msgs-separator-bg, #45a2ff);
		color: var(--ptr-msgs-separator-color, #ffffff);
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.15rem 0.7rem;
		border-radius: 999px;
		white-space: nowrap;
	}

	.msg-box {
		position: relative;
		padding: 0.6rem 0.85rem 0.25rem;
		border-bottom: 1px solid #ececf1;
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
		color: #9aa1b0;
		cursor: pointer;
		padding: 0.1rem;
		border-radius: 6px;
	}
	.menu-trigger:hover {
		background: #eef0f4;
		color: #5a6273;
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

	.avatar,
	.avatar-img {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
	}
	.avatar-img {
		border-radius: 50%;
		object-fit: cover;
	}

	.username {
		font-weight: 900;
		color: var(--username-color);
	}

	.alert-qa {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		background: #eef4fb;
		border: 1px solid #cfe0f5;
		color: #1f86d6;
		font-size: 10px;
		line-height: 1;
		padding: 1px 3px;
		border-radius: 5px;
		cursor: pointer;
	}
	.alert-qa:hover {
		background: #e0ecfa;
	}
	.qa-count {
		font-weight: 700;
	}
	.alert-qa :global(.qa-check) {
		color: var(--positive, #16c784);
	}

	.created-at {
		margin-left: auto;
		font-weight: 700;
		font-size: 0.74rem;
		color: #444b57;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.body {
		margin: 0.35rem 0 0;
		color: #1f2430;
		line-height: 1.45;
		word-break: break-word;
		white-space: pre-wrap;
		font-size: var(--msg-font-size);
	}
	.ticker {
		color: var(--ticker-color);
		font-weight: 700;
	}
	.body a {
		color: var(--ptr-link-color, #45a2ff);
		text-decoration: underline;
		word-break: break-all;
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
		border-top: 1px solid #e3e5ec;
		background: #f7f8fa;
		flex-shrink: 0;
	}
	input,
	select {
		background: #ffffff;
		border: 1px solid #d3d7e0;
		color: #1f2430;
		border-radius: 7px;
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
		background: #1f86d6;
		color: #fff;
		border: none;
		border-radius: 7px;
		padding: 0.4rem 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}
	form button:hover {
		background: #1a73ba;
	}
	form button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
