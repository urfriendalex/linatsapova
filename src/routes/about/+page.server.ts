import { getProfile } from '$lib/sanity/fetch.server';

export async function load() {
	return { profile: await getProfile() };
}
