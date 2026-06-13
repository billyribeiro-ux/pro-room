<script lang="ts">
	import type { Message } from '$lib/types';
	import { ChatCircle, PaperPlaneRight } from 'phosphor-svelte';

	export type ChatItem = Message & { author_name?: string };

	interface Props {
		messages: ChatItem[];
		canPost: boolean;
		onPost: (body: string) => Promise<void>;
	}
	let { messages, canPost, onPost }: Props = $props();

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
		return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<section class="panel">
	<header><ChatCircle size={16} weight="fill" /> Chat</header>

	<ul class="messages">
		{#each messages as m (m.id)}
			<li>
				<span class="author">{m.author_name ?? 'trader'}</span>
				<span class="body">{m.body}</span>
				<span class="time">{time(m.created_at)}</span>
			</li>
		{:else}
			<li class="empty">No messages yet.</li>
		{/each}
	</ul>

	{#if canPost}
		<form onsubmit={submit}>
			<input placeholder="Message…" bind:value={body} maxlength="2000" />
			<button type="submit" disabled={sending} aria-label="Send">
				<PaperPlaneRight size={16} weight="fill" />
			</button>
		</form>
	{:else}
		<p class="readonly">You can read the chat. Join the room to participate.</p>
	{/if}
</section>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		height: 100%;
		min-height: 0;
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid var(--border);
		font-weight: 600;
		font-size: 0.9rem;
	}
	header :global(svg) {
		color: var(--accent);
	}
	.messages {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0.6rem;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.messages li {
		display: flex;
		gap: 0.45rem;
		font-size: 0.85rem;
		line-height: 1.35;
	}
	.author {
		font-weight: 600;
		color: var(--accent);
		flex-shrink: 0;
	}
	.body {
		word-break: break-word;
	}
	.time {
		margin-left: auto;
		color: var(--text-dim);
		font-size: 0.7rem;
		flex-shrink: 0;
	}
	.empty {
		color: var(--text-dim);
		justify-content: center;
	}
	form {
		display: flex;
		gap: 0.4rem;
		padding: 0.6rem;
		border-top: 1px solid var(--border);
	}
	input {
		flex: 1;
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 7px;
		padding: 0.45rem 0.6rem;
		font-size: 0.85rem;
	}
	button {
		display: inline-flex;
		align-items: center;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 7px;
		padding: 0 0.7rem;
	}
	button:hover {
		background: var(--accent-hover);
	}
	.readonly {
		margin: 0;
		padding: 0.6rem;
		border-top: 1px solid var(--border);
		color: var(--text-dim);
		font-size: 0.8rem;
		text-align: center;
	}
</style>
