/**
 * Alert Q&A wire types + thin API helpers.
 *
 * Mirrors the backend `domain::entities::Question` serde shape exactly
 * (snake_case fields, UUID ids serialised as strings via `#[serde(transparent)]`,
 * rfc3339 timestamps, nullable `answer`/`answered_by`/`answered_at`) and the
 * three endpoints in `server/crates/server/src/http/questions.rs`.
 */
import { api } from './api';

/** A question threaded against a trade alert. Mirrors `domain::entities::Question`. */
export interface Question {
	id: string;
	alert_id: string;
	room_id: string;
	author_id: string;
	/** Author's display name (joined from users) — shown instead of the UUID. */
	author_name: string;
	body: string;
	answer: string | null;
	answered_by: string | null;
	resolved: boolean;
	created_at: string;
	answered_at: string | null;
}

/** `GET /api/rooms/{roomId}/alerts/{alertId}/questions` — oldest first. */
export function listQuestions(roomId: string, alertId: string): Promise<Question[]> {
	return api.get<Question[]>(`/api/rooms/${roomId}/alerts/${alertId}/questions`);
}

/** `POST /api/rooms/{roomId}/alerts/{alertId}/questions` — body `{ body }`. */
export function postQuestion(roomId: string, alertId: string, body: string): Promise<Question> {
	return api.post<Question>(`/api/rooms/${roomId}/alerts/${alertId}/questions`, { body });
}

/** `POST /api/rooms/{roomId}/questions/{questionId}/resolve` — body `{ answer }`. */
export function resolveQuestion(
	roomId: string,
	questionId: string,
	answer: string
): Promise<Question> {
	return api.post<Question>(`/api/rooms/${roomId}/questions/${questionId}/resolve`, { answer });
}
