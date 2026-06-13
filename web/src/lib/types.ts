// Wire types mirroring the Rust API's JSON responses.

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
}

export interface Message {
	id: string;
	room_id: string;
	author_id: string;
	body: string;
	channel: ChatChannel;
	created_at: string;
	author_name?: string;
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

// Realtime events pushed over the room WebSocket (discriminated by `type`).
export type RoomEvent =
	| { type: 'alert'; alert: Alert; author_name: string }
	| { type: 'chat'; message: Message; author_name: string }
	| { type: 'presence'; users: PresentUser[] }
	| { type: 'live'; is_live: boolean };
