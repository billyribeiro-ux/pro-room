<script lang="ts">
	import type { Message, ChatChannel, PresentUser } from '$lib/types';
	import { parseMessage, formatStamp, dayKey, formatDayLabel } from '$lib/message';
	import UserInfoModal from './modals/UserInfoModal.svelte';
	import {
		ChatCircleIcon,
		MagnifyingGlassIcon,
		GearIcon,
		CaretDownIcon,
		SmileyIcon,
		ImageIcon,
		DotsThreeVerticalIcon,
		UserIcon,
		ArrowBendUpLeftIcon,
		CopyIcon
	} from 'phosphor-svelte';

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
	}
	let { messages, channel, present = [], canPost, onPost, onChannel }: Props = $props();

	let body = $state('');
	let sending = $state(false);

	// Which row's ⠇ menu is open (message id), or null when none.
	let openMenuId = $state<string | null>(null);

	// User-info modal target (a row's author), or null when closed.
	let infoUser = $state<{ display_name?: string; user_id?: string; online?: boolean } | null>(null);

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
		<div class="lead"><ChatCircleIcon size={17} weight="fill" /></div>
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
			<button type="button" aria-label="Search chat"
				><MagnifyingGlassIcon size={16} weight="bold" /></button
			>
			<button type="button" class="gear" aria-label="Chat settings">
				<GearIcon size={16} weight="fill" /><CaretDownIcon size={10} weight="bold" />
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
							<DotsThreeVerticalIcon size={18} weight="bold" />
						</button>
						{#if openMenuId === m.id}
							<div class="menu" role="menu">
								<button type="button" role="menuitem" onclick={() => openUserInfo(m)}>
									<UserIcon size={14} weight="fill" /> User Info
								</button>
								<button type="button" role="menuitem" onclick={() => mention(m)}>
									<ArrowBendUpLeftIcon size={14} weight="bold" /> Mention
								</button>
								<button type="button" role="menuitem" onclick={() => copyBody(m)}>
									<CopyIcon size={14} weight="bold" /> Copy
								</button>
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

				<p class="body">
					{#each parseMessage(m.body) as seg, si (si)}{#if seg.kind === 'ticker'}<span
								class="ticker">{seg.value}</span
							>{:else if seg.kind === 'link'}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external user-supplied URL, not an internal route --><a
								href={seg.href}
								target="_blank"
								rel="noopener noreferrer">{seg.value}</a
							>{:else}{seg.value}{/if}{/each}
				</p>
			</li>
		{:else}
			<li class="empty">No messages yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<form onsubmit={onSubmit}>
			<div class="pill">
				<textarea
					bind:this={textareaEl}
					bind:value={body}
					rows="1"
					maxlength="2000"
					placeholder="Type your message here.."
					oninput={autogrow}
					onkeydown={onComposerKeydown}
				></textarea>
				<button type="button" class="ic" aria-label="Emoji"
					><SmileyIcon size={18} weight="fill" /></button
				>
				<button type="button" class="ic" aria-label="Image"
					><ImageIcon size={18} weight="fill" /></button
				>
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

<style>
	.panel {
		display: flex;
		flex-direction: column;
		background: #ffffff;
		border-radius: 0 0 8px 8px;
		overflow: hidden;
		height: 100%;
		min-height: 0;
		color: #1f2430;
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.85rem;
		background: #1f86d6;
		color: #ffffff;
		flex-shrink: 0;
	}
	.lead {
		display: inline-flex;
	}
	.tabs {
		display: flex;
		gap: 0.3rem;
		margin: 0 auto;
	}
	.tabs button {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.78);
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		cursor: pointer;
	}
	.tabs button.active {
		background: rgba(255, 255, 255, 0.22);
		color: #ffffff;
	}
	.tabs button:hover:not(.active) {
		color: #ffffff;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.35rem;
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
		padding: 0.5rem 0.85rem 0.3rem;
	}
	.separator {
		display: inline-block;
		background: var(--ptr-msgs-separator-bg, #45a2ff);
		color: var(--ptr-msgs-separator-color, #ffffff);
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.15rem 0.7rem;
		border-radius: 999px;
		white-space: nowrap;
	}

	.msg-box {
		position: relative;
		padding: 0.6rem 0.85rem 0.25rem;
		border-bottom: 1px solid #ececf1;
		font-size: var(--msg-font-size);
	}
	.row1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		color: #9aa1b0;
		cursor: pointer;
		padding: 0.1rem;
		border-radius: 6px;
	}
	.menu-trigger:hover {
		background: #eef0f4;
		color: #5a6273;
	}
	.menu {
		position: absolute;
		top: 100%;
		left: 0;
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

	.avatar,
	.avatar-img {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
	}
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #e7e9ef;
		color: #5a6273;
		font-size: 0.78rem;
		font-weight: 700;
	}
	.avatar-img {
		border-radius: 50%;
		object-fit: cover;
	}

	.username {
		font-weight: 900;
		color: var(--username-color);
	}

	.created-at {
		margin-left: auto;
		font-weight: 700;
		font-size: 0.74rem;
		color: #444b57;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.body {
		margin: 0.35rem 0 0;
		color: #1f2430;
		line-height: 1.45;
		word-break: break-word;
		white-space: pre-wrap;
		font-size: var(--msg-font-size);
	}
	.ticker {
		color: var(--ticker-color);
		font-weight: 700;
	}
	.body a {
		color: var(--ptr-link-color, #45a2ff);
		text-decoration: underline;
		word-break: break-all;
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
		color: #1f2430;
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
		color: #7b8190;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.ic:hover {
		color: #2f80c8;
	}
	.gif {
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.02em;
	}
	.send {
		background: #1f86d6;
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
		background: #1a73ba;
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
