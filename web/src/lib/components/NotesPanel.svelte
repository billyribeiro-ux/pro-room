<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { onMount } from 'svelte';
	import type { Note } from '$lib/types';
	import {
		DownloadSimple,
		Plus,
		PencilSimple,
		Trash,
		FloppyDisk,
		X,
		CaretLeft,
		CaretRight,
		House
	} from 'phosphor-svelte';

	interface Props {
		roomId: string;
		canManage: boolean;
	}
	let { roomId, canManage }: Props = $props();

	let notes = $state<Note[]>([]);
	let selectedId = $state<string | null>(null);
	let error = $state<string | null>(null);
	let busy = $state(false);
	let editing = $state(false);
	let draftTitle = $state('');
	let draftBody = $state('');

	const selected = $derived(notes.find((n) => n.id === selectedId) ?? notes[0] ?? null);
	const selectedIndex = $derived(notes.findIndex((n) => n.id === selected?.id));

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
		editing = false;
		selectedId = id;
	}

	// Split text into segments, marking URL runs so they can be rendered as
	// real links without ever passing raw user input through {@html}.
	const URL_RE = /(https?:\/\/[^\s]+)/g;
	function segments(text: string): { text: string; href?: string }[] {
		const out: { text: string; href?: string }[] = [];
		let last = 0;
		for (const m of text.matchAll(URL_RE)) {
			const idx = m.index ?? 0;
			if (idx > last) out.push({ text: text.slice(last, idx) });
			out.push({ text: m[0], href: m[0] });
			last = idx + m[0].length;
		}
		if (last < text.length) out.push({ text: text.slice(last) });
		return out;
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
		const title = window.prompt('Note title')?.trim();
		if (!title) return;
		busy = true;
		error = null;
		try {
			const note = await api.post<Note>(`/api/rooms/${roomId}/notes`, { title, body: '' });
			notes = [...notes, note];
			selectedId = note.id;
			startEdit(note);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not create note';
		} finally {
			busy = false;
		}
	}

	function startEdit(note: Note) {
		draftTitle = note.title;
		draftBody = note.body;
		editing = true;
	}

	function cancelEdit() {
		editing = false;
	}

	async function saveEdit(note: Note) {
		busy = true;
		error = null;
		try {
			const updated = await api.patch<Note>(`/api/rooms/${roomId}/notes/${note.id}`, {
				title: draftTitle.trim() || note.title,
				body: draftBody
			});
			notes = notes.map((n) => (n.id === updated.id ? updated : n));
			editing = false;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not save note';
		} finally {
			busy = false;
		}
	}

	async function rename(note: Note) {
		const title = window.prompt('New title', note.title)?.trim();
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
		if (!window.confirm(`Delete note "${note.title}"?`)) return;
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
				{#if i === 0}<House size={13} weight="fill" />{/if}
				{n.title}
			</button>
		{/each}
		{#if canManage}
			<button type="button" class="new" onclick={createNote} disabled={busy}>
				<Plus size={13} weight="bold" /> New note
			</button>
		{/if}
	</div>

	{#if error}<p class="error">{error}</p>{/if}

	{#if selected}
		<div class="head">
			{#if editing}
				<input class="title-input" bind:value={draftTitle} placeholder="Title" />
			{:else}
				<h3>{selected.title}</h3>
			{/if}
			<div class="head-actions">
				{#if canManage}
					<button
						type="button"
						class="ic"
						onclick={() => reorder(-1)}
						disabled={busy || selectedIndex <= 0}
						aria-label="Move left"
					>
						<CaretLeft size={16} />
					</button>
					<button
						type="button"
						class="ic"
						onclick={() => reorder(1)}
						disabled={busy || selectedIndex >= notes.length - 1}
						aria-label="Move right"
					>
						<CaretRight size={16} />
					</button>
					{#if editing}
						<button type="button" class="ic" onclick={cancelEdit} aria-label="Cancel">
							<X size={16} />
						</button>
						<button type="button" class="save" onclick={() => saveEdit(selected)} disabled={busy}>
							<FloppyDisk size={15} weight="fill" /> Save
						</button>
					{:else}
						<button type="button" class="ic" onclick={() => startEdit(selected)} aria-label="Edit">
							<PencilSimple size={16} />
						</button>
						<button type="button" class="ic" onclick={() => rename(selected)} aria-label="Rename">
							<PencilSimple size={16} weight="bold" />
						</button>
						<button
							type="button"
							class="ic del"
							onclick={() => remove(selected)}
							aria-label="Delete"
						>
							<Trash size={16} />
						</button>
					{/if}
				{/if}
				<button type="button" class="download" onclick={() => download(selected)}>
					<DownloadSimple size={15} weight="bold" /> Download
				</button>
			</div>
		</div>

		<div class="body">
			{#if editing}
				<textarea bind:value={draftBody} placeholder="Write your note…"></textarea>
			{:else}
				<div class="rendered">
					{#each selected.body.split('\n') as line, li (li)}
						<p>
							{#each segments(line) as seg, si (si)}
								{#if seg.href}
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- user-supplied external link in note body -->
									<a href={seg.href} target="_blank" rel="noopener noreferrer">{seg.text}</a>
								{:else}{seg.text}{/if}
							{/each}
						</p>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="empty">
			{canManage ? 'No notes yet — create one to get started.' : 'No notes yet.'}
		</div>
	{/if}
</div>

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
		gap: 0.35rem;
		padding: 0.6rem 0.85rem;
		background: #eef1f6;
		border-bottom: 1px solid #dfe2ea;
		flex-shrink: 0;
	}
	.subtabs button {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: #ffffff;
		border: 1px solid #d3d7e0;
		color: #4b5160;
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		cursor: pointer;
	}
	.subtabs button.active {
		background: #1f86d6;
		border-color: #1f86d6;
		color: #ffffff;
	}
	.subtabs button:hover:not(.active) {
		border-color: #1f86d6;
	}
	.subtabs .new {
		color: #16a34a;
		border-color: #b7e2c5;
		background: #f0fbf4;
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
	.title-input {
		flex: 1;
		border: 1px solid #d3d7e0;
		border-radius: 6px;
		padding: 0.35rem 0.5rem;
		font-size: 0.95rem;
		color: #1f2430;
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
	.save,
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
	}
	.download {
		background: #16a34a;
	}
	.download:hover {
		background: #138a3e;
	}
	.save {
		background: #1f86d6;
	}
	.save:hover {
		background: #1a73ba;
	}
	.save:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.85rem;
	}
	.rendered p {
		margin: 0 0 0.6rem;
		white-space: pre-wrap;
		word-break: break-word;
		font-size: 0.9rem;
		line-height: 1.5;
		min-height: 0.6em;
	}
	.rendered a {
		color: #1f86d6;
		text-decoration: underline;
	}
	textarea {
		width: 100%;
		height: 100%;
		min-height: 240px;
		resize: vertical;
		border: 1px solid #d3d7e0;
		border-radius: 8px;
		padding: 0.6rem 0.7rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: #1f2430;
		font-family: inherit;
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
