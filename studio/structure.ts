import { HomeIcon, ImagesIcon, UserIcon } from '@sanity/icons';
import type { StructureResolver } from 'sanity/structure';

const galleryItem = (
	S: Parameters<StructureResolver>[0],
	context: Parameters<StructureResolver>[1],
	title: string,
	slug: string
) =>
	S.listItem()
		.title(title)
		.icon(ImagesIcon)
		.child(async () => {
			const client = context.getClient({ apiVersion: '2025-02-19' });
			const documentId = await client.fetch<string | null>(
				`*[_type == "workCategory" && slug.current == $slug][0]._id`,
				{ slug }
			);

			if (!documentId) {
				return S.component(() => null).title(`${title} not found`);
			}

			return S.document().schemaType('workCategory').documentId(documentId).title(title);
		});

const singleton = (
	S: Parameters<StructureResolver>[0],
	typeName: string,
	title: string,
	documentId: string,
	icon: typeof HomeIcon
) =>
	S.listItem()
		.title(title)
		.icon(icon)
		.child(S.document().schemaType(typeName).documentId(documentId).title(title));

export const structure: StructureResolver = (S, context) =>
	S.list()
		.title('Website')
		.items([
			galleryItem(S, context, 'Modeling gallery', 'modeling'),
			galleryItem(S, context, 'Photography gallery', 'photography'),
			S.divider(),
			singleton(S, 'profile', 'About & contact', 'profile', UserIcon),
			singleton(S, 'siteSettings', 'Homepage & SEO', 'siteSettings', HomeIcon)
		]);
