<script lang="ts">
	import type {
		Message,
		ChatChannel,
		PresentUser,
		ReactionTally,
		ReactionTarget
	} from '$lib/types';
	import { formatStamp, dayKey, formatDayLabel } from '$lib/message';
	import MessageBody from './MessageBody.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import UserInfoModal from './modals/UserInfoModal.svelte';
	import AdvancedSearchModal from './modals/AdvancedSearchModal.svelte';
	import SettingsModal from './modals/SettingsModal.svelte';
	import Icon from './Icon.svelte';

	export type ChatItem = Message & {
		author_name?: string;
		image_url?: string;
		/** Per-message username colour; wins over the theme token when set. */
		author_color?: string;
	};

	interface Props {
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

	// Trader options for the Advanced Search multi-select = the present roster.
	const traderOptions = $derived(present.map((p) => ({ value: p.user_id, label: p.display_name })));

	// Which row's ⠿ menu is open (message id), or null when none.
	let openMenuId = $state<string | null>(null);

	// User-info modal target (a row's author), or null when closed.
	let infoUser = $state<{ display_name?: string; user_id?: string; online?: boolean } | null>(null);

	// Header affordances (were dead): advanced-search modal + the settings gear.
	let searchOpen = $state(false);
	let settingsOpen = $state(false);

	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	// Auto-grow the composer up to a few lines, matching the reference textarea.
	function autogrow() {
		const el = textareaEl;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	}

	async function send() {
		const text = body.trim();
		if (!text) return;
		sending = true;
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

	<ul class="messages">
		{#each messages as m, i (m.id)}
			{@const prev = messages[i - 1]}
			{@const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at)}
			{#if newDay}
				<li class="separator-row">
					<span class="separator">{formatDayLabel(m.created_at)}</span>
				</li>
			{/if}
			<li class="msg-box">
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
							<!-- Reference row menu is the DOUBLE-column dots kebab "⠿" (U+283F,
							     2 cols × 3 dots), 20px / weight 600 in the username colour —
							     not the single-column ⠇ and not a FA icon. -->
							<span class="ellipsis" aria-hidden="true">⠿</span>
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

					<span class="username" style:color={m.author_color ?? '#000'}
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
		<form onsubmit={onSubmit}>
			<div class="pill">
				<textarea
					id="chat-composer"
					name="message"
					bind:this={textareaEl}
					bind:value={body}
					rows="1"
					maxlength="2000"
					placeholder="Type your message here.."
					oninput={autogrow}
					onkeydown={onComposerKeydown}
				></textarea>
				<button type="button" class="ic" aria-label="Emoji"><Icon name="smile" size={18} /></button>
				<button type="button" class="ic" aria-label="Image"><Icon name="image" size={18} /></button>

				<button type="button" class="ic gif" aria-label="GIF">GIF</button>
			</div>
			<button type="submit" class="send" disabled={sending}>Send</button>
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
<SettingsModal open={settingsOpen} onClose={() => (settingsOpen = false)} />

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
		/* Reference chat scroll bg matches the rows (--msgs-bg light = #f1f1f1). */
		background: #f1f1f1;
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
		/* Reference chat .msg-box: bg --msgs-bg (light) = #f1f1f1, flat, with a top
		   divider --msg-border-color = #d9d9d9. */
		background: #f1f1f1;
		border-top: 1px solid #d9d9d9;
		font-size: var(--msg-font-size);
	}
	.row1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Reference chat rows are ALL left-aligned with the menu on the left
	   (`.msg-left` + `.msgMenu.dropright`) — verified across 250+ rows in 6
	   snapshots; `.msg-right`/`.presenter-msg-right` exist in CSS but are never
	   applied. So chat does NOT bubble — every message renders left, like alerts. */

	.msg-menu {
		position: relative;
		flex-shrink: 0;
		/* Reference CHAT row: the ⠿ menu sits on the RIGHT of the row (the message
		   body still renders left-aligned). order:1 pushes it past the
		   right-floated timestamp to the far right edge. (Alerts keep it on the left.) */
		order: 1;
	}
	.menu-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		/* Reference .msgMenu: the "⠿" glyph at 20px / weight 600 in the username
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
		/* Menu is on the right of the chat row, so the dropdown opens from the right edge. */
		right: 0;
		left: auto;
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
		/* Reference chat .username colour is the light-theme --username-color = #000
		   (a per-user author_color still wins via the inline style); cursor:pointer
		   matches the reference (the name opens user info). */
		color: #000;
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
		margin: 0.35rem 0 0 8px;
		/* Reference chat body (.msg-left/.msg-right) colour --msg-color (light) =
		   #1a1a1a; 13px with line-height 1.5 (19.5px). */
		color: #1a1a1a;
		line-height: 1.5;
		word-break: break-word;
		white-space: pre-wrap;
		font-size: var(--msg-font-size);
	}
	form {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.6rem 0.65rem;
		border-top: 1px solid #e3e5ec;
		background: #f7f8fa;
		flex-shrink: 0;
	}
	.pill {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		flex: 1;
		min-width: 0;
		background: #ffffff;
		border: 1px solid #d3d7e0;
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
	}
	.pill textarea {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		/* Reference --lightTheme-textarea-color. */
		color: #676767;
		font-size: 0.85rem;
		padding: 0.35rem 0.25rem;
		resize: none;
		overflow-y: auto;
		max-height: 120px;
		line-height: 1.4;
		font-family: inherit;
	}
	.ic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		/* Reference --textarea-holder-btns-color. */
		color: #676767;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.ic:hover {
		/* Reference --textarea-holder-btns-hover-color. */
		color: #0a6db1;
	}
	.gif {
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.02em;
	}
	.send {
		background: #0a6db1;
		color: #fff;
		border: none;
		border-radius: 999px;
		padding: 0.45rem 0.9rem;
		font-weight: 600;
		font-size: 0.82rem;
		cursor: pointer;
		flex-shrink: 0;
	}
	.send:hover {
		background: #095a93;
	}
	.send:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
