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
import { logEvent } from './stores/sessionLog.svelte';

/** A participant currently sharing their screen, plus the attachable track. */
export interface SharePublisher {
	identity: string;
	name: string;
	isLocal: boolean;
	track: Track;
}

/**
 * Turn a getUserMedia/getDisplayMedia/device error into an ACTIONABLE message.
 * Without this, a blocked mic just throws "failed to start microphone" (or is
 * swallowed) and the control looks dead — the user has no idea permission was
 * denied. `what` is the human label ("Microphone", "Camera", "Screen share").
 */
function avErrorMessage(e: unknown, what: string): string {
	const name = e instanceof Error ? e.name : '';
	switch (name) {
		case 'NotAllowedError':
		case 'SecurityError':
			return `${what} access was blocked. Click the camera/mic icon in your browser's address bar (or Site settings), allow it, then try again.`;
		case 'NotFoundError':
		case 'DevicesNotFoundError':
			return `No ${what.toLowerCase()} device found. Connect one (or check it isn't disabled) and try again.`;
		case 'NotReadableError':
		case 'TrackStartError':
			return `Your ${what.toLowerCase()} is in use by another app. Close that app and try again.`;
		case 'OverconstrainedError':
			return `The selected ${what.toLowerCase()} device isn't available. Pick another in Audio/Video Settings.`;
		case 'AbortError':
			return `${what} could not start (the request was interrupted). Try again.`;
		default:
			return e instanceof Error && e.message
				? `${what}: ${e.message}`
				: `Could not start ${what.toLowerCase()}.`;
	}
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
	/** True when the browser blocked autoplay of remote audio (presenter mic /
	    screen audio). The first in-room user gesture calls resumeAudio() to unlock. */
	audioBlocked = $state(false);

	#room: Room | null = null;
	/** When sharing via an external encoder (OBS Virtual Camera / XSplit VCam), the
	   feed is a getUserMedia video track published with the ScreenShare source, so it
	   renders in the main stage like a browser share. Tracked here so stopSharing can
	   unpublish it and release the device. Null when sharing via the browser. */
	#externalPub: LocalTrackPublication | null = null;
	#externalStream: MediaStream | null = null;

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
			.on(RoomEvent.AudioPlaybackStatusChanged, () => {
				// The browser blocks autoplay of remote audio (presenter mic / screen
				// audio) until the user gestures. Surface it so the first in-room click
				// can unlock it via resumeAudio() — otherwise listeners hear nothing.
				this.audioBlocked = this.#room ? !this.#room.canPlaybackAudio : false;
			})
			.on(RoomEvent.Disconnected, () => {
				logEvent('LiveKit disconnected');
				this.connected = false;
				this.#refresh();
			});

		logEvent('LiveKit connecting');
		await room.connect(url, token);
		this.#room = room;
		this.connected = true;
		this.audioBlocked = !room.canPlaybackAudio;
		logEvent('LiveKit connected');
		this.#refresh();
	}

	/**
	 * Resume blocked remote-audio playback. MUST be called from a user-gesture
	 * handler (click/tap) or the browser re-blocks it. Members never publish, so
	 * without this the presenter's mic is silently autoplay-blocked for them.
	 */
	async resumeAudio(): Promise<void> {
		if (!this.#room) return;
		try {
			await this.#room.startAudio();
			this.audioBlocked = !this.#room.canPlaybackAudio;
		} catch (e) {
			logEvent(`startAudio failed: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	/** Start sharing this user's screen (admins/super admins only). */
	async startSharing(): Promise<void> {
		if (!this.#room) return;
		try {
			await this.#room.localParticipant.setScreenShareEnabled(true, { audio: true });
			this.publishing = true;
			this.#refresh();
		} catch (e) {
			logEvent(`Screen-share error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'Screen share');
		}
	}

	/**
	 * Share via an external encoder (OBS Virtual Camera / XSplit VCam). These
	 * present as ordinary video-input devices; we capture the virtual cam with
	 * getUserMedia and publish it as a ScreenShare-source track so it shows in the
	 * main stage exactly like a browser share. Sets a helpful error if no virtual
	 * camera is running.
	 */
	async startSharingExternalCam(): Promise<void> {
		if (!this.#room) return;
		try {
			// A getUserMedia grant is required before device labels are readable.
			let stream = await navigator.mediaDevices.getUserMedia({ video: true });
			const devices = await navigator.mediaDevices.enumerateDevices();
			const vcam = devices.find(
				(d) => d.kind === 'videoinput' && /obs|xsplit|vcam|virtual\s*cam/i.test(d.label)
			);
			if (!vcam) {
				stream.getTracks().forEach((t) => t.stop());
				this.error =
					'No OBS / XSplit virtual camera found. Start "OBS Virtual Camera" or "XSplit VCam" first, then try again.';
				return;
			}
			// Re-acquire the exact virtual-cam device if the default grant wasn't it.
			if (stream.getVideoTracks()[0]?.getSettings().deviceId !== vcam.deviceId) {
				stream.getTracks().forEach((t) => t.stop());
				stream = await navigator.mediaDevices.getUserMedia({
					video: { deviceId: { exact: vcam.deviceId } }
				});
			}
			this.#externalStream = stream;
			this.#externalPub = await this.#room.localParticipant.publishTrack(
				stream.getVideoTracks()[0],
				{ source: Track.Source.ScreenShare, name: 'screen' }
			);
			this.publishing = true;
			this.#refresh();
		} catch (e) {
			this.#externalStream?.getTracks().forEach((t) => t.stop());
			this.#externalStream = null;
			logEvent(`OBS/XSplit cam error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'OBS/XSplit virtual camera');
		}
	}

	async stopSharing(): Promise<void> {
		if (!this.#room) return;
		if (this.#externalPub) {
			// External-encoder share: unpublish the track and release the device.
			if (this.#externalPub.track) {
				await this.#room.localParticipant.unpublishTrack(this.#externalPub.track);
			}
			this.#externalStream?.getTracks().forEach((t) => t.stop());
			this.#externalPub = null;
			this.#externalStream = null;
		} else {
			await this.#room.localParticipant.setScreenShareEnabled(false);
		}
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
			logEvent(`Camera error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'Camera');
		}
	}

	async stopCamera(): Promise<void> {
		if (!this.#room) return;
		// setCameraEnabled(false) only MUTES the camera in livekit-client — it stops
		// the device but LEAVES the publication in trackPublications with a non-null
		// (now-ended) track, so #refresh keeps the tile and it renders BLACK (the
		// reported bug). Unpublish so the publication is removed and the tile clears;
		// unpublish also fires LocalTrackUnpublished -> a second #refresh for free.
		const pub = this.#room.localParticipant.getTrackPublication(Track.Source.Camera);
		if (pub?.track) {
			await this.#room.localParticipant.unpublishTrack(pub.track);
		}
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
			logEvent(`Mic error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'Microphone');
		}
	}

	async stopMic(): Promise<void> {
		if (!this.#room) return;
		// Same mute-not-unpublish defect as the camera: unpublish so the mic
		// publication is actually removed, not left published-but-muted.
		const pub = this.#room.localParticipant.getTrackPublication(Track.Source.Microphone);
		if (pub?.track) {
			await this.#room.localParticipant.unpublishTrack(pub.track);
		}
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

	/**
	 * Apply a device selection (mic/camera/speaker) to the LIVE call. LiveKit
	 * performs the underlying WebRTC replaceTrack internally, so the published
	 * track switches input without dropping the tile. For 'audiooutput' it routes
	 * playback where setSinkId is supported, else resolves false. No-op without a
	 * connected room or a real device id.
	 */
	async switchDevice(kind: MediaDeviceKind, deviceId: string): Promise<void> {
		if (!this.#room || !deviceId) return;
		try {
			// exact=false: store the device as an `ideal` preference, NOT `{exact:id}`.
			// The AV-Settings modal enumerates devices WITHOUT a getUserMedia grant, so
			// its ids can be stale/empty; an exact constraint would make the next
			// startMic/startCamera getUserMedia throw OverconstrainedError (the "mic not
			// working at all" regression). `ideal` lets acquisition fall back to default.
			await this.#room.switchActiveDevice(kind, deviceId, false);
		} catch (e) {
			logEvent(`Device switch error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = e instanceof Error ? e.message : 'failed to switch device';
		}
	}

	/** The active device id for a kind, or undefined — used to preselect the modal. */
	getActiveDevice(kind: MediaDeviceKind): string | undefined {
		return this.#room?.getActiveDevice(kind);
	}

	/** Whether the given participant identity is currently speaking. */
	isSpeaking(identity: string): boolean {
		return this.activeSpeakers.includes(identity);
	}

	async disconnect(): Promise<void> {
		this.#externalStream?.getTracks().forEach((t) => t.stop());
		this.#externalStream = null;
		this.#externalPub = null;
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
