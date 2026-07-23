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
	// Per-tab cog dropdown (reference LSe: #dropdownMenuNote, a live Bootstrap
	// dropdown gated by isP||canEditNotes — notes.md §3a). Holds the id of the
	// tab whose menu is open, or null.
	let cogOpenFor = $state<string | null>(null);

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

<svelte:window onkeydown={(e) => e.key === 'Escape' && (cogOpenFor = null)} />

<div class="notes">
	<div class="subtabs" role="tablist" aria-label="Notes">
		{#each notes as n, i (n.id)}
			{@const isSel = selected?.id === n.id}
			<!-- A div (not button) because the reference note tab (BSe) hosts the
			     nested interactive cog dropdown (LSe) — button>button is invalid
			     HTML. Click/keyboard/aria mirror the prior button. -->
			<div
				class="tab"
				class:active={isSel}
				role="tab"
				tabindex="0"
				aria-selected={isSel}
				onclick={() => select(n.id)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						select(n.id);
					}
				}}
			>
				<!-- Reference: the first (Welcome Mat) tab carries a GREEN badge-success
				     pill holding the fa-home glyph; other tabs are the bare title (the
				     fa-edit glyph is the dynamic unsaved-changes indicator, not a per-tab
				     decoration). -->
				{#if i === 0}
					<span
						class="welcome-badge"
						title="This note is the Welcome Mat, and will be shown by default when nobody is presenting"
					>
						<!-- HARD EVIDENCE (notes.md Resolved: span.badge.badge-success #00bc8c,
						     i.fas.fa-home font-size 9px). -->
					<Icon name="home" size={9} />
					</span>
				{/if}
				{n.title}
				<!-- HARD EVIDENCE (notes.md §3a LSe): per-tab cog dropdown, gated by
				     isP||canEditNotes → canManage here. fa-cog #dropdownMenuNote with
				     Edit/Rename/Bring-everyone-here/Make-Welcome-Mat/Delete items. -->
				{#if canManage}
					<span class="cog-anchor">
						<span
							class="cog-toggle"
							role="button"
							tabindex="0"
							aria-haspopup="menu"
							aria-label="Note options"
							aria-expanded={cogOpenFor === n.id}
							onclick={(e) => {
								e.stopPropagation();
								cogOpenFor = cogOpenFor === n.id ? null : n.id;
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									e.stopPropagation();
									cogOpenFor = cogOpenFor === n.id ? null : n.id;
								}
							}}
						>
							<Icon name="cog" size={12} />
						</span>
						{#if cogOpenFor === n.id}
							<div class="cog-menu" role="menu">
								<!-- Wired to EXISTING handlers only. -->
								<button
									type="button"
									role="menuitem"
									onclick={(e) => {
										e.stopPropagation();
										cogOpenFor = null;
										select(n.id);
										editorOpen = true;
									}}
								>
									<Icon name="edit" size={12} /> Edit Note
								</button>
								<button
									type="button"
									role="menuitem"
									onclick={(e) => {
										e.stopPropagation();
										cogOpenFor = null;
										rename(n);
									}}
								>
									<Icon name="pencil-alt" size={12} /> Rename Note
								</button>
								<!-- ⚙ BACKEND: bringFocusToTab / setAsWelcomeTab are server
								     admin commands (notes.md Behavior). No client handler
								     exists yet — rendered honest-disabled, never faked. -->
								<button type="button" role="menuitem" disabled title="Requires server support">
									<Icon name="eye" size={12} /> Bring everyone here
								</button>
								<button type="button" role="menuitem" disabled title="Requires server support">
									<Icon name="home" size={12} /> Make Welcome Mat
								</button>
								<button
									type="button"
									role="menuitem"
									class="del"
									onclick={(e) => {
										e.stopPropagation();
										cogOpenFor = null;
										remove(n);
									}}
								>
									<Icon name="trash-alt" size={12} /> Delete
								</button>
							</div>
						{/if}
					</span>
				{/if}
			</div>
		{/each}
		{#if canManage}
			<button type="button" class="new" onclick={createNote} disabled={busy}>
				<Icon name="plus" size={12} /> New note
			</button>
		{/if}
	</div>

	{#if error}<p class="error">{error}</p>{/if}

	{#if selected}
		<!-- Reference note-view: the scrolling note body fills the pane, and the
			     options bar (.noteOptions) is a STICKY BOTTOM bar — no top toolbar,
			     no duplicate title heading (the title is the active tab label). -->
		<div class="body">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored note HTML, DOMPurify-sanitised -->
			<div class="rendered">{@html sanitize(selected.body)}</div>
		</div>

		<!-- HARD EVIDENCE (states["pane:Notes"] node42 .noteOptions
			 justify-content:space-between): LEFT cell (node43 div) holds the
			 Download button (node44 .noteDownload); RIGHT cell holds the manage
			 controls. -->
		<div class="options">
			<div class="left">
				<button type="button" class="download" onclick={() => download(selected)}>
					<!-- HARD EVIDENCE (node45 i.fas.fa-download font-size 14px). -->
					<Icon name="download" size={14} /> Download
				</button>
			</div>
			{#if canManage}
				<div class="right">
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
					<!-- HARD EVIDENCE (notes.md Global CSS `.noteOptions .noteEdit`
					     + Resolved): Edit button is a FILLED --note-next-bg #45a2ff /
					     #fff button. -->
					<button type="button" class="ic edit" onclick={() => (editorOpen = true)} aria-label="Edit">
						<Icon name="pen" />
					</button>
					<button type="button" class="ic" onclick={() => rename(selected)} aria-label="Rename">
						<Icon name="pencil-alt" />
					</button>
					<button type="button" class="ic del" onclick={() => remove(selected)} aria-label="Delete">
						<Icon name="trash-alt" />
					</button>
				</div>
			{/if}
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
		/* Reference --note-text-color #676767 (report.md:737,937). */
		color: var(--note-text-color, #676767);
	}
	.subtabs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		/* Reference .noteTabset strip: --notes-tabs-bg #0c2434 with a
		   1px solid var(--tabs-border-color) #0a6db1 border-top
		   (report.md:729,2420). */
		background: var(--notes-tabs-bg, #0c2434);
		border-top: 1px solid var(--tabs-border-color, #0a6db1);
		flex-shrink: 0;
	}
	/* HARD EVIDENCE (notes.md Resolved a.nav-link.active + Global CSS
	   `.noteTabset .nav-link`): font-size 12px / line-height 12px, padding 8px
	   (0.5rem), margin 5px, border-radius 3px, color --tabs-color #fff. */
	.subtabs .tab,
	.subtabs .new {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: transparent;
		border: 1px solid transparent;
		color: var(--tabs-color, #ffffff);
		font-size: 12px;
		line-height: 12px;
		font-weight: 300;
		padding: 0.5rem;
		margin: 5px;
		border-radius: 3px;
		cursor: pointer;
	}
	.subtabs .tab {
		position: relative;
	}
	.subtabs .tab.active {
		/* Active sub-tab pill: --tab-active-bg #45a2ff, white (notes.md Resolved). */
		background: var(--tab-active-bg, #45a2ff);
		border-color: transparent;
		color: #ffffff;
	}
	.subtabs .tab:hover:not(.active) {
		/* Hover border: --tabs-border-color #0a6db1 (notes.md States). */
		border: 1px solid var(--tabs-border-color, #0a6db1);
		border-radius: 3px;
	}
	.subtabs .new {
		color: #ffffff;
	}
	.subtabs .new:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	/* Per-tab cog dropdown (LSe). Menu themed --archives-dropdown-menu-bg-color
	   #0e3651 / item color --tabs-dropdown-color #45a2ff (notes.md Global CSS
	   `.noteTabset .dropdown-menu`). */
	.cog-anchor {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	.cog-toggle {
		display: inline-flex;
		align-items: center;
		color: inherit;
		cursor: pointer;
	}
	.cog-menu {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		z-index: 1000;
		min-width: 220px;
		background: var(--archives-dropdown-menu-bg-color, #0e3651);
		border: none;
		border-radius: 6px;
		padding: 0.5rem 0;
		display: flex;
		flex-direction: column;
	}
	.cog-menu button {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		width: 100%;
		background: transparent;
		border: none;
		/* --tabs-dropdown-color #45a2ff, font-size 15px (notes.md Global CSS
		   `.noteTabset .dropdown-menu .dropdown-item`). */
		color: var(--tabs-dropdown-color, #45a2ff);
		font-size: 15px;
		text-align: left;
		padding: 0.3rem 1rem;
		cursor: pointer;
		white-space: nowrap;
	}
	.cog-menu button:hover:not(:disabled) {
		opacity: 0.85;
	}
	.cog-menu button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.cog-menu button.del {
		/* Delete item echoes the reference --note-delete-bg red accent. */
		color: var(--note-delete-bg, #bb352a);
	}
	/* Reference `.badge.badge-success` on the Welcome-Mat tab: a small green pill
	   holding the fa-home glyph (Darkly success #00bc8c, white icon, p-0). */
	.welcome-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* HARD EVIDENCE (script-results-and-manifests.md ref-presentation node 6
		   .badge.badge-success bg rgb(0,188,140); notes.md Resolved .badge-success
		   #00bc8c): the welcome badge is the FIXED Darkly --success #00bc8c in the
		   room — pinned here (not the app-theme --positive token, which flips to
		   #4a9e15 under :root[data-theme='light'] in layout.css:145) so it stays
		   #00bc8c regardless of the app's light/dark toggle. */
		background: #00bc8c;
		color: #ffffff;
		/* HARD EVIDENCE (states["pane:Notes"] node6 .badge.badge-success.p-0):
		   border-top-left-radius 6px, padding 0px all sides. */
		border-radius: 6px;
		padding: 0;
		line-height: 0;
	}
	/* Reference .noteOptions: sticky BOTTOM bar, --note-options-bg #f4f4f4,
	   padding 10px, holding the action buttons (Download etc.). */
	/* HARD EVIDENCE (states["pane:Notes"] node42 .noteOptions): display:flex,
	   justify-content:space-between, padding 10px, border-top-width 0px. */
	.options {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.3rem;
		position: sticky;
		bottom: 0;
		padding: 10px;
		background: var(--note-options-bg, #f4f4f4);
		flex-shrink: 0;
	}
	/* LEFT cell (node43) holds Download; RIGHT cell holds the .ic manage row. */
	.options .right {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
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
	/* HARD EVIDENCE (notes.md Global CSS `.noteOptions .noteEdit,.noteNext`
	   + token --note-next-bg): Edit is a FILLED #45a2ff / #fff button; hover
	   text → --note-options-hover-color #212529. */
	.ic.edit {
		background: var(--note-next-bg, #45a2ff);
		border-color: var(--note-next-bg, #45a2ff);
		color: #ffffff;
	}
	.ic.edit:hover:not(:disabled) {
		border-color: var(--note-next-bg, #45a2ff);
		color: var(--note-options-hover-color, #212529);
	}
	/* Reference note delete is a FILLED --note-delete-bg #bb352a button
	   (notes.md Resolved button.noteDelete). */
	.ic.del {
		background: var(--note-delete-bg, #bb352a);
		border-color: var(--note-delete-bg, #bb352a);
		color: #ffffff;
	}
	.ic.del:hover:not(:disabled) {
		/* Reference `.noteOptions .noteDelete:hover{color:#212529}` — text darkens,
		   fill unchanged (notes.md Global CSS + --note-options-hover-color). */
		border-color: var(--note-delete-bg, #bb352a);
		color: var(--note-options-hover-color, #212529);
	}
	.download {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: none;
		/* HARD EVIDENCE (states["pane:Notes"] node44 .noteDownload.btn-sm):
		   border-radius 4px, padding 4px 8px, font-size 14px / weight 400. */
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 14px;
		font-weight: 400;
		color: #ffffff;
		cursor: pointer;
		background: var(--note-download-bg, #92d528);
	}
	.download:hover {
		/* Reference `.noteDownload:hover{color:#212529}` (--note-options-hover-color). */
		color: var(--note-options-hover-color, #212529);
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
		/* Reference .note-container body: 16px / line-height 24px. */
		font-size: 16px;
		line-height: 1.5;
		min-height: 0.6em;
	}
	.rendered :global(a) {
		/* HARD EVIDENCE (proroom-modals-and-deep.md §pane:Notes [40] link color
		   rgb(69,162,255); notes.md Resolved: note-body link #45a2ff): note-body
		   links are the fixed room accent #45a2ff (--app-link-color /
		   --modal-alert-link-color), NOT the app-theme --accent token (which flips
		   to #1d7fe0 under :root[data-theme='light'] in layout.css:143). Pinned to
		   the reference hex so links stay #45a2ff in both app themes. */
		color: #45a2ff;
		text-decoration: underline;
	}
	.rendered :global(ul),
	.rendered :global(ol) {
		margin: 0 0 0.6rem;
		padding-left: 1.4rem;
		font-size: 16px;
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
