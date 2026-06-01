import { replaceState } from '$app/navigation';
import { page } from '$app/state';

/** Shallow URL update for lightbox — avoids SvelteKit navigations that re-run loads. */
export function setFocusImageParam(imageId = '') {
	const url = new URL(page.url);
	if (imageId) url.searchParams.set('image', imageId);
	else url.searchParams.delete('image');
	replaceState(url, {});
}
