<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { ApiError } from '$lib/api';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ChartLineUp } from 'phosphor-svelte';

	let displayName = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		busy = true;
		try {
			await auth.register(email, password, displayName);
			await goto(resolve('/rooms'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed';
		} finally {
			busy = false;
		}
	}
</script>

<div class="shell">
	<div class="card">
		<div class="head">
			<ChartLineUp size={28} weight="bold" />
			<h1>Create account</h1>
		</div>

		{#if error}<p class="error">{error}</p>{/if}

		<form onsubmit={submit}>
			<label>
				Display name
				<input bind:value={displayName} required />
			</label>
			<label>
				Email
				<input type="email" bind:value={email} autocomplete="username" required />
			</label>
			<label>
				Password
				<input
					type="password"
					bind:value={password}
					autocomplete="new-password"
					minlength="8"
					required
				/>
			</label>
			<button class="primary" type="submit" disabled={busy}>
				{busy ? 'Creating…' : 'Create account'}
			</button>
		</form>

		<p class="foot">Already registered? <a href={resolve('/login')}>Sign in</a></p>
	</div>
</div>

<style>
	.shell {
		display: flex;
		justify-content: center;
		margin-top: 4rem;
	}
	.card {
		width: 100%;
		max-width: 380px;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.75rem;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 1.25rem;
	}
	.head :global(svg) {
		color: var(--accent);
	}
	h1 {
		margin: 0;
		font-size: 1.4rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: var(--text-dim);
	}
	input {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.6rem 0.7rem;
		color: var(--text);
	}
	input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.primary {
		border-radius: 8px;
		padding: 0.6rem;
		border: 1px solid var(--accent);
		background: var(--accent);
		color: #fff;
		font-weight: 600;
	}
	.primary:hover {
		background: var(--accent-hover);
	}
	.foot {
		text-align: center;
		margin: 1.25rem 0 0;
		font-size: 0.85rem;
		color: var(--text-dim);
	}
	.error {
		background: color-mix(in srgb, var(--negative) 15%, transparent);
		border: 1px solid var(--negative);
		color: #ffd7da;
		padding: 0.5rem 0.7rem;
		border-radius: 8px;
		font-size: 0.85rem;
	}
</style>
