<script lang="ts">
	import { fade } from 'svelte/transition';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';

	interface Props {
		/** Whether the realtime socket is currently connected. */
		connected: boolean;
		/** Whether a reconnect attempt is in flight (treated like "down"). */
		reconnecting?: boolean;
	}

	let { connected, reconnecting = false }: Props = $props();

	/** True while the connection is down. */
	let down = $derived(!connected || reconnecting);

	// The reference surfaces connection loss as the "Offline" MODAL (default
	// ~500px dialog, header title, `modal-footer text-center` Close btn-secondary
	// — report.md:1676,1696). Close dismisses until the next drop.
	let dismissed = $state(false);
	$effect(() => {
		if (!down) dismissed = false;
	});

	/** Briefly true after a down -> up transition, to flash the "Connected" toast. */
	let showConnected = $state(false);

	/**
	 * Detect the down -> up edge by tracking the previous `connected` value.
	 * `prev` is a plain (non-reactive) module-local, so reading/writing it does
	 * not feed back into the effect's dependency set — the effect only re-runs
	 * when `connected` actually changes. The toast timer is cleared in the
	 * effect's teardown, so it can never fire after the component is destroyed
	 * (or after a rapid flap re-runs the effect).
	 */
	let prev = false;
	$effect(() => {
		const isUp = connected;
		const wasDown = !prev;
		prev = isUp;

		if (isUp && wasDown) {
			showConnected = true;
			const timer = setTimeout(() => {
				showConnected = false;
			}, 2000);
			return () => clearTimeout(timer);
		}
	});
</script>

<Modal open={down && !dismissed} title="Offline" onClose={() => (dismissed = true)} footerCenter>
	<p class="offline-body">
		<span class="spin"><Icon name="circle-notch" /></span>
		Connection lost — reconnecting…
	</p>
	{#snippet footer()}
		<button class="close-btn" type="button" onclick={() => (dismissed = true)}>Close</button>
	{/snippet}
</Modal>

<div class="overlay" aria-live="polite">
	{#if showConnected}
		<!-- HARD EVIDENCE (mixed-files/connected.html + bundle CSS): the transient
		     connected chip is #connectedMsg.notConnectedOverlay — fa-check + label,
		     animated fadeIn. HARD EVIDENCE (overlays-toasts.md L109): the reference literal
		     is "Conected" (one "n" — a typo in connected.html). Per IMPLEMENTATION-PLAN-V2
		     §2.10 P2 + §4 (documented reference bug), we keep the CORRECT "Connected"
		     spelling and deliberately do NOT replicate the typo — the chrome
		     (bg/position/fadeIn) matches; only the misspelling is dropped. -->
		<div class="banner up" role="status" transition:fade={{ duration: 1000 }}>
			<Icon name="check" /> Connected
		</div>
	{/if}
</div>

<style>
	/* HARD EVIDENCE (bundle CSS): .notConnectedOverlay { display:block;
	   position:absolute; bottom:5px; right:5px; z-index:10000; background-color:#000;
	   color:var(--presenter-noRecording-color) (#fff live room); opacity:.7 }.
	   Fixed-position equivalent (the room wrapper fills the viewport). */
	.overlay {
		position: fixed;
		bottom: 5px;
		right: 5px;
		z-index: 10000;
		/* Never intercept clicks meant for the room shell underneath. */
		pointer-events: none;
	}

	.banner {
		display: block;
		background-color: #000;
		color: #fff;
		opacity: 0.7;
		padding: 2px 8px;
	}

	.offline-body {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}
	/* Reference Offline footer Close is btn-secondary (report.md:1696). */
	.close-btn {
		background: #444;
		border: 1px solid #444;
		color: #fff;
		border-radius: var(--radius, 6px);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.close-btn:hover {
		opacity: 0.9;
	}

	.banner.up {
		background: #000;
		border: none;
		color: #fff;
	}

	.spin {
		display: inline-flex;
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spin {
			animation: none;
		}
	}
</style>
