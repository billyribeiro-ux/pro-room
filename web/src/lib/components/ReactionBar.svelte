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
				<!-- Reference add-affordance: a bare 12px far fa-smile (regular family,
				     12x12 — report.md:1368-1370), not a filled circle. -->
				<button
					type="button"
					class="add"
					aria-label="Add reaction"
					aria-haspopup="menu"
					aria-expanded={pickerOpen}
					onclick={togglePicker}
				>
					<Icon name="smile" family="regular" size={12} />
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
		/* Captured reaction badge: transparent bg, borderless, `font: 700 12px`,
		   #676767, padding 3px 6px (report.md:1365-1367). */
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		background: transparent;
		border: none;
		border-radius: 0;
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
		/* Own-reaction state: no reference capture exists for it — a plain color
		   accent keeps the captured transparent/borderless badge geometry. */
		color: var(--accent);
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
