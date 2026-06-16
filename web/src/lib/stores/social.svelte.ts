// Client-side muted + followed user lists, per-device (localStorage) — mirrors the
// reference protradingroom app, where `globals.mutedUsers` / `globals.followedUsers`
// are kept locally (keyed per user) and chat is filtered client-side. There is NO
// backend for these (confirmed from the app bundle: manageMutedUsers /
// manageFollowedUsers just read/write a local list); muting hides that user's chat
// messages on this device only.

export interface SocialUser {
	id: string;
	name: string;
}

const MUTED_KEY = 'ptr.social.muted';
const FOLLOWED_KEY = 'ptr.social.followed';

function load(key: string): SocialUser[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const v = JSON.parse(localStorage.getItem(key) ?? '[]');
		return Array.isArray(v) ? v.filter((u) => u && typeof u.id === 'string') : [];
	} catch {
		return [];
	}
}

/** A reactive, localStorage-persisted set of users (by id), with display name. */
class UserList {
	#key: string;
	users = $state<SocialUser[]>([]);

	constructor(key: string) {
		this.#key = key;
		this.users = load(key);
	}

	#persist() {
		try {
			localStorage.setItem(this.#key, JSON.stringify(this.users));
		} catch {
			// localStorage can throw (private mode / quota) — the in-memory list still works.
		}
	}

	has(id: string | undefined | null): boolean {
		return !!id && this.users.some((u) => u.id === id);
	}

	/** Add the user if absent, remove if present. No-op without an id. */
	toggle(user: { user_id?: string; display_name?: string } | undefined): void {
		const id = user?.user_id;
		if (!id) return;
		this.users = this.has(id)
			? this.users.filter((u) => u.id !== id)
			: [...this.users, { id, name: user?.display_name?.trim() || id }];
		this.#persist();
	}

	remove(id: string): void {
		this.users = this.users.filter((u) => u.id !== id);
		this.#persist();
	}
}

export const muted = new UserList(MUTED_KEY);
export const followed = new UserList(FOLLOWED_KEY);
