<script lang="ts">
	import { lightbox, closeLightbox } from '$lib/stores/lightbox.svelte';

	// HARD EVIDENCE (overlays-toasts.md §DOM 3 + §Behavior "Download button"):
	// the reference `openImageModal` derives `imageName = url.substring(url.lastIndexOf("/")+1)`
	// and its Download button calls `downloadImage(url, imageName)` — an XHR blob GET →
	// createObjectURL → synthetic `<a download>` click. We replicate that flow: fetch the
	// image as a blob, object-URL it, and trigger a download <a> (falls back to a direct
	// anchor[download] if the blob fetch fails, e.g. cross-origin without CORS). No fake
	// data — the button is inert only if there is no image URL.
	function imageName(url: string): string {
		return url.substring(url.lastIndexOf('/') + 1) || 'image';
	}

	async function downloadImage() {
		const url = lightbox.url;
		if (!url) return;
		const name = imageName(url);
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const blob = await res.blob();
			const objectUrl = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = objectUrl;
			a.download = name;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(objectUrl);
		} catch {
			// Honest fallback: direct anchor download (no fabricated success — the
			// browser handles or surfaces the failure).
			const a = document.createElement('a');
			a.href = url;
			a.download = name;
			a.target = '_blank';
			a.rel = 'noopener';
			document.body.appendChild(a);
			a.click();
			a.remove();
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && lightbox.url) closeLightbox();
	}}
/>

{#if lightbox.url}
	<!-- Backdrop — clicking outside the dialog dismisses (reference bootbox backdrop +
	     onEscape:true). HARD EVIDENCE (overlays-toasts.md §Global CSS .modal-backdrop:
	     position:fixed; z-index:1040; background-color:#000; .show → opacity:.5). -->
	<div
		class="overlay"
		role="button"
		tabindex="0"
		aria-label="Close image"
		onclick={closeLightbox}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') closeLightbox();
		}}
	>
		<!-- Dialog. HARD EVIDENCE (overlays-toasts.md §DOM 3 + §Resolved): the imgur-modal
		     is size:"large" → .modal-lg { min-width:90%; min-height:80% }, .modal-content
		     background #103d5c (var(--modal-content-bg-color)), color #f4f4f4, border
		     1px solid #444, border-radius .3rem, and .imgur-modal { text-align:center }.
		     Clicks inside the dialog must NOT bubble to the backdrop close handler. -->
		<div
			class="modal-dialog"
			role="dialog"
			aria-modal="true"
			aria-label="Image preview"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-content">
				<!-- HARD EVIDENCE (overlays-toasts.md §DOM 3 body):
				     <img src="<url>" alt="<imageName>" /><hr>
				     <button class="btn btn-primary btn-sm" ...>
				       <i class="fa fa-download"></i> Download Image</button>
				     .imgur-modal img { max-width:100%; max-height:calc(100vh - 150px) }. -->
				<img src={lightbox.url} alt={imageName(lightbox.url)} />
				<hr />
				<button type="button" class="btn btn-primary btn-sm" onclick={downloadImage}>
					<!-- FA5 fa-download glyph rendered as inline SVG (the app loads
					     FontAwesome 5.8.1; we ship the glyph inline to stay self-contained). -->
					<svg
						class="dl-icon"
						viewBox="0 0 512 512"
						width="14"
						height="14"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
						/>
					</svg>
					Download Image
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* HARD EVIDENCE (overlays-toasts.md §Global CSS .modal-backdrop: position:fixed;
	   z-index:1040; background:#000; .show→opacity:.5). We compose the backdrop tint
	   directly (rgba 0,0,0,0.5) and center the dialog. The reference layers a separate
	   .modal (z-1050) over the backdrop (z-1040); we use a single fixed overlay above
	   the app chrome and center the dialog inside it. */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.5);
		cursor: zoom-out;
		border: none;
		padding: 1rem;
	}
	/* HARD EVIDENCE (overlays-toasts.md §Resolved: .modal-lg { min-width:90%;
	   min-height:80% } — app override @429668 beats BS max-width:800px). */
	.modal-dialog {
		position: relative;
		min-width: 90%;
		min-height: 80%;
		max-width: 90%;
		display: flex;
		flex-direction: column;
		cursor: default;
	}
	/* HARD EVIDENCE (overlays-toasts.md §Resolved: imgur .modal-content background
	   #103d5c (var(--modal-content-bg-color)), color #f4f4f4, border 1px solid #444,
	   border-radius .3rem) + .imgur-modal { text-align:center }. */
	.modal-content {
		display: flex;
		flex-direction: column;
		width: 100%;
		flex: 1 1 auto;
		background-color: #103d5c;
		color: #f4f4f4;
		border: 1px solid #444;
		border-radius: 0.3rem;
		padding: 1rem;
		text-align: center;
		overflow: auto;
	}
	/* HARD EVIDENCE (overlays-toasts.md §Resolved: .imgur-modal img { max-width:100%;
	   max-height:calc(100vh - 150px) }). */
	.modal-content img {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: calc(100vh - 150px);
		object-fit: contain;
		margin: 0 auto;
	}
	/* HARD EVIDENCE (overlays-toasts.md §DOM 3 body: <img> … <hr> … <button>). Darkly
	   <hr> divider under the image, ahead of the download button. */
	.modal-content hr {
		width: 100%;
		border: 0;
		border-top: 1px solid #444;
		margin: 1rem 0;
	}
	/* HARD EVIDENCE (overlays-toasts.md §DOM 3: button.btn.btn-primary.btn-sm). BS
	   .btn-sm sizing (font-size:.875rem) + primary = room accent. */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		border-radius: var(--radius, 6px);
		font-weight: 400;
		line-height: 1.5;
		text-align: center;
		user-select: none;
	}
	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
	}
	.btn-primary {
		background: var(--accent, #45a2ff);
		border: 1px solid var(--accent, #45a2ff);
		color: #fff;
	}
	.btn-primary:hover {
		background: var(--accent-hover, #2f8fe6);
		border-color: var(--accent-hover, #2f8fe6);
	}
	.dl-icon {
		flex: 0 0 auto;
	}
</style>
