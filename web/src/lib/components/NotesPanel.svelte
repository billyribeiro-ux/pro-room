<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import DOMPurify from 'dompurify';
	import { confirmDialog, promptDialog } from '$lib/dialog.svelte';
	import RichTextEditorModal from './modals/RichTextEditorModal.svelte';
	import type { Note } from '$lib/types';
	import Icon from './Icon.svelte';

	interface Props {
		roomId: string;
		canManage: boolean;
	}
	let { roomId, canManage }: Props = $props();

	let notes = $state<Note[]>([]);
	let selectedId = $state<string | null>(null);
	let error = $state<string | null>(null);
	let busy = $state(false);
	let editorOpen = $state(false);

	const selected = $derived(notes.find((n) => n.id === selectedId) ?? notes[0] ?? null);
	const selectedIndex = $derived(notes.findIndex((n) => n.id === selected?.id));

	// Note bodies are admin-authored rich HTML (canManage gates editing). Sanitise
	// before {@html} as defence-in-depth against a compromised author; browser-only
	// since notes render client-side after the onMount fetch.
	function sanitize(html: string): string {
		return browser ? DOMPurify.sanitize(html) : '';
	}

	async function load() {
		try {
			notes = await api.get<Note[]>(`/api/rooms/${roomId}/notes`);
			if (notes.length && !notes.some((n) => n.id === selectedId)) {
				selectedId = notes[0].id;
			}
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load notes';
		}
	}

	onMount(load);

	function select(id: string) {
		selectedId = id;
	}

	function download(note: Note) {
		const blob = new Blob([note.body], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${note.title || 'note'}.md`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	async function createNote() {
		const title = (
			await promptDialog({ title: 'New note', message: 'Note title', placeholder: 'Title' })
		)?.trim();
		if (!title) return;
		busy = true;
		error = null;
		try {
			const note = await api.post<Note>(`/api/rooms/${roomId}/notes`, { title, body: '' });
			notes = [...notes, note];
			selectedId = note.id;
			editorOpen = true;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not create note';
		} finally {
			busy = false;
		}
	}

	// Persist the rich-text editor's HTML as the note body.
	async function saveBody(html: string) {
		const note = selected;
		if (!note) return;
		busy = true;
		error = null;
		try {
			const updated = await api.patch<Note>(`/api/rooms/${roomId}/notes/${note.id}`, {
				body: html
			});
			notes = notes.map((n) => (n.id === updated.id ? updated : n));
			editorOpen = false;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not save note';
		} finally {
			busy = false;
		}
	}

	async function rename(note: Note) {
		const title = (
			await promptDialog({ title: 'Rename note', message: 'New title', value: note.title })
		)?.trim();
		if (!title || title === note.title) return;
		busy = true;
		error = null;
		try {
			const updated = await api.patch<Note>(`/api/rooms/${roomId}/notes/${note.id}`, { title });
			notes = notes.map((n) => (n.id === updated.id ? updated : n));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not rename note';
		} finally {
			busy = false;
		}
	}

	async function remove(note: Note) {
		if (
			!(await confirmDialog({
				message: `Delete note "${note.title}"?`,
				confirmLabel: 'Delete',
				danger: true
			}))
		)
			return;
		busy = true;
		error = null;
		try {
			await api.delete(`/api/rooms/${roomId}/notes/${note.id}`);
			notes = notes.filter((n) => n.id !== note.id);
			if (selectedId === note.id) selectedId = notes[0]?.id ?? null;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not delete note';
		} finally {
			busy = false;
		}
	}

	// Swap positions with the adjacent note and persist both via PATCH.
	async function reorder(dir: -1 | 1) {
		const i = selectedIndex;
		const j = i + dir;
		if (i < 0 || j < 0 || j >= notes.length) return;
		const a = notes[i];
		const b = notes[j];
		busy = true;
		error = null;
		try {
			await Promise.all([
				api.patch<Note>(`/api/rooms/${roomId}/notes/${a.id}`, { position: b.position }),
				api.patch<Note>(`/api/rooms/${roomId}/notes/${b.id}`, { position: a.position })
			]);
			await load();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not reorder notes';
		} finally {
			busy = false;
		}
	}
</script>

<div class="notes">
	<div class="subtabs" role="tablist" aria-label="Notes">
		{#each notes as n, i (n.id)}
			<button
				type="button"
				role="tab"
				aria-selected={selected?.id === n.id}
				class:active={selected?.id === n.id}
				onclick={() => select(n.id)}
			>
				{#if i === 0}<Icon name="home" size={12} />{:else}<Icon
						name="pen"
						size={12}
						class="mx-1"
					/>{/if}
				{n.title}
			</button>
		{/each}
		{#if canManage}
			<button type="button" class="new" onclick={createNote} disabled={busy}>
				<Icon name="plus" size={12} /> New note
			</button>
		{/if}
	</div>

	{#if error}<p class="error">{error}</p>{/if}

	{#if selected}
		<div class="head">
			<h3>{selected.title}</h3>
			<div class="head-actions">
				{#if canManage}
					<button
						type="button"
						class="ic"
						onclick={() => reorder(-1)}
						disabled={busy || selectedIndex <= 0}
						aria-label="Move left"
					>
						<Icon name="caret-left" />
					</button>
					<button
						type="button"
						class="ic"
						onclick={() => reorder(1)}
						disabled={busy || selectedIndex >= notes.length - 1}
						aria-label="Move right"
					>
						<Icon name="caret-right" />
					</button>
					<button type="button" class="ic" onclick={() => (editorOpen = true)} aria-label="Edit">
						<Icon name="pen" />
					</button>
					<button type="button" class="ic" onclick={() => rename(selected)} aria-label="Rename">
						<Icon name="pencil-alt" />
					</button>
					<button type="button" class="ic del" onclick={() => remove(selected)} aria-label="Delete">
						<Icon name="trash-alt" />
					</button>
				{/if}
				<button type="button" class="download" onclick={() => download(selected)}>
					<Icon name="download" size={15} /> Download
				</button>
			</div>
		</div>

		<div class="body">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored note HTML, DOMPurify-sanitised -->
			<div class="rendered">{@html sanitize(selected.body)}</div>
		</div>
	{:else}
		<div class="empty">
			{canManage ? 'No notes yet — create one to get started.' : 'No notes yet.'}
		</div>
	{/if}
</div>

<RichTextEditorModal
	open={editorOpen}
	initialHtml={selected?.body ?? ''}
	onClose={() => (editorOpen = false)}
	onSave={saveBody}
/>

<style>
	.notes {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: #ffffff;
		color: #1f2430;
	}
	.subtabs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		background: #0c2434;
		border-top: 1px solid #0a6db1;
		flex-shrink: 0;
	}
	.subtabs button {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: transparent;
		border: 1px solid transparent;
		color: #ffffff;
		font-size: 12px;
		line-height: 12px;
		font-weight: 300;
		padding: 0.5rem;
		margin: 5px;
		border-radius: 3px;
		cursor: pointer;
	}
	.subtabs button.active {
		background: #45a2ff;
		border-color: transparent;
		color: #ffffff;
	}
	.subtabs button:hover:not(.active) {
		border: 1px solid #0a6db1;
		border-radius: 3px;
	}
	.subtabs .new {
		color: #ffffff;
		border-color: transparent;
		background: transparent;
	}
	.subtabs button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid #eceef3;
		flex-shrink: 0;
	}
	.head h3 {
		margin: 0;
		font-size: 1rem;
	}
	.head-actions {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		margin-left: auto;
	}
	.ic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid #d3d7e0;
		color: #6b7180;
		border-radius: 6px;
		padding: 0.3rem;
		cursor: pointer;
	}
	.ic:hover:not(:disabled) {
		border-color: #1f86d6;
		color: #1f86d6;
	}
	.ic:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.ic.del:hover {
		border-color: #ea3943;
		color: #ea3943;
	}
	.download {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: none;
		border-radius: 6px;
		padding: 0.35rem 0.7rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: #ffffff;
		cursor: pointer;
		background: #92d528;
	}
	.download:hover {
		color: #212529;
	}
	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.85rem;
	}
	/* Rendered note bodies are sanitised {@html}, invisible to the Svelte
	   compiler, so these element selectors must be :global to survive pruning. */
	.rendered :global(p) {
		margin: 0 0 0.6rem;
		word-break: break-word;
		font-size: 0.9rem;
		line-height: 1.5;
		min-height: 0.6em;
	}
	.rendered :global(a) {
		color: #45a2ff;
		text-decoration: underline;
	}
	.rendered :global(ul),
	.rendered :global(ol) {
		margin: 0 0 0.6rem;
		padding-left: 1.4rem;
		font-size: 0.9rem;
		line-height: 1.5;
	}
	.rendered :global(li) {
		margin: 0 0 0.2rem;
	}
	.rendered :global(strong) {
		font-weight: 700;
	}
	.rendered :global(em) {
		font-style: italic;
	}
	.empty {
		flex: 1;
		display: grid;
		place-items: center;
		color: #8a909c;
		font-size: 0.9rem;
		padding: 2rem;
		text-align: center;
	}
	.error {
		margin: 0;
		padding: 0.5rem 0.85rem;
		background: #fdecec;
		color: #c0292f;
		font-size: 0.82rem;
	}
</style>
