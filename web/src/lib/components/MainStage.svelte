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
		 * Presenter camera feeds, rendered as an absolute overlay floated at the
		 * bottom of the presentation panel (matches the reference's
		 * `app-webcam-holder` placement). Hidden when empty.
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
	<div class="tabbar" role="tablist" aria-label="Room panels">
		{#each TABS as t (t.id)}
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === t.id}
				class:active={activeTab === t.id}
				class:notes-active={activeTab === t.id && t.id === 'notes'}
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

		{#if webcamPublishers.length > 0}
			<!-- Reference app-webcam-holder floats ABSOLUTE at the bottom of the
			     presentation area, overlaying the screen (not an in-flow strip).
			     Only renders with a live camera publisher → live-verify placement. -->
			<div class="webcam-overlay">
				<WebcamHolder publishers={webcamPublishers} onClose={onWebcamClose} />
			</div>
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
		/* Reference presentation-box is a flat, borderless surface (no border, radius 0). */
		border: none;
		border-radius: 0;
		overflow: hidden;
		background: var(--bg-elev);
	}
	/* Reference app-webcam-holder: absolute, pinned to the bottom of the
	   presentation area, floating over the screen. */
	.webcam-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 5;
		/* Clicks fall through the empty overlay; the tiles re-enable themselves. */
		pointer-events: none;
	}
	.webcam-overlay :global(.holder) {
		pointer-events: auto;
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
		/* Reference idle main tabs: 6px radius, transparent (no fill until hover/active). */
		border-radius: 6px;
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
		/* Reference active main-tab is a flat #45a2ff PILL — confirmed by the
		   captured computed style of #screens-tab.active: bg rgb(69,162,255),
		   white text, transparent border, 3px radius (NOT the dark folder). */
		color: #fff;
		background: var(--accent, #45a2ff);
		font-weight: 300;
		border-color: transparent;
		border-radius: 3px;
	}
	.tabbar button.active.notes-active {
		/* Reference quirk: the active NOTES tab uses the dark notes-pane bg
		   (--notes-tabs-bg #0c2434) instead of the blue pill. */
		background: var(--bg, #0c2434);
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
