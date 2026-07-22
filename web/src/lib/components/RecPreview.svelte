<script lang="ts">
	import { API_URL } from '$lib/config';
	import { playSound } from '$lib/sound.svelte';
	import { onDestroy } from 'svelte';
	import Icon from './Icon.svelte';

	interface Props {
		open: boolean;
		roomId: string;
		onClose: () => void;
		/** Lifted recording flag — drives the top-nav [ REC ] indicator
		    (reference li.recIndicator, report.md:1957). */
		onRecordingChange?: (recording: boolean) => void;
		/** The live local broadcast to record (share video + audio). When it
		    returns a stream, recording uses IT — no second screen picker (the
		    reference records the already-running broadcast). Null → fall back to
		    getDisplayMedia. */
		source?: () => MediaStream | null;
	}
	let { open, roomId, onClose, onRecordingChange, source }: Props = $props();

	// Client-side screen recording (v1): captures the presenter's screen via
	// getDisplayMedia → MediaRecorder. On stop you can DOWNLOAD the .webm to your
	// computer and/or SAVE it to the room's files (upload later). Server-side
	// LiveKit Egress (room composite → your storage) is the Phase-2 upgrade.
	let recording = $state(false);
	let expanded = $state(false);
	let error = $state<string | null>(null);
	let elapsed = $state(0);
	let videoEl = $state<HTMLVideoElement | null>(null);

	// Post-recording review state.
	let recordedBlob = $state<Blob | null>(null);
	let recordedSecs = $state(0);
	let saving = $state(false);
	let saved = $state(false);

	let stream: MediaStream | null = null;
	// False when `stream` wraps the LIVE broadcast tracks — stopping the
	// recording must NOT stop those tracks (it would kill the running share).
	let ownsStream = true;
	let recorder: MediaRecorder | null = null;
	let chunks: Blob[] = [];
	let timer: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (videoEl) videoEl.srcObject = recording ? stream : null;
	});

	function stopTracks() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		if (ownsStream) stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		recorder = null;
		if (recording) onRecordingChange?.(false);
		recording = false;
	}

	// The container MUST be feature-detected: Safari's MediaRecorder rejects
	// `video/webm` outright (NotSupportedError), which silently killed recording
	// there. First supported candidate wins; no candidate → browser default.
	const MIME_CANDIDATES = [
		'video/webm;codecs=vp9,opus',
		'video/webm;codecs=vp8,opus',
		'video/webm',
		'video/mp4'
	];
	function pickMime(): string | undefined {
		if (typeof MediaRecorder === 'undefined') return undefined;
		return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m));
	}
	/** File extension for the ACTUAL recorded container. */
	let recordedExt = 'webm';

	async function start() {
		error = null;
		saved = false;
		recordedBlob = null;
		try {
			// Record the LIVE broadcast when one is running (no second picker —
			// reference behavior); only prompt when nothing is being shared.
			const live = source?.() ?? null;
			ownsStream = !live;
			stream = live ?? (await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }));
			stream.getVideoTracks()[0]?.addEventListener('ended', stop);
			chunks = [];
			const mime = pickMime();
			recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
			const actualMime = recorder.mimeType || mime || 'video/webm';
			recordedExt = /mp4/.test(actualMime) ? 'mp4' : 'webm';
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunks.push(e.data);
			};
			recorder.onstop = () => {
				recordedBlob = new Blob(chunks, { type: actualMime });
				recordedSecs = elapsed;
			};
			recorder.start(1000);
			recording = true;
			onRecordingChange?.(true);
			// Recording-start cue (reference recordingStartSound), gated by the
			// Settings "Start recording sound" preference inside playSound.
			playSound('recordStart');
			elapsed = 0;
			timer = setInterval(() => (elapsed += 1), 1000);
		} catch (err) {
			// Fail loud with the REAL reason (permission vs unsupported vs other) —
			// the generic message hid a Safari NotSupportedError for months.
			error =
				err instanceof Error && err.name === 'NotAllowedError'
					? 'Permission denied.'
					: err instanceof Error
						? `Could not start recording: ${err.name} ${err.message}`
						: 'Could not start recording.';
			stopTracks();
		}
	}

	function stop() {
		const wasRecording = !!recorder && recorder.state !== 'inactive';
		if (recorder && recorder.state !== 'inactive') recorder.stop();
		stopTracks();
		// Recording-stop cue (reference recordingStopSound), gated by the Settings
		// "Stop recording sound" preference inside playSound.
		if (wasRecording) playSound('recordStop');
	}

	function download() {
		if (!recordedBlob) return;
		const url = URL.createObjectURL(recordedBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `recording-${Date.now()}.${recordedExt}`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	// Upload the recording to the room's files so it can be shared later.
	async function saveToRoom() {
		if (!recordedBlob) return;
		saving = true;
		error = null;
		try {
			const file = new File([recordedBlob], `recording-${Date.now()}.${recordedExt}`, {
				type: recordedBlob.type || 'video/webm'
			});
			const form = new FormData();
			form.append('file', file);
			const res = await fetch(`${API_URL}/api/rooms/${roomId}/files`, {
				method: 'POST',
				credentials: 'include',
				body: form
			});
			if (!res.ok) throw new Error('upload failed');
			saved = true;
		} catch {
			error = 'Could not save to room files.';
		} finally {
			saving = false;
		}
	}

	function discard() {
		recordedBlob = null;
		saved = false;
		error = null;
	}

	function close() {
		stop();
		discard();
		onClose();
	}

	function mmss(s: number): string {
		const m = Math.floor(s / 60);
		const r = s % 60;
		return `${m}:${r.toString().padStart(2, '0')}`;
	}

	// Guarantee teardown if the room page unmounts mid-recording (navigating away).
	// Without this the getDisplayMedia tracks stay live (the browser keeps showing
	// the "sharing your screen" indicator) and the elapsed-timer interval leaks.
	onDestroy(() => {
		if (recorder && recorder.state !== 'inactive') recorder.stop();
		stopTracks();
	});
</script>

{#if open}
	<aside class="rec" class:expanded aria-label="Recording preview">
		<header class="head">
			<!-- Reference chrome text + controls: "Recording Preview. (DELAYED UPTO
			     20s)" with fa-expand / fa-times (components-media-misc.md:70-105). -->
			<span class="title">
				<span class="dot" class:live={recording}></span>
				Recording Preview. <small>(DELAYED UPTO 20s)</small>
			</span>
			<div class="actions">
				<button
					type="button"
					class="ic"
					onclick={() => (expanded = !expanded)}
					aria-label={expanded ? 'Shrink' : 'Expand'}
				>
					{#if expanded}<Icon name="compress" size={14} />{:else}<Icon
							name="expand"
							size={14}
						/>{/if}
				</button>
				<button type="button" class="ic" onclick={close} aria-label="Close">
					<Icon name="times" size={14} />
				</button>
			</div>
		</header>

		<div class="body">
			{#if recording}
				<video bind:this={videoEl} autoplay muted playsinline></video>
				<span class="elapsed">{mmss(elapsed)}</span>
			{:else if recordedBlob}
				<div class="review">
					<Icon name="check-circle" size={26} />
					<p>Recorded {mmss(recordedSecs)}</p>
				</div>
			{:else}
				<p class="paused">{error ?? 'Recording paused.'}</p>
			{/if}
		</div>

		<footer class="foot">
			{#if recording}
				<button type="button" class="rec-btn stop" onclick={stop}>
					<Icon name="stop" size={14} /> Stop
				</button>
			{:else if recordedBlob}
				{#if saved}
					<span class="saved"><Icon name="check-circle" size={14} /> Saved to room files</span>
				{/if}
				<button type="button" class="mini" onclick={download} title="Download to your computer">
					<Icon name="download" size={14} /> Download
				</button>
				<button type="button" class="mini" onclick={saveToRoom} disabled={saving || saved}>
					<Icon name="upload" size={14} />
					{saving ? 'Saving…' : 'Save to room'}
				</button>
				<button type="button" class="mini" onclick={start} title="Record again">
					<Icon name="undo-alt" size={14} />
				</button>
				<button type="button" class="mini danger" onclick={discard} title="Discard">
					<Icon name="trash-alt" size={14} />
				</button>
			{:else}
				<button type="button" class="rec-btn" onclick={start}>
					<Icon name="dot-circle" size={14} /> Start recording
				</button>
			{/if}
		</footer>
	</aside>
{/if}

<style>
	.rec {
		position: fixed;
		/* Reference .recsHolderScreen sits above the screenshare card
		   (bottom:265px right:0) so the two don't overlap. */
		right: 0;
		bottom: 265px;
		z-index: 1040; /* floating layer: above the z-1030 nav, below modals */
		width: 350px;
		background: #000;
		border: 1px solid #fafafa;
		border-radius: var(--radius);
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.rec.expanded {
		width: min(640px, calc(100vw - 2rem));
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.6rem;
		background: var(--bg-elev-2);
		border-bottom: 1px solid var(--border);
	}
	.title {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text);
	}
	.title small {
		font-weight: 700;
		color: #fff;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--text-dim);
		flex: 0 0 auto;
	}
	.dot.live {
		background: var(--negative);
		animation: pulse 1.4s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.dot.live {
			animation: none;
		}
	}
	.actions {
		display: inline-flex;
		gap: 0.25rem;
	}
	.ic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 6px;
		padding: 0.25rem;
		line-height: 0;
	}
	.ic:hover {
		color: var(--text);
		border-color: var(--accent);
	}
	.body {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #000000;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.body video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.elapsed {
		position: absolute;
		top: 0.4rem;
		left: 0.5rem;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
	}
	.review {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		color: var(--positive);
	}
	.review p {
		margin: 0;
		color: var(--text);
		font-size: 0.85rem;
	}
	.paused {
		margin: 0;
		color: var(--text-dim);
		font-size: 0.85rem;
	}
	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.4rem;
		padding: 0.5rem 0.6rem;
		border-top: 1px solid var(--border);
	}
	.rec-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--accent);
		border: none;
		color: #fff;
		border-radius: var(--radius);
		padding: 0.4rem 0.8rem;
		font-size: 0.8rem;
		font-weight: 700;
	}
	.rec-btn:hover {
		background: var(--accent-hover);
	}
	.rec-btn.stop {
		background: var(--negative);
	}
	.mini {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 6px;
		padding: 0.35rem 0.55rem;
		font-size: 0.76rem;
		font-weight: 600;
	}
	.mini:hover:not(:disabled) {
		border-color: var(--accent);
	}
	.mini:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.mini.danger:hover {
		border-color: var(--negative);
		color: var(--negative);
	}
	.saved {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-right: auto;
		color: var(--positive);
		font-size: 0.74rem;
		font-weight: 600;
	}
</style>
