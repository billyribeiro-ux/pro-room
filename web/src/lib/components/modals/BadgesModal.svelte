<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from '../Modal.svelte';
	import Icon from '../Icon.svelte';
	import Badges from '../Badges.svelte';
	import { api, ApiError } from '$lib/api';
	import type { Badge, PresentUser } from '$lib/types';
	import { showToast } from '$lib/stores/toast.svelte';
	import { confirmDialog } from '$lib/dialog.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Present roster — the assignable users. */
		present?: PresentUser[];
	}
	let { open, onClose, present = [] }: Props = $props();

	let badges = $state<Badge[]>([]);

	// New-badge form.
	let slug = $state('');
	let label = $state('');
	let bgColor = $state('#45a2ff');
	let textColor = $state('#ffffff');
	let creating = $state(false);

	// Assignment.
	let assignBadgeId = $state('');
	let assignUserId = $state('');
	let assigning = $state(false);

	async function load() {
		try {
			badges = await api.get<Badge[]>('/api/badges');
		} catch {
			showToast('Badges', 'Could not load the badge registry.', 5000);
		}
	}
	// This modal is mounted lazily (only while open, see RoomSidebar), so load the
	// registry once on mount — no reactive effect needed.
	onMount(() => {
		void load();
	});

	async function createBadge() {
		const s = slug.trim();
		const l = label.trim();
		if (!s || !l) {
			showToast('Badge', 'Slug and label are required.', 4000);
			return;
		}
		creating = true;
		try {
			const badge = await api.post<Badge>('/api/badges', {
				slug: s,
				label: l,
				bg_color: bgColor,
				text_color: textColor,
				position: badges.length
			});
			badges = [...badges, badge];
			slug = '';
			label = '';
			showToast('Badge created', `“${badge.label}” is ready to assign.`, 4000);
		} catch (err) {
			showToast(
				'Create failed',
				err instanceof ApiError ? err.message : 'Could not create the badge.',
				6000
			);
		} finally {
			creating = false;
		}
	}

	async function removeBadge(b: Badge) {
		const ok = await confirmDialog({
			title: 'Delete badge?',
			message: `Delete “${b.label}”? It will be removed from everyone who has it.`,
			confirmLabel: 'Delete',
			danger: true
		});
		if (!ok) return;
		try {
			await api.delete(`/api/badges/${b.id}`);
			badges = badges.filter((x) => x.id !== b.id);
			if (assignBadgeId === b.id) assignBadgeId = '';
			showToast('Badge deleted', `“${b.label}” was removed.`, 4000);
		} catch (err) {
			showToast(
				'Delete failed',
				err instanceof ApiError ? err.message : 'Could not delete the badge.',
				6000
			);
		}
	}

	async function assign() {
		if (!assignBadgeId || !assignUserId) {
			showToast('Assign', 'Pick a badge and a user.', 4000);
			return;
		}
		assigning = true;
		try {
			await api.post(`/api/badges/${assignBadgeId}/assign`, { user_id: assignUserId });
			const who = present.find((p) => p.user_id === assignUserId)?.display_name ?? 'the user';
			const what = badges.find((b) => b.id === assignBadgeId)?.label ?? 'badge';
			showToast('Badge assigned', `${what} → ${who}.`, 4000);
		} catch (err) {
			showToast(
				'Assign failed',
				err instanceof ApiError ? err.message : 'Could not assign the badge.',
				6000
			);
		} finally {
			assigning = false;
		}
	}

	// Live preview of the badge being created.
	const previewBadge = $derived<Badge>({
		id: 'preview',
		slug: slug || 'slug',
		label: label || 'LABEL',
		image_url: null,
		bg_color: bgColor,
		text_color: textColor,
		position: 0
	});
</script>

<Modal {open} {onClose} title="Badges">
	<div class="badges-admin">
		<section>
			<h4>Create a badge</h4>
			<div class="form-grid">
				<label>Slug<input type="text" bind:value={slug} maxlength="40" placeholder="mod" /></label>
				<label>Label<input type="text" bind:value={label} maxlength="40" placeholder="MOD" /></label
				>
				<label class="color">Background<input type="color" bind:value={bgColor} /></label>
				<label class="color">Text<input type="color" bind:value={textColor} /></label>
			</div>
			<div class="preview-row">
				<span class="preview-label">Preview:</span>
				<Badges data={{ badges: [previewBadge], is_trial: false, is_new: false, years: null }} />
				<button class="btn primary" type="button" onclick={createBadge} disabled={creating}>
					{creating ? 'Creating…' : 'Create badge'}
				</button>
			</div>
		</section>

		<section>
			<h4>Registry</h4>
			{#if badges.length === 0}
				<p class="empty">No badges yet.</p>
			{:else}
				<ul class="registry">
					{#each badges as b (b.id)}
						<li>
							<Badges data={{ badges: [b], is_trial: false, is_new: false, years: null }} />
							<span class="slug">{b.slug}</span>
							<button
								class="del"
								type="button"
								aria-label={`Delete ${b.label}`}
								title="Delete"
								onclick={() => removeBadge(b)}><Icon name="trash" size={14} /></button
							>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section>
			<h4>Assign to a user</h4>
			<div class="assign-row">
				<select bind:value={assignBadgeId} aria-label="Badge">
					<option value="">Choose a badge…</option>
					{#each badges as b (b.id)}<option value={b.id}>{b.label}</option>{/each}
				</select>
				<select bind:value={assignUserId} aria-label="User">
					<option value="">Choose a user…</option>
					{#each present as p (p.user_id)}<option value={p.user_id}>{p.display_name}</option>{/each}
				</select>
				<button class="btn primary" type="button" onclick={assign} disabled={assigning}>
					{assigning ? 'Assigning…' : 'Assign'}
				</button>
			</div>
			<p class="hint">Only currently-present users are listable here.</p>
		</section>
	</div>

	{#snippet footer()}
		<button class="btn secondary" type="button" onclick={onClose}>Close</button>
	{/snippet}
</Modal>

<style>
	.badges-admin {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	section h4 {
		margin: 0 0 0.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text);
	}
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr auto auto;
		gap: 0.5rem;
		align-items: end;
	}
	.form-grid label,
	.assign-row select {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.form-grid input[type='text'] {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.4rem 0.55rem;
		font-size: 0.9rem;
	}
	.form-grid input[type='color'] {
		width: 38px;
		height: 34px;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: transparent;
	}
	.preview-row,
	.assign-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 0.6rem;
		flex-wrap: wrap;
	}
	.preview-label {
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.preview-row .btn {
		margin-left: auto;
	}
	.registry {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.registry li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.3rem 0.4rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.registry .slug {
		font-size: 0.78rem;
		color: var(--text-dim);
	}
	.registry .del {
		margin-left: auto;
		background: transparent;
		border: none;
		color: var(--text-dim);
		cursor: pointer;
		display: inline-flex;
	}
	.registry .del:hover {
		color: var(--negative);
	}
	.assign-row select {
		flex: 1;
		min-width: 8rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		padding: 0.4rem 0.55rem;
		font-size: 0.9rem;
	}
	.assign-row .btn {
		flex: 0 0 auto;
	}
	.empty,
	.hint {
		margin: 0.3rem 0 0;
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border-radius: var(--radius);
		padding: 0.45rem 0.9rem;
		font-weight: 600;
		font-size: 0.875rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.btn.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.btn.primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.btn.secondary {
		background: var(--modal-btn-secondary, #444);
		border-color: var(--modal-btn-secondary, #444);
		color: #fff;
	}
</style>
