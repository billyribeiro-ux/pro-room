<script lang="ts">
	import Icon from './Icon.svelte';
	import type { AuthorBadges } from '$lib/types';

	// The author's badge data (custom badges + trial/new/tenure indicators). Mirrors
	// the reference's per-message badge cluster: custom badges (image or coloured
	// text pill) → Trial → New → tenure stars, rendered right after the username.
	let { data }: { data?: AuthorBadges } = $props();

	const hasAny = $derived(
		!!data &&
			((data.badges?.length ?? 0) > 0 || data.is_trial || data.is_new || !!data.years)
	);
</script>

{#if hasAny && data}
	<span class="badges">
		{#each data.badges ?? [] as b (b.id)}
			{#if b.image_url}
				<img class="user-badge-img" src={b.image_url} alt={b.label} title={b.label} />
			{:else}
				<span
					class="user-badge"
					title={b.label}
					style:background-color={b.bg_color}
					style:color={b.text_color}>{b.label}</span
				>
			{/if}
		{/each}
		{#if data.is_trial}<span class="trial-badge">Trial</span>{/if}
		{#if data.is_new}<span class="new-badge">New</span>{/if}
		{#if data.years}
			<span class="stars-container" title="{data.years} year{data.years === 1 ? '' : 's'}">
				<Icon name="star" size={13} />
				<span class="stars-num">{data.years}</span>
			</span>
		{/if}
	</span>
{/if}

<style>
	/* Reference badge cluster: sits inline after the username, shrinks before it
	   pushes the timestamp. Colours come from the badge def (admin-set, theme-able)
	   for custom badges; Trial/New use our theme tokens (kept on theme purpose). */
	.badges {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		min-width: 0;
		flex-shrink: 1;
	}
	/* Reference .user-badge { font-size: 11px } (px-1 ≈ 4px h-padding). */
	.user-badge,
	.trial-badge,
	.new-badge {
		font-size: 11px;
		line-height: 1.4;
		padding: 1px 5px;
		border-radius: 4px;
		white-space: nowrap;
	}
	/* Reference .user-badge-img { width:auto; height:100%; max-height:20px }. */
	.user-badge-img {
		height: 16px;
		width: auto;
		max-height: 20px;
		vertical-align: middle;
	}
	.trial-badge {
		background: var(--negative);
		color: #ffffff;
	}
	.new-badge {
		background: var(--accent);
		color: #ffffff;
	}
	/* Reference .stars-container: a star glyph with the tenure number overlaid. */
	.stars-container {
		position: relative;
		display: inline-flex;
		align-items: center;
		color: var(--accent);
	}
	.stars-num {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		font-weight: 700;
		color: #ffffff;
	}
</style>
