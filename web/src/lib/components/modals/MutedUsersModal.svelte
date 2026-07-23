<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';
	import { muted } from '$lib/stores/social.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();
</script>

{#snippet footer()}
	<!-- Reference Close is Darkly btn-primary (deliberately distinct from Followed's btn-light). -->
	<button class="btn primary" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Muted Chat Users" {footer}>
	{#if muted.users.length === 0}
		<!-- Reference body is a single centered text node, no icon. -->
		<div class="empty">You don't have any muted/ignored users.</div>
	{:else}
		<ul class="user-list">
			{#each muted.users as u (u.id)}
				<li class="row">
					<span class="avatar" aria-hidden="true">{(u.name[0] || '?').toUpperCase()}</span>
					<span class="uname" title={u.name}>{u.name}</span>
					<button class="unbtn" type="button" onclick={() => muted.remove(u.id)}>
						<Icon name="bell" size={12} /> Unmute
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</Modal>

<style>
	.empty {
		text-align: center;
		padding: 1.25rem 0.5rem;
		color: var(--modal-color, #f4f4f4);
		font-size: 16px;
	}
	.user-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.45rem 0.25rem;
		border-bottom: 1px solid var(--modal-border);
	}
	.row:last-child {
		border-bottom: none;
	}
	.avatar {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--bg-elev);
		color: var(--modal-color, #f4f4f4);
		font-size: 0.78rem;
		font-weight: 700;
	}
	.uname {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.88rem;
	}
	.unbtn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
		/* --modal-danger is the defined token (layout.css); the old
		   `--modal-btn-danger` name was undefined, silently rendering the
		   fallback. Darkly danger #e74c3c per report.md:1535. */
		background: var(--modal-danger, #e74c3c);
		border: 1px solid var(--modal-danger, #e74c3c);
		color: #fff;
		border-radius: var(--radius);
		padding: 0.3rem 0.6rem;
		font-size: 0.78rem;
		font-weight: 700;
		cursor: pointer;
	}
	.unbtn:hover {
		opacity: 0.9;
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.375rem 0.75rem;
		font-weight: 400;
		font-size: 1rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.primary {
		background: var(--modal-btn-primary, var(--accent));
		border-color: var(--modal-btn-primary, var(--accent));
		color: #fff;
	}
	.btn.primary:hover {
		opacity: 0.9;
	}
</style>
