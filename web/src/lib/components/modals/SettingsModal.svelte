<script lang="ts">
	import { theme, type ThemeTokenKey, type ThemeMode } from '$lib/stores/theme.svelte';
	import {
		layout,
		setLayoutPosition,
		setPmLogsRight,
		type LayoutPosition
	} from '$lib/stores/layout.svelte';
	import { dnd, setDnd } from '$lib/stores/dnd.svelte';
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/**
		 * Opens the "edit my info / avatar" flow. Wiring this to the real profile
		 * editor is the integration phase's job; left optional so the modal works
		 * standalone (no-op when unset).
		 */
		onEditProfile?: () => void;
		/**
		 * Opens the alert filter UI. The integration phase points this at the
		 * existing AlertFilterModal; no-op when unset.
		 */
		onFilterAlerts?: () => void;
	}
	let { open, onClose, onEditProfile, onFilterAlerts }: Props = $props();

	type Tab = 'app' | 'alert' | 'chat';
	let tab = $state<Tab>('app');

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'app', label: 'App Settings' },
		{ id: 'alert', label: 'Alert Settings' },
		{ id: 'chat', label: 'Chat Settings' }
	];

	// --- App > Room Layout (real store) --------------------------------------
	const layoutOptions: { value: LayoutPosition; label: string }[] = [
		{ value: 'left', label: 'Chat and Alerts left' },
		{ value: 'top', label: 'Chat and Alerts top' },
		{ value: 'right', label: 'Chat and Alerts right' },
		{ value: 'bottom', label: 'Chat and Alerts bottom' }
	];

	// --- App > Colors & Size (real theme tokens) -----------------------------
	// Each control maps a visible label to one live theme token. An
	// `<input type="color">` always carries a valid #rrggbb, so we write
	// straight through `theme.set` on change.
	type ColorControl = { key: ThemeTokenKey; label: string };
	const colorControls: ColorControl[] = [
		{ key: '--text', label: 'Text Color' },
		{ key: '--username-color', label: 'Username Color' },
		{ key: '--bg-elev', label: 'Background Color' },
		{ key: '--ticker-color', label: 'Ticker Color' }
	];

	function onColor(key: ThemeTokenKey, e: Event) {
		theme.set(key, (e.currentTarget as HTMLInputElement).value);
	}

	function onSize(e: Event) {
		theme.setFontSize(Number((e.currentTarget as HTMLInputElement).value));
	}

	// --- Local-only preference toggles --------------------------------------
	// Most of these aren't backend-wired yet, so they live as local `$state`.
	// (The theme mode, layout, and color/size controls above drive real
	// reactive stores instead.)

	// App/Alert/Chat "Do not disturb" — these checkboxes are "sound/popup ON"
	// (checked = enabled), so they're the INVERSE of the `dnd` store flags
	// (where true = suppressed). Initialised from the persisted store, and a
	// sync effect below pushes changes back (inverted) so they take real effect.
	let appDnd = $state({
		dontDisturb: dnd.app,
		startRecordingSound: true,
		stopRecordingSound: true,
		reactionsResponse: true,
		reactionsQaResponse: true
	});
	let appVideoEnabled = $state(true);
	let appCaptionsEnabled = $state(false);

	// Alert tab.
	let alertTextMode = $state<'regular' | 'compact'>('regular');
	let alertDnd = $state({
		alertQaPopup: !dnd.alertPopup,
		alertSound: !dnd.alert,
		qaSound: !dnd.qa,
		qaReactionsSound: true,
		nonTradeAlertSound: !dnd.nonTradeAlert
	});
	let alertLongerPopup = $state(false);

	// Chat tab.
	let chatTextMode = $state<'regular' | 'compact'>('regular');
	let chatSmallerImagePreview = $state(true);
	let chatDnd = $state({
		gif: !dnd.chatGif,
		badges: !dnd.chatBadges,
		chatPmPopup: !dnd.chatPopup,
		chatSound: !dnd.chat
	});

	// Push the "sound on" toggles into the `dnd` store (inverted → "suppressed"),
	// so the room's playSound() actually honours them. The master "Don't Disturb"
	// maps straight through (checked = suppress all).
	$effect(() => {
		setDnd('app', appDnd.dontDisturb);
		setDnd('alert', !alertDnd.alertSound);
		setDnd('alertPopup', !alertDnd.alertQaPopup);
		setDnd('qa', !alertDnd.qaSound);
		setDnd('nonTradeAlert', !alertDnd.nonTradeAlertSound);
		setDnd('chat', !chatDnd.chatSound);
		setDnd('chatGif', !chatDnd.gif);
		setDnd('chatBadges', !chatDnd.badges);
		setDnd('chatPopup', !chatDnd.chatPmPopup);
	});
	let chatExtraColumn = $state(false);
	let chatAlwaysScrollBottom = $state(false);
	let chatReduceMemory = $state(true);
	let chatTabSleep = $state(true);

	function selectMode(mode: ThemeMode) {
		theme.setMode(mode);
	}
</script>

{#snippet footer()}
	<button class="btn primary" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="General Settings" {footer}>
	<div class="tabs" role="tablist" aria-label="Settings sections">
		{#each tabs as t (t.id)}
			<button
				class="tab"
				class:active={tab === t.id}
				type="button"
				role="tab"
				id="settings-tab-{t.id}"
				aria-selected={tab === t.id}
				aria-controls="settings-panel-{t.id}"
				onclick={() => (tab = t.id)}
			>
				{t.label}
			</button>
		{/each}
	</div>

	{#if tab === 'app'}
		<div class="panel" role="tabpanel" id="settings-panel-app" aria-labelledby="settings-tab-app">
			<!-- Choose Color Theme -->
			<div class="section-head">
				<Icon name="palette" />
				<span>Choose Color Theme</span>
			</div>
			<div class="radios" role="radiogroup" aria-label="Color theme">
				<label class="radio">
					<input
						type="radio"
						name="theme-mode"
						value="light"
						checked={theme.mode === 'light'}
						onchange={() => selectMode('light')}
					/>
					<span>Light Theme</span>
				</label>
				<label class="radio">
					<input
						type="radio"
						name="theme-mode"
						value="dark"
						checked={theme.mode === 'dark'}
						onchange={() => selectMode('dark')}
					/>
					<span>Dark Theme</span>
				</label>
			</div>

			<!-- Room Layout -->
			<div class="section-head spaced">
				<Icon name="columns" />
				<span>Room Layout</span>
			</div>
			<div class="radios" role="radiogroup" aria-label="Room layout">
				{#each layoutOptions as opt (opt.value)}
					<label class="radio">
						<input
							type="radio"
							name="room-layout"
							value={opt.value}
							checked={layout.position === opt.value}
							onchange={() => setLayoutPosition(opt.value)}
						/>
						<span>{opt.label}</span>
					</label>
				{/each}
			</div>
			<label class="check">
				<input
					type="checkbox"
					checked={layout.pmLogsRight}
					onchange={(e) => setPmLogsRight(e.currentTarget.checked)}
				/>
				<span>PM logs on the right</span>
			</label>

			<!-- Colors & Size -->
			<div class="section-head spaced">
				<Icon name="wrench" />
				<span>Colors &amp; Size</span>
			</div>
			<ul class="colors">
				{#each colorControls as control (control.key)}
					<li class="color-row">
						<input
							type="color"
							value={theme.tokens[control.key]}
							onchange={(e) => onColor(control.key, e)}
							aria-label={control.label}
						/>
						<span class="color-label">{control.label}</span>
					</li>
				{/each}
			</ul>
			<div class="size-row">
				<label class="size-label" for="settings-text-size">Text Size</label>
				<input
					id="settings-text-size"
					type="range"
					min="10"
					max="28"
					step="1"
					value={theme.fontSize}
					oninput={onSize}
				/>
				<span class="size-val">{theme.fontSize}px</span>
			</div>
			<div class="cs-actions">
				<button class="btn ghost" type="button" onclick={() => theme.reset()}>
					<Icon name="undo-alt" size={15} /> Reset
				</button>
				<button class="btn primary" type="button" onclick={() => theme.apply()}>
					<Icon name="save" size={15} /> Save changes
				</button>
			</div>

			<!-- Do not disturb -->
			<div class="section-head spaced">
				<Icon name="bell-slash" />
				<span>Do not disturb</span>
			</div>
			<div class="checks">
				<label class="check">
					<input type="checkbox" bind:checked={appDnd.dontDisturb} />
					<span>Don't Disturb</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={appDnd.startRecordingSound} />
					<span>Start recording sound</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={appDnd.stopRecordingSound} />
					<span>Stop recording sound</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={appDnd.reactionsResponse} />
					<span>Reactions Response</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={appDnd.reactionsQaResponse} />
					<span>Reactions QA Response</span>
				</label>
			</div>

			<!-- Disable/Enable Video -->
			<div class="section-head spaced">
				<Icon name="desktop" />
				<span>Disable/Enable Video</span>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={appVideoEnabled} />
				<span>Video Enabled</span>
			</label>

			<!-- Show Closed Captions Overlay -->
			<div class="section-head spaced">
				<Icon name="closed-captioning" />
				<span>Show Closed Captions Overlay</span>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={appCaptionsEnabled} />
				<span>Enabled</span>
			</label>

			<!-- Edit my Info and Avatar — wiring deferred to integration phase. -->
			<button class="btn warn-btn" type="button" onclick={() => onEditProfile?.()}>
				<Icon name="user-tie" size={15} /> Edit my Info and Avatar
			</button>
		</div>
	{:else if tab === 'alert'}
		<div
			class="panel"
			role="tabpanel"
			id="settings-panel-alert"
			aria-labelledby="settings-tab-alert"
		>
			<!-- Text Mode -->
			<div class="section-head">
				<Icon name="file" />
				<span>Text Mode</span>
			</div>
			<div class="radios" role="radiogroup" aria-label="Alert text mode">
				<label class="radio">
					<input type="radio" name="alert-text-mode" value="regular" bind:group={alertTextMode} />
					<span>Regular Mode</span>
				</label>
				<label class="radio">
					<input type="radio" name="alert-text-mode" value="compact" bind:group={alertTextMode} />
					<span>Compact Mode</span>
				</label>
			</div>

			<!-- Do not disturb -->
			<div class="section-head spaced">
				<Icon name="bell-slash" />
				<span>Do not disturb</span>
			</div>
			<div class="checks">
				<label class="check">
					<input type="checkbox" bind:checked={alertDnd.alertQaPopup} />
					<span>Alert / QA Popup</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={alertDnd.alertSound} />
					<span>Alert sound</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={alertDnd.qaSound} />
					<span>QA sound</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={alertDnd.qaReactionsSound} />
					<span>QA Reactions Sound</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={alertDnd.nonTradeAlertSound} />
					<span>Non-trade alert sound</span>
				</label>
			</div>

			<!-- Alert popup -->
			<div class="section-head spaced">
				<Icon name="bell" />
				<span>Alert popup</span>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={alertLongerPopup} />
				<span>Longer alert popup</span>
			</label>
			<!-- Filter out alerts — integration phase points this at AlertFilterModal. -->
			<button class="btn ghost wide" type="button" onclick={() => onFilterAlerts?.()}>
				<Icon name="filter" size={15} /> Filter out alerts
			</button>
		</div>
	{:else}
		<div class="panel" role="tabpanel" id="settings-panel-chat" aria-labelledby="settings-tab-chat">
			<!-- Text Mode -->
			<div class="section-head">
				<Icon name="file" />
				<span>Text Mode</span>
			</div>
			<div class="radios" role="radiogroup" aria-label="Chat text mode">
				<label class="radio">
					<input type="radio" name="chat-text-mode" value="regular" bind:group={chatTextMode} />
					<span>Regular Mode</span>
				</label>
				<label class="radio">
					<input type="radio" name="chat-text-mode" value="compact" bind:group={chatTextMode} />
					<span>Compact Mode</span>
				</label>
			</div>

			<!-- Image Preview -->
			<div class="section-head spaced">
				<Icon name="file" />
				<span>Image Preview</span>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={chatSmallerImagePreview} />
				<span>Smaller image preview</span>
			</label>

			<!-- Do not disturb -->
			<div class="section-head spaced">
				<Icon name="bell-slash" />
				<span>Do not disturb</span>
			</div>
			<div class="checks">
				<label class="check">
					<input type="checkbox" bind:checked={chatDnd.gif} />
					<span>Gif</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={chatDnd.badges} />
					<span>Badges</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={chatDnd.chatPmPopup} />
					<span>Chat / PM Popup</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={chatDnd.chatSound} />
					<span>Chat sound</span>
				</label>
			</div>

			<!-- Extra chat column -->
			<div class="section-head spaced">
				<Icon name="columns" />
				<span>Extra chat column</span>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={chatExtraColumn} />
				<span>Chat column</span>
			</label>

			<!-- Always Scroll To Bottom -->
			<div class="section-head spaced">
				<Icon name="file" />
				<span>Always Scroll To Bottom</span>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={chatAlwaysScrollBottom} />
				<span>Always scroll to bottom</span>
			</label>

			<!-- Reduce Chatlog Memory -->
			<div class="section-head spaced">
				<Icon name="file" />
				<span>Reduce Chatlog Memory</span>
			</div>
			<div class="checks">
				<label class="check">
					<input type="checkbox" bind:checked={chatReduceMemory} />
					<span>Reduce Chatlog Memory</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={chatTabSleep} />
					<span>Tab sleep optimization</span>
				</label>
			</div>
		</div>
	{/if}
</Modal>

<style>
	.tabs {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		margin-bottom: 1rem;
	}
	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-dim);
		padding: 0.5rem 0.75rem;
		margin-bottom: -1px;
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.tab:hover {
		color: var(--text);
	}
	.tab.active {
		color: var(--text);
		border-bottom-color: var(--accent);
	}

	.panel {
		display: flex;
		flex-direction: column;
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--text-dim);
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 0.6rem;
	}
	.section-head.spaced {
		margin-top: 1.25rem;
	}
	.section-head :global(svg),
	.section-head :global(i) {
		color: var(--accent);
		flex: 0 0 auto;
	}

	.radios,
	.checks {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.radio,
	.check {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.6rem 0.75rem;
		cursor: pointer;
		font-weight: 600;
	}
	.radio:hover,
	.check:hover {
		border-color: var(--accent);
	}
	.radio input,
	.check input {
		width: 16px;
		height: 16px;
		flex: 0 0 auto;
		accent-color: var(--accent);
		cursor: pointer;
	}
	/* Standalone checkbox rows (not inside a `.checks` group) need their own
	   top gap so they don't crowd the control above. */
	.check + .check,
	.radios + .check {
		margin-top: 0.4rem;
	}

	.colors {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.color-row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.45rem 0.75rem;
	}
	.color-row input[type='color'] {
		appearance: none;
		-webkit-appearance: none;
		width: 34px;
		height: 34px;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		cursor: pointer;
		flex: 0 0 auto;
	}
	.color-row input[type='color']::-webkit-color-swatch-wrapper {
		padding: 2px;
	}
	.color-row input[type='color']::-webkit-color-swatch {
		border: none;
		border-radius: 6px;
	}
	.color-label {
		font-weight: 600;
	}

	.size-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--text-dim);
		margin-top: 0.6rem;
	}
	.size-label {
		font-weight: 600;
		flex: 0 0 auto;
	}
	.size-row input[type='range'] {
		flex: 1;
		accent-color: var(--accent);
	}
	.size-val {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		color: var(--text);
		min-width: 3.5ch;
		text-align: right;
	}

	.cs-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
		color: var(--text);
		background: var(--bg-elev);
		cursor: pointer;
	}
	.btn:hover {
		border-color: var(--accent);
	}
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
	}
	.btn.ghost:hover {
		color: var(--text);
	}
	.btn.wide {
		width: 100%;
		margin-top: 0.4rem;
	}
	.btn.warn-btn {
		margin-top: 1.5rem;
		width: 100%;
		background: color-mix(in srgb, var(--warn) 14%, transparent);
		border-color: color-mix(in srgb, var(--warn) 55%, transparent);
		color: var(--warn);
	}
	.btn.warn-btn:hover {
		background: color-mix(in srgb, var(--warn) 22%, transparent);
		border-color: var(--warn);
	}
</style>
