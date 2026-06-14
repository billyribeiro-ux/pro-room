<script lang="ts">
	// Self-hosted Open Sans — the reference app's actual UI font (body weight 300,
	// nav 700). Loading it makes our `--font-sans` declaration real instead of
	// silently falling back to the system stack.
	import '@fontsource/open-sans/300.css';
	import '@fontsource/open-sans/400.css';
	import '@fontsource/open-sans/600.css';
	import '@fontsource/open-sans/700.css';
	import '@fontsource/open-sans/400-italic.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import DialogHost from '$lib/components/DialogHost.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let { children } = $props();

	const PUBLIC_PREFIXES = ['/login', '/register', '/auth/magic'];
	let booted = $state(false);

	onMount(async () => {
		theme.apply();
		await auth.refresh();
		booted = true;
	});

	// Redirect based on auth state once the session has been resolved.
	$effect(() => {
		if (!booted) return;
		const path = page.url.pathname;
		const isPublic = PUBLIC_PREFIXES.some((p) => path.startsWith(p));
		if (!auth.user && !isPublic) {
			goto(resolve('/login'));
		} else if (auth.user && (path === '/login' || path === '/register')) {
			goto(resolve('/rooms'));
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Nav />
<main>
	{#if booted}
		{@render children()}
	{:else}
		<p class="loading">Loading…</p>
	{/if}
</main>

<DialogHost />

<style>
	main {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1.25rem;
	}
	.loading {
		color: var(--text-dim);
		text-align: center;
		margin-top: 4rem;
	}
</style>
