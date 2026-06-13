<script lang="ts">
	import type { SharePublisher } from '$lib/livekit.svelte';
	import { Monitor, NotePencil, Folder } from 'phosphor-svelte';
	import ScreenStage from './ScreenStage.svelte';
	import NotesPanel from './NotesPanel.svelte';
	import FilesPanel from './FilesPanel.svelte';

	interface Props {
		roomId: string;
		canManage: boolean;
		publishers: SharePublisher[];
		connected: boolean;
	}
	let { roomId, canManage, publishers, connected }: Props = $props();

	type Tab = 'screens' | 'notes' | 'files';
	let tab = $state<Tab>('screens');
</script>

<div class="main-stage">
	<div class="tabbar" role="tablist" aria-label="Room panels">
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'screens'}
			class:active={tab === 'screens'}
			onclick={() => (tab = 'screens')}
		>
			<Monitor size={18} weight={tab === 'screens' ? 'fill' : 'regular'} /> Screens
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'notes'}
			class:active={tab === 'notes'}
			onclick={() => (tab = 'notes')}
		>
			<NotePencil size={18} weight={tab === 'notes' ? 'fill' : 'regular'} /> Notes
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'files'}
			class:active={tab === 'files'}
			onclick={() => (tab = 'files')}
		>
			<Folder size={18} weight={tab === 'files' ? 'fill' : 'regular'} /> Files
		</button>
	</div>

	<div class="panel">
		{#if tab === 'screens'}
			<ScreenStage {publishers} {connected} />
		{:else if tab === 'notes'}
			<NotesPanel {roomId} {canManage} />
		{:else}
			<FilesPanel {roomId} {canManage} />
		{/if}
	</div>
</div>

<style>
	.main-stage {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		min-width: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--bg-elev);
	}
	.tabbar {
		display: flex;
		gap: 0.25rem;
		padding: 0.4rem 0.5rem;
		background: var(--bg-elev);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.tabbar button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		border: 1px solid transparent;
		color: var(--text-dim);
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.45rem 0.85rem;
		border-radius: 8px;
		cursor: pointer;
	}
	.tabbar button:hover:not(.active) {
		color: var(--text);
		background: var(--bg-elev-2);
	}
	.tabbar button.active {
		color: #ffffff;
		background: var(--accent);
		border-color: var(--accent);
	}
	.panel {
		flex: 1;
		min-height: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.panel > :global(*) {
		flex: 1;
		min-height: 0;
	}
</style>
