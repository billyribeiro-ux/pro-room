/**
 * Local browser media (no LiveKit / SFU).
 *
 * Cameras, mics, and screen share use getUserMedia / getDisplayMedia and render
 * only on this client. Remote participants do not receive media until a
 * multi-party transport is added back.
 *
 * Public API matches the previous LiveKit wrapper so room UI stays stable.
 */
import { logEvent } from './stores/sessionLog.svelte';

/** A participant currently sharing a video track (screen or camera). */
export interface SharePublisher {
	identity: string;
	name: string;
	isLocal: boolean;
	track: MediaStreamTrack;
}

/**
 * Turn a getUserMedia/getDisplayMedia/device error into an ACTIONABLE message.
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

function requireSecureMedia(): string | null {
	if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
		return 'Camera/mic need a secure (https://) connection. Open the room over HTTPS (or localhost) and try again.';
	}
	return null;
}

/**
 * Local-only AV session for the room page: screen share, camera, and mic via the
 * browser MediaStream APIs. Named ScreenShareRoom for call-site compatibility.
 */
export class ScreenShareRoom {
	publishers = $state<SharePublisher[]>([]);
	/** Presenter camera feeds rendered in the webcam strip. */
	cameraPublishers = $state<SharePublisher[]>([]);
	/** Always true once `connect()` runs — no SFU handshake. */
	connected = $state(false);
	publishing = $state(false);
	cameraPublishing = $state(false);
	micPublishing = $state(false);
	micMuted = $state(false);
	activeSpeakers = $state<string[]>([]);
	error = $state<string | null>(null);
	/** Kept for UI compatibility; local playback is never autoplay-blocked the same way. */
	audioBlocked = $state(false);

	#identity = 'local';
	#name = 'You';
	#screenStream: MediaStream | null = null;
	#cameraStream: MediaStream | null = null;
	#micStream: MediaStream | null = null;
	#preferred: Partial<Record<MediaDeviceKind, string>> = {};
	#remoteVolume = 1;
	#remoteMuted = false;

	/**
	 * Enable local media controls. No network — just marks the session ready.
	 * Optional identity/name label local tiles.
	 */
	async connect(opts?: { identity?: string; name?: string } | string, _token?: string): Promise<void> {
		// Back-compat: old signature was connect(url, token). Ignore network args.
		if (opts && typeof opts === 'object') {
			if (opts.identity) this.#identity = opts.identity;
			if (opts.name) this.#name = opts.name;
		}
		this.connected = true;
		this.error = null;
		logEvent('Local browser media ready (LiveKit disabled)');
	}

	async resumeAudio(): Promise<void> {
		this.audioBlocked = false;
	}

	setRemoteAudioVolume(v: number): void {
		this.#remoteVolume = Math.max(0, Math.min(1, v));
		// No remote audio tracks in local-only mode.
		void this.#remoteVolume;
	}

	muteRemoteAudio(m: boolean): void {
		this.#remoteMuted = m;
		void this.#remoteMuted;
	}

	/** Browser screen share (getDisplayMedia). */
	async startSharing(): Promise<void> {
		const blocked = requireSecureMedia();
		if (blocked) {
			this.error = blocked;
			return;
		}
		try {
			await this.stopSharing();
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: true
			});
			const video = stream.getVideoTracks()[0];
			if (!video) {
				stream.getTracks().forEach((t) => t.stop());
				this.error = 'Screen share did not return a video track.';
				return;
			}
			video.addEventListener('ended', () => {
				void this.stopSharing();
			});
			this.#screenStream = stream;
			this.publishing = true;
			this.#refresh();
		} catch (e) {
			logEvent(`Screen-share error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'Screen share');
		}
	}

	/**
	 * Share via OBS Virtual Camera / XSplit VCam as a screen-stage track.
	 */
	async startSharingExternalCam(): Promise<void> {
		const blocked = requireSecureMedia();
		if (blocked) {
			this.error = blocked;
			return;
		}
		try {
			await this.stopSharing();
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
			if (stream.getVideoTracks()[0]?.getSettings().deviceId !== vcam.deviceId) {
				stream.getTracks().forEach((t) => t.stop());
				stream = await navigator.mediaDevices.getUserMedia({
					video: { deviceId: { exact: vcam.deviceId } }
				});
			}
			this.#screenStream = stream;
			this.publishing = true;
			this.#refresh();
		} catch (e) {
			this.#screenStream?.getTracks().forEach((t) => t.stop());
			this.#screenStream = null;
			logEvent(`OBS/XSplit cam error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'OBS/XSplit virtual camera');
		}
	}

	async stopSharing(): Promise<void> {
		this.#screenStream?.getTracks().forEach((t) => t.stop());
		this.#screenStream = null;
		this.publishing = false;
		this.#refresh();
	}

	async startCamera(): Promise<void> {
		const blocked = requireSecureMedia();
		if (blocked) {
			this.error = blocked;
			return;
		}
		try {
			await this.stopCamera();
			const deviceId = this.#preferred.videoinput;
			const stream = await navigator.mediaDevices.getUserMedia({
				video: deviceId ? { deviceId: { ideal: deviceId } } : true
			});
			this.#cameraStream = stream;
			this.cameraPublishing = true;
			this.#refresh();
		} catch (e) {
			logEvent(`Camera error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'Camera');
		}
	}

	async stopCamera(): Promise<void> {
		this.#cameraStream?.getTracks().forEach((t) => t.stop());
		this.#cameraStream = null;
		this.cameraPublishing = false;
		this.#refresh();
	}

	async startMic(): Promise<void> {
		const blocked = requireSecureMedia();
		if (blocked) {
			this.error = blocked;
			return;
		}
		try {
			await this.stopMic();
			const deviceId = this.#preferred.audioinput;
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: deviceId ? { deviceId: { ideal: deviceId } } : true
			});
			this.#micStream = stream;
			this.micPublishing = true;
			this.micMuted = false;
		} catch (e) {
			logEvent(`Mic error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = avErrorMessage(e, 'Microphone');
		}
	}

	async stopMic(): Promise<void> {
		this.#micStream?.getTracks().forEach((t) => t.stop());
		this.#micStream = null;
		this.micPublishing = false;
		this.micMuted = false;
	}

	async toggleMicMute(): Promise<void> {
		const track = this.#micStream?.getAudioTracks()[0];
		if (!track) return;
		this.micMuted = !this.micMuted;
		track.enabled = !this.micMuted;
	}

	async switchDevice(kind: MediaDeviceKind, deviceId: string): Promise<void> {
		if (!deviceId) return;
		this.#preferred[kind] = deviceId;
		try {
			if (kind === 'videoinput' && this.cameraPublishing) {
				await this.startCamera();
			} else if (kind === 'audioinput' && this.micPublishing) {
				await this.startMic();
			}
			// audiooutput: setSinkId would apply to remote playback elements; none locally.
		} catch (e) {
			logEvent(`Device switch error: ${e instanceof Error ? e.message : String(e)}`);
			this.error = e instanceof Error ? e.message : 'failed to switch device';
		}
	}

	getActiveDevice(kind: MediaDeviceKind): string | undefined {
		if (kind === 'videoinput') {
			return (
				this.#cameraStream?.getVideoTracks()[0]?.getSettings().deviceId ??
				this.#preferred.videoinput
			);
		}
		if (kind === 'audioinput') {
			return (
				this.#micStream?.getAudioTracks()[0]?.getSettings().deviceId ?? this.#preferred.audioinput
			);
		}
		return this.#preferred[kind];
	}

	isSpeaking(identity: string): boolean {
		return this.activeSpeakers.includes(identity);
	}

	async disconnect(): Promise<void> {
		await this.stopSharing();
		await this.stopCamera();
		await this.stopMic();
		this.connected = false;
		this.audioBlocked = false;
		this.activeSpeakers = [];
		this.publishers = [];
		this.cameraPublishers = [];
		this.error = null;
		logEvent('Local media torn down');
	}

	#refresh(): void {
		const screens: SharePublisher[] = [];
		const cams: SharePublisher[] = [];
		const v = this.#screenStream?.getVideoTracks()[0];
		if (v && v.readyState === 'live') {
			screens.push({
				identity: `${this.#identity}:screen`,
				name: this.#name,
				isLocal: true,
				track: v
			});
		}
		const cam = this.#cameraStream?.getVideoTracks()[0];
		if (cam && cam.readyState === 'live') {
			cams.push({
				identity: `${this.#identity}:camera`,
				name: this.#name,
				isLocal: true,
				track: cam
			});
		}
		this.publishers = screens;
		this.cameraPublishers = cams;
	}
}
