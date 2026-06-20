<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from '../Modal.svelte';
	import { api, ApiError } from '$lib/api';
	import { showToast } from '$lib/stores/toast.svelte';
	import { confirmDialog } from '$lib/dialog.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import type { User } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	let users = $state<User[]>([]);
	let loading = $state(true);

	// Add-user form.
	let email = $state('');
	let name = $state('');
	let password = $state('');
	let role = $state<'member' | 'admin' | 'super_admin'>('member');
	let saving = $state(false);
	let error = $state<string | null>(null);

	const valid = $derived(
		email.trim().includes('@') &&
			email.trim().length >= 3 &&
			name.trim().length >= 1 &&
			password.length >= 8
	);
	// Match self by email (you can't delete your own account — the server blocks it
	// too; we just hide the button). auth.user exposes email but not an id.
	const myEmail = $derived(auth.user?.email ?? '');

	async function load() {
		loading = true;
		try {
			users = await api.get<User[]>('/api/users');
		} catch {
			users = [];
		} finally {
			loading = false;
		}
	}
	// Lazy-mounted (only rendered while open), so load once on mount.
	onMount(() => void load());

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
			showToast('User created', `${name.trim()} can sign in with the password you set.`, 5000);
			email = '';
			name = '';
			password = '';
			role = 'member';
			await load();
		} catch (e) {
			error = e instanceof ApiError ? e.message : 'Could not create the user.';
		} finally {
			saving = false;
		}
	}

	async function remove(u: User) {
		const ok = await confirmDialog({
			title: 'Delete user?',
			message: `Permanently delete ${u.display_name} (${u.email})? Their alerts, polls, questions, messages and memberships are removed too.`,
			confirmLabel: 'Delete',
			danger: true
		});
		if (!ok) return;
		try {
			await api.delete(`/api/users/${u.id}`);
			users = users.filter((x) => x.id !== u.id);
			showToast('User deleted', `${u.display_name} was removed.`, 4000);
		} catch (e) {
			showToast(
				'Delete failed',
				e instanceof ApiError ? e.message : 'Could not delete the user.',
				6000
			);
		}
	}

	const roleLabel = (r: string) =>
		r === 'super_admin' ? 'Super Admin' : r === 'admin' ? 'Admin' : 'Member';
</script>

<Modal {open} {onClose} title="Users">
	<div class="wrap">
		<div class="list" aria-label="Existing users">
			{#if loading}
				<p class="hint">Loading…</p>
			{:else if users.length === 0}
				<p class="hint">No users yet.</p>
			{:else}
				{#each users as u (u.id)}
					<div class="row">
						<div class="who">
							<span class="uname">{u.display_name}</span>
							<span class="uemail">{u.email}</span>
						</div>
						<span class="role-badge {u.global_role}">{roleLabel(u.global_role)}</span>
						{#if u.email === myEmail}
							<span class="you" title="This is you">you</span>
						{:else}
							<button
								class="del"
								type="button"
								title="Delete user"
								aria-label="Delete {u.display_name}"
								onclick={() => remove(u)}>✕</button
							>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<div class="add">
			<span class="section-title">Add a user</span>
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
			<button
				class="btn primary add-btn"
				type="button"
				onclick={create}
				disabled={!valid || saving}
			>
				{saving ? 'Creating…' : 'Create user'}
			</button>
		</div>
	</div>

	{#snippet footer()}
		<button class="btn secondary" type="button" onclick={onClose}>Close</button>
	{/snippet}
</Modal>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.hint {
		font-size: 0.8rem;
		color: var(--text-dim);
		margin: 0.2rem 0;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 240px;
		overflow-y: auto;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-elev);
	}
	.who {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}
	.uname {
		font-weight: 700;
		font-size: 0.85rem;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.uemail {
		font-size: 0.72rem;
		color: var(--text-dim);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.role-badge {
		font-size: 0.68rem;
		font-weight: 700;
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		white-space: nowrap;
		background: var(--bg-elev-2);
		color: var(--text-dim);
		border: 1px solid var(--border);
	}
	.role-badge.super_admin {
		color: var(--highlight, #f7fd37);
		border-color: var(--highlight, #f7fd37);
	}
	.role-badge.admin {
		color: var(--accent);
		border-color: var(--accent);
	}
	.del {
		flex: none;
		width: 26px;
		height: 26px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: transparent;
		color: var(--negative);
		cursor: pointer;
		font-size: 0.85rem;
		line-height: 1;
	}
	.del:hover {
		background: var(--negative);
		color: #fff;
		border-color: var(--negative);
	}
	.you {
		font-size: 0.68rem;
		color: var(--text-dim);
		padding: 0 0.3rem;
	}
	.add {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		border-top: 1px solid var(--border);
		padding-top: 0.9rem;
	}
	.section-title {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.04em;
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
		padding: 0.5rem 0.65rem;
		font-size: 0.88rem;
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
	.add-btn {
		align-self: flex-start;
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
