import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import type { PortfolioImage } from '$lib/types';
import { publicSanityDataset, publicSanityProjectId } from './env';

export type SanityPortfolioImage = {
	asset: SanityImageSource;
	width?: number;
	height?: number;
	lqip?: string;
	alt: string;
	caption?: string;
};

const builder = publicSanityProjectId
	? imageUrlBuilder({
			projectId: publicSanityProjectId,
			dataset: publicSanityDataset
		})
	: null;

export const mapPortfolioImage = (image: SanityPortfolioImage): PortfolioImage => ({
	id: extractAssetId(image.asset),
	src: builder?.image(image.asset).width(1800).auto('format').quality(88).url() ?? '',
	alt: image.alt,
	width: image.width ?? 1800,
	height: image.height ?? 1200,
	caption: image.caption,
	lqip: image.lqip,
	sanityAsset: image.asset
});

export const sanityImageUrl = (source: SanityImageSource, width: number) =>
	builder?.image(source).width(width).auto('format').quality(88).url() ?? '';

export const isSanityImage = (image: PortfolioImage) => Boolean(image.sanityAsset);

const extractAssetId = (source: SanityImageSource) => {
	if (typeof source === 'string') return source;
	if ('asset' in source && source.asset && typeof source.asset === 'object' && '_ref' in source.asset) {
		return source.asset._ref;
	}
	if ('_ref' in source) return source._ref;
	if ('_id' in source && typeof source._id === 'string') return source._id;
	return 'sanity-image';
};
