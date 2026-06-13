import {
	LocalTrackPublication,
	RemoteTrack,
	Room,
	RoomEvent,
	Track,
	type RemoteTrackPublication,
	type TrackPublication
} from 'livekit-client';

/** A participant currently sharing their screen, plus the attachable track. */
export interface SharePublisher {
	identity: string;
	name: string;
	isLocal: boolean;
	track: Track;
}

/**
 * Wraps a LiveKit `Room` and exposes reactive state for the screen-share stage:
 * the set of active publishers (for one/split layout) and whether we are
 * currently publishing. Multiple admins can publish simultaneously.
 */
export class ScreenShareRoom {
	publishers = $state<SharePublisher[]>([]);
	connected = $state(false);
	publishing = $state(false);
	error = $state<string | null>(null);

	#room: Room | null = null;

	async connect(url: string, token: string): Promise<void> {
		const room = new Room({ adaptiveStream: true, dynacast: true });
		room
			.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
				// Audio (presenter mic / screen audio) has no tile; attach a hidden
				// element so it plays. Video is rendered by the stage component.
				if (track.kind === 'audio') {
					const el = track.attach();
					el.style.display = 'none';
					document.body.appendChild(el);
				}
				this.#refresh();
			})
			.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
				if (track.kind === 'audio') {
					track.detach().forEach((el) => el.remove());
				}
				this.#refresh();
			})
			.on(RoomEvent.LocalTrackPublished, () => this.#refresh())
			.on(RoomEvent.LocalTrackUnpublished, () => this.#refresh())
			.on(RoomEvent.ParticipantConnected, () => this.#refresh())
			.on(RoomEvent.ParticipantDisconnected, () => this.#refresh())
			.on(RoomEvent.Disconnected, () => {
				this.connected = false;
				this.#refresh();
			});

		await room.connect(url, token);
		this.#room = room;
		this.connected = true;
		this.#refresh();
	}

	/** Start sharing this user's screen (admins/super admins only). */
	async startSharing(): Promise<void> {
		if (!this.#room) return;
		try {
			await this.#room.localParticipant.setScreenShareEnabled(true, { audio: true });
			this.publishing = true;
			this.#refresh();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'failed to start sharing';
		}
	}

	async stopSharing(): Promise<void> {
		if (!this.#room) return;
		await this.#room.localParticipant.setScreenShareEnabled(false);
		this.publishing = false;
		this.#refresh();
	}

	async disconnect(): Promise<void> {
		await this.#room?.disconnect();
		this.#room = null;
		this.connected = false;
		this.publishing = false;
		this.publishers = [];
	}

	/** Recompute the list of screen-share publishers from current room state. */
	#refresh(): void {
		const room = this.#room;
		if (!room) {
			this.publishers = [];
			return;
		}
		const found: SharePublisher[] = [];

		const collect = (
			pubs: Iterable<TrackPublication>,
			identity: string,
			name: string,
			isLocal: boolean
		) => {
			for (const pub of pubs) {
				if (pub.source === Track.Source.ScreenShare && pub.track) {
					found.push({ identity, name: name || identity, isLocal, track: pub.track });
				}
			}
		};

		const local = room.localParticipant;
		collect(
			local.trackPublications.values() as Iterable<LocalTrackPublication>,
			local.identity,
			local.name ?? local.identity,
			true
		);
		for (const p of room.remoteParticipants.values()) {
			collect(
				p.trackPublications.values() as Iterable<RemoteTrackPublication>,
				p.identity,
				p.name ?? p.identity,
				false
			);
		}
		this.publishers = found;
	}
}

// Re-export for callers attaching tracks to elements.
export { RemoteTrack, Track };
