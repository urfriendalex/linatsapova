import { error } from '@sveltejs/kit';
import { getWorkCategory } from '$lib/data';

export const entries = () => [{ category: 'modeling' }, { category: 'photography' }];

export function load({ params }) {
  const category = getWorkCategory(params.category);
  if (!category) error(404, 'Category not found');
  return { category, slug: params.category };
}
