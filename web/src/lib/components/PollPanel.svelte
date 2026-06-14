<script lang="ts">
	import { page } from '$app/state';
	import { ApiError } from '$lib/api';
	import { votePoll, closePoll, type PollDetail } from '$lib/poll';
	import { parseMessage } from '$lib/message';
	import Icon from './Icon.svelte';

	interface Props {
		poll: PollDetail;
		canManage?: boolean;
		onChange?: (poll: PollDetail) => void;
	}
	let { poll, canManage = false, onChange }: Props = $props();

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	// The option this user picked, if known from a vote made in this session.
	// (The server response is anonymous-capable, so the choice can't be read
	// back from `poll`.) Not reset across `poll` identity changes on purpose:
	// the parent re-keys the panel when it wants a fresh mount.
	let votedOptionId = $state<string | null>(null);

	// In-flight option id during a vote. We deliberately do NOT use a coarse
	// loading flag that hides the whole panel — that would flash a skeleton and
	// cause CLS. Bars stay rendered; only the buttons disable.
	let pendingOptionId = $state<string | null>(null);
	let closing = $state(false);
	let error = $state<string | null>(null);

	const isClosed = $derived(poll.status === 'closed');
	const busy = $derived(pendingOptionId !== null || closing);

	function pct(votes: number): number {
		if (poll.total_votes <= 0) return 0;
		return Math.round((votes / poll.total_votes) * 100);
	}

	async function vote(optionId: string) {
		if (isClosed || busy) return;
		error = null;
		pendingOptionId = optionId;
		try {
			const updated = await votePoll(roomId, poll.id, optionId);
			votedOptionId = optionId;
			// Update in place from the server's tallies; the parent owns the
			// authoritative copy, so hand it back via onChange (no refetch).
			poll = updated;
			onChange?.(updated);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to record vote';
		} finally {
			pendingOptionId = null;
		}
	}

	async function close() {
		if (isClosed || busy) return;
		error = null;
		closing = true;
		try {
			const updated = await closePoll(roomId, poll.id);
			poll = updated;
			onChange?.(updated);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to close poll';
		} finally {
			closing = false;
		}
	}
</script>

<section class="poll" aria-label="Poll">
	<header class="head">
		<h3 class="question">
			{#each parseMessage(poll.question) as seg, si (si)}{#if seg.kind === 'ticker'}<span
						class="ticker">{seg.value}</span
					>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
						href={seg.href}
						target="_blank"
						rel="noopener noreferrer">{seg.value}</a
					>{:else}{seg.value}{/if}{/each}
		</h3>
		{#if isClosed}
			<span class="badge closed"><Icon name="lock" size={12} /> Closed</span>
		{/if}
	</header>

	<ul class="options">
		{#each poll.options as option (option.id)}
			{@const share = pct(option.votes)}
			{@const chosen = votedOptionId === option.id}
			<li class="option">
				<button
					class="option-btn"
					class:chosen
					type="button"
					onclick={() => vote(option.id)}
					disabled={isClosed || busy}
					aria-pressed={chosen}
				>
					<span class="bar" style:width={`${share}%`} aria-hidden="true"></span>
					<span class="row">
						<span class="opt-label">
							{#if chosen}<Icon name="check-circle" size={14} />{/if}
							{#each parseMessage(option.label) as seg, si (si)}{#if seg.kind === 'ticker'}<span
										class="ticker">{seg.value}</span
									>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
										href={seg.href}
										target="_blank"
										rel="noopener noreferrer">{seg.value}</a
									>{:else}{seg.value}{/if}{/each}
						</span>
						<span class="opt-count">
							<span class="pct">{share}%</span>
							<span class="votes">{option.votes}</span>
						</span>
					</span>
				</button>
			</li>
		{/each}
	</ul>

	<footer class="foot">
		<span class="total">{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</span>
		{#if canManage && !isClosed}
			<button class="close-btn" type="button" onclick={close} disabled={busy}>
				{closing ? 'Closing…' : 'Close poll'}
			</button>
		{/if}
	</footer>

	{#if error}<p class="field-err" role="alert">{error}</p>{/if}
</section>

<style>
	.poll {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-elev);
		padding: 0.75rem 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.question {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1.35;
		word-break: break-word;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		flex: 0 0 auto;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.15rem 0.4rem;
		border-radius: 999px;
	}
	.badge.closed {
		color: var(--text-dim);
		border: 1px solid var(--border);
	}
	.ticker {
		color: var(--accent);
		font-weight: 700;
	}
	.question a,
	.opt-label a {
		color: var(--accent);
		text-decoration: underline;
		word-break: break-all;
	}

	.options {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.option-btn {
		position: relative;
		display: block;
		width: 100%;
		text-align: left;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0;
		overflow: hidden;
	}
	.option-btn:hover:not(:disabled) {
		border-color: var(--accent);
	}
	.option-btn.chosen {
		border-color: var(--accent);
	}
	.option-btn:disabled {
		cursor: default;
	}
	/* Result bar: width is the vote share. Animated so a vote update grows the
	   bar smoothly instead of remounting (no CLS — the row height is fixed by
	   its content, the bar sits behind it). */
	.bar {
		position: absolute;
		inset: 0 auto 0 0;
		width: 0;
		background: color-mix(in srgb, var(--accent) 24%, transparent);
		transition: width 0.35s ease;
		pointer-events: none;
	}
	.chosen .bar {
		background: color-mix(in srgb, var(--positive) 26%, transparent);
	}
	@media (prefers-reduced-motion: reduce) {
		.bar {
			transition: none;
		}
	}
	.row {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding: 0.5rem 0.65rem;
	}
	.opt-label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.86rem;
		font-weight: 600;
		word-break: break-word;
		min-width: 0;
	}
	.opt-label :global(svg),
	.opt-label :global(i) {
		color: var(--positive);
		flex: 0 0 auto;
	}
	.opt-count {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
		flex: 0 0 auto;
		font-variant-numeric: tabular-nums;
	}
	.pct {
		font-size: 0.82rem;
		font-weight: 700;
	}
	.votes {
		font-size: 0.72rem;
		color: var(--text-dim);
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.total {
		font-size: 0.75rem;
		color: var(--text-dim);
		font-variant-numeric: tabular-nums;
	}
	.close-btn {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.35rem 0.7rem;
		font-size: 0.78rem;
		font-weight: 600;
	}
	.close-btn:hover:not(:disabled) {
		color: var(--negative);
		border-color: var(--negative);
	}
	.close-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.field-err {
		margin: 0;
		color: var(--negative);
		font-size: 0.78rem;
	}
</style>
