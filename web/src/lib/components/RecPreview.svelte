<script lang="ts">
	import { API_URL } from '$lib/config';
	import {
		ArrowsOutIcon,
		ArrowsInIcon,
		XIcon,
		RecordIcon,
		StopIcon,
		DownloadSimpleIcon,
		UploadSimpleIcon,
		ArrowCounterClockwiseIcon,
		TrashIcon,
		CheckCircleIcon
	} from 'phosphor-svelte';

	interface Props {
		open: boolean;
		roomId: string;
		onClose: () => void;
	}
	let { open, roomId, onClose }: Props = $props();

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
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		recorder = null;
		recording = false;
	}

	async function start() {
		error = null;
		saved = false;
		recordedBlob = null;
		try {
			stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
			stream.getVideoTracks()[0]?.addEventListener('ended', stop);
			chunks = [];
			recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunks.push(e.data);
			};
			recorder.onstop = () => {
				recordedBlob = new Blob(chunks, { type: 'video/webm' });
				recordedSecs = elapsed;
			};
			recorder.start(1000);
			recording = true;
			elapsed = 0;
			timer = setInterval(() => (elapsed += 1), 1000);
		} catch (err) {
			error =
				err instanceof Error && err.name === 'NotAllowedError'
					? 'Permission denied.'
					: 'Could not start recording.';
			stopTracks();
		}
	}

	function stop() {
		if (recorder && recorder.state !== 'inactive') recorder.stop();
		stopTracks();
	}

	function download() {
		if (!recordedBlob) return;
		const url = URL.createObjectURL(recordedBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `recording-${Date.now()}.webm`;
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
			const file = new File([recordedBlob], `recording-${Date.now()}.webm`, {
				type: 'video/webm'
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
</script>

{#if open}
	<aside class="rec" class:expanded aria-label="Recording preview">
		<header class="head">
			<span class="title">
				<span class="dot" class:live={recording}></span>
				Recording Preview <small>(delayed up to 20s)</small>
			</span>
			<div class="actions">
				<button
					type="button"
					class="ic"
					onclick={() => (expanded = !expanded)}
					aria-label={expanded ? 'Shrink' : 'Expand'}
				>
					{#if expanded}<ArrowsInIcon size={14} />{:else}<ArrowsOutIcon size={14} />{/if}
				</button>
				<button type="button" class="ic" onclick={close} aria-label="Close">
					<XIcon size={14} />
				</button>
			</div>
		</header>

		<div class="body">
			{#if recording}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video bind:this={videoEl} autoplay muted playsinline></video>
				<span class="elapsed">{mmss(elapsed)}</span>
			{:else if recordedBlob}
				<div class="review">
					<CheckCircleIcon size={26} weight="fill" />
					<p>Recorded {mmss(recordedSecs)}</p>
				</div>
			{:else}
				<p class="paused">{error ?? 'Recording paused.'}</p>
			{/if}
		</div>

		<footer class="foot">
			{#if recording}
				<button type="button" class="rec-btn stop" onclick={stop}>
					<StopIcon size={14} weight="fill" /> Stop
				</button>
			{:else if recordedBlob}
				{#if saved}
					<span class="saved"><CheckCircleIcon size={14} weight="fill" /> Saved to room files</span>
				{/if}
				<button type="button" class="mini" onclick={download} title="Download to your computer">
					<DownloadSimpleIcon size={14} /> Download
				</button>
				<button type="button" class="mini" onclick={saveToRoom} disabled={saving || saved}>
					<UploadSimpleIcon size={14} />
					{saving ? 'Saving…' : 'Save to room'}
				</button>
				<button type="button" class="mini" onclick={start} title="Record again">
					<ArrowCounterClockwiseIcon size={14} />
				</button>
				<button type="button" class="mini danger" onclick={discard} title="Discard">
					<TrashIcon size={14} />
				</button>
			{:else}
				<button type="button" class="rec-btn" onclick={start}>
					<RecordIcon size={14} weight="fill" /> Start recording
				</button>
			{/if}
		</footer>
	</aside>
{/if}

<style>
	.rec {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 60;
		width: 330px;
		background: var(--bg-elev);
		border: 1px solid var(--border);
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
		font-weight: 400;
		color: var(--text-dim);
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
