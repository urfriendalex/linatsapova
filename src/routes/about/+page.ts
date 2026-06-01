import { getProfile } from '$lib/sanity/fetch';

export async function load() {
	return { profile: await getProfile() };
}
