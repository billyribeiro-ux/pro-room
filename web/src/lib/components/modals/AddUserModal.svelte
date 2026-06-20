<script lang="ts">
	import Modal from '../Modal.svelte';
	import { api, ApiError } from '$lib/api';
	import { showToast } from '$lib/stores/toast.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	let email = $state('');
	let name = $state('');
	let password = $state('');
	let role = $state<'member' | 'admin' | 'super_admin'>('member');
	let saving = $state(false);
	let error = $state<string | null>(null);

	// Mirror the server checks: a valid-ish email, a name, and password >= 8.
	const valid = $derived(
		email.trim().includes('@') &&
			email.trim().length >= 3 &&
			name.trim().length >= 1 &&
			password.length >= 8
	);

	// Reset the form each time the modal opens.
	$effect(() => {
		if (open) {
			email = '';
			name = '';
			password = '';
			role = 'member';
			error = null;
		}
	});

	async function create() {
		if (!valid || saving) return;
		saving = true;
		error = null;
		try {
			await api.post('/api/users', {
				email: email.trim(),
				display_name: name.trim(),
				password,
				role
			});
			showToast(
				'User created',
				`${name.trim()} can sign in with ${email.trim()} + the password you set.`,
				6000
			);
			onClose();
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'Could not create the user.';
		} finally {
			saving = false;
		}
	}
</script>

<Modal {open} {onClose} title="Add User">
	<div class="form">
		<p class="hint">
			Create an account with a starting role + password. The person signs in with this email +
			password, then changes the password under “Edit my Info”.
		</p>

		<label class="field">
			<span class="flabel">Email</span>
			<input
				class="input"
				type="email"
				bind:value={email}
				autocomplete="off"
				placeholder="trader@example.com"
			/>
		</label>

		<label class="field">
			<span class="flabel">Display name</span>
			<input
				class="input"
				type="text"
				bind:value={name}
				maxlength="40"
				autocomplete="off"
				placeholder="Jane Trader"
			/>
		</label>

		<label class="field">
			<span class="flabel">Temporary password</span>
			<!-- Shown (not masked) so the admin can copy it to the new user. -->
			<input
				class="input"
				type="text"
				bind:value={password}
				autocomplete="off"
				placeholder="at least 8 characters"
			/>
			{#if password.length > 0 && password.length < 8}
				<span class="err">At least 8 characters.</span>
			{/if}
		</label>

		<label class="field">
			<span class="flabel">Role</span>
			<select class="input" bind:value={role}>
				<option value="member">Member</option>
				<option value="admin">Admin / Presenter</option>
				<option value="super_admin">Super Admin</option>
			</select>
		</label>

		{#if error}
			<p class="err" role="alert">{error}</p>
		{/if}
	</div>

	{#snippet footer()}
		<button class="btn secondary" type="button" onclick={onClose}>Cancel</button>
		<button class="btn primary" type="button" onclick={create} disabled={!valid || saving}>
			{saving ? 'Creating…' : 'Create user'}
		</button>
	{/snippet}
</Modal>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.hint {
		font-size: 0.78rem;
		color: var(--text-dim);
		margin: 0;
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
</style>
