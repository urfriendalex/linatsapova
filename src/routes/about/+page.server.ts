import { getProfile } from '$lib/sanity/fetch.server';

export const prerender = true;

export async function load() {
	return { profile: await getProfile() };
}
