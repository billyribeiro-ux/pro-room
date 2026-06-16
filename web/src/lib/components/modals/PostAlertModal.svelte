<script lang="ts">
	import { page } from '$app/state';
	import { api, ApiError } from '$lib/api';
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Called with the API response after a successful post. */
		onPosted?: (alert: unknown) => void;
	}
	let { open, onClose, onPosted }: Props = $props();

	// Always present for the /rooms/[id] route.
	const roomId = page.params.id as string;

	// Reference Post Alert modal has THREE tabs: Text Alert / Text Url /
	// Image-GIF-Video (ONE combined media tab = url input + upload/drop zone).
	type Tab = 'text' | 'url' | 'media';
	let tab = $state<Tab>('text');

	// Per-tab composer state.
	let text = $state(''); // Text Alert tab (rows=10)
	let url = $state(''); // Text Url tab: the link
	let urlText = $state(''); // Text Url tab: accompanying message (rows=2)
	let mediaUrl = $state(''); // Image/GIF/Video tab: link OR uploaded file url
	let mediaText = $state(''); // Image/GIF/Video tab: accompanying message (rows=2)
	let dragOver = $state(false);

	// Footer options — match the reference Post Alert modal's checkboxes.
	let keepOpen = $state(false);
	let postToX = $state(false);
	let dontPush = $state(false);
	let nonTradeAlert = $state(false);
	let legalDisclosure = $state(false);

	let posting = $state(false);
	let uploading = $state(false);
	let error = $state<string | null>(null);

	// The default "not financial advice" disclaimer the reference room attaches to
	// alerts. When "Add Legal Disclosure?" is checked an editable box appears
	// pre-filled with this text; the poster can change the wording and the
	// (possibly edited) text is what gets appended to the note.
	const DEFAULT_DISCLOSURE =
		'— Not financial advice. For educational and informational purposes only; trade at your own risk.';
	let disclosureText = $state(DEFAULT_DISCLOSURE);

	/** The text that becomes the alert note for the active tab. */
	function composeNote(): string {
		if (tab === 'text') return text.trim();
		// url + media tabs are both "message + link".
		const label = (tab === 'url' ? urlText : mediaText).trim();
		const link = (tab === 'url' ? url : mediaUrl).trim();
		return label ? `${label} ${link}`.trim() : link;
	}

	function reset() {
		text = '';
		url = '';
		urlText = '';
		mediaUrl = '';
		mediaText = '';
		error = null;
	}

	function close() {
		reset();
		onClose();
	}

	/** Upload a file to the room's files store, then use its URL as the media link. */
	async function uploadFile(file: File) {
		uploading = true;
		error = null;
		try {
			const form = new FormData();
			form.append('file', file);
			const uploaded = await api.post<{ url: string }>(`/api/rooms/${roomId}/files`, form);
			mediaUrl = uploaded.url;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Image upload failed';
		} finally {
			uploading = false;
		}
	}
	function onUpload(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (file) void uploadFile(file);
	}
	/** Reference media tab doubles as a drop zone ("or drop an image"). */
	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) void uploadFile(file);
	}

	/** Open a pre-filled tweet for the just-posted alert. Client-side X share
	 * intent — no server credentials needed; the user reviews and sends the tweet
	 * in the popped tab. Uses the core alert text (without the long disclosure) to
	 * stay within tweet limits. */
	function shareToX(tweetText: string) {
		if (typeof window === 'undefined') return;
		// x.com is the canonical host now; twitter.com just 301s here anyway.
		const href = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
		window.open(href, '_blank', 'noopener,noreferrer');
	}

	async function post() {
		const baseNote = composeNote();
		if (!baseNote) {
			error = 'Enter alert content before posting.';
			return;
		}
		const disclosure = disclosureText.trim();
		const note = legalDisclosure && disclosure ? `${baseNote}\n\n${disclosure}` : baseNote;
		error = null;
		posting = true;
		try {
			// Reference alerts are free-form text. Our backend stores symbol+side+note,
			// so derive a symbol from the first $cashtag (fallback "ALERT") and a side
			// from the non-trade flag. The note carries the full composed body; the
			// tweet/push flags are persisted server-side (post_to_x / no_push).
			const symbolMatch = note.match(/\$([A-Za-z]{1,6})/);
			const created = await api.post(`/api/rooms/${roomId}/alerts`, {
				symbol: symbolMatch ? symbolMatch[1].toUpperCase() : 'ALERT',
				side: nonTradeAlert ? 'nta' : 'buy',
				note,
				post_to_x: postToX,
				no_push: dontPush
			});
			if (postToX) shareToX(baseNote);
			onPosted?.(created);
			reset();
			if (!keepOpen) onClose();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to post alert';
		} finally {
			posting = false;
		}
	}
</script>

<Modal {open} onClose={close} title="Post Alert">
	<div class="tabs" role="tablist" aria-label="Alert type">
		<button
			type="button"
			role="tab"
			class="tab"
			class:active={tab === 'text'}
			aria-selected={tab === 'text'}
			onclick={() => (tab = 'text')}
		>
			<Icon name="font" size={15} /> Text Alert
		</button>
		<button
			type="button"
			role="tab"
			class="tab"
			class:active={tab === 'url'}
			aria-selected={tab === 'url'}
			onclick={() => (tab = 'url')}
		>
			<Icon name="link" size={15} /> Text Url
		</button>
		<button
			type="button"
			role="tab"
			class="tab"
			class:active={tab === 'media'}
			aria-selected={tab === 'media'}
			onclick={() => (tab = 'media')}
		>
			<Icon name="image" size={15} /> Image / GIF / Video
		</button>
	</div>

	<div class="pane">
		{#if tab === 'text'}
			<!-- Reference Text Alert tab: a single rows=10 textarea, placeholder "Alert Text...". -->
			<div class="field">
				<textarea
					id="alert-text"
					name="alert-text"
					aria-label="Alert text"
					bind:value={text}
					rows="10"
					placeholder="Alert Text..."
				></textarea>
			</div>
		{:else if tab === 'url'}
			<!-- Reference Text Url tab: fa-link url input-group + rows=2 message textarea. -->
			<div class="field input-group">
				<span class="prepend" aria-hidden="true"><Icon name="link" size={14} /></span>
				<input
					id="alert-url"
					name="alert-url"
					type="url"
					aria-label="Link / URL to send to users"
					bind:value={url}
					placeholder="Link / URL to send to users"
				/>
			</div>
			<div class="field">
				<textarea
					id="alert-url-text"
					name="alert-url-text"
					aria-label="Alert text"
					bind:value={urlText}
					rows="2"
					placeholder="Alert Text..."
				></textarea>
			</div>
		{:else}
			<!-- Reference Image/GIF/Video tab: url input + "OR..." + upload/drop zone + rows=2 message. -->
			<div class="field input-group">
				<span class="prepend" aria-hidden="true"><Icon name="link" size={14} /></span>
				<input
					id="alert-media-url"
					name="alert-media-url"
					type="url"
					aria-label="Image or Video Link to show"
					bind:value={mediaUrl}
					placeholder="Image or Video Link to show"
				/>
			</div>
			<div class="or">OR...</div>
			<label
				class="upload"
				class:dragover={dragOver}
				ondragover={(e) => {
					e.preventDefault();
					dragOver = true;
				}}
				ondragleave={() => (dragOver = false)}
				ondrop={onDrop}
			>
				<Icon name="upload" size={18} />
				<span>{uploading ? 'Uploading…' : 'Click to select images to upload'}</span>
				<span class="drop-hint">or drop an image</span>
				<input
					id="fuploadAlert"
					name="fuploadAlert"
					type="file"
					accept="image/*"
					multiple
					onchange={onUpload}
					disabled={uploading}
					hidden
				/>
			</label>
			{#if mediaUrl}
				<img class="preview" src={mediaUrl} alt="Alert attachment preview" />
			{/if}
			<div class="field">
				<textarea
					id="alert-media-text"
					name="alert-media-text"
					aria-label="Alert text"
					bind:value={mediaText}
					rows="2"
					placeholder="Alert Text..."
				></textarea>
			</div>
		{/if}

		{#if legalDisclosure}
			<!-- Revealed when "Add Legal Disclosure?" is ticked: an editable box
			     pre-filled with the default disclaimer (the poster can change it). The
			     edited text is appended to the alert note on post. -->
			<div class="field disclosure">
				<label for="alert-disclosure">Legal Disclosure</label>
				<textarea
					id="alert-disclosure"
					name="alert-disclosure"
					aria-label="Legal disclosure text"
					bind:value={disclosureText}
					rows="3"
				></textarea>
			</div>
		{/if}

		{#if error}<p class="err" role="alert">{error}</p>{/if}
	</div>

	{#snippet footer()}
		<div class="checks">
			<label class="check">
				<input type="checkbox" bind:checked={keepOpen} /> Keep alert window open?
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={postToX} /> Post on X? (tweet)
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={dontPush} /> Don't send to push notification?
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={nonTradeAlert} /> Non-trade alert? (Different Sound)
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={legalDisclosure} /> Add Legal Disclosure?
			</label>
		</div>
		<button type="button" class="primary" onclick={post} disabled={posting || uploading}>
			<Icon name="paper-plane" size={14} />
			{posting ? 'Posting…' : 'Post Alert'}
		</button>
	{/snippet}
</Modal>

<style>
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		border-bottom: 1px solid var(--border);
		margin-bottom: 0.85rem;
	}
	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-dim);
		padding: 0.4rem 0.55rem;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: -1px;
	}
	.tab:hover {
		color: var(--text);
	}
	.tab.active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}
	.pane {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.disclosure label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	/* Reference url/media inputs sit in a Bootstrap input-group with an fa-link prepend. */
	.input-group {
		flex-direction: row;
		align-items: stretch;
		gap: 0;
	}
	.prepend {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.6rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-right: none;
		border-radius: var(--radius) 0 0 var(--radius);
		color: var(--text-dim);
	}
	.input-group input {
		flex: 1;
		min-width: 0;
		border-radius: 0 var(--radius) var(--radius) 0;
	}
	/* Reference "OR..." separator between the link input and the upload zone. */
	.or {
		text-align: center;
		color: var(--text-dim);
		font-size: 0.78rem;
		font-weight: 700;
	}
	textarea,
	input[type='url'] {
		width: 100%;
		box-sizing: border-box;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.5rem 0.6rem;
		font: inherit;
		font-size: 0.88rem;
	}
	textarea {
		resize: vertical;
	}
	textarea:focus,
	input:focus {
		outline: none;
		border-color: var(--accent);
	}
	/* Reference media tab: a full-width click-or-drop upload zone
	   ("Click to select images to upload" / "or drop an image"). */
	.upload {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		background: var(--bg-elev);
		border: 1px dashed var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 1rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		text-align: center;
	}
	.upload:hover,
	.upload.dragover {
		border-color: var(--accent);
		color: var(--text);
		background: var(--bg-elev-2);
	}
	.drop-hint {
		font-weight: 400;
		font-size: 0.76rem;
		opacity: 0.8;
	}
	.preview {
		display: block;
		max-width: 100%;
		max-height: 180px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
	}
	.err {
		margin: 0;
		color: var(--negative);
		font-size: 0.8rem;
	}
	.checks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.85rem;
		margin-right: auto;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--text-dim);
		font-size: 0.8rem;
		font-weight: 600;
	}
	.primary {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
