<script lang="ts">
	import Icon from './Icon.svelte';
	import EmojiMart from './EmojiMart.svelte';
	import { fixedPopoverStyle } from '$lib/popoverPosition';
	import type { Attachment } from 'svelte/attachments';

	/** A single aggregated reaction for one emoji on a message. */
	export interface Reaction {
		emoji: string;
		count: number;
		/** Whether the current user is among the reactors. */
		mine: boolean;
	}

	interface Props {
		reactions: Reaction[];
		/** Toggle the current user's reaction for `emoji` (add if absent, remove if present). */
		onToggle: (emoji: string) => void;
		/** Gate the add-reaction affordance. Pills still render when false. */
		canReact?: boolean;
	}
	let { reactions, onToggle, canReact = true }: Props = $props();

	let pickerOpen = $state(false);
	let addBtnEl = $state<HTMLElement | null>(null);
	let pickerStyle = $state('');

	function togglePicker() {
		// container="body" equivalent: escape the chat scroller's clipping.
		if (!pickerOpen && addBtnEl) pickerStyle = fixedPopoverStyle(addBtnEl);
		pickerOpen = !pickerOpen;
	}

	function pick(emoji: string) {
		onToggle(emoji);
		pickerOpen = false;
	}

	/**
	 * Close the popover on Escape or a click/touch outside of `node`. Returns a
	 * teardown that removes both listeners; the attachment re-runs (and tears
	 * down the previous run) whenever it is detached, so listeners never leak.
	 */
	const dismissable: Attachment<HTMLElement> = (node) => {
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				pickerOpen = false;
			}
		}
		function onPointerdown(e: PointerEvent) {
			if (e.target instanceof Node && !node.contains(e.target)) {
				pickerOpen = false;
			}
		}
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('pointerdown', onPointerdown, true);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('pointerdown', onPointerdown, true);
		};
	};
</script>

{#if reactions.length > 0 || canReact}
	<div class="reaction-bar">
		{#each reactions as r (r.emoji)}
			<button
				type="button"
				class="pill"
				class:mine={r.mine}
				aria-pressed={r.mine}
				aria-label="{r.emoji} reaction, {r.count}{r.mine ? ', including you' : ''}"
				onclick={() => onToggle(r.emoji)}
			>
				<span class="emoji">{r.emoji}</span><span class="count">{r.count}</span>
			</button>
		{/each}

		{#if canReact}
			<div class="add-wrap">
				<!-- Reference add-affordance: a bare 12px far fa-smile (regular family,
				     12x12 — report.md:1368-1370), not a filled circle. -->
				<button
					type="button"
					class="add"
					aria-label="Add reaction"
					aria-haspopup="menu"
					aria-expanded={pickerOpen}
					bind:this={addBtnEl}
					onclick={togglePicker}
				>
					<Icon name="smile" family="regular" size={12} />
				</button>

				{#if pickerOpen}
					<!-- HARD EVIDENCE (chat-panel.md:381): the "Add Reaction" affordance
					     opens an emoji-mart popover (ngbPopover, shown/hidden handlers).
					     Hosted in the same dismissable wrapper; picking closes it. -->
					<div class="picker" style={pickerStyle} {@attach dismissable}>
						<EmojiMart onSelect={(native) => pick(native)} />
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.reaction-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		/* Reference inter-pill spacing is margin 0 2px. */
		gap: 2px;
		margin-top: 0.3rem;
	}

	.pill {
		/* Captured reaction badge: transparent bg, borderless, `font: 700 12px`,
		   #676767, padding 3px 6px (report.md:1365-1367). */
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		background: transparent;
		/* Reference .chat-reaction: 1px solid border (gray default, blue when
		   added), 700 12px #676767, padding 3px 6px. */
		border: 1px solid #676767;
		border-radius: 4px;
		padding: 3px 6px;
		font-size: 12px;
		font-weight: 700;
		line-height: 1.2;
		color: #676767;
		cursor: pointer;
	}
	.pill:hover {
		opacity: 0.85;
		cursor: pointer;
	}
	.pill.mine {
		/* Reference .chat-reaction-added: blue border/text (#45a2ff). */
		color: var(--accent);
		border-color: var(--accent);
	}
	.pill .emoji {
		font-size: 0.85rem;
		line-height: 1;
	}
	.pill .count {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.add-wrap {
		position: relative;
		display: inline-flex;
	}
	.add {
		/* Captured add-affordance: bare far fa-smile, 12px, #676767 — no fill,
		   no border (report.md:1368-1370). */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #676767;
		cursor: pointer;
		padding: 3px 6px;
	}
	.add:hover {
		opacity: 0.85;
		cursor: pointer;
	}

	/* Hosts the EmojiMart replica (its own #d9d9d9 border/5px radius is the
	   popover chrome, per popOverDiv's zero-padding body). */
	.picker {
		position: absolute;
		bottom: 100%;
		left: 0;
		z-index: 10;
		margin-bottom: 0.3rem;
		padding: 0;
	}
</style>
