<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		children?: Snippet;
		footer?: Snippet;
		/** Bootstrap dialog size: md (default ~440px), lg (~800px), xl (~1140px). */
		size?: 'md' | 'lg' | 'xl';
	}
	let { open, title, onClose, children, footer, size = 'md' }: Props = $props();

	const titleId = $props.id();
	let panel = $state<HTMLDivElement | null>(null);
	let previouslyFocused: HTMLElement | null = null;

	$effect(() => {
		if (open) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			// Move focus into the dialog once it has mounted.
			queueMicrotask(() => panel?.focus());
			return () => {
				previouslyFocused?.focus?.();
			};
		}
	});

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			onClose();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={onClose} onkeydown={onKeydown}>
		<div
			class="panel"
			class:lg={size === 'lg'}
			class:xl={size === 'xl'}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			tabindex="-1"
			bind:this={panel}
			onclick={(e) => e.stopPropagation()}
			onkeydown={onKeydown}
		>
			<header class="head">
				<h2 id={titleId} class="title">{title}</h2>
				<button
					class="close"
					type="button"
					onclick={onClose}
					aria-label="Close dialog"
					title="Close"
				>
					<Icon name="times" size={18} />
				</button>
			</header>

			<div class="body">
				{@render children?.()}
			</div>

			{#if footer}
				<footer class="foot">
					{@render footer()}
				</footer>
			{/if}
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.6);
	}
	.panel {
		width: 100%;
		max-width: 440px;
		max-height: calc(100vh - 2rem);
		display: flex;
		flex-direction: column;
		/* Reference modals are a fixed DARK surface (Bootstrap "Darkly": #303030 bg,
		   #444 border, soft near-white #f4f4f4 text) — independent of the light/dark
		   message-panel theme. Driven by the --modal-* tokens (layout.css).
		   Custom props inherit through the DOM, so re-mapping the room theme tokens
		   HERE re-themes every modal's inner content (cards/inputs/borders/accents)
		   to the dark Darkly palette in one place — no per-modal edits. */
		--bg-elev: var(--modal-input-bg);
		--bg-elev-2: var(--modal-bg);
		--border: var(--modal-border);
		--accent: var(--modal-active-tab);
		--accent-hover: #00a37a;
		--positive: var(--modal-success);
		--text: var(--modal-color);
		--text-dim: #b8b8b8;
		background: var(--modal-bg);
		border: 1px solid var(--modal-border);
		/* Reference .modal-content radius is 6px (the dominant radius token), not 8px. */
		border-radius: 6px;
		color: var(--modal-color);
		box-shadow: 0 18px 48px rgba(0, 0, 0, 0.5);
		outline: none;
	}
	/* Bootstrap modal-lg / modal-xl widths. */
	.panel.lg {
		max-width: 800px;
	}
	.panel.xl {
		max-width: 1140px;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1rem;
		border-bottom: 1px solid var(--modal-border);
	}
	.title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
	}
	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--modal-border);
		color: var(--modal-color);
		border-radius: var(--radius);
		padding: 0.3rem;
		line-height: 0;
		flex: 0 0 auto;
	}
	.close:hover {
		background: var(--modal-close-bg);
		color: #fff;
		border-color: var(--modal-close-bg);
	}
	.body {
		padding: 1rem;
		overflow-y: auto;
		font-size: 0.9rem;
		line-height: 1.5;
	}
	.foot {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 1rem;
		border-top: 1px solid var(--modal-border);
	}
</style>
