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
	import { dnd } from '$lib/stores/dnd.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { shouldThrottle } from '$lib/stores/visibility.svelte';
	import MessageBody from './MessageBody.svelte';
	import Badges from './Badges.svelte';
	import { mentionBus } from '$lib/stores/mention.svelte';
	import ReactionBar from './ReactionBar.svelte';
	import UserInfoModal from './modals/UserInfoModal.svelte';
	import ReplyModal from './modals/ReplyModal.svelte';
	import { openPrivateChat, sendPrivate } from '$lib/privateChat.svelte';
	import AdvancedSearchModal from './modals/AdvancedSearchModal.svelte';
	import SettingsModal from './modals/SettingsModal.svelte';
	import EditProfileModal from './modals/EditProfileModal.svelte';
	import Icon from './Icon.svelte';
	import EmojiMart from './EmojiMart.svelte';
	import { fixedPopoverStyle } from '$lib/popoverPosition';
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
		// P1-1 per-author custom colours (from users.msg_bg_color / msg_text_color).
		// `author_bg_color` / `author_text_color` are inherited from Message.
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
		/** Presenter — gates presenter-only composer extras (Play YouTube For All)
		    and the toolbar's presenter-only Archive control, per the decoded DOM
		    (chat-composer.md i0e `isPresenter`; chat-panel.md W1e Archive presenter-only). */
		isPresenter?: boolean;
		/** Optional: open the room's Play-YouTube surface. When present AND the
		    viewer is a presenter, the composer options add the reference's
		    fa-video "Play YouTube For All" button (chat-composer.md 2b i0e). Absent
		    → the button is an honest gap (no local plumbing to fake it). */
		onPlayYouTube?: () => void;
		/** P1-2: names of users currently typing (self already excluded upstream) —
		    drives the typing indicator above the composer. */
		typingNames?: string[];
		/** P1-2: called (throttled here to ≥2s) when the user types in the composer,
		    so the parent can fan out a typing frame over the room socket. */
		onTyping?: () => void;
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
		onDelete,
		isPresenter = false,
		onPlayYouTube,
		typingNames = [],
		onTyping
	}: Props = $props();

	// P1-2: throttle typing frames to ≥2s apart (client-side), per the wire
	// contract. A plain (non-reactive) timestamp — it never drives the UI.
	let lastTypingSent = 0;
	function notifyTyping() {
		if (!onTyping) return;
		const now = Date.now();
		if (now - lastTypingSent < 2000) return;
		lastTypingSent = now;
		onTyping();
	}

	// P1-2: the emphasized name shown in the indicator (first typer). The template
	// renders `<em>Name</em> is typing`; extra typers add a "+N" count prefix
	// (`.users-count`). Empty typingNames → the container is hidden entirely.
	const typingLeadName = $derived(typingNames[0] ?? '');
	const typingExtra = $derived(Math.max(0, typingNames.length - 1));

	let body = $state('');
	let sending = $state(false);

	// HARD EVIDENCE (color-system.md:108-110/282-283 + proroom-NUCLEAR-member.md:359):
	// the body ngClass map toggles `.mentionColor` when the message mentions the current
	// viewer (`isMention`) and `.questionColor{#2095f2}` (rendered-confirmed, ×11) when
	// the body contains "?" — BOTH gated on `!hasCustomFollowedUserColors`, i.e. only
	// when NO per-author inline colour is present (inline `author_text_color` WINS). The
	// viewer's display name is the mention target (@name). (The .mentionColor #048d04
	// value itself is an honest gap — see the .body.mentionColor CSS note.)
	const viewerName = $derived((auth.user?.display_name ?? '').trim().toLowerCase());
	// Match `@name` case-insensitively as a bounded token (avoids `@jane` matching
	// `@janed`); only when a viewer name is known.
	function bodyMentionsViewer(text: string): boolean {
		if (!viewerName) return false;
		const re = new RegExp(`@${viewerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`, 'i');
		return re.test(text);
	}

	// Hide chat from muted users (client-side, per-device list) — matches the
	// reference, where muting filters that user's messages locally. The toolbar's
	// "Show only Moderators messages" (#mod-only) and the search term further narrow
	// the visible rows (chat-panel.md X1e/Q1e: local `searchTermChanged` + mod-only).
	const filteredMessages = $derived(
		messages
			.filter((m) => !muted.has(m.author_id))
			.filter((m) => !modOnly || (!!m.author_role && m.author_role !== 'member'))
			.filter((m) => {
				const term = chatSearchTerm.trim().toLowerCase();
				if (!term) return true;
				return (
					m.body.toLowerCase().includes(term) || (m.author_name ?? '').toLowerCase().includes(term)
				);
			})
	);

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

	// Header affordances: the advanced-search modal + Settings / Edit Profile
	// surfaces (the latter kept as a SEPARATE affordance — see the toolbar note).
	let searchOpen = $state(false);
	let settingsOpen = $state(false);
	let editProfileOpen = $state(false);

	// ─── Chat toolbar (HARD EVIDENCE — chat-panel.md DOM/Behavior, X1e const 21) ──
	// The gear is NOT a Bootstrap dropdown menu: `(click)=toggleChatToolbar()`
	// toggles the inline `.chatToolbar` PANEL below the header (search form + the
	// extended Save/Archive + "Show only Moderators messages" checkbox). The search
	// icon calls `toggleChatToolbarSearchOnly()` — it opens the SAME panel showing
	// only the search row (and focuses it).
	// (chat-panel.md:38-41,49-67,375-376: template @ off 1451362.)
	let toolbarOpen = $state(false);
	// When true the extended controls (Save / Archive / mod-only) are collapsed and
	// only the search row shows — the `showChatToolbarExtended=false` state.
	let toolbarSearchOnly = $state(false);
	let chatSearchInputEl = $state<HTMLInputElement | null>(null);
	// `[(ngModel)]=chatSearchTerm` (const 35). Local search term (frontend-honest:
	// filters the currently-visible rows, since server chat-log search is a separate
	// backend surface — chat-panel.md Behavior `searchTermChanged`/`onEnterSearchChat`).
	let chatSearchTerm = $state('');
	// `#mod-only[type=checkbox]` "Show only Moderators messages" (const 43/44/45).
	// A viewer-facing filter: show only staff/presenter-authored rows.
	let modOnly = $state(false);

	// gear → toggle the full toolbar (extended controls visible).
	function toggleChatToolbar() {
		if (toolbarOpen && !toolbarSearchOnly) {
			toolbarOpen = false;
		} else {
			toolbarOpen = true;
			toolbarSearchOnly = false;
		}
		if (toolbarOpen) focusSearchSoon();
	}
	// search icon → toggle the toolbar in search-only mode (focus the input).
	function toggleChatToolbarSearchOnly() {
		if (toolbarOpen && toolbarSearchOnly) {
			toolbarOpen = false;
		} else {
			toolbarOpen = true;
			toolbarSearchOnly = true;
		}
		if (toolbarOpen) focusSearchSoon();
	}
	function focusSearchSoon() {
		void tick().then(() => chatSearchInputEl?.focus());
	}
	// Clear button (span#addon-chat-clear, const 36/37): empties the term + refocus.
	function clearChatSearch() {
		chatSearchTerm = '';
		chatSearchInputEl?.focus();
	}
	// Save (span#addon-chat-save, const 38/39): reference `downloadLog('chat')`.
	// Frontend-honest: export the currently-visible rows as a plain-text log.
	function downloadChatLog() {
		const lines = visibleMessages.map(
			(m) => `[${formatStamp(m.created_at)}] ${m.author_name ?? 'trader'}: ${m.body}`
		);
		const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
		const href = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = href;
		a.download = `chat-${channel}.txt`;
		a.click();
		URL.revokeObjectURL(href);
	}
	// Archive (div#addon-chat-archive, const 40/41 → W1e, PRESENTER ONLY):
	// `archiveOptions()`. No local archive endpoint is wired into this file, so this
	// is an honest disabled affordance for presenters (backend-dependent) rather
	// than a fake action.

	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	// Auto-grow the composer; cap at 300px to match the reference textarea's
	// computed max-height (reference-divergences.md:351-357) and our own
	// `#textAreaHolder textarea { max-height: 300px }`. The prior 120px clamp silently
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
		reactFor = null;
	}

	// "Reply" kebab item (reference dropdown-item → #replyModal): a PRIVATE reply
	// quoting the message. Sending opens the 1:1 thread and posts through the real
	// PM API (POST /api/rooms/{id}/pm via privateChat.sendPrivate).
	let replyTarget = $state<ChatItem | null>(null);
	async function sendReply(text: string) {
		const t = replyTarget;
		replyTarget = null;
		if (!t) return;
		try {
			await openPrivateChat({ user_id: t.author_id, display_name: t.author_name });
			await sendPrivate(text);
		} catch {
			showToast('Reply failed', 'Could not send the private reply.', 5000);
		}
	}

	// "Add Reaction" kebab item (reference dropdown-item with the far fa-smile icon
	// and a reaction popover): an inline emoji row inside the menu; picking one
	// toggles the reaction through the same onReact path as the ReactionBar.
	let reactFor = $state<string | null>(null);
	// Same curated set as ReactionBar's PICKER_EMOJI (first row) — one shared source
	// of truth would export it, but component <script> can't export consts.
	const REACT_EMOJI = ['👍', '👎', '🔥', '🚀', '😂', '❤️', '💯', '👀'] as const;

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

	// ─── Composer affordances ──────────────────────────────────────────────────────
	let fileInputEl = $state<HTMLInputElement | null>(null);
	let emojiOpen = $state(false);
	let emojiBtnEl = $state<HTMLElement | null>(null);
	let emojiPopStyle = $state('');
	let uploading = $state(false);

	// HARD EVIDENCE (bundle @1428993 + template c0e/consts @1447220): the field
	// starts FALSE (`this.showMessageOptions=!1`); every "resizeChatView" bus event
	// (2s after chat/alerts log load, 1s after changeChatMode, split-drag end,
	// window resize) recomputes it as `chatWidth.offsetWidth >= 400`, where
	// #chatWidth is the `.flex-fill.d-flex.mx-0` ROW (`d(1,"div",62,3)`);
	// `toggleMessageOptions()` sets it TRUE one-way (bundle: `{this.
	// showMessageOptions=!0}`) — the + expands the buttons INLINE in the column
	// (NOT a popover), and it stays expanded until the next resize recompute.
	//
	// We must NOT measure the row itself reactively: expanding swaps the 26px +
	// for the wider button set, shrinking the row, re-firing the measurement and
	// instantly re-collapsing (a feedback loop the reference avoids by sampling
	// only on resizeChatView events). The HOLDER's width is independent of the
	// branch, so we measure it and subtract the collapsed chrome to recover the
	// row width: holder = row + 2×5px padding + 26px (+ button = 16px icon +
	// 2×5px padding, member capture) ⇒ row ≥ 400 ⇔ holder ≥ 436.
	let holderWidth = $state(0);
	let showMessageOptions = $state(false);
	// Manual expand must survive the width shift its own branch-flip causes
	// (expanding swaps the 26px + for the wider inline set, which can push the
	// holder at narrow panes; the observer fires and would instantly collapse
	// it again — a loop the reference avoids by sampling only on discrete
	// resizeChatView events). Suppress width-driven recompute briefly after the
	// manual toggle; real drags/resizes after that window recompute normally,
	// exactly like the reference's resizeEndChat/onResize sampling.
	let suppressRecomputeUntil = 0;
	function toggleMessageOptions() {
		suppressRecomputeUntil = performance.now() + 400;
		showMessageOptions = true;
	}
	$effect(() => {
		const w = holderWidth;
		if (performance.now() < suppressRecomputeUntil) return;
		showMessageOptions = w - 36 >= 400;
	});

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

	/** Close the emoji popover on Escape or an outside click (reference ngbPopover
	 * autoClose="outside" — clicks INSIDE the picker keep it open). */
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
			toolbarOpen = false;
		}
	}}
/>

<section class="panel">
	<header>
		<div class="lead">
			<Icon name="comment" size={16} />
			<!-- HARD EVIDENCE (chat-panel.md DOM const 11/26, j1e:25 / Resolved
			     .badge-danger #e74c3c): a red DND pill (fa-bell-slash + " DND") next to
			     the brand, shown only when the master Do-Not-Disturb switch is on. -->
			{#if dnd.app}
				<span class="dnd-badge"><Icon name="bell-slash" size={10} /> DND</span>
			{/if}
		</div>
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
			<!-- HARD EVIDENCE (chat-panel.md DOM const 15-17, Behavior:375): the search
			     icon (li.nav-item.mx-1 > a.nav-link.p-0 title="Search" > i.fa-search)
			     calls `toggleChatToolbarSearchOnly()` — it opens the SAME .chatToolbar
			     panel in search-only mode, NOT a separate modal. -->
			<button
				type="button"
				aria-label="Search chat"
				title="Search"
				aria-expanded={toolbarOpen && toolbarSearchOnly}
				class:on={toolbarOpen && toolbarSearchOnly}
				onclick={toggleChatToolbarSearchOnly}><Icon name="search" size={16} /></button
			>
			<!-- HARD EVIDENCE (chat-panel.md DOM const 18-20, NOTE:67 / Behavior:375):
			     the gear is NOT a Bootstrap dropdown menu despite the .dropdown classes;
			     `(click)=toggleChatToolbar()` toggles the inline `.chatToolbar` panel
			     (const 21) below the header. -->
			<button
				type="button"
				class="gear"
				aria-label="Chat settings"
				title="Settings"
				aria-expanded={toolbarOpen && !toolbarSearchOnly}
				class:on={toolbarOpen && !toolbarSearchOnly}
				onclick={toggleChatToolbar}
			>
				<Icon name="cog" size={16} />
			</button>
			<!-- The decoded `.chatToolbar` DOM (X1e/Q1e) does NOT contain Settings /
			     Edit Profile items (it holds search + Save/Archive + mod-only +
			     Group-Chat-Control + Detach). To avoid losing that functionality we keep
			     a SEPARATE, clearly-labelled affordance for it rather than folding it
			     into the reference toolbar where the evidence shows no such controls. -->
			<button
				type="button"
				class="gear"
				aria-label="Profile settings"
				title="Profile settings"
				onclick={() => (settingsOpen = true)}
			>
				<Icon name="user" size={16} />
			</button>
		</div>
	</header>

	<!-- HARD EVIDENCE (chat-panel.md DOM const 21 + X1e:49-66): the search/settings
	     toolbar rendered inline below the header when `showChatToolbar`. Row 1 =
	     form#chat-settings with the search input + clear button (+ Save/Archive when
	     extended); Row 2 (when extended) = the "Show only Moderators messages"
	     checkbox. `.chatToolbar` shares `--msgs-header-bg`/`--msgs-header-color` with
	     the header (scoped `.chatToolbar,.chatHeader{…}`). -->
	{#if toolbarOpen}
		<div class="chatToolbar shadow" role="region" aria-label="Chat search and settings">
			<form id="chat-settings" onsubmit={(e) => e.preventDefault()}>
				<div class="input-group">
					<input
						bind:this={chatSearchInputEl}
						name="chatSearchTermTxt"
						type="search"
						class="form-control"
						aria-label="Search"
						placeholder="Type your search term, then press Enter"
						title="Type your search term, then press Enter"
						bind:value={chatSearchTerm}
					/>
					<!-- span#addon-chat-clear (const 36/37): clears the term. -->
					<button
						type="button"
						id="addon-chat-clear"
						class="input-group-text"
						title="Clear the search"
						aria-label="Clear the search"
						onclick={clearChatSearch}
					>
						<Icon name="times" size={14} />
					</button>
					{#if !toolbarSearchOnly}
						<!-- q1e extended: Save (const 38/39, downloadLog('chat')) + Archive
						     (const 40/41 → W1e, PRESENTER ONLY, archiveOptions). -->
						<button
							type="button"
							id="addon-chat-save"
							class="input-group-text"
							title="Save chat messages"
							aria-label="Save chat messages"
							onclick={downloadChatLog}
						>
							<Icon name="save" size={14} />
						</button>
						{#if isPresenter}
							<button
								type="button"
								id="addon-chat-archive"
								class="input-group-text"
								title="Archive Chat Messages (needs the archive backend)"
								aria-label="Archive Chat Messages"
								disabled
							>
								<Icon name="trash" size={14} />
							</button>
						{/if}
					{/if}
				</div>
			</form>

			{#if !toolbarSearchOnly}
				<!-- Q1e extended row: #mod-only checkbox "Show only Moderators messages"
				     (const 43/44/45). A viewer-facing filter — shown to all viewers per
				     the decoded DOM (the checkbox itself carries no presenter gate; only
				     Archive/W1e is presenter-only). -->
				<div class="form-check mod-only-row">
					<input id="mod-only" type="checkbox" class="form-check-input" bind:checked={modOnly} />
					<label for="mod-only">Show only Moderators messages</label>
				</div>
				<!-- The reference extended toolbar's server-side search lives in a
				     separate archives surface (chat-panel.md Behavior); our
				     AdvancedSearchModal is that functional surface. Kept reachable here
				     (its former trigger, the header search icon, now opens THIS panel per
				     the decoded behavior) so no functionality is lost. -->
				<button type="button" class="advanced-search-link" onclick={() => (searchOpen = true)}>
					<Icon name="search" size={12} /> Advanced search…
				</button>
			{/if}
		</div>
	{/if}

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
			{@const staff = !!m.author_role && m.author_role !== 'member'}
			{@const hasInlineText = m.author_text_color != null}
			{@const isMention = !hasInlineText && bodyMentionsViewer(m.body)}
			{@const isQuestion = !hasInlineText && !isMention && m.body.includes('?')}
			<!-- HARD EVIDENCE (proroom-ultra-admin-room.md §4d, lines 416/448-455): the
			     `strong.username` colour is a 3-TIER, class-driven DEFAULT (no inline
			     style on any of the 40 authors) — admin/presenter #e8e8e8, bot #d7d7d7,
			     member #0a6db1 (`--nickname-color`/`--username-color`). PRECEDENCE: a
			     per-author INLINE colour (the wire `author_bg_color`→invert / `author_color`
			     path below) ALWAYS wins; the tier class is only the fallback when no inline
			     colour exists (`hasInlineUser`). Signal used: `m.author_role` (Role =
			     member|admin|super_admin — the only role signal that reaches a chat row,
			     types.ts:125). admin/super_admin → the admin/presenter tier (#e8e8e8);
			     everyone else → the member tier (the #0a6db1 default already on `.username`).
			     HONEST GAP — bot tier (#d7d7d7, LornaBot): no bot signal reaches the row
			     (Role has no 'bot'; AuthorBadges carries no bot flag — types.ts:81-86), so
			     the bot shade is not wired; a bot author currently renders in the member
			     tier until a wire bot flag exists. -->
			{@const hasInlineUser = m.author_bg_color != null || m.author_color != null}
			<!-- P1-1 derived styles (live DOM mechanics):
			     - metaColor / metaFilter: when a custom row bg is set, the kebab,
			       username, and created-at are `color: <bg>; filter: invert(1)`.
			     - usernameColor: bg inversion WINS; otherwise keep the existing
			       author_color (or the theme default) with NO filter.
			     - author_text_color drives the name-block wrapper + body colour.
			     Absent values → undefined → NO inline style (stylesheet default). -->
			{@const metaColor = m.author_bg_color ?? undefined}
			{@const metaFilter = m.author_bg_color ? 'invert(1)' : undefined}
			<!-- P1-1: inline per-author username colour (bg-invert wins over author_color).
			     When NEITHER is set we emit NO inline colour (undefined), so the class-driven
			     3-tier DEFAULT (`.username` #0a6db1 member / `.username.staff-name` #e8e8e8
			     admin) resolves via CSS — matching the reference, where the tier is a class,
			     not an inline style (proroom-ultra-admin-room.md §4d line 454-455). -->
			{@const usernameColor = m.author_bg_color ?? m.author_color ?? undefined}
			<!-- P1-1 (live DOM): a per-author custom row bg is applied INLINE on the row
			     (div.msg-box.pb-1 style="background-color: <bg>"). Absent → no inline
			     style, stylesheet default wins. -->
			<li
				class="msg-box"
				class:elevated={staff}
				class:msg-box-adm={staff}
				style:background-color={m.author_bg_color ?? undefined}
			>
				<!-- Reference row (captured DOM, proroom-all-admin.json): div.mr-1.d-flex
				     .flex-row[-reverse] holding [avatar cluster: a.msgMenu ⠇ + div.avatar.pl-1
				     > img 35x35][div.w-100 content column: header + body]. STAFF (msg-box-adm)
				     rows are flex-row-reverse → kebab+avatar on the RIGHT and the header
				     mirrored (created-at left, username right); member rows are flex-row. -->
				<div class="row-flex" class:reverse={staff}>
					<div class="side" class:reverse={staff}>
						<div class="msg-menu">
							<!-- P1-1 (live DOM): with a custom row bg, the kebab (a.msgMenu) is
							     tinted `color: <bg>; filter: invert(1)` so it reads against its
							     own inverted row. No bg → no inline style. -->
							<button
								type="button"
								class="menu-trigger"
								aria-label="Message options"
								aria-haspopup="menu"
								aria-expanded={openMenuId === m.id}
								style:color={m.author_bg_color ?? undefined}
								style:filter={m.author_bg_color ? 'invert(1)' : undefined}
								onclick={() => toggleMenu(m.id)}
							>
								<span class="ellipsis" aria-hidden="true">⠇</span>
							</button>
							{#if openMenuId === m.id}
								<!-- Reference chat kebab items (captured live DOM): User Info /
								     Mention / Reply (→ replyModal) / Add Reaction. Delete is our
								     admin-only functional extra. -->
								<div class="menu" role="menu">
									<button type="button" role="menuitem" onclick={() => openUserInfo(m)}>
										<Icon name="user" size={14} /> User Info
									</button>
									<button type="button" role="menuitem" onclick={() => mention(m)}>
										<Icon name="reply" size={14} /> Mention
									</button>
									<button
										type="button"
										role="menuitem"
										onclick={() => {
											replyTarget = m;
											openMenuId = null;
										}}
									>
										<Icon name="comment" size={14} /> Reply
									</button>
									<button
										type="button"
										role="menuitem"
										aria-expanded={reactFor === m.id}
										onclick={() => (reactFor = reactFor === m.id ? null : m.id)}
									>
										<Icon name="smile" family="regular" size={14} /> Add Reaction
									</button>
									{#if reactFor === m.id}
										<div class="react-row" role="menu" aria-label="Pick a reaction">
											{#each REACT_EMOJI as e (e)}
												<button
													type="button"
													role="menuitem"
													aria-label="React {e}"
													onclick={() => {
														onReact?.('message', m.id, e);
														reactFor = null;
														openMenuId = null;
													}}>{e}</button
												>
											{/each}
										</div>
									{/if}
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

						<!-- Reference div.avatar.pl-1 > img: 35x35, object-fit cover; initials
						     are the fallback when no gravatar is present. -->
						<span class="avatar" aria-hidden="true">
							{#if m.author_avatar}
								<img src={m.author_avatar} alt="" width="35" height="35" />
							{:else}
								{initials(m.author_name)}
							{/if}
						</span>
					</div>

					<div class="content">
						<div class="header">
							{#if staff}
								<!-- P1-1: created-at inverts from the row bg when custom. -->
								<time class="created-at" style:color={metaColor} style:filter={metaFilter}
									>{formatStamp(m.created_at)}</time
								>
							{/if}
							<!-- P1-1: name-block wrapper carries the author text colour (absent → none). -->
							<div class="name-block" style:color={m.author_text_color ?? undefined}>
								<span
									class="username"
									class:staff-name={staff && !hasInlineUser}
									style:color={usernameColor}
									style:filter={metaFilter}
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
							</div>
							{#if !staff}
								<!-- P1-1: created-at inverts from the row bg when custom. -->
								<time class="created-at" style:color={metaColor} style:filter={metaFilter}
									>{formatStamp(m.created_at)}</time
								>
							{/if}
						</div>

						<!-- P1-1: body (.msg-left) carries the author text colour (absent → none).
						     HARD EVIDENCE (alerts-panel.md:123,201-202 / color-system.md §DOM):
						     the body ngClass toggles `.mentionColor{#048d04 italic}` when the
						     message mentions the viewer and `.questionColor{#2095f2}` when the
						     body contains "?" — BOTH gated `!hasCustomFollowedUserColors`, so we
						     apply them ONLY when there is no inline `author_text_color` (inline
						     wins). mention beats question (map order: mentionColor first). -->
						<p
							class="body"
							class:mentionColor={isMention}
							class:questionColor={isQuestion}
							style:color={m.author_text_color ?? undefined}
						>
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
					</div>
				</div>
			</li>
		{:else}
			<li class="empty">No messages yet.</li>
		{/each}
	</ul>

	<!-- P1-2 typing indicator (EXACT bundle template):
	     .d-flex.align-items-center.typing-indicator-container >
	       .users-count.me-1 + .users-typing + .typing-indicator(3 spans).
	     Rendered only while someone is typing; hidden otherwise. -->
	{#if typingNames.length > 0}
		<div class="typing-indicator-container">
			{#if typingExtra > 0}<span class="users-count">+{typingExtra}</span>{/if}
			<span class="users-typing"><em>{typingLeadName}</em> is typing</span>
			<span class="typing-indicator" aria-hidden="true">
				<span></span><span></span><span></span>
			</span>
		</div>
	{/if}

	{#if canPost}
		<!-- HARD EVIDENCE (live captured DOM) — literal structure:
		     #textAreaHolder.d-flex.align-items-center.textSendDiv >
		       .flex-fill.d-flex.mx-0 > .px-0.flex-fill > textarea#textAreaTxt
		       [name=txt-area].txt-area.form-control.border-0 + .textAreaBtnsCol >
		       span.textAreaBtns > i.fas.fa-plus ("Show message options").
		     There is NO Send button: Enter sends, Shift+Enter inserts a newline. -->
		<form onsubmit={onSubmit}>
			<!-- HARD EVIDENCE (bundle c0e + consts @1447220) — literal structure:
			     #textAreaHolder.d-flex.align-items-center.textSendDiv (const 25)
			       > .flex-fill.d-flex.mx-0 (const 62, ref #chatWidth — the measured row)
			         > .px-0.flex-fill (const 63) > textarea#textAreaTxt (const 64)
			         > .justify-content-center.d-flex.flex-row.align-items-center.p-0.m-0
			           .text-center.textAreaBtnsCol (const 65)
			           > t0e: span.textAreaBtns > i.fas.fa-plus  (collapsed)
			           | l0e: emoji / image / GIF buttons        (expanded, IN the column)
			     There is NO Send button: Enter sends, Shift+Enter inserts a newline. -->
			<div
				id="textAreaHolder"
				class="d-flex align-items-center textSendDiv"
				bind:clientWidth={holderWidth}
			>
				<div class="flex-fill d-flex mx-0">
					<div class="px-0 flex-fill">
						<textarea
							id="textAreaTxt"
							name="txt-area"
							class="txt-area form-control border-0"
							bind:this={textareaEl}
							bind:value={body}
							rows="1"
							spellcheck="true"
							maxlength="2000"
							placeholder="Type your message here.."
							oninput={() => {
								autogrow();
								// P1-2: signal typing (throttled ≥2s inside notifyTyping).
								notifyTyping();
							}}
							onkeydown={onComposerKeydown}></textarea>
					</div>
					<div
						class="justify-content-center d-flex flex-row align-items-center p-0 m-0 text-center textAreaBtnsCol"
					>
						{#if showMessageOptions}
							{@render composerButtons()}
						{:else}
							<!-- HARD EVIDENCE (t0e + toggleMessageOptions bundle decode):
							     the + sets showMessageOptions TRUE one-way — the buttons
							     expand INLINE here (no popover); a later row resize
							     recomputes the >=400 threshold. -->
							<button
								type="button"
								class="textAreaBtns"
								aria-label="Show message options"
								title="Show message options"
								onclick={toggleMessageOptions}
							>
								<Icon name="plus" size={16} />
							</button>
						{/if}
					</div>
				</div>
			</div>
		</form>
	{:else}
		<!-- HARD EVIDENCE (chat-composer.md DOM 3 u0e:128-135 + chat-panel.md CSS:146
		     `.chatDisabled{height:40px;min-height:40px;width:100%;bg #fff;color #000}`):
		     the "Chat Disabled" bar replaces the composer when the viewer can't post —
		     `div.chatDisabled.d-flex.align-items-center > h5.pl-3 > i.fa-lock
		     + " Chat Disabled"`. -->
		<div class="chatDisabled">
			<h5><Icon name="lock" size={14} /> Chat Disabled</h5>
		</div>
	{/if}
</section>

<!-- The composer button set (emoji / image / GIF + presenter Play-YouTube),
     rendered EITHER inline in `.textAreaBtnsCol` (width ≥ 400) OR inside the `+`
     popover (narrower) — one source of truth for both branches. -->
{#snippet composerButtons()}
	<!-- Add Emojis (far fa-smile) → native-Unicode picker popover. -->
	<div class="emoji-wrap">
		<button
			type="button"
			class="textAreaBtns"
			aria-label="Add Emojis"
			title="Add Emojis"
			aria-haspopup="menu"
			aria-expanded={emojiOpen}
			bind:this={emojiBtnEl}
			onclick={() => {
				if (!emojiOpen && emojiBtnEl) emojiPopStyle = fixedPopoverStyle(emojiBtnEl);
				emojiOpen = !emojiOpen;
			}}
		>
			<Icon name="smile" family="regular" size={16} />
		</button>
		{#if emojiOpen}
			<!-- HARD EVIDENCE (chat-composer.md §emoji + emoji-mart.md): the emoji
			     button's ngbPopover (popoverClass="popOverDiv", popover-body padding 0,
			     autoClose="outside", container="body" — portaled past the chat panel's
			     overflow clipping) hosts the static <emoji-mart> picker; selecting
			     fires (emojiSelect)=selectEmoji($event). fixedPopoverStyle is our
			     container="body" equivalent. -->
			<div class="emoji-pop popOverDiv" style={emojiPopStyle} {@attach dismissEmoji}>
				<EmojiMart onSelect={(native) => pickEmoji(native)} />
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
	<input bind:this={fileInputEl} type="file" accept="image/*" hidden onchange={onPickImage} />

	<!-- HARD EVIDENCE (chat-composer.md DOM 2b i0e:97-100 / Behavior:337): the
	     presenter-only fa-video "Play YouTube For All" button (data-bs-target
	     #play-youtube-modal, gated `isPresenter`). Wired here ONLY when the parent
	     passes an `onPlayYouTube` callback — otherwise omitted as an honest gap
	     (no local plumbing to open the YouTube surface from this file). -->
	{#if isPresenter && onPlayYouTube}
		<button
			type="button"
			class="textAreaBtns"
			aria-label="Play YouTube For All"
			title="Play YouTube For All"
			onclick={() => onPlayYouTube?.()}
		>
			<Icon name="video" size={16} />
		</button>
	{/if}

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
{/snippet}

<UserInfoModal
	open={infoUser !== null}
	user={infoUser ?? undefined}
	onClose={() => (infoUser = null)}
/>
<ReplyModal
	open={replyTarget !== null}
	recipient={replyTarget?.author_name}
	onClose={() => (replyTarget = null)}
	onSend={(text) => void sendReply(text)}
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
		/* HARD EVIDENCE (stylesheet): `.chat { background-color: var(--chat-bg) }`
		   with --chat-bg → --lightTheme-chat-bg: #eee — the chat COLUMN is #eee, so
		   the white composer holder floats on gray. Message rows paint their own
		   #fff / --msgs-bg-adm backgrounds on top. */
		background: #eeeeee;
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
		align-items: center;
		gap: 6px;
	}
	/* HARD EVIDENCE (chat-panel.md Global CSS:291 `.badge-danger{color:#fff;
	   background-color:#e74c3c}` + badge base:289 padding .25em .4em / 75% / fw-700
	   / radius .25rem). The reference brand DND pill (span.badge.badge-danger.ml-2). */
	.dnd-badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 0.25em 0.4em;
		border-radius: 0.25rem;
		background: #e74c3c;
		color: #ffffff;
		font-size: 75%;
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
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
	/* Active (toggled-on) state for the search icon / gear — the toolbar is open. */
	.actions button.on {
		background: rgba(255, 255, 255, 0.22);
	}

	/* HARD EVIDENCE (chat-panel.md CSS:143 `.chatToolbar,.chatHeader{background-color:
	   var(--msgs-header-bg);color:var(--msgs-header-color)}` — the toolbar shares the
	   header's navy #0a6db1 / white; const 21 is `div.shadow.p-2.w-100.chatToolbar`). */
	.chatToolbar {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		/* p-2 = 8px. */
		padding: 8px;
		background: var(--content-header-bg);
		color: var(--content-header-color);
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
		flex-shrink: 0;
	}
	#chat-settings {
		margin: 0;
	}
	/* Bootstrap input-group shape: input flush with the trailing icon buttons. */
	.input-group {
		display: flex;
		align-items: stretch;
	}
	.input-group .form-control {
		flex: 1;
		min-width: 0;
		border: none;
		border-radius: 3px 0 0 3px;
		padding: 4px 8px;
		font-size: 13px;
		color: var(--content-text);
		background: #ffffff;
	}
	.input-group .form-control:only-child {
		border-radius: 3px;
	}
	/* span#addon-chat-* icon buttons (const 36/38/40): `.input-group-text` with
	   padding:0/margin:0 (chat-panel.md CSS:158). */
	.input-group-text {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		margin: 0;
		min-width: 32px;
		border: none;
		background: #f4f4f4;
		color: #333333;
		cursor: pointer;
	}
	.input-group-text:last-child {
		border-radius: 0 3px 3px 0;
	}
	.input-group-text:hover:not(:disabled) {
		background: #e2e2e2;
	}
	.input-group-text:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	/* #mod-only checkbox row "Show only Moderators messages" (const 43/44/45). */
	.mod-only-row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
	}
	.mod-only-row label {
		margin: 0;
		cursor: pointer;
	}
	.mod-only-row .form-check-input {
		cursor: pointer;
	}
	/* Separate (non-reference) advanced-search entry — kept so the AdvancedSearch
	   modal stays reachable now that the header search icon opens this toolbar. */
	.advanced-search-link {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		align-self: flex-start;
		background: transparent;
		border: none;
		padding: 0;
		color: #ffffff;
		font-size: 12px;
		text-decoration: underline;
		cursor: pointer;
	}
	.advanced-search-link:hover {
		opacity: 0.85;
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
		/* Reference: the row itself carries only pb-1 (4px bottom); .msg-box-adm
		   adds padding-top:2px (see .elevated). Zero side padding. */
		padding: 0 0 4px;
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
	/* HARD EVIDENCE (proroom-all-admin.json): `.msg-box-adm { background-color:
	   var(--msgs-bg-adm); padding-top: 2px }`, and the room's resolved token is
	   --lightTheme-msgs-bg-adm = #f4f4f4 (member rows #fff). Darker captured rows
	   carry per-author INLINE custom colors (user color system), not the theme. */
	.msg-box.elevated {
		background: var(--content-bg-adm, #f4f4f4);
		padding-top: 2px;
	}
	/* Reference row structure (captured DOM): div.mr-1.d-flex.flex-row[-reverse]
	   holding [avatar cluster][.w-100 content]. Staff rows are flex-row-reverse. */
	.row-flex {
		display: flex;
		margin-right: 4px; /* mr-1 */
	}
	.row-flex.reverse {
		flex-direction: row-reverse;
	}
	/* Avatar cluster: d-flex align-items-start flex-nowrap mt-1 (kebab + avatar);
	   mirrored on staff rows so the avatar sits outermost-right. */
	.side {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		flex-wrap: nowrap;
		margin-top: 4px; /* mt-1 */
	}
	.side.reverse {
		flex-direction: row-reverse;
	}
	/* Content column: div.w-100 — header line + body live INSIDE it, beside the
	   avatar cluster (never under it). */
	.content {
		flex: 1 1 auto;
		width: 100%;
		min-width: 0;
	}
	/* Header line: d-flex justify-content-between align-items-center w-100 —
	   member: [name+badges][timestamp]; staff: [timestamp][name+badges]. */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	.name-block {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		min-width: 0;
	}
	/* "Compact Mode" (reference switchChatDisplayMode 'c'): denser rows — tighter
	   vertical padding + smaller body, so more messages fit on screen. */
	.messages.compact .msg-box {
		padding-top: 0.3rem;
		padding-bottom: 0.1rem;
	}
	.messages.compact .header {
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
	/* HARD EVIDENCE (stylesheet): `.chat-reaction-hover { display: none }` +
	   `.msg-box:hover .chat-reaction-hover { display: inline-block }` — the
	   add-reaction affordance only appears while hovering the message row. */
	.msg-box :global(.add-wrap) {
		display: none;
	}
	.msg-box:hover :global(.add-wrap),
	.msg-box:focus-within :global(.add-wrap) {
		display: inline-block;
	}

	.msg-menu {
		position: relative;
		flex-shrink: 0;
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
		/* HARD EVIDENCE (stylesheet): a.msgMenu is `.dropright` — `.dropright
		   .dropdown-menu { top: 0; left: 100%; margin-left: .125rem }`. The menu
		   opens to the SIDE of the kebab (top-aligned), not below it — this is what
		   keeps it from being cut off by the scroll pane. */
		top: 0;
		left: 100%;
		right: auto;
		margin-left: 2px;
		/* Reference .dropdown-menu base: min-width 10rem (160px), z-index 1000. */
		z-index: 1000;
		min-width: 10rem;
		/* Reference kebab menu (users-dropdown-options): navy #0e3651 panel
		   (--archives-dropdown-menu-bg-color !important), no border, padding 8px 0. */
		background: #0e3651;
		border: none;
		border-radius: 8px;
		padding: 8px 0;
		display: flex;
		flex-direction: column;
	}
	/* Staff rows have the kebab on the RIGHT edge — flip to dropleft so the menu
	   opens inward instead of clipping off the panel. */
	.side.reverse .menu {
		left: auto;
		right: 100%;
		margin-left: 0;
		margin-right: 2px;
	}
	/* Inline reaction row inside the kebab ("Add Reaction" expanded). */
	.react-row {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 4px 12px;
	}
	.react-row button {
		background: transparent;
		border: none;
		font-size: 16px;
		padding: 2px 4px;
		min-height: 0;
		cursor: pointer;
	}
	.react-row button:hover {
		background: #375a7f;
		border-radius: 4px;
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
		/* Reference div.avatar.pl-1 > img: 35x35, square (radius 0), object-fit
		   cover; pl-1 = 4px gap toward the kebab. */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 35px;
		height: 35px;
		flex-shrink: 0;
		margin-left: 4px;
		border-radius: 0;
		overflow: hidden;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
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
	/* HARD EVIDENCE (proroom-ultra-admin-room.md §4d lines 448-455): the admin/presenter
	   author-tier username colour is #e8e8e8 (rgb 232,232,232) — a class-driven DEFAULT,
	   applied only when the author has NO inline colour (see `class:staff-name` gate). The
	   member tier is the #0a6db1 `--username-color` default already on `.username`; the bot
	   tier (#d7d7d7) is an honest gap (no bot signal reaches the row — see the markup note). */
	.username.staff-name {
		color: #e8e8e8;
	}
	/* Badges sit after the username and must not be squeezed — only the name
	   truncates. (Badges renders an inline cluster as the row's next child.) */
	.name-block :global(.badges) {
		flex-shrink: 0;
	}

	.created-at {
		/* Header is justify-content:space-between (reference), so placement comes
		   from DOM order, not auto-margins. mx-2 = 8px side margins. */
		margin: 0 8px;
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
		/* HARD EVIDENCE (stylesheet .msg-left + ml-2 mr-2 p-0): the body lives
		   INSIDE the .w-100 content column — its indent comes from the flex layout,
		   not a gutter margin. ml-2/mr-2 = 8px side margins. */
		margin: 0 8px;
		/* Reference chat body (div.msg-left): #676767, 13px / line-height 1.5. */
		color: var(--content-text);
		line-height: 1.5;
		word-break: break-word;
		white-space: pre-wrap;
		font-size: var(--msg-font-size);
	}
	/* HARD EVIDENCE (question tint): `proroom-NUCLEAR-member.md:359` — question-body
	   `.questionColor` computes `rgb(32,149,242)` = #2095f2 (×11 rendered rows). The
	   class is toggled by the template ngClass map `{mentionColor, questionColor}`
	   (color-system.md:108-110/282-283). Both classes are applied ONLY when there is
	   no inline `author_text_color` (the reference `!hasCustomFollowedUserColors` gate —
	   inline author colour wins), so the plain `color` here needs no `!important`.
	   HONEST GAP (mention tint): `.mentionColor` (#048d04 italic) is the template flag
	   for an @-mention, but color-system.md:282 states its CSS rule was NOT located in
	   the bundle and no rendered capture computes it — so #048d04 is an UNVERIFIED value
	   carried from prior work, not a cited computed style. Left as-is pending a capture
	   of a mention row; do not treat #048d04 as evidence-backed. */
	.body.mentionColor {
		color: #048d04;
		font-style: italic;
	}
	.body.questionColor {
		color: #2095f2;
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
	/* HARD EVIDENCE (bundle @1459046 scoped rule + user-captured computed dump):
	   #textAreaHolder { background-color: var(--textarea-bg); border-radius: 8px;
	   padding: 5px; margin: 5px } — computes 45px tall, white, flex/center via the
	   d-flex align-items-center utilities, color #ccc inherited from Darkly body. */
	#textAreaHolder {
		display: flex;
		align-items: center;
		/* Fill the flex form row — the reference holder spans the pane minus its
		   5px margins (elements[1086]: 569 of the 579 pane). Losing this flex
		   made the holder shrink-to-content (206px box) — the visible bug. */
		flex: 1 1 auto;
		min-width: 0;
		color: #ccc;
		/* HARD EVIDENCE (proroom-full-member.json elements[1086-1096]): every
		   composer element computes font-family "Open Sans", sans-serif exactly
		   — the reference stack, not the app-wide fallback chain. */
		font-family: 'Open Sans', sans-serif;
		background: var(--content-bg);
		border: none;
		border-radius: 8px;
		padding: 5px;
		margin: 5px;
	}
	/* Reference .flex-fill.d-flex.mx-0 — the measured #chatWidth row (const 62). */
	#textAreaHolder .flex-fill.d-flex.mx-0 {
		display: flex;
		flex: 1 1 auto;
		margin-left: 0;
		margin-right: 0;
		min-width: 0;
	}
	/* Reference div.px-0.flex-fill: the textarea grows to fill, no h-padding. */
	.px-0.flex-fill {
		flex: 1 1 auto;
		min-width: 0;
		padding-left: 0;
		padding-right: 0;
	}
	#textAreaHolder textarea {
		/* BS .form-control is display:block — kills the inline baseline gap that
		   inflated the holder to 51px (reference holder computes 45px). */
		display: block;
		width: 100%;
		box-sizing: border-box;
		/* HARD EVIDENCE (computed #textAreaTxt): border-top-width 0px — the element's
		   `border-0` class (`border: 0 !important`) kills the .txt-area border entirely,
		   so the ACTIVE effect is ONLY the soft box-shadow (no rectangle). */
		border: 0;
		/* HARD EVIDENCE (scoped .txt-area @1455794): border-radius:0; margins 0. */
		border-radius: 0;
		margin: 0;
		/* Bootstrap .form-control transition — the focus shadow FADES in. */
		transition:
			border-color 0.15s ease-in-out,
			box-shadow 0.15s ease-in-out;
		outline: none;
		appearance: none;
		/* HARD EVIDENCE (scoped @1455794 + @1459563): background-color
		   var(--textarea-bg)!important (#fff) — the textarea itself paints white. */
		background: var(--content-bg);
		/* Reference .txt-area.form-control.border-0: --lightTheme-textarea-color
		   #676767, 14px / weight 400 / line-height 21px, min-height 35, max-height
		   300 (scoped #textAreaTxt @1459503), padding 6px 5px (BS .form-control
		   .375rem top/bottom + scoped 5px left/right). */
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
	#textAreaHolder textarea:focus {
		/* HARD EVIDENCE: `.txt-area:focus { border-color: var(--darker-gray);
		   box-shadow: 1px 1px 1px var(--darker-gray) }` (--darker-gray #aaa6a6) — but
		   the border never paints (border-0 wins with width 0 !important), so the
		   ACTIVE state is the soft 1px shadow only. */
		box-shadow: 1px 1px 1px #aaa6a6;
	}
	/* Reference div.textAreaBtnsCol: centered column holding the single + button. */
	/* HARD EVIDENCE (const 65 + scoped @1459563): the button column — flex row,
	   centered, p-0 m-0, background var(--textarea-bg) (white, same as textarea).
	   The l0e/t0e buttons render DIRECTLY in it — no wrapper, no popover. */
	.textAreaBtnsCol {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0;
		margin: 0;
		flex-shrink: 0;
		background: var(--content-bg);
		/* HARD EVIDENCE (elements[1090]): the column computes color #aaa
		   (--dark-gray) — the spans inside override to #676767. */
		color: #aaa;
	}
	/* HARD EVIDENCE (proroom-full-member.json elements[1091-1096]): the
	   reference buttons are SPANS computing display:block, padding 5px,
	   radius 0, color #676767, font 16px/24px w300, text-align center,
	   cursor auto → 26×34 boxes (GIF: 12px/18px → 29×28). Our <button>
	   needs the UA chrome stripped + those exact metrics. */
	.textAreaBtns {
		display: block;
		background: transparent;
		border: none;
		border-radius: 0;
		color: var(--content-text);
		cursor: auto;
		padding: 5px;
		margin: 0;
		font-family: inherit;
		font-size: 16px;
		font-weight: 300;
		line-height: 24px;
		text-align: center;
	}
	.textAreaBtns:hover:not(:disabled) {
		/* HARD EVIDENCE: --textarea-holder-btns-hover-color = #0a6db1. */
		color: #0a6db1;
	}
	.textAreaBtns:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.textAreaBtns.gif {
		/* HARD EVIDENCE (elements[1095-1096]): GIF label 300 12px/18px. */
		font-size: 12px;
		font-weight: 300;
		line-height: 18px;
	}
	/* Emoji picker popover — hosts the static EmojiMart replica above the button
	   (reference ngbPopover popoverClass="popOverDiv": .popover-body padding 0,
	   so the picker's own #d9d9d9 border/5px radius IS the popover chrome). */
	.emoji-wrap {
		position: relative;
		display: inline-flex;
	}
	.emoji-pop {
		position: absolute;
		bottom: calc(100% + 0.3rem);
		right: 0;
		z-index: 20;
		padding: 0;
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
	/* HARD EVIDENCE (chat-panel.md CSS:146-147 `.chatDisabled{height:40px;
	   min-height:40px;width:100%;background-color:#fff;color:#000}` + chat-composer.md
	   DOM 3 u0e: `div.chatDisabled.d-flex.align-items-center > h5.pl-3 > i.fa-lock
	   + " Chat Disabled"`). The "webinarMode" sibling uses the same #fff/#000 bar. */
	.chatDisabled {
		display: flex;
		align-items: center;
		height: 40px;
		min-height: 40px;
		width: 100%;
		background-color: #ffffff;
		color: #000000;
		flex-shrink: 0;
	}
	.chatDisabled h5 {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		/* pl-3 = 16px left padding. */
		padding-left: 16px;
		margin: 0;
		font-size: 1.25rem;
		font-weight: 500;
	}

	/* ── P1-2 typing indicator (EXACT bundle CSS, IMPLEMENTATION-PLAN.md P1-2) ──
	   `.typing-indicator-container { margin: 4px 16px }`; the row is a flex line
	   (.d-flex.align-items-center). */
	.typing-indicator-container {
		display: flex;
		align-items: center;
		margin: 4px 16px;
	}
	/* `.users-count, .users-typing { color:#90949c; font-size:12px }`; the
	   .users-count carries a me-1 (4px right margin). */
	.users-count,
	.users-typing {
		color: #90949c;
		font-size: 12px;
	}
	.users-count {
		margin-right: 4px; /* me-1 */
	}
	/* `.users-typing` ellipsis-truncates a long name; `.users-typing em` is 700. */
	.users-typing {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.users-typing em {
		font-weight: 700;
		font-style: normal;
	}
	/* `.typing-indicator span`: three 3px dots, #9e9ea1, blink 1.5s staggered at
	   .33s / .66s / .99s. */
	.typing-indicator {
		display: inline-flex;
		align-items: center;
		margin-left: 4px;
	}
	.typing-indicator span {
		display: inline-block;
		width: 3px;
		height: 3px;
		margin: 0 1px;
		border-radius: 50%;
		background: #9e9ea1;
		animation: typing-blink 1.5s infinite;
	}
	.typing-indicator span:nth-child(1) {
		animation-delay: 0.33s;
	}
	.typing-indicator span:nth-child(2) {
		animation-delay: 0.66s;
	}
	.typing-indicator span:nth-child(3) {
		animation-delay: 0.99s;
	}
	/* Blink keyframes: opacity .4 → 1 → .4 (P1-2). */
	@keyframes typing-blink {
		0% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.4;
		}
	}
</style>
