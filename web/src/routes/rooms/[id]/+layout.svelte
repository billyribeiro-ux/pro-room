<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();
</script>

<!-- Re-key the room page on the room id so a CLIENT-SIDE navigation between two
     rooms (/rooms/A → /rooms/B, the same route) fully remounts +page.svelte.
     Without this the page reads `page.params.id` once at setup and keeps the old
     room's WebSocket + LiveKit connections, so the new room never loads. -->
{#key page.params.id}
	{@render children()}
{/key}
