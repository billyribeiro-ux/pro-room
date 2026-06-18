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

export interface Alert {
	id: string;
	room_id: string;
	author_id: string;
	symbol: string;
	side: string;
	note: string | null;
	created_at: string;
	author_name?: string;
	/** Author's delivery-intent flags from the Post Alert form (backend Option<bool>). */
	post_to_x: boolean | null;
	no_push: boolean | null;
}

export interface Message {
	id: string;
	room_id: string;
	author_id: string;
	body: string;
	channel: ChatChannel;
	created_at: string;
	author_name?: string;
	/** The author's effective room role; present on listed messages (MessageView)
	 * and merged onto live messages from the chat event. Clients style
	 * admin/super_admin messages distinctly (kebab on the right + grey row). */
	author_role?: Role;
}

export interface PresentUser {
	user_id: string;
	display_name: string;
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
	| { type: 'alert'; alert: Alert; author_name: string }
	| { type: 'chat'; message: Message; author_name: string; author_role: Role }
	| { type: 'private_message'; message: PrivateMessageView }
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
