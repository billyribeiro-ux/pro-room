/**
 * Message/alert reaction API helpers. Mirrors the backend reactions endpoints;
 * live updates arrive over the room WebSocket as `{ type: 'reaction', reaction }`.
 */
import { api } from './api';
import type { ReactionSummary, ReactionTarget } from './types';

/**
 * `POST /api/rooms/{roomId}/reactions` — toggles the emoji for the current user
 * on the target (adds if absent, removes if present). Returns the re-aggregated
 * summary for that target.
 */
export function toggleReaction(
	roomId: string,
	targetKind: ReactionTarget,
	targetId: string,
	emoji: string
): Promise<ReactionSummary> {
	return api.post<ReactionSummary>(`/api/rooms/${roomId}/reactions`, {
		target_kind: targetKind,
		target_id: targetId,
		emoji
	});
}

/** `GET /api/rooms/{roomId}/reactions?target_kind=&target_id=` — current tallies. */
export function listReactions(
	roomId: string,
	targetKind: ReactionTarget,
	targetId: string
): Promise<ReactionSummary> {
	return api.get<ReactionSummary>(
		`/api/rooms/${roomId}/reactions?target_kind=${targetKind}&target_id=${encodeURIComponent(targetId)}`
	);
}
