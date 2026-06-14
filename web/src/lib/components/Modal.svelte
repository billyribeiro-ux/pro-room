<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		children?: Snippet;
		footer?: Snippet;
	}
	let { open, title, onClose, children, footer }: Props = $props();

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
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text);
		box-shadow: 0 18px 48px rgba(0, 0, 0, 0.5);
		outline: none;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1rem;
		border-bottom: 1px solid var(--border);
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
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.3rem;
		line-height: 0;
		flex: 0 0 auto;
	}
	.close:hover {
		color: var(--text);
		border-color: var(--accent-hover);
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
		border-top: 1px solid var(--border);
	}
</style>
