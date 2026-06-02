import { error } from '@sveltejs/kit';
import { getWorkCategory } from '$lib/sanity/fetch.server';

export async function load({ params }) {
	const category = await getWorkCategory(params.category);
	if (!category) error(404, 'Category not found');
	return { category, slug: params.category };
}
