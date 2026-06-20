<script lang="ts">
	import Modal from '../Modal.svelte';
	import { api, ApiError } from '$lib/api';
	import { auth } from '$lib/stores/auth.svelte';
	import { showToast } from '$lib/stores/toast.svelte';
	import { gravatarUrl } from '$lib/avatar';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	let name = $state(auth.user?.display_name ?? '');
	let saving = $state(false);
	let error = $state<string | null>(null);

	// Change-password (self-service) — e.g. an admin-created user changing their
	// temporary password. Verifies the current password server-side.
	let currentPw = $state('');
	let newPw = $state('');
	let pwSaving = $state(false);
	let pwError = $state<string | null>(null);

	const email = $derived(auth.user?.email ?? '');

	// Reference rule: "Username can only contain letters and numbers", min 3.
	const nameError = $derived.by<string | null>(() => {
		const t = name.trim();
		if (t.length < 3) return 'Must be at least 3 characters.';
		if (!/^[a-zA-Z0-9]+$/.test(t)) return 'Letters and numbers only (no spaces).';
		return null;
	});

	// Re-seed from the current profile each time the modal opens (an IO-ish reset).
	$effect(() => {
		if (open) {
			name = auth.user?.display_name ?? '';
			error = null;
			currentPw = '';
			newPw = '';
			pwError = null;
		}
	});

	async function save() {
		if (nameError || saving) return;
		saving = true;
		error = null;
		try {
			await api.patch('/api/auth/me', { display_name: name.trim() });
			// NOT optimistic — re-fetch /api/auth/me so display_name updates app-wide.
			await auth.refresh();
			showToast('Profile updated', `Your name is now ${name.trim()}.`, 4000);
			onClose();
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'Could not save your profile.';
		} finally {
			saving = false;
		}
	}

	async function changePassword() {
		if (newPw.length < 8 || pwSaving) return;
		pwSaving = true;
		pwError = null;
		try {
			await api.post('/api/auth/password', {
				current_password: currentPw,
				new_password: newPw
			});
			currentPw = '';
			newPw = '';
			showToast('Password changed', 'Use your new password next time you sign in.', 4000);
		} catch (e) {
			pwError =
				e instanceof ApiError
					? e.message
					: 'Could not change your password (check your current one).';
		} finally {
			pwSaving = false;
		}
	}
</script>

<Modal {open} {onClose} title="Edit my Info">
	<div class="profile">
		<div class="avatar-row">
			{#await gravatarUrl(email, 80) then src}
				<img class="avatar" {src} alt="Your avatar" width="80" height="80" />
			{:catch}
				<!-- Defense-in-depth: gravatarUrl falls back internally on an insecure
				     context, but a :catch guarantees a rejection can never bubble to the
				     console. Show the first initial as a placeholder. -->
				<span class="avatar avatar-fallback" aria-hidden="true"
					>{(name || email || '?').trim().charAt(0).toUpperCase()}</span
				>
			{/await}
			<span class="hint">Your avatar comes from your email's Gravatar.</span>
		</div>

		<label class="field">
			<span class="flabel">Email</span>
			<input class="input" type="text" value={email} readonly aria-readonly="true" />
		</label>

		<label class="field">
			<span class="flabel">Display name</span>
			<input
				class="input"
				class:invalid={!!nameError && name.length > 0}
				type="text"
				bind:value={name}
				maxlength="40"
				aria-label="Display name"
				aria-invalid={nameError ? 'true' : undefined}
			/>
			{#if nameError && name.length > 0}
				<span class="err">{nameError}</span>
			{/if}
		</label>

		<div class="field pw-section">
			<span class="flabel">Change password</span>
			<input
				class="input"
				type="password"
				bind:value={currentPw}
				autocomplete="current-password"
				placeholder="Current password"
			/>
			<input
				class="input"
				type="password"
				bind:value={newPw}
				autocomplete="new-password"
				placeholder="New password (at least 8 characters)"
			/>
			{#if pwError}
				<span class="err" role="alert">{pwError}</span>
			{/if}
			<button
				class="btn secondary pw-btn"
				type="button"
				onclick={changePassword}
				disabled={newPw.length < 8 || pwSaving}
			>
				{pwSaving ? 'Changing…' : 'Change password'}
			</button>
		</div>

		{#if error}
			<p class="err" role="alert">{error}</p>
		{/if}
	</div>

	{#snippet footer()}
		<button class="btn secondary" type="button" onclick={onClose}>Close</button>
		<button class="btn primary" type="button" onclick={save} disabled={!!nameError || saving}>
			{saving ? 'Saving…' : 'Save'}
		</button>
	{/snippet}
</Modal>

<style>
	.profile {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.avatar-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--bg-elev);
		object-fit: cover;
		flex: 0 0 auto;
	}
	.avatar-fallback {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	.hint {
		font-size: 0.78rem;
		color: var(--text-dim);
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.flabel {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	.input {
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.55rem 0.7rem;
		font-size: 0.9rem;
	}
	.input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.input[readonly] {
		opacity: 0.7;
		cursor: not-allowed;
	}
	.input.invalid {
		border-color: var(--negative);
	}
	.err {
		font-size: 0.78rem;
		color: var(--negative);
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.5rem 0.95rem;
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
	.btn.primary {
		background: var(--modal-btn-primary, var(--accent));
		border-color: var(--modal-btn-primary, var(--accent));
		color: #fff;
	}
	.btn.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.pw-section {
		border-top: 1px solid var(--border);
		padding-top: 0.9rem;
	}
	.pw-btn {
		align-self: flex-start;
		margin-top: 0.2rem;
	}
	.btn.secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
