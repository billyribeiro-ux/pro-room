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
	import { page } from '$app/state';
	import { ApiError } from '$lib/api';
	import {
		lockRoom,
		muteAll as muteAllApi,
		clearChat as clearChatApi,
		lockScreen as lockScreenApi,
		kickDuplicates as kickDuplicatesApi
	} from '$lib/admin';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** End the session / stop the broadcast for everyone. */
		onEndSession?: () => void;
	}
	let { open, onClose, onEndSession }: Props = $props();

	const roomId = page.params.id as string;
	let muted = $state(false);
	let screenLocked = $state(false);
	let error = $state<string | null>(null);

	// "Lock this screen" — toggle whether non-admin viewers are held on the
	// Screens tab (ephemeral broadcast, same shape as mute-all).
	async function lockScreen() {
		error = null;
		try {
			screenLocked = !screenLocked;
			await lockScreenApi(roomId, screenLocked);
		} catch (err) {
			screenLocked = !screenLocked;
			error = err instanceof ApiError ? err.message : 'Could not lock the screen';
		}
	}

	// Mute / unmute all non-admins — toggles the room-wide mute broadcast.
	async function muteAll() {
		error = null;
		try {
			muted = !muted;
			await muteAllApi(roomId, muted);
		} catch (err) {
			muted = !muted;
			error = err instanceof ApiError ? err.message : 'Could not mute all';
		}
	}

	// Destructive actions confirm first via the styled dialog primitive
	// (house rule: never window.confirm).
	async function lockSession() {
		const ok = await confirmDialog({
			title: 'Lock session',
			message:
				'Lock this room so non-admins cannot join? Admins are always allowed; existing members stay until they leave.',
			confirmLabel: 'Lock room',
			danger: true
		});
		if (!ok) return;
		error = null;
		try {
			await lockRoom(roomId, true);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not lock the room';
		}
	}

	async function clearChat() {
		const ok = await confirmDialog({
			title: 'Clear chat',
			message: 'Permanently clear the room chat log for everyone? This cannot be undone.',
			confirmLabel: 'Clear chat',
			danger: true
		});
		if (!ok) return;
		error = null;
		try {
			await clearChatApi(roomId);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not clear chat';
		}
	}

	async function kickDuplicates() {
		const ok = await confirmDialog({
			title: 'Kick duplicate sessions',
			message:
				'Disconnect all duplicate sessions? Each user keeps their most recent connection; older ghost sessions are dropped.',
			confirmLabel: 'Kick duplicates',
			danger: true
		});
		if (!ok) return;
		error = null;
		try {
			await kickDuplicatesApi(roomId);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not kick duplicate sessions';
		}
	}

	async function endSession() {
		const ok = await confirmDialog({
			title: 'Unlock & end',
			message:
				'Unlock the room (allow everyone to join again)? Use this to reopen a locked session.',
			confirmLabel: 'Unlock room',
			danger: false
		});
		if (!ok) return;
		error = null;
		try {
			await lockRoom(roomId, false);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not unlock the room';
		}
		onEndSession?.();
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
			label: 'Mute / unmute all',
			hint: "Toggle every non-admin's chat composer off or on.",
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
			label: 'Unlock room',
			hint: 'Re-open a locked room so anyone can join again.',
			icon: SignOutIcon,
			run: endSession
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

	{#if error}<p class="error" role="alert">{error}</p>{/if}

	<ul class="actions">
		{#each actions as action (action.key)}
			{@const Icon = action.icon}
			<li>
				<button class="action" class:danger={action.danger} type="button" onclick={action.run}>
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
	.error {
		margin: 0.75rem 0 0;
		color: var(--negative);
		font-size: 0.82rem;
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
