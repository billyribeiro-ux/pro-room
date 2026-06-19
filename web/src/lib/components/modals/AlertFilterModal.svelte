<script lang="ts">
	import Modal from '../Modal.svelte';
	import {
		alertFilter,
		toggleTrader,
		selectAll,
		unselectAll,
		setShowAlertsFrom,
		type FilterTrader
	} from '$lib/stores/alertFilter.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** The selectable traders (present roster ∪ seen alert authors). */
		traders?: FilterTrader[];
	}
	let { open, onClose, traders = [] }: Props = $props();

	// Reference h5 flips with showAlertsFrom: "Only show" (allow-list) vs
	// "Filter out" (block-list) + " alerts from the following:".
	const title = $derived(
		`${alertFilter.showAlertsFrom ? 'Only show' : 'Filter out'} alerts from the following:`
	);
</script>

<Modal {open} {onClose} {title}>
	<!-- Reference .form-check: toggles allow-list vs block-list and re-applies live. -->
	<label class="check">
		<input
			type="checkbox"
			checked={alertFilter.showAlertsFrom}
			onchange={(e) => setShowAlertsFrom(e.currentTarget.checked)}
		/>
		Only show alerts from these people:
	</label>

	{#if traders.length === 0}
		<!-- Reference empty body. -->
		<p class="empty">List is empty.</p>
	{:else}
		<ul class="list-group">
			{#each traders as t (t.id)}
				{@const selected = t.id in alertFilter.filtered}
				<li>
					<button
						type="button"
						class="trader"
						class:selected
						aria-pressed={selected}
						onclick={() => toggleTrader(t.id, t.name)}
					>
						<!-- check-square (selected, green) / empty square (reference fa-check-square / fa-square). -->
						<span class="box" aria-hidden="true">{selected ? '☑' : '☐'}</span>
						<span class="name">{t.name}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#snippet footer()}
		<!-- Reference footer: Close (left), then [Unselect All][Select All], then Save. -->
		<button type="button" class="btn secondary" onclick={onClose}>Close</button>
		<div class="bulk">
			<button type="button" class="btn ghost" onclick={unselectAll}>Unselect All</button>
			<button type="button" class="btn ghost" onclick={() => selectAll(traders)}>Select All</button>
		</div>
		<!-- Toggles apply live + persist; Save just confirms + closes (we have no
		     server sync to commit, unlike the reference's updateAlertFilter). -->
		<button type="button" class="btn primary" onclick={onClose}>Save</button>
	{/snippet}
</Modal>

<style>
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.88rem;
		font-weight: 600;
		margin-bottom: 0.6rem;
	}
	/* Reference --checkbox-bg-color is teal #00bc8c. */
	.check input[type='checkbox'] {
		accent-color: #00bc8c;
	}
	.empty {
		margin: 0.9rem 0 0;
		color: var(--text-dim);
		font-size: 0.85rem;
	}
	.list-group {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		max-height: 50vh;
		overflow-y: auto;
	}
	.trader {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		text-align: left;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		padding: 0.5rem 0.7rem;
		cursor: pointer;
		font: inherit;
		font-size: 0.85rem;
	}
	li + li .trader {
		border-top: none;
	}
	.trader:hover {
		border-color: var(--accent);
	}
	.box {
		font-size: 1rem;
		line-height: 1;
		color: var(--text-dim);
	}
	.trader.selected .box {
		color: var(--positive);
	}
	.trader.selected .name {
		font-weight: 700;
	}
	.bulk {
		display: flex;
		gap: 0.4rem;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		border-color: var(--modal-btn-secondary, #444);
		color: #fff;
	}
	.btn.ghost {
		background: transparent;
		border-color: var(--border);
		color: var(--text);
	}
	.btn.ghost:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.btn.primary {
		background: var(--modal-btn-primary, var(--accent));
		border-color: var(--modal-btn-primary, var(--accent));
		color: #fff;
	}
	.btn.primary:hover {
		opacity: 0.9;
	}
</style>
