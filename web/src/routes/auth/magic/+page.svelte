<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { auth } from '$lib/stores/auth.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { Me } from '$lib/types';

	let error = $state<string | null>(null);

	onMount(async () => {
		const token = page.url.searchParams.get('token');
		if (!token) {
			error = 'Missing sign-in token.';
			return;
		}
		try {
			auth.me = await api.get<Me>(`/api/auth/magic/verify?token=${encodeURIComponent(token)}`);
			await goto(resolve('/rooms'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'This sign-in link is invalid or expired.';
		}
	});
</script>

<div class="wrap">
	{#if error}
		<p class="error">{error}</p>
		<a href={resolve('/login')}>Back to sign in</a>
	{:else}
		<p>Signing you in…</p>
	{/if}
</div>

<style>
	.wrap {
		text-align: center;
		margin-top: 5rem;
		color: var(--text-dim);
	}
	.error {
		color: #ffd7da;
		margin-bottom: 1rem;
	}
</style>
