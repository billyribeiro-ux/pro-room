<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';
	import MultiSelectDropdown from './MultiSelectDropdown.svelte';

	export interface SearchCriteria {
		term: string;
		nonTrade: boolean;
		archives: boolean;
		startDate: string;
		endDate: string;
		/** Selected trader ids (multi-select). */
		traders: string[];
		/** Selected room ids (multi-select). */
		rooms: string[];
	}

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Options for the "--Select Traders--" multi-select. */
		traders?: Option[];
		/** Options for the "--Select Rooms--" multi-select. */
		rooms?: Option[];
		/** Called with the assembled criteria when the user runs a search. */
		onSearch?: (criteria: SearchCriteria) => void;
		/** Optional: reload the room list (the header "Rooms" refresh button). */
		onRefreshRooms?: () => void;
	}
	let { open, onClose, traders = [], rooms = [], onSearch, onRefreshRooms }: Props = $props();

	let term = $state('');
	let nonTrade = $state(false);
	let archives = $state(false);
	let startDate = $state('');
	let endDate = $state('');
	let selectedTraders = $state<string[]>([]);
	let selectedRooms = $state<string[]>([]);

	const formId = $props.id();

	function search(e: SubmitEvent) {
		e.preventDefault();
		onSearch?.({
			term: term.trim(),
			nonTrade,
			archives,
			startDate,
			endDate,
			traders: selectedTraders,
			rooms: selectedRooms
		});
	}
</script>

{#snippet footer()}
	<button class="btn primary" type="submit" form={formId}>
		<Icon name="search" size={14} /> Search
	</button>
	<button class="btn ghost" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Alerts Advanced Search" {footer}>
	<form id={formId} class="form" onsubmit={search}>
		<div class="toolbar">
			<!-- Reference: a btn-info "Rooms" reload button sits beside the title. -->
			<button type="button" class="rooms-refresh" onclick={() => onRefreshRooms?.()}>
				<Icon name="sync-alt" size={12} /> Rooms
			</button>
		</div>

		<div class="row">
			<div class="selects">
				<MultiSelectDropdown
					label="--Select Traders--"
					options={traders}
					bind:selected={selectedTraders}
					id="{formId}-traders"
				/>
				<MultiSelectDropdown
					label="--Select Rooms--"
					options={rooms}
					bind:selected={selectedRooms}
					id="{formId}-rooms"
				/>
			</div>
			<input
				class="term"
				type="search"
				bind:value={term}
				placeholder="Type your search term"
				aria-label="Type your search term"
			/>
		</div>

		<div class="row">
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
			<div class="dates">
				<label class="date">
					<span>Start Date:</span>
					<input type="datetime-local" bind:value={startDate} />
				</label>
				<label class="date">
					<span>End Date:</span>
					<input type="datetime-local" bind:value={endDate} />
				</label>
			</div>
		</div>

		<div class="results">No logs to display. Please, change the input fields.</div>
	</form>
</Modal>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.toolbar {
		display: flex;
		justify-content: flex-end;
	}
	/* Bootstrap btn-info (Darkly cyan-blue) with a leading reload glyph. */
	.rooms-refresh {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: #3498db;
		border: 1px solid #3498db;
		color: #ffffff;
		border-radius: var(--radius);
		padding: 0.25rem 0.6rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}
	.rooms-refresh:hover {
		opacity: 0.9;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.selects {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.term {
		flex: 1;
		min-width: 12rem;
		box-sizing: border-box;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.45rem 0.55rem;
		font: inherit;
		font-size: 0.85rem;
	}
	.term:focus {
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
		color: var(--text);
	}
	/* Reference --checkbox-bg-color is teal #00bc8c. */
	.check input[type='checkbox'] {
		accent-color: #00bc8c;
	}
	.dates {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.date {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: var(--text);
	}
	.date span {
		white-space: nowrap;
	}
	.date input {
		box-sizing: border-box;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.4rem 0.5rem;
		font: inherit;
		font-size: 0.82rem;
	}
	.date input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.results {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		text-align: center;
		color: var(--text-dim);
		font-size: 0.85rem;
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
		cursor: pointer;
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
		opacity: 0.9;
	}
</style>
