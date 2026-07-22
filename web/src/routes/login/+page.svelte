<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { api, ApiError } from '$lib/api';
	import { API_URL } from '$lib/config';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';

	/** Local Docker seed account — DEV only (see scripts/seed-dev-users.sh). */
	const DEV_LOGIN = {
		email: 'demo@proroom.local',
		password: 'Demo1234!'
	} as const;

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let magicSent = $state(false);
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		busy = true;
		try {
			// Trim email only — password is used as-typed (server does not trim).
			await auth.login(email.trim(), password);
			await goto(resolve('/rooms'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Sign in failed';
		} finally {
			busy = false;
		}
	}

	/** One-click fill + sign-in so local testing cannot mistype seed credentials. */
	async function devLogin() {
		if (!import.meta.env.DEV) return;
		email = DEV_LOGIN.email;
		password = DEV_LOGIN.password;
		error = null;
		busy = true;
		try {
			await auth.login(DEV_LOGIN.email, DEV_LOGIN.password);
			await goto(resolve('/rooms'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Sign in failed';
		} finally {
			busy = false;
		}
	}

	async function sendMagicLink() {
		error = null;
		if (!email) {
			error = 'Enter your email first';
			return;
		}
		try {
			await api.post('/api/auth/magic/request', { email });
			magicSent = true;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not send link';
		}
	}

	function oauth(provider: 'google' | 'github') {
		// Empty API_URL (dev proxy) → same-origin path.
		window.location.href = `${API_URL}/api/auth/oauth/${provider}/start?redirect_to=/rooms`;
	}
</script>

<div class="shell">
	<div class="card">
		<div class="head">
			<Icon name="chart-line" size={28} />
			<h1>Sign in</h1>
		</div>

		{#if import.meta.env.DEV}
			<div class="dev-box">
				<strong>Local dev login</strong>
				<code>{DEV_LOGIN.email}</code>
				<code>{DEV_LOGIN.password}</code>
				<button type="button" class="dev-btn" onclick={devLogin} disabled={busy}>
					{busy ? 'Signing in…' : 'Fill & sign in as demo admin'}
				</button>
				<p class="dev-hint">API base: {API_URL === '' ? '(same-origin /api via Vite proxy)' : API_URL}</p>
			</div>
		{/if}

		{#if error}<p class="error">{error}</p>{/if}
		{#if magicSent}<p class="ok">Check your email for a sign-in link.</p>{/if}

		<form onsubmit={submit}>
			<label>
				Email
				<input type="email" bind:value={email} autocomplete="username" required />
			</label>
			<label>
				Password
				<input
					type="password"
					bind:value={password}
					autocomplete={import.meta.env.DEV ? 'off' : 'current-password'}
					required
				/>
			</label>
			<button class="primary" type="submit" disabled={busy}>
				{busy ? 'Signing in…' : 'Sign in'}
			</button>
		</form>

		<button class="ghost" onclick={sendMagicLink}>
			<Icon name="envelope" size={18} /> Email me a magic link
		</button>

		<div class="divider"><span>or</span></div>

		<div class="oauth">
			<button onclick={() => oauth('google')}
				><Icon name="google" size={18} family="brands" /> Google</button
			>
			<button onclick={() => oauth('github')}
				><Icon name="github" size={18} family="brands" /> GitHub</button
			>
		</div>

		<p class="foot">No account? <a href={resolve('/register')}>Create one</a></p>
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
	.head :global(svg),
	.head :global(i) {
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
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		border-radius: 8px;
		padding: 0.6rem;
		border: 1px solid var(--border);
		background: var(--bg-elev-2);
		color: var(--text);
		font-weight: 600;
	}
	.primary {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}
	.primary:hover {
		background: var(--accent-hover);
	}
	.ghost {
		width: 100%;
		margin-top: 0.85rem;
		background: transparent;
		color: var(--text-dim);
	}
	.ghost:hover {
		color: var(--text);
	}
	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		color: var(--text-dim);
		font-size: 0.8rem;
		margin: 1rem 0;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}
	.divider span {
		padding: 0 0.6rem;
	}
	.oauth {
		display: flex;
		gap: 0.6rem;
	}
	.oauth button {
		flex: 1;
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
	.ok {
		background: color-mix(in srgb, var(--positive) 15%, transparent);
		border: 1px solid var(--positive);
		color: #c6ffe9;
		padding: 0.5rem 0.7rem;
		border-radius: 8px;
		font-size: 0.85rem;
	}
	.dev-box {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 1rem;
		padding: 0.75rem 0.85rem;
		border-radius: 8px;
		border: 1px dashed color-mix(in srgb, var(--accent) 55%, var(--border));
		background: color-mix(in srgb, var(--accent) 10%, transparent);
		font-size: 0.8rem;
	}
	.dev-box strong {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-dim);
	}
	.dev-box code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85rem;
		color: var(--text);
		user-select: all;
	}
	.dev-btn {
		margin-top: 0.35rem;
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
		font-weight: 600;
	}
	.dev-btn:hover {
		background: var(--accent-hover);
	}
	.dev-hint {
		margin: 0.25rem 0 0;
		color: var(--text-dim);
		font-size: 0.72rem;
	}
</style>
