import { error } from '@sveltejs/kit';
import { getProject } from '$lib/sanity/fetch';

export async function load({ params }) {
	const project = await getProject(params.slug);
	if (!project) error(404, 'Project not found');
	return { project, projectPayload: JSON.stringify(project) };
}
