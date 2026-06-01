import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
	name: 'siteSettings',
	title: 'Homepage & SEO',
	type: 'document',
	fields: [
		defineField({
			name: 'siteTitle',
			title: 'Browser tab title',
			type: 'string'
		}),
		defineField({
			name: 'metaDescription',
			title: 'Search description',
			description: 'One or two sentences for Google and social previews.',
			type: 'text',
			rows: 2
		}),
		defineField({
			name: 'landingStatement',
			title: 'Homepage headline',
			description: 'Use a line break for a two-line headline.',
			type: 'text',
			rows: 2
		}),
		defineField({
			name: 'heroNote',
			title: 'Homepage note',
			description: 'Small line under the hero (e.g. location / availability).',
			type: 'string'
		}),
		defineField({
			name: 'heroImage',
			title: 'Hero image',
			description: 'Large image beside the homepage headline.',
			type: 'portfolioImage'
		})
	]
});
