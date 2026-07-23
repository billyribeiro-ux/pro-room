// Wire types mirroring the Rust API's JSON responses.

import type { PollDetail } from './poll';

export type Role = 'member' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended';
export type Visibility = 'public' | 'private';

export interface PublicUser {
	id: string;
	email: string;
	display_name: string;
	global_role: Role;
}

export interface Me {
	user: PublicUser;
	permissions: string[];
}

export interface User {
	id: string;
	email: string;
	display_name: string;
	global_role: Role;
	status: UserStatus;
	created_at: string;
}

export interface Room {
	id: string;
	slug: string;
	name: string;
	owner_id: string;
	visibility: Visibility;
	is_live: boolean;
	created_at: string;
}

export interface RoomCapabilities {
	can_manage_room: boolean;
	can_manage_members: boolean;
	can_post_alert: boolean;
	can_publish_screen: boolean;
	can_post_message: boolean;
}

export interface RoomDetail {
	room: Room;
	your_role: Role | null;
	is_member: boolean;
	/** The caller's own user id — used to mark own messages and target PMs. */
	viewer_id: string;
	capabilities: RoomCapabilities;
}

export interface MemberView {
	user_id: string;
	email: string;
	display_name: string;
	role: Role;
	joined_at: string;
}

export type ChatChannel = 'main' | 'off_topic';

/** A registry badge. Rendered as an <img> when image_url is set, else a coloured
 * text pill (label on bg_color/text_color — admin-set, so theme-configurable). */
export interface Badge {
	id: string;
	slug: string;
	label: string;
	image_url: string | null;
	bg_color: string;
	text_color: string;
	position: number;
}

/** The author badge data attached to a message/alert (mirrors the reference's
 * per-message badges + isFT/isNew/years). */
export interface AuthorBadges {
	badges: Badge[];
	is_trial: boolean;
	is_new: boolean;
	years: number | null;
}

export interface Alert {
	id: string;
	room_id: string;
	author_id: string;
	symbol: string;
	side: string;
	note: string | null;
	created_at: string;
	author_name?: string;
	/** Author's Gravatar URL (server-derived) — the message-row `img` avatar. */
	author_avatar?: string;
	/** Author's delivery-intent flags from the Post Alert form (backend Option<bool>). */
	post_to_x: boolean | null;
	no_push: boolean | null;
	/** Author's badges + trial/new/tenure indicators, rendered next to the name. */
	author_badges?: AuthorBadges;
	/** Per-author custom row background colour (users.msg_bg_color, `#rrggbb` or null).
	 * P1-1: present → row inline bg + inverted username/timestamp/kebab. */
	author_bg_color?: string | null;
	/** Per-author custom body/name text colour (users.msg_text_color, `#rrggbb` or null).
	 * P1-1: present → name-block wrapper, QA button, and body inline colour. */
	author_text_color?: string | null;
}

export interface Message {
	id: string;
	room_id: string;
	author_id: string;
	body: string;
	channel: ChatChannel;
	created_at: string;
	author_name?: string;
	/** Author's Gravatar URL (server-derived) — the message-row `img` avatar. */
	author_avatar?: string;
	/** The author's effective room role; present on listed messages (MessageView)
	 * and merged onto live messages from the chat event. Clients style
	 * admin/super_admin messages distinctly (kebab on the right + grey row). */
	author_role?: Role;
	/** Author's badges + trial/new/tenure indicators, rendered next to the name. */
	author_badges?: AuthorBadges;
	/** Per-author custom row background colour (users.msg_bg_color, `#rrggbb` or null).
	 * P1-1: present → row inline bg + inverted username/timestamp/kebab. */
	author_bg_color?: string | null;
	/** Per-author custom body/name text colour (users.msg_text_color, `#rrggbb` or null).
	 * P1-1: present → name-block wrapper and body inline colour. */
	author_text_color?: string | null;
}

/** One admin-only alert-log entry (from the ManageMembers-gated `/alert-logs`
 * endpoint) — includes the author's email, which only admins ever receive. */
export interface AlertLogEntry {
	id: string;
	created_at: string;
	author_name: string;
	author_email: string;
}

/** One admin-only chat-log entry (from the ManageMembers-gated `/chat-logs`
 * endpoint, all channels) — includes the author's email (admins only). */
export interface ChatLogEntry {
	id: string;
	created_at: string;
	channel: ChatChannel;
	author_name: string;
	author_email: string;
}

export interface PresentUser {
	user_id: string;
	display_name: string;
	/** Gravatar URL derived server-side from the user's email (`d=mm` fallback) —
	 * the roster's `img.rosterImg` avatar. */
	avatar_url?: string;
	/** Staff/presenter (effective role above member) → reference `.presUser` row. */
	is_presenter?: boolean;
	/** Badge cluster (custom badges + trial/new/tenure), rendered next to the name
	 * with the shared `Badges` component — same data as message/alert authors. */
	author_badges?: AuthorBadges;
}

export interface Note {
	id: string;
	room_id: string;
	title: string;
	body: string;
	position: number;
	created_at: string;
	updated_at: string;
}

export type FileCategory = 'file' | 'image' | 'sound';

export interface RoomFile {
	id: string;
	room_id: string;
	filename: string;
	content_type: string;
	size_bytes: number;
	category: FileCategory;
	created_at: string;
	download_url: string;
}

export interface LiveKitToken {
	url: string;
	token: string;
	can_publish: boolean;
}

/** Aggregated reactions for one target (message or alert). */
export interface ReactionTally {
	emoji: string;
	count: number;
	mine: boolean;
}
export type ReactionTarget = 'message' | 'alert';
export interface ReactionSummary {
	room_id: string;
	target_kind: ReactionTarget;
	target_id: string;
	reactions: ReactionTally[];
}

/** Presenter media-for-all broadcast to the whole room. `soundcloud`/`youtube`
 * play in a cross-origin iframe; `mp3`/`video` are direct files played in a
 * native `<audio>`/`<video>` element; `stop` clears the current playback. */
export type MediaKind = 'soundcloud' | 'youtube' | 'mp3' | 'video' | 'stop';

/** One online member as seen by an admin (GET /rooms/{id}/presence). Admin-only:
 * the public `presence` WS broadcast never carries ip/location. */
export interface PresenceEntry {
	user_id: string;
	display_name: string;
	role: Role;
	ip: string | null;
	location: string | null;
}

// Realtime events pushed over the room WebSocket (discriminated by `type`).
/** A 1:1 private message (matches the Rust `PrivateMessageView`). */
export interface PrivateMessageView {
	id: string;
	room_id: string;
	sender_id: string;
	recipient_id: string;
	body: string;
	created_at: string;
	sender_name: string;
	recipient_name: string;
}

/** One PM conversation summary for the inbox (matches `PrivateThreadSummary`). */
export interface PrivateThreadSummary {
	peer_id: string;
	peer_name: string;
	last_body: string;
	last_at: string;
}

export type RoomEvent =
	| {
			type: 'alert';
			alert: Alert;
			author_name: string;
			author_avatar?: string;
			author_badges?: AuthorBadges;
			/** P1-1 per-author colours, carried on the live alert event (same join as
			 * author_name) — merged onto the feed item like author_avatar. */
			author_bg_color?: string | null;
			author_text_color?: string | null;
	  }
	| {
			type: 'chat';
			message: Message;
			author_name: string;
			author_avatar?: string;
			author_role: Role;
			author_badges?: AuthorBadges;
			/** P1-1 per-author colours, carried on the live chat event (same join as
			 * author_name) — merged onto the message item like author_avatar. */
			author_bg_color?: string | null;
			author_text_color?: string | null;
	  }
	// P1-2 typing indicator: ephemeral, room-wide, never persisted. The server
	// fans out one frame per typing keystroke (throttled client-side ≥2s); the FE
	// shows `display_name` for ~3s after the last event and ignores its own.
	| { type: 'typing'; user_id: string; display_name: string }
	| { type: 'private_message'; message: PrivateMessageView }
	| { type: 'caption'; speaker_name: string; text: string }
	| { type: 'presence'; users: PresentUser[] }
	| { type: 'live'; is_live: boolean }
	| { type: 'poll'; poll: PollDetail }
	| { type: 'reaction'; reaction: ReactionSummary }
	| { type: 'media'; kind: MediaKind; url?: string }
	// Admin moderation broadcasts.
	| { type: 'kicked'; user_id: string; message?: string }
	| { type: 'mute_all'; muted: boolean }
	| { type: 'chat_cleared' }
	| { type: 'room_locked'; locked: boolean }
	// Presenter "lock this screen": holds non-admin viewers on the Screens tab.
	| { type: 'screen_locked'; locked: boolean }
	| { type: 'message_deleted'; id: string }
	| { type: 'alert_deleted'; id: string };
