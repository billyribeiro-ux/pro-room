<script lang="ts">
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';
	import { followed } from '$lib/stores/social.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}
	let { open, onClose }: Props = $props();
</script>

{#snippet footer()}
	<!-- Reference Close is Darkly btn-light (deliberately distinct from Muted's btn-primary). -->
	<button class="btn light" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Followed Chat Users" {footer}>
	{#if followed.users.length === 0}
		<!-- Reference body is a single centered text node, no icon. The
		     `followed-users-body` marker lets the scoped `:global(.panel:has(...))`
		     rule drop this dialog's stacking to z-1054 without editing Modal.svelte. -->
		<div class="empty followed-users-body">You don't have any followed users.</div>
	{:else}
		<ul class="user-list followed-users-body">
			{#each followed.users as u (u.id)}
				<li class="row">
					<span class="avatar" aria-hidden="true">{(u.name[0] || '?').toUpperCase()}</span>
					<span class="uname" title={u.name}>{u.name}</span>
					<button class="unbtn" type="button" onclick={() => followed.remove(u.id)}>
						<Icon name="user-times" size={12} /> Unfollow
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</Modal>

<style>
	/* HARD EVIDENCE (modals-admin.md §Scoped CSS app-followed-users-modal:
	   `#followedUsersModal{z-index:1054!important}` + Resolved "followed = z-index
	   1054" vs 1055 elsewhere — deliberate stacking so Followed opens BELOW the
	   standard modal layer). The shared Modal panel is z-1055; drop it to 1054 only
	   when it hosts this dialog, keyed on the `.followed-users-body` marker (the
	   UserInfoModal `:has()` precedent — no edit to Modal.svelte). */
	:global(.panel:has(.followed-users-body)) {
		z-index: 1054;
	}
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
		background: transparent;
		border: 1px solid var(--modal-border);
		color: var(--modal-color, #f4f4f4);
		border-radius: var(--radius);
		padding: 0.3rem 0.6rem;
		font-size: 0.78rem;
		font-weight: 700;
		cursor: pointer;
	}
	.unbtn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.btn {
		border-radius: var(--radius);
		padding: 0.375rem 0.75rem;
		font-weight: 400;
		font-size: 1rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	/* Darkly btn-light. */
	.btn.light {
		background: #f8f9fa;
		border-color: #f8f9fa;
		color: #000000;
	}
	.btn.light:hover {
		opacity: 0.9;
	}
</style>
