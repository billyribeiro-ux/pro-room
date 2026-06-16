/**
 * DND-aware notification sounds for the trading room.
 *
 * No audio asset files are shipped — every cue is a short synthesised WebAudio
 * tone (a gentle sine with a quick attack/decay envelope, ~120–200ms). Each
 * `SoundKind` maps to a Do Not Disturb channel; before playing, the service
 * consults the `dnd` store (`$lib/stores/dnd.svelte`) and returns silently if
 * that channel is muted.
 *
 * Usage (the lead wires the call sites):
 *   import { playSound } from '$lib/sound.svelte';
 *   playSound('alert'); // suppressed when dnd.app || dnd.alert
 *
 * The kind → DND-channel mapping (which flag suppresses which sound):
 *   alert       → 'alert'
 *   qa          → 'qa'
 *   chat        → 'chat'
 *   nta         → 'nonTradeAlert'
 *   reaction    → 'chat'
 *   recordStart → (master only — gated on dnd.app)
 *   recordStop  → (master only — gated on dnd.app)
 *
 * `recordStart` / `recordStop` are presenter-side controls with no dedicated
 * channel, so they are gated on the master `dnd.app` switch only.
 */
import { browser } from '$app/environment';
import { dnd, isMuted, type DndKey } from './stores/dnd.svelte';

/** A notification sound cue. */
export type SoundKind = 'alert' | 'qa' | 'chat' | 'nta' | 'reaction' | 'recordStart' | 'recordStop';

/** A synthesised tone: base frequency (Hz), duration (s), and peak gain. */
interface Tone {
	freq: number;
	duration: number;
	gain: number;
}

/**
 * Per-kind tone recipe. Distinct frequencies/durations keep the cues
 * recognisable; durations sit in the ~120–200ms range the brief calls for.
 */
const TONES: Record<SoundKind, Tone> = {
	alert: { freq: 880, duration: 0.16, gain: 0.18 },
	qa: { freq: 660, duration: 0.18, gain: 0.16 },
	chat: { freq: 520, duration: 0.12, gain: 0.14 },
	nta: { freq: 740, duration: 0.17, gain: 0.16 },
	reaction: { freq: 988, duration: 0.12, gain: 0.13 },
	recordStart: { freq: 587, duration: 0.2, gain: 0.16 },
	recordStop: { freq: 392, duration: 0.2, gain: 0.16 }
};

/**
 * The DND channel that suppresses each cue, or `null` for cues gated on the
 * master `dnd.app` switch only (no dedicated channel).
 */
const CHANNEL: Record<SoundKind, DndKey | null> = {
	alert: 'alert',
	qa: 'qa',
	chat: 'chat',
	nta: 'nonTradeAlert',
	reaction: 'chat',
	recordStart: null,
	recordStop: null
};

/**
 * Resolve the constructor for AudioContext, tolerating the prefixed
 * `webkitAudioContext` on older WebKit. Returns `undefined` when WebAudio is
 * unavailable so callers can degrade gracefully.
 */
function getAudioContextCtor(): typeof AudioContext | undefined {
	if (!browser) return undefined;
	if (typeof AudioContext !== 'undefined') return AudioContext;
	const prefixed = (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	return prefixed;
}

/**
 * Lazily-created shared AudioContext, reused across plays to avoid leaking a
 * fresh context (and its hardware resource) on every notification. Created on
 * first successful play; `null` until then or if WebAudio is unavailable.
 */
let ctx: AudioContext | null = null;

/** Get (or lazily create) the shared AudioContext, or `null` if unavailable. */
function getContext(): AudioContext | null {
	if (ctx) return ctx;
	const Ctor = getAudioContextCtor();
	if (!Ctor) return null;
	try {
		ctx = new Ctor();
		return ctx;
	} catch {
		return null;
	}
}

/**
 * Play the notification sound for `kind`, unless its DND channel (or the master
 * `dnd.app` switch) is muted. Safe to call in any environment: it no-ops on the
 * server and degrades gracefully when WebAudio is unavailable.
 */
export function playSound(kind: SoundKind): void {
	if (!browser) return;

	const channel = CHANNEL[kind];
	// Cues with a dedicated channel are gated via `isMuted` (which also folds in
	// the master `app` switch). Channel-less cues are gated on `app` directly.
	if (channel ? isMuted(channel) : dnd.app) return;

	const audio = getContext();
	if (!audio) return;

	// A previously-created context can be suspended (autoplay policy); nudge it.
	if (audio.state === 'suspended') {
		void audio.resume().catch(() => {
			// If resume is rejected the tone simply won't be audible; ignore.
		});
	}

	const tone = TONES[kind];

	try {
		const now = audio.currentTime;
		const osc = audio.createOscillator();
		const envelope = audio.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(tone.freq, now);

		// Quick attack to peak gain, then exponential decay to near-silence.
		envelope.gain.setValueAtTime(0, now);
		envelope.gain.linearRampToValueAtTime(tone.gain, now + 0.012);
		envelope.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);

		osc.connect(envelope);
		envelope.connect(audio.destination);

		osc.start(now);
		osc.stop(now + tone.duration);

		// Release the per-play nodes once the tone has finished.
		osc.onended = () => {
			osc.disconnect();
			envelope.disconnect();
		};
	} catch {
		// Node creation / scheduling failed; degrade silently.
	}
}
