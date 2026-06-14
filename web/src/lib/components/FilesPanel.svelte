<script lang="ts">
	import { api, ApiError } from '$lib/api';
	import { API_URL } from '$lib/config';
	import { confirmDialog } from '$lib/dialog.svelte';
	import { onMount } from 'svelte';
	import type { RoomFile, FileCategory } from '$lib/types';
	import {
		DownloadSimpleIcon,
		MagnifyingGlassIcon,
		ArrowClockwiseIcon,
		UploadSimpleIcon,
		TrashIcon
	} from 'phosphor-svelte';

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
				<MagnifyingGlassIcon size={15} />
				<input placeholder="Search files…" bind:value={query} />
			</div>
			<button type="button" class="ic" onclick={load} disabled={busy} aria-label="Refresh">
				<ArrowClockwiseIcon size={16} />
			</button>
			{#if canManage}
				<button
					type="button"
					class="upload"
					onclick={() => fileInput?.click()}
					disabled={uploading}
				>
					<UploadSimpleIcon size={15} weight="bold" />
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
								<DownloadSimpleIcon size={14} weight="bold" /> Download
							</button>
							{#if canManage}
								<button
									type="button"
									class="del"
									onclick={() => remove(f)}
									aria-label="Delete"
									disabled={busy}
								>
									<TrashIcon size={15} />
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
		background: #ffffff;
		color: #1f2430;
	}
	.subtabs {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.35rem;
		padding: 0.6rem 0.85rem;
		background: #eef1f6;
		border-bottom: 1px solid #dfe2ea;
		flex-shrink: 0;
	}
	.subtabs > button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: #ffffff;
		border: 1px solid #d3d7e0;
		color: #4b5160;
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		cursor: pointer;
	}
	.subtabs > button.active {
		background: #1f86d6;
		border-color: #1f86d6;
		color: #ffffff;
	}
	.subtabs > button:hover:not(.active) {
		border-color: #1f86d6;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.1rem;
		height: 1.1rem;
		padding: 0 0.3rem;
		border-radius: 999px;
		/* Red count pill — matches the reference's `bg-danger` files badge. */
		background: #dc3545;
		color: #ffffff;
		font-size: 0.7rem;
		font-weight: 700;
	}
	.tools {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-left: auto;
	}
	.search {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: #ffffff;
		border: 1px solid #d3d7e0;
		border-radius: 999px;
		padding: 0.2rem 0.6rem;
		color: #7b8190;
	}
	.search input {
		border: none;
		outline: none;
		background: transparent;
		font-size: 0.82rem;
		color: #1f2430;
		width: 9rem;
	}
	.ic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #ffffff;
		border: 1px solid #d3d7e0;
		color: #6b7180;
		border-radius: 6px;
		padding: 0.35rem;
		cursor: pointer;
	}
	.ic:hover:not(:disabled) {
		border-color: #1f86d6;
		color: #1f86d6;
	}
	.ic:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.upload {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: #1f86d6;
		border: none;
		color: #ffffff;
		border-radius: 6px;
		padding: 0.35rem 0.7rem;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
	}
	.upload:hover:not(:disabled) {
		background: #1a73ba;
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
		font-size: 0.85rem;
	}
	thead th {
		position: sticky;
		top: 0;
		background: #f7f8fa;
		text-align: left;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #8a909c;
		padding: 0.5rem 0.85rem;
		border-bottom: 1px solid #e3e5ec;
	}
	th.num,
	td.num {
		text-align: right;
		white-space: nowrap;
		color: #5a6170;
	}
	tbody tr:nth-child(even) {
		background: #f7f8fa;
	}
	tbody td {
		padding: 0.5rem 0.85rem;
		border-bottom: 1px solid #eceef3;
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
		background: #16a34a;
		border: none;
		color: #ffffff;
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
	}
	.download:hover {
		background: #138a3e;
	}
	.del {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid #d3d7e0;
		color: #6b7180;
		border-radius: 6px;
		padding: 0.3rem;
		margin-left: 0.4rem;
		cursor: pointer;
	}
	.del:hover:not(:disabled) {
		border-color: #ea3943;
		color: #ea3943;
	}
	.del:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.empty {
		text-align: center;
		color: #8a909c;
		padding: 2rem;
	}
	.error {
		margin: 0;
		padding: 0.5rem 0.85rem;
		background: #fdecec;
		color: #c0292f;
		font-size: 0.82rem;
	}
</style>
