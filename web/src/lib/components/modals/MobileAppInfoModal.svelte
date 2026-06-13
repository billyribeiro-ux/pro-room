<script lang="ts">
	import { DeviceMobile } from 'phosphor-svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();
</script>

<Modal {open} {onClose} title="Mobile App Info">
	<div class="intro">
		<DeviceMobile size={20} />
		<p>Download our mobile apps to follow the trading room on the go.</p>
	</div>

	<div class="badges">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a class="badge" href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
			Get it on Google Play
		</a>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a
			class="badge"
			href="https://www.apple.com/app-store/"
			target="_blank"
			rel="noopener noreferrer"
		>
			Download on the App Store
		</a>
	</div>
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
	.badges {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 1rem;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.7rem 1rem;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.badge:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
