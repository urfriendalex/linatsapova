import { defineField, defineType } from 'sanity';

export const portfolioImage = defineType({
	name: 'portfolioImage',
	title: 'Photo',
	type: 'object',
	fields: [
		defineField({
			name: 'asset',
			title: 'Image',
			type: 'image',
			options: { hotspot: true },
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'alt',
			title: 'Alt text',
			description: 'Describe the image for accessibility (e.g. “Portrait in window light”).',
			type: 'string',
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'caption',
			title: 'Caption',
			description: 'Optional. Not shown on the site yet.',
			type: 'string'
		})
	],
	preview: { select: { title: 'alt', media: 'asset' } }
});
