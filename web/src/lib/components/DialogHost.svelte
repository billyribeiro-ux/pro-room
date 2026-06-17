<script lang="ts">
	import Modal from './Modal.svelte';
	import {
		dialog,
		dismissDialog,
		resolveConfirmDialog,
		resolvePromptDialog
	} from '../dialog.svelte';

	const request = $derived(dialog.current);

	// Local mirror of the prompt's text so typing never mutates the shared
	// request. Seeded from the request's initial value on mount; the input
	// is remounted via `{#key request}` so each new prompt starts fresh.
	let inputValue = $state('');

	// Attachment factory: seed the field with the request's initial value and
	// move focus to it once mounted. Runs once per prompt because the keyed
	// block remounts the input on every new request.
	function seedAndFocus(initial: string) {
		return (node: HTMLInputElement) => {
			inputValue = initial;
			node.focus();
		};
	}

	function confirm() {
		resolveConfirmDialog(true);
	}

	function submitPrompt() {
		resolvePromptDialog(inputValue);
	}

	function onPromptKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			submitPrompt();
		}
	}
</script>

{#if request}
	{#if request.kind === 'confirm'}
		<Modal open onClose={dismissDialog} title={request.title ?? 'Confirm'} footer={confirmFooter}>
			<p class="message">{request.message}</p>
		</Modal>

		{#snippet confirmFooter()}
			<button class="btn ghost" type="button" onclick={dismissDialog}>Cancel</button>
			<button class="btn primary" class:danger={request.danger} type="button" onclick={confirm}>
				{request.confirmLabel ?? 'Confirm'}
			</button>
		{/snippet}
	{:else}
		{#key request}
			<Modal
				open
				onClose={dismissDialog}
				title={request.title ?? 'Enter a value'}
				footer={promptFooter}
			>
				<p class="message">{request.message}</p>
				<input
					id="dialog-prompt"
					name="dialog-prompt"
					class="field"
					type="text"
					bind:value={inputValue}
					placeholder={request.placeholder ?? ''}
					aria-label={request.message}
					onkeydown={onPromptKeydown}
					{@attach seedAndFocus(request.value ?? '')}
				/>
			</Modal>
		{/key}

		{#snippet promptFooter()}
			<button class="btn ghost" type="button" onclick={dismissDialog}>Cancel</button>
			<button class="btn primary" type="button" onclick={submitPrompt}>OK</button>
		{/snippet}
	{/if}
{/if}

<style>
	.message {
		margin: 0;
		color: var(--text);
	}
	.field {
		margin-top: 0.85rem;
		width: 100%;
		box-sizing: border-box;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.55rem 0.7rem;
		font-size: 0.9rem;
	}
	.field:focus {
		outline: none;
		border-color: var(--accent);
	}
	.field::placeholder {
		color: var(--text-dim);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
		cursor: pointer;
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
	}
	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--accent);
	}
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn.primary.danger {
		background: var(--negative);
		border-color: var(--negative);
	}
	.btn.primary.danger:hover {
		background: var(--negative);
		border-color: var(--negative);
		filter: brightness(1.1);
	}
</style>
