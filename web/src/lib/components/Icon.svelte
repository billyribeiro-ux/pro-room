<script lang="ts">
	/**
	 * Font Awesome 5 icon — the reference app's exact icon set (fa-solid-900 /
	 * fa-regular-400 / fa-brands-400). Renders the same `<i class="fas fa-…">`
	 * markup the reference uses; the glyph stylesheet is loaded globally in the
	 * root layout. Color inherits from the surrounding text (`currentColor`), so
	 * callers usually don't need to set it explicitly; size is the px font-size.
	 */
	interface Props {
		/** FA glyph name without the `fa-` prefix, e.g. "search", "bell-slash". */
		name: string;
		/** Pixel size (font-size). Default 16. */
		size?: number;
		/** FA family: solid (default), regular (outline), or brands (logos). */
		family?: 'solid' | 'regular' | 'brands';
		/** Accessible label. When omitted the icon is decorative (aria-hidden). */
		title?: string;
		/** Extra classes merged onto the `<i>`. */
		class?: string;
	}
	let { name, size = 16, family = 'solid', title, class: klass = '' }: Props = $props();

	const fam = $derived(family === 'regular' ? 'far' : family === 'brands' ? 'fab' : 'fas');
</script>

<i
	class="{fam} fa-{name} {klass}"
	style="font-size: {size}px"
	role={title ? 'img' : undefined}
	aria-label={title}
	aria-hidden={title ? undefined : 'true'}
></i>
