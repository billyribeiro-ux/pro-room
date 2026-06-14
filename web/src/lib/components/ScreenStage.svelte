<script lang="ts">
	import type { SharePublisher } from '$lib/livekit.svelte';
	import type { Track } from 'livekit-client';
	import type { Attachment } from 'svelte/attachments';
	import { SquareSplitHorizontalIcon, SquareIcon, BroadcastIcon } from 'phosphor-svelte';

	interface Props {
		publishers: SharePublisher[];
		connected: boolean;
	}
	let { publishers, connected }: Props = $props();

	// 'one' shows a single pinned publisher; 'split' tiles all of them.
	let layout = $state<'one' | 'split'>('one');
	let pinned = $state<string | null>(null);

	// The publisher shown in 'one' view: the pinned one, else the first.
	const focused = $derived(publishers.find((p) => p.identity === pinned) ?? publishers[0] ?? null);
	const shown = $derived(layout === 'split' ? publishers : focused ? [focused] : []);

	// Attachment that binds a LiveKit track to a <video> element. Re-runs (with
	// cleanup) automatically when the track changes.
	function track(t: Track): Attachment<HTMLVideoElement> {
		return (node) => {
			t.attach(node);
			return () => {
				t.detach(node);
			};
		};
	}
</script>

<div class="stage">
	<div class="bar">
		<span class="count">
			<BroadcastIcon size={14} weight={publishers.length ? 'fill' : 'regular'} />
			{publishers.length} sharing
		</span>
		<div class="toggle" role="group" aria-label="Layout">
			<button class:active={layout === 'one'} onclick={() => (layout = 'one')} title="Single view">
				<SquareIcon size={16} />
			</button>
			<button
				class:active={layout === 'split'}
				onclick={() => (layout = 'split')}
				title="Split view"
				disabled={publishers.length < 2}
			>
				<SquareSplitHorizontalIcon size={16} />
			</button>
		</div>
	</div>

	{#if shown.length === 0}
		<div class="empty">
			{connected ? 'Waiting for a presenter to share their screen…' : 'Connecting…'}
		</div>
	{:else}
		<div class="tiles" data-layout={layout} style:--cols={Math.ceil(Math.sqrt(shown.length))}>
			{#each shown as pub (pub.identity)}
				<button
					class="tile"
					onclick={() => {
						pinned = pub.identity;
						layout = 'one';
					}}
				>
					<video {@attach track(pub.track)} autoplay playsinline muted></video>
					<span class="label">{pub.name}{pub.isLocal ? ' (you)' : ''}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.stage {
		display: flex;
		flex-direction: column;
		background: #000;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		height: 100%;
		min-height: 360px;
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: var(--bg-elev);
		border-bottom: 1px solid var(--border);
	}
	.count {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.toggle {
		display: flex;
		gap: 0.25rem;
	}
	.toggle button {
		display: inline-flex;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 6px;
		padding: 0.3rem;
	}
	.toggle button.active {
		color: #fff;
		border-color: var(--accent);
		background: var(--accent);
	}
	.toggle button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.empty {
		flex: 1;
		display: grid;
		place-items: center;
		color: var(--text-dim);
		font-size: 0.9rem;
		padding: 2rem;
		text-align: center;
	}
	.tiles {
		flex: 1;
		display: grid;
		gap: 4px;
		padding: 4px;
		background: #000;
	}
	.tiles[data-layout='split'] {
		grid-template-columns: repeat(var(--cols), 1fr);
	}
	.tile {
		position: relative;
		padding: 0;
		border: none;
		background: #000;
		overflow: hidden;
		border-radius: 6px;
		min-height: 200px;
	}
	video {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}
	.label {
		position: absolute;
		left: 8px;
		bottom: 8px;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 6px;
	}
</style>
