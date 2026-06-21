<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';
	import { API_URL } from '$lib/config';
	import { api, ApiError } from '$lib/api';
	import { brand, applyBranding } from '$lib/stores/brand.svelte';
	import { showToast } from '$lib/stores/toast.svelte';
	import { confirmDialog } from '$lib/dialog.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	interface BrandingResponse {
		name: string | null;
		logo_url: string | null;
	}

	// Editable name field, seeded from the live brand. This modal is mounted within
	// the room shell, which renders only after loadBrand() has resolved, so the seed
	// reflects the server value (not the pre-load default).
	let name = $state(brand.name);
	let saving = $state(false);
	let uploading = $state(false);

	async function onPickLogo(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = ''; // allow re-picking the same file later
		if (!file || uploading) return;
		if (!file.type.startsWith('image/')) {
			showToast('Invalid file', 'The logo must be an image (PNG, SVG, JPG, WebP).', 5000);
			return;
		}
		uploading = true;
		try {
			const form = new FormData();
			form.append('file', file);
			const res = await fetch(`${API_URL}/api/branding/logo`, {
				method: 'POST',
				credentials: 'include',
				body: form
			});
			if (!res.ok) {
				const msg =
					res.status === 413
						? 'That image is larger than the 2 MB limit.'
						: res.status === 403
							? 'You do not have permission to change the logo.'
							: res.status === 400
								? 'Only image files can be used as a logo.'
								: 'Could not upload the logo. Please try again.';
				showToast('Upload failed', msg, 6000);
				return;
			}
			applyBranding((await res.json()) as BrandingResponse);
			showToast('Logo updated', 'The new logo is now live across the app.', 4000);
		} catch {
			showToast('Upload failed', 'Could not reach the server to upload the logo.', 6000);
		} finally {
			uploading = false;
		}
	}

	async function saveName() {
		saving = true;
		try {
			const data = await api.patch<BrandingResponse>('/api/branding', {
				name: name.trim() || null
			});
			applyBranding(data);
			showToast('Branding saved', 'The app name has been updated.', 4000);
		} catch (err) {
			showToast(
				'Save failed',
				err instanceof ApiError ? err.message : 'Could not update the name.',
				6000
			);
		} finally {
			saving = false;
		}
	}

	async function resetLogo() {
		const ok = await confirmDialog({
			title: 'Reset logo?',
			message: 'Revert to the built-in default logo? The uploaded logo will be removed.',
			confirmLabel: 'Reset',
			danger: true
		});
		if (!ok) return;
		try {
			const data = await api.delete<BrandingResponse>('/api/branding/logo');
			applyBranding(data);
			showToast('Logo reset', 'Reverted to the default logo.', 4000);
		} catch (err) {
			showToast(
				'Reset failed',
				err instanceof ApiError ? err.message : 'Could not reset the logo.',
				6000
			);
		}
	}
</script>

<Modal {open} {onClose} title="Branding">
	<div class="branding">
		<section>
			<h4>Logo</h4>
			<div class="logo-row">
				<span class="logo-preview"><img src={brand.logo} alt={brand.name} /></span>
				<div class="logo-actions">
					<label class="btn primary" class:disabled={uploading}>
						<Icon name="upload" size={16} />
						{uploading ? 'Uploading…' : 'Upload new logo'}
						<input type="file" accept="image/*" onchange={onPickLogo} disabled={uploading} hidden />
					</label>
					<button class="btn secondary" type="button" onclick={resetLogo}>Reset to default</button>
				</div>
			</div>
			<p class="hint">PNG, SVG, JPG, or WebP up to 2&nbsp;MB. Shown in the top navigation bar.</p>
		</section>

		<section>
			<h4>App name</h4>
			<input
				class="name-input"
				type="text"
				bind:value={name}
				maxlength="60"
				placeholder="Trading Room"
				aria-label="App name"
			/>
			<p class="hint">Shown next to the logo. Leave blank to use the default.</p>
		</section>
	</div>

	{#snippet footer()}
		<button class="btn secondary" type="button" onclick={onClose}>Close</button>
		<button class="btn primary" type="button" onclick={saveName} disabled={saving}>
			{saving ? 'Saving…' : 'Save name'}
		</button>
	{/snippet}
</Modal>

<style>
	.branding {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	section h4 {
		margin: 0 0 0.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text);
	}
	.logo-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.logo-preview {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		flex: 0 0 auto;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 6px;
	}
	.logo-preview img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
	.logo-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.hint {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.name-input {
		width: 100%;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.5rem 0.7rem;
		font-size: 0.95rem;
	}
	.name-input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border-radius: var(--radius);
		padding: 0.45rem 0.9rem;
		font-weight: 600;
		font-size: 0.875rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		border-color: var(--modal-btn-secondary, #444);
		color: #fff;
	}
	.btn.secondary:hover {
		opacity: 0.9;
	}
	.btn.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
