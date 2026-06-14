<script lang="ts">
	import Modal from '../Modal.svelte';
	import { MagnifyingGlassIcon } from 'phosphor-svelte';

	export interface SearchCriteria {
		term: string;
		nonTrade: boolean;
		archives: boolean;
		startDate: string;
		endDate: string;
		trader: string;
		room: string;
	}

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Trader options for the "--Select Traders--" dropdown. */
		traders?: Option[];
		/** Room options for the "--Select Rooms--" dropdown. */
		rooms?: Option[];
		/** Called with the assembled criteria when the user runs a search. */
		onSearch?: (criteria: SearchCriteria) => void;
	}
	let { open, onClose, traders = [], rooms = [], onSearch }: Props = $props();

	let term = $state('');
	let nonTrade = $state(false);
	let archives = $state(false);
	let startDate = $state('');
	let endDate = $state('');
	let trader = $state('');
	let room = $state('');

	const formId = $props.id();

	function search(e: SubmitEvent) {
		e.preventDefault();
		onSearch?.({
			term: term.trim(),
			nonTrade,
			archives,
			startDate,
			endDate,
			trader,
			room
		});
	}
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={onClose}>Close</button>
	<button class="btn primary" type="submit" form={formId}>
		<MagnifyingGlassIcon size={14} weight="bold" /> Search
	</button>
{/snippet}

<Modal {open} {onClose} title="Alerts Advanced Search" {footer}>
	<form id={formId} class="form" onsubmit={search}>
		<div class="field">
			<label class="label" for="{formId}-term">Search term</label>
			<input
				id="{formId}-term"
				type="text"
				bind:value={term}
				placeholder="e.g. $SPX, breakout, trim"
			/>
		</div>

		<div class="checks">
			<label class="check">
				<input type="checkbox" bind:checked={nonTrade} />
				Non Trade Alert
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={archives} />
				Also search archives?
			</label>
		</div>

		<div class="grid">
			<div class="field">
				<label class="label" for="{formId}-start">Start Date</label>
				<input id="{formId}-start" type="datetime-local" bind:value={startDate} />
			</div>
			<div class="field">
				<label class="label" for="{formId}-end">End Date</label>
				<input id="{formId}-end" type="datetime-local" bind:value={endDate} />
			</div>
		</div>

		<div class="grid">
			<div class="field">
				<label class="label" for="{formId}-trader">Traders</label>
				<select id="{formId}-trader" bind:value={trader}>
					<option value="">--Select Traders--</option>
					{#each traders as t (t.value)}
						<option value={t.value}>{t.label}</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label class="label" for="{formId}-room">Rooms</label>
				<select id="{formId}-room" bind:value={room}>
					<option value="">--Select Rooms--</option>
					{#each rooms as r (r.value)}
						<option value={r.value}>{r.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</form>
</Modal>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}
	.label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	input[type='text'],
	input[type='datetime-local'],
	select {
		width: 100%;
		box-sizing: border-box;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.45rem 0.55rem;
		font: inherit;
		font-size: 0.85rem;
	}
	input:focus,
	select:focus {
		outline: none;
		border-color: var(--accent);
	}
	.checks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1rem;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid var(--border);
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
		font-weight: 600;
	}
	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--accent);
	}
	.btn.primary {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.btn.primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
</style>
