<script lang="ts">
	import { page } from '$app/state';
	import { api, ApiError } from '$lib/api';
	import type { AlertItem } from './AlertFeed.svelte';
	import { listQuestions, postQuestion, resolveQuestion, type Question } from '$lib/qa';
	import { QuestionBodySchema, AnswerSchema, firstIssue } from '$lib/schemas';
	import { formatStamp, parseMessage } from '$lib/message';
	import * as v from 'valibot';
	import Icon from './Icon.svelte';
	import MessageBody from './MessageBody.svelte';

	interface Props {
		alert: AlertItem | null;
		onClose: () => void;
	}
	let { alert, onClose }: Props = $props();

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	// The originating alert echoed in the header (reference .admin-alert block):
	// its body text (symbol + side + note) and avatar initials fallback.
	function alertBody(a: AlertItem): string {
		const head = a.side ? `${a.symbol} ${a.side}` : a.symbol;
		return a.note ? `${head} ${a.note}` : head;
	}
	function initials(name: string | undefined): string {
		const n = (name ?? 'Trader').trim();
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '?';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

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
				<div class="head-main">
					<h2>Q&amp;A for Alert:</h2>
					<!-- Reference echoes the originating alert inside the header (.admin-alert):
					     avatar + username + created-at + the alert body. -->
					<div class="admin-alert">
						{#if alert.image_url}
							<img class="aa-avatar" src={alert.image_url} alt="" width="50" height="50" />
						{:else}
							<span class="aa-avatar aa-fallback" aria-hidden="true"
								>{initials(alert.author_name)}</span
							>
						{/if}
						<div class="aa-meta">
							<div class="aa-top">
								<strong class="aa-username">{alert.author_name ?? 'Trader'}</strong>
								<time class="aa-time">{formatStamp(alert.created_at)}</time>
							</div>
							<div class="aa-body"><MessageBody text={alertBody(alert)} /></div>
						</div>
					</div>
				</div>
				<button type="button" class="close" aria-label="Close" onclick={onClose}>
					<Icon name="times" size={18} />
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
										<span class="answer-tag"><Icon name="check-circle" size={13} /> Answer</span>
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
				<div class="compose-row">
					<textarea bind:value={draft} placeholder="Type your question here..." rows="1"></textarea>
					<!-- Reference Q&A composer has emoji + image affordances beside the textarea
					     (.textAreaBtnsCol), mirroring the ReplyModal .tools pattern. -->
					<div class="tools">
						<button type="button" class="tool" aria-label="Add emoji" title="Add Emojis">
							<Icon name="smile" family="regular" size={16} />
						</button>
						<button type="button" class="tool" aria-label="Upload an image" title="Upload an Image">
							<Icon name="image" size={16} />
						</button>
					</div>
				</div>
				{#if composeError}<p class="field-err">{composeError}</p>{/if}
				<div class="composer-actions">
					<button type="submit" class="primary" disabled={sending}>
						<Icon name="paper-plane" size={14} /> Send
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
		/* Reference #alertQAModal .modal-dialog is capped at max-width 600px. */
		width: min(600px, 100%);
		max-height: 80vh;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 12px;
		color: var(--text);
		overflow: hidden;
	}
	header {
		display: flex;
		/* align-items-start so the close stays top-right when the echoed alert grows. */
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.head-main {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}
	header h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
	}
	.admin-alert {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
	}
	.aa-avatar {
		width: 50px;
		height: 50px;
		flex: 0 0 50px;
		border-radius: 0;
		object-fit: cover;
	}
	.aa-fallback {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elev);
		color: var(--text-dim);
		font-weight: 700;
		font-size: 0.9rem;
	}
	.aa-meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.aa-top {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.aa-username {
		font-weight: 900;
		font-size: 0.85rem;
		color: var(--accent);
	}
	.aa-time {
		font-size: 0.72rem;
		color: var(--text-dim);
	}
	.aa-body {
		font-size: 0.85rem;
		color: var(--text-dim);
		line-height: 1.4;
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
	/* Textarea + emoji/image tools share a row in the composer (reference .textAreaBtnsCol). */
	.compose-row {
		display: flex;
		align-items: stretch;
		gap: 0.5rem;
	}
	.compose-row textarea {
		flex: 1;
		min-width: 0;
	}
	.tools {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.tool {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 7px;
		padding: 0.4rem;
		line-height: 0;
		cursor: pointer;
	}
	.tool:hover {
		color: var(--accent);
		border-color: var(--accent);
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
