<script lang="ts">
	import Icon from './Icon.svelte';
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

	// Curated common set — no emoji-mart dependency.
	const PICKER_EMOJI = [
		'👍',
		'👎',
		'🔥',
		'🚀',
		'😂',
		'❤️',
		'💯',
		'👀',
		'✅',
		'❌',
		'🎯',
		'💪',
		'🙏',
		'😮',
		'📈',
		'📉'
	] as const;

	let pickerOpen = $state(false);

	function togglePicker() {
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
				<button
					type="button"
					class="add"
					aria-label="Add reaction"
					aria-haspopup="menu"
					aria-expanded={pickerOpen}
					onclick={togglePicker}
				>
					<Icon name="smile" size={15} />
				</button>

				{#if pickerOpen}
					<div class="picker" role="menu" aria-label="Pick a reaction" {@attach dismissable}>
						{#each PICKER_EMOJI as emoji (emoji)}
							<button
								type="button"
								class="picker-emoji"
								role="menuitem"
								aria-label="React with {emoji}"
								onclick={() => pick(emoji)}
							>
								{emoji}
							</button>
						{/each}
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
		gap: 0.25rem;
		margin-top: 0.3rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		background: #f1f3f7;
		border: 1px solid #e0e3ea;
		border-radius: 999px;
		padding: 0.05rem 0.45rem;
		font-size: 0.78rem;
		line-height: 1.5;
		color: #3b4150;
		cursor: pointer;
	}
	.pill:hover {
		background: #e8ebf2;
		opacity: 0.85;
		cursor: pointer;
	}
	.pill.mine {
		/* Accent tint for the current user's own reactions. */
		background: color-mix(in srgb, var(--accent, #45a2ff) 16%, transparent);
		border-color: var(--accent, #45a2ff);
		color: var(--accent-hover, #0a6db1);
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #f1f3f7;
		border: 1px solid #e0e3ea;
		border-radius: 999px;
		width: 1.6rem;
		height: 1.4rem;
		color: #8a909c;
		cursor: pointer;
		padding: 0;
	}
	.add:hover {
		background: #e8ebf2;
		color: #5a6273;
		opacity: 0.85;
		cursor: pointer;
	}

	.picker {
		position: absolute;
		bottom: 100%;
		left: 0;
		z-index: 10;
		margin-bottom: 0.3rem;
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 0.1rem;
		width: max-content;
		max-width: 15rem;
		background: #ffffff;
		border: 1px solid #e3e5ec;
		border-radius: 10px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
		padding: 0.3rem;
	}
	.picker-emoji {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 6px;
		width: 1.6rem;
		height: 1.6rem;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}
	.picker-emoji:hover {
		background: #f0f4fb;
	}
</style>
