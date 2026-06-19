<script lang="ts">
	import { fade } from 'svelte/transition';
	import Icon from './Icon.svelte';

	interface Props {
		/** Whether the realtime socket is currently connected. */
		connected: boolean;
		/** Whether a reconnect attempt is in flight (treated like "down"). */
		reconnecting?: boolean;
	}

	let { connected, reconnecting = false }: Props = $props();

	/** True while the persistent "down" banner should be shown. */
	let down = $derived(!connected || reconnecting);

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

<div class="overlay" aria-live="polite">
	{#if down}
		<div class="banner down" role="status" transition:fade={{ duration: 150 }}>
			<span class="spin"><Icon name="circle-notch" /></span>
			<Icon name="exclamation-triangle" />
			<span class="label">Reconnecting…</span>
		</div>
	{:else if showConnected}
		<div class="banner up" role="status" transition:fade={{ duration: 200 }}>
			<Icon name="check-circle" />
			<span class="label">Connected</span>
		</div>
	{/if}
</div>

<style>
	.overlay {
		position: fixed;
		top: 1rem;
		left: 0;
		right: 0;
		z-index: 900;
		display: flex;
		justify-content: center;
		/* Never intercept clicks meant for the room shell underneath. */
		pointer-events: none;
	}

	.banner {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.85rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
		line-height: 1;
		color: var(--text, #ffffff);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
	}

	.banner.down {
		background: var(--bg-elev-2);
		border: 1px solid var(--warn, #f0b90b);
		color: var(--warn, #f0b90b);
	}

	.banner.up {
		background: var(--bg-elev-2);
		border: 1px solid var(--positive, #92d528);
		color: var(--positive, #92d528);
	}

	.label {
		color: var(--text, #ffffff);
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
