import { defineField, defineType } from 'sanity';
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }),
    defineField({ name: 'year', type: 'string' }),
    defineField({ name: 'summary', type: 'text', rows: 3 }),
    defineField({ name: 'cover', type: 'portfolioImage', validation: (rule) => rule.required() }),
    defineField({ name: 'stackImages', title: 'Stack images', type: 'array', of: [{ type: 'portfolioImage' }], validation: (rule) => rule.length(2) }),
    defineField({ name: 'gallery', type: 'array', of: [{ type: 'portfolioImage' }], validation: (rule) => rule.required().min(1) }),
    defineField({ name: 'featured', type: 'boolean', initialValue: true }),
    defineField({ name: 'showInArchive', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', type: 'number' })
  ],
  orderings: [{ title: 'Display order', name: 'displayOrder', by: [{ field: 'order', direction: 'asc' }] }]
});
