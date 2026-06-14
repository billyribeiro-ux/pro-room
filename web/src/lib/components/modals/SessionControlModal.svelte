<script lang="ts">
	import {
		LockKeyIcon,
		MonitorIcon,
		SpeakerSlashIcon,
		BroomIcon,
		UserSwitchIcon,
		SignOutIcon,
		ShieldCheckIcon
	} from 'phosphor-svelte';
	import Modal from '../Modal.svelte';
	import { confirmDialog } from '$lib/dialog.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Lock the room and remove every non-admin member. */
		onLockSession?: () => void;
		/** Lock all viewers to the screen share that is currently on stage. */
		onLockScreen?: () => void;
		/** Mute every member's chat/audio at once. */
		onMuteAll?: () => void;
		/** Clear the shared room chat log for everyone. */
		onClearChat?: () => void;
		/** Disconnect any duplicate/ghost sessions for connected users. */
		onKickDuplicates?: () => void;
		/** End the session / stop the broadcast for everyone. */
		onEndSession?: () => void;
	}
	let {
		open,
		onClose,
		onLockSession,
		onLockScreen,
		onMuteAll,
		onClearChat,
		onKickDuplicates,
		onEndSession
	}: Props = $props();

	// Non-destructive actions fire straight through to the (optional) callback.
	function lockScreen() {
		onLockScreen?.();
	}

	function muteAll() {
		onMuteAll?.();
	}

	// Destructive actions confirm first via the styled dialog primitive
	// (house rule: never window.confirm). Each callback is a no-op until the
	// lead wires the real room realtime command.
	async function lockSession() {
		const ok = await confirmDialog({
			title: 'Lock session',
			message:
				'Lock this room and remove everyone who is not an admin? Non-admins will be kicked and unable to rejoin until you unlock.',
			confirmLabel: 'Lock & kick',
			danger: true
		});
		if (ok) onLockSession?.();
	}

	async function clearChat() {
		const ok = await confirmDialog({
			title: 'Clear chat',
			message: 'Permanently clear the room chat log for everyone? This cannot be undone.',
			confirmLabel: 'Clear chat',
			danger: true
		});
		if (ok) onClearChat?.();
	}

	async function kickDuplicates() {
		const ok = await confirmDialog({
			title: 'Kick duplicate sessions',
			message:
				'Disconnect all duplicate sessions? Each user keeps their most recent connection; older ghost sessions are dropped.',
			confirmLabel: 'Kick duplicates',
			danger: true
		});
		if (ok) onKickDuplicates?.();
	}

	async function endSession() {
		const ok = await confirmDialog({
			title: 'End session',
			message:
				'End the session and stop the broadcast for everyone in the room? Members will be returned to the lobby.',
			confirmLabel: 'End session',
			danger: true
		});
		if (ok) onEndSession?.();
	}

	interface Action {
		key: string;
		label: string;
		hint: string;
		icon: typeof LockKeyIcon;
		run: () => void;
		danger?: boolean;
	}

	const actions: Action[] = [
		{
			key: 'lock-session',
			label: 'Lock session & kick users',
			hint: 'Lock the room and remove all non-admin members.',
			icon: LockKeyIcon,
			run: lockSession,
			danger: true
		},
		{
			key: 'lock-screen',
			label: 'Lock this screen',
			hint: 'Hold every viewer on the current screen share.',
			icon: MonitorIcon,
			run: lockScreen
		},
		{
			key: 'mute-all',
			label: 'Mute all',
			hint: "Mute every member's chat and audio.",
			icon: SpeakerSlashIcon,
			run: muteAll
		},
		{
			key: 'clear-chat',
			label: 'Clear chat',
			hint: 'Remove every message from the room chat log.',
			icon: BroomIcon,
			run: clearChat,
			danger: true
		},
		{
			key: 'kick-duplicates',
			label: 'Kick all duplicate sessions',
			hint: 'Drop ghost connections, keeping each user once.',
			icon: UserSwitchIcon,
			run: kickDuplicates,
			danger: true
		},
		{
			key: 'end-session',
			label: 'End session / End broadcast',
			hint: 'Stop the broadcast and close the room for everyone.',
			icon: SignOutIcon,
			run: endSession,
			danger: true
		}
	];
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={onClose}>Done</button>
{/snippet}

<Modal {open} {onClose} title="Session Control" {footer}>
	<div class="intro">
		<ShieldCheckIcon size={20} />
		<p>Host controls for this session. Actions apply to everyone in the room.</p>
	</div>

	<ul class="actions">
		{#each actions as action (action.key)}
			{@const Icon = action.icon}
			<li>
				<button
					class="action"
					class:danger={action.danger}
					type="button"
					onclick={action.run}
				>
					<span class="action-icon" aria-hidden="true">
						<Icon size={18} />
					</span>
					<span class="action-text">
						<span class="action-label">{action.label}</span>
						<span class="action-hint">{action.hint}</span>
					</span>
				</button>
			</li>
		{/each}
	</ul>
</Modal>

<style>
	.intro {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		color: var(--text-dim);
	}
	.intro :global(svg) {
		color: var(--accent);
		flex: 0 0 auto;
		margin-top: 0.15rem;
	}
	.intro p {
		margin: 0;
	}
	.actions {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.action {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-align: left;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.7rem 0.85rem;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.action:hover {
		border-color: var(--accent);
	}
	.action.danger:hover {
		border-color: var(--negative);
	}
	.action-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-dim);
		flex: 0 0 auto;
	}
	.action.danger .action-icon {
		color: var(--negative);
	}
	.action-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.action-label {
		font-weight: 600;
	}
	.action-hint {
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
	}
	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--accent);
	}
</style>
