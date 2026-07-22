/**
 * Full-screen image lightbox state. The reference opens chat/alert images via a
 * JS image-overlay (`onclick="openImageModal(event,'<url>')"`, report.md:1738)
 * rather than a Bootstrap modal — report.md:1878 directs building our own
 * lightbox equivalent. One overlay instance is mounted in the root layout.
 */
export const lightbox = $state<{ url: string | null }>({ url: null });

export function openLightbox(url: string): void {
	lightbox.url = url;
}

export function closeLightbox(): void {
	lightbox.url = null;
}
