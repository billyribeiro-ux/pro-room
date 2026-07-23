<script lang="ts">
	import { tick } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import Icon from './Icon.svelte';
	import EmojiMart from './EmojiMart.svelte';
	import { fixedPopoverStyle } from '$lib/popoverPosition';
	import { privateChat, sendPrivate, isMine } from '$lib/privateChat.svelte';
	// GIF search: reuse the exact GIPHY pattern from ChatPanel. The reference PM
	// composer — unlike Reply/QA — carries a "Search for GIFs" button.
	// HARD EVIDENCE (decoded reply-qa-pm.md §DOM C + §Behavior): PM composer consts
	// include `["ngbTooltip","Search for GIFs",...]` and the note
	// "PM composer DOES have a GIF button" / "unlike Reply/QA it includes a GIF search".
	import { giphyEnabled, searchGifs, type Gif } from '$lib/giphy';

	interface Peer {
		display_name?: string;
		user_id?: string;
		/**
		 * Whether the peer is currently online. Drives the red presence dot.
		 * HARD EVIDENCE (decoded reply-qa-pm.md §Scoped CSS privchat):
		 * `.user-status-type{...background-color:#dc3545}` red dot bottom-right of
		 * the avatar. HONEST GAP: online/presence state does NOT currently reach
		 * this component (privateChat store's PrivatePeer has no online field), so
		 * the dot only renders when a caller supplies `online` — never faked.
		 */
		online?: boolean;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		peer?: Peer;
	}
	let { open, onClose, peer }: Props = $props();

	let body = $state('');
	let textareaEl = $state<HTMLTextAreaElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);

	// ─── Emoji picker (reference PM composer emoji button → emoji-mart popover,
	// same static picker as the main chat composer — reply-qa-pm.md §DOM C). ───
	let emojiOpen = $state(false);
	let emojiBtnEl = $state<HTMLElement | null>(null);
	let emojiPopStyle = $state('');
	function pickEmoji(native: string) {
		const el = textareaEl;
		if (!el) {
			body = body ? `${body} ${native} ` : `${native} `;
			return;
		}
		const start = el.selectionStart ?? body.length;
		const end = el.selectionEnd ?? body.length;
		body = body.slice(0, start) + native + body.slice(end);
		void tick().then(() => {
			el.focus();
			const caret = start + native.length;
			el.setSelectionRange(caret, caret);
			autogrow();
		});
	}
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

	const peerName = $derived(peer?.display_name?.trim() || 'Private chat');

	// ─── GIF picker (reference PM "Search for GIFs", GIPHY-backed) ──────────────
	// HARD EVIDENCE (decoded reply-qa-pm.md §Behavior): PM composer button set is
	// emoji + GIF + image. Mirrors ChatPanel's implementation verbatim.
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
			// Surface nothing fake — leave the grid on its "No GIFs found." empty state.
			gifs = [];
		} finally {
			gifBusy = false;
		}
	}

	function toggleGifs() {
		gifOpen = !gifOpen;
		if (gifOpen && gifs.length === 0) void loadGifs();
	}

	function pickGif(g: Gif) {
		// Append the GIF URL into the composer (chat renders URLs as media).
		body = body ? `${body} ${g.url}` : g.url;
		gifOpen = false;
		void tick().then(autogrow);
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

	// Auto-scroll to the newest message when one arrives — but only if the user is
	// already near the bottom (don't yank them up if they scrolled back). This is
	// the documented Svelte pattern: $effect.pre tracking messages.length + tick().
	$effect.pre(() => {
		if (!listEl) return;
		void privateChat.messages.length; // track so this re-runs when a message is added
		const atBottom = listEl.offsetHeight + listEl.scrollTop >= listEl.scrollHeight - 40;
		if (atBottom) {
			tick().then(() => listEl?.scrollTo(0, listEl.scrollHeight));
		}
	});

	// Auto-grow the composer up to a few lines, matching the ChatPanel textarea.
	function autogrow() {
		const el = textareaEl;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	}

	function send() {
		const text = body.trim();
		if (!text) return;
		// Persist + deliver via the backend; the POST result + WS echo are de-duped
		// by id in the store, so the bubble appears once.
		void sendPrivate(text);
		body = '';
		autogrow();
	}

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		send();
	}

	// Enter sends; Shift+Enter inserts a newline (reference composer behaviour).
	function onComposerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

{#if open}
	<section class="priv-chat" aria-label={`Private chat with ${peerName}`}>
		<header>
			<span class="lead" aria-hidden="true"><Icon name="comments" size={17} /></span>
			<!-- Peer avatar + presence dot. HARD EVIDENCE (decoded reply-qa-pm.md
			     §Scoped CSS privchat): `.user-status-container{position:relative}` +
			     `.user-status-type{...border-radius:50%;position:absolute;bottom:-5px;
			     left:26px;background-color:#dc3545}` red circle bottom-right of avatar.
			     The dot only paints when `peer.online === true`; online state does not
			     currently reach this component (HONEST GAP), so it stays hidden until a
			     caller supplies it — never faked. -->
			<span class="user-status-container" aria-hidden="true">
				<span class="pm-avatar"><Icon name="user" size={14} /></span>
				{#if peer?.online}
					<span class="user-status-type"></span>
				{/if}
			</span>
			<span class="peer">{peerName}</span>
			<div class="actions">
				<button type="button" aria-label="Chat settings">
					<Icon name="cog" />
				</button>
				<button type="button" aria-label="Close private chat" onclick={onClose}>
					<Icon name="times" />
				</button>
			</div>
		</header>

		<ul class="messages" bind:this={listEl}>
			{#each privateChat.messages as m (m.id)}
				<li class="msg-row" class:mine={isMine(m)}>
					<span class="bubble">{m.body}</span>
				</li>
			{:else}
				<li class="empty">No messages yet — say hello.</li>
			{/each}
		</ul>

		<form onsubmit={onSubmit}>
			<div class="pill">
				<textarea
					id="pm-composer"
					name="private-message"
					bind:this={textareaEl}
					bind:value={body}
					rows="1"
					maxlength="2000"
					placeholder="Type your message here.."
					aria-label="Message"
					oninput={autogrow}
					onkeydown={onComposerKeydown}></textarea>
				<div class="emoji-wrap">
					<button
						type="button"
						class="ic"
						aria-label="Emoji"
						aria-expanded={emojiOpen}
						bind:this={emojiBtnEl}
						onclick={() => {
							if (!emojiOpen && emojiBtnEl) emojiPopStyle = fixedPopoverStyle(emojiBtnEl);
							emojiOpen = !emojiOpen;
						}}
					>
						<Icon name="smile" size={18} />
					</button>
					{#if emojiOpen}
						<div class="emoji-pop" style={emojiPopStyle} {@attach dismissEmoji}>
							<EmojiMart onSelect={pickEmoji} />
						</div>
					{/if}
				</div>
				<!-- Search for GIFs — PM-only (Reply/QA have no GIF button).
				     HARD EVIDENCE (decoded reply-qa-pm.md §DOM C + §Behavior). Gated on
				     a configured GIPHY key; disabled (never half-wired) when absent. -->
				<div class="gif-wrap">
					<button
						type="button"
						class="ic gif"
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
								id="pm-gif-search"
								name="pm-gif-search"
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
				<button type="button" class="ic" aria-label="Image">
					<Icon name="image" size={18} />
				</button>
			</div>
			<button type="submit" class="send" disabled={!body.trim()}>Send</button>
		</form>
	</section>
{/if}

<style>
	.priv-chat {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 1040; /* floating layer: above the z-1030 nav, below modals */
		width: 320px;
		max-width: calc(100vw - 2rem);
		max-height: min(70vh, 520px);
		display: flex;
		flex-direction: column;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
		color: var(--text);
		overflow: hidden;
	}

	/* PM panel header = the reference `.chat-nav-pm`.
	   HARD EVIDENCE (decoded reply-qa-pm.md §Scoped CSS + §Resolved values):
	   `.chat-nav-pm{align-items:center;flex-wrap:nowrap;min-height:40px;
	   background-color:var(--msgs-header-bg)!important}` → resolves to #0a6db1,
	   white text (`--msgs-header-color:#fff`). `--content-header-bg` in layout.css
	   is that same #0a6db1 token. */
	header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: nowrap;
		min-height: 40px;
		padding: 0.55rem 0.75rem;
		background: var(--content-header-bg); /* #0a6db1 */
		color: #fff;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.lead {
		display: inline-flex;
		color: #fff;
	}
	/* Peer avatar wrapper — the presence-dot anchor.
	   HARD EVIDENCE (decoded reply-qa-pm.md §Scoped CSS): `.user-status-container
	   {position:relative}`. */
	.user-status-container {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
	}
	.pm-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.18);
		color: #fff;
	}
	/* Red online dot, bottom-right of the avatar.
	   HARD EVIDENCE (decoded reply-qa-pm.md §Scoped CSS + §Resolved values):
	   `.user-status-type{padding:0.5px 4px!important;border-radius:50%;position:
	   absolute;bottom:-5px;left:26px;background-color:#dc3545}`. Positioned to the
	   avatar's bottom-right corner. */
	.user-status-type {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background-color: #dc3545;
		box-shadow: 0 0 0 2px var(--content-header-bg);
	}
	.peer {
		flex: 1;
		min-width: 0;
		font-weight: 700;
		font-size: 0.88rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		flex-shrink: 0;
	}
	.actions button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		/* White-ish on the navy #0a6db1 header (msgs-header-color #fff). */
		color: rgba(255, 255, 255, 0.85);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.actions button:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.15);
	}

	.messages {
		list-style: none;
		margin: 0;
		padding: 0.6rem 0.65rem;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		background: var(--bg);
	}
	.empty {
		margin: auto;
		text-align: center;
		color: var(--text-dim);
		font-size: 0.85rem;
	}

	.msg-row {
		display: flex;
	}
	.msg-row.mine {
		justify-content: flex-end;
	}
	.bubble {
		max-width: 80%;
		padding: 0.4rem 0.6rem;
		border-radius: var(--radius);
		background: var(--bg-elev-2);
		color: var(--text);
		font-size: 0.85rem;
		line-height: 1.4;
		word-break: break-word;
		white-space: pre-wrap;
	}
	.msg-row.mine .bubble {
		background: var(--accent);
		color: #fff;
	}

	form {
		display: flex;
		align-items: flex-end;
		gap: 0.45rem;
		padding: 0.55rem 0.6rem;
		border-top: 1px solid var(--border);
		background: var(--bg-elev);
		flex-shrink: 0;
	}
	.pill {
		display: flex;
		align-items: center;
		gap: 0.15rem;
		flex: 1;
		min-width: 0;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
	}
	.pill textarea {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		color: var(--text);
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
		color: var(--text-dim);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.ic:hover {
		color: var(--accent);
	}
	.ic:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	/* GIF text button — matches the reference 12px "GIF" label
	   (decoded reply-qa-pm.md §Behavior: "Search for GIFs"). */
	.ic.gif {
		font-size: 12px;
		font-weight: 300;
		padding: 0.25rem 0.35rem;
	}
	/* Emoji picker popover — hosts the EmojiMart replica above the button (its
	   own #d9d9d9 border/5px radius is the chrome, per popOverDiv). */
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
	/* GIF search popover — mirrors the ChatPanel GIF popover chrome, opening above
	   the composer button. */
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
		max-width: calc(100vw - 3rem);
		background: var(--bg-elev-2);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.4rem;
	}
	.gif-pop input {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.3rem 0.5rem;
		font-size: 12px;
		color: var(--text);
		background: var(--bg);
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
		color: var(--text-dim);
		font-size: 12px;
	}
	.send {
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 999px;
		padding: 0.45rem 0.9rem;
		font-weight: 600;
		font-size: 0.82rem;
		cursor: pointer;
		flex-shrink: 0;
	}
	.send:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	.send:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
