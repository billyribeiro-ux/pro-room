<script lang="ts">
	import { SpeakerHighIcon } from 'phosphor-svelte';

	interface Props {
		/** The currently-playing media for everyone, or null when nothing is playing. */
		media: { kind: 'soundcloud' | 'youtube'; url: string } | null;
		/** Background volume, 0-100. Defaults to 70 (matches the reference). */
		volume?: number;
		/** Fired when the viewer drags the volume slider. */
		onVolume?: (v: number) => void;
	}

	let { media, volume = 70, onVolume }: Props = $props();

	const uid = $props.id();

	// Extract a YouTube video id from the common URL shapes:
	//   https://youtu.be/<id>
	//   https://www.youtube.com/watch?v=<id>
	//   https://www.youtube.com/embed/<id>
	// Returns null if no id can be found.
	function youtubeId(url: string): string | null {
		try {
			const u = new URL(url);
			const host = u.hostname.replace(/^www\./, '');
			if (host === 'youtu.be') {
				return u.pathname.slice(1).split('/')[0] || null;
			}
			if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
				if (u.pathname === '/watch') return u.searchParams.get('v');
				const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
				if (embed) return embed[1];
				const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
				if (shorts) return shorts[1];
			}
			return null;
		} catch {
			return null;
		}
	}

	// Build the embed src for whichever provider is active. `null` means we can't
	// build a valid embed (e.g. a malformed YouTube URL) — the template renders
	// nothing in that case rather than a broken iframe.
	const embedSrc = $derived.by<string | null>(() => {
		if (!media) return null;
		if (media.kind === 'soundcloud') {
			return `https://w.soundcloud.com/player/?url=${encodeURIComponent(media.url)}&auto_play=true`;
		}
		const id = youtubeId(media.url);
		return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
	});

	// NOTE ON VOLUME (v1 limitation):
	// The iframe embeds run cross-origin, so we cannot directly set their audio
	// volume from here. Real volume control requires each provider's JS API
	// (YT.Player / SC.Widget) loaded over postMessage, which is out of scope for
	// v1. The slider therefore reports the chosen level via `onVolume` (so the
	// lead can persist / broadcast it and wire the player APIs later), but the
	// audible output is whatever the embed plays at. The slider is functional
	// state, not a no-op — it just isn't applied to the cross-origin audio yet.
	function onInput(e: Event) {
		const v = Number((e.currentTarget as HTMLInputElement).value);
		onVolume?.(v);
	}
</script>

{#if embedSrc}
	<div class="player">
		<div class="frame" class:soundcloud={media?.kind === 'soundcloud'}>
			<iframe
				title={media?.kind === 'youtube' ? 'YouTube player' : 'SoundCloud player'}
				src={embedSrc}
				width="100%"
				height={media?.kind === 'youtube' ? '180' : '120'}
				frameborder="0"
				allow="autoplay; encrypted-media"
				allowfullscreen
			></iframe>
		</div>

		<div class="volume">
			<label for="{uid}-vol" class="vol-label">
				<SpeakerHighIcon size={16} />
				<span>Background Volume</span>
			</label>
			<input
				id="{uid}-vol"
				type="range"
				min="0"
				max="100"
				step="1"
				value={volume}
				oninput={onInput}
				aria-label="Background volume"
			/>
			<span class="vol-value">{volume}</span>
		</div>
	</div>
{/if}

<style>
	.player {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.6rem;
	}
	.frame {
		/* Reserve space up front so the loading iframe doesn't shift layout. */
		width: 100%;
		min-height: 180px;
		border-radius: var(--radius);
		overflow: hidden;
		background: #000;
	}
	.frame.soundcloud {
		min-height: 120px;
	}
	.frame iframe {
		display: block;
		border: 0;
	}
	.volume {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--text-dim);
	}
	.vol-label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.vol-label :global(svg) {
		color: var(--accent);
		flex: 0 0 auto;
	}
	.volume input[type='range'] {
		flex: 1;
		accent-color: var(--accent);
	}
	.vol-value {
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		min-width: 2ch;
		text-align: right;
	}
</style>
