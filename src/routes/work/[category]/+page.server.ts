import { error } from '@sveltejs/kit';
import { getWorkCategory } from '$lib/sanity/fetch.server';

export const prerender = true;

export const entries = () => [{ category: 'modeling' }, { category: 'photography' }];

export async function load({ params }) {
	const category = await getWorkCategory(params.category);
	if (!category) error(404, 'Category not found');
	return { category, slug: params.category, categoryPayload: JSON.stringify(category) };
}
