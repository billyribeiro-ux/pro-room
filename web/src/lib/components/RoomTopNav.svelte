<script lang="ts">
	import {
		ListIcon,
		UsersIcon,
		DeviceMobileIcon,
		SpeakerHighIcon,
		SpeakerSlashIcon,
		ArrowsClockwiseIcon,
		ClosedCaptioningIcon,
		XIcon
	} from 'phosphor-svelte';

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
	}
	let {
		roomName = 'Trading Room',
		userCount,
		onToggleSidebar,
		onReload,
		onMobileInfo,
		speaker = null
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
		class="icon-btn"
		onclick={onToggleSidebar}
		aria-label="Toggle sidebar"
		title="Toggle sidebar"
	>
		<ListIcon size={18} />
	</button>

	<span class="users" title="Users connected">
		<UsersIcon size={16} />
		<span class="count">{userCount}</span>
	</span>

	<button
		class="icon-btn"
		onclick={onMobileInfo}
		aria-label="Launch in mobile app"
		title="Launch in mobile app"
	>
		<DeviceMobileIcon size={16} />
	</button>

	<span class="brand">{roomName}</span>

	<span class="talking">
		{#if speaker}
			( {speaker} is speaking )
		{:else}
			( No one is speaking )
		{/if}
	</span>

	<span class="spacer"></span>

	<div class="volume">
		<button
			class="icon-btn"
			onclick={() => (volumeOpen = !volumeOpen)}
			aria-label="Volume settings"
			aria-expanded={volumeOpen}
			title="Volume settings"
		>
			{#if muted}
				<SpeakerSlashIcon size={16} />
			{:else}
				<SpeakerHighIcon size={16} />
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
						<XIcon size={14} />
					</button>
				</div>

				<label class="vol-row">
					<span class="vol-label">Volume</span>
					<input
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
						<input type="checkbox" bind:checked={alertSound} />
						Alert sound <span class="status">{alertSound ? 'on' : 'off'}</span>
					</label>
					<label>
						<input type="checkbox" bind:checked={qaSound} />
						QA sound <span class="status">{qaSound ? 'on' : 'off'}</span>
					</label>
					<label>
						<input type="checkbox" bind:checked={ntaSound} />
						NTA sound <span class="status">{ntaSound ? 'on' : 'off'}</span>
					</label>
					<label>
						<input type="checkbox" bind:checked={chatSound} />
						Chat sound <span class="status">{chatSound ? 'on' : 'off'}</span>
					</label>
					<label title="Show Speech Recognition Overlay">
						<input
							type="checkbox"
							bind:checked={subtitles}
							aria-label="Show Speech Recognition Overlay"
						/>
						<ClosedCaptioningIcon size={14} />
						Subtitles <span class="status">{subtitles ? 'on' : 'off'}</span>
					</label>
					<label>
						<input type="checkbox" bind:checked={dontDisturb} />
						Don't Disturb <span class="status">{dontDisturb ? 'on' : 'off'}</span>
					</label>
				</div>
			</div>
		{/if}
	</div>

	<button class="icon-btn" onclick={onReload} aria-label="Reload" title="Reload">
		<ArrowsClockwiseIcon size={16} />
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
		gap: 0.6rem;
		padding: 0 0.75rem;
		background: var(--bg-elev);
		border-bottom: 1px solid var(--border);
		color: var(--text);
	}
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.35rem;
		line-height: 0;
	}
	.icon-btn:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--accent);
	}
	.icon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.users {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--text-dim);
		font-size: 0.85rem;
	}
	.count {
		font-weight: 700;
		color: var(--text);
	}
	.brand {
		font-weight: 700;
		font-size: 0.95rem;
		white-space: nowrap;
	}
	.talking {
		color: var(--text-dim);
		font-size: 0.8rem;
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
