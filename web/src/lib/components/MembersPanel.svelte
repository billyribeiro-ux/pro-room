<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { onMount } from 'svelte';
	import type { MemberView, Role } from '$lib/types';
	import { X, UserPlus, Trash } from 'phosphor-svelte';

	interface Props {
		roomId: string;
		onClose: () => void;
	}
	let { roomId, onClose }: Props = $props();

	let members = $state<MemberView[]>([]);
	let email = $state('');
	let role = $state<Role>('member');
	let error = $state<string | null>(null);
	let busy = $state(false);

	async function load() {
		try {
			members = await api.get<MemberView[]>(`/api/rooms/${roomId}/members`);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load members';
		}
	}

	async function add(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		error = null;
		try {
			members = await api.post<MemberView[]>(`/api/rooms/${roomId}/members`, { email, role });
			email = '';
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not add member';
		} finally {
			busy = false;
		}
	}

	async function remove(userId: string) {
		try {
			await api.delete(`/api/rooms/${roomId}/members/${userId}`);
			members = members.filter((m) => m.user_id !== userId);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not remove member';
		}
	}

	onMount(load);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="overlay" onclick={onClose}>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<aside class="drawer" onclick={(e) => e.stopPropagation()}>
		<header>
			<h2>Members</h2>
			<button class="close" onclick={onClose} aria-label="Close"><X size={18} /></button>
		</header>

		{#if error}<p class="error">{error}</p>{/if}

		<form onsubmit={add}>
			<input type="email" placeholder="member@email.com" bind:value={email} required />
			<select bind:value={role}>
				<option value="member">Member</option>
				<option value="admin">Admin</option>
				<option value="super_admin">Super admin</option>
			</select>
			<button class="add" type="submit" disabled={busy}>
				<UserPlus size={16} /> Add
			</button>
		</form>

		<ul>
			{#each members as m (m.user_id)}
				<li>
					<div class="info">
						<span class="name">{m.display_name}</span>
						<span class="email">{m.email}</span>
					</div>
					<span class="role">{m.role.replace('_', ' ')}</span>
					<button class="del" onclick={() => remove(m.user_id)} aria-label="Remove">
						<Trash size={15} />
					</button>
				</li>
			{:else}
				<li class="empty">No members yet.</li>
			{/each}
		</ul>
	</aside>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: flex-end;
		z-index: 50;
	}
	.drawer {
		width: 100%;
		max-width: 420px;
		height: 100%;
		background: var(--bg-elev);
		border-left: 1px solid var(--border);
		padding: 1.25rem;
		overflow-y: auto;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	h2 {
		margin: 0;
		font-size: 1.2rem;
	}
	.close {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 8px;
		padding: 0.3rem;
		display: inline-flex;
	}
	form {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 1rem;
	}
	input,
	select {
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 7px;
		padding: 0.45rem 0.5rem;
		font-size: 0.85rem;
	}
	input {
		flex: 1;
	}
	.add {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 7px;
		padding: 0 0.7rem;
		font-weight: 600;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.5rem 0.7rem;
	}
	.info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.name {
		font-weight: 600;
		font-size: 0.9rem;
	}
	.email {
		font-size: 0.75rem;
		color: var(--text-dim);
	}
	.role {
		margin-left: auto;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--text-dim);
	}
	.del {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 7px;
		padding: 0.3rem;
		display: inline-flex;
	}
	.del:hover {
		color: var(--negative);
		border-color: var(--negative);
	}
	.empty {
		justify-content: center;
		color: var(--text-dim);
	}
	.error {
		color: #ffd7da;
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}
</style>
