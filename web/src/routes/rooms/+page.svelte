<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { auth } from '$lib/stores/auth.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { Room, RoomDetail, Visibility } from '$lib/types';
	import { Plus, Broadcast, Lock, Globe } from 'phosphor-svelte';

	let rooms = $state<Room[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let showCreate = $state(false);
	let name = $state('');
	let visibility = $state<Visibility>('private');
	let creating = $state(false);

	const canCreate = $derived(auth.can('room.manage'));

	async function load() {
		loading = true;
		try {
			rooms = await api.get<Room[]>('/api/rooms');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load rooms';
		} finally {
			loading = false;
		}
	}

	async function create(e: SubmitEvent) {
		e.preventDefault();
		creating = true;
		error = null;
		try {
			const detail = await api.post<RoomDetail>('/api/rooms', { name, visibility });
			rooms = [detail.room, ...rooms];
			name = '';
			showCreate = false;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not create room';
		} finally {
			creating = false;
		}
	}

	onMount(load);
</script>

<header class="page-head">
	<h1>Trading Rooms</h1>
	{#if canCreate}
		<button class="primary" onclick={() => (showCreate = !showCreate)}>
			<Plus size={16} weight="bold" /> New room
		</button>
	{/if}
</header>

{#if error}<p class="error">{error}</p>{/if}

{#if showCreate}
	<form class="create" onsubmit={create}>
		<input placeholder="Room name" bind:value={name} required />
		<select bind:value={visibility}>
			<option value="private">Private</option>
			<option value="public">Public</option>
		</select>
		<button class="primary" type="submit" disabled={creating}>
			{creating ? 'Creating…' : 'Create'}
		</button>
	</form>
{/if}

{#if loading}
	<p class="dim">Loading rooms…</p>
{:else if rooms.length === 0}
	<p class="dim">No rooms yet.{canCreate ? ' Create one to get started.' : ''}</p>
{:else}
	<ul class="grid">
		{#each rooms as room (room.id)}
			<li>
				<a class="room" href={resolve('/rooms/[id]', { id: room.id })}>
					<div class="row">
						<span class="name">{room.name}</span>
						{#if room.is_live}<span class="live"><Broadcast size={13} weight="fill" /> LIVE</span
							>{/if}
					</div>
					<div class="meta">
						{#if room.visibility === 'public'}
							<Globe size={14} /> Public
						{:else}
							<Lock size={14} /> Private
						{/if}
						<span class="slug">/{room.slug}</span>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.page-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}
	h1 {
		font-size: 1.5rem;
		margin: 0;
	}
	.primary {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 0.5rem 0.85rem;
		font-weight: 600;
	}
	.primary:hover {
		background: var(--accent-hover);
	}
	.create {
		display: flex;
		gap: 0.6rem;
		margin-bottom: 1.25rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.85rem;
	}
	.create input,
	.create select {
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 8px;
		padding: 0.5rem 0.6rem;
	}
	.create input {
		flex: 1;
	}
	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
	}
	.room {
		display: block;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem;
		color: var(--text);
		transition: border-color 0.15s;
	}
	.room:hover {
		border-color: var(--accent);
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.name {
		font-weight: 600;
		font-size: 1.05rem;
	}
	.live {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--negative);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		color: var(--text-dim);
		font-size: 0.8rem;
	}
	.slug {
		margin-left: auto;
		font-family: ui-monospace, monospace;
	}
	.dim {
		color: var(--text-dim);
	}
	.error {
		color: #ffd7da;
		background: color-mix(in srgb, var(--negative) 15%, transparent);
		border: 1px solid var(--negative);
		padding: 0.5rem 0.7rem;
		border-radius: 8px;
	}
</style>
