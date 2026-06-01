import { defineField, defineType } from 'sanity';
export const portfolioImage = defineType({
  name: 'portfolioImage',
  title: 'Portfolio image',
  type: 'object',
  fields: [
    defineField({ name: 'asset', type: 'image', options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: 'alt', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'caption', type: 'string' })
  ],
  preview: { select: { title: 'alt', media: 'asset' } }
});
