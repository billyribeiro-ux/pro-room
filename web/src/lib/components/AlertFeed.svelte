<script lang="ts">
	import type { Alert } from '$lib/types';
	import {
		Bell,
		MagnifyingGlass,
		Gear,
		CaretDown,
		DotsSixVertical,
		SealCheck
	} from 'phosphor-svelte';

	export type AlertItem = Alert & { author_name?: string; image_url?: string };

	interface Props {
		alerts: AlertItem[];
		canPost: boolean;
		onPost: (symbol: string, side: string, note: string) => Promise<void>;
	}
	let { alerts, canPost, onPost }: Props = $props();

	let symbol = $state('');
	let side = $state('buy');
	let note = $state('');
	let posting = $state(false);

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

	function stamp(iso: string) {
		return new Date(iso).toLocaleString([], {
			year: '2-digit',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function initials(name: string | undefined) {
		const n = (name ?? 'Trader').trim();
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '?';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	const URL_RE = /(https?:\/\/[^\s]+)/g;

	// Split a body into plain-text and URL segments for safe auto-linking.
	function segments(text: string): { url: boolean; value: string }[] {
		const out: { url: boolean; value: string }[] = [];
		let last = 0;
		for (const m of text.matchAll(URL_RE)) {
			const i = m.index ?? 0;
			if (i > last) out.push({ url: false, value: text.slice(last, i) });
			out.push({ url: true, value: m[0] });
			last = i + m[0].length;
		}
		if (last < text.length) out.push({ url: false, value: text.slice(last) });
		return out;
	}
</script>

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
		{#each alerts as a (a.id)}
			<li>
				<div class="row1">
					<span class="grip" aria-hidden="true"><DotsSixVertical size={16} weight="bold" /></span>
					<span class="avatar" aria-hidden="true">{initials(a.author_name)}</span>
					<span class="author">{a.author_name ?? 'Trader'}</span>
					<span class="badge" aria-hidden="true"><SealCheck size={12} weight="fill" /></span>
					<time class="stamp">{stamp(a.created_at)}</time>
				</div>
				<p class="body">
					<span class="alert-meta">{a.symbol}</span>
					{#if a.side}<span class="alert-side side-{a.side}">{a.side}</span>{/if}
					{#if a.note}{#each segments(a.note) as seg, i (i)}{#if seg.url}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
									href={seg.value}
									target="_blank"
									rel="noopener noreferrer">{seg.value}</a
								>{:else}{seg.value}{/if}{/each}{/if}
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
	.feed li {
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid #ececf1;
		font-size: 0.85rem;
	}
	.empty {
		color: #8a909c;
		text-align: center;
	}
	.row1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.grip {
		display: inline-flex;
		color: #c4c9d4;
		cursor: grab;
		flex-shrink: 0;
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 6px;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
		flex-shrink: 0;
	}
	.author {
		font-weight: 700;
		color: #2f80c8;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #2b3140;
		color: #ffffff;
		margin-left: auto;
		flex-shrink: 0;
	}
	.stamp {
		font-weight: 700;
		font-size: 0.74rem;
		color: #444b57;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.body {
		margin: 0.4rem 0 0;
		color: #1f2430;
		line-height: 1.45;
		word-break: break-word;
		white-space: pre-wrap;
	}
	.alert-meta {
		font-weight: 700;
		font-family: ui-monospace, monospace;
		margin-right: 0.35rem;
	}
	.alert-side {
		text-transform: uppercase;
		font-size: 0.68rem;
		font-weight: 700;
		padding: 0.1rem 0.35rem;
		border-radius: 5px;
		margin-right: 0.4rem;
	}
	.side-buy {
		color: #0f9d58;
		background: rgba(15, 157, 88, 0.12);
	}
	.side-sell {
		color: #d23b3b;
		background: rgba(210, 59, 59, 0.12);
	}
	.side-watch {
		color: #c08a00;
		background: rgba(192, 138, 0, 0.14);
	}
	.body a {
		color: #2f80c8;
		text-decoration: underline;
		word-break: break-all;
	}
	.alert-img {
		display: block;
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
