<script lang="ts">
	import { page } from '$app/state';
	import { ApiError } from '$lib/api';
	import { createPoll, type PollDetail } from '$lib/poll';
	import { validatePollCreate } from '$lib/schemas';
	import Icon from './Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		onCreated?: (poll: PollDetail) => void;
	}
	let { open, onClose, onCreated }: Props = $props();

	const MAX_OPTIONS = 10;
	const CANNED_KEY = 'ptr.poll.canned';

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	// Reference Polls is a draggable FLOATING PANEL (#pollModalCompHolder), NOT a
	// bootstrap modal — titlebar (Polls + Minimize/Maximize/Close) + two tabs.
	type Tab = 'create' | 'canned';
	let tab = $state<Tab>('create');

	let question = $state('');
	// Choices are built one at a time via the "Add Choice" input (reference flow),
	// not pre-seeded rows.
	let choices = $state<string[]>([]);
	let choiceDraft = $state('');
	let anonymous = $state(false);
	let error = $state<string | null>(null);
	let sending = $state(false);

	// Floating-panel chrome.
	let pos = $state<{ x: number; y: number } | null>(null); // null → CSS-centered
	let dragging = $state(false);
	let minimized = $state(false);
	let maximized = $state(false);

	// Pre-Canned polls persisted locally (the reference "Save To Canned" store).
	type Canned = { question: string; options: string[] };
	let canned = $state<Canned[]>([]);

	function loadCanned(): Canned[] {
		if (typeof window === 'undefined') return [];
		try {
			const raw = window.localStorage.getItem(CANNED_KEY);
			const parsed = raw ? JSON.parse(raw) : [];
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	function persistCanned() {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(CANNED_KEY, JSON.stringify(canned));
		} catch {
			// storage may be unavailable (private mode) — non-fatal.
		}
	}

	// Reset the form when the panel transitions to open (reads only `open`).
	$effect(() => {
		if (open) {
			tab = 'create';
			question = '';
			choices = [];
			choiceDraft = '';
			anonymous = false;
			error = null;
			sending = false;
			minimized = false;
			maximized = false;
			pos = null;
			canned = loadCanned();
		}
	});

	function addChoice() {
		const v = choiceDraft.trim();
		if (!v || choices.length >= MAX_OPTIONS) return;
		choices = [...choices, v];
		choiceDraft = '';
	}
	function onChoiceKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addChoice();
		}
	}
	function removeChoice(i: number) {
		choices = choices.filter((_, idx) => idx !== i);
	}

	function saveToCanned() {
		const q = question.trim();
		if (!q || choices.length < 2) {
			error = 'Add a question and at least two choices before saving.';
			return;
		}
		canned = [{ question: q, options: [...choices] }, ...canned].slice(0, 50);
		persistCanned();
		error = null;
	}
	function useCanned(c: Canned) {
		question = c.question;
		choices = [...c.options];
		choiceDraft = '';
		tab = 'create';
	}
	function deleteCanned(i: number) {
		canned = canned.filter((_, idx) => idx !== i);
		persistCanned();
	}

	async function submit() {
		const result = validatePollCreate(question, choices);
		if (!result.ok) {
			error = result.issue;
			return;
		}
		error = null;
		sending = true;
		try {
			const poll = await createPoll(roomId, {
				question: result.value.question,
				options: result.value.options,
				anonymous
			});
			onCreated?.(poll);
			onClose();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to create poll';
		} finally {
			sending = false;
		}
	}

	// Drag by the titlebar (ignore clicks on the window-control buttons).
	function onTitlePointerDown(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('button')) return;
		const panel = (e.currentTarget as HTMLElement).closest('.poll-panel');
		if (!panel) return;
		const rect = panel.getBoundingClientRect();
		const offX = e.clientX - rect.left;
		const offY = e.clientY - rect.top;
		dragging = true;
		const move = (ev: PointerEvent) => {
			pos = { x: ev.clientX - offX, y: ev.clientY - offY };
		};
		const up = () => {
			dragging = false;
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	}
</script>

{#if open}
	<section
		class="poll-panel"
		class:dragging
		class:maximized
		aria-label="Polls"
		style={pos ? `left:${pos.x}px; top:${pos.y}px; transform:none;` : ''}
	>
		<!-- Reference titlebar: "Polls" + Minimize / Maximize / Close window buttons. -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="poll-panel-titlebar" onpointerdown={onTitlePointerDown}>
			<span class="poll-panel-title">Polls</span>
			<div class="poll-panel-controls">
				<button
					type="button"
					class="poll-panel-btn"
					title="Minimize"
					aria-label="Minimize"
					onclick={() => (minimized = !minimized)}
				>
					<Icon name="minus" size={13} />
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
					<Icon name="expand" size={12} />
				</button>
				<button
					type="button"
					class="poll-panel-btn poll-panel-btn-close"
					title="Close"
					aria-label="Close"
					onclick={onClose}
				>
					<Icon name="times" size={14} />
				</button>
			</div>
		</div>

		{#if !minimized}
			<div class="poll-panel-body">
				<div class="nav-tabs" role="tablist" aria-label="Poll mode">
					<button
						type="button"
						role="tab"
						class="nav-link"
						class:active={tab === 'create'}
						aria-selected={tab === 'create'}
						onclick={() => (tab = 'create')}>Create New Poll</button
					>
					<button
						type="button"
						role="tab"
						class="nav-link"
						class:active={tab === 'canned'}
						aria-selected={tab === 'canned'}
						onclick={() => (tab = 'canned')}>Pre-Canned Polls</button
					>
				</div>

				{#if tab === 'create'}
					<div class="pane">
						<h3 class="step">Enter your poll question:</h3>
						<input
							id="pollQuestionTxt"
							name="pollQuestionTxt"
							class="input"
							type="text"
							bind:value={question}
							maxlength="280"
							placeholder="Main poll question (i.e. Where do you think the market is going?)"
							autocomplete="off"
						/>

						<h3 class="step">Add Choices/Answers:</h3>
						<div class="add-choice">
							<input
								id="pollChoiceTxt"
								name="pollChoiceTxt"
								class="input"
								type="text"
								bind:value={choiceDraft}
								maxlength="80"
								placeholder="Enter a choice (i.e. Up, Down, Sideways)"
								autocomplete="off"
								onkeydown={onChoiceKeydown}
							/>
							<button type="button" class="add-btn" onclick={addChoice}>
								<Icon name="plus-circle" size={14} /> Add Choice
							</button>
						</div>

						{#if choices.length}
							<ol class="choices">
								{#each choices as choice, i (i)}
									<li>
										<span class="choice-text">{choice}</span>
										<button
											type="button"
											class="icon-btn"
											onclick={() => removeChoice(i)}
											aria-label={`Remove choice ${i + 1}`}
											title="Remove choice"
										>
											<Icon name="trash-alt" size={13} />
										</button>
									</li>
								{/each}
							</ol>
						{/if}

						<label class="anonymous-poll-container">
							<input id="anonymous-poll" name="anonymous-poll" type="checkbox" bind:checked={anonymous} />
							<span>Anonymous Poll (Does not show the voting members' names)</span>
						</label>

						{#if error}<p class="field-err" role="alert">{error}</p>{/if}

						<div class="actions">
							<button type="button" class="btn save" onclick={saveToCanned}>
								<Icon name="save" size={13} /> Save To Canned
							</button>
							<button
								type="button"
								class="btn btn-success"
								onclick={submit}
								disabled={sending}
							>
								{sending ? 'Sending…' : 'Send Poll'}
							</button>
						</div>
					</div>
				{:else}
					<div class="pane">
						<h5 class="step">Pre-Canned Polls</h5>
						{#if canned.length === 0}
							<p class="empty">No saved polls yet. Build one and hit "Save To Canned".</p>
						{:else}
							<ul class="canned">
								{#each canned as c, i (i)}
									<li>
										<div class="canned-info">
											<span class="canned-q">{c.question}</span>
											<span class="canned-meta">{c.options.length} choices</span>
										</div>
										<div class="canned-actions">
											<button type="button" class="btn small" onclick={() => useCanned(c)}>Use</button>
											<button
												type="button"
												class="icon-btn"
												onclick={() => deleteCanned(i)}
												aria-label="Delete saved poll"
												title="Delete"
											>
												<Icon name="trash-alt" size={13} />
											</button>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</section>
{/if}

<style>
	.poll-panel {
		position: fixed;
		top: 80px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1200;
		width: min(440px, calc(100vw - 2rem));
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.poll-panel.maximized {
		width: min(720px, calc(100vw - 2rem));
	}
	.poll-panel.dragging {
		user-select: none;
	}
	.poll-panel-titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.4rem 0.6rem;
		background: var(--accent-hover);
		color: #fff;
		cursor: move;
		touch-action: none;
	}
	.poll-panel-title {
		font-weight: 700;
		font-size: 0.9rem;
	}
	.poll-panel-controls {
		display: inline-flex;
		gap: 0.15rem;
	}
	.poll-panel-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 22px;
		background: transparent;
		border: none;
		color: #fff;
		border-radius: 4px;
		cursor: pointer;
	}
	.poll-panel-btn:hover {
		background: rgba(255, 255, 255, 0.18);
	}
	.poll-panel-btn-close:hover {
		background: var(--negative);
	}
	.poll-panel-body {
		padding: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		max-height: calc(100vh - 160px);
		overflow-y: auto;
	}
	.nav-tabs {
		display: flex;
		gap: 0.3rem;
		border-bottom: 1px solid var(--border);
	}
	.nav-link {
		background: transparent;
		border: 1px solid transparent;
		border-bottom: none;
		color: var(--text-dim);
		padding: 0.4rem 0.7rem;
		font-size: 0.85rem;
		font-weight: 600;
		border-radius: var(--radius) var(--radius) 0 0;
		margin-bottom: -1px;
		cursor: pointer;
	}
	.nav-link.active {
		color: var(--text);
		background: var(--bg-elev-2);
		border-color: var(--border);
		border-bottom-color: var(--bg-elev-2);
	}
	.pane {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.step {
		margin: 0.2rem 0 0;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text);
	}
	.input {
		width: 100%;
		box-sizing: border-box;
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.5rem 0.6rem;
		font: inherit;
		font-size: 0.88rem;
	}
	.input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.add-choice {
		display: flex;
		gap: 0.4rem;
	}
	.add-choice .input {
		flex: 1;
		min-width: 0;
	}
	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		white-space: nowrap;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.45rem 0.7rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}
	.add-btn:hover {
		border-color: var(--accent);
	}
	.choices {
		list-style: decimal inside;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.choices li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.35rem 0.55rem;
		font-size: 0.85rem;
	}
	.choice-text {
		flex: 1;
		min-width: 0;
	}
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--text-dim);
		cursor: pointer;
		padding: 0.2rem;
		border-radius: 4px;
	}
	.icon-btn:hover {
		color: var(--negative);
	}
	.anonymous-poll-container {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-dim);
		font-size: 0.82rem;
	}
	.field-err {
		margin: 0;
		color: var(--negative);
		font-size: 0.8rem;
	}
	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-top: 0.2rem;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: none;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
	}
	.save {
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
	}
	.save:hover {
		border-color: var(--accent);
	}
	.btn-success {
		background: var(--positive);
		color: #07210a;
	}
	.btn-success:hover:not(:disabled) {
		filter: brightness(1.08);
	}
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.btn.small {
		padding: 0.3rem 0.6rem;
		font-size: 0.78rem;
		background: var(--accent);
		color: #fff;
	}
	.empty {
		margin: 0;
		color: var(--text-dim);
		font-size: 0.82rem;
	}
	.canned {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.canned li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.4rem 0.55rem;
	}
	.canned-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.canned-q {
		font-size: 0.84rem;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.canned-meta {
		font-size: 0.72rem;
		color: var(--text-dim);
	}
	.canned-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
</style>
