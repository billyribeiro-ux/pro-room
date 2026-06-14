import {
	LocalTrackPublication,
	Participant,
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
	/** Presenter camera feeds (local + remote), rendered in the webcam strip. */
	cameraPublishers = $state<SharePublisher[]>([]);
	connected = $state(false);
	publishing = $state(false);
	cameraPublishing = $state(false);
	/** Whether this user is publishing their microphone. */
	micPublishing = $state(false);
	/** Whether the published mic is currently muted (still published). */
	micMuted = $state(false);
	/** Identities of participants currently speaking (includes local). */
	activeSpeakers = $state<string[]>([]);
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
			.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
				// LiveKit includes the local participant when it's speaking.
				this.activeSpeakers = speakers
					.filter((s) => s.audioLevel > 0 || s.isSpeaking)
					.map((s) => s.identity);
			})
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

	/** Start publishing this user's camera (admins/super admins only). */
	async startCamera(): Promise<void> {
		if (!this.#room) return;
		try {
			await this.#room.localParticipant.setCameraEnabled(true);
			this.cameraPublishing = true;
			this.#refresh();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'failed to start camera';
		}
	}

	async stopCamera(): Promise<void> {
		if (!this.#room) return;
		await this.#room.localParticipant.setCameraEnabled(false);
		this.cameraPublishing = false;
		this.#refresh();
	}

	/** Start publishing this user's microphone (admins/super admins only). */
	async startMic(): Promise<void> {
		if (!this.#room) return;
		try {
			await this.#room.localParticipant.setMicrophoneEnabled(true);
			this.micPublishing = true;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'failed to start microphone';
		}
	}

	async stopMic(): Promise<void> {
		if (!this.#room) return;
		await this.#room.localParticipant.setMicrophoneEnabled(false);
		this.micPublishing = false;
		this.micMuted = false;
	}

	/** Mute/unmute the published mic without unpublishing it. No-op if unpublished. */
	async toggleMicMute(): Promise<void> {
		if (!this.#room) return;
		const pub = this.#room.localParticipant.getTrackPublication(Track.Source.Microphone);
		if (!pub) return;
		if (this.micMuted) {
			await pub.unmute();
			this.micMuted = false;
		} else {
			await pub.mute();
			this.micMuted = true;
		}
	}

	/** Whether the given participant identity is currently speaking. */
	isSpeaking(identity: string): boolean {
		return this.activeSpeakers.includes(identity);
	}

	async disconnect(): Promise<void> {
		await this.#room?.disconnect();
		this.#room = null;
		this.connected = false;
		this.publishing = false;
		this.cameraPublishing = false;
		this.micPublishing = false;
		this.micMuted = false;
		this.activeSpeakers = [];
		this.publishers = [];
		this.cameraPublishers = [];
	}

	/** Recompute the screen-share and camera publisher lists from room state. */
	#refresh(): void {
		const room = this.#room;
		if (!room) {
			this.publishers = [];
			this.cameraPublishers = [];
			return;
		}
		const screens: SharePublisher[] = [];
		const cams: SharePublisher[] = [];

		const collect = (
			pubs: Iterable<TrackPublication>,
			identity: string,
			name: string,
			isLocal: boolean
		) => {
			for (const pub of pubs) {
				if (!pub.track) continue;
				const entry = { identity, name: name || identity, isLocal, track: pub.track };
				if (pub.source === Track.Source.ScreenShare) {
					screens.push(entry);
				} else if (pub.source === Track.Source.Camera) {
					cams.push(entry);
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
		this.publishers = screens;
		this.cameraPublishers = cams;
	}
}

// Re-export for callers attaching tracks to elements.
export { RemoteTrack, Track };
