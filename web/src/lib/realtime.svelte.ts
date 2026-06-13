import { WS_URL } from './config';
import type { RoomEvent } from './types';

/**
 * Manages the per-room WebSocket: delivers parsed `RoomEvent`s to a handler,
 * sends periodic heartbeats so the server keeps the user in presence, and
 * reconnects with backoff if the socket drops while the page is open.
 */
export class RoomSocket {
	connected = $state(false);

	#ws: WebSocket | null = null;
	#heartbeat: ReturnType<typeof setInterval> | null = null;
	#closed = false;
	#retry = 0;

	constructor(
		private roomId: string,
		private onEvent: (event: RoomEvent) => void
	) {}

	open(): void {
		this.#closed = false;
		this.#connect();
	}

	close(): void {
		this.#closed = true;
		this.#stopHeartbeat();
		this.#ws?.close();
		this.#ws = null;
		this.connected = false;
	}

	#connect(): void {
		const ws = new WebSocket(`${WS_URL}/api/rooms/${this.roomId}/ws`);
		this.#ws = ws;

		ws.onopen = () => {
			this.connected = true;
			this.#retry = 0;
			this.#startHeartbeat();
		};
		ws.onmessage = (ev) => {
			try {
				this.onEvent(JSON.parse(ev.data) as RoomEvent);
			} catch {
				// ignore malformed frames
			}
		};
		ws.onclose = () => {
			this.connected = false;
			this.#stopHeartbeat();
			if (!this.#closed) this.#scheduleReconnect();
		};
		ws.onerror = () => ws.close();
	}

	#scheduleReconnect(): void {
		const delay = Math.min(1000 * 2 ** this.#retry, 15000);
		this.#retry += 1;
		setTimeout(() => {
			if (!this.#closed) this.#connect();
		}, delay);
	}

	#startHeartbeat(): void {
		this.#heartbeat = setInterval(() => {
			this.#ws?.send('ping');
		}, 10000);
	}

	#stopHeartbeat(): void {
		if (this.#heartbeat) {
			clearInterval(this.#heartbeat);
			this.#heartbeat = null;
		}
	}
}
