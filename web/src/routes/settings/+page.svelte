<script lang="ts">
	import { theme, type ThemeTokenKey } from '$lib/stores/theme.svelte';
	import { Palette, ArrowCounterClockwise } from 'phosphor-svelte';

	type Field = { key: ThemeTokenKey; label: string };

	// Highlighted pickers requested in the settings UI.
	const fields: Field[] = [
		{ key: '--accent', label: 'Accent' },
		{ key: '--bg', label: 'Background' },
		{ key: '--text', label: 'Text' },
		{ key: '--positive', label: 'Positive' },
		{ key: '--negative', label: 'Negative' },
		{ key: '--bg-elev', label: 'Surface' },
		{ key: '--border', label: 'Border' },
		{ key: '--warn', label: 'Warning' }
	];

	function onPick(key: ThemeTokenKey, e: Event) {
		const value = (e.currentTarget as HTMLInputElement).value;
		theme.set(key, value);
	}
</script>

<div class="page">
	<header class="head">
		<Palette size={26} weight="bold" />
		<div>
			<h1>Appearance</h1>
			<p>
				Customize the trading room palette. Changes apply instantly and are saved to this browser.
			</p>
		</div>
	</header>

	<section class="block">
		<h2>Presets</h2>
		<div class="presets">
			{#each theme.presets as preset (preset.id)}
				<button class="preset" type="button" onclick={() => theme.applyPreset(preset.id)}>
					<span class="swatches">
						<span style="background: {preset.tokens['--bg']}"></span>
						<span style="background: {preset.tokens['--accent']}"></span>
						<span style="background: {preset.tokens['--positive']}"></span>
						<span style="background: {preset.tokens['--negative']}"></span>
					</span>
					{preset.name}
				</button>
			{/each}
		</div>
	</section>

	<section class="block">
		<h2>Colors</h2>
		<div class="grid">
			{#each fields as field (field.key)}
				<label class="swatch">
					<input
						type="color"
						value={theme.tokens[field.key]}
						oninput={(e) => onPick(field.key, e)}
						aria-label={field.label}
					/>
					<span class="meta">
						<span class="name">{field.label}</span>
						<span class="hex">{theme.tokens[field.key]}</span>
					</span>
				</label>
			{/each}
		</div>
	</section>

	<section class="block">
		<button class="reset" type="button" onclick={() => theme.reset()}>
			<ArrowCounterClockwise size={18} /> Reset to defaults
		</button>
	</section>
</div>

<style>
	.page {
		max-width: 720px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.head {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
	}
	.head :global(svg) {
		color: var(--accent);
		margin-top: 0.2rem;
	}
	h1 {
		margin: 0;
		font-size: 1.4rem;
	}
	.head p {
		margin: 0.25rem 0 0;
		color: var(--text-dim);
		font-size: 0.9rem;
	}
	.block {
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.25rem;
	}
	h2 {
		margin: 0 0 1rem;
		font-size: 0.95rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-dim);
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.preset {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		color: var(--text);
		font-weight: 600;
		font-size: 0.9rem;
	}
	.preset:hover {
		border-color: var(--accent);
	}
	.swatches {
		display: inline-flex;
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.swatches span {
		width: 14px;
		height: 14px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
	}
	.swatch {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.5rem 0.65rem;
	}
	.swatch input[type='color'] {
		appearance: none;
		-webkit-appearance: none;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		cursor: pointer;
	}
	.swatch input[type='color']::-webkit-color-swatch-wrapper {
		padding: 2px;
	}
	.swatch input[type='color']::-webkit-color-swatch {
		border: none;
		border-radius: 6px;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.name {
		font-size: 0.85rem;
		font-weight: 600;
	}
	.hex {
		font-size: 0.75rem;
		color: var(--text-dim);
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
	}
	.reset {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 8px;
		padding: 0.55rem 0.85rem;
		font-weight: 600;
	}
	.reset:hover {
		color: var(--negative);
		border-color: var(--negative);
	}
</style>
