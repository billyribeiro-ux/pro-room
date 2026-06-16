<script lang="ts">
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	interface PmThread {
		id: string;
		name: string;
		preview: string;
		when: string;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		threads?: PmThread[];
		/**
		 * While the PM list is fetching, the reference body is a centered
		 * "Loading..." spinner (`fas fa-spinner fa-spin`). Optional with a safe
		 * default so the modal still works standalone (renders threads/empty).
		 */
		loading?: boolean;
	}
	let { open, onClose, threads = [], loading = false }: Props = $props();

	/** First letter of the thread name, upper-cased, for the avatar fallback. */
	function initial(name: string): string {
		return name.trim().charAt(0).toUpperCase() || '?';
	}
</script>

{#snippet footer()}
	<button class="btn secondary" type="button" onclick={onClose}>Close</button>
{/snippet}

<!-- Reference h5 is "All private messages:" (trailing colon + dynamic count slot). -->
<Modal {open} {onClose} title="All private messages:" {footer}>
	{#if loading}
		<!-- Reference loading body: centered "Loading..." spinner while PMs fetch. -->
		<div class="loading">
			<h5>
				<Icon name="spinner" size={20} class="fa-spin" />
				Loading...
			</h5>
		</div>
	{:else if threads.length === 0}
		<div class="empty">
			<Icon name="envelope" size={28} />
			<p>No private messages.</p>
		</div>
	{:else}
		<ul class="threads">
			{#each threads as thread (thread.id)}
				<li class="thread">
					<span class="avatar" aria-hidden="true">{initial(thread.name)}</span>
					<span class="meta">
						<span class="name">{thread.name}</span>
						<span class="preview">{thread.preview}</span>
					</span>
					<time class="when">{thread.when}</time>
				</li>
			{/each}
		</ul>
	{/if}
</Modal>

<style>
	.loading {
		text-align: center;
		margin: 1.5rem 0;
		color: var(--text-dim);
	}
	.loading h5 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.loading :global(svg),
	.loading :global(i) {
		color: var(--text-dim);
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 0.5rem;
		color: var(--text-dim);
	}
	.empty :global(svg),
	.empty :global(i) {
		color: var(--text-dim);
		opacity: 0.7;
	}
	.empty p {
		margin: 0;
		font-size: 0.9rem;
	}
	.threads {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.thread {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.6rem 0.75rem;
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		flex: 0 0 36px;
		border-radius: 50%;
		background: var(--accent);
		color: #fff;
		font-weight: 700;
		font-size: 0.95rem;
		text-transform: uppercase;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
		flex: 1;
	}
	.name {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.preview {
		font-size: 0.8rem;
		color: var(--text-dim);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.when {
		font-size: 0.75rem;
		color: var(--text-dim);
		flex: 0 0 auto;
		white-space: nowrap;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
	}
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		color: #fff;
		border-color: var(--modal-btn-secondary, #444);
	}
	.btn.secondary:hover {
		opacity: 0.9;
	}
</style>
