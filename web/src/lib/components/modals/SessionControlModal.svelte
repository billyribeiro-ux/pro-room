<script lang="ts">
	import {
		LockIcon,
		SpeakerSlashIcon,
		BroomIcon,
		ShieldCheckIcon
	} from 'phosphor-svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	// Local presentational state — no backend wiring yet.
	let locked = $state(false);
	let allMuted = $state(false);

	const lockId = $props.id();

	function toggleLock() {
		locked = !locked;
	}

	// Placeholder admin actions. These flip local UI state so the host gets
	// immediate feedback; the real session commands land when the room
	// realtime channel is wired.
	function muteAll() {
		allMuted = true;
	}

	function clearChat() {
		// No-op: clearing the shared chat is a host broadcast, not yet implemented.
	}
</script>

{#snippet footer()}
	<button class="btn primary block" type="button" onclick={onClose}>Done</button>
{/snippet}

<Modal {open} {onClose} title="Session Control" {footer}>
	<div class="intro">
		<ShieldCheckIcon size={20} />
		<p>Host controls for this session. Changes apply to everyone in the room.</p>
	</div>

	<ul class="controls">
		<li class="control">
			<span class="control-icon" aria-hidden="true">
				<LockIcon size={18} />
			</span>
			<span class="control-text">
				<span class="control-label" id="{lockId}-label">Lock room</span>
				<span class="control-hint">Stop new members from joining.</span>
			</span>
			<button
				class="switch"
				type="button"
				role="switch"
				aria-checked={locked}
				aria-labelledby="{lockId}-label"
				onclick={toggleLock}
			>
				<span class="knob" aria-hidden="true"></span>
			</button>
		</li>

		<li class="control">
			<span class="control-icon" aria-hidden="true">
				<SpeakerSlashIcon size={18} />
			</span>
			<span class="control-text">
				<span class="control-label">Mute all members</span>
				<span class="control-hint">
					{allMuted ? 'Everyone is muted.' : 'Silence every member at once.'}
				</span>
			</span>
			<button class="btn ghost" type="button" onclick={muteAll} disabled={allMuted}>
				{allMuted ? 'Muted' : 'Mute all'}
			</button>
		</li>

		<li class="control">
			<span class="control-icon" aria-hidden="true">
				<BroomIcon size={18} />
			</span>
			<span class="control-text">
				<span class="control-label">Clear chat</span>
				<span class="control-hint">Remove all messages from the room chat.</span>
			</span>
			<button class="btn ghost danger" type="button" onclick={clearChat}>Clear</button>
		</li>
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
	.controls {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.control {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.7rem 0.85rem;
	}
	.control-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-dim);
		flex: 0 0 auto;
	}
	.control-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex: 1;
		min-width: 0;
	}
	.control-label {
		font-weight: 600;
	}
	.control-hint {
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.switch {
		flex: 0 0 auto;
		position: relative;
		width: 42px;
		height: 24px;
		padding: 0;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--bg-elev-2);
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}
	.switch[aria-checked='true'] {
		background: var(--accent);
		border-color: var(--accent);
	}
	.knob {
		position: absolute;
		top: 50%;
		left: 3px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--text);
		transform: translate(0, -50%);
		transition: transform 0.15s ease;
	}
	.switch[aria-checked='true'] .knob {
		transform: translate(18px, -50%);
		background: #fff;
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
		cursor: pointer;
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
		flex: 0 0 auto;
	}
	.btn.ghost:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--accent);
	}
	.btn.ghost.danger:hover:not(:disabled) {
		color: var(--negative);
		border-color: var(--negative);
	}
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover:not(:disabled) {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn.block {
		width: 100%;
	}
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
