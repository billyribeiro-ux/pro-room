<script lang="ts">
	import { Plug } from 'phosphor-svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	type Status = 'pending' | 'pass' | 'fail';
	type Check = { key: string; label: string; status: Status };

	const labels: Record<string, string> = {
		udp: 'UDP',
		tcp: 'TCP',
		stun: 'STUN',
		turn: 'TURN'
	};

	let checks = $state<Check[]>([
		{ key: 'udp', label: labels.udp, status: 'pending' },
		{ key: 'tcp', label: labels.tcp, status: 'pending' },
		{ key: 'stun', label: labels.stun, status: 'pending' },
		{ key: 'turn', label: labels.turn, status: 'pending' }
	]);
	let running = $state(false);

	function reset() {
		for (const c of checks) c.status = 'pending';
	}

	// Presentational only — walks each row pending -> pass on a short timer.
	// No real WebRTC probing is performed.
	function startTest() {
		if (running) return;
		reset();
		running = true;
		let i = 0;
		const step = () => {
			if (i >= checks.length) {
				running = false;
				return;
			}
			checks[i].status = 'pass';
			i += 1;
			setTimeout(step, 450);
		};
		setTimeout(step, 450);
	}

	function dotLabel(status: Status): string {
		if (status === 'pass') return 'Passed';
		if (status === 'fail') return 'Failed';
		return 'Pending';
	}
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={onClose}>Close</button>
	<button class="btn primary" type="button" onclick={startTest} disabled={running}>
		{running ? 'Testing…' : 'Start Test'}
	</button>
{/snippet}

<Modal {open} {onClose} title="Connectivity / Mic Troubleshooter" {footer}>
	<div class="intro">
		<Plug size={20} />
		<p>Run a quick connectivity check to confirm the room can reach our media servers.</p>
	</div>

	<ul class="rows">
		{#each checks as check (check.key)}
			<li class="row">
				<span class="dot {check.status}" aria-hidden="true"></span>
				<span class="name">{check.label}</span>
				<span class="state">{dotLabel(check.status)}</span>
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
	.rows {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.6rem 0.75rem;
	}
	.dot {
		width: 10px;
		height: 10px;
		flex: 0 0 10px;
		border-radius: 50%;
		background: var(--text-dim);
	}
	.dot.pending {
		background: var(--text-dim);
	}
	.dot.pass {
		background: var(--positive);
	}
	.dot.fail {
		background: var(--negative);
	}
	.name {
		font-weight: 600;
		flex: 1;
	}
	.state {
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.btn {
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
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover:not(:disabled) {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
