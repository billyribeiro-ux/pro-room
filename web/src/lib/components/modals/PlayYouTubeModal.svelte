<script lang="ts">
	import Modal from '../Modal.svelte';
	import { loadVideos, saveVideos, type SavedVideo } from '$lib/youtube-list';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Current room id — scopes the saved-video list. */
		roomId: string;
		/**
		 * Broadcast a YouTube video to the whole room (presenter/admin). Maps to the
		 * reference `playVideoForAll`; wired to the existing media-for-all pipeline.
		 */
		onPlay?: (kind: 'youtube', url: string) => void;
		/** Stop the room-wide video for everyone (reference `stopVideoForAll`). */
		onStop?: () => void;
	}
	let { open, onClose, roomId, onPlay, onStop }: Props = $props();

	let url = $state('');
	let startAt = $state('');
	let error = $state('');
	// Saved-video list for this room. (Re)loaded from localStorage when the modal
	// opens — an IO read, the documented use for $effect, matching the Alert/Chat
	// log modals. add/remove mutate locally AND persist, so reopening stays in sync.
	let videos = $state<SavedVideo[]>([]);

	$effect(() => {
		if (open) videos = loadVideos(roomId);
	});

	function isYouTubeUrl(value: string): boolean {
		try {
			const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
			return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be';
		} catch {
			return false;
		}
	}

	// Accept plain seconds ("90") or YouTube's h/m/s form ("1m30s", "1h2m3s").
	function parseStart(): number | undefined {
		const t = startAt.trim().toLowerCase();
		if (!t) return undefined;
		if (/^\d+$/.test(t)) {
			const n = Number(t);
			return n > 0 ? n : undefined;
		}
		const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
		if (m && (m[1] || m[2] || m[3])) {
			const sec = Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
			return sec > 0 ? sec : undefined;
		}
		return undefined;
	}

	// Fold an optional start offset into the URL as `t=<sec>` (YouTube's standard
	// deep-link param) so the single {kind,url} broadcast carries it with no wire-
	// format change — MediaPlayer reads it back out to seed the embed's `start`.
	function withStart(raw: string, start?: number): string {
		if (!start) return raw;
		try {
			const u = new URL(raw);
			u.searchParams.set('t', String(start));
			return u.toString();
		} catch {
			return raw;
		}
	}

	function labelFor(raw: string): string {
		try {
			const u = new URL(raw);
			return u.hostname.replace(/^www\./, '') + u.pathname + (u.search || '');
		} catch {
			return raw;
		}
	}

	function close() {
		url = '';
		startAt = '';
		error = '';
		onClose();
	}

	function validate(): string | null {
		const trimmed = url.trim();
		if (!isYouTubeUrl(trimmed)) {
			error = 'Enter a valid YouTube URL (youtube.com or youtu.be).';
			return null;
		}
		error = '';
		return trimmed;
	}

	function persist(next: SavedVideo[]) {
		videos = next;
		saveVideos(roomId, next);
	}

	// Add to the saved list (de-dupe by url+start, newest first).
	function remember(video: SavedVideo) {
		const key = (v: SavedVideo) => `${v.url}#${v.start ?? ''}`;
		persist([video, ...videos.filter((v) => key(v) !== key(video))]);
	}

	function save() {
		const v = validate();
		if (!v) return;
		remember({ url: v, label: labelFor(v), start: parseStart() });
	}

	function playForAll() {
		const v = validate();
		if (!v) return;
		const start = parseStart();
		remember({ url: v, label: labelFor(v), start });
		onPlay?.('youtube', withStart(v, start));
		close();
	}

	function playSaved(video: SavedVideo) {
		onPlay?.('youtube', withStart(video.url, video.start));
		close();
	}

	function removeSaved(index: number) {
		persist(videos.filter((_, i) => i !== index));
	}

	function stopForAll() {
		onStop?.();
		close();
	}
</script>

{#snippet footer()}
	<!-- Reference footer is a single secondary Close (actions live in the input-group). -->
	<button class="btn secondary" type="button" onclick={close}>Close</button>
{/snippet}

<Modal {open} onClose={close} title="Play YouTube For All" {footer}>
	<!-- Reference body: a Bootstrap input-group — URL input with Save + Play For All
	     appended as input-group-text btn addons (files/file2.html, file8.html). -->
	<div class="input-group">
		<input
			class="input"
			class:invalid={error}
			type="text"
			inputmode="url"
			placeholder="Paste YouTube URL"
			bind:value={url}
			oninput={() => (error = '')}
			aria-label="YouTube URL"
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? 'yt-url-error' : undefined}
		/>
		<button type="button" class="addon" onclick={save}>Save</button>
		<button type="button" class="addon" onclick={playForAll}>Play For All</button>
	</div>

	<!-- Optional start offset (reference `ytVideoStartTime` / `videoPlayTime`). -->
	<label class="start-row">
		<span class="start-label">Start at (optional)</span>
		<input
			class="start-input"
			type="text"
			inputmode="numeric"
			placeholder="e.g. 90 or 1m30s"
			bind:value={startAt}
			aria-label="Start time"
		/>
	</label>

	{#if error}
		<p id="yt-url-error" class="error" role="alert">{error}</p>
	{/if}

	<!-- Reference `stopVideoForAll` — clears the room-wide player for everyone. -->
	<button type="button" class="btn danger stop" onclick={stopForAll}>Stop For All</button>

	{#if videos.length}
		<div class="saved">
			<div class="saved-head">Saved videos</div>
			<ul class="saved-list">
				{#each videos as v, i (v.url + '#' + (v.start ?? ''))}
					<li class="saved-item">
						<span class="saved-text" title={v.url}>
							{v.label}{v.start ? ` (@${v.start}s)` : ''}
						</span>
						<span class="saved-actions">
							<button type="button" class="mini play" onclick={() => playSaved(v)}>Play</button>
							<button
								type="button"
								class="mini remove"
								onclick={() => removeSaved(i)}
								aria-label="Remove saved video"
							>
								Remove
							</button>
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</Modal>

<style>
	.input-group {
		display: flex;
		align-items: stretch;
	}
	.input {
		flex: 1;
		min-width: 0;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-right: none;
		border-radius: var(--radius) 0 0 var(--radius);
		color: var(--text);
		padding: 0.55rem 0.75rem;
		font-size: 0.9rem;
	}
	.input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.input.invalid {
		border-color: var(--negative);
	}
	/* Reference span.input-group-text.btn addons — #444 (--modal-input-group-bg). */
	.addon {
		display: inline-flex;
		align-items: center;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		padding: 0 0.85rem;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}
	.addon:last-child {
		border-radius: 0 var(--radius) var(--radius) 0;
	}
	.addon:hover {
		opacity: 0.9;
	}
	.start-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.6rem;
		font-size: 0.82rem;
		color: var(--text-dim);
	}
	.start-input {
		flex: 0 0 9rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.4rem 0.55rem;
		font-size: 0.85rem;
	}
	.start-input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.error {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: var(--negative);
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 700;
		font-size: 0.85rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		border-color: var(--modal-btn-secondary, #444);
		color: #fff;
	}
	.btn.secondary:hover {
		opacity: 0.9;
	}
	.btn.danger {
		background: var(--modal-danger, #bb352a);
		border-color: var(--modal-danger, #bb352a);
		color: #fff;
	}
	.btn.danger:hover {
		opacity: 0.9;
	}
	.stop {
		margin-top: 0.75rem;
	}
	.saved {
		margin-top: 0.9rem;
		border-top: 1px solid var(--border);
		padding-top: 0.6rem;
	}
	.saved-head {
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--text-dim);
		margin-bottom: 0.4rem;
	}
	.saved-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		max-height: 11rem;
		overflow-y: auto;
	}
	.saved-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.35rem 0.5rem;
	}
	.saved-text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.8rem;
		color: var(--text);
	}
	.saved-actions {
		display: flex;
		gap: 0.3rem;
		flex: 0 0 auto;
	}
	.mini {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.2rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		background: transparent;
		color: var(--text);
	}
	.mini.play:hover {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.mini.remove:hover {
		background: var(--modal-danger, #bb352a);
		border-color: var(--modal-danger, #bb352a);
		color: #fff;
	}
</style>
