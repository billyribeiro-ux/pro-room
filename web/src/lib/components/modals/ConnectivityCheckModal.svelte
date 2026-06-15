<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();

	type Status = 'pending' | 'pass' | 'fail';
	type Check = { key: string; label: string; status: Status };

	// Reference uses full descriptive labels (files/file30.html span.fw-medium).
	const labels: Record<string, string> = {
		udp: 'UDP Enabled',
		tcp: 'TCP Enabled',
		stun: 'STUN Server Connectivity',
		turn: 'TURN Server Connectivity'
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

	function copyResults() {
		const text = checks.map((c) => `${c.label}: ${dotLabel(c.status)}`).join('\n');
		navigator.clipboard?.writeText(text).catch(() => {
			// Clipboard may be unavailable (permissions/insecure context); ignore.
		});
	}
</script>

{#snippet footer()}
	<button class="btn primary" type="button" onclick={startTest} disabled={running}>
		{running ? 'Testing…' : 'Start Test'}
	</button>
	<button class="btn ghost" type="button" onclick={copyResults}>
		<Icon name="copy" size={14} /> Copy Results
	</button>
	<button class="btn ghost" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Connectivity/Mic Troubleshooter" {footer}>
	<!-- Reference: p.text-muted.mb-4, no leading icon (files/file30.html). -->
	<p class="intro">This tool checks your network and connectivity to essential WebRTC servers.</p>

	<div class="rows">
		{#each checks as check (check.key)}
			<!-- Reference status-item: label (fw-medium) LEFT, colored ● dot RIGHT, no state word. -->
			<div class="status-item">
				<span class="fw-medium">{check.label}</span>
				<span class="status-icon {check.status}" role="img" aria-label={dotLabel(check.status)}
					>●</span
				>
			</div>
		{/each}
	</div>
</Modal>

<style>
	.intro {
		margin: 0 0 1.5rem;
		color: var(--text-dim);
	}
	.rows {
		display: flex;
		flex-direction: column;
	}
	.status-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		padding: 0.5rem 0;
	}
	.fw-medium {
		font-weight: 500;
	}
	.status-icon {
		font-size: 1rem;
		line-height: 1;
		color: var(--text-dim);
	}
	.status-icon.pending {
		color: var(--text-dim);
	}
	.status-icon.pass {
		color: var(--positive);
	}
	.status-icon.fail {
		color: var(--negative);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
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
