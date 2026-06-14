<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		ChartLineUpIcon,
		SignOutIcon,
		UsersThreeIcon,
		ShieldStarIcon,
		PaletteIcon
	} from 'phosphor-svelte';

	async function logout() {
		await auth.logout();
		await goto(resolve('/login'));
	}
</script>

<nav>
	<a class="brand" href={resolve('/rooms')}>
		<ChartLineUpIcon size={22} weight="bold" />
		<span>ProTradingRoom</span>
	</a>

	{#if auth.user}
		<div class="links">
			<a href={resolve('/rooms')}><UsersThreeIcon size={18} /> Rooms</a>
			{#if auth.can('user.manage')}
				<a href={resolve('/admin/users')}><ShieldStarIcon size={18} /> Admin</a>
			{/if}
			<a href={resolve('/settings')}><PaletteIcon size={18} /> Settings</a>
		</div>
		<div class="user">
			<span class="name">{auth.user.display_name}</span>
			<span class="role">{auth.user.global_role.replace('_', ' ')}</span>
			<button class="logout" onclick={logout} title="Sign out">
				<SignOutIcon size={18} />
			</button>
		</div>
	{/if}
</nav>

<style>
	nav {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.75rem 1.25rem;
		background: var(--bg-elev);
		border-bottom: 1px solid var(--border);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text);
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.brand :global(svg) {
		color: var(--accent);
	}
	.links {
		display: flex;
		gap: 1rem;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--text-dim);
		font-size: 0.9rem;
		padding: 0.35rem 0.5rem;
		border-radius: 8px;
	}
	.links a:hover {
		color: var(--text);
		background: var(--bg-elev-2);
	}
	.user {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.name {
		font-weight: 600;
		font-size: 0.9rem;
	}
	.role {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-dim);
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		padding: 0.15rem 0.45rem;
		border-radius: 999px;
	}
	.logout {
		display: inline-flex;
		align-items: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: 8px;
		padding: 0.35rem;
	}
	.logout:hover {
		color: var(--negative);
		border-color: var(--negative);
	}
</style>
