<script lang="ts">
	// Self-hosted Open Sans — the reference app's actual UI font (body weight 300,
	// nav 700). Loading it makes our `--font-sans` declaration real instead of
	// silently falling back to the system stack.
	import '@fontsource/open-sans/300.css';
	import '@fontsource/open-sans/400.css';
	import '@fontsource/open-sans/600.css';
	import '@fontsource/open-sans/700.css';
	import '@fontsource/open-sans/400-italic.css';
	// Font Awesome 5 Free — the reference app's exact icon set (used via <Icon>).
	import '@fortawesome/fontawesome-free/css/all.min.css';
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
	// The room (/rooms/<id>) is a full-bleed app shell — it must NOT inherit the
	// global padded/centered <main> wrapper, or the resizable split can't span the
	// full viewport (the reference room is edge-to-edge). The /rooms list keeps it.
	const fullBleed = $derived(page.url.pathname.startsWith('/rooms/'));
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

<!-- The room has its own RoomTopNav; the global Nav would double-stack and push
     the shell down (page scroll). Hide it on the full-bleed room route. -->
{#if !fullBleed}
	<Nav />
{/if}
<main class:full={fullBleed}>
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
	/* Full-bleed room shell: edge-to-edge, no max-width cap, so the split spans the
	   full viewport like the reference. overflow:hidden establishes a block
	   formatting context so the room-body's margin-top (clearing the fixed nav)
	   stays contained instead of collapsing through and pushing the shell down. */
	main.full {
		max-width: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
	.loading {
		color: var(--text-dim);
		text-align: center;
		margin-top: 4rem;
	}
</style>
