<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import Icon from './Icon.svelte';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		children?: Snippet;
		footer?: Snippet;
		/** Bootstrap dialog size: md (default ~500px), lg (~800px), xl (~1140px). */
		size?: 'md' | 'lg' | 'xl';
		/** Centered footer (reference `modal-footer text-center` on the Settings /
		 * WebRTC / Offline shells — report.md:1686). */
		footerCenter?: boolean;
		/** Custom header content rendered in place of the plain title (e.g. an
		 * identity block). `title` is still used as the dialog's aria-label. */
		header?: Snippet;
	}
	let {
		open,
		title,
		onClose,
		children,
		footer,
		size = 'md',
		footerCenter = false,
		header
	}: Props = $props();

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
			return;
		}
		// Focus trap: keep Tab within the dialog (WAI-ARIA modal dialog pattern).
		// `aria-modal` does not constrain keyboard focus on its own, so cycle it.
		if (e.key === 'Tab' && panel) {
			const focusable = panel.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement;
			if (e.shiftKey && active === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && active === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" transition:fade={{ duration: 150 }} onclick={onClose} onkeydown={onKeydown}>
		<div
			class="panel"
			class:lg={size === 'lg'}
			class:xl={size === 'xl'}
			role="dialog"
			aria-modal="true"
			aria-labelledby={header ? undefined : titleId}
			aria-label={header ? title : undefined}
			tabindex="-1"
			bind:this={panel}
			onclick={(e) => e.stopPropagation()}
			onkeydown={onKeydown}
		>
			<header class="head">
				{#if header}
					{@render header()}
				{:else}
					<h2 id={titleId} class="title">{title}</h2>
				{/if}
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
				<footer class="foot" class:center={footerCenter}>
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
		/* Reference stacking: backdrop 1054, modal 1055 (report.md:1569). */
		z-index: 1054;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.5);
	}
	.panel {
		width: 100%;
		/* Reference default modal-dialog is ~500px (report.md:1676). */
		max-width: 500px;
		max-height: calc(100vh - 2rem);
		display: flex;
		flex-direction: column;
		z-index: 1055;
		/* Modal chrome is Bootstrap "Darkly" gray per the spec's verified
		   correction block (report.md:1526-1540): #303030 content, #444 borders —
		   independent of the navy room chrome. Driven by the --modal-* tokens
		   (layout.css). Custom props inherit through the DOM, so re-mapping the
		   room theme tokens HERE re-themes every modal's inner content in one
		   place — no per-modal edits. */
		--bg-elev: var(--modal-input-bg);
		--bg-elev-2: var(--modal-bg);
		--border: var(--modal-border);
		--accent: var(--modal-active-tab);
		--accent-hover: var(--accent);
		--positive: var(--modal-success);
		--text: var(--modal-color);
		--text-dim: #b8c9d8;
		background: var(--modal-bg);
		border: 1px solid var(--modal-border);
		/* Reference .modal-content radius: 6px — the dominant radius token, 245
		   uses (report.md:1573). */
		border-radius: 6px;
		color: var(--modal-color);
		/* The single painting shadow in the reference palette (report.md:1574). */
		box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.5);
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
		font-size: 18px;
		font-weight: 700;
	}
	.close {
		/* Reference header close is the borderless white ✕
		   (button.btn-close.btn-close-white, report.md:1560). */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
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
	/* Reference `modal-footer text-center` variant (report.md:1686). */
	.foot.center {
		justify-content: center;
	}
</style>
