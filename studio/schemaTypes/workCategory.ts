import { defineField, defineType } from 'sanity';

export const workCategory = defineType({
	name: 'workCategory',
	title: 'Gallery',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Internal name',
			type: 'string',
			readOnly: true,
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'slug',
			type: 'slug',
			hidden: true,
			readOnly: true,
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'description',
			title: 'Intro text',
			description: 'Short line shown at the top of the gallery page.',
			type: 'text',
			rows: 3
		}),
		defineField({
			name: 'images',
			title: 'Photos',
			description: 'Drag to reorder. The first photo is used on the homepage.',
			type: 'array',
			of: [{ type: 'portfolioImage' }],
			options: { layout: 'grid' },
			validation: (rule) => rule.required().min(1)
		}),
		defineField({
			name: 'order',
			type: 'number',
			hidden: true
		})
	]
});
