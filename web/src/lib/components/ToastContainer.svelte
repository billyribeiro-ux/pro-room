<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toasts, dismissToast } from '$lib/stores/toast.svelte';
</script>

<!-- Top-right stack (reference toastr "toast-top-right"). Click a toast to dismiss
     it early; each also auto-dismisses on its timer. role=status + aria-live so a
     new alert is announced without stealing focus. -->
<div class="toasts" role="status" aria-live="polite">
	{#each toasts as t (t.id)}
		<button
			class="toast"
			type="button"
			onclick={() => dismissToast(t.id)}
			in:fade={{ duration: 140 }}
			out:fade={{ duration: 200 }}
		>
			<span class="toast-title">{t.title}</span>
			<!-- Plain text, NOT {@html}: our alert body is user-entered, so no enableHtml. -->
			<span class="toast-body">{t.body}</span>
		</button>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 80;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: min(90vw, 340px);
		pointer-events: none;
	}
	.toast {
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		text-align: left;
		width: 100%;
		cursor: pointer;
		/* Reference toastr-warning is amber; match it with an amber left rail on the
		   app's elevated surface so it reads as a notification, not a chat bubble. */
		background: var(--bg-elev);
		color: var(--text);
		border: 1px solid var(--border);
		border-left: 4px solid var(--warn, #f0ad4e);
		border-radius: var(--radius);
		padding: 0.55rem 0.75rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
		font: inherit;
	}
	.toast:hover {
		border-color: var(--warn, #f0ad4e);
	}
	.toast-title {
		font-weight: 700;
		font-size: 0.82rem;
	}
	.toast-body {
		font-size: 0.85rem;
		word-break: break-word;
		white-space: pre-wrap;
	}
</style>
