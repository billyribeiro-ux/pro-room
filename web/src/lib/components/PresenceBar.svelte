<script lang="ts">
	import type { PresentUser } from '$lib/types';
	import { UsersIcon } from 'phosphor-svelte';

	interface Props {
		users: PresentUser[];
	}
	let { users }: Props = $props();
</script>

<div class="presence">
	<UsersIcon size={15} />
	<span class="count">{users.length}</span>
	<div class="chips">
		{#each users as u (u.user_id)}
			<span class="chip" title={u.display_name}>{u.display_name}</span>
		{/each}
	</div>
</div>

<style>
	.presence {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-dim);
		font-size: 0.8rem;
		min-width: 0;
	}
	.count {
		font-weight: 700;
		color: var(--text);
	}
	.chips {
		display: flex;
		gap: 0.3rem;
		overflow: hidden;
	}
	.chip {
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
		white-space: nowrap;
	}
</style>
