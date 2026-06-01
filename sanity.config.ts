import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './studio/schemaTypes';
import { structure } from './studio/structure';

const hiddenFromCreate = new Set(['workCategory', 'project']);

export default defineConfig({
	name: 'default',
	title: 'Lina Tsapova Portfolio',
	projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'replace-me',
	dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
	plugins: [structureTool({ structure })],
	schema: { types: schemaTypes },
	document: {
		newDocumentOptions: (previous, { creationContext }) => {
			if (creationContext.type === 'global') {
				return previous.filter((option) => !hiddenFromCreate.has(option.templateId));
			}
			return previous;
		},
		actions: (previous, { schemaType }) => {
			if (schemaType === 'workCategory') {
				return previous.filter(({ action }) => action !== 'duplicate' && action !== 'delete');
			}
			return previous;
		}
	}
});
