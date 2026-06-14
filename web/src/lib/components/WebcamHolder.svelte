<script lang="ts">
	import { XIcon } from 'phosphor-svelte';
	import type { Attachment } from 'svelte/attachments';

	/** A single presenter publishing a camera feed. */
	interface Publisher {
		id: string;
		name?: string;
		track?: MediaStreamTrack | null;
	}

	interface Props {
		publishers: Publisher[];
		onClose?: (id: string) => void;
	}

	let { publishers, onClose }: Props = $props();

	/**
	 * Attach a publisher's MediaStreamTrack to a <video> via `srcObject`.
	 * Returns an attachment so each card's video element is wired up
	 * declaratively and re-runs when the track changes; the MediaStream is
	 * created per attachment and the video is detached on teardown so there
	 * are no dangling references when a presenter leaves.
	 */
	function attachTrack(track: MediaStreamTrack | null | undefined): Attachment<HTMLVideoElement> {
		return (video) => {
			// Guard SSR — MediaStream only exists in the browser.
			if (typeof window === 'undefined' || typeof MediaStream === 'undefined') {
				return;
			}
			if (track) {
				video.srcObject = new MediaStream([track]);
			} else {
				video.srcObject = null;
			}
			return () => {
				video.srcObject = null;
			};
		};
	}
</script>

{#if publishers.length === 0}
	<div class="empty">No presenters</div>
{:else}
	<div class="holder">
		{#each publishers as publisher (publisher.id)}
			<div class="card">
				<video {@attach attachTrack(publisher.track)} autoplay muted playsinline></video>

				<div class="overlay">
					<span class="name" title={publisher.name ?? 'Presenter'}>
						{publisher.name ?? 'Presenter'}
					</span>
					{#if onClose}
						<button
							class="close"
							type="button"
							aria-label={`Close ${publisher.name ?? 'presenter'} camera`}
							title="Close"
							onclick={() => onClose?.(publisher.id)}
						>
							<XIcon size={14} weight="bold" />
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.empty {
		padding: 0.4rem 0.6rem;
		font-size: 0.75rem;
		color: var(--text-dim);
	}

	.holder {
		display: flex;
		flex-wrap: wrap;
		/* Reference wrapper: justify-content-center align-items-end w-100 — cards
		   are horizontally centered, wrap, and bottom-align in the holder. */
		justify-content: center;
		align-items: flex-end;
		width: 100%;
		gap: 0.5rem;
		padding: 0.5rem;
	}

	.card {
		position: relative;
		/* Fixed aspect ratio so cards reserve their space before the stream
		   attaches — no layout shift when srcObject is set. */
		aspect-ratio: 16 / 9;
		width: 180px;
		background: var(--bg-elev-2, #1c2230);
		border: 1px solid var(--border, #28303f);
		border-radius: var(--radius, 10px);
		overflow: hidden;
	}

	video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: #000;
	}

	.overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.4rem;
		padding: 0.25rem 0.4rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0));
	}

	.name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.75rem;
		font-weight: 600;
		color: #fff;
	}

	.close {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.15rem;
		line-height: 0;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 999px;
		color: #fff;
	}
	.close:hover {
		background: var(--negative, #ea3943);
		border-color: var(--negative, #ea3943);
	}
	.close:focus-visible {
		outline: 2px solid var(--accent, #3b82f6);
		outline-offset: 1px;
	}
</style>
