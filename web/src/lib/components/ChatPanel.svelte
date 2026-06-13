<script lang="ts">
	import type { Message, ChatChannel } from '$lib/types';
	import {
		ChatCircle,
		MagnifyingGlass,
		Gear,
		CaretDown,
		Smiley,
		Image as ImageIcon
	} from 'phosphor-svelte';

	export type ChatItem = Message & { author_name?: string };

	interface Props {
		messages: ChatItem[];
		channel: ChatChannel;
		canPost: boolean;
		onPost: (body: string) => Promise<void>;
		onChannel: (channel: ChatChannel) => void;
	}
	let { messages, channel, canPost, onPost, onChannel }: Props = $props();

	let body = $state('');
	let sending = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		const text = body.trim();
		if (!text) return;
		sending = true;
		try {
			await onPost(text);
			body = '';
		} finally {
			sending = false;
		}
	}

	function time(iso: string) {
		return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
	}
</script>

<section class="panel">
	<header>
		<div class="lead"><ChatCircle size={17} weight="fill" /></div>
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
				><MagnifyingGlass size={16} weight="bold" /></button
			>
			<button type="button" class="gear" aria-label="Chat settings">
				<Gear size={16} weight="fill" /><CaretDown size={10} weight="bold" />
			</button>
		</div>
	</header>

	<ul class="messages">
		{#each messages as m (m.id)}
			<li>
				<span class="author">{m.author_name ?? 'trader'}</span>
				<span class="text">{m.body}</span>
				<time class="time">{time(m.created_at)}</time>
			</li>
		{:else}
			<li class="empty">No messages yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<form onsubmit={submit}>
			<div class="pill">
				<input placeholder="Type your message here.." bind:value={body} maxlength="2000" />
				<button type="button" class="ic" aria-label="Emoji"
					><Smiley size={18} weight="fill" /></button
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
		padding: 0.5rem 0.85rem;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		background: #ffffff;
	}
	.messages li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem;
		font-size: 0.85rem;
		line-height: 1.4;
	}
	.author {
		font-weight: 700;
		color: #2f80c8;
		flex-shrink: 0;
	}
	.text {
		color: #1f2430;
		word-break: break-word;
	}
	.time {
		margin-left: auto;
		color: #8a909c;
		font-size: 0.72rem;
		flex-shrink: 0;
	}
	.empty {
		color: #8a909c;
		justify-content: center;
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
	.pill input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		color: #1f2430;
		font-size: 0.85rem;
		padding: 0.35rem 0.25rem;
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
