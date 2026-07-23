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
	import Badges from './Badges.svelte';
	import { mentionBus } from '$lib/stores/mention.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import UserInfoModal from './modals/UserInfoModal.svelte';
	import AdvancedSearchModal from './modals/AdvancedSearchModal.svelte';
	import SettingsModal from './modals/SettingsModal.svelte';
	import EditProfileModal from './modals/EditProfileModal.svelte';
	import Icon from './Icon.svelte';
	import { API_URL } from '$lib/config';
	import { showToast } from '$lib/stores/toast.svelte';
	import { openLightbox } from '$lib/stores/lightbox.svelte';
	import { giphyEnabled, searchGifs, type Gif } from '$lib/giphy';
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
		/** Per-channel unread counts for the tab badges (reference "Off Topic (3)"). */
		unread?: Record<ChatChannel, number>;
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
		unread,
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
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- bare read registers the $effect dependency on the filtered list
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
	// The gear's anchored dropdown (reference dropdown-toggle, report.md:1402).
	let gearOpen = $state(false);

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

	// External mention requests (roster ⋮ menu / User Info modal, which live in a
	// different subtree) splice "@name " into the composer via the shared bus — the
	// same effect as the in-chat Mention item, without prop-drilling.
	$effect(() => {
		const name = mentionBus.pending;
		if (!name) return;
		mentionBus.take();
		body = body ? `${body} @${name} ` : `@${name} `;
	});

	// ─── Composer affordances (reference: Add Emojis / Upload an Image / GIF) ──────
	let fileInputEl = $state<HTMLInputElement | null>(null);
	let emojiOpen = $state(false);
	let uploading = $state(false);

	// Curated native-Unicode set — the reference uses OS color-emoji glyphs (no
	// emoji-mart/twemoji dependency), same approach as ReactionBar.svelte.
	// prettier-ignore
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

	// ─── GIF picker (reference "Search for GIFs", GIPHY-backed — report.md:1517) ──
	const gifReady = giphyEnabled();
	let gifOpen = $state(false);
	let gifQuery = $state('');
	let gifs = $state<Gif[]>([]);
	let gifBusy = $state(false);

	async function loadGifs() {
		gifBusy = true;
		try {
			gifs = await searchGifs(gifQuery);
		} catch {
			showToast('GIF search failed', 'Could not reach GIPHY. Please try again.', 5000);
		} finally {
			gifBusy = false;
		}
	}

	function toggleGifs() {
		gifOpen = !gifOpen;
		if (gifOpen && gifs.length === 0) void loadGifs();
	}

	function pickGif(g: Gif) {
		insertAtCaret(g.url);
		gifOpen = false;
	}

	const dismissGifs: Attachment<HTMLElement> = (node) => {
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') gifOpen = false;
		}
		function onPointerdown(e: PointerEvent) {
			if (e.target instanceof Node && !node.contains(e.target)) gifOpen = false;
		}
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('pointerdown', onPointerdown, true);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('pointerdown', onPointerdown, true);
		};
	};
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			openMenuId = null;
			gearOpen = false;
		}
	}}
/>

<section class="panel">
	<header>
		<div class="lead"><Icon name="comment" size={16} /></div>
		<div class="tabs" role="tablist" aria-label="Chat channels">
			<button
				type="button"
				role="tab"
				aria-selected={channel === 'main'}
				class:active={channel === 'main'}
				onclick={() => onChannel('main')}
				>Main Chat{#if (unread?.main ?? 0) > 0}<span class="unread">{unread?.main}</span
					>{/if}</button
			>
			<button
				type="button"
				role="tab"
				aria-selected={channel === 'off_topic'}
				class:active={channel === 'off_topic'}
				onclick={() => onChannel('off_topic')}
				>Off Topic{#if (unread?.off_topic ?? 0) > 0}<span class="unread">{unread?.off_topic}</span
					>{/if}</button
			>
		</div>
		<div class="actions">
			<button
				type="button"
				aria-label="Search chat"
				title="Search"
				onclick={() => (searchOpen = true)}><Icon name="search" size={16} /></button
			>
			<!-- Reference chat gear is a Bootstrap dropdown-toggle (a.nav-link
			     .dropdown-toggle, title="Settings", aria-haspopup=true —
			     report.md:1402,1509), not a direct dialog trigger. Its menu contents
			     were never captured; the items route to our existing settings surfaces. -->
			<div class="gear-menu">
				<button
					type="button"
					class="gear"
					aria-label="Chat settings"
					title="Settings"
					aria-haspopup="menu"
					aria-expanded={gearOpen}
					onclick={() => (gearOpen = !gearOpen)}
				>
					<Icon name="cog" size={16} /><Icon name="caret-down" size={10} />
				</button>
				{#if gearOpen}
					<div class="menu gear-dropdown" role="menu">
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								gearOpen = false;
								settingsOpen = true;
							}}
						>
							<Icon name="cog" size={14} /> Settings
						</button>
						<button
							type="button"
							role="menuitem"
							onclick={() => {
								gearOpen = false;
								editProfileOpen = true;
							}}
						>
							<Icon name="user" size={14} /> Edit Profile
						</button>
					</div>
				{/if}
			</div>
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
					<!-- Reference date label is a centered clickable anchor
					     (report.md:1357,1360); target uncaptured → inert button. -->
					<button type="button" class="separator">{formatDayLabel(m.created_at)}</button>
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
									<Icon name="reply" size={14} /> Mention / Reply
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

					<!-- Avatar is ALWAYS the author's identity — an image message keeps its
					     35px avatar and renders the image in the BODY instead
					     (report.md:1314; the image-as-avatar swap was a divergence). -->
					<span class="avatar" aria-hidden="true">{initials(m.author_name)}</span>

					<span
						class="username"
						style:color={m.author_color ?? 'var(--username-color)'}
						role="button"
						tabindex="0"
						onclick={() => openUserInfo(m)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								openUserInfo(m);
							}
						}}>{m.author_name ?? 'trader'}</span
					>
					<Badges data={m.author_badges} />

					<time class="created-at">{formatStamp(m.created_at)}</time>
				</div>

				<p class="body">
					<MessageBody text={m.body} />
					{#if m.image_url}
						{@const img = m.image_url}
						<button
							type="button"
							class="img-open"
							onclick={() => openLightbox(img)}
							aria-label="Expand image"
						>
							<img class="body-img" src={img} alt="" />
						</button>
					{/if}
				</p>

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
						onkeydown={onComposerKeydown}></textarea>
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
							<Icon name="smile" family="regular" size={16} />
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
						<Icon name="image" size={16} />
					</button>
					<input
						bind:this={fileInputEl}
						type="file"
						accept="image/*"
						hidden
						onchange={onPickImage}
					/>

					<!-- Search for GIFs (12px "GIF" text control, GIPHY-backed —
					     report.md:1517,3188). Enabled once PUBLIC_GIPHY_KEY is set. -->
					<div class="gif-wrap">
						<button
							type="button"
							class="textAreaBtns gif"
							aria-label="Search for GIFs"
							title={gifReady ? 'Search for GIFs' : 'GIF search needs a GIPHY API key'}
							aria-haspopup="menu"
							aria-expanded={gifOpen}
							disabled={!gifReady}
							onclick={toggleGifs}>GIF</button
						>
						{#if gifOpen}
							<div class="gif-pop" role="menu" aria-label="GIF search" {@attach dismissGifs}>
								<input
									id="gif-search"
									name="gif-search"
									type="search"
									placeholder="Search GIPHY…"
									bind:value={gifQuery}
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											void loadGifs();
										}
									}}
								/>
								<div class="gif-grid">
									{#if gifBusy}
										<p class="gif-note">Searching…</p>
									{:else}
										{#each gifs as g (g.id)}
											<button
												type="button"
												class="gif-cell"
												aria-label="Send {g.title}"
												onclick={() => pickGif(g)}
											>
												<img src={g.preview} alt={g.title} width={g.width} height={g.height} />
											</button>
										{:else}
											<p class="gif-note">No GIFs found.</p>
										{/each}
									{/if}
								</div>
							</div>
						{/if}
					</div>
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
		background: var(--content-bg);
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
		background: var(--content-header-bg);
		color: var(--content-header-color);
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
		border-bottom: 1px solid var(--accent);
	}
	.tabs button {
		background: transparent;
		/* Reference chat tabs (a.nav-link): a 1px border box kept transparent until
		   active (so active/inactive share the same box size), 12px, weight 700 for
		   BOTH active and inactive, white, top-only 6px radius, padding 8px 5px 5px. */
		border: 1px solid transparent;
		color: #ffffff;
		font-size: 12px;
		font-weight: 700;
		padding: 8px 5px 5px;
		/* Captured tab rects sit 6px apart (report.md:1398-1399). */
		margin-right: 6px;
		border-radius: 6px 6px 0 0;
		cursor: pointer;
	}
	.tabs button.active {
		/* Measured active chat tab: color #fff on bg rgb(69,162,255) #45a2ff
		   (--tab-active-bg, report.md:1412). */
		background: var(--tab-active-bg, #45a2ff);
		border-color: transparent;
		color: #ffffff;
	}
	.tabs button:hover:not(.active) {
		color: #ffffff;
	}
	/* Per-channel unread count (reference "Off Topic (3)") — a small pill on the
	   inactive tab, cleared when you switch to that channel. */
	.unread {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.1em;
		margin-left: 5px;
		padding: 0 4px;
		border-radius: 999px;
		background: var(--negative);
		color: #ffffff;
		font-size: 10px;
		font-weight: 700;
		line-height: 1.4;
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
	.gear-menu {
		position: relative;
		display: inline-flex;
	}
	.menu.gear-dropdown {
		top: 100%;
		left: auto;
		right: 0;
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
		background: var(--content-bg);
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
		/* Reference .separator is a flat, full-width gray bar (#e8e8e8) with a
		   centered clickable date (#373c42). Button chrome zeroed. */
		display: block;
		width: 100%;
		text-align: center;
		background: var(--content-separator-bg);
		color: #373c42;
		/* Reference date ANCHOR renders at 13px inside the #e8e8e8 band
		   (audit vs file2/ultra-member). */
		font-size: 13px;
		font-weight: 300;
		padding: 0;
		line-height: 24px;
		border: none;
		border-radius: 0;
		white-space: nowrap;
		cursor: pointer;
	}

	.msg-box {
		position: relative;
		/* Captured admin chat row computes padding 2px 0 4px — zero side padding
		   (report.md:1426). */
		padding: 2px 0 4px;
		/* Reference chat .msg-box: bg #fff, flat, top divider #e1e1e1. */
		background: var(--content-bg);
		border-top: 1px solid var(--content-border);
		/* Measured shared row-template base (pixel-diff): #ccc / 16px / 100 / 24px;
		   every visible child overrides. */
		color: #cccccc;
		font-size: 16px;
		font-weight: 100;
		line-height: 24px;
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

	/* Reference chat rows: EVERY row is left-aligned with the ⠇ menu on the LEFT
	   (the reference does not flip the kebab by role). An admin/super-admin row
	   (`.msg-box-adm`) only differs by a grey row tint; the menu stays on the left. */

	.msg-menu {
		position: relative;
		flex-shrink: 0;
		/* The kebab is the first child → left edge for ALL rows. The reference does
		   NOT flip the kebab by role; admin/super-admin rows keep it on the left too
		   (only the row tint differs). */
	}
	.menu-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		/* Measured a.msgMenu: 20px / 30px line, padding 4px 0 0 5px, base
		   #0a6db1 !important (report.md:2055); hover #8c8686 at weight 900. */
		color: var(--username-color, #0a6db1);
		font-size: 20px;
		line-height: 30px;
		font-weight: 600;
		cursor: pointer;
		padding: 4px 0 0 5px;
		border-radius: 0;
	}
	.menu-trigger .ellipsis {
		font-size: 20px;
		line-height: 1;
	}
	.menu-trigger:hover {
		font-weight: 900;
		color: var(--kebab-color);
	}
	.menu {
		position: absolute;
		top: 100%;
		/* The kebab is on the left for every row, so the dropdown opens from the
		   left edge (no role-based flip). */
		left: 0;
		right: auto;
		/* Reference .dropdown-menu base: min-width 10rem (160px), z-index 1000,
		   shadowless — the only painting shadow in the app is the modal's
		   (report.md:1785-1792,3009). */
		z-index: 1000;
		min-width: 10rem;
		margin-top: 0.2rem;
		/* Reference kebab menu (dropdown7.json): dark navy #0e3651 panel, no
		   border, padding 8px 0, no shadow. */
		background: #0e3651;
		border: none;
		border-radius: 8px;
		padding: 8px 0;
		display: flex;
		flex-direction: column;
	}
	.menu button {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		background: transparent;
		border: none;
		/* Reference dropdown-item: accent blue #45a2ff, 16px, padding 4px 16px.
		   Measured item height is 32px; enforce it with min-height so the ~27px
		   default (icon + 4px padding) matches the reference. */
		color: var(--accent, #45a2ff);
		font-size: 16px;
		text-align: left;
		padding: 4px 16px;
		min-height: 32px;
		border-radius: 0;
		cursor: pointer;
	}
	.menu button:hover {
		/* Reference .dropdown-item:hover: #375a7f bg, white text. */
		background: #375a7f;
		color: #ffffff;
	}
	.menu button.danger {
		color: var(--negative, #bb352a);
	}

	.avatar {
		/* Captured message avatar: 35x35, square (radius 0), object-fit cover
		   (report.md:1314 — the shared app-st-message row template). */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 35px;
		height: 35px;
		flex-shrink: 0;
		border-radius: 0;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.username {
		font-size: 14px;
		font-weight: 900;
		/* Measured `font: 900 14px/21px` (report.md:1337; pixel-diff). */
		line-height: 21px;
		/* Reference chat .username computed colour is --lightTheme-username-color =
		   var(--accent) (room link-blue), per the presenter-deep matchedRule — NOT #000.
		   A per-user author_color still wins via the inline style; cursor:pointer
		   matches the reference (the name opens user info). */
		color: var(--username-color);
		cursor: pointer;
		/* Reference .username (mx-1) has 4px horizontal margin. */
		margin: 0 4px;
		/* Truncate a long name instead of letting it crowd the right-pinned
		   timestamp at narrow chat widths (the badge/timestamp collision). The
		   created-at keeps flex-shrink:0, so the name side yields first. */
		min-width: 0;
		flex-shrink: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Badges sit after the username and must not be squeezed — only the name
	   truncates. (Badges renders an inline cluster as the row's next child.) */
	.row1 :global(.badges) {
		flex-shrink: 0;
	}

	.created-at {
		margin-left: auto;
		font-weight: 600;
		font-size: 12px;
		/* Measured `600 12px/18px` (report.md:1339; pixel-diff). */
		line-height: 18px;
		/* Reference chat .created-at: 12px / 600, upright, colour --date-color
		   (light theme) = #8394a9. */
		font-style: normal;
		color: var(--content-meta);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.body {
		/* Body lines up under the USERNAME. Captured shared row template: the body
		   column's left edge sits at x=58 (report.md:1315), so the body indents
		   58px (kebab + 35px avatar + gaps). */
		margin: 0 8px 0 58px;
		/* Reference chat body (div.msg-left): #676767, 13px / line-height 1.5. */
		color: var(--content-text);
		line-height: 1.5;
		word-break: break-word;
		white-space: pre-wrap;
		font-size: var(--msg-font-size);
	}
	.img-open {
		display: block;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
	}
	.body-img {
		display: block;
		/* Captured inline-image constraints: max-width 300, max-height 200,
		   click → lightbox (report.md:1342,1738). */
		max-width: 300px;
		max-height: 200px;
		margin-top: 0.35rem;
		border-radius: 6px;
		object-fit: cover;
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
		background: var(--content-bg);
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
		background: var(--content-bg);
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
		color: var(--content-text);
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
	   #676767, hover --textarea-holder-btns-hover-color var(--accent). */
	.textAreaBtns {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--content-text);
		cursor: pointer;
		/* Captured composer buttons compute padding 5px (report.md:1473). */
		padding: 5px;
		border-radius: 6px;
	}
	.textAreaBtns:hover:not(:disabled) {
		color: var(--accent);
	}
	.textAreaBtns:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.textAreaBtns.gif {
		/* Captured GIF label: 300 12px/18px, #676767 (report.md:1470). */
		font-size: 12px;
		font-weight: 300;
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
		background: var(--content-bg);
		border: 1px solid #e3e5ec;
		border-radius: 10px;
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
	/* GIF search popover — mirrors the emoji popover chrome. */
	.gif-wrap {
		position: relative;
		display: inline-flex;
	}
	.gif-pop {
		position: absolute;
		bottom: calc(100% + 0.3rem);
		right: 0;
		z-index: 20;
		width: 18rem;
		background: var(--content-bg);
		border: 1px solid #e3e5ec;
		border-radius: 10px;
		padding: 0.4rem;
	}
	.gif-pop input {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #e3e5ec;
		border-radius: 6px;
		padding: 0.3rem 0.5rem;
		font-size: 12px;
		color: var(--content-text);
		background: var(--content-bg);
		margin-bottom: 0.35rem;
	}
	.gif-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.25rem;
		max-height: 14rem;
		overflow-y: auto;
	}
	.gif-cell {
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		border-radius: 6px;
		overflow: hidden;
	}
	.gif-cell img {
		display: block;
		width: 100%;
		height: auto;
	}
	.gif-note {
		grid-column: 1 / -1;
		margin: 0.4rem 0;
		text-align: center;
		color: #8a909c;
		font-size: 12px;
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
