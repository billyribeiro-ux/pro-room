<script lang="ts">
	import { tick } from 'svelte';
	import Icon from './Icon.svelte';

	interface Peer {
		display_name?: string;
		user_id?: string;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		peer?: Peer;
		onSend?: (text: string) => void;
	}
	let { open, onClose, peer, onSend }: Props = $props();

	type PrivateMessage = { id: number; mine: boolean; body: string };

	let messages = $state<PrivateMessage[]>([]);
	let body = $state('');
	let nextId = 0;
	let textareaEl = $state<HTMLTextAreaElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);

	const peerName = $derived(peer?.display_name?.trim() || 'Private chat');

	// Auto-scroll to the newest message when one arrives — but only if the user is
	// already near the bottom (don't yank them up if they scrolled back). This is
	// the documented Svelte pattern: $effect.pre tracking messages.length + tick().
	$effect.pre(() => {
		if (!listEl) return;
		void messages.length; // track so this re-runs when a message is added
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
		messages.push({ id: nextId++, mine: true, body: text });
		onSend?.(text);
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
			{#each messages as m (m.id)}
				<li class="msg-row" class:mine={m.mine}>
					<span class="bubble">{m.body}</span>
				</li>
			{:else}
				<li class="empty">No messages yet — say hello.</li>
			{/each}
		</ul>

		<form onsubmit={onSubmit}>
			<div class="pill">
				<textarea
					bind:this={textareaEl}
					bind:value={body}
					rows="1"
					maxlength="2000"
					placeholder="Type your message here.."
					aria-label="Message"
					oninput={autogrow}
					onkeydown={onComposerKeydown}
				></textarea>
				<button type="button" class="ic" aria-label="Emoji">
					<Icon name="smile" size={18} />
				</button>
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
		z-index: 55;
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

	header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.75rem;
		background: var(--bg-elev-2);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.lead {
		display: inline-flex;
		color: var(--accent);
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
		color: var(--text-dim);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
	}
	.actions button:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.08);
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
	.pill textarea::placeholder {
		color: var(--text-dim);
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
