import { api } from '$lib/api';
import type { Me } from '$lib/types';

/**
 * Global authentication state. Backed by Svelte 5 runes so any component that
 * reads `auth.user` re-renders when the session changes.
 */
class AuthStore {
	me = $state<Me | null>(null);
	/** True until the first `refresh()` resolves, so guards can wait. */
	loading = $state(true);

	get user() {
		return this.me?.user ?? null;
	}

	/** Whether the current user globally holds a permission (e.g. `user.manage`). */
	can(permission: string): boolean {
		return this.me?.permissions.includes(permission) ?? false;
	}

	/** Resolve the current session from the API; clears state on 401. */
	async refresh(): Promise<void> {
		try {
			this.me = await api.get<Me>('/api/auth/me');
		} catch {
			this.me = null;
		} finally {
			this.loading = false;
		}
	}

	async login(email: string, password: string): Promise<void> {
		this.me = await api.post<Me>('/api/auth/login', { email, password });
	}

	async register(email: string, password: string, displayName: string): Promise<void> {
		this.me = await api.post<Me>('/api/auth/register', {
			email,
			password,
			display_name: displayName
		});
	}

	async logout(): Promise<void> {
		await api.post('/api/auth/logout');
		this.me = null;
	}
}

export const auth = new AuthStore();
