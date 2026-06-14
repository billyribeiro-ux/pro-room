<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { API_URL } from '$lib/config';
	import { confirmDialog } from '$lib/dialog.svelte';
	import { onMount } from 'svelte';
	import type { RoomFile, FileCategory } from '$lib/types';
	import Icon from './Icon.svelte';

	interface Props {
		roomId: string;
		canManage: boolean;
	}
	let { roomId, canManage }: Props = $props();

	const CATEGORIES: { key: FileCategory; label: string }[] = [
		{ key: 'file', label: 'Files' },
		{ key: 'image', label: 'Images' },
		{ key: 'sound', label: 'Sounds' }
	];

	let files = $state<RoomFile[]>([]);
	let category = $state<FileCategory>('file');
	let query = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);
	let uploading = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	const counts = $derived({
		file: files.filter((f) => f.category === 'file').length,
		image: files.filter((f) => f.category === 'image').length,
		sound: files.filter((f) => f.category === 'sound').length
	});

	const shown = $derived(
		files
			.filter((f) => f.category === category)
			.filter((f) => f.filename.toLowerCase().includes(query.trim().toLowerCase()))
	);

	async function load() {
		busy = true;
		try {
			files = await api.get<RoomFile[]>(`/api/rooms/${roomId}/files`);
			error = null;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load files';
		} finally {
			busy = false;
		}
	}

	onMount(load);

	function fileUrl(f: RoomFile): string {
		return `${API_URL}${f.download_url}`;
	}

	// Cross-origin download: fetch the blob with credentials, then trigger a
	// client-side download via an object URL so the session cookie is sent.
	async function download(f: RoomFile) {
		try {
			const res = await fetch(fileUrl(f), { credentials: 'include' });
			if (!res.ok) throw new Error('download failed');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = f.filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {
			// Fall back to opening the file in a new tab.
			window.open(fileUrl(f), '_blank', 'noopener');
		}
	}

	async function onUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		error = null;
		try {
			const form = new FormData();
			form.append('file', file);
			const res = await fetch(`${API_URL}/api/rooms/${roomId}/files`, {
				method: 'POST',
				credentials: 'include',
				body: form
			});
			if (!res.ok) {
				throw new ApiError(
					res.status,
					'upload',
					res.status === 403 ? 'Not allowed' : 'Upload failed'
				);
			}
			const uploaded = (await res.json()) as RoomFile;
			files = [uploaded, ...files];
			category = uploaded.category;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Upload failed';
		} finally {
			uploading = false;
			input.value = '';
		}
	}

	async function remove(f: RoomFile) {
		if (
			!(await confirmDialog({
				message: `Delete "${f.filename}"?`,
				confirmLabel: 'Delete',
				danger: true
			}))
		)
			return;
		busy = true;
		error = null;
		try {
			await api.delete(`/api/rooms/${roomId}/files/${f.id}`);
			files = files.filter((x) => x.id !== f.id);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not delete file';
		} finally {
			busy = false;
		}
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		const units = ['KB', 'MB', 'GB'];
		let v = bytes / 1024;
		let i = 0;
		while (v >= 1024 && i < units.length - 1) {
			v /= 1024;
			i++;
		}
		return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString([], {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="files">
	<div class="subtabs" role="tablist" aria-label="File categories">
		{#each CATEGORIES as c (c.key)}
			<button
				type="button"
				role="tab"
				aria-selected={category === c.key}
				class:active={category === c.key}
				onclick={() => (category = c.key)}
			>
				{c.label}
				<span class="badge">{counts[c.key]}</span>
			</button>
		{/each}

		<div class="tools">
			<div class="search">
				<Icon name="search" size={15} />
				<input placeholder="Search files…" bind:value={query} />
			</div>
			<button type="button" class="ic" onclick={load} disabled={busy} aria-label="Refresh">
				<Icon name="sync" />
			</button>
			{#if canManage}
				<button
					type="button"
					class="upload"
					onclick={() => fileInput?.click()}
					disabled={uploading}
				>
					<Icon name="upload" size={15} />
					{uploading ? 'Uploading…' : 'Upload'}
				</button>
				<input class="hidden-input" type="file" bind:this={fileInput} onchange={onUpload} />
			{/if}
		</div>
	</div>

	{#if error}<p class="error">{error}</p>{/if}

	<div class="list">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th class="num">Size</th>
					<th class="num">Date</th>
					<th class="act"></th>
				</tr>
			</thead>
			<tbody>
				{#each shown as f (f.id)}
					<tr>
						<td class="name">
							{#if f.category === 'image'}
								<img class="thumb" src={fileUrl(f)} alt={f.filename} loading="lazy" />
							{/if}
							<span class="fn">{f.filename}</span>
						</td>
						<td class="num">{formatSize(f.size_bytes)}</td>
						<td class="num">{formatDate(f.created_at)}</td>
						<td class="act">
							<button type="button" class="download" onclick={() => download(f)}>
								<Icon name="download" size={14} /> Download
							</button>
							{#if canManage}
								<button
									type="button"
									class="del"
									onclick={() => remove(f)}
									aria-label="Delete"
									disabled={busy}
								>
									<Icon name="trash-alt" size={15} />
								</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td class="empty" colspan="4">
							{query ? 'No files match your search.' : 'No files in this category yet.'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.files {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		/* Reference Files pane is the dark navy presenter surface (#0f2e43). */
		background: #0f2e43;
		color: #ffffff;
	}
	.subtabs {
		display: flex;
		/* position:relative so .tools can be pulled out of the centered flow below. */
		position: relative;
		align-items: center;
		/* Reference .files-tabs: justify-content:center — Files / Images / Sounds are
		   ALWAYS centered on the full width; the search/refresh/upload tools are taken
		   out of the flow (absolute, right) so they never shift the three tabs. */
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.35rem;
		padding: 0.6rem 0.85rem;
		/* .files-tabs background: var(--notes-tabs-bg) = #0c2434 */
		background: #0c2434;
		border-bottom: 1px solid transparent;
		flex-shrink: 0;
	}
	.subtabs > button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		/* Hover border reserves 1px so the active/hover swap doesn't shift layout. */
		border: 1px solid transparent;
		/* .files-tabs .nav-link: color #fff; font-size 12px; padding 5px 10px; margin 5px */
		color: #ffffff;
		font-size: 12px;
		font-weight: 600;
		padding: 5px 10px;
		margin: 5px;
		border-radius: 3px;
		cursor: pointer;
	}
	.subtabs > button.active {
		/* .files-tabs .nav-link.active: bg var(--tab-active-bg) #45a2ff; radius 3px; color #fff */
		background: #45a2ff;
		border-color: transparent;
		color: #ffffff;
	}
	.subtabs > button:hover:not(.active) {
		/* hover: 1px solid var(--tabs-border-color) #0a6db1; radius 3px */
		border-color: #0a6db1;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.1rem;
		height: 1.1rem;
		padding: 0 0.3rem;
		border-radius: 999px;
		/* Red count pill — matches the reference's `bg-danger` files badge.
		   .files-badge positioning: margin-top -9px; margin-left 3px. */
		background: #dc3545;
		color: #ffffff;
		font-size: 0.7rem;
		font-weight: 700;
		margin-top: -9px;
		margin-left: 3px;
	}
	.tools {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		/* Out of the centered flow so the three category tabs stay truly centered. */
		position: absolute;
		right: 0.85rem;
		top: 50%;
		transform: translateY(-50%);
	}
	.search {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: #0f2e43;
		border: 1px solid #0a6db1;
		border-radius: 6px;
		padding: 0.2rem 0.6rem;
		color: #9fc4dd;
	}
	.search input {
		border: none;
		outline: none;
		background: transparent;
		/* .files-search .form-control: font-size 12px */
		font-size: 12px;
		color: #ffffff;
		width: 9rem;
	}
	.ic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #0f2e43;
		border: 1px solid #0a6db1;
		/* --reload-icon-color: #45a2ff */
		color: #45a2ff;
		border-radius: 6px;
		/* .files-options button: padding 5px */
		padding: 5px;
		cursor: pointer;
	}
	.ic:hover:not(:disabled) {
		border-color: #45a2ff;
		color: #45a2ff;
	}
	.ic:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.upload {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		/* --tab-active-bg / accent #45a2ff */
		background: #45a2ff;
		border: none;
		color: #ffffff;
		border-radius: 6px;
		/* .files-options button: padding 5px; font-size 12px */
		padding: 5px 10px;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.upload:hover:not(:disabled) {
		background: #0a6db1;
	}
	.upload:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.hidden-input {
		display: none;
	}
	.list {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		/* .fileName/.fileSize/etc all render at 12px in the reference. */
		font-size: 12px;
	}
	thead th {
		position: sticky;
		top: 0;
		background: #0c2434;
		text-align: left;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #9fc4dd;
		padding: 0.5rem 0.85rem;
		border-bottom: 1px solid #1a4f74;
	}
	th.num,
	td.num {
		text-align: right;
		white-space: nowrap;
		/* .st-fileSize: color var(--file-size-color) = #b2b2b2 */
		color: #b2b2b2;
	}
	tbody tr:nth-child(even) {
		background: rgba(255, 255, 255, 0.03);
	}
	tbody td {
		padding: 0.5rem 0.85rem;
		border-bottom: 1px solid #1a4f74;
		vertical-align: middle;
	}
	td.name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.thumb {
		width: 32px;
		height: 32px;
		object-fit: cover;
		border-radius: 5px;
		flex-shrink: 0;
	}
	.fn {
		word-break: break-word;
	}
	td.act {
		text-align: right;
		white-space: nowrap;
	}
	.download {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		/* a.st-fileDownload: bg var(--file-download-bg) #92d528; color var(--tabs-color) #fff;
		   font-size 12px; .fileDownload width 120px. */
		justify-content: center;
		background: #92d528;
		border: none;
		color: #ffffff;
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		width: 120px;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.download:hover {
		opacity: 0.85;
	}
	.del {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* --file-delete-bg: #bb352a */
		background: #bb352a;
		border: 1px solid transparent;
		color: #ffffff;
		border-radius: 6px;
		padding: 0.3rem;
		margin-left: 0.4rem;
		cursor: pointer;
	}
	.del:hover:not(:disabled) {
		opacity: 0.85;
	}
	.del:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.empty {
		text-align: center;
		color: #9fc4dd;
		padding: 2rem;
	}
	.error {
		margin: 0;
		padding: 0.5rem 0.85rem;
		background: rgba(187, 53, 42, 0.15);
		color: #ff6b61;
		font-size: 12px;
	}
</style>
