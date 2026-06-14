<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SharePublisher } from '$lib/livekit.svelte';
	import { MonitorIcon, NotePencilIcon, FolderIcon } from 'phosphor-svelte';
	import ScreenStage from './ScreenStage.svelte';
	import NotesPanel from './NotesPanel.svelte';
	import FilesPanel from './FilesPanel.svelte';
	import WebcamHolder from './WebcamHolder.svelte';
	import CaptionsOverlay from './CaptionsOverlay.svelte';

	/** Presenter camera feeds; matches WebcamHolder's Publisher shape. */
	interface WebcamPublisher {
		id: string;
		name?: string;
		track?: MediaStreamTrack | null;
		isLocal?: boolean;
	}

	interface Props {
		roomId: string;
		canManage: boolean;
		publishers: SharePublisher[];
		connected: boolean;
		/**
		 * Presenter camera feeds, rendered as a strip above the tabs (matches the
		 * reference's `app-webcam-holder` placement). Hidden when empty.
		 */
		webcamPublishers?: WebcamPublisher[];
		/** Turn off the local user's camera (the × on their own tile). */
		onWebcamClose?: (id: string) => void;
		/** When true, the live speech-recognition captions overlay is shown. */
		captionsActive?: boolean;
		/** Room controls rendered on the right of the tab bar (share / go-live / poll / members). */
		actions?: Snippet;
	}
	let {
		roomId,
		canManage,
		publishers,
		connected,
		webcamPublishers = [],
		onWebcamClose,
		captionsActive = false,
		actions
	}: Props = $props();

	type Tab = 'screens' | 'notes' | 'files';
	let tab = $state<Tab>('screens');
</script>

<div class="main-stage">
	{#if webcamPublishers.length > 0}
		<div class="webcam-strip">
			<WebcamHolder publishers={webcamPublishers} onClose={onWebcamClose} />
		</div>
	{/if}

	<div class="tabbar" role="tablist" aria-label="Room panels">
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'screens'}
			class:active={tab === 'screens'}
			onclick={() => (tab = 'screens')}
		>
			<MonitorIcon size={18} weight={tab === 'screens' ? 'fill' : 'regular'} /> Screens
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'notes'}
			class:active={tab === 'notes'}
			onclick={() => (tab = 'notes')}
		>
			<NotePencilIcon size={18} weight={tab === 'notes' ? 'fill' : 'regular'} /> Notes
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'files'}
			class:active={tab === 'files'}
			onclick={() => (tab = 'files')}
		>
			<FolderIcon size={18} weight={tab === 'files' ? 'fill' : 'regular'} /> Files
		</button>

		{#if actions}
			<div class="stage-actions">{@render actions()}</div>
		{/if}
	</div>

	<div class="panel">
		{#if tab === 'screens'}
			<ScreenStage {publishers} {connected} />
		{:else if tab === 'notes'}
			<NotesPanel {roomId} {canManage} />
		{:else}
			<FilesPanel {roomId} {canManage} />
		{/if}
		<CaptionsOverlay active={captionsActive} />
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
	.webcam-strip {
		flex-shrink: 0;
		border-bottom: 1px solid var(--border);
		background: var(--bg-elev-2);
	}
	.tabbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.4rem 0.5rem;
		background: var(--bg-elev);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.stage-actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		/* Reference pairs the bright-blue active tab with the darker room-blue border. */
		border-color: var(--accent-hover);
	}
	.panel {
		position: relative;
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
