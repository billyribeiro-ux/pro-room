<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { auth } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';
	import type { Role, User, UserStatus } from '$lib/types';
	import { ShieldStarIcon } from 'phosphor-svelte';

	let users = $state<User[]>([]);
	let error = $state<string | null>(null);
	let loading = $state(true);

	const allowed = $derived(auth.can('user.manage'));

	async function load() {
		try {
			users = await api.get<User[]>('/api/users');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load users';
		} finally {
			loading = false;
		}
	}

	async function changeRole(user: User, role: Role) {
		try {
			await api.patch(`/api/users/${user.id}/role`, { role });
			users = users.map((u) => (u.id === user.id ? { ...u, global_role: role } : u));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not update role';
		}
	}

	async function changeStatus(user: User, status: UserStatus) {
		try {
			await api.patch(`/api/users/${user.id}/status`, { status });
			users = users.map((u) => (u.id === user.id ? { ...u, status } : u));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not update status';
		}
	}

	onMount(() => {
		if (allowed) load();
		else loading = false;
	});
</script>

<header class="page-head">
	<ShieldStarIcon size={22} weight="fill" />
	<h1>User Administration</h1>
</header>

{#if !allowed}
	<p class="dim">You do not have permission to manage users.</p>
{:else if loading}
	<p class="dim">Loading…</p>
{:else}
	{#if error}<p class="error">{error}</p>{/if}
	<table>
		<thead>
			<tr><th>User</th><th>Email</th><th>Role</th><th>Status</th></tr>
		</thead>
		<tbody>
			{#each users as u (u.id)}
				<tr>
					<td>{u.display_name}</td>
					<td class="email">{u.email}</td>
					<td>
						<select
							value={u.global_role}
							onchange={(e) => changeRole(u, e.currentTarget.value as Role)}
						>
							<option value="member">member</option>
							<option value="admin">admin</option>
							<option value="super_admin">super admin</option>
						</select>
					</td>
					<td>
						<select
							value={u.status}
							onchange={(e) => changeStatus(u, e.currentTarget.value as UserStatus)}
						>
							<option value="active">active</option>
							<option value="suspended">suspended</option>
						</select>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.page-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}
	.page-head :global(svg) {
		color: var(--accent);
	}
	h1 {
		margin: 0;
		font-size: 1.5rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}
	th,
	td {
		text-align: left;
		padding: 0.7rem 0.85rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.9rem;
	}
	th {
		color: var(--text-dim);
		font-weight: 600;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	tbody tr:last-child td {
		border-bottom: none;
	}
	.email {
		color: var(--text-dim);
		font-family: ui-monospace, monospace;
	}
	select {
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 7px;
		padding: 0.35rem 0.5rem;
	}
	.dim {
		color: var(--text-dim);
	}
	.error {
		color: #ffd7da;
		margin-bottom: 1rem;
	}
</style>
