import { error } from '@sveltejs/kit';
import { getProject, getProjectSlugs } from '$lib/sanity/fetch.server';

export const prerender = true;

export const entries = async () => (await getProjectSlugs()).map((slug) => ({ slug }));

export async function load({ params }) {
	const project = await getProject(params.slug);
	if (!project) error(404, 'Project not found');
	return { project, projectPayload: JSON.stringify(project) };
}
