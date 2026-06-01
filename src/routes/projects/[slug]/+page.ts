import { getProjectSlugs } from '$lib/sanity/fetch';

export const entries = async () => (await getProjectSlugs()).map((slug) => ({ slug }));
