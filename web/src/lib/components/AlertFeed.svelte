<script lang="ts">
	import type { Alert } from '$lib/types';
	import { Lightning, ArrowUpRight, ArrowDownRight, Eye } from 'phosphor-svelte';

	export type AlertItem = Alert & { author_name?: string };

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

	function time(iso: string) {
		return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<section class="panel">
	<header><Lightning size={16} weight="fill" /> Trade Alerts</header>

	<ul class="feed">
		{#each alerts as a (a.id)}
			<li>
				<span class="side side-{a.side}">
					{#if a.side === 'buy'}<ArrowUpRight size={14} weight="bold" />
					{:else if a.side === 'sell'}<ArrowDownRight size={14} weight="bold" />
					{:else}<Eye size={14} />{/if}
					{a.side}
				</span>
				<span class="symbol">{a.symbol}</span>
				{#if a.note}<span class="note">{a.note}</span>{/if}
				<span class="time">{time(a.created_at)}</span>
			</li>
		{:else}
			<li class="empty">No alerts yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<form onsubmit={submit}>
			<input class="sym" placeholder="Symbol" bind:value={symbol} required />
			<select bind:value={side}>
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
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		height: 100%;
		min-height: 0;
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid var(--border);
		font-weight: 600;
		font-size: 0.9rem;
	}
	header :global(svg) {
		color: var(--warn);
	}
	.feed {
		list-style: none;
		margin: 0;
		padding: 0.5rem;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.feed li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.4rem 0.6rem;
		font-size: 0.85rem;
	}
	.empty {
		justify-content: center;
		color: var(--text-dim);
		background: transparent !important;
		border: none !important;
	}
	.side {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		text-transform: uppercase;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.15rem 0.4rem;
		border-radius: 6px;
	}
	.side-buy {
		color: var(--positive);
		background: color-mix(in srgb, var(--positive) 15%, transparent);
	}
	.side-sell {
		color: var(--negative);
		background: color-mix(in srgb, var(--negative) 15%, transparent);
	}
	.side-watch {
		color: var(--warn);
		background: color-mix(in srgb, var(--warn) 15%, transparent);
	}
	.symbol {
		font-weight: 700;
		font-family: ui-monospace, monospace;
	}
	.note {
		color: var(--text-dim);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.time {
		margin-left: auto;
		color: var(--text-dim);
		font-size: 0.75rem;
	}
	form {
		display: flex;
		gap: 0.4rem;
		padding: 0.6rem;
		border-top: 1px solid var(--border);
	}
	input,
	select {
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 7px;
		padding: 0.4rem 0.5rem;
		font-size: 0.85rem;
	}
	.sym {
		width: 5rem;
	}
	.note {
		flex: 1;
	}
	button {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 7px;
		padding: 0.4rem 0.8rem;
		font-weight: 600;
	}
	button:hover {
		background: var(--accent-hover);
	}
</style>
