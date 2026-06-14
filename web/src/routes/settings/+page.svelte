<script lang="ts">
	import { theme, type ThemeTokenKey } from '$lib/stores/theme.svelte';
	import { parseHexColor } from '$lib/schemas';
	import Icon from '$lib/components/Icon.svelte';

	type Field = { key: ThemeTokenKey; label: string };

	const fields: Field[] = [
		{ key: '--accent', label: 'Accent / links' },
		{ key: '--bg', label: 'Background' },
		{ key: '--bg-elev', label: 'Surface' },
		{ key: '--text', label: 'Text' },
		{ key: '--text-dim', label: 'Muted text' },
		{ key: '--username-color', label: 'Username' },
		{ key: '--ticker-color', label: 'Ticker' },
		{ key: '--positive', label: 'Positive' },
		{ key: '--negative', label: 'Negative' },
		{ key: '--border', label: 'Border' },
		{ key: '--warn', label: 'Warning' }
	];

	// Draft text values for the hex inputs, kept separate from the live token so a
	// half-typed value (e.g. "#45a2f") doesn't get clobbered on re-render. Synced
	// explicitly on the non-typing mutation paths (preset / reset / colour picker).
	let drafts = $state<Record<ThemeTokenKey, string>>({ ...theme.tokens });
	let errors = $state<Partial<Record<ThemeTokenKey, string>>>({});

	function syncDrafts() {
		drafts = { ...theme.tokens };
		errors = {};
	}

	function onPick(key: ThemeTokenKey, e: Event) {
		const value = (e.currentTarget as HTMLInputElement).value;
		theme.set(key, value);
		drafts[key] = value;
		errors[key] = undefined;
	}

	function onHex(key: ThemeTokenKey, e: Event) {
		const value = (e.currentTarget as HTMLInputElement).value;
		drafts[key] = value;
		if (parseHexColor(value)) {
			theme.set(key, value);
			errors[key] = undefined;
		} else {
			errors[key] = 'Use #rrggbb';
		}
	}

	function applyPreset(id: string) {
		theme.applyPreset(id);
		syncDrafts();
	}

	function reset() {
		theme.reset();
		syncDrafts();
	}

	function onSize(e: Event) {
		theme.setFontSize(Number((e.currentTarget as HTMLInputElement).value));
	}
</script>

<div class="page">
	<header class="head">
		<Icon name="palette" size={26} />
		<div>
			<h1>Appearance</h1>
			<p>
				Customize the trading room theme. Changes apply instantly and are saved to this browser.
			</p>
		</div>
	</header>

	<section class="block">
		<h2>Theme presets</h2>
		<div class="presets">
			{#each theme.presets as preset (preset.id)}
				<button class="preset" type="button" onclick={() => applyPreset(preset.id)}>
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
				<div class="swatch" class:invalid={errors[field.key]}>
					<input
						type="color"
						value={theme.tokens[field.key]}
						oninput={(e) => onPick(field.key, e)}
						aria-label="{field.label} color picker"
					/>
					<span class="meta">
						<span class="name">{field.label}</span>
						<input
							class="hex"
							type="text"
							spellcheck="false"
							autocomplete="off"
							value={drafts[field.key]}
							oninput={(e) => onHex(field.key, e)}
							aria-label="{field.label} hex value"
						/>
					</span>
				</div>
			{/each}
		</div>
		{#if Object.values(errors).some(Boolean)}
			<p class="hint">Hex colours look like <code>#45a2ff</code> or <code>#fff</code>.</p>
		{/if}
	</section>

	<section class="block">
		<h2>Message text size</h2>
		<div class="size-row">
			<Icon name="font" size={18} />
			<input
				type="range"
				min="10"
				max="28"
				step="1"
				value={theme.fontSize}
				oninput={onSize}
				aria-label="Message text size in pixels"
			/>
			<span class="size-val">{theme.fontSize}px</span>
		</div>
	</section>

	<section class="block">
		<h2>Preview</h2>
		<div class="preview">
			<div class="msg">
				<span class="u">heather</span>
				<span class="t"
					>Looking for <span class="tick">$SPX</span> to hold the snowline — adding a put debit spread,
					no stop.</span
				>
			</div>
			<div class="msg">
				<span class="u">Danielle Shay</span>
				<span class="t"
					>Closed <span class="tick">$AAOI</span> for a small win; rotating into
					<span class="tick">$NBIS</span>.</span
				>
			</div>
		</div>
	</section>

	<section class="block">
		<button class="reset" type="button" onclick={reset}>
			<Icon name="undo-alt" size={18} /> Reset to defaults
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
	.head :global(svg),
	.head :global(i) {
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
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
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
	.swatch.invalid {
		border-color: var(--negative);
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
		flex: none;
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
		gap: 0.15rem;
		min-width: 0;
	}
	.name {
		font-size: 0.85rem;
		font-weight: 600;
	}
	.hex {
		width: 100%;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text-dim);
		padding: 0.15rem 0.35rem;
		font-size: 0.75rem;
		text-transform: lowercase;
		font-variant-numeric: tabular-nums;
		font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
	}
	.hex:focus {
		outline: none;
		border-color: var(--accent);
		color: var(--text);
	}
	.invalid .hex {
		border-color: var(--negative);
		color: var(--negative);
	}
	.hint {
		margin: 0.85rem 0 0;
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.hint code {
		font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
		color: var(--text);
	}
	.size-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--text-dim);
	}
	.size-row input[type='range'] {
		flex: 1;
		accent-color: var(--accent);
	}
	.size-val {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		color: var(--text);
		min-width: 3ch;
		text-align: right;
	}
	.preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.85rem;
		font-size: var(--msg-font-size);
	}
	.preview .msg {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.preview .u {
		font-weight: 900;
		color: var(--username-color);
	}
	.preview .t {
		color: var(--text);
	}
	.preview .tick {
		color: var(--ticker-color);
		font-weight: 700;
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
