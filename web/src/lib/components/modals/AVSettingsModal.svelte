<script lang="ts">
	import { browser } from '$app/environment';
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Called when the user clicks Save (before the dialog closes). */
		onSave?: (settings: {
			disableVideo: boolean;
			speakerId: string;
			audioInputId: string;
			videoInputId: string;
		}) => void;
		/**
		 * Called when the presenter clicks "Change Devices". The real WebRTC device
		 * switch (replaceTrack on the published media) is wired up by the caller;
		 * this component just surfaces the chosen input ids.
		 */
		onChangeDevices?: (audioInputId: string, videoInputId: string) => void;
	}
	let { open, onClose, onSave, onChangeDevices }: Props = $props();

	type Tab = 'user' | 'presenter';
	let tab = $state<Tab>('user');

	let disableVideo = $state(false);

	let speakers = $state<MediaDeviceInfo[]>([]);
	let mics = $state<MediaDeviceInfo[]>([]);
	let cameras = $state<MediaDeviceInfo[]>([]);

	let selectedSpeaker = $state('');
	let selectedMic = $state('');
	let selectedCamera = $state('');

	// True once we've successfully read at least one labelled device — labels are
	// only exposed after getUserMedia permission has been granted, so an empty
	// label set is our signal to show the "grant access" hint.
	let labelsAvailable = $state(false);

	// Plain (non-reactive) guard so we enumerate at most once per open, without
	// the effect both reading and writing reactive state.
	let didEnumerate = false;

	// Populate the device dropdowns the first time the dialog opens, guarding SSR
	// and browsers/permission states where enumerateDevices is unavailable.
	// Fetching the device list is a genuine browser side effect (async,
	// permission-gated) — not derivable state — so $effect is the right tool.
	// Labels are often blank until the user grants media permission; the selects
	// still list devices by id as a fine fallback.
	$effect(() => {
		if (!open) {
			// Reset the guard so re-opening re-enumerates (devices may have changed).
			didEnumerate = false;
			return;
		}
		if (didEnumerate) return;
		didEnumerate = true;
		if (!browser || !navigator.mediaDevices?.enumerateDevices) return;
		void navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				speakers = devices.filter((d) => d.kind === 'audiooutput');
				mics = devices.filter((d) => d.kind === 'audioinput');
				cameras = devices.filter((d) => d.kind === 'videoinput');
				labelsAvailable = devices.some((d) => d.kind !== 'audiooutput' && d.label !== '');
			})
			.catch(() => {
				// Permission denied or unsupported — leave the empty fallback.
			});
	});

	function deviceLabel(d: MediaDeviceInfo, fallback: string, i: number): string {
		return d.label || `${fallback} ${i + 1}`;
	}

	// Short WebAudio "beep" on the chosen output. setSinkId routing to a specific
	// speaker is best-effort: it is non-standard on AudioContext and unsupported
	// in several browsers, so we degrade to the default output if it's missing.
	async function testSpeaker() {
		if (!browser || typeof AudioContext === 'undefined') return;
		const ctx = new AudioContext();
		try {
			// Route to the selected output device when the browser supports it.
			const sinkable = ctx as AudioContext & { setSinkId?: (id: string) => Promise<void> };
			if (selectedSpeaker && typeof sinkable.setSinkId === 'function') {
				await sinkable.setSinkId(selectedSpeaker).catch(() => {});
			}
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.value = 440;
			// Gentle attack/decay so the tone isn't a harsh click.
			const now = ctx.currentTime;
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
			gain.gain.linearRampToValueAtTime(0, now + 0.32);
			osc.connect(gain).connect(ctx.destination);
			osc.start(now);
			osc.stop(now + 0.34);
			osc.onended = () => void ctx.close().catch(() => {});
		} catch {
			void ctx.close().catch(() => {});
		}
	}

	function handleChangeDevices() {
		// No-op unless the caller wires real device switching.
		onChangeDevices?.(selectedMic, selectedCamera);
	}

	function handleSave() {
		onSave?.({
			disableVideo,
			speakerId: selectedSpeaker,
			audioInputId: selectedMic,
			videoInputId: selectedCamera
		});
		onClose();
	}
</script>

<Modal {open} {onClose} title="Audio/Video Settings">
	<div class="tabs" role="tablist" aria-label="Audio/Video settings sections">
		<button
			type="button"
			role="tab"
			id="av-tab-user"
			aria-selected={tab === 'user'}
			aria-controls="av-panel-user"
			class="tab"
			class:active={tab === 'user'}
			onclick={() => (tab = 'user')}
		>
			User Settings
		</button>
		<button
			type="button"
			role="tab"
			id="av-tab-presenter"
			aria-selected={tab === 'presenter'}
			aria-controls="av-panel-presenter"
			class="tab"
			class:active={tab === 'presenter'}
			onclick={() => (tab = 'presenter')}
		>
			Presenter
		</button>
	</div>

	{#if !labelsAvailable}
		<p class="hint">Device names appear after you grant the browser microphone/camera access.</p>
	{/if}

	{#if tab === 'user'}
		<div id="av-panel-user" role="tabpanel" aria-labelledby="av-tab-user" class="panel">
			<!-- Reference renders this as a clickable nav-link toggle (no checkbox input);
			     aria-pressed exposes the on/off state the checkbox formerly carried. -->
			<button
				type="button"
				class="check"
				class:on={disableVideo}
				title="Disable Video"
				aria-pressed={disableVideo}
				onclick={() => (disableVideo = !disableVideo)}
			>
				<Icon name="desktop" size={15} />
				<span>Disable Video <span class="saves-bandwidth">(saves bandwidth)</span></span>
			</button>

			<div class="field">
				<label class="label" for="av-speaker"><Icon name="volume-up" size={15} /> Speakers:</label>
				<div class="row">
					<select id="av-speaker" bind:value={selectedSpeaker}>
						{#if speakers.length === 0}
							<option value="">No speakers detected</option>
						{:else}
							{#each speakers as d, i (d.deviceId || i)}
								<option value={d.deviceId}>{deviceLabel(d, 'Speaker', i)}</option>
							{/each}
						{/if}
					</select>
					<button
						type="button"
						class="ghost test"
						onclick={testSpeaker}
						aria-label="Play a test tone on the selected speakers"
					>
						<Icon name="volume-up" size={15} /> Test
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div id="av-panel-presenter" role="tabpanel" aria-labelledby="av-tab-presenter" class="panel">
			<div class="field">
				<label class="label" for="av-mic"
					><Icon name="microphone" size={15} /> Audio device (input):</label
				>
				<select id="av-mic" bind:value={selectedMic}>
					{#if mics.length === 0}
						<option value="">No microphones detected</option>
					{:else}
						{#each mics as d, i (d.deviceId || i)}
							<option value={d.deviceId}>{deviceLabel(d, 'Microphone', i)}</option>
						{/each}
					{/if}
				</select>
			</div>

			<div class="field">
				<label class="label" for="av-camera"
					><Icon name="video" size={15} /> Video device (input):</label
				>
				<select id="av-camera" bind:value={selectedCamera}>
					{#if cameras.length === 0}
						<option value="">No cameras detected</option>
					{:else}
						{#each cameras as d, i (d.deviceId || i)}
							<option value={d.deviceId}>{deviceLabel(d, 'Camera', i)}</option>
						{/each}
					{/if}
				</select>
			</div>

			<button type="button" class="primary change" onclick={handleChangeDevices}>
				Change Devices
			</button>
		</div>
	{/if}

	{#snippet footer()}
		<button type="button" class="success" onclick={handleSave}>Save</button>
		<button type="button" class="ghost" onclick={onClose}>Close</button>
	{/snippet}
</Modal>

<style>
	.tabs {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		margin-bottom: 0.9rem;
	}
	.tab {
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-dim);
		padding: 0.45rem 0.7rem;
		font-size: 0.82rem;
		font-weight: 600;
		margin-bottom: -1px;
	}
	.tab:hover {
		color: var(--text);
	}
	.tab.active {
		color: var(--text);
		border-bottom-color: var(--accent);
	}
	.hint {
		margin: 0 0 0.8rem;
		font-size: 0.76rem;
		color: var(--text-dim);
	}
	.panel {
		display: flex;
		flex-direction: column;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.86rem;
		font-weight: 600;
		margin-bottom: 0.9rem;
		align-self: flex-start;
		background: transparent;
		border: none;
		color: var(--text-dim);
		padding: 0;
		cursor: pointer;
		font-family: inherit;
	}
	.check:hover {
		color: var(--text);
	}
	.check.on {
		color: var(--accent);
	}
	.saves-bandwidth {
		color: var(--text-dim);
		font-weight: 400;
		font-size: 0.8rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.field + .field {
		margin-top: 0.8rem;
	}
	.label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	.row {
		display: flex;
		align-items: stretch;
		gap: 0.5rem;
	}
	.row select {
		flex: 1 1 auto;
		min-width: 0;
	}
	select {
		width: 100%;
		box-sizing: border-box;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.45rem 0.55rem;
		font: inherit;
		font-size: 0.86rem;
	}
	select:focus {
		outline: none;
		border-color: var(--accent);
	}
	select:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.4rem 0.85rem;
		font-size: 0.82rem;
		font-weight: 600;
	}
	.ghost:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.test {
		flex: 0 0 auto;
		white-space: nowrap;
	}
	.primary {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		padding: 0.4rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.primary:hover {
		background: var(--accent-hover);
	}
	.change {
		align-self: flex-start;
		margin-top: 0.9rem;
	}
	.success {
		background: var(--positive);
		color: #07210a;
		border: none;
		border-radius: var(--radius);
		padding: 0.4rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.success:hover {
		background: color-mix(in srgb, var(--positive) 85%, #000);
	}
</style>
