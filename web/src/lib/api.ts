import { API_URL } from './config';

/** An error carrying the API's machine-readable code and HTTP status. */
export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

interface ErrorBody {
	error?: { code?: string; message?: string };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		method,
		// Send the session cookie on cross-origin (same-site) requests.
		credentials: 'include',
		headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body)
	});

	if (!res.ok) {
		let code = 'error';
		let message = res.statusText;
		try {
			const parsed = (await res.json()) as ErrorBody;
			code = parsed.error?.code ?? code;
			message = parsed.error?.message ?? message;
		} catch {
			// non-JSON error body; keep the status text
		}
		throw new ApiError(res.status, code, message);
	}

	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

export const api = {
	get: <T>(path: string) => request<T>('GET', path),
	post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
	patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
	delete: <T>(path: string) => request<T>('DELETE', path)
};
