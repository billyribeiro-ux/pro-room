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
	// Reference ships a hidden <audio id="mp3player"> as the Sounds-tab playback
	// sink (file6-room-area.md:245-251) — clicking a sound file plays it here.
	let mp3player = $state<HTMLAudioElement | null>(null);
	let playingId = $state<string | null>(null);

	function playSound(f: RoomFile) {
		if (!mp3player) return;
		if (playingId === f.id) {
			mp3player.pause();
			playingId = null;
			return;
		}
		mp3player.src = fileUrl(f);
		void mp3player.play().catch(() => {
			playingId = null;
		});
		playingId = f.id;
	}

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

	// HARD EVIDENCE (tab:Files DOM per row: span.st-fileSize "297Kb"): the reference
	// renders size as an integer count of Kb suffixed with "Kb" (e.g. 297Kb), and
	// 0Kb for anything under 1Kb — NOT KB/MB/GB. `.st-fileSize` color #b2b2b2, 12px.
	function formatSize(bytes: number): string {
		return `${Math.round(bytes / 1024)}Kb`;
	}

	// HARD EVIDENCE (tab:Files DOM per row: div.st-fileName > <i>May 4, 2026,
	// 4:09:55 PM</i>): the italic line under the name is the full localized
	// date-TIME (en-US, "Month D, YYYY, h:mm:ss AM/PM"), not a bare short date.
	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
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
				<!-- HARD EVIDENCE (tab:Files sub-tab badges = span.badge.rounded-pill
				     .bg-danger.files-badge; capture shows Files 50 / Images 11 /
				     Sounds 0): red danger pill showing the REAL per-category count,
				     ALWAYS rendered including 0. `.files-badge` notches up-right
				     (margin-top:-9px; margin-left:3px). -->
				<span class="badge">{counts[c.key]}</span>
			</button>
		{/each}

	</div>

	<!-- Reference Files search sits in its OWN centered 75%-wide row BELOW the tab
	     strip (file6 DOM: div.d-flex.flex-wrap.justify-content-center.w-75.m-auto >
	     div.flex-fill > div.input-group.st-searchbar > input.form-control + right
	     icon addon). Refresh is the blue .st-fileSeeMore labeled button. -->
	<div class="file-controls">
		<div class="searchbar">
			<input
				id="files-search"
				name="files-search"
				type="text"
				aria-label="search"
				placeholder="Search files..."
				bind:value={query}
			/>
			<span class="searchbar-icon" aria-hidden="true"><Icon name="search" size={14} /></span>
		</div>
		<button type="button" class="see-more" onclick={load} disabled={busy} title="Reload list">
			Refresh<Icon name="sync" size={12} />
		</button>
		{#if canManage}
			<button
				type="button"
				class="see-more upload"
				onclick={() => fileInput?.click()}
				disabled={uploading}
			>
				{uploading ? 'Uploading…' : 'Upload'}<Icon name="upload" size={12} />
			</button>
			<input class="hidden-input" type="file" bind:this={fileInput} onchange={onUpload} />
		{/if}
	</div>

	{#if error}<p class="error">{error}</p>{/if}

	<div class="list">
		<table>
			<thead>
				<tr>
					<th>Name</th>
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
							<!-- HARD EVIDENCE (tab:Files td1: div.d-flex.flex-column > div >
							     span.st-fileName + span.st-fileSize.ml-2 + div.st-fileName >
							     <i>date-time</i>): name (+ inline size) stacked over the
							     italic full date-time line. -->
							<div class="name-col">
								<div class="name-row">
									{#if f.category === 'sound'}
										<button
											type="button"
											class="fn sound-link"
											onclick={() => playSound(f)}
											title={playingId === f.id ? 'Stop' : 'Play'}
										>
											<Icon name={playingId === f.id ? 'stop' : 'play'} size={10} />
											{f.filename}
										</button>
									{:else}
										<span class="fn">{f.filename}</span>
									{/if}
									<!-- span.st-fileSize.ml-2: #b2b2b2, integer Kb + "Kb". -->
									<span class="size-inline">{formatSize(f.size_bytes)}</span>
								</div>
								<!-- div.st-fileName > <i>: italic full date-time under the name. -->
								<div class="date-line"><i>{formatDate(f.created_at)}</i></div>
							</div>
						</td>
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
						<td class="empty" colspan="2">
							{query ? 'No files match your search.' : 'No files in this category yet.'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Reference hidden audio sink for the Sounds tab (file6-room-area.md:245-251). -->
	<audio id="mp3player" bind:this={mp3player} onended={() => (playingId = null)} hidden></audio>
</div>

<style>
	.files {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		/* Reference Files pane is the NAVY presenter surface #0f2e43 — only the
		   table ROWS are the light striped list; the search row + surround stay
		   navy (file6: #files pane has no bg, inherits .presentation-box
		   --presenter-area-bg; report.md:2580,728). */
		background: var(--presenter-area-bg, #0f2e43);
		color: #ffffff;
	}
	.subtabs {
		display: flex;
		align-items: center;
		/* Reference .files-tabs: justify-content:center — Files / Images / Sounds
		   centered. Search/refresh moved to their own row below (no absolute tools). */
		justify-content: center;
		flex-wrap: wrap;
		gap: 0;
		padding: 0;
		/* .files-tabs background: var(--notes-tabs-bg) = #0c2434 (report.md:729). */
		background: var(--notes-tabs-bg, #0c2434);
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
		/* .files-tabs .nav-link: color #fff; 12px weight 300 (tab family computed,
		   report.md:2454); padding 5px 10px; margin 5px. */
		color: #ffffff;
		font-size: 12px;
		font-weight: 300;
		padding: 5px 10px;
		margin: 5px;
		border-radius: 3px;
		cursor: pointer;
	}
	.subtabs > button.active {
		/* .files-tabs .nav-link.active: bg var(--tab-active-bg) #45a2ff; radius 3px;
		   color #fff (report.md:2459). */
		background: var(--tab-active-bg, #45a2ff);
		border-color: transparent;
		color: #ffffff;
	}
	.subtabs > button:hover:not(.active) {
		/* hover: 1px solid var(--tabs-border-color) #0a6db1 (report.md:2460). */
		border-color: var(--tabs-border-color, #0a6db1);
	}
	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* Reference .badge: padding .35em .65em; font-size .75em; line-height 1;
		   1px solid #000 border; .rounded-pill = 50rem (full pill). Sized by
		   padding, NOT a fixed min-width/height. */
		padding: 0.35em 0.65em;
		line-height: 1;
		border: 1px solid #000000;
		border-radius: 50rem;
		/* `.badge.bg-danger` computes Bootstrap danger #dc3545 (220,53,69). */
		background: rgb(220, 53, 69);
		color: #ffffff;
		font-size: 0.75em;
		font-weight: 700;
		/* .files-badge: notch up-right onto the sub-tab label (margin -9px 0 0 3px). */
		margin: -9px 0 0 3px;
	}
	/* Reference: search + refresh live in their OWN centered 75%-wide row BELOW
	   the tab strip (file6 DOM: div.d-flex.flex-wrap.justify-content-center
	   .align-items-center.w-75.m-auto). */
	.file-controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
		width: 75%;
		margin: 0.6rem auto;
		flex-shrink: 0;
	}
	/* Reference div.input-group.st-searchbar: flex-fills the row; white bar
	   (--file-searchbar-bg #fff), 32px tall, radius .25rem; input.form-control on
	   the LEFT + fa-search icon addon on the RIGHT (file6 CSS). */
	.searchbar {
		display: flex;
		flex: 1 1 auto;
		min-width: 8rem;
		height: 32px;
		background: var(--file-searchbar-bg, #ffffff);
		border-radius: 0.25rem;
		overflow: hidden;
	}
	.searchbar input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		box-shadow: none;
		background: transparent;
		height: 32px;
		padding: 0 0.6rem;
		font-size: 12px;
		/* --file-searchbar-color #b7b7b7. */
		color: var(--file-searchbar-color, #b7b7b7);
	}
	/* Reference .st-searchbar-icon: right addon, radius 0 .25rem .25rem 0, height
	   32px, padding 3px 10px, --file-searchbar-icon-color #666. */
	.searchbar-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 32px;
		padding: 3px 10px;
		background: var(--file-searchbar-bg, #ffffff);
		color: var(--file-searchbar-icon-color, #666666);
		border-radius: 0 0.25rem 0.25rem 0;
		cursor: pointer;
	}
	/* Reference .st-fileSeeMore: --file-see-more-bg #45a2ff / --tabs-color #fff,
	   12px, labeled button (Refresh / Upload) with a trailing icon. */
	.see-more {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--file-see-more-bg, #45a2ff);
		border: none;
		color: #ffffff;
		border-radius: 0.25rem;
		padding: 5px 10px;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.see-more:hover:not(:disabled) {
		opacity: 0.9;
	}
	.see-more:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.hidden-input {
		display: none;
	}
	/* Reference .fileList is the light striped table capped at max-height:350px,
	   scrolling internally, so the navy pane shows around/below it (file6 CSS).
	   White background here so the rows read as the light list on the navy pane. */
	.list {
		flex: 1;
		min-height: 0;
		max-height: 350px;
		overflow-y: auto;
		background: var(--file-list-odd-bg, #ffffff);
		margin: 0.4rem;
		border-radius: 4px;
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
		background: var(--file-list-odd-bg, #ffffff);
		text-align: left;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--content-text, #676767);
		padding: 0.5rem 0.85rem;
		border-bottom: 1px solid var(--content-separator-bg, #e8e8e8);
	}
	/* Reference striped rows: even #f4f4f4 / odd #fff (report.md:744,2932). */
	tbody tr:nth-child(even) {
		background: var(--file-list-even-bg, #f4f4f4);
	}
	tbody td {
		padding: 0.5rem 0.85rem;
		vertical-align: middle;
	}
	td.name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	/* HARD EVIDENCE (tab:Files td1 = div.d-flex.flex-column): name row stacked
	   over the italic date-time line. */
	.name-col {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.name-row {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.2rem;
	}
	.thumb {
		width: 32px;
		height: 32px;
		object-fit: cover;
		border-radius: 5px;
		flex-shrink: 0;
	}
	.fn {
		/* .st-fileName { word-break: break-all; color: var(--file-name-color) }. */
		word-break: break-all;
		color: var(--file-name-color, #0a6db1);
	}
	/* .st-fileSize.ml-2: color var(--file-size-color) #b2b2b2; 12px. */
	.size-inline {
		margin-left: 0.5rem;
		color: var(--file-size-color, #b2b2b2);
		font-size: 12px;
		white-space: nowrap;
	}
	/* div.st-fileName > <i>: italic full date-time line under the name; inherits
	   .st-fileName color #0a6db1, renders 12px italic. */
	.date-line {
		color: var(--file-name-color, #0a6db1);
		font-size: 12px;
		font-style: italic;
	}
	.date-line i {
		font-style: italic;
	}
	.sound-link {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: transparent;
		border: none;
		padding: 0;
		font-size: 12px;
		cursor: pointer;
	}
	/* HARD EVIDENCE (tab:Files td2: centered a.btn.st-fileDownload): the download
	   cell is centered, not right-aligned. */
	td.act {
		text-align: center;
		white-space: nowrap;
	}
	.download {
		display: inline-flex;
		align-items: center;
		/* i.fas.fa-download.mr-2 (0.5rem) BEFORE the "Download" text. */
		gap: 0.5rem;
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
		color: var(--content-text, #676767);
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
