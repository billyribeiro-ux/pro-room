<script lang="ts">
	import {
		List,
		Users,
		DeviceMobile,
		SpeakerHigh,
		SpeakerSlash,
		ArrowsClockwise
	} from 'phosphor-svelte';

	interface Props {
		roomName?: string;
		userCount: number;
		onToggleSidebar: () => void;
		onReload: () => void;
	}
	let {
		roomName = 'Revolution Trading Room',
		userCount,
		onToggleSidebar,
		onReload
	}: Props = $props();

	// Local-only UI state — no backend wiring yet.
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
	<button class="icon-btn" onclick={onToggleSidebar} aria-label="Toggle sidebar" title="Toggle sidebar">
		<List size={18} />
	</button>

	<span class="users" title="Users connected">
		<Users size={16} />
		<span class="count">{userCount}</span>
	</span>

	<button class="icon-btn" aria-label="Launch in mobile app" title="Launch in mobile app" disabled>
		<DeviceMobile size={16} />
	</button>

	<span class="brand">{roomName}</span>

	<span class="talking">( No one is speaking )</span>

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
				<SpeakerSlash size={16} />
			{:else}
				<SpeakerHigh size={16} />
			{/if}
		</button>

		{#if volumeOpen}
			<div class="volume-panel">
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
					<label><input type="checkbox" bind:checked={alertSound} /> Alert sound</label>
					<label><input type="checkbox" bind:checked={qaSound} /> QA sound</label>
					<label><input type="checkbox" bind:checked={ntaSound} /> NTA sound</label>
					<label><input type="checkbox" bind:checked={chatSound} /> Chat sound</label>
					<label><input type="checkbox" bind:checked={subtitles} /> Subtitles</label>
					<label><input type="checkbox" bind:checked={dontDisturb} /> Don't Disturb</label>
				</div>
			</div>
		{/if}
	</div>

	<button class="icon-btn" onclick={onReload} aria-label="Reload" title="Reload">
		<ArrowsClockwise size={16} />
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
</style>
