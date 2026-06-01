import { defineField, defineType } from 'sanity';
export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'descriptor', type: 'string' }),
    defineField({ name: 'bio', type: 'text' }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'instagram', type: 'url' }),
    defineField({ name: 'threads', type: 'url' })
  ]
});
