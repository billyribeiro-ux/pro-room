import { env } from '$env/dynamic/public';

/**
 * App brand (logo + name) shown in the room top nav and anywhere else the brand
 * appears. Designed to be swapped without touching components.
 *
 * To replace the logo, EITHER:
 *   1. Drop your own file at `web/static/brand-logo.svg` (or any format) — the
 *      default path below picks it up, no rebuild of components needed; or
 *   2. Set `PUBLIC_BRAND_LOGO` to any URL/path (e.g. an R2/CDN asset) and
 *      `PUBLIC_BRAND_NAME` to rename — read at load, no code change.
 *
 * The default ships a self-contained SVG so the brand renders out of the box.
 */
export const BRAND = {
	name: env.PUBLIC_BRAND_NAME?.trim() || 'Trading Room',
	logo: env.PUBLIC_BRAND_LOGO?.trim() || '/brand-logo.svg'
};
