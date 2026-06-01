import { defineField, defineType } from 'sanity';

export const profile = defineType({
	name: 'profile',
	title: 'About & contact',
	type: 'document',
	fields: [
		defineField({ name: 'name', title: 'Name', type: 'string' }),
		defineField({
			name: 'descriptor',
			title: 'Eyebrow label',
			description: 'Small label above the headline (e.g. “About / Contact”).',
			type: 'string'
		}),
		defineField({ name: 'headline', title: 'Headline', type: 'string' }),
		defineField({
			name: 'bio',
			title: 'Bio',
			description: 'Separate paragraphs with a blank line.',
			type: 'text'
		}),
		defineField({ name: 'portrait', title: 'Portrait photo', type: 'portfolioImage' }),
		defineField({ name: 'email', title: 'Email', type: 'string' }),
		defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' }),
		defineField({ name: 'threads', title: 'Threads URL', type: 'url' })
	]
});
