<script lang="ts">
	import type { AuthorBadges } from '$lib/types';

	// The author's badge cluster. HARD EVIDENCE (proroom-all-admin.json / full-presenter
	// decode): the reference renders badges ONLY as <img class="user-badge-img"> — there
	// are ZERO "New"/"Trial" text pills and ZERO tenure-star elements in the captured DOM
	// (202 user-badge-img nodes, 0 trial-badge/new-badge/stars-container nodes). The auto
	// is_new/is_trial/years text pills were a prose-analysis error and are removed; only
	// the admin-defined custom badges (image, or a coloured text pill when no image) show.
	let { data }: { data?: AuthorBadges } = $props();

	const hasAny = $derived(!!data && (data.badges?.length ?? 0) > 0);
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
	</span>
{/if}

<style>
	/* Reference wrapper is div.d-inline-block.flex-shrink-1: display:inline-block with the
	   badge images display:inline, margin 0 — i.e. adjacent badges sit FLUSH (0px gap). */
	.badges {
		display: inline-block;
		flex-shrink: 1;
		white-space: nowrap;
		vertical-align: middle;
	}
	/* Reference .user-badge (text pill, no image): font-size 11px, padding 3px 5px. */
	.user-badge {
		display: inline-block;
		font-size: 11px;
		line-height: 1.4;
		padding: 3px 5px;
		border-radius: 4px;
		white-space: nowrap;
		vertical-align: middle;
	}
	/* Reference .user-badge-img { width:auto; height:100%; max-height:20px }, display:inline,
	   vertical-align:middle, 0 margin between adjacent images. */
	.user-badge-img {
		height: 100%;
		width: auto;
		max-height: 20px;
		vertical-align: middle;
	}
</style>
