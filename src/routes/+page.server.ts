import { getSiteSettings, getWorkCategories } from '$lib/sanity/fetch.server';

export async function load() {
	const [workCategories, siteSettings] = await Promise.all([
		getWorkCategories(),
		getSiteSettings()
	]);

	return { workCategories, siteSettings };
}
