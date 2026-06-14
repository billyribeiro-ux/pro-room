<script lang="ts">
	import {
		PaperPlaneTiltIcon,
		UsersIcon,
		CheckCircleIcon,
		BellRingingIcon,
		EnvelopeOpenIcon,
		InfoIcon
	} from 'phosphor-svelte';
	import Modal from '../Modal.svelte';

	interface Stats {
		recipients: number;
		delivered: number;
		push: number;
		opened: number;
	}

	interface Props {
		open: boolean;
		onClose: () => void;
		alertId?: string;
		stats?: Stats;
	}

	// PLACEHOLDER STATS — the real send-report payload (delivery summary, push/open
	// counts) is fetched from the alert-delivery API and wired in later. These
	// defaults render the loaded layout with representative numbers until then.
	const placeholderStats: Stats = { recipients: 0, delivered: 0, push: 0, opened: 0 };

	let { open, onClose, alertId, stats = placeholderStats }: Props = $props();

	// Reference title: "Alert Sent Report. AlertID: <id>". When no id is supplied
	// we fall back to an em dash so the colon never dangles.
	const title = $derived(`Alert Sent Report. AlertID: ${alertId ?? '—'}`);

	type Metric = {
		key: keyof Stats;
		label: string;
		icon: typeof PaperPlaneTiltIcon;
		tone: 'neutral' | 'positive';
	};

	const metrics: Metric[] = [
		{ key: 'recipients', label: 'Recipients', icon: UsersIcon, tone: 'neutral' },
		{ key: 'delivered', label: 'Delivered', icon: CheckCircleIcon, tone: 'positive' },
		{ key: 'push', label: 'Push sent', icon: BellRingingIcon, tone: 'neutral' },
		{ key: 'opened', label: 'Opened', icon: EnvelopeOpenIcon, tone: 'positive' }
	];

	const numberFormat = new Intl.NumberFormat();
	const formatted = $derived(metrics.map((m) => ({ ...m, value: numberFormat.format(stats[m.key]) })));
</script>

{#snippet footer()}
	<button class="btn ghost" type="button" onclick={onClose}>Close</button>
{/snippet}

<Modal {open} {onClose} {title} {footer}>
	<div class="summary">
		<PaperPlaneTiltIcon size={20} />
		<p>Delivery report for this alert across in-app, push, and email channels.</p>
	</div>

	<ul class="stats">
		{#each formatted as metric (metric.key)}
			<li class="card {metric.tone}">
				<span class="icon" aria-hidden="true">
					<metric.icon size={18} />
				</span>
				<span class="value">{metric.value}</span>
				<span class="label">{metric.label}</span>
			</li>
		{/each}
	</ul>

	<p class="note">
		<InfoIcon size={15} />
		<span>Showing placeholder figures — live delivery data wires in later.</span>
	</p>
</Modal>

<style>
	.summary {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		color: var(--text-dim);
	}
	.summary :global(svg) {
		color: var(--accent);
		flex: 0 0 auto;
		margin-top: 0.15rem;
	}
	.summary p {
		margin: 0;
	}
	.stats {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.85rem 0.9rem;
	}
	.icon {
		display: inline-flex;
		color: var(--text-dim);
	}
	.card.positive .icon {
		color: var(--positive);
	}
	.value {
		font-size: 1.45rem;
		font-weight: 700;
		line-height: 1.1;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}
	.label {
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.note {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin: 1rem 0 0;
		font-size: 0.8rem;
		color: var(--text-dim);
	}
	.note :global(svg) {
		flex: 0 0 auto;
		color: var(--accent);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border-radius: var(--radius);
		padding: 0.5rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid var(--border);
	}
	.btn.ghost {
		background: transparent;
		color: var(--text-dim);
	}
	.btn.ghost:hover {
		color: var(--text);
		border-color: var(--accent);
	}
</style>
