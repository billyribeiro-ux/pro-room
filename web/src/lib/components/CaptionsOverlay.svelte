<script lang="ts">
	import { fade } from 'svelte/transition';
	import { setPref } from '$lib/stores/prefs.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		/** Render the caption bar (the viewer's CC toggle). */
		active: boolean;
		/** Run local speech-recognition + emit finalized phrases (presenter only). */
		capture?: boolean;
		/** Broadcast caption speaker (from the WS Caption event). */
		speaker?: string;
		/** Broadcast caption text (from the WS Caption event). */
		text?: string;
		/** Called once per finalized phrase so the presenter can broadcast it. */
		onCaption?: (finalText: string) => void;
	}

	let { active, capture = false, speaker, text, onCaption }: Props = $props();

	// The presenter's own in-progress phrase (shown locally before it round-trips).
	let interimText = $state('');
	// null = not yet feature-detected; true/false after the effect runs.
	let supported = $state<boolean | null>(null);

	// The broadcast caption wins (every viewer sees the presenter's); the capturing
	// presenter also sees their own interim immediately.
	const shownText = $derived((text ?? interimText).trim());
	const shownSpeaker = $derived(text ? speaker : undefined);

	// ── History mode (reference .speech-reco-overlay: scrollback with per-line
	// timestamps + hover-revealed close/history round buttons —
	// file-1-part-D.md:141-156). ────────────────────────────────────────────────
	interface CaptionLine {
		at: string;
		speaker?: string;
		text: string;
	}
	let history = $state<CaptionLine[]>([]);
	let historyMode = $state(false);
	let lastSeen = '';
	$effect(() => {
		const t = (text ?? '').trim();
		if (!t || t === lastSeen) return;
		lastSeen = t;
		const at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		history = [...history, { at, speaker, text: t }].slice(-200);
	});

	// Minimal structural types for the Web Speech API (not in every TS DOM config).
	type RecognitionResultEvent = {
		resultIndex: number;
		results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
	};
	type Recognition = {
		continuous: boolean;
		interimResults: boolean;
		onresult: ((event: RecognitionResultEvent) => void) | null;
		onend: (() => void) | null;
		onerror: (() => void) | null;
		start: () => void;
		stop: () => void;
	};

	$effect(() => {
		// Only the presenter captures, and only while captions are on. Re-runs when
		// `active`/`capture` flip; teardown stops the recognizer.
		if (!active || !capture) return;
		if (typeof window === 'undefined') return;

		const win = window as unknown as {
			SpeechRecognition?: new () => Recognition;
			webkitSpeechRecognition?: new () => Recognition;
		};
		const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
		if (!Ctor) {
			supported = false;
			return;
		}
		supported = true;

		const recognition: Recognition = new Ctor();
		recognition.continuous = true;
		recognition.interimResults = true;
		let stopped = false;

		recognition.onresult = (event: RecognitionResultEvent) => {
			let interim = '';
			for (let i = event.resultIndex; i < event.results.length; i += 1) {
				const result = event.results[i];
				const chunk = result[0]?.transcript ?? '';
				if (result.isFinal) {
					const trimmed = chunk.trim();
					// Broadcast each finalized phrase (the presenter's client POSTs it).
					if (trimmed) onCaption?.(trimmed);
				} else {
					interim += chunk;
				}
			}
			interimText = interim;
		};
		// Recognition auto-stops after silence; restart while still capturing.
		recognition.onend = () => {
			if (!stopped) {
				try {
					recognition.start();
				} catch {
					// start() throws if already started; safe to ignore.
				}
			}
		};
		recognition.onerror = () => {
			// Swallow transient errors (no-speech, network); onend restarts.
		};
		try {
			recognition.start();
		} catch {
			// Already started or blocked; onerror / onend recover.
		}

		return () => {
			stopped = true;
			recognition.onresult = null;
			recognition.onend = null;
			recognition.onerror = null;
			try {
				recognition.stop();
			} catch {
				// Ignore — may already be stopped.
			}
			interimText = '';
		};
	});
</script>

{#if active}
	{#if supported === false && capture}
		<div class="cc-note" transition:fade={{ duration: 120 }}>
			Captions not supported in this browser
		</div>
	{:else if shownText || (historyMode && history.length > 0)}
		<!-- Reference .speech-reco-overlay: bottom strip on #000c with 22px white
		     lines; hovering reveals 28px round white-border close + history buttons;
		     history mode scrolls back with a 60px timestamp column
		     (file-1-part-D.md:141-156). -->
		<div class="cc-bar" role="status" aria-live="polite" transition:fade={{ duration: 120 }}>
			<div class="cc-tools">
				<button
					type="button"
					class="cc-round"
					aria-pressed={historyMode}
					title={historyMode ? 'Live caption' : 'Caption history'}
					aria-label="Caption history"
					onclick={() => (historyMode = !historyMode)}
				>
					<Icon name="history" size={13} />
				</button>
				<button
					type="button"
					class="cc-round"
					title="Close captions"
					aria-label="Close captions"
					onclick={() => setPref('captionsOverlay', false)}
				>
					<Icon name="times" size={13} />
				</button>
			</div>
			{#if historyMode}
				<ul class="cc-history">
					{#each history as line, i (i)}
						<li>
							<span class="cc-time">{line.at}</span>
							<span class="cc-line"
								>{#if line.speaker}<strong>{line.speaker}:</strong>
								{/if}{line.text}</span
							>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="cc-live">
					<Icon name="closed-captioning" size={18} />
					<p class="cc-text">
						{#if shownSpeaker}<strong>{shownSpeaker}:</strong>
						{/if}{shownText}
					</p>
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
	/* Reference .speech-reco-overlay: absolute bottom strip, bg #000c,
	   z-index 9999, white 22px lines (file-1-part-D.md:141-156; presenter
	   capture stylesheet @771222). */
	.cc-bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.65rem 1.1rem;
		background: rgba(0, 0, 0, 0.8);
	}
	.cc-bar :global(i) {
		color: #fff;
		flex: 0 0 auto;
		margin-top: 2px;
	}
	/* Hover-revealed round tool buttons: 28px, 1px solid #fff, circular. */
	.cc-tools {
		position: absolute;
		top: -14px;
		right: 10px;
		display: flex;
		gap: 6px;
		opacity: 0;
		transition: opacity 0.15s ease;
	}
	.cc-bar:hover .cc-tools,
	.cc-bar:focus-within .cc-tools {
		opacity: 1;
	}
	.cc-round {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid #fff;
		background: rgba(0, 0, 0, 0.8);
		color: #fff;
		cursor: pointer;
		padding: 0;
	}
	.cc-live {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}
	.cc-text {
		margin: 0;
		color: #fff;
		/* Reference caption lines are 22px (file-1-part-D.md:150). */
		font-size: 22px;
		font-weight: 400;
		line-height: 1.3;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
		/* Cap at ~3 lines of caption text. */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.cc-text strong {
		font-weight: 700;
	}
	.cc-history {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 180px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.cc-history li {
		display: flex;
		align-items: baseline;
		gap: 8px;
		color: #fff;
		font-size: 22px;
		line-height: 1.3;
	}
	/* Reference per-line timestamp column is 60px (file-1-part-D.md:152). */
	.cc-time {
		flex: 0 0 60px;
		font-size: 12px;
		color: #ccc;
	}
	.cc-line strong {
		font-weight: 700;
	}
	.cc-note {
		position: absolute;
		left: 50%;
		bottom: 1.5rem;
		transform: translateX(-50%);
		z-index: 20;
		padding: 0.35rem 0.7rem;
		background: rgba(0, 0, 0, 0.6);
		border-radius: var(--radius);
		color: #fff;
		font-size: 0.8rem;
		pointer-events: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.cc-bar,
		.cc-note {
			transition: none;
		}
	}
</style>
