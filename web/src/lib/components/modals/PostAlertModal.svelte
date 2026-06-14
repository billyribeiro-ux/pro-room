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

	type Tab = 'text' | 'url' | 'image' | 'gif' | 'video';
	let tab = $state<Tab>('text');

	// Per-tab composer state.
	let text = $state('');
	let url = $state('');
	let urlText = $state('');
	let imageUrl = $state('');
	let gifUrl = $state('');
	let videoUrl = $state('');

	// Footer options — match the reference Post Alert modal's checkboxes.
	let keepOpen = $state(false);
	let postToX = $state(false);
	let dontPush = $state(false);
	let nonTradeAlert = $state(false);
	let legalDisclosure = $state(false);

	let posting = $state(false);
	let uploading = $state(false);
	let error = $state<string | null>(null);

	// Appended when "Add Legal Disclosure?" is checked (the "not financial
	// advice" disclaimer the reference room attaches to alerts).
	const DISCLOSURE =
		'\n\n— Not financial advice. For educational and informational purposes only; trade at your own risk.';

	/** The text that becomes the alert note for the active tab. */
	function composeNote(): string {
		if (tab === 'text') return text.trim();
		if (tab === 'image') return imageUrl.trim();
		if (tab === 'gif') return gifUrl.trim();
		if (tab === 'video') return videoUrl.trim();
		// url tab
		const label = urlText.trim();
		const link = url.trim();
		return label ? `${label} ${link}`.trim() : link;
	}

	function reset() {
		text = '';
		url = '';
		urlText = '';
		imageUrl = '';
		gifUrl = '';
		videoUrl = '';
		error = null;
	}

	function close() {
		reset();
		onClose();
	}

	/** Upload a selected image to the room's files store, then use its URL. */
	async function onUpload(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		uploading = true;
		error = null;
		try {
			const form = new FormData();
			form.append('file', file);
			const uploaded = await api.post<{ url: string }>(`/api/rooms/${roomId}/files`, form);
			imageUrl = uploaded.url;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Image upload failed';
		} finally {
			uploading = false;
		}
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
		const note = legalDisclosure ? baseNote + DISCLOSURE : baseNote;
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
			class:active={tab === 'image'}
			aria-selected={tab === 'image'}
			onclick={() => (tab = 'image')}
		>
			<Icon name="image" size={15} /> Image
		</button>
		<button
			type="button"
			role="tab"
			class="tab"
			class:active={tab === 'gif'}
			aria-selected={tab === 'gif'}
			onclick={() => (tab = 'gif')}
		>
			<Icon name="smile" family="regular" size={15} /> GIF
		</button>
		<button
			type="button"
			role="tab"
			class="tab"
			class:active={tab === 'video'}
			aria-selected={tab === 'video'}
			onclick={() => (tab = 'video')}
		>
			<Icon name="video" size={15} /> Video
		</button>
	</div>

	<div class="pane">
		{#if tab === 'text'}
			<label class="field">
				<span class="label">Alert text</span>
				<textarea
					bind:value={text}
					rows="4"
					placeholder="e.g. $SPX trimming half here, runner to 5300"
				></textarea>
			</label>
		{:else if tab === 'url'}
			<label class="field">
				<span class="label">URL</span>
				<input type="url" bind:value={url} placeholder="https://example.com/chart" />
			</label>
			<label class="field">
				<span class="label">Text</span>
				<input type="text" bind:value={urlText} placeholder="Optional caption" />
			</label>
		{:else if tab === 'image'}
			<label class="field">
				<span class="label">Image link to show</span>
				<input type="url" bind:value={imageUrl} placeholder="https://example.com/chart.png" />
			</label>
			<label class="upload">
				<Icon name="upload" size={15} />
				{uploading ? 'Uploading…' : 'Click to select images to upload'}
				<input type="file" accept="image/*" onchange={onUpload} disabled={uploading} hidden />
			</label>
			{#if imageUrl}
				<img class="preview" src={imageUrl} alt="Alert attachment preview" />
			{/if}
		{:else if tab === 'gif'}
			<label class="field">
				<span class="label">GIF link to show</span>
				<input type="url" bind:value={gifUrl} placeholder="https://media.giphy.com/…/giphy.gif" />
			</label>
			{#if gifUrl}
				<img class="preview" src={gifUrl} alt="GIF preview" />
			{/if}
		{:else}
			<label class="field">
				<span class="label">Video link to show</span>
				<input type="url" bind:value={videoUrl} placeholder="https://example.com/clip.mp4" />
			</label>
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
	.label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	textarea,
	input[type='url'],
	input[type='text'] {
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
	.upload {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		align-self: flex-start;
		background: var(--bg-elev);
		border: 1px dashed var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.45rem 0.7rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}
	.upload:hover {
		border-color: var(--accent);
		color: var(--text);
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
