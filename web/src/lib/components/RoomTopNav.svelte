<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	interface Props {
		/** Room display name shown in the brand slot. Integration phase passes the real room name. */
		roomName?: string;
		/** Live count of connected users. */
		userCount: number;
		/** Collapse/expand the room shell sidebar. */
		onToggleSidebar: () => void;
		/** Hard-reload the room (re-establish realtime + refetch). */
		onReload: () => void;
		/** Opens the mobile-app info modal. Integration phase wires MobileAppInfoModal. */
		onMobileInfo?: () => void;
		/** Name of the user currently speaking; null/undefined shows "No one is speaking". */
		speaker?: string | null;
		/**
		 * Presenter broadcast controls (Share screen / Camera / Mic / CC / Music /
		 * New poll / Record / Go live / Members). Rendered inline in the main nav.
		 * The snippet's own caps gating hides it entirely for members.
		 */
		actions?: Snippet;
	}
	let {
		roomName = 'Trading Room',
		userCount,
		onToggleSidebar,
		onReload,
		onMobileInfo,
		speaker = null,
		actions
	}: Props = $props();

	// Local-only UI state — no backend wiring yet.
	//
	// POLARITY NOTE (do not invert): the reference app models each sound toggle as a
	// `*-donot-disturb` checkbox where CHECKED = SUPPRESS the sound. We deliberately keep
	// these as POSITIVE "sound on" booleans (default true = the user hears the sound) so the
	// UX status word reads truthfully. When these get backend-wired, the mapping is:
	//   sound on (true)  === NOT do-not-disturb
	//   sound off (false) === do-not-disturb / suppressed
	// Wire it through that identity — do NOT pass these booleans straight into a mute/DND flag.
	let volumeOpen = $state(false);
	let volume = $state(80);
	let muted = $state(false);
	let alertSound = $state(true);
	let qaSound = $state(true);
	let ntaSound = $state(true);
	let chatSound = $state(true);
	let subtitles = $state(false);
	let dontDisturb = $state(false);
</script>

<nav class="topnav">
	<button
		class="icon-btn menu-btn"
		onclick={onToggleSidebar}
		aria-label="Toggle sidebar"
		title="Toggle sidebar"
	>
		<Icon name="bars" size={18} />
	</button>

	<span class="users" title="Users connected">
		<Icon name="user" size={14} />
		<span class="count">{userCount}</span>
	</span>

	<button
		class="icon-btn mobile-btn"
		onclick={onMobileInfo}
		aria-label="Launch in mobile app"
		title="Launch in mobile app"
	>
		<Icon name="mobile" size={16} />
	</button>

	<span class="brand">{roomName}</span>

	<!-- Reference: navbar-brand carries mr-auto and the action group is
	     ul.navbar-nav.ml-auto, so everything actionable is pinned RIGHT. The
	     spacer reproduces that gap; the presenter controls sit in the right
	     cluster ahead of the talking indicator + volume + reload. -->
	<span class="spacer"></span>

	{#if actions}
		<div class="nav-controls">{@render actions()}</div>
	{/if}

	<span class="talking">
		{#if speaker}
			( {speaker} is speaking )
		{:else}
			( No one is speaking )
		{/if}
	</span>

	<div class="volume">
		<button
			class="icon-btn nav-link-btn"
			onclick={() => (volumeOpen = !volumeOpen)}
			aria-label="Volume settings"
			aria-expanded={volumeOpen}
			title="Volume settings"
		>
			{#if muted}
				<Icon name="volume-mute" size={32} class="nav-muted-icon" />
			{:else}
				<Icon name="volume-up" size={32} class="nav-muted-icon" />
			{/if}
		</button>

		{#if volumeOpen}
			<div class="volume-panel">
				<div class="panel-head">
					<h4>Volume</h4>
					<button
						class="panel-close"
						onclick={() => (volumeOpen = false)}
						aria-label="Close volume settings"
						title="Close"
					>
						<Icon name="times" size={14} />
					</button>
				</div>

				<label class="vol-row">
					<span class="vol-label">Volume</span>
					<input
						id="nav-volume"
						name="volume"
						type="range"
						min="0"
						max="100"
						bind:value={volume}
						disabled={muted}
						aria-label="Volume"
					/>
				</label>

				<button class="mute" class:on={muted} onclick={() => (muted = !muted)}>
					{muted ? 'Unmute' : 'Mute'}
				</button>

				<hr class="divider" />

				<div class="sound-options">
					<label>
						<input id="snd-alert" name="alertSound" type="checkbox" bind:checked={alertSound} />
						Alert sound <span class="status">{alertSound ? 'on' : 'off'}</span>
					</label>
					<label>
						<input id="snd-qa" name="qaSound" type="checkbox" bind:checked={qaSound} />
						QA sound <span class="status">{qaSound ? 'on' : 'off'}</span>
					</label>
					<label>
						<input id="snd-nta" name="ntaSound" type="checkbox" bind:checked={ntaSound} />
						NTA sound <span class="status">{ntaSound ? 'on' : 'off'}</span>
					</label>
					<label>
						<input id="snd-chat" name="chatSound" type="checkbox" bind:checked={chatSound} />
						Chat sound <span class="status">{chatSound ? 'on' : 'off'}</span>
					</label>
					<label title="Show Speech Recognition Overlay">
						<input
							id="snd-subtitles"
							name="subtitles"
							type="checkbox"
							bind:checked={subtitles}
							aria-label="Show Speech Recognition Overlay"
						/>
						<Icon name="closed-captioning" size={14} />
						Subtitles <span class="status">{subtitles ? 'on' : 'off'}</span>
					</label>
					<label>
						<input id="snd-dnd" name="dontDisturb" type="checkbox" bind:checked={dontDisturb} />
						Don't Disturb <span class="status">{dontDisturb ? 'on' : 'off'}</span>
					</label>
				</div>
			</div>
		{/if}
	</div>

	<button class="icon-btn nav-link-btn" onclick={onReload} aria-label="Reload" title="Reload">
		<Icon name="sync" size={32} class="nav-muted-icon" />
	</button>
</nav>

<style>
	.topnav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 49px;
		z-index: 40;
		display: flex;
		align-items: center;
		/* Reference mainAppNav: padding 0 on all sides; horizontal spacing comes
		   from each control's own margins (bars/users/mobile ≈ 5px, nav-links 5px),
		   not a nav gap. */
		gap: 0;
		padding: 0;
		/* Reference mainAppNav: --navbar-bg is the darkest navy (#0c2434 = --bg),
		   not the elevated surface, and it carries NO bottom border
		   (border-bottom-width: 0). font: Open Sans 300, 16px / 24px. */
		background: var(--bg);
		color: var(--text);
		font-size: 16px;
		font-weight: 300;
		line-height: 24px;
	}
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		/* Reference mainAppNav controls are borderless icon-links in pure white
		   (#fff = --text); volume + reload override to muted gray (#abb0b5) via
		   .nav-muted-icon below. Reference controls are square (border-radius 0). */
		border: none;
		color: var(--text);
		border-radius: 0;
		padding: 0.35rem;
		line-height: 0;
	}
	/* Bars / sidebar toggle = reference span.sidebar-menu: 1px 5px padding,
	   0 5px margin, --sidebar-menu-bg (#103d5c = --bg-elev-2), 1px transparent
	   border, white glyph. */
	.menu-btn {
		background: var(--bg-elev-2);
		border: 1px solid transparent;
		padding: 1px 5px;
		margin: 0 5px;
	}
	/* Volume + reload = reference a.nav-link wrappers: 8px padding, 0 5px margin,
	   no background. */
	.nav-link-btn {
		padding: 8px;
		margin: 0 5px;
	}
	/* Mobile-app launch = reference span.mobile-info-app-btn: a bare 16px white
	   glyph (weight 900) with margin-right 4px and no padding box. */
	.mobile-btn {
		padding: 0;
		margin: 0 4px 0 0;
	}
	.icon-btn:hover:not(:disabled) {
		opacity: 0.8;
	}
	.icon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	/* Volume + reload glyphs: reference renders these as fa-2x (32px) in the
	   navbar's muted-gray nav-link color rgb(171,176,181) (#abb0b5), distinct
	   from --text-dim. The class is merged onto Icon.svelte's inner <i>, so it
	   needs :global to cross the child component's scope boundary. */
	.icon-btn :global(.nav-muted-icon) {
		color: rgb(171, 176, 181);
	}
	.users {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		/* Reference span.users: fa-user + count, 14px / 21px weight 300, padding
		   1px 5px, margin 0 5px, with a 1px SOLID WHITE border box
		   (--users-color #fff, --users-border-color #fff). */
		color: var(--text);
		font-size: 14px;
		line-height: 21px;
		font-weight: 300;
		padding: 1px 5px;
		margin: 0 5px;
		border: 1px solid #fff;
	}
	.count {
		/* Reference count text inherits the .users weight (300), not bold. */
		font-weight: 300;
		color: var(--text);
	}
	.brand {
		/* Reference brand slot is an <img class="brand-logo"> (200x18, line-height
		   30px). OUR brand is text — keep it but match the logo's Open Sans light,
		   20px, weight 300 typography and placement. See FLAG: brand is a logo image
		   in the reference, not text. */
		font-weight: 300;
		font-size: 20px;
		line-height: 30px;
		white-space: nowrap;
	}
	.talking {
		/* Reference a inside li.talkingIndicator: pure white (#fff), 16px,
		   line-height 41px, margin 0 5px — NOT the dim color. */
		color: var(--text);
		font-size: 16px;
		line-height: 41px;
		margin: 0 5px;
		white-space: nowrap;
		animation: fade-in 0.25s ease;
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.spacer {
		flex: 1;
	}
	/* Presenter broadcast controls live inline in the nav (Share screen / Camera /
	   Mic / CC / Music / New poll / Record / Go live / Members). The buttons are
	   rendered from +page's stageActions snippet so they keep +page's .ctrl styling;
	   compact them slightly here to sit in the 49px bar. */
	.nav-controls {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: thin;
		margin: 0 0.5rem;
	}
	/* Reference presenter controls are BARE nav-link icons: muted gray #abb0b5
	   (navbar-dark .nav-link), margin 0 5px, NO background / border / radius.
	   Hover MUST match the reload/volume buttons (.icon-btn): just dim to
	   opacity 0.8 — NO colour change. (The earlier blue #45a2ff hover was wrong.) */
	.nav-controls :global(.ctrl) {
		background: transparent;
		border: none;
		border-radius: 0;
		color: rgb(171, 176, 181);
		padding: 0;
		margin: 0 5px;
		flex-shrink: 0;
	}
	.nav-controls :global(.ctrl i) {
		font-size: 20px !important;
	}
	.nav-controls :global(.ctrl:hover:not(:disabled)) {
		opacity: 0.8;
	}
	/* NO blue anywhere on these controls (per reference + user): even the active
	   broadcast/recording state stays the same muted gray as every other nav icon. */
	.nav-controls :global(.ctrl.stop),
	.nav-controls :global(.ctrl.live-on) {
		color: rgb(171, 176, 181);
	}
	.volume {
		position: relative;
	}
	.volume-panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		width: 210px;
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 41;
	}
	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.panel-head h4 {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--text);
	}
	.panel-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.15rem;
		line-height: 0;
	}
	.panel-close:hover {
		color: var(--text);
	}
	.vol-row {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.vol-label {
		font-size: 0.75rem;
		color: var(--text-dim);
	}
	.vol-row input[type='range'] {
		width: 100%;
		accent-color: var(--accent);
	}
	.mute {
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.35rem 0.6rem;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.mute:hover {
		border-color: var(--accent);
	}
	.mute.on {
		color: var(--negative);
		border-color: var(--negative);
	}
	.divider {
		border: none;
		border-top: 1px solid var(--border);
		margin: 0;
		width: 100%;
	}
	.sound-options {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.sound-options label {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.8rem;
		color: var(--text);
	}
	.sound-options input[type='checkbox'] {
		accent-color: var(--accent);
	}
	.sound-options .status {
		margin-left: auto;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--text-dim);
	}
</style>
