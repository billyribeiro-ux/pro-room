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
		<div
			class="cc-bar"
			class:history={historyMode}
			role="status"
			aria-live="polite"
			transition:fade={{ duration: 120 }}
		>
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
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS .speech-reco-overlay
	   line 199 + Resolved lines 349-353): absolute bottom strip, bg #000c
	   (rgba(0,0,0,.8)), padding 12px 20px, z-index 9999, max-height 40vh,
	   overflow-y auto, min-height 48px, flex row, gap 12px, space-between. */
	.cc-bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		min-height: 48px;
		max-height: 40vh;
		overflow-y: auto;
		gap: 12px;
		padding: 12px 20px;
		background: rgba(0, 0, 0, 0.8);
	}
	.cc-bar.history {
		flex-direction: column;
		align-items: stretch;
	}
	.cc-bar :global(i) {
		color: #fff;
		flex: 0 0 auto;
		margin-top: 2px;
	}
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS lines 216-218 + §States
	   line 373): .speech-reco-buttons is display:none at rest and revealed on
	   overlay hover. We animate opacity (equivalent reveal, keeps focus-within
	   keyboard access) rather than display:none↔flex. */
	.cc-tools {
		display: flex;
		gap: 8px;
		flex: 0 0 auto;
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	.cc-bar:hover .cc-tools,
	.cc-bar:focus-within .cc-tools {
		opacity: 1;
	}
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS line 219 + Resolved
	   line 358): .speech-reco-close-btn / -history-btn = 28x28, background
	   transparent, 2px solid #fff, border-radius 50%, #fff, font-size 14px. */
	.cc-round {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid #fff;
		background: transparent;
		color: #fff;
		font-size: 14px;
		cursor: pointer;
		padding: 0;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}
	.cc-live {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS .speech-reco-icon
	   line 226 + Resolved line 356): font-size 18px, opacity .8. */
	.cc-live :global(i) {
		opacity: 0.8;
	}
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS .speech-reco-line
	   line 225 + Resolved lines 354-355): color #fff, font-size 22px,
	   font-weight 400, line-height 1.4, apple system font stack. */
	.cc-text {
		margin: 0;
		color: #fff;
		font-size: 22px;
		font-weight: 400;
		line-height: 1.4;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		word-wrap: break-word;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
		/* Cap at ~3 lines of caption text. */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS .speech-reco-sender
	   line 227 + Resolved line 357): font-weight 600, margin-right 8px. */
	.cc-text strong {
		font-weight: 600;
		margin-right: 8px;
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
		/* Reference history lines are 16px (live caption stays 22px). */
		font-size: 16px;
		line-height: 1.3;
	}
	/* Reference per-line timestamp column is 60px, 14px (file-1-part-D.md:152). */
	.cc-time {
		flex: 0 0 60px;
		font-size: 14px;
		color: #ccc;
	}
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS .speech-reco-sender
	   line 227): sender is font-weight 600. */
	.cc-line strong {
		font-weight: 600;
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
	/* HARD EVIDENCE (decoded webcams-stage.md §Scoped CSS lines 230-232 + §States
	   line 376): responsive caption font 22px → 20px (≤1200) → 16px (≤768) →
	   14px (≤480); icon 18→18→14→12; overlay padding tightens; max-height drops
	   to 30vh at ≤480. */
	@media only screen and (max-width: 1200px) {
		.cc-text {
			font-size: 20px;
		}
	}
	@media only screen and (max-width: 768px) {
		.cc-bar {
			padding: 12px 16px;
		}
		.cc-text {
			font-size: 16px;
		}
		.cc-live :global(i) {
			font-size: 14px !important;
		}
	}
	@media only screen and (max-width: 480px) {
		.cc-bar {
			padding: 12px;
			max-height: 30vh;
		}
		.cc-live {
			gap: 8px;
		}
		.cc-text {
			font-size: 14px;
		}
		.cc-live :global(i) {
			font-size: 12px !important;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cc-bar,
		.cc-note,
		.cc-tools,
		.cc-round {
			transition: none;
		}
	}
</style>
