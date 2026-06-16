<script lang="ts">
	import Icon from './Icon.svelte';

	interface Props {
		/** The currently-playing media for everyone, or null when nothing is playing. */
		media: { kind: 'soundcloud' | 'youtube' | 'mp3' | 'video'; url: string } | null;
		/** Background volume, 0-100. Defaults to 70 (matches the reference). */
		volume?: number;
		/** Fired when the viewer drags the volume slider. */
		onVolume?: (v: number) => void;
	}

	let { media, volume = 70, onVolume }: Props = $props();

	const uid = $props.id();

	// The active <audio>/<video> element for direct-media kinds (mp3/video).
	// `null` for the cross-origin iframe kinds (soundcloud/youtube), which have
	// no element we can control. `bind:this` populates this after mount.
	let mediaEl = $state<HTMLMediaElement | null>(null);

	// Direct DOM side-effect (NOT state-syncing): push the slider's 0-100 value
	// onto the real <audio>/<video> element's `volume` property (0-1) whenever
	// either the volume or the element changes. This is the legitimate $effect
	// escape hatch the Svelte docs describe for direct DOM manipulation — the
	// autofixer may flag it as a candidate for $derived, but there is no derived
	// VALUE here, only an imperative write to a DOM node, so we keep it.
	$effect(() => {
		if (mediaEl) {
			mediaEl.volume = volume / 100;
		}
	});

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

	// Read an optional start offset (whole seconds) from a YouTube URL's `t` or
	// `start` param. Accepts plain seconds ("90", "90s") or YouTube's h/m/s form
	// ("1m30s", "1h2m3s"). The presenter's "Start at" choice rides along in the
	// broadcast URL as `t=<sec>` (see PlayYouTubeModal), so the embed can seek to it.
	function youtubeStart(url: string): number | null {
		try {
			const params = new URL(url).searchParams;
			const raw = params.get('start') ?? params.get('t');
			if (!raw) return null;
			const sec = raw.match(/^(\d+)s?$/);
			if (sec) return Number(sec[1]) || null;
			const m = raw.toLowerCase().match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
			if (m && (m[1] || m[2] || m[3])) {
				return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) || null;
			}
			return null;
		} catch {
			return null;
		}
	}

	// Build the embed src for whichever iframe provider is active. `null` means
	// either this isn't an iframe kind, or we can't build a valid embed (e.g. a
	// malformed YouTube URL) — the template renders nothing in that case rather
	// than a broken iframe.
	const embedSrc = $derived.by<string | null>(() => {
		if (!media) return null;
		if (media.kind === 'soundcloud') {
			return `https://w.soundcloud.com/player/?url=${encodeURIComponent(media.url)}&auto_play=true`;
		}
		if (media.kind === 'youtube') {
			const id = youtubeId(media.url);
			if (!id) return null;
			const start = youtubeStart(media.url);
			return `https://www.youtube.com/embed/${id}?autoplay=1${start ? `&start=${start}` : ''}`;
		}
		return null;
	});

	// Whether the active media is a direct file we render with a native element
	// (and can therefore actually control the volume of).
	const isDirect = $derived(media?.kind === 'mp3' || media?.kind === 'video');

	// NOTE ON VOLUME:
	// For direct media (mp3/video) the slider is REAL — the $effect above writes
	// `volume / 100` onto the bound <audio>/<video> element, so dragging it
	// actually changes the audible output.
	//
	// For the iframe embeds (soundcloud/youtube) it remains best-effort only:
	// those run cross-origin, so we cannot directly set their audio volume from
	// here. Real volume control there requires each provider's JS API
	// (YT.Player / SC.Widget) loaded over postMessage, which is out of scope.
	// The slider therefore reports the chosen level via `onVolume` (so the lead
	// can persist / broadcast it and wire the player APIs later), but the audible
	// output is whatever the embed plays at. The slider is functional state, not
	// a no-op — it just isn't applied to the cross-origin audio yet.
	function onInput(e: Event) {
		const v = Number((e.currentTarget as HTMLInputElement).value);
		onVolume?.(v);
	}
</script>

{#if media && (embedSrc || isDirect)}
	<div class="player">
		{#if embedSrc}
			<div class="frame" class:soundcloud={media.kind === 'soundcloud'}>
				<iframe
					title={media.kind === 'youtube' ? 'YouTube player' : 'SoundCloud player'}
					src={embedSrc}
					width="100%"
					height={media.kind === 'youtube' ? '180' : '120'}
					frameborder="0"
					allow="autoplay; encrypted-media"
					allowfullscreen
				></iframe>
			</div>
		{:else if media.kind === 'mp3'}
			<!-- Direct audio. Native controls handle play/seek; the volume slider
			     below writes element.volume via the $effect. `bind:this` exposes
			     the element so that effect can reach it. -->
			<audio
				bind:this={mediaEl}
				src={media.url}
				controls
				autoplay
				class="audio"
				title="Audio player"
			></audio>
		{:else if media.kind === 'video'}
			<!-- Direct video. Wrapper reserves a 16/9 box up front so the loading
			     <video> doesn't shift layout (CLS). Same real volume wiring. -->
			<div class="video-frame">
				<video
					bind:this={mediaEl}
					src={media.url}
					controls
					autoplay
					playsinline
					title="Video player"
				>
					<!-- Broadcast URLs are arbitrary direct files with no caption
					     sidecar, so we ship an empty captions track to satisfy the
					     a11y rule without claiming captions we don't have. -->
					<track kind="captions" />
				</video>
			</div>
		{/if}

		<div class="volume">
			<label for="{uid}-vol" class="vol-label">
				<Icon name="volume-up" />
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
	.audio {
		display: block;
		width: 100%;
	}
	.video-frame {
		/* Reserve a 16/9 box up front so the loading <video> doesn't shift layout. */
		width: 100%;
		max-width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: var(--radius);
		overflow: hidden;
		background: #000;
	}
	.video-frame video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
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
	.vol-label :global(svg),
	.vol-label :global(i) {
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
