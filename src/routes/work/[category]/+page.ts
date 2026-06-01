import { getWorkCategorySlugs } from '$lib/sanity/fetch';

export const entries = async () => (await getWorkCategorySlugs()).map((category) => ({ category }));
