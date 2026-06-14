<script lang="ts">
	import { page } from '$app/state';
	import { api, ApiError } from '$lib/api';
	import type { AlertItem } from './AlertFeed.svelte';
	import { listQuestions, postQuestion, resolveQuestion, type Question } from '$lib/qa';
	import { QuestionBodySchema, AnswerSchema, firstIssue } from '$lib/schemas';
	import { formatStamp, parseMessage } from '$lib/message';
	import * as v from 'valibot';
	import { XIcon, PaperPlaneTiltIcon, CheckCircleIcon } from 'phosphor-svelte';

	interface Props {
		alert: AlertItem | null;
		onClose: () => void;
	}
	let { alert, onClose }: Props = $props();

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	let questions = $state<Question[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	// Composer (ask a question).
	let draft = $state('');
	let composeError = $state<string | null>(null);
	let sending = $state(false);

	// Answer/resolve composer state, keyed by question id (only one open at a time).
	let answeringId = $state<string | null>(null);
	let answerDraft = $state('');
	let answerError = $state<string | null>(null);
	let resolving = $state(false);

	// Whether the current user may answer/resolve (admin gate). Mirrors the
	// RoomDetail capability the +page route reads; resolve is PostAlert-gated.
	let canPostAlert = $state(false);

	// Load the thread whenever a (new) alert is opened. The effect body reads
	// only `alert?.id` — never `draft`/`answerDraft` — so typing into the
	// composer can't retrigger a network fetch. Fetching + the per-alert UI
	// reset are the side effect; they live in `loadThread`.
	$effect(() => {
		const alertId = alert?.id;
		if (alertId) void loadThread(roomId, alertId);
	});

	async function loadThread(rid: string, alertId: string) {
		// Reset per-alert composer/answer UI when (re)opening an alert.
		draft = '';
		composeError = null;
		answeringId = null;
		answerDraft = '';
		answerError = null;

		loading = true;
		error = null;
		try {
			const [list, detail] = await Promise.all([
				listQuestions(rid, alertId),
				api.get<{ capabilities?: { can_post_alert?: boolean } }>(`/api/rooms/${rid}`)
			]);
			questions = list;
			canPostAlert = detail.capabilities?.can_post_alert ?? false;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load questions';
		} finally {
			loading = false;
		}
	}

	async function send() {
		const alertId = alert?.id;
		if (!alertId) return;

		const result = v.safeParse(QuestionBodySchema, draft);
		if (!result.success) {
			composeError = firstIssue(result);
			return;
		}
		composeError = null;
		sending = true;
		try {
			const created = await postQuestion(roomId, alertId, result.output);
			questions = [...questions, created];
			draft = '';
		} catch (err) {
			composeError = err instanceof ApiError ? err.message : 'Failed to post question';
		} finally {
			sending = false;
		}
	}

	function startAnswer(id: string) {
		answeringId = id;
		answerDraft = '';
		answerError = null;
	}

	async function submitAnswer(questionId: string) {
		const result = v.safeParse(AnswerSchema, answerDraft);
		if (!result.success) {
			answerError = firstIssue(result);
			return;
		}
		answerError = null;
		resolving = true;
		try {
			const updated = await resolveQuestion(roomId, questionId, result.output);
			questions = questions.map((q) => (q.id === updated.id ? updated : q));
			answeringId = null;
			answerDraft = '';
		} catch (err) {
			answerError = err instanceof ApiError ? err.message : 'Failed to submit answer';
		} finally {
			resolving = false;
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if alert}
	<!-- Backdrop: click outside the dialog closes it. -->
	<div
		class="backdrop"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div class="dialog" role="dialog" aria-modal="true" aria-label="Alert questions">
			<header>
				<h2>Q&amp;A — {alert.symbol}</h2>
				<button type="button" class="close" aria-label="Close" onclick={onClose}>
					<XIcon size={18} weight="bold" />
				</button>
			</header>

			<div class="thread">
				{#if loading}
					<p class="status">Loading questions…</p>
				{:else if error}
					<p class="status err">{error}</p>
				{:else if questions.length === 0}
					<p class="status">No questions yet. Be the first to ask.</p>
				{:else}
					<ul>
						{#each questions as q (q.id)}
							<li class="q">
								<div class="q-head">
									<span class="author">{q.author_id}</span>
									<time class="stamp">{formatStamp(q.created_at)}</time>
								</div>
								<p class="q-body">
									{#each parseMessage(q.body) as seg, si (si)}{#if seg.kind === 'ticker'}<span
												class="ticker">{seg.value}</span
											>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
												href={seg.href}
												target="_blank"
												rel="noopener noreferrer">{seg.value}</a
											>{:else}{seg.value}{/if}{/each}
								</p>

								{#if q.resolved && q.answer}
									<div class="answer">
										<span class="answer-tag"
											><CheckCircleIcon size={13} weight="fill" /> Answer</span
										>
										<p class="answer-body">
											{#each parseMessage(q.answer) as seg, si (si)}{#if seg.kind === 'ticker'}<span
														class="ticker">{seg.value}</span
													>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
														href={seg.href}
														target="_blank"
														rel="noopener noreferrer">{seg.value}</a
													>{:else}{seg.value}{/if}{/each}
										</p>
									</div>
								{:else if canPostAlert}
									{#if answeringId === q.id}
										<div class="answer-form">
											<textarea bind:value={answerDraft} placeholder="Write an answer…" rows="2"
											></textarea>
											{#if answerError}<p class="field-err">{answerError}</p>{/if}
											<div class="answer-actions">
												<button
													type="button"
													class="ghost"
													onclick={() => (answeringId = null)}
													disabled={resolving}>Cancel</button
												>
												<button
													type="button"
													class="primary"
													onclick={() => submitAnswer(q.id)}
													disabled={resolving}>Submit answer</button
												>
											</div>
										</div>
									{:else}
										<button type="button" class="answer-trigger" onclick={() => startAnswer(q.id)}
											>Answer &amp; resolve</button
										>
									{/if}
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<form
				class="composer"
				onsubmit={(e) => {
					e.preventDefault();
					void send();
				}}
			>
				<textarea bind:value={draft} placeholder="Ask a question about this alert…" rows="2"
				></textarea>
				{#if composeError}<p class="field-err">{composeError}</p>{/if}
				<div class="composer-actions">
					<button type="submit" class="primary" disabled={sending}>
						<PaperPlaneTiltIcon size={14} weight="fill" /> Send
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.55);
		padding: 1rem;
	}
	.dialog {
		display: flex;
		flex-direction: column;
		width: min(34rem, 100%);
		max-height: 80vh;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 12px;
		color: var(--text);
		overflow: hidden;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	header h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
	}
	.close {
		display: inline-flex;
		align-items: center;
		background: transparent;
		border: none;
		color: var(--text-dim);
		cursor: pointer;
		padding: 0.2rem;
		border-radius: 6px;
	}
	.close:hover {
		color: var(--text);
	}

	.thread {
		flex: 1;
		overflow-y: auto;
		padding: 0.75rem 1rem;
		min-height: 0;
	}
	.status {
		margin: 0;
		color: var(--text-dim);
		font-size: 0.85rem;
		text-align: center;
		padding: 1rem 0;
	}
	.status.err {
		color: var(--negative, #ff6b6b);
	}
	.thread ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.q {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.6rem 0.75rem;
	}
	.q-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.author {
		font-weight: 700;
		font-size: 0.82rem;
		word-break: break-all;
	}
	.stamp {
		color: var(--text-dim);
		font-size: 0.74rem;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.q-body {
		margin: 0.35rem 0 0;
		line-height: 1.45;
		word-break: break-word;
		white-space: pre-wrap;
	}
	.ticker {
		color: var(--accent);
		font-weight: 700;
	}
	.q-body a,
	.answer-body a {
		color: var(--accent);
		text-decoration: underline;
		word-break: break-all;
	}

	.answer {
		margin-top: 0.5rem;
		padding: 0.5rem 0.6rem;
		border-radius: 6px;
		background: color-mix(in srgb, var(--positive) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--positive) 40%, transparent);
	}
	.answer-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--positive);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.answer-body {
		margin: 0.3rem 0 0;
		line-height: 1.45;
		word-break: break-word;
		white-space: pre-wrap;
	}

	.answer-trigger {
		margin-top: 0.5rem;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--accent);
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		cursor: pointer;
	}
	.answer-trigger:hover {
		border-color: var(--accent);
	}
	.answer-form {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.answer-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.composer {
		flex-shrink: 0;
		border-top: 1px solid var(--border);
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.composer-actions {
		display: flex;
		justify-content: flex-end;
	}

	textarea {
		width: 100%;
		box-sizing: border-box;
		resize: vertical;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 7px;
		padding: 0.45rem 0.55rem;
		font: inherit;
		font-size: 0.85rem;
	}
	textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.field-err {
		margin: 0;
		color: var(--negative, #ff6b6b);
		font-size: 0.78rem;
	}

	.primary {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 7px;
		padding: 0.4rem 0.85rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}
	.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.ghost {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 7px;
		padding: 0.4rem 0.85rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}
	.ghost:hover {
		color: var(--text);
	}
	.ghost:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
