<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import Icon from './Icon.svelte';
	import { brand } from '$lib/stores/brand.svelte';
	import { dnd, setDnd } from '$lib/stores/dnd.svelte';
	import { prefs, setPref } from '$lib/stores/prefs.svelte';

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
		 * True while the room is being recorded. Renders the reference's
		 * `[ REC ]` indicator (li.recIndicator) between the talking indicator and
		 * the volume dropdown, colored --presenter-recording-color (#45a2ff).
		 * Defaults to false so the member/idle navbar matches the verified viewer
		 * capture (no [ REC ] visible). Additive — the parent contract is unchanged.
		 */
		recording?: boolean;
		/**
		 * Presenter broadcast controls (Share screen / Camera / Mic / CC / Music /
		 * New poll / Record / Go live / Members). Rendered inline in the main nav.
		 * The snippet's own caps gating hides it entirely for members. In the
		 * reference these are the 14 *ngIf placeholders that sit between the
		 * talking indicator and the volume dropdown, so the group renders there.
		 */
		actions?: Snippet;
		/** Set the remote-audio output level for this listener (0..1). Wired to
		    ScreenShareRoom.setRemoteAudioVolume in the room page. */
		onVolume?: (v: number) => void;
		/** Mute/unmute remote audio for this listener. Wired to muteRemoteAudio. */
		onMuteAudio?: (muted: boolean) => void;
	}
	let {
		roomName = 'Trading Room',
		userCount,
		onToggleSidebar,
		onReload,
		onMobileInfo,
		speaker = null,
		recording = false,
		actions,
		onVolume,
		onMuteAudio
	}: Props = $props();

	// Volume slider (0..100) + local mute are UI state owned here; their EFFECT on the
	// presenter audio flows through onVolume/onMuteAudio. Default 100 = full volume so
	// the displayed slider matches the actual output (no silent attenuation).
	let volumeOpen = $state(false);
	let volume = $state(100);
	let muted = $state(false);

	// The six sound rows are NOW backed by the real stores (no local shadow state).
	//
	// POLARITY (the reference's inverted *-donot-disturb model): a dnd flag is
	// `true = SUPPRESSED`. The checkbox reads as the POSITIVE "sound on" state, so
	// `checked = !dnd[key]` and toggling it writes `setDnd(key, !checked)`. The status
	// word is therefore the inverse of the flag (`dnd[key] ? 'off' : 'on'`). The master
	// "Don't Disturb" row maps straight to `dnd.app` (checked = DND on). Subtitles maps
	// to the `captionsOverlay` pref (the speech-recognition overlay toggle).
	function liveVolume(e: Event) {
		const v = Number((e.currentTarget as HTMLInputElement).value);
		volume = v;
		onVolume?.(v / 100);
	}
	function toggleMute() {
		muted = !muted;
		onMuteAudio?.(muted);
	}
</script>

<nav class="topnav">
	<button
		class="icon-btn menu-btn"
		onclick={onToggleSidebar}
		aria-label="Open Sidebar"
		title="Open Sidebar"
	>
		<Icon name="bars" size={18} />
	</button>

	<span class="users" title="Users Connected">
		<Icon name="user" size={14} />
		<span class="count">{userCount}</span>
	</span>

	<button
		class="icon-btn mobile-btn"
		onclick={onMobileInfo}
		aria-label="Launch in Mobile App"
		title="Launch in Mobile App"
	>
		<Icon name="mobile" size={16} />
	</button>

	<!-- Reference a.navbar-brand.ml-1.mr-auto (report.md:297,346): a block anchor,
	     padding 5px 0, margin-left 4px, margin-right:auto — the mr-auto is what
	     pins everything after it to the right edge (no spacer element). -->
	<a class="brand" href={resolve('/rooms')}>
		<img class="brand-logo" src={brand.logo} alt={brand.name} width="40" height="40" />
		<span class="room-name">{roomName}</span>
	</a>

	<!-- Reference li.talkingIndicator: while idle it renders the literal
	     "( No one is speaking )" (captured at rect 1713,4,167,41 in the presenter
	     capture; odds-room-shell.md:114-116). While someone talks: fa-microphone +
	     speaker name + the animated talkingWaveform. Our waveform is an
	     asset-free inline equalizer standing in for /assets/images/talking.gif. -->
	{#if speaker}
		<span class="talking">
			<Icon name="microphone" size={16} />
			<span class="talking-string">{speaker}</span>
			<span class="talking-wave" aria-hidden="true">
				<span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"
				></span>
			</span>
		</span>
	{:else}
		<span class="talking idle">( No one is speaking )</span>
	{/if}

	<!-- Reference li.recIndicator is the 2nd right-cluster child — right after the
	     talking indicator, BEFORE the broadcast controls (report.md structure). -->
	{#if recording}
		<span class="rec-indicator">[ REC ]</span>
	{/if}

	<!-- Presenter broadcast controls. In the reference these are the 14 *ngIf
	     placeholders between the talking indicator and the volume dropdown, so
	     the group renders here (not via the spacer ahead of talking). The
	     snippet's own caps gating renders nothing for members. -->
	{#if actions}
		<div class="nav-controls">{@render actions()}</div>
	{/if}

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
				<!-- Captured open volumeControl: h4 "Volume" at 24px with a float-right
				     24px fa-times close (proroom-full-presenter.json states["dropdown:3"]). -->
				<h4 class="panel-title">
					Volume
					<button
						class="panel-close"
						onclick={() => (volumeOpen = false)}
						aria-label="Close volume settings"
						title="Close"
					>
						<Icon name="times" size={24} />
					</button>
				</h4>

				<input
					id="nav-volume"
					name="volume"
					class="vol-ctrl"
					type="range"
					min="0"
					max="100"
					value={volume}
					oninput={liveVolume}
					disabled={muted}
					aria-label="Volume"
				/>

				<button class="mute" class:on={muted} onclick={toggleMute} title="Mute Audio">
					{muted ? 'Unmute' : 'Mute'}
				</button>

				<hr class="divider" />

				<!-- Row set, input names, and label text captured verbatim from the open
				     dropdown (fragment-pages/navbars-room.html.html;
				     components-settings.md:201-223). -->
				<div class="sound-options">
					<label>
						<input
							id="alert-donot-disturb"
							name="alert-donot-disturb"
							type="checkbox"
							checked={!dnd.alert}
							onchange={(e) => setDnd('alert', !e.currentTarget.checked)}
						/>
						Alert sound <span class="status">{dnd.alert ? 'off' : 'on'}</span>
					</label>
					<label>
						<input
							id="qa-donot-disturb"
							name="qa-donot-disturb"
							type="checkbox"
							checked={!dnd.qa}
							onchange={(e) => setDnd('qa', !e.currentTarget.checked)}
						/>
						QA sound <span class="status">{dnd.qa ? 'off' : 'on'}</span>
					</label>
					<label>
						<input
							id="non-trade-donot-disturb"
							name="non-trade-donot-disturb"
							type="checkbox"
							checked={!dnd.nonTradeAlert}
							onchange={(e) => setDnd('nonTradeAlert', !e.currentTarget.checked)}
						/>
						NTA sound <span class="status">{dnd.nonTradeAlert ? 'off' : 'on'}</span>
					</label>
					<label>
						<input
							id="chat-donot-disturb"
							name="chat-donot-disturb"
							type="checkbox"
							checked={!dnd.chat}
							onchange={(e) => setDnd('chat', !e.currentTarget.checked)}
						/>
						Chat sound <span class="status">{dnd.chat ? 'off' : 'on'}</span>
					</label>
					<label title="Show Speech Recognition Overlay">
						<input
							id="presentation-subtitles"
							name="presentation-subtitles"
							type="checkbox"
							checked={prefs.captionsOverlay}
							onchange={(e) => setPref('captionsOverlay', e.currentTarget.checked)}
							aria-label="Show Speech Recognition Overlay"
						/>
						<Icon name="closed-captioning" size={16} />
						Subtitles <span class="status">{prefs.captionsOverlay ? 'on' : 'off'}</span>
					</label>
					<label>
						<input
							id="app-donot-disturb"
							name="app-donot-disturb"
							type="checkbox"
							checked={dnd.app}
							onchange={(e) => setDnd('app', e.currentTarget.checked)}
						/>
						Don't Disturb
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
		/* Reference nav.fixed-top computes z-index 1030 (report.md:105,327). */
		z-index: 1030;
		display: flex;
		align-items: center;
		/* Reference mainAppNav: padding 0 on all sides; horizontal spacing comes
		   from each control's own margins (bars/users/mobile ≈ 5px, nav-links 5px),
		   not a nav gap. */
		gap: 0;
		padding: 0;
		/* Reference mainAppNav computes rgb(12,36,52) = #0c2434 (--navbar-bg,
		   report.md:105,330) with NO bottom border. font: Open Sans 300, 16px/24px. */
		background: var(--navbar-bg, #0c2434);
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
	   0 5px margin, --sidebar-menu-bg #103d5c (report.md:341,2212), 1px
	   transparent border, white 18px glyph on an 18px/27px line box so the pill
	   measures 28x31 (report.md:2203-2204). */
	.menu-btn {
		background: var(--sidebar-menu-bg, #103d5c);
		border: 1px solid transparent;
		padding: 1px 5px;
		margin: 0 5px;
		line-height: 27px;
	}
	/* Reference .sidebar-menu:hover recolors to #eee (report.md:2211); the
	   mobile button's only hover change is cursor:pointer (report.md:2242). */
	.menu-btn:hover:not(:disabled) {
		color: #eee;
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
	/* Volume + reload nav-links resting at #abb0b5; on hover/focus they turn
	   #45a2ff (--app-link-color in the presenter theme), NOT just opacity-dim,
	   matching the reference `.navbar-dark .navbar-nav .nav-link:hover{color:
	   var(--app-link-color)}`. The hover color targets the glyph via the merged
	   .nav-muted-icon class on Icon.svelte's inner <i>, which needs :global. */
	.nav-link-btn:hover:not(:disabled) :global(.nav-muted-icon),
	.nav-link-btn:focus-visible:not(:disabled) :global(.nav-muted-icon) {
		color: var(--accent);
	}
	.users {
		display: inline-flex;
		align-items: center;
		/* Reference span.users computed gap is `normal` (no flex gap) — the fa-user +
		   count spacing is intrinsic, keeping the pill at its true ~24px width. */
		gap: normal;
		/* Reference span.users: fa-user + count, 14px / 21px weight 300, padding
		   1px 5px, margin 0 5px, with a 1px SOLID WHITE border box
		   (--users-color #fff, --users-border-color #fff). */
		color: var(--text);
		font-size: 14px;
		line-height: 21px;
		font-weight: 300;
		padding: 1px 5px;
		/* Reference span.users margin is 0 4px (ml-1/mr-1, report.md:343,2222). */
		margin: 0 4px;
		border: 1px solid #fff;
		/* Reference users pill carries cursor:pointer (report.md:406). */
		cursor: pointer;
	}
	.count {
		/* Reference count text inherits the .users weight (300), not bold. */
		font-weight: 300;
		color: var(--text);
	}
	.brand {
		/* Reference a.navbar-brand: padding 5px 0, margin-left 4px,
		   margin-right:auto pushes the right cluster to the edge
		   (report.md:346,349). Brand renders the configurable logo (see
		   $lib/brand) + the room name in Open Sans light 20px/300. */
		display: inline-flex;
		align-items: center;
		gap: 10px;
		white-space: nowrap;
		padding: 5px 0;
		margin-left: 4px;
		margin-right: auto;
		color: inherit;
		text-decoration: none;
	}
	.brand-logo {
		/* Reference img.brand-logo constraints: max-width 200px, max-height 40px,
		   height auto (report.md:347,2276). Width follows the asset's aspect. */
		max-width: 200px;
		max-height: 40px;
		height: auto;
		width: auto;
		display: block;
		flex: 0 0 auto;
	}
	.room-name {
		font-weight: 300;
		font-size: 20px;
		line-height: 30px;
	}
	.talking {
		/* Reference a.talking: white, 16px/300, line-height 41px, margin 0 5px,
		   inline-flex centered, cursor:pointer (report.md:368,413); container
		   max-width 400px. */
		display: inline-flex;
		align-items: center;
		max-width: 400px;
		max-height: 47px;
		color: var(--text);
		font-size: 16px;
		line-height: 41px;
		margin: 0 5px;
		white-space: nowrap;
		cursor: pointer;
		animation: fade-in 0.25s ease;
	}
	/* Reference .talkingIndicator .talking-string: 14px, margin 0 5px,
	   max-width 250px, nowrap — hidden overflow + ellipsis on the SAME element
	   so long speaker names truncate (report.md:370,417). */
	.talking-string {
		font-size: 14px;
		margin: 0 5px;
		max-width: 250px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	/* Active-speaker animated equalizer (reference .talkingWaveform, max 30x25px).
	   4 white bars pulsing on a stagger — an inline, asset-free waveform. */
	.talking-wave {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		/* Reference img#talkingLevelsImg renders ~22x25 with max-width:30px
		   (report.md:372). */
		width: 22px;
		height: 25px;
		max-width: 30px;
		margin: 0 2px;
	}
	.talking-wave .bar {
		flex: 1;
		background: var(--text);
		border-radius: 1px;
		transform-origin: bottom;
		animation: talking-eq 0.9s ease-in-out infinite;
	}
	.talking-wave .bar:nth-child(1) {
		animation-delay: 0s;
	}
	.talking-wave .bar:nth-child(2) {
		animation-delay: 0.2s;
	}
	.talking-wave .bar:nth-child(3) {
		animation-delay: 0.4s;
	}
	.talking-wave .bar:nth-child(4) {
		animation-delay: 0.15s;
	}
	@keyframes talking-eq {
		0%,
		100% {
			height: 30%;
		}
		50% {
			height: 100%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.talking-wave .bar {
			animation: none;
			height: 60%;
		}
	}
	/* Reference li.recIndicator > a: --presenter-recording-color #45a2ff,
	   line-height 41px, max-width 117px, display:inline-block, margin 0 5px. */
	.rec-indicator {
		display: inline-block;
		max-width: 117px;
		/* Measured rgb(69,162,255) = #45a2ff, --presenter-recording-color
		   (report.md:373,388). Reference recording state blinks (.blinking-rec,
		   1s step-start — presenter capture stylesheet @690807). */
		color: #45a2ff;
		line-height: 41px;
		margin: 0 5px;
		white-space: nowrap;
		cursor: pointer;
		animation: rec-blink 1s step-start infinite;
	}
	@keyframes rec-blink {
		50% {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.rec-indicator {
			animation: fade-in 0.25s ease;
		}
	}
	.talking.idle {
		cursor: default;
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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
	/* When the presenter cluster renders nothing (member), collapse the wrapper
	   so it injects no dead space (:empty has no rendered .ctrl children). */
	.nav-controls:empty {
		display: none;
		margin: 0;
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
	/* Reference div.dropdown-menu.volumeControl: text-align:center; color
	   #ccc (--light-gray, report.md:2319); background --darker-black (#111);
	   border 1px solid rgb(250,250,250); radius 6px; padding 8px 0; z-index 1000
	   (report.md:1803-1809). dropstart ⇒ opens to the LEFT of the toggle
	   (report.md:429). */
	.volume-panel {
		position: absolute;
		top: 0;
		right: calc(100% + 2px);
		/* Captured open panel rect: 160x334, right edge at the toggle's left
		   (proroom-full-presenter.json states["dropdown:3"]: 1718,1,160,334). */
		width: 160px;
		text-align: center;
		background: #111;
		border: 1px solid rgb(250, 250, 250);
		border-radius: 6px;
		padding: 8px 0;
		color: #ccc;
		z-index: 1000;
	}
	/* Captured h4 "Volume" renders at 24px with the float-right 24px close. */
	.panel-title {
		margin: 0 0 0.5rem;
		font-size: 24px;
		font-weight: 500;
		/* Reference h4 inherits the panel #ccc (not explicit white). */
		color: #ccc;
		text-align: center;
	}
	.panel-close {
		float: right;
		margin-right: 0.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #abb0b5;
		line-height: 0;
		padding: 0;
		cursor: pointer;
	}
	.panel-close:hover {
		color: #fff;
	}
	/* Captured input.volCtrl: 129x32, thumb/progress #0d6efd (--bs-primary). */
	.vol-ctrl {
		width: 129px;
		height: 32px;
		margin: 0.3rem 0 0.6rem;
		accent-color: #0d6efd;
	}
	.vol-ctrl:disabled {
		opacity: 0.5;
	}
	/* Reference button.btn.btn-primary.btn-sm "Mute" — primary = room accent. */
	.mute {
		display: inline-block;
		background: var(--accent);
		border: 1px solid var(--accent);
		color: #fff;
		border-radius: var(--radius);
		padding: 0.25rem 0.7rem;
		font-size: 0.875rem;
		font-weight: 400;
		cursor: pointer;
	}
	.mute:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.mute.on {
		background: var(--negative);
		border-color: var(--negative);
	}
	/* Reference div.dropdown-divider: --dropdown-divider-bg #45a2ff
	   (report.md:1810). */
	.divider {
		border: none;
		border-top: 1px solid #45a2ff;
		margin: 0.6rem 0;
		width: 100%;
	}
	/* Reference .room-sound-options: text-align:left; padding-left:30px. Each row
	   is div.my-1 > input.form-check-input + label.form-check-label. */
	.sound-options {
		text-align: left;
		padding-left: 30px;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.sound-options label {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		/* Reference sound rows: 16px, #ccc (report.md:1819-1820). */
		font-size: 16px;
		color: #ccc;
		cursor: pointer;
	}
	.sound-options label:hover {
		opacity: 0.85;
	}
	.sound-options input[type='checkbox'] {
		accent-color: var(--accent);
	}
	.sound-options .status {
		margin-left: auto;
		font-size: 0.75rem;
		color: #ccc;
	}
</style>
