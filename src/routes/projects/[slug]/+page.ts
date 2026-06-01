import { error } from '@sveltejs/kit';
import { getProject } from '$lib/data';
export const entries = () => [{ slug: 'notes-on-silence' }, { slug: 'familiar-strangers' }, { slug: 'soft-territories' }, { slug: 'rooms-for-light' }];
export function load({ params }) {
  const project = getProject(params.slug);
  if (!project) error(404, 'Project not found');
  return { project };
}
