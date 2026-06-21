import { WS_URL } from './config';
import { logEvent } from './stores/sessionLog.svelte';
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
		private onEvent: (event: RoomEvent) => void,
		/** Fired on a RE-connect (not the first connect) so the page can resync state
		    that was hydrated over HTTP — any alert/chat/poll broadcast during the
		    outage is otherwise lost (the socket only carries live frames). */
		private onReconnect?: () => void
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
			// Log before resetting #retry so a reconnect reads as one (reference parity:
			// I("Connected to server... is reconnect:")).
			const isReconnect = this.#retry > 0;
			logEvent(
				isReconnect
					? `WS reconnected to room ${this.roomId}`
					: `WS connected to room ${this.roomId}`
			);
			this.connected = true;
			this.#retry = 0;
			this.#startHeartbeat();
			// Resync HTTP-hydrated state to recover anything broadcast during the gap.
			if (isReconnect) this.onReconnect?.();
		};
		ws.onmessage = (ev) => {
			try {
				this.onEvent(JSON.parse(ev.data) as RoomEvent);
			} catch {
				// ignore malformed frames
			}
		};
		ws.onclose = () => {
			logEvent(this.#closed ? 'WS disconnected (closed by client)' : 'WS disconnected from server');
			this.connected = false;
			this.#stopHeartbeat();
			if (!this.#closed) this.#scheduleReconnect();
		};
		ws.onerror = () => {
			logEvent('WS error');
			ws.close();
		};
	}

	#scheduleReconnect(): void {
		const delay = Math.min(1000 * 2 ** this.#retry, 15000);
		logEvent(`WS reconnect scheduled in ${delay}ms (attempt ${this.#retry + 1})`);
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
