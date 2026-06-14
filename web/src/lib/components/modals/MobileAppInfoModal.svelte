<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();
</script>

<Modal {open} {onClose} title="Download our mobile apps">
	<p class="lead">Get the trading room on the go — install our mobile app.</p>

	<div class="badges">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a
			class="badge"
			href="https://www.apple.com/app-store/"
			target="_blank"
			rel="noopener noreferrer"
		>
			<Icon name="apple" size={28} family="brands" />
			<span class="txt"><small>Download on the</small><strong>App Store</strong></span>
		</a>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a class="badge" href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
			<Icon name="google-play" size={26} family="brands" />
			<span class="txt"><small>Get it on</small><strong>Google Play</strong></span>
		</a>
	</div>
</Modal>

<style>
	.lead {
		margin: 0 0 1rem;
		color: var(--text-dim);
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.badge {
		flex: 1 1 0;
		min-width: 165px;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: #000000;
		border: 1px solid var(--border);
		border-radius: 10px;
		color: #ffffff;
		padding: 0.6rem 0.95rem;
	}
	.badge:hover {
		border-color: var(--accent);
	}
	.badge :global(svg),
	.badge :global(i) {
		flex: 0 0 auto;
	}
	.txt {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}
	.txt small {
		font-size: 0.62rem;
		opacity: 0.85;
	}
	.txt strong {
		font-size: 0.95rem;
		font-weight: 700;
	}
</style>
