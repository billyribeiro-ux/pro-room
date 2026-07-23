// Cross-tree "mention this user" bus. The roster's per-user ⋮ menu and the User
// Info modal live in a different component subtree from the chat composer, so a
// tiny rune-backed module store carries the request: the menus call `request(name)`
// and the composer (ChatPanel) reactively `take()`s it and splices "@name " at the
// caret — no prop-drilling through +page → AlertsChatDock → ChatPanel.
let pending = $state<string | null>(null);

export const mentionBus = {
	/** The display name awaiting insertion, or null. Read reactively by the composer. */
	get pending(): string | null {
		return pending;
	},
	/** Request that "@name " be inserted into the chat composer. */
	request(name: string): void {
		pending = name.trim() || null;
	},
	/** Take and clear the pending name — the composer calls this once it inserts. */
	take(): string | null {
		const n = pending;
		pending = null;
		return n;
	}
};
