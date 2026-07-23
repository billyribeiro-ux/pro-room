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
		/** When true, the captions overlay is shown (the viewer's CC toggle). */
		captionsActive?: boolean;
		/** Live caption broadcast from the presenter (speaker + text), via the WS. */
		captionSpeaker?: string;
		captionText?: string;
		/** When true, capture local speech + emit finalized phrases (presenter). */
		captureCaptions?: boolean;
		/** Emit a finalized caption phrase (the room page POSTs it to broadcast). */
		onCaption?: (text: string) => void;
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
		captionSpeaker,
		captionText,
		captureCaptions = false,
		onCaption,
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
				class:notes-tab={t.id === 'notes'}
				disabled={locked && t.id !== 'screens'}
				onclick={() => (tab = t.id)}
			>
				<Icon name={t.icon} size={12} />
				{t.label}
			</button>
			{#if t.id === 'screens'}
				<!-- Reference ships a "Streams" tab hidden behind its streaming infra as
				     li:nth-child(2), between Screens and Notes (report.md:770). Mirrored
				     as a hidden, inert placeholder for DOM parity. -->
				<button
					type="button"
					class="stream-tab-placeholder"
					hidden
					tabindex="-1"
					aria-hidden="true"
				>
					<Icon name="podcast" size={12} /> Streams
				</button>
			{/if}
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
		<CaptionsOverlay
			active={captionsActive}
			capture={captureCaptions}
			speaker={captionSpeaker}
			text={captionText}
			{onCaption}
		/>

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
		/* Reference .presentation-box: background var(--presenter-area-bg) #0f2e43
		   (report.md:135-137,203,2576). */
		background: var(--presenter-area-bg, #0f2e43);
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
		/* #mainTabs itself is transparent — the panel's #0f2e43 shows through
		   (report.md:137,2389). */
		background: transparent;
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
		/* HARD EVIDENCE (LIVE room cascade): `.mainTabset .nav-link { color:
		   var(--tabs-color) }` with the room's `:root { --tabs-color: #fff }`. */
		color: var(--tabs-color, #ffffff);
		font-size: 12px;
		font-weight: 300;
		line-height: 12px;
		/* Reference idle .nav-link: 8px padding all sides, 5px margins all sides. */
		padding: 8px;
		margin: 5px;
		/* HARD EVIDENCE: idle tab top corners radius 6px (border-top-*-radius:6px),
		   bottom corners square. */
		border-top-left-radius: 6px;
		border-top-right-radius: 6px;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		cursor: pointer;
		flex-shrink: 0;
		white-space: nowrap;
	}
	.tabbar button:hover:not(.active):not(:disabled) {
		/* Reference .nav-link:hover winner: 1px solid var(--tabs-border-color)
		   #0a6db1, radius 3px, no background change (report.md:2460,854,732). */
		border: 1px solid var(--tabs-border-color, #0a6db1);
		border-radius: 3px;
	}
	.tabbar button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	/* HARD EVIDENCE (stylesheet): `.mainTabset .nav-link.active { background-color:
	   var(--tab-active-bg); border-color: transparent; border-radius: 3px }` —
	   generic active tabs are a flat 3px-radius pill, NO folder border. */
	.tabbar button.active {
		color: #fff;
		background: var(--tab-active-bg, #45a2ff);
		font-weight: 300;
		border-color: transparent;
		border-radius: 3px;
	}
	/* HARD EVIDENCE (stylesheet): ONLY the active NOTES tab is the folder —
	   `.mainTabset .presAreaTabs-notes.active { border-bottom: transparent;
	   padding-bottom: 15px; margin-bottom: -1px; border-radius: 3px 3px 0 0;
	   background-color: var(--notes-tabs-bg) }` + `.presAreaTabs-notes.active
	   { position: relative; z-index: 10 }`, with the #0a6db1 top/right/left border
	   (computed a#notes-tab.active: rgb(10,109,177) 1px, bottom 0). */
	.tabbar button.active.notes-tab {
		background: var(--notes-tabs-bg, #0c2434);
		border-top: 1px solid var(--tabs-border-color, #0a6db1);
		border-right: 1px solid var(--tabs-border-color, #0a6db1);
		border-left: 1px solid var(--tabs-border-color, #0a6db1);
		border-bottom: 0;
		border-radius: 3px 3px 0 0;
		padding-bottom: 15px;
		margin-bottom: -1px;
		position: relative;
		z-index: 10;
	}
	/* HARD EVIDENCE (proroom-modals-and-deep.md File 3 §"Responsive deltas",
	   docs/reference/captures/proroom-deep-member-833px.json @ innerWidth 833):
	   at ≤833px the active-tab treatment flips from the #45a2ff pill (wide) to
	   the navy #0c2434 folder tab bordered #0a6db1 — measured on the (then
	   default-active) Notes tab: bg rgb(12,36,52), color #fff, height 36.5px,
	   padding-bottom 15px, margin-bottom -1px, border-bottom-width 0px,
	   border-top/right/left-color rgb(10,109,177) #0a6db1, border-top-radius 3px.
	   Finding 1: this is the generic active-tab treatment at the breakpoint, so it
	   applies to whichever tab is active (Screens/Notes/Files), not just Notes. */
	@media (max-width: 833px) {
		.tabbar button.active {
			background: var(--notes-tabs-bg, #0c2434);
			color: #fff;
			border-top: 1px solid var(--tabs-border-color, #0a6db1);
			border-right: 1px solid var(--tabs-border-color, #0a6db1);
			border-left: 1px solid var(--tabs-border-color, #0a6db1);
			border-bottom: 0;
			border-radius: 3px 3px 0 0;
			padding-bottom: 15px;
			margin-bottom: -1px;
			position: relative;
			z-index: 10;
		}
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
