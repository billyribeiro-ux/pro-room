<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import DOMPurify from 'dompurify';
	import Icon from '../Icon.svelte';
	import Modal from '../Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		initialHtml?: string;
		onSave?: (html: string) => void;
	}
	let { open, onClose, initialHtml = '', onSave }: Props = $props();

	// Captured from the attachment so `send()` can read innerHTML imperatively.
	// The editable surface is driven by execCommand, not Svelte bindings, so we
	// must NOT let the runtime own its content — hence a plain ref, not bind:.
	let editor: HTMLDivElement | null = null;
	// Inline link composer (no window.prompt — it can't be themed or a11y-checked).
	let linkOpen = $state(false);
	let linkUrl = $state('');
	// Cached selection so the link is inserted where the caret was before the
	// composer stole focus.
	let savedRange: Range | null = null;

	// Attachment: capture the node and seed initial content when the editor
	// mounts (the Modal body re-mounts every time `open` flips true, so this
	// re-seeds from the latest `initialHtml` each open). Reading `initialHtml`
	// here means a fresh value also re-runs setup. Returns teardown to clear the
	// ref and the transient link-composer state on unmount.
	//
	// `node.innerHTML = …` is an XSS sink: a stored `<img onerror>` would fire
	// the handler the instant it's inserted (innerHTML doesn't run <script>, but
	// it DOES run inline event handlers). This modal is reusable, so it sanitises
	// its own seed input rather than trusting every caller to pre-clean. Runs in
	// an attachment, which is client-only, so DOMPurify always has a DOM.
	function editorSetup(html: string): Attachment<HTMLDivElement> {
		return (node) => {
			editor = node;
			node.innerHTML = DOMPurify.sanitize(html);
			return () => {
				editor = null;
				linkOpen = false;
				linkUrl = '';
				savedRange = null;
			};
		};
	}

	// document.execCommand is deprecated but remains the pragmatic, universally
	// supported way to apply formatting inside a contenteditable region without a
	// heavyweight editor dependency. Keep the editor focused so the command
	// targets the current selection.
	function exec(command: string, value?: string) {
		editor?.focus();
		document.execCommand(command, false, value);
	}

	function captureSelection() {
		const sel = window.getSelection();
		savedRange = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
	}

	function restoreSelection() {
		if (!savedRange) return;
		const sel = window.getSelection();
		sel?.removeAllRanges();
		sel?.addRange(savedRange);
	}

	function openLinkComposer() {
		captureSelection();
		linkUrl = '';
		linkOpen = true;
		// Focus is handled by the {@attach} on the input — it mounts only while
		// the composer is open, so the attachment fires exactly when we need it.
	}

	function applyLink() {
		const url = linkUrl.trim();
		if (url) {
			editor?.focus();
			restoreSelection();
			document.execCommand('createLink', false, url);
		}
		linkOpen = false;
		linkUrl = '';
		savedRange = null;
	}

	function cancelLink() {
		linkOpen = false;
		linkUrl = '';
		savedRange = null;
		editor?.focus();
		restoreSelection();
	}

	function onLinkKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			applyLink();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			cancelLink();
		}
	}

	function send() {
		onSave?.(editor?.innerHTML ?? '');
		onClose();
	}

	type ToolButton = {
		label: string;
		icon: string;
		action: () => void;
	};

	const tools: ToolButton[] = [
		{ label: 'Bold', icon: 'bold', action: () => exec('bold') },
		{ label: 'Italic', icon: 'italic', action: () => exec('italic') },
		{ label: 'Underline', icon: 'underline', action: () => exec('underline') },
		{ label: 'Bullet list', icon: 'list-ul', action: () => exec('insertUnorderedList') },
		{ label: 'Link', icon: 'link', action: openLinkComposer }
	];
</script>

{#snippet footer()}
	<!-- Reference footer splits Close (left) and Send (right) across the full width. -->
	<div class="foot-split">
		<button class="btn ghost" type="button" onclick={onClose}>Close</button>
		<button class="btn primary" type="button" onclick={send}>Send</button>
	</div>
{/snippet}

<Modal {open} {onClose} title="Rich Text Editor" {footer}>
	<div class="rte">
		<div class="toolbar" role="toolbar" aria-label="Text formatting" aria-controls="rte-editor">
			{#each tools as tool (tool.label)}
				<button
					class="tool"
					type="button"
					title={tool.label}
					aria-label={tool.label}
					onmousedown={(e) => e.preventDefault()}
					onclick={tool.action}
				>
					<Icon name={tool.icon} />
				</button>
			{/each}
		</div>

		{#if linkOpen}
			<div class="link-bar">
				<label class="link-label" for="rte-link-url">Link URL</label>
				<input
					id="rte-link-url"
					class="link-input"
					type="url"
					placeholder="https://example.com"
					bind:value={linkUrl}
					onkeydown={onLinkKeydown}
					{@attach (node) => node.focus()}
				/>
				<button class="btn primary sm" type="button" onclick={applyLink}>Add</button>
				<button class="btn ghost sm" type="button" onclick={cancelLink}>Cancel</button>
			</div>
		{/if}

		<div
			id="rte-editor"
			class="editor"
			contenteditable="true"
			role="textbox"
			aria-multiline="true"
			aria-label="Message body"
			{@attach editorSetup(initialHtml)}
		></div>
	</div>
</Modal>

<style>
	.rte {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.foot-split {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0.4rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.tool {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius);
		color: var(--text-dim);
		cursor: pointer;
	}
	.tool:hover {
		color: var(--text);
		background: var(--bg-elev-2);
		border-color: var(--border);
	}
	.tool:active {
		color: var(--accent);
		border-color: var(--accent);
	}
	.link-bar {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.link-label {
		font-size: 0.78rem;
		color: var(--text-dim);
		flex: 0 0 auto;
	}
	.link-input {
		flex: 1 1 auto;
		min-width: 0;
		padding: 0.35rem 0.5rem;
		font-size: 0.85rem;
		color: var(--text);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.link-input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.editor {
		min-height: 200px;
		max-height: 50vh;
		overflow-y: auto;
		padding: 0.75rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: #1a1a1a;
		background: #fff;
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.editor:focus {
		outline: none;
		border-color: var(--accent);
	}
	.editor :global(a) {
		color: var(--accent);
		text-decoration: underline;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
		cursor: pointer;
	}
	.btn.sm {
		padding: 0.35rem 0.6rem;
		font-size: 0.78rem;
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
	}
	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--accent);
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
</style>
