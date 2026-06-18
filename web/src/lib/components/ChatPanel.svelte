<script lang="ts">
	import { tick } from 'svelte';
	import type {
		Message,
		ChatChannel,
		PresentUser,
		ReactionTally,
		ReactionTarget
	} from '$lib/types';
	import { formatStamp, dayKey, formatDayLabel } from '$lib/message';
	import { muted } from '$lib/stores/social.svelte';
	import { prefs } from '$lib/stores/prefs.svelte';
	import { shouldThrottle } from '$lib/stores/visibility.svelte';
	import MessageBody from './MessageBody.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import UserInfoModal from './modals/UserInfoModal.svelte';
	import AdvancedSearchModal from './modals/AdvancedSearchModal.svelte';
	import SettingsModal from './modals/SettingsModal.svelte';
	import EditProfileModal from './modals/EditProfileModal.svelte';
	import Icon from './Icon.svelte';
	import { API_URL } from '$lib/config';
	import { showToast } from '$lib/stores/toast.svelte';
	import type { Attachment } from 'svelte/attachments';

	export type ChatItem = Message & {
		author_name?: string;
		image_url?: string;
		/** Per-message username colour; wins over the theme token when set. */
		author_color?: string;
	};

	interface Props {
		/** Room id — used by the composer's inline image upload endpoint. */
		roomId: string;
		messages: ChatItem[];
		channel: ChatChannel;
		present?: PresentUser[];
		canPost: boolean;
		onPost: (body: string) => Promise<void>;
		onChannel: (channel: ChatChannel) => void;
		/** Aggregated reactions keyed `${target_kind}:${target_id}`. */
		reactions?: Record<string, ReactionTally[]>;
		canReact?: boolean;
		onReact?: (targetKind: ReactionTarget, targetId: string, emoji: string) => void;
		/** Admin: delete any message (shown in the row menu). */
		canManage?: boolean;
		onDelete?: (id: string) => void;
	}
	let {
		roomId,
		messages,
		channel,
		present = [],
		canPost,
		onPost,
		onChannel,
		reactions = {},
		canReact = false,
		onReact,
		canManage = false,
		onDelete
	}: Props = $props();

	let body = $state('');
	let sending = $state(false);

	// Hide chat from muted users (client-side, per-device list) — matches the
	// reference, where muting filters that user's messages locally.
	const filteredMessages = $derived(messages.filter((m) => !muted.has(m.author_id)));

	// "Reduce Chatlog Memory" (reference trimChatLogs): when on, only keep the most
	// recent TRIM_SIZE rows in view — fewer DOM nodes + less retained state. Mirrors
	// the reference, which shift()s the oldest entries past globals.trimLogSize.
	const TRIM_SIZE = 300;
	const visibleMessages = $derived(
		prefs.trimChatLogs && filteredMessages.length > TRIM_SIZE
			? filteredMessages.slice(-TRIM_SIZE)
			: filteredMessages
	);

	// Trader options for the Advanced Search multi-select = the present roster.
	const traderOptions = $derived(present.map((p) => ({ value: p.user_id, label: p.display_name })));

	// Which row's ⠇ menu is open (message id), or null when none.
	let openMenuId = $state<string | null>(null);

	// The scrollable message list; auto-scrolls to the newest message (the bottom)
	// when one arrives — but only if the viewer is already near the bottom, so
	// scrolling up to read history isn't interrupted. Measured BEFORE the DOM
	// updates ($effect.pre — the canonical Svelte 5 chat-autoscroll pattern).
	let messagesEl = $state<HTMLUListElement | undefined>();
	// One-shot override set when WE send, so our own message always scrolls into
	// view even if we'd scrolled up. Plain (non-reactive) let — only a messages
	// change re-runs the effect, not toggling this flag.
	let stickNext = false;
	$effect.pre(() => {
		if (!messagesEl) return; // not yet mounted
		visibleMessages.length; // re-run whenever the (filtered) list changes
		// "Tab sleep optimization": skip the autoscroll DOM write while the tab is
		// hidden so a backgrounded room doesn't do layout work.
		if (shouldThrottle()) return;
		const atBottom = messagesEl.offsetHeight + messagesEl.scrollTop > messagesEl.scrollHeight - 40;
		// "Always Scroll To Bottom" (reference alwaysScrollToBottom) overrides the
		// near-bottom guard so the log always snaps to the newest message.
		if (atBottom || stickNext || prefs.alwaysScrollToBottom) {
			stickNext = false;
			tick().then(() => messagesEl?.scrollTo(0, messagesEl.scrollHeight));
		}
	});

	// User-info modal target (a row's author), or null when closed.
	let infoUser = $state<{ display_name?: string; user_id?: string; online?: boolean } | null>(null);

	// Header affordances (were dead): advanced-search modal + the settings gear.
	let searchOpen = $state(false);
	let settingsOpen = $state(false);
	let editProfileOpen = $state(false);

	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	// Auto-grow the composer; cap at 300px to match the reference textarea's
	// computed max-height (reference-divergences.md:351-357) and our own
	// `.pill textarea { max-height: 300px }`. The prior 120px clamp silently
	// overrode the CSS, capping growth at ~5 lines instead of the reference's ~14.
	function autogrow() {
		const el = textareaEl;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
	}

	async function send() {
		const text = body.trim();
		if (!text || sending) return;
		sending = true;
		// Always scroll our own message into view when it lands (bypasses the
		// near-bottom guard).
		stickNext = true;
		try {
			await onPost(text);
			body = '';
			autogrow();
		} finally {
			sending = false;
		}
	}

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		void send();
	}

	// Enter sends; Shift+Enter inserts a newline (reference behaviour).
	function onComposerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void send();
		}
	}

	function initials(name: string | undefined) {
		const n = (name ?? 'trader').trim();
		const parts = n.split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '?';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function toggleMenu(id: string) {
		openMenuId = openMenuId === id ? null : id;
	}

	async function copyBody(m: ChatItem) {
		try {
			await navigator.clipboard.writeText(m.body);
		} catch {
			// Clipboard can reject (permissions/insecure context); nothing to recover.
		}
		openMenuId = null;
	}

	function openUserInfo(m: ChatItem) {
		infoUser = {
			display_name: m.author_name,
			user_id: m.author_id,
			online: present.some((p) => p.user_id === m.author_id)
		};
		openMenuId = null;
	}

	// "Mention" drops "@name " into the composer.
	function mention(m: ChatItem) {
		const name = (m.author_name ?? 'trader').trim();
		body = body ? `${body} @${name} ` : `@${name} `;
		openMenuId = null;
	}

	// ─── Composer affordances (reference: Add Emojis / Upload an Image / GIF) ──────
	let fileInputEl = $state<HTMLInputElement | null>(null);
	let emojiOpen = $state(false);
	let uploading = $state(false);

	// Curated native-Unicode set — the reference uses OS color-emoji glyphs (no
	// emoji-mart/twemoji dependency), same approach as ReactionBar.svelte.
	const EMOJI = [
		'😀', '😂', '😅', '😍', '😎', '🤔', '😮', '😢', '😡', '👍',
		'👎', '👏', '🙏', '🔥', '🚀', '💯', '✅', '❌', '🎯', '💪',
		'📈', '📉', '💰', '🐂', '🐻', '⚡', '👀', '❤️', '🎉', '⭐'
	] as const;

	/**
	 * Splice `text` into the composer at the caret (fallback to append), then
	 * refocus and re-grow — the caret-aware sibling of mention(). Used by both the
	 * emoji picker and the image-upload result.
	 */
	function insertAtCaret(text: string) {
		const el = textareaEl;
		if (!el) {
			body = body ? `${body} ${text} ` : `${text} `;
			return;
		}
		const start = el.selectionStart ?? body.length;
		const end = el.selectionEnd ?? body.length;
		body = body.slice(0, start) + text + body.slice(end);
		const caret = start + text.length;
		void tick().then(() => {
			el.focus();
			el.setSelectionRange(caret, caret);
			autogrow();
		});
	}

	function pickEmoji(glyph: string) {
		insertAtCaret(glyph);
		emojiOpen = false;
	}

	/**
	 * Upload a chat image to the member inline-upload endpoint and splice its URL
	 * into the message body. The field name MUST be `file`; the endpoint is
	 * image-only (400 otherwise) and capped at 25 MB (413). Errors surface via toast
	 * (never swallowed — CLAUDE.md). The URL goes out as normal message text.
	 */
	async function onPickImage(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = ''; // allow re-picking the same file later
		if (!file || uploading) return;
		uploading = true;
		try {
			const form = new FormData();
			form.append('file', file);
			const res = await fetch(`${API_URL}/api/rooms/${roomId}/uploads`, {
				method: 'POST',
				credentials: 'include',
				body: form
			});
			if (!res.ok) {
				const msg =
					res.status === 413
						? 'That image is larger than the 25 MB limit.'
						: res.status === 400
							? 'Only image files can be uploaded here.'
							: 'Could not upload the image. Please try again.';
				showToast('Upload failed', msg, 6000);
				return;
			}
			const { url } = (await res.json()) as { url: string };
			// The server returns a RELATIVE download path (/api/rooms/.../download).
			// parseMessage's URL matcher only tokenizes absolute http(s) URLs, so insert
			// the absolute form — otherwise the link is never recognized and the image
			// never renders inline (it'd sit in the body as plain text).
			insertAtCaret(url.startsWith('http') ? url : `${API_URL}${url}`);
		} catch {
			showToast('Upload failed', 'Could not reach the server to upload the image.', 6000);
		} finally {
			uploading = false;
		}
	}

	/** Close the emoji popover on Escape or an outside click (reuses ReactionBar's pattern). */
	const dismissEmoji: Attachment<HTMLElement> = (node) => {
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') emojiOpen = false;
		}
		function onPointerdown(e: PointerEvent) {
			if (e.target instanceof Node && !node.contains(e.target)) emojiOpen = false;
		}
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('pointerdown', onPointerdown, true);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('pointerdown', onPointerdown, true);
		};
	};

	// Reference textAreaBtnsCol (verified against the live reference DOM): the
	// emoji / image / GIF buttons are shown INLINE next to the textarea — there is
	// NO "+" collapse. (An earlier odds-and-ends capture showed a "+"; the shipped
	// reference renders the three buttons directly, so we match that.)
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (openMenuId = null)} />

<section class="panel">
	<header>
		<div class="lead"><Icon name="comment" size={16} /></div>
		<div class="tabs" role="tablist" aria-label="Chat channels">
			<button
				type="button"
				role="tab"
				aria-selected={channel === 'main'}
				class:active={channel === 'main'}
				onclick={() => onChannel('main')}>Main Chat</button
			>
			<button
				type="button"
				role="tab"
				aria-selected={channel === 'off_topic'}
				class:active={channel === 'off_topic'}
				onclick={() => onChannel('off_topic')}>Off Topic</button
			>
		</div>
		<div class="actions">
			<button type="button" aria-label="Search chat" onclick={() => (searchOpen = true)}
				><Icon name="search" size={16} /></button
			>
			<button
				type="button"
				class="gear"
				aria-label="Chat settings"
				aria-haspopup="dialog"
				aria-expanded={settingsOpen}
				onclick={() => (settingsOpen = true)}
			>
				<Icon name="cog" size={16} /><Icon name="caret-down" size={10} />
			</button>
		</div>
	</header>

	<ul
		class="messages"
		class:compact={prefs.chatMode === 'compact'}
		class:small-images={prefs.smallImagePreview}
		bind:this={messagesEl}
	>
		{#each visibleMessages as m, i (m.id)}
			{@const prev = visibleMessages[i - 1]}
			{@const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at)}
			{#if newDay}
				<li class="separator-row">
					<span class="separator">{formatDayLabel(m.created_at)}</span>
				</li>
			{/if}
			<li class="msg-box" class:elevated={!!m.author_role && m.author_role !== 'member'}>
				<div class="row1">
					<div class="msg-menu">
						<button
							type="button"
							class="menu-trigger"
							aria-label="Message options"
							aria-haspopup="menu"
							aria-expanded={openMenuId === m.id}
							onclick={() => toggleMenu(m.id)}
						>
							<!-- Reference row menu is the single-column dots kebab "⠇" (U+2807:
							     3 dots filled on the left, 3 empty on the right), 20px / weight 600
							     in the username colour — confirmed by the reference CSS
							     `menuTriger::after { content: "⠇" }`. -->
							<span class="ellipsis" aria-hidden="true">⠇</span>
						</button>
						{#if openMenuId === m.id}
							<div class="menu" role="menu">
								<button type="button" role="menuitem" onclick={() => openUserInfo(m)}>
									<Icon name="user" size={14} /> User Info
								</button>
								<button type="button" role="menuitem" onclick={() => mention(m)}>
									<Icon name="reply" size={14} /> Mention
								</button>
								<button type="button" role="menuitem" onclick={() => copyBody(m)}>
									<Icon name="copy" size={14} /> Copy
								</button>
								{#if canManage && onDelete}
									<button
										type="button"
										role="menuitem"
										class="danger"
										onclick={() => {
											onDelete?.(m.id);
											openMenuId = null;
										}}
									>
										<Icon name="trash-alt" size={14} /> Delete
									</button>
								{/if}
							</div>
						{/if}
					</div>

					{#if m.image_url}
						<img class="avatar-img" src={m.image_url} alt="" width="36" height="36" />
					{:else}
						<span class="avatar" aria-hidden="true">{initials(m.author_name)}</span>
					{/if}

					<span class="username" style:color={m.author_color ?? 'var(--username-color)'}
						>{m.author_name ?? 'trader'}</span
					>

					<time class="created-at">{formatStamp(m.created_at)}</time>
				</div>

				<p class="body"><MessageBody text={m.body} /></p>

				{#if onReact}
					<ReactionBar
						reactions={reactions[`message:${m.id}`] ?? []}
						{canReact}
						onToggle={(emoji) => onReact?.('message', m.id, emoji)}
					/>
				{/if}
			</li>
		{:else}
			<li class="empty">No messages yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<!-- Reference #textAreaHolder.textSendDiv: a flat white 8px-radius holder with
		     a flex-fill textarea (div.px-0.flex-fill) and a centered icon column
		     (div.textAreaBtnsCol) of span.textAreaBtns — Add Emojis (far fa-smile),
		     Upload an Image (fas fa-image), Search for GIFs (12px "GIF"). There is NO
		     Send button: Enter sends, Shift+Enter inserts a newline. -->
		<form onsubmit={onSubmit}>
			<div class="pill">
				<div class="txt-wrap">
					<textarea
						id="chat-composer"
						name="message"
						bind:this={textareaEl}
						bind:value={body}
						rows="1"
						spellcheck="true"
						maxlength="2000"
						placeholder="Type your message here.."
						oninput={autogrow}
						onkeydown={onComposerKeydown}
					></textarea>
				</div>
				<div class="textAreaBtnsCol">
					<!-- Add Emojis (far fa-smile) → native-Unicode picker popover. -->
					<div class="emoji-wrap">
						<button
							type="button"
							class="textAreaBtns"
							aria-label="Add Emojis"
							title="Add Emojis"
							aria-haspopup="menu"
							aria-expanded={emojiOpen}
							onclick={() => (emojiOpen = !emojiOpen)}
						>
							<Icon name="smile" family="regular" size={18} />
						</button>
						{#if emojiOpen}
							<div class="emoji-pop" role="menu" aria-label="Pick an emoji" {@attach dismissEmoji}>
								{#each EMOJI as glyph (glyph)}
									<button
										type="button"
										class="emoji-cell"
										role="menuitem"
										aria-label="Insert {glyph}"
										onclick={() => pickEmoji(glyph)}
									>
										{glyph}
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Upload an Image (fas fa-image) → hidden file input → /uploads → URL spliced in. -->
					<button
						type="button"
						class="textAreaBtns"
						aria-label="Upload an Image"
						title="Upload an Image"
						disabled={uploading}
						onclick={() => fileInputEl?.click()}
					>
						<Icon name="image" size={18} />
					</button>
					<input bind:this={fileInputEl} type="file" accept="image/*" hidden onchange={onPickImage} />

					<!-- Search for GIFs (12px "GIF") → reference uses GIPHY (needs an API key the
					     app doesn't ship). Rendered disabled rather than half-wired. -->
					<button
						type="button"
						class="textAreaBtns gif"
						aria-label="Search for GIFs"
						title="GIF search is unavailable (requires a GIPHY API key)"
						disabled>GIF</button
					>
				</div>
			</div>
		</form>
	{:else}
		<p class="readonly">You can read the chat. Join the room to participate.</p>
	{/if}
</section>

<UserInfoModal
	open={infoUser !== null}
	user={infoUser ?? undefined}
	onClose={() => (infoUser = null)}
/>
<AdvancedSearchModal
	open={searchOpen}
	traders={traderOptions}
	onClose={() => (searchOpen = false)}
/>
<SettingsModal
	open={settingsOpen}
	onClose={() => (settingsOpen = false)}
	onEditProfile={() => {
		settingsOpen = false;
		editProfileOpen = true;
	}}
/>
<EditProfileModal open={editProfileOpen} onClose={() => (editProfileOpen = false)} />

<style>
	.panel {
		display: flex;
		flex-direction: column;
		background: #ffffff;
		/* Flat: reference room-shell surfaces use border-radius: 0 (no bottom rounding). */
		border-radius: 0;
		overflow: hidden;
		height: 100%;
		min-height: 0;
		color: #1f2430;
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		/* Reference chat-nav header padding is 4px (p-1). */
		padding: 4px;
		min-height: 48px;
		background: #0a6db1;
		color: #ffffff;
		flex-shrink: 0;
	}
	.lead {
		display: inline-flex;
	}
	.tabs {
		display: flex;
		/* Reference ul.nav-tabs has gap:normal; inter-tab spacing comes from each
		   tab link's margin-right:5px (see .tabs button), not a flex gap. */
		gap: 0;
		/* Reference chat tab bar (ul.nav-tabs.flex-grow-1.justify-content-center):
		   fills the width between the lead icon and the actions, centers the tabs,
		   and carries the 1px accent UNDERLINE — captured border-bottom is
		   rgb(69,162,255) = #45a2ff (the accent; within one red-unit of the
		   eyedropped #46A2FF, visually identical). */
		flex: 1;
		justify-content: center;
		border-bottom: 1px solid var(--accent, #45a2ff);
	}
	.tabs button {
		background: transparent;
		/* Reference chat tabs (a.nav-link): a 1px border box kept transparent until
		   active (so active/inactive share the same box size), 12px, weight 700 for
		   BOTH active and inactive (per the captured computed styles — not 300),
		   white, top-only 6px radius, padding 8px 5px 5px. */
		border: 1px solid transparent;
		color: #ffffff;
		font-size: 12px;
		font-weight: 700;
		padding: 8px 5px 5px;
		/* Reference a.nav-link carries margin-right:5px (the only inter-tab spacing). */
		margin-right: 5px;
		border-radius: 6px 6px 0 0;
		cursor: pointer;
	}
	.tabs button.active {
		/* Reference active tab (a.nav-link.active): accent-blue fill + 1px accent
		   border on ALL sides, so its bottom edge merges seamlessly into the tab-bar
		   underline (the folder-tab effect). */
		background: var(--accent, #45a2ff);
		border-color: var(--accent, #45a2ff);
		color: #ffffff;
	}
	.tabs button:hover:not(.active) {
		color: #ffffff;
	}
	.actions {
		display: flex;
		align-items: center;
		/* Reference ul.nav.ml-auto.align-items-center has gap:normal; the gap between
		   the search icon (li.mx-1 → margin-right 4px) and the cog (li.ml-2 →
		   margin-left 8px) sums to 12px. */
		gap: 12px;
	}
	.actions button {
		display: inline-flex;
		align-items: center;
		gap: 0.1rem;
		background: transparent;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.actions button:hover {
		background: rgba(255, 255, 255, 0.18);
	}
	.messages {
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1;
		overflow-y: auto;
		/* Reference chat scroll bg matches the regular rows: the computed
		   --lightTheme-msgs-bg is #fff (the JSON cssVariables.root, authoritative
		   over the conflicting #f1f1f1 !important source). */
		background: #ffffff;
	}
	.empty {
		padding: 0.6rem 0.85rem;
		color: #8a909c;
		text-align: center;
		font-size: 0.85rem;
	}

	.separator-row {
		display: flex;
		justify-content: center;
		padding: 0;
	}
	.separator {
		/* Reference .separator is a flat, full-width gray bar (#e8e8e8) with the
		   readable light-theme date color (#373c42) — not a rounded blue pill. */
		display: block;
		width: 100%;
		text-align: center;
		background: #e8e8e8;
		color: #373c42;
		font-size: 13px;
		font-weight: 300;
		padding: 0;
		line-height: 1.5;
		border-radius: 0;
		white-space: nowrap;
	}

	.msg-box {
		position: relative;
		padding: 0.6rem 0.85rem 0.25rem;
		/* Reference chat .msg-box: bg --msgs-bg (light, computed) = #fff, flat, with
		   a top divider --msg-border-color = #d9d9d9. */
		background: #ffffff;
		border-top: 1px solid #d9d9d9;
		font-size: var(--msg-font-size);
	}
	/* Reference .msg-box-adm: messages from an admin/super-admin (the author's
	   effective room role) get the grey row --msgs-bg-adm = #f4f4f4. */
	.msg-box.elevated {
		background: #f4f4f4;
	}
	/* "Compact Mode" (reference switchChatDisplayMode 'c'): denser rows — tighter
	   vertical padding + smaller body, so more messages fit on screen. */
	.messages.compact .msg-box {
		padding-top: 0.3rem;
		padding-bottom: 0.1rem;
	}
	.messages.compact .row1 {
		gap: 0.35rem;
	}
	.messages.compact .body {
		font-size: 0.82em;
		line-height: 1.25;
	}
	/* "Smaller image preview" (reference smallImagePreview): inline body images
	   render at a reduced max size. The avatar is unaffected. */
	.messages.small-images :global(.body img) {
		max-width: 120px;
		max-height: 120px;
	}
	.row1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Reference chat rows: a REGULAR member's row is left-aligned with the ⠇ menu
	   on the LEFT (like alerts). An admin/super-admin row (`.msg-box-adm`) puts the
	   menu on the RIGHT and tints the row grey. The body stays left-aligned in both. */

	.msg-menu {
		position: relative;
		flex-shrink: 0;
		/* Regular rows: menu first → left edge (default flex order). */
	}
	/* Admin/super-admin rows: order:1 pushes the menu past the right-floated
	   timestamp to the far right edge. */
	.msg-box.elevated .msg-menu {
		order: 1;
	}
	.menu-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		/* Reference .msgMenu: the "⠇" glyph at 20px / weight 600 in the username
		   colour (light-theme --username-color resolves to #000), flat (no radius);
		   hover #8c8686 (--light-brown) at weight 900. */
		color: #000;
		font-weight: 600;
		cursor: pointer;
		padding: 0.1rem;
		border-radius: 0;
	}
	.menu-trigger .ellipsis {
		font-size: 20px;
		line-height: 1;
	}
	.menu-trigger:hover {
		font-weight: 900;
		color: #8c8686;
	}
	.menu {
		position: absolute;
		top: 100%;
		/* Regular rows: the kebab is on the left, so the dropdown opens from the
		   left edge. Admin/super-admin rows flip it (see .elevated .menu below). */
		left: 0;
		right: auto;
		z-index: 5;
		min-width: 9rem;
		margin-top: 0.2rem;
		background: #ffffff;
		border: 1px solid #e3e5ec;
		border-radius: 8px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
		padding: 0.25rem;
		display: flex;
		flex-direction: column;
	}
	/* Admin/super-admin rows: kebab is on the right, so the dropdown opens from
	   the right edge instead. */
	.msg-box.elevated .menu {
		right: 0;
		left: auto;
	}
	.menu button {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		background: transparent;
		border: none;
		color: #2b3140;
		font-size: 0.82rem;
		text-align: left;
		padding: 0.4rem 0.55rem;
		border-radius: 6px;
		cursor: pointer;
	}
	.menu button:hover {
		background: #f0f4fb;
	}
	.menu button.danger {
		color: var(--negative, #bb352a);
	}

	.avatar,
	.avatar-img {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		/* Square avatars — reference gravatars are square (Bootstrap "Darkly",
		   --rosterImg-border-radius: 0); object-fit crops the image to the box. */
		border-radius: 0;
		object-fit: cover;
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
	}
	.avatar-img {
		border-radius: 0;
		object-fit: cover;
	}

	.username {
		font-size: 14px;
		font-weight: 900;
		/* Reference chat .username computed colour is --lightTheme-username-color =
		   #0a6db1 (room link-blue), per the presenter-deep matchedRule — NOT #000.
		   A per-user author_color still wins via the inline style; cursor:pointer
		   matches the reference (the name opens user info). */
		color: var(--username-color);
		cursor: pointer;
		/* Reference .username (mx-1) has 4px horizontal margin. */
		margin: 0 4px;
	}

	.created-at {
		margin-left: auto;
		font-weight: 600;
		font-size: 12px;
		/* Reference chat .created-at: 12px / 600, upright, colour --date-color
		   (light theme) = #8394a9. */
		font-style: normal;
		color: #8394a9;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.body {
		/* Body lines up under the USERNAME (the content column past the avatar), like
		   the alert rows — not flush-left under the avatar. A regular member row has
		   the kebab on the LEFT (kebab + avatar + gaps push the username to ~86px), so
		   the body indents ~72px. Admin/super-admin rows move the kebab to the RIGHT,
		   so only the avatar pushes the username (~62px) → smaller indent (see
		   .elevated below). */
		margin: 0.35rem 0 0 72px;
		/* Reference chat body (div.msg-left) computed colour --lightTheme-msg-color =
		   #676767 (per the presenter-deep computed style) — NOT #1a1a1a; 13px /
		   line-height 1.5 (19.5px). */
		color: #676767;
		line-height: 1.5;
		word-break: break-word;
		white-space: pre-wrap;
		font-size: var(--msg-font-size);
	}
	/* Admin/super-admin rows: kebab is on the right, so only the avatar offsets the
	   username — the body lines up under it at a smaller indent. */
	.msg-box.elevated .body {
		margin-left: 48px;
	}
	form {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		/* Reference textSendDiv sits on the white chat surface with a 5px margin;
		   no separate gray bar (the #textAreaHolder bg is #fff) and NO top divider —
		   the prior `border-top: 1px #e3e5ec` contradicted this comment and the
		   reference (reference-divergences.md:343-381: white holder, no bar). */
		padding: 5px;
		background: #ffffff;
		flex-shrink: 0;
	}
	.pill {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		flex: 1;
		min-width: 0;
		/* Reference #textAreaHolder.textSendDiv: white, BORDERLESS, 8px radius
		   (not a 999px pill with a gray border) — presenter-deep chatHolder. */
		background: #ffffff;
		border: none;
		border-radius: 8px;
		padding: 0.15rem 0.5rem;
	}
	/* Reference div.px-0.flex-fill: the textarea grows to fill, no h-padding. */
	.txt-wrap {
		flex: 1;
		min-width: 0;
		padding: 0;
	}
	.pill textarea {
		width: 100%;
		box-sizing: border-box;
		/* Resting border is transparent (not `none`) so the :focus border below
		   doesn't shift layout. */
		border: 1px solid transparent;
		outline: none;
		background: transparent;
		/* Reference .txt-area.form-control.border-0: --lightTheme-textarea-color
		   #676767, 14px / weight 400 / line-height 21px, min-height 35, max-height
		   300, padding 6px 5px (presenter-deep chatTextarea computed). */
		color: #676767;
		font-size: 14px;
		font-weight: 400;
		padding: 6px 5px;
		resize: none;
		overflow-y: auto;
		min-height: 35px;
		max-height: 300px;
		line-height: 21px;
		font-family: inherit;
	}
	/* Reference .txt-area:focus: 1px border + 1px box-shadow. Reuses the existing
	   --border theme token (keeps our color, introduces no new literal). */
	.pill textarea:focus {
		border: 1px solid var(--border);
		box-shadow: 1px 1px 1px var(--border);
	}
	/* Reference div.textAreaBtnsCol: a centered row of the emoji/image/GIF buttons. */
	.textAreaBtnsCol {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 0;
		margin: 0;
		gap: 0.2rem;
		flex-shrink: 0;
	}
	/* Reference span.textAreaBtns: icon-only button, --textarea-holder-btns-color
	   #676767, hover --textarea-holder-btns-hover-color #0a6db1. */
	.textAreaBtns {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #676767;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.textAreaBtns:hover:not(:disabled) {
		color: #0a6db1;
	}
	.textAreaBtns:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.textAreaBtns.gif {
		/* Reference GIF button: 12px text. */
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.02em;
	}
	/* Emoji picker popover — opens above the button (the composer sits at the
	   bottom of the panel), mirroring ReactionBar's native-glyph grid. */
	.emoji-wrap {
		position: relative;
		display: inline-flex;
	}
	.emoji-pop {
		position: absolute;
		bottom: calc(100% + 0.3rem);
		right: 0;
		z-index: 20;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.1rem;
		width: max-content;
		max-width: 14rem;
		background: #ffffff;
		border: 1px solid #e3e5ec;
		border-radius: 10px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
		padding: 0.3rem;
	}
	.emoji-cell {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 6px;
		width: 1.7rem;
		height: 1.7rem;
		font-size: 1.05rem;
		line-height: 1;
		cursor: pointer;
	}
	.emoji-cell:hover {
		background: #f0f4fb;
	}
	.readonly {
		margin: 0;
		padding: 0.6rem;
		border-top: 1px solid #e3e5ec;
		background: #f7f8fa;
		color: #8a909c;
		font-size: 0.8rem;
		text-align: center;
	}
</style>
