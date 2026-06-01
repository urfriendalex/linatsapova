import { error } from '@sveltejs/kit';
import { getWorkCategory } from '$lib/sanity/fetch';

export async function load({ params }) {
	const category = await getWorkCategory(params.category);
	if (!category) error(404, 'Category not found');
	return { category, slug: params.category, categoryPayload: JSON.stringify(category) };
}
