<script lang="ts">
	import { parseMessage } from '$lib/message';
	import { dnd } from '$lib/stores/dnd.svelte';
	import { SvelteSet } from 'svelte/reactivity';

	interface Props {
		/** Raw message body to tokenize and render with inline coloring. */
		text: string;
	}
	let { text }: Props = $props();

	// GIFs are muted-by-default when the "Animated GIFs in chat" DND flag is on
	// (reference showChatGif: "gif muted, click to show"). Track which have been
	// revealed in THIS row so a click swaps the placeholder for the animated image.
	// SvelteSet so an in-place .add() is reactive.
	const shownGifs = new SvelteSet<string>();
	function revealGif(href: string) {
		shownGifs.add(href);
	}
</script>

<!--
	Colored, safe renderer for a message body. No `{@html}` ever touches the
	text (project hard rule): we segment-parse and render each node. Replaces
	the inline segment-rendering AlertFeed/ChatPanel did by hand.
	Whitespace inside the `{#each}` is deliberately collapsed onto single lines
	so `white-space: pre-wrap` doesn't surface stray newlines between segments.
-->
<span class="message-body"
	>{#each parseMessage(text) as seg, i (i)}{#if seg.kind === 'ticker'}<span class="ticker"
				>{seg.value}</span
			>{:else if seg.kind === 'mention'}<span class="mention">{seg.value}</span
			>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
				href={seg.href}
				target="_blank"
				rel="noopener noreferrer">{seg.value}</a
			>{:else if seg.kind === 'image'}{#if seg.gif && dnd.chatGif && !shownGifs.has(seg.href)}<button
					type="button"
					class="gif-muted"
					onclick={() => revealGif(seg.href)}>GIF muted — click to show</button
				>{:else}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied image URL --><a
					class="img-container"
					href={seg.href}
					target="_blank"
					rel="noopener noreferrer"
					title="Open image"><img class="uploaded-img" src={seg.href} alt="" loading="lazy" /></a
				>{/if}{:else}{seg.value}{/if}{/each}</span
>

<style>
	.message-body {
		white-space: pre-wrap;
		word-break: break-word;
		font-size: var(--msg-font-size);
		/* Reference .text-formated body: 13px / 19.5px == line-height 1.5. */
		line-height: 1.5;
	}
	.ticker {
		/* Reference .stockColor (e.g. $VLO): near-black #1a1a1a, 700, ITALIC,
		   text-transform UPPERCASE. Literal capture rule + computed §06 line 1341.
		   Color is the themeable --ticker-color token (default #1a1a1a); the
		   uppercase/italic/weight are fixed reference behavior, not themed. */
		color: var(--ticker-color, #1a1a1a);
		font-weight: 700;
		font-style: italic;
		text-transform: uppercase;
	}
	.mention {
		color: #048d04;
		font-style: italic;
	}
	.message-body a:not(.img-container) {
		/* Reference body URLs use the .linkColor class = #025aa8 (a darker blue),
		   NOT the app link #45a2ff. */
		color: #025aa8;
		text-decoration: underline;
		word-break: break-all;
	}
	/* Inline posted image/GIF (reference .img-container + .uploaded-img). The
	   image renders in the message body; clicking opens the full image. The
	   ChatPanel "Small image preview" pref further shrinks `.body img` to 120px. */
	.img-container {
		display: inline-flex;
		cursor: pointer;
		padding: 3px;
		vertical-align: bottom;
	}
	.uploaded-img {
		max-width: 300px;
		max-height: 300px;
		border-radius: 4px;
	}
	/* GIF muted-by-default placeholder (reference showChatGif "gif muted, click to
	   show") — shown only when the chatGif DND flag is set; click reveals the GIF. */
	.gif-muted {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: #eef1f6;
		border: 1px dashed #b6bdca;
		border-radius: 6px;
		padding: 0.15rem 0.5rem;
		font-size: 0.78rem;
		color: #5a6273;
		cursor: pointer;
	}
	.gif-muted:hover {
		background: #e4e8f0;
	}
</style>
