/**
 * Frontend validation schemas (valibot).
 *
 * valibot is the project's validation library for all user/untrusted input on
 * the frontend (form fields, persisted localStorage, etc.). Keep schemas small
 * and composable; surface the first issue message to the UI.
 */
import * as v from 'valibot';

/** `#rgb` or `#rrggbb` (case-insensitive). */
export const HexColorSchema = v.pipe(
	v.string(),
	v.trim(),
	v.regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a hex colour like #45a2ff')
);

/** Message font size in px — bounded so the UI can't be made unusable. */
export const FontSizePxSchema = v.pipe(
	v.number('Enter a number'),
	v.integer('Whole numbers only'),
	v.minValue(10, 'Minimum 10px'),
	v.maxValue(28, 'Maximum 28px')
);

/**
 * Alert Q&A question body. Mirrors the server cap (`MAX_BODY_LEN = 2000`) and
 * its required/trimmed check in `http/questions.rs`.
 */
export const QuestionBodySchema = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(1, 'Question is required'),
	v.maxLength(2000, 'Question is too long')
);

/**
 * Alert Q&A answer. Mirrors the server cap (`MAX_ANSWER_LEN = 4000`) and its
 * required/trimmed check in `http/questions.rs`.
 */
export const AnswerSchema = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(1, 'Answer is required'),
	v.maxLength(4000, 'Answer is too long')
);

/**
 * Poll question. Trimmed, required, capped at 280 chars (matches the backend
 * `polls` contract for `question`).
 */
export const PollQuestionSchema = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(1, 'Question is required'),
	v.maxLength(280, 'Question is too long (max 280)')
);

/** A single poll option label. Trimmed, required, capped at 80 chars. */
export const PollOptionSchema = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(1, 'Option is required'),
	v.maxLength(80, 'Option is too long (max 80)')
);

/**
 * The full set of poll options: at least 2, at most 10, each a valid
 * (trimmed, 1–80) label. Each element is validated through `PollOptionSchema`,
 * so the output array is already trimmed.
 */
export const PollOptionsSchema = v.pipe(
	v.array(PollOptionSchema),
	v.minLength(2, 'Add at least 2 options'),
	v.maxLength(10, 'No more than 10 options')
);

/** The shape produced by a successful create-poll form validation. */
export interface PollCreateInput {
	question: string;
	options: string[];
}

/**
 * Validate a whole create-poll form. Returns the normalised
 * `{ question, options }` on success, or the first human-readable issue
 * string on failure. The question is validated first so its message wins
 * when both are invalid.
 */
export function validatePollCreate(
	question: string,
	options: string[]
): { ok: true; value: PollCreateInput } | { ok: false; issue: string } {
	const q = v.safeParse(PollQuestionSchema, question);
	if (!q.success) return { ok: false, issue: firstIssue(q) ?? 'Invalid question' };

	const o = v.safeParse(PollOptionsSchema, options);
	if (!o.success) return { ok: false, issue: firstIssue(o) ?? 'Invalid options' };

	return { ok: true, value: { question: q.output, options: o.output } };
}

/** First human-readable issue from a failed safeParse, or null when valid. */
export function firstIssue<TSchema extends v.GenericSchema>(
	result: v.SafeParseResult<TSchema>
): string | null {
	return result.success ? null : (result.issues[0]?.message ?? 'Invalid value');
}

/** Validate a hex colour, returning the normalised value or null. */
export function parseHexColor(value: string): string | null {
	const result = v.safeParse(HexColorSchema, value);
	return result.success ? result.output : null;
}

/** Validate a font size in px, returning the value or null. */
export function parseFontSizePx(value: number): number | null {
	const result = v.safeParse(FontSizePxSchema, value);
	return result.success ? result.output : null;
}
