<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		/** Placeholder shown on the toggle when nothing is selected (e.g. "--Select Traders--"). */
		label: string;
		options: Option[];
		/** Selected option values; two-way bound. */
		selected?: string[];
		/** id for the toggle button (so a <label> can point at it). */
		id?: string;
	}
	let { label, options, selected = $bindable([]), id }: Props = $props();

	let open = $state(false);
	let root = $state<HTMLElement>();

	// Reference dropdown shows the placeholder until something is picked, then a count.
	const summary = $derived(selected.length === 0 ? label : `${selected.length} selected`);

	function toggle(value: string) {
		selected = selected.includes(value)
			? selected.filter((v) => v !== value)
			: [...selected, value];
	}

	// Bootstrap's `data-bs-auto-close="outside"`: the menu stays open while picking
	// items and only closes on a click outside the whole control. Capture phase is
	// required — this lives inside Modal.svelte's panel, which stopPropagation()s
	// clicks in the bubble phase, so a bubble-phase window handler never sees
	// in-modal clicks. Capture fires on the way down, before that stop.
	function onWindowClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onclickcapture={onWindowClick} />

<div class="ms" bind:this={root}>
	<button
		type="button"
		class="toggle"
		class:active={selected.length > 0}
		aria-haspopup="listbox"
		aria-expanded={open}
		{id}
		onclick={() => (open = !open)}
	>
		<span class="summary">{summary}</span>
		<Icon name="caret-down" size={12} />
	</button>

	{#if open}
		<ul class="menu" role="listbox" aria-multiselectable="true">
			{#each options as o (o.value)}
				{@const isSel = selected.includes(o.value)}
				<li>
					<button
						type="button"
						class="item"
						class:selected={isSel}
						role="option"
						aria-selected={isSel}
						onclick={() => toggle(o.value)}
					>
						<span class="check" aria-hidden="true">
							{#if isSel}<Icon name="check" size={12} />{/if}
						</span>
						<span class="text">{o.label}</span>
					</button>
				</li>
			{:else}
				<li class="empty">No options</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.ms {
		position: relative;
		display: inline-block;
	}
	/* Reference toggle is a Bootstrap btn-light dropdown-toggle: light control on
	   the dark modal (bg #f8f9fa, dark text), so it stays light here too. */
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: #f8f9fa;
		color: #212529;
		border: 1px solid #f8f9fa;
		border-radius: var(--radius, 6px);
		padding: 0.4rem 0.7rem;
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		white-space: nowrap;
	}
	.toggle:hover {
		background: #e2e6ea;
		border-color: #dae0e5;
	}
	.toggle.active {
		font-weight: 700;
	}
	.menu {
		position: absolute;
		z-index: 10;
		top: calc(100% + 2px);
		left: 0;
		min-width: 100%;
		max-height: 16rem;
		overflow-y: auto;
		margin: 0;
		padding: 0.25rem 0;
		list-style: none;
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: var(--radius, 6px);
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		width: 100%;
		background: transparent;
		border: none;
		color: #212529;
		text-align: left;
		padding: 0.35rem 0.75rem;
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		white-space: nowrap;
	}
	.item:hover {
		background: #f1f3f5;
	}
	.item.selected {
		background: #e9f3ff;
		font-weight: 700;
	}
	.check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		flex-shrink: 0;
		color: var(--accent);
	}
	.empty {
		padding: 0.35rem 0.75rem;
		color: #6c757d;
		font-size: 0.82rem;
	}
</style>
