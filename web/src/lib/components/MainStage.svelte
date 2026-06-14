<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SharePublisher } from '$lib/livekit.svelte';
	import Icon from './Icon.svelte';
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

	/** One live audio stream (a present user speaking on mic) for the Streams tab. */
	interface Speaker {
		id: string;
		name: string;
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
		/** Present users currently speaking on mic — listed live in the Streams tab. */
		speakers?: Speaker[];
		/**
		 * Presenter "lock this screen": while true, non-admin viewers are held on
		 * the Screens tab and the other tabs are disabled. Admins (`canManage`) are
		 * never held, so they can keep working the room while it's locked.
		 */
		screenLocked?: boolean;
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
		speakers = [],
		screenLocked = false,
		actions
	}: Props = $props();

	type Tab = 'screens' | 'streams' | 'notes' | 'files';
	let tab = $state<Tab>('screens');

	// Non-admins are held on Screens while the presenter has locked the screen.
	const locked = $derived(screenLocked && !canManage);
	// The tab actually shown: forced to Screens while locked, otherwise the user's
	// chosen tab. Derived (not an $effect) so it can never fight the user's click.
	const activeTab = $derived<Tab>(locked ? 'screens' : tab);

	const TABS: { id: Tab; label: string; icon: string }[] = [
		{ id: 'screens', label: 'Screens', icon: 'desktop' },
		{ id: 'streams', label: 'Streams', icon: 'podcast' },
		{ id: 'notes', label: 'Notes', icon: 'edit' },
		{ id: 'files', label: 'Files', icon: 'folder' }
	];
</script>

<div class="main-stage">
	{#if webcamPublishers.length > 0}
		<div class="webcam-strip">
			<WebcamHolder publishers={webcamPublishers} onClose={onWebcamClose} />
		</div>
	{/if}

	<div class="tabbar" role="tablist" aria-label="Room panels">
		{#each TABS as t (t.id)}
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === t.id}
				class:active={activeTab === t.id}
				disabled={locked && t.id !== 'screens'}
				onclick={() => (tab = t.id)}
			>
				<Icon name={t.icon} size={18} />
				{t.label}
			</button>
		{/each}

		{#if locked}
			<span class="locked-pill" title="The presenter has locked the screen">
				<Icon name="lock" size={14} /> Screen locked
			</span>
		{/if}

		{#if actions}
			<div class="stage-actions">{@render actions()}</div>
		{/if}
	</div>

	<div class="panel">
		{#if activeTab === 'screens'}
			<ScreenStage {publishers} {connected} />
		{:else if activeTab === 'streams'}
			<div class="streams">
				{#if speakers.length > 0}
					<ul class="stream-list">
						{#each speakers as s (s.id)}
							<li class="stream-row">
								<span class="speaking-dot" aria-hidden="true"></span>
								<Icon name="wave-square" size={18} />
								<span class="stream-name">{s.name}</span>
								<span class="stream-tag">on air</span>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="stream-empty">
						<Icon name="podcast" size={30} />
						<p>No audio streams right now</p>
						<span>Presenters speaking on mic appear here live.</span>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'notes'}
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
		/* Tabs + presenter controls can exceed the pane width; scroll the row
		   instead of clipping the right-most buttons (Members / Go live / …). */
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: thin;
	}
	.tabbar::-webkit-scrollbar {
		height: 6px;
	}
	.tabbar::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 3px;
	}
	.stage-actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}
	.tabbar button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		border: 1px solid transparent;
		color: var(--text-dim);
		font-size: 12px;
		font-weight: 300;
		padding: 0.45rem 0.85rem;
		border-radius: 8px;
		cursor: pointer;
		flex-shrink: 0;
		white-space: nowrap;
	}
	.tabbar button:hover:not(.active):not(:disabled) {
		color: var(--text);
		background: var(--bg-elev-2);
	}
	.tabbar button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.tabbar button.active {
		color: #ffffff;
		background: var(--accent);
		font-weight: 700;
		/* Reference pairs the bright-blue active tab with the darker room-blue border. */
		border-color: var(--accent-hover);
	}
	.locked-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		margin-left: 0.4rem;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--warn);
		background: color-mix(in srgb, var(--warn) 16%, transparent);
		border: 1px solid color-mix(in srgb, var(--warn) 40%, transparent);
		white-space: nowrap;
		flex-shrink: 0;
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

	/* Streams tab */
	.streams {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: auto;
		padding: 0.75rem;
	}
	.stream-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.stream-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 0.7rem;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
	}
	.stream-row :global(svg),
	.stream-row :global(i) {
		color: var(--accent);
		flex: 0 0 auto;
	}
	.speaking-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--positive);
		flex: 0 0 auto;
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--positive) 70%, transparent);
		animation: speaking-pulse 1.4s ease-out infinite;
	}
	@keyframes speaking-pulse {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--positive) 60%, transparent);
		}
		70% {
			box-shadow: 0 0 0 7px color-mix(in srgb, var(--positive) 0%, transparent);
		}
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--positive) 0%, transparent);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.speaking-dot {
			animation: none;
		}
	}
	.stream-name {
		font-weight: 600;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.stream-tag {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--positive);
		flex: 0 0 auto;
	}
	.stream-empty {
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		text-align: center;
		color: var(--text-dim);
	}
	.stream-empty :global(svg),
	.stream-empty :global(i) {
		color: var(--text-dim);
		opacity: 0.7;
	}
	.stream-empty p {
		margin: 0;
		font-weight: 600;
		color: var(--text);
	}
	.stream-empty span {
		font-size: 0.82rem;
	}
</style>
