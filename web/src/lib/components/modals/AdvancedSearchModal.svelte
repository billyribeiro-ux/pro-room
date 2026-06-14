<script lang="ts">
	import Modal from '../Modal.svelte';
	import { MagnifyingGlassIcon } from 'phosphor-svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	// Local presentational state — no backend wired.
	let traders = $state<string[]>([]);
	let rooms = $state<string[]>([]);
	let term = $state('');
	let nonTradeAlert = $state(false);
	let includeArchives = $state(false);
	let startAt = $state('');
	let endAt = $state('');
	let searched = $state(false);

	function search() {
		// Presentational only: flip to the "no results" empty state.
		searched = true;
	}
</script>

<Modal {open} {onClose} title="Alerts Advanced Search">
	<div class="grid">
		<div class="field">
			<label class="label" for="adv-traders">Select Traders</label>
			<select id="adv-traders" multiple bind:value={traders} size="3">
				<option disabled>No traders available</option>
			</select>
		</div>
		<div class="field">
			<label class="label" for="adv-rooms">Select Rooms</label>
			<select id="adv-rooms" multiple bind:value={rooms} size="3">
				<option disabled>No rooms available</option>
			</select>
		</div>
	</div>

	<div class="field">
		<label class="label" for="adv-term">Search term</label>
		<input id="adv-term" type="text" bind:value={term} placeholder="e.g. $SPX, breakout, trim" />
	</div>

	<div class="checks">
		<label class="check">
			<input type="checkbox" bind:checked={nonTradeAlert} />
			Non-Trade Alert
		</label>
		<label class="check">
			<input type="checkbox" bind:checked={includeArchives} />
			Include archives
		</label>
	</div>

	<div class="grid">
		<div class="field">
			<label class="label" for="adv-start">Start</label>
			<input id="adv-start" type="datetime-local" bind:value={startAt} />
		</div>
		<div class="field">
			<label class="label" for="adv-end">End</label>
			<input id="adv-end" type="datetime-local" bind:value={endAt} />
		</div>
	</div>

	<div class="results">
		{#if searched}
			<div class="empty">
				<MagnifyingGlassIcon size={22} />
				<p>No results.</p>
			</div>
		{:else}
			<p class="hint">Set your filters and run a search.</p>
		{/if}
	</div>

	{#snippet footer()}
		<button type="button" class="primary" onclick={search}>
			<MagnifyingGlassIcon size={14} weight="bold" /> Search
		</button>
	{/snippet}
</Modal>

<style>
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
	.field + .field,
	.grid + .field,
	.checks + .grid {
		margin-top: 0.75rem;
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
		margin-top: 0.75rem;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	.results {
		margin-top: 0.9rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-height: 90px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		color: var(--text-dim);
	}
	.empty p,
	.hint {
		margin: 0;
		font-size: 0.84rem;
		color: var(--text-dim);
	}
	.primary {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.primary:hover {
		background: var(--accent-hover);
	}
</style>
