<script lang="ts">
	import { fade } from 'svelte/transition';
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
	{:else if shownText}
		<!-- Reference caption bar: a full-width strip across the bottom of the stage,
		     CC icon + bold speaker + the phrase. -->
		<div class="cc-bar" role="status" aria-live="polite" transition:fade={{ duration: 120 }}>
			<Icon name="closed-captioning" size={18} />
			<p class="cc-text">
				{#if shownSpeaker}<strong>{shownSpeaker}:</strong> {/if}{shownText}
			</p>
		</div>
	{/if}
{/if}

<style>
	/* Reference: a full-width strip pinned to the bottom of the presentation area,
	   left-aligned, over a translucent dark backdrop (kept our overlay colour). */
	.cc-bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.65rem 1.1rem;
		background: rgba(0, 0, 0, 0.72);
		pointer-events: none;
	}
	.cc-bar :global(i) {
		color: #fff;
		flex: 0 0 auto;
		margin-top: 2px;
	}
	.cc-text {
		margin: 0;
		color: #fff;
		font-size: 1.25rem;
		font-weight: 400;
		line-height: 1.4;
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
