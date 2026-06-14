<script lang="ts">
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

	/** One live audio stream (a present user speaking on mic). */
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
		/**
		 * Present users currently speaking on mic. Accepted for API compatibility;
		 * the reference room has no Streams tab so it is not rendered here.
		 */
		speakers?: Speaker[];
		/**
		 * Presenter "lock this screen": while true, non-admin viewers are held on
		 * the Screens tab and the other tabs are disabled. Admins (`canManage`) are
		 * never held, so they can keep working the room while it's locked.
		 */
		screenLocked?: boolean;
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
		screenLocked = false
	}: Props = $props();

	type Tab = 'screens' | 'notes' | 'files';
	let tab = $state<Tab>('screens');

	// Non-admins are held on Screens while the presenter has locked the screen.
	const locked = $derived(screenLocked && !canManage);
	// The tab actually shown: forced to Screens while locked, otherwise the user's
	// chosen tab. Derived (not an $effect) so it can never fight the user's click.
	const activeTab = $derived<Tab>(locked ? 'screens' : tab);

	const TABS: { id: Tab; label: string; icon: string }[] = [
		{ id: 'screens', label: 'Screens', icon: 'desktop' },
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
				<Icon name={t.icon} size={12} />
				{t.label}
			</button>
		{/each}

		{#if locked}
			<span class="locked-pill" title="The presenter has locked the screen">
				<Icon name="lock" size={14} /> Screen locked
			</span>
		{/if}
	</div>

	<div class="panel">
		{#if activeTab === 'screens'}
			<ScreenStage {publishers} {connected} />
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
		/* Reference presentation-box is a flat, borderless surface (no border, radius 0). */
		border: none;
		border-radius: 0;
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
		/* Reference .mainTabset: align-items:center; justify-content:center. */
		align-items: center;
		justify-content: center;
		gap: 0;
		padding: 0;
		/* Reference presentation surface (#mainTabs sits on .presentation-box,
		   computed bg rgb(15,46,67) = --bg-elev #0f2e43; #mainTabs itself is
		   transparent). */
		background: var(--bg-elev);
		/* Reference #mainTabs computed border-bottom: 1px solid transparent
		   (.mainTabset border-color:transparent overrides .nav-tabs). */
		border-bottom: 1px solid transparent;
		flex-shrink: 0;
	}
	.tabbar button {
		display: inline-flex;
		align-items: center;
		/* Reference label span sits 4px after the icon (span.ml-1 margin-left:4px);
		   no flex gap on the link itself. */
		gap: 4px;
		background: transparent;
		/* Reference idle .nav-link: transparent 1px border on all sides. */
		border: 1px solid transparent;
		/* Reference idle main-tab computed text is rgb(204,204,204) = #ccc. */
		color: #ccc;
		font-size: 12px;
		font-weight: 300;
		line-height: 12px;
		/* Reference idle .nav-link: 8px padding all sides, 5px margins all sides. */
		padding: 8px;
		margin: 5px;
		/* Reference idle presentation tabs are top-rounded folder tabs
		   (6px top corners, square bottom). */
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		flex-shrink: 0;
		white-space: nowrap;
	}
	.tabbar button:hover:not(.active):not(:disabled) {
		/* Reference .mainTabset .nav-link:hover: 1px #0a6db1 border, radius 3px,
		   no background change. */
		border: 1px solid var(--accent-hover);
		border-radius: 3px;
	}
	.tabbar button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.tabbar button.active {
		/* Reference active main-tab (#notes-tab.active): color #fff. */
		color: var(--text);
		/* Reference active main-tab: bg rgb(12,36,52) = --bg #0c2434 (notes-tabs-bg,
		   the navbar dark, NOT the accent), font-weight 300. */
		background: var(--bg);
		font-weight: 300;
		/* Reference active tab: 3px 3px 0 0 top-rounded folder shape. */
		border-radius: 3px 3px 0 0;
		/* Reference active tab: 1px #0a6db1 border top/right/left; bottom removed
		   (border-bottom-width 0) so the tab merges into the pane below. */
		border-color: var(--accent-hover);
		border-bottom-width: 0;
		/* Extra bottom padding (8px → 15px) drops the tab over the pane edge,
		   matching the reference active-tab rect (37px tall vs 31px idle). */
		padding-bottom: 15px;
		/* Reference active tab pulls 1px down into the pane. */
		margin-bottom: -1px;
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
</style>
