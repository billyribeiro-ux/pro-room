<script lang="ts">
	import { lightbox, closeLightbox } from '$lib/stores/lightbox.svelte';
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && lightbox.url) closeLightbox();
	}}
/>

{#if lightbox.url}
	<!-- Reference image overlay sits above every other layer (report.md:1865);
	     clicking anywhere dismisses it. -->
	<div
		class="overlay"
		role="button"
		tabindex="0"
		aria-label="Close image"
		onclick={closeLightbox}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') closeLightbox();
		}}
	>
		<img src={lightbox.url} alt="" />
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.8);
		cursor: zoom-out;
		border: none;
		padding: 0;
	}
	.overlay img {
		max-width: 92vw;
		max-height: 92vh;
		width: auto;
		height: auto;
		object-fit: contain;
	}
</style>
