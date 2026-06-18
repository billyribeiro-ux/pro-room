<script lang="ts">
	import type { Snippet } from 'svelte';
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
		aria-label="Launch in mobile app"
		title="Launch in mobile app"
	>
		<Icon name="mobile" size={16} />
	</button>

	<span class="brand">
		<img class="brand-logo" src={brand.logo} alt={brand.name} width="32" height="32" />
		<span class="room-name">{roomName}</span>
	</span>

	<!-- Reference: navbar-brand carries mr-auto and the action group is
	     ul.navbar-nav.ml-auto, so everything actionable is pinned RIGHT. The
	     spacer reproduces mr-auto; the right cluster order matches the verified
	     viewer capture: talking indicator → presenter controls (*ngIf
	     placeholders) → [ REC ] → volume (dropstart) → reload. -->
	<span class="spacer"></span>

	<!-- Reference li.talkingIndicator > a.talking (verified live DOM):
	     fa-microphone + the bare speaker name + the animated talkingWaveform, in
	     that order — and the whole indicator is *ngIf'd (ng-star-inserted), i.e. it
	     renders ONLY while someone is speaking (no "( No one is speaking )" idle
	     text). Our waveform is an asset-free inline SVG equalizer standing in for
	     the reference's /assets/images/talking.gif. -->
	{#if speaker}
		<span class="talking">
			<Icon name="microphone" size={14} />
			<span class="talking-string">{speaker}</span>
			<span class="talking-wave" aria-hidden="true">
				<span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="bar"
				></span>
			</span>
		</span>
	{/if}

	<!-- Presenter broadcast controls. In the reference these are the 14 *ngIf
	     placeholders between the talking indicator and the volume dropdown, so
	     the group renders here (not via the spacer ahead of talking). The
	     snippet's own caps gating renders nothing for members. -->
	{#if actions}
		<div class="nav-controls">{@render actions()}</div>
	{/if}

	{#if recording}
		<span class="rec-indicator">[ REC ]</span>
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
				<Icon name="volume-mute" size={18} class="nav-muted-icon" />
			{:else}
				<Icon name="volume-up" size={18} class="nav-muted-icon" />
			{/if}
		</button>

		{#if volumeOpen}
			<div class="volume-panel">
				<h4 class="panel-title">
					Volume
					<button
						class="panel-close"
						onclick={() => (volumeOpen = false)}
						aria-label="Close volume settings"
						title="Close"
					>
						<Icon name="times" size={16} />
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

				<div class="sound-options">
					<label>
						<input
							id="snd-alert"
							name="alertSound"
							type="checkbox"
							checked={!dnd.alert}
							onchange={(e) => setDnd('alert', !e.currentTarget.checked)}
						/>
						Alert sound <span class="status">{dnd.alert ? 'off' : 'on'}</span>
					</label>
					<label>
						<input
							id="snd-qa"
							name="qaSound"
							type="checkbox"
							checked={!dnd.qa}
							onchange={(e) => setDnd('qa', !e.currentTarget.checked)}
						/>
						QA sound <span class="status">{dnd.qa ? 'off' : 'on'}</span>
					</label>
					<label>
						<input
							id="snd-nta"
							name="ntaSound"
							type="checkbox"
							checked={!dnd.nonTradeAlert}
							onchange={(e) => setDnd('nonTradeAlert', !e.currentTarget.checked)}
						/>
						NTA sound <span class="status">{dnd.nonTradeAlert ? 'off' : 'on'}</span>
					</label>
					<label>
						<input
							id="snd-chat"
							name="chatSound"
							type="checkbox"
							checked={!dnd.chat}
							onchange={(e) => setDnd('chat', !e.currentTarget.checked)}
						/>
						Chat sound <span class="status">{dnd.chat ? 'off' : 'on'}</span>
					</label>
					<label title="Show Speech Recognition Overlay">
						<input
							id="snd-subtitles"
							name="subtitles"
							type="checkbox"
							checked={prefs.captionsOverlay}
							onchange={(e) => setPref('captionsOverlay', e.currentTarget.checked)}
							aria-label="Show Speech Recognition Overlay"
						/>
						<Icon name="closed-captioning" size={14} />
						Subtitles <span class="status">{prefs.captionsOverlay ? 'on' : 'off'}</span>
					</label>
					<label>
						<input
							id="snd-dnd"
							name="dontDisturb"
							type="checkbox"
							checked={dnd.app}
							onchange={(e) => setDnd('app', e.currentTarget.checked)}
						/>
						Don't Disturb <span class="status">{dnd.app ? 'on' : 'off'}</span>
					</label>
				</div>
			</div>
		{/if}
	</div>

	<button class="icon-btn nav-link-btn" onclick={onReload} aria-label="Reload" title="Reload">
		<Icon name="sync" size={18} class="nav-muted-icon" />
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
	/* Bars / users / mobile icon-links dim on hover. Volume + reload nav-links
	   instead recolor to #45a2ff (rule below) — a pure color change with no
	   opacity dim, matching the reference nav-link:hover. */
	.icon-btn:not(.nav-link-btn):hover:not(:disabled) {
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
		   30px). We now render the configurable BRAND logo (see $lib/brand) followed
		   by the room name in the reference's Open Sans light, 20px, weight 300. */
		display: inline-flex;
		align-items: center;
		gap: 10px;
		white-space: nowrap;
	}
	.brand-logo {
		/* Scale any drop-in logo to the navbar height; width follows the asset. */
		height: 32px;
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
		/* Reference a inside li.talkingIndicator: pure white (#fff = --text,
		   --presenter-noRecording-color), 12px (.talkingIndicator a font-size:12px),
		   line-height 41px, margin 0 5px, display:inline-flex align-items:center (so
		   the mic glyph + waveform sit on the text baseline). max-width 400px, ellipsis. */
		display: inline-flex;
		align-items: center;
		max-width: 400px;
		max-height: 47px;
		color: var(--text);
		font-size: 12px;
		line-height: 41px;
		margin: 0 5px;
		white-space: nowrap;
		text-overflow: ellipsis;
		animation: fade-in 0.25s ease;
	}
	/* Reference .talkingIndicator .talking-string: 14px, margin 0 5px,
	   max-width 250px, nowrap, overflow auto/hidden. */
	.talking-string {
		font-size: 14px;
		margin: 0 5px;
		max-width: 250px;
		white-space: nowrap;
		overflow: hidden;
	}
	/* Active-speaker animated equalizer (reference .talkingWaveform, max 30x25px).
	   4 white bars pulsing on a stagger — an inline, asset-free waveform. */
	.talking-wave {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		width: 22px;
		height: 16px;
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
		color: var(--accent);
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
	/* Reference div.dropdown-menu.volumeControl: text-align:center; color
	   --light-gray; background --darker-black (#111); border 1px solid
	   rgb(250,250,250). dropstart => opens to the LEFT of the toggle, so the
	   panel is pinned to the toggle's right edge and grows leftward. */
	.volume-panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		width: 220px;
		text-align: center;
		background: #111;
		border: 1px solid rgb(250, 250, 250);
		/* Reference dropdown-menu border-radius .25rem ≈ 4px. */
		border-radius: 4px;
		padding: 0.7rem;
		color: #abb0b5;
		z-index: 41;
	}
	/* Reference header is an <h4>Volume with a float-right fa-times close. */
	.panel-title {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
		font-weight: 500;
		color: #fff;
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
	/* Reference input.volCtrl range slider: 129x32px, then a <br>. (We keep our
	   accent-color slider styling — the reference's #111 track is a color and
	   intentionally NOT adopted here.) */
	.vol-ctrl {
		width: 129px;
		height: 32px;
		margin: 0.3rem 0 0.6rem;
		accent-color: var(--accent);
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
	/* Reference <hr> + div.dropdown-divider separating the slider/mute from the
	   sound options. */
	.divider {
		border: none;
		border-top: 1px solid rgba(250, 250, 250, 0.3);
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
		font-size: 0.875rem;
		color: #abb0b5;
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
		color: #abb0b5;
	}
</style>
