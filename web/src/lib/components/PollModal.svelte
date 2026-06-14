<script lang="ts">
	import { page } from '$app/state';
	import { ApiError } from '$lib/api';
	import { createPoll, type PollDetail } from '$lib/poll';
	import { validatePollCreate } from '$lib/schemas';
	import Modal from './Modal.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		onCreated?: (poll: PollDetail) => void;
	}
	let { open, onClose, onCreated }: Props = $props();

	const MIN_OPTIONS = 2;
	const MAX_OPTIONS = 10;

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	let question = $state('');
	// Each row carries a stable key so reorder/remove can't reuse a sibling's
	// input state ({#each} keyed on `key`, not the index).
	let options = $state<{ key: number; value: string }[]>([]);
	let anonymous = $state(false);
	let error = $state<string | null>(null);
	let sending = $state(false);
	let nextKey = 0;

	function freshOptions() {
		return [
			{ key: nextKey++, value: '' },
			{ key: nextKey++, value: '' }
		];
	}

	// Reset the form each time the modal transitions to open. The effect reads
	// only `open` (never `question`/`options`) so typing can't retrigger it.
	$effect(() => {
		if (open) {
			question = '';
			options = freshOptions();
			anonymous = false;
			error = null;
			sending = false;
		}
	});

	function addOption() {
		if (options.length >= MAX_OPTIONS) return;
		options = [...options, { key: nextKey++, value: '' }];
	}

	function removeOption(key: number) {
		if (options.length <= MIN_OPTIONS) return;
		options = options.filter((o) => o.key !== key);
	}

	async function submit() {
		const result = validatePollCreate(
			question,
			options.map((o) => o.value)
		);
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

	const questionId = $props.id();
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={onClose} disabled={sending}>Cancel</button>
	<button class="btn primary" type="button" onclick={submit} disabled={sending}>
		<Icon name="paper-plane" size={14} />
		{sending ? 'Sending…' : 'Send'}
	</button>
{/snippet}

<Modal {open} {onClose} title="Create a poll" {footer}>
	<form
		class="form"
		onsubmit={(e) => {
			e.preventDefault();
			void submit();
		}}
	>
		<label class="field">
			<span class="label">Question</span>
			<input
				id={questionId}
				class="input"
				type="text"
				bind:value={question}
				maxlength="280"
				placeholder="What do you want to ask?"
				autocomplete="off"
			/>
		</label>

		<fieldset class="field options">
			<legend class="label">Options</legend>
			{#each options as option, i (option.key)}
				<div class="option-row">
					<input
						class="input"
						type="text"
						bind:value={option.value}
						maxlength="80"
						placeholder={`Option ${i + 1}`}
						aria-label={`Option ${i + 1}`}
						autocomplete="off"
					/>
					<button
						class="icon-btn"
						type="button"
						onclick={() => removeOption(option.key)}
						disabled={options.length <= MIN_OPTIONS}
						aria-label={`Remove option ${i + 1}`}
						title="Remove option"
					>
						<Icon name="trash-alt" />
					</button>
				</div>
			{/each}
			<button
				class="add-btn"
				type="button"
				onclick={addOption}
				disabled={options.length >= MAX_OPTIONS}
			>
				<Icon name="plus" size={14} /> Add option
			</button>
		</fieldset>

		<label class="check">
			<input type="checkbox" bind:checked={anonymous} />
			<span>Anonymous poll</span>
		</label>

		{#if error}<p class="field-err" role="alert">{error}</p>{/if}
	</form>
</Modal>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: none;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	.label {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0;
	}
	.input {
		width: 100%;
		box-sizing: border-box;
		background: var(--bg-elev);
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
	.options {
		gap: 0.5rem;
	}
	.option-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.option-row .input {
		flex: 1;
	}
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.4rem;
		line-height: 0;
	}
	.icon-btn:hover:not(:disabled) {
		color: var(--negative);
		border-color: var(--negative);
	}
	.icon-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		align-self: flex-start;
		background: transparent;
		border: 1px dashed var(--border);
		color: var(--accent);
		border-radius: var(--radius);
		padding: 0.4rem 0.7rem;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.add-btn:hover:not(:disabled) {
		border-color: var(--accent);
	}
	.add-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: var(--text);
	}
	.check input {
		accent-color: var(--accent);
	}
	.field-err {
		margin: 0;
		color: var(--negative);
		font-size: 0.8rem;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
	}
	.btn.ghost:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--accent);
	}
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover:not(:disabled) {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
