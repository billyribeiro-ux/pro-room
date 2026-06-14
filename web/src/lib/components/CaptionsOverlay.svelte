<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		/** When true, start live speech-to-text and render the caption bar. */
		active: boolean;
		/** Called once per finalized phrase, so the lead can persist transcripts. */
		onText?: (finalText: string) => void;
	}

	let { active, onText }: Props = $props();

	// Latest finalized text (accumulates) and the in-progress interim chunk.
	let finalText = $state('');
	let interimText = $state('');
	// null = not yet determined; true/false once the effect has feature-detected.
	let supported = $state<boolean | null>(null);

	const displayText = $derived([finalText, interimText].filter(Boolean).join(' ').trim());

	// Minimal structural types for the Web Speech API — the lib DOM typings don't
	// ship SpeechRecognition in every TS config, so we narrow by hand.
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
		// Re-runs whenever `active` flips. Teardown stops + nulls the instance.
		if (!active) return;

		// Guard for SSR / non-browser before touching `window`.
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

		// Tracks teardown so the auto-restart in `onend` doesn't resurrect a
		// recognizer the cleanup has already stopped.
		let stopped = false;

		recognition.onresult = (event: RecognitionResultEvent) => {
			let interim = '';
			for (let i = event.resultIndex; i < event.results.length; i += 1) {
				const result = event.results[i];
				const chunk = result[0]?.transcript ?? '';
				if (result.isFinal) {
					const trimmed = chunk.trim();
					if (trimmed) {
						finalText = finalText ? `${finalText} ${trimmed}` : trimmed;
						onText?.(trimmed);
					}
				} else {
					interim += chunk;
				}
			}
			interimText = interim;
		};

		// Recognition auto-stops after silence; restart while still active so the
		// overlay behaves as a continuous live caption track.
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
			// Swallow transient errors (e.g. no-speech, network); onend restarts.
		};

		try {
			recognition.start();
		} catch {
			// Already started or blocked; the error handler / onend cover recovery.
		}

		return () => {
			stopped = true;
			recognition.onresult = null;
			recognition.onend = null;
			recognition.onerror = null;
			try {
				recognition.stop();
			} catch {
				// Ignore — instance may already be stopped.
			}
			// Reset transcript so a later re-activation starts clean.
			finalText = '';
			interimText = '';
		};
	});
</script>

{#if active}
	{#if supported === false}
		<div class="cc-note" transition:fade={{ duration: 120 }}>
			Captions not supported in this browser
		</div>
	{:else if displayText}
		<div class="cc-bar" role="status" aria-live="polite" transition:fade={{ duration: 120 }}>
			<p class="cc-text">{displayText}</p>
		</div>
	{/if}
{/if}

<style>
	.cc-bar {
		position: absolute;
		left: 50%;
		bottom: 1.5rem;
		transform: translateX(-50%);
		max-width: min(90%, 60ch);
		z-index: 20;
		padding: 0.5rem 0.9rem;
		background: rgba(0, 0, 0, 0.72);
		border-radius: var(--radius);
		pointer-events: none;
	}
	.cc-text {
		margin: 0;
		color: #fff;
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.4;
		text-align: center;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
		/* Cap the bar at ~3 lines of readable caption text. */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
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
