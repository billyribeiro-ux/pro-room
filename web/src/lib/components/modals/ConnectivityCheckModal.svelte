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

	// ICE config copied VERBATIM from the reference bundle (chat.protradingroom.com
	// main.*.js): two Google public STUN servers plus protradingroom's own coturn
	// relay over udp+tcp, with the creds shipped in their public bundle. Matching
	// the reference's exact servers keeps this a faithful 1:1 probe. (LiveKit Cloud
	// injects its own TURN at signaling time, invisible to app code, so there is no
	// "our" relay to test — the reference's relay is the closest faithful target.)
	const ICE_SERVERS: RTCIceServer[] = [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' },
		{
			urls: 'turn:flash.protradingroom.com:3478?transport=udp',
			username: 'ptrUser',
			credential: 'ptr123'
		},
		{
			urls: 'turn:flash.protradingroom.com:3478?transport=tcp',
			username: 'ptrUser',
			credential: 'ptr123'
		}
	];

	// Imperative WebRTC handles — NOT $state (they are not rendered, only driven).
	let pc: RTCPeerConnection | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function reset() {
		for (const c of checks) c.status = 'pending';
	}

	// Close any in-flight probe + cancel its finalizer. Idempotent.
	function teardown() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		if (pc) {
			pc.onicecandidate = null;
			pc.onicegatheringstatechange = null;
			pc.close();
			pc = null;
		}
	}

	// Tear down whenever the modal closes or the component unmounts, so a probe in
	// flight never leaks an RTCPeerConnection. The returned teardown fires before
	// each re-run (i.e. on every `open` flip) and on destroy.
	$effect(() => {
		void open;
		return teardown;
	});

	// Flip a row to pass only on its first matching candidate (mirrors the
	// reference `!e.testResults.k` first-hit guard).
	function mark(key: string) {
		const c = checks.find((x) => x.key === key);
		if (c && c.status !== 'pass') c.status = 'pass';
	}

	// Bound the probe: any row not passed by now is a REAL failure (the original's
	// setTimeout finalizer). Closes the peer connection and ends the run.
	function finalize() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		for (const c of checks) if (c.status !== 'pass') c.status = 'fail';
		if (pc) {
			pc.close();
			pc = null;
		}
		running = false;
	}

	// Real WebRTC ICE probe — verbatim logic from the reference's onicecandidate:
	// raw candidate string contains 'udp'/'tcp' -> transport rows; 'typ srflx'
	// (server-reflexive) -> STUN worked; 'typ relay' -> TURN worked. A dummy data
	// channel + offer kicks off candidate gathering with no media.
	async function startTest() {
		if (running) return;
		teardown();
		reset();
		running = true;

		try {
			pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
		} catch {
			// WebRTC unsupported — fail every row honestly rather than fake a pass.
			for (const c of checks) c.status = 'fail';
			running = false;
			return;
		}

		pc.onicecandidate = (ev) => {
			if (!ev.candidate) return;
			const cand = ev.candidate.candidate;
			if (cand.includes('udp')) mark('udp');
			if (cand.includes('tcp')) mark('tcp');
			if (cand.includes('typ srflx')) mark('stun');
			if (cand.includes('typ relay')) mark('turn');
		};
		pc.onicegatheringstatechange = () => {
			if (pc && pc.iceGatheringState === 'complete') finalize();
		};

		pc.createDataChannel('test');
		try {
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
		} catch {
			// Couldn't initiate gathering (e.g. insecure context) — fail + stop.
			finalize();
			return;
		}

		timer = setTimeout(finalize, 5000);
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
		<Icon name="play" size={14} /> {running ? 'Testing…' : 'Start Test'}
	</button>
	<button class="btn success" type="button" onclick={copyResults}>
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
	/* Darkly btn-success — filled green, matching the reference Copy Results button. */
	.btn.success {
		background: var(--modal-success, #00bc8c);
		border-color: var(--modal-success, #00bc8c);
		color: #fff;
	}
	.btn.success:hover {
		background: color-mix(in srgb, var(--modal-success, #00bc8c) 88%, #000);
		border-color: color-mix(in srgb, var(--modal-success, #00bc8c) 88%, #000);
	}
</style>
