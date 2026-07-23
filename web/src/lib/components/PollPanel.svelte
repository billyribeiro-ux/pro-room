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
		/** HARD EVIDENCE (alerts-panel.md E2e): reference minimize HIDES the whole
		 * window; a pulsing "Poll" link in the alerts header restores it. When the
		 * parent supplies this callback it owns minimize (hides the window);
		 * without it we fall back to the local collapse. */
		onMinimize?: () => void;
		/**
		 * The current viewer's user id. Used ONLY to decide whether this viewer is
		 * the poll's creator (`poll.author_id`) — a non-creator viewing an OPEN
		 * poll they haven't voted on gets the reference `answer` "Choose-card"
		 * (poll.md §answer mode xTe). Optional: when the parent does not supply it
		 * we CANNOT prove the viewer is a non-creator, so we honestly fall back to
		 * the results view rather than guess. No fabricated identity.
		 */
		viewerId?: string;
		/**
		 * Optional dismiss hook. Reference close on a poll the viewer does NOT own
		 * just hides the panel (poll.md §Behavior "Otherwise just hidePanel()").
		 * When absent, the close button hides the panel locally.
		 */
		onClose?: () => void;
	}
	let { poll, canManage = false, onChange, viewerId, onClose,
		onMinimize
	}: Props = $props();

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	// The option this user picked, if known from a vote made in this session.
	// (The server response is anonymous-capable, so the choice can't be read
	// back from `poll`.) Not reset across `poll` identity changes on purpose:
	// the parent re-keys the panel when it wants a fresh mount.
	let votedOptionId = $state<string | null>(null);

	// Floating-window chrome state (reference titlebar min/max/close controls).
	let minimized = $state(false);
	let maximized = $state(false);
	let hidden = $state(false);

	// In-flight option id during a vote. We deliberately do NOT use a coarse
	// loading flag that hides the whole panel — that would flash a skeleton and
	// cause CLS. Bars stay rendered; only the buttons disable.
	let pendingOptionId = $state<string | null>(null);
	let closing = $state(false);
	let error = $state<string | null>(null);

	const isClosed = $derived(poll.status === 'closed');
	const busy = $derived(pendingOptionId !== null || closing);

	// HARD EVIDENCE (decoded poll.md §Role variants L179-181 + §answer mode xTe):
	// the split is sender-vs-everyone-else, keyed on identity, NOT on a role
	// string. A viewer is the poll's creator when their id === poll.author_id.
	// Only shown when `viewerId` is provably known (no guessing).
	const isCreator = $derived(viewerId !== undefined && viewerId === poll.author_id);
	// HARD EVIDENCE (decoded poll.md §answer mode + §Behavior L372-374): a
	// non-creator viewing an OPEN poll they have not yet voted on sees the
	// "Choose-card"; after one `sendAnswer` the panel flips to results. We show
	// the Choose-card only while all of: known non-creator, poll open, no local
	// vote recorded. After voting (`votedOptionId` set) it falls through to the
	// existing results view — matching "after voting, show the existing results".
	const answerMode = $derived(
		viewerId !== undefined && !isCreator && !isClosed && votedOptionId === null
	);

	function closePanel() {
		// Reference: owner-close on an active poll ENDS it (bootbox confirm →
		// pollDone); a non-owner close just hides the window. We map: managers
		// end the poll (existing close()); everyone else hides locally.
		if (canManage && !isClosed) {
			void close();
			return;
		}
		if (onClose) onClose();
		else hidden = true;
	}

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

{#if !hidden}
	<!-- HARD EVIDENCE (decoded poll.md §DOM structure L34-45 + Scoped CSS L190-198 +
	     Resolved L286-298): the reference is ONE floating window — host bg #1e1e1e,
	     titlebar #2c2c2c "Polls" + poll-panel-controls (min/max/close, 28×28), close
	     hover #c0392b. setup+answer+results share this chrome. Our PollPanel renders
	     the active/results surface inside that same window. -->
	<section class="poll-panel" class:maximized aria-label="Polls">
		<div class="poll-panel-titlebar">
			<span class="poll-panel-title">Polls</span>
			<div class="poll-panel-controls">
				<button
					type="button"
					class="poll-panel-btn"
					title="Minimize"
					aria-label="Minimize"
					onclick={() => (onMinimize ? onMinimize() : (minimized = !minimized))}
				>
					<Icon name="window-minimize" size={12} />
				</button>
				<button
					type="button"
					class="poll-panel-btn"
					title="Maximize"
					aria-label="Maximize"
					onclick={() => {
						maximized = !maximized;
						minimized = false;
					}}
				>
					<!-- HARD EVIDENCE (poll.md L28/46/335): icon toggles
					     fa-window-restore ⇄ fa-window-maximize on the maximized flag. -->
					<Icon name={maximized ? 'window-restore' : 'window-maximize'} size={12} />
				</button>
				<button
					type="button"
					class="poll-panel-btn poll-panel-btn-close"
					title="Close"
					aria-label="Close"
					onclick={closePanel}
				>
					<Icon name="times" size={12} />
				</button>
			</div>
		</div>

		{#if !minimized}
			<div class="poll-panel-body">
				{#if answerMode}
					<!-- HARD EVIDENCE (decoded poll.md §answer mode xTe/kTe L136-151):
					     <div class="row"><div class="p-2" style="text-align:center">
					       <h1>{question}</h1><hr>
					       <ol style="text-align:left">
					         <li class="p-2"> {choice}
					           <button class="btn btn-primary float-right btn-sm"
					                   style="color:white">&nbsp;Choose</button>
					           <br clear="both"></li></ol></div></div>
					     After one sendAnswer($index) → results view. -->
					<div class="row answer-row">
						<div class="answer-inner p-2">
							<h1 class="answer-question">
								{#each parseMessage(poll.question) as seg, si (si)}{#if seg.kind === 'ticker'}<span
											class="ticker">{seg.value}</span
										>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
											href={seg.href}
											target="_blank"
											rel="noopener noreferrer">{seg.value}</a
										>{:else}{seg.value}{/if}{/each}
							</h1>
							<hr />
							<ol class="answer-choices">
								{#each poll.options as option (option.id)}
									<li class="answer-choice p-2">
										<span class="answer-choice-text"
											>{#each parseMessage(option.label) as seg, si (si)}{#if seg.kind === 'ticker'}<span
														class="ticker">{seg.value}</span
													>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
														href={seg.href}
														target="_blank"
														rel="noopener noreferrer">{seg.value}</a
													>{:else}{seg.value}{/if}{/each}</span
										>
										<button
											type="button"
											class="btn btn-primary btn-sm choose-btn float-right"
											onclick={() => vote(option.id)}
											disabled={busy}
										>
											&nbsp;{pendingOptionId === option.id ? 'Choosing…' : 'Choose'}
										</button>
										<br style="clear: both" />
									</li>
								{/each}
							</ol>
							{#if error}<p class="field-err" role="alert">{error}</p>{/if}
						</div>
					</div>
				{:else}
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
						<span class="total">{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</span
						>
						{#if canManage && !isClosed}
							<button class="close-btn" type="button" onclick={close} disabled={busy}>
								{closing ? 'Closing…' : 'Close poll'}
							</button>
						{/if}
					</footer>

					{#if error}<p class="field-err" role="alert">{error}</p>{/if}
				{/if}
			</div>
		{/if}
	</section>
{/if}

<style>
	/* HARD EVIDENCE (decoded poll.md Scoped CSS L190 + Resolved L286-290): host
	   window — bg #1e1e1e, 1px solid rgb(133,133,133) border, 4px radius, box-shadow
	   0 4px 20px #00000080, 10px padding. (Width/position are governed by the parent
	   `.poll-overlay`; we keep the reference chrome/colours, not the fixed 580×553
	   drag geometry, since these render docked in the overlay.) */
	.poll-panel {
		border: 1px solid rgb(133, 133, 133);
		border-radius: 4px;
		background: #1e1e1e;
		box-shadow: 0 4px 20px #00000080;
		color: #ddd;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.poll-panel.maximized {
		width: min(720px, calc(100vw - 2rem));
	}
	/* HARD EVIDENCE (decoded poll.md Scoped CSS L191 + Resolved L291-292):
	   titlebar bg #2c2c2c, 1px solid #555 bottom border, flex space-between,
	   6px 10px padding, cursor move, user-select none. */
	.poll-panel-titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px;
		background-color: #2c2c2c;
		border-bottom: 1px solid #555;
		cursor: move;
		user-select: none;
		-webkit-user-select: none;
	}
	/* HARD EVIDENCE (poll.md Scoped CSS L192 + Resolved L293): title 700/14px/#fff. */
	.poll-panel-title {
		font-weight: 700;
		font-size: 14px;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	/* HARD EVIDENCE (poll.md Scoped CSS L193 + Resolved L294): controls flex, gap 6px. */
	.poll-panel-controls {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
	}
	/* HARD EVIDENCE (poll.md Scoped CSS L194-196 + Resolved L295-296 + States
	   L332-333): 28×28 transparent buttons, 1px solid #666 border, #ccc text, 3px
	   radius, 12px font, 0 padding; hover bg #444/#fff; close hover bg #c0392b/#fff. */
	.poll-panel-btn {
		background: transparent;
		border: 1px solid #666;
		color: #ccc;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 3px;
		cursor: pointer;
		font-size: 12px;
		padding: 0;
	}
	.poll-panel-btn:hover {
		background-color: #444;
		color: #fff;
	}
	.poll-panel-btn-close:hover {
		background-color: #c0392b;
		color: #fff;
	}
	/* HARD EVIDENCE (poll.md Scoped CSS L197 + Resolved L297): body padding 10px,
	   overflow x hidden / y auto, text #ddd. */
	.poll-panel-body {
		padding: 10px;
		overflow-x: hidden;
		overflow-y: auto;
		color: #ddd;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		max-height: calc(100vh - 200px);
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

	/* ---- Member `answer` (Choose-card) mode ---- */
	/* HARD EVIDENCE (decoded poll.md §answer mode L136-151):
	   [10] .row · [43] .p-2 {text-align:center} · [44] <ol> {text-align:left} ·
	   [18] <li> .p-2 · button [45] .btn.btn-primary.float-right.btn-sm {color:white}. */
	.answer-row {
		display: flex;
		flex-wrap: wrap;
	}
	.answer-inner {
		width: 100%;
		padding: 0.5rem; /* .p-2 = .5rem */
		text-align: center;
	}
	.answer-question {
		margin: 0 0 0.5rem;
		font-size: 1.4rem;
		font-weight: 700;
		line-height: 1.25;
		word-break: break-word;
		color: #fff;
	}
	.answer-inner hr {
		border: 0;
		border-top: 1px solid #555;
		margin: 0.5rem 0;
	}
	.answer-choices {
		list-style: decimal inside;
		margin: 0;
		padding: 0;
		text-align: left;
	}
	.answer-choice {
		padding: 0.5rem; /* .p-2 */
		font-size: 0.95rem;
	}
	.answer-choice-text {
		word-break: break-word;
	}
	/* HARD EVIDENCE (poll.md const [45] + Resolved L319): btn-primary bg #0d6efd
	   (BS5), inline color:white, btn-sm, floated right. */
	.choose-btn {
		float: right;
		display: inline-flex;
		align-items: center;
		background: #0d6efd;
		border: 1px solid #0d6efd;
		color: #fff;
		border-radius: 0.2rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}
	.choose-btn:hover:not(:disabled) {
		background: #0b5ed7;
		border-color: #0a58ca;
	}
	.choose-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
