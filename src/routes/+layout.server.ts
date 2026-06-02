import { sampleProfile, sampleSiteSettings } from '$lib/sample-data';
import { getProfile, getSiteSettings } from '$lib/sanity/fetch.server';

export async function load() {
	try {
		const [siteSettings, profile] = await Promise.all([getSiteSettings(), getProfile()]);
		return { siteSettings, profile };
	} catch {
		return { siteSettings: sampleSiteSettings, profile: sampleProfile };
	}
}
