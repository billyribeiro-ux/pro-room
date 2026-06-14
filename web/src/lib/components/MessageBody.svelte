<script lang="ts">
	import { parseMessage } from '$lib/message';

	interface Props {
		/** Raw message body to tokenize and render with inline coloring. */
		text: string;
	}
	let { text }: Props = $props();
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
			>{:else}{seg.value}{/if}{/each}</span
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
		/* Reference .stockColor (e.g. $VLO): 13px, font-weight 700, ITALIC. */
		color: var(--ticker-color, #0a6db1);
		font-weight: 700;
		font-style: italic;
	}
	.mention {
		color: #048d04;
		font-style: italic;
	}
	.message-body a {
		color: var(--ptr-link-color, #45a2ff);
		text-decoration: underline;
		word-break: break-all;
	}
</style>
