<script lang="ts">
	import Modal from '../Modal.svelte';
	import { ClockIcon, PaperPlaneTiltIcon, XIcon } from 'phosphor-svelte';

	export interface ScheduledAlert {
		id: string;
		text: string;
		sendAt: string;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		/** Currently scheduled alerts, newest first. Defaults to the empty state. */
		scheduled?: ScheduledAlert[];
		/** Called when the composer schedules a new alert. */
		onSchedule?: (text: string, sendAt: string) => void;
		/** Called when an alert's delete (×) is clicked. */
		onDelete?: (id: string) => void;
	}
	let { open, onClose, scheduled = [], onSchedule, onDelete }: Props = $props();

	let text = $state('');
	let sendAt = $state('');

	const formId = $props.id();

	const canSchedule = $derived(text.trim().length > 0 && sendAt !== '');

	function schedule(e: SubmitEvent) {
		e.preventDefault();
		if (!canSchedule) return;
		onSchedule?.(text.trim(), sendAt);
		// Reset the composer for the next entry. The parent owns the list, so we
		// only clear our own local draft state — no list mutation here.
		text = '';
		sendAt = '';
	}

	// "2026-06-14T09:30" -> a readable local label, falling back to the raw value
	// if the browser can't parse it (e.g. an empty or malformed sendAt).
	function formatSendAt(value: string): string {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return value;
		return d.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} title="Manage Scheduled Alerts" {footer}>
	<form id={formId} class="composer" onsubmit={schedule}>
		<div class="field">
			<label class="label" for="{formId}-text">Alert</label>
			<input
				id="{formId}-text"
				type="text"
				bind:value={text}
				placeholder="Alert to send…"
				autocomplete="off"
			/>
		</div>
		<div class="row">
			<div class="field grow">
				<label class="label" for="{formId}-when">Send at</label>
				<input id="{formId}-when" type="datetime-local" bind:value={sendAt} />
			</div>
			<button class="btn primary" type="submit" disabled={!canSchedule}>
				<PaperPlaneTiltIcon size={14} weight="bold" /> Schedule
			</button>
		</div>
	</form>

	<h3 class="section-title">Scheduled</h3>

	{#if scheduled.length === 0}
		<div class="empty">
			<ClockIcon size={22} />
			<p>No scheduled alerts yet.</p>
		</div>
	{:else}
		<ul class="list">
			{#each scheduled as alert (alert.id)}
				<li class="item">
					<span class="item-text">
						<span class="item-alert">{alert.text}</span>
						<span class="item-when">
							<ClockIcon size={13} />
							{formatSendAt(alert.sendAt)}
						</span>
					</span>
					<button
						class="remove"
						type="button"
						onclick={() => onDelete?.(alert.id)}
						aria-label="Delete scheduled alert"
						title="Delete"
					>
						<XIcon size={15} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</Modal>

<style>
	.composer {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-bottom: 0.9rem;
		border-bottom: 1px solid var(--border);
	}
	.row {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}
	.field.grow {
		flex: 1 1 auto;
	}
	.label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-dim);
	}
	input[type='text'],
	input[type='datetime-local'] {
		width: 100%;
		box-sizing: border-box;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.45rem 0.55rem;
		font: inherit;
		font-size: 0.85rem;
	}
	input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.section-title {
		margin: 0.9rem 0 0.5rem;
		font-size: 0.74rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--text-dim);
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-dim);
		padding: 1.25rem 0;
		text-align: center;
	}
	.empty :global(svg) {
		opacity: 0.7;
	}
	.empty p {
		margin: 0;
		font-size: 0.88rem;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.55rem 0.65rem;
	}
	.item-text {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		flex: 1;
		min-width: 0;
	}
	.item-alert {
		font-size: 0.86rem;
		overflow-wrap: anywhere;
	}
	.item-when {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.76rem;
		color: var(--text-dim);
	}
	.remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-dim);
		border-radius: var(--radius);
		padding: 0.25rem;
		line-height: 0;
	}
	.remove:hover {
		color: var(--negative);
		border-color: var(--negative);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border-radius: var(--radius);
		padding: 0.45rem 0.95rem;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid var(--border);
		white-space: nowrap;
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
		font-weight: 600;
	}
	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--accent);
	}
	.btn.primary {
		flex: 0 0 auto;
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.btn.primary:hover:not(:disabled) {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
