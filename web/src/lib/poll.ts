/**
 * Poll wire types + thin API helpers.
 *
 * Mirrors the backend `PollDetail` serde shape exactly (snake_case fields,
 * UUID ids serialised as strings, rfc3339 `created_at`) and the four endpoints
 * the rooms poll feature exposes. Live updates for a poll arrive over the room
 * WebSocket as a `{ type: 'poll', poll: PollDetail }` event — the `PollEvent`
 * type is exported so the +page route can fold it into its WS handler.
 */
import { api } from './api';

/** One option's tallied result within a poll. */
export interface PollOptionResult {
	id: string;
	label: string;
	position: number;
	votes: number;
}

/** Lifecycle of a poll. */
export type PollStatus = 'open' | 'closed';

/** A poll with its options and current tallies. Mirrors the backend `PollDetail`. */
export interface PollDetail {
	id: string;
	room_id: string;
	author_id: string;
	question: string;
	anonymous: boolean;
	status: PollStatus;
	created_at: string;
	options: PollOptionResult[];
	total_votes: number;
}

/** Realtime poll event pushed over the room WebSocket (discriminated by `type`). */
export type PollEvent = { type: 'poll'; poll: PollDetail };

/** Body for `POST /api/rooms/{roomId}/polls`. */
export interface CreatePollInput {
	question: string;
	options: string[];
	anonymous: boolean;
}

/** `POST /api/rooms/{roomId}/polls` — creates a poll, returns the new `PollDetail`. */
export function createPoll(roomId: string, input: CreatePollInput): Promise<PollDetail> {
	return api.post<PollDetail>(`/api/rooms/${roomId}/polls`, input);
}

/** `GET /api/rooms/{roomId}/polls` — active polls for the room. */
export function listPolls(roomId: string): Promise<PollDetail[]> {
	return api.get<PollDetail[]>(`/api/rooms/${roomId}/polls`);
}

/** `POST /api/rooms/{roomId}/polls/{pollId}/vote` — body `{ option_id }`. */
export function votePoll(roomId: string, pollId: string, optionId: string): Promise<PollDetail> {
	return api.post<PollDetail>(`/api/rooms/${roomId}/polls/${pollId}/vote`, { option_id: optionId });
}

/** `POST /api/rooms/{roomId}/polls/{pollId}/close` — closes the poll. */
export function closePoll(roomId: string, pollId: string): Promise<PollDetail> {
	return api.post<PollDetail>(`/api/rooms/${roomId}/polls/${pollId}/close`);
}
