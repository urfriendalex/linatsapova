import type { PortfolioImage } from './types';
import { isSanityImage, sanityImageUrl } from './sanity/image';

export const imageUrl = (image: PortfolioImage, width: number) => {
	if (isSanityImage(image) && image.sanityAsset) {
		return sanityImageUrl(image.sanityAsset, width);
	}

	const url = new URL(image.src);
	url.searchParams.set('w', String(width));
	return url.toString();
};

export const srcset = (image: PortfolioImage, widths = [360, 640, 960, 1280, 1800]) =>
	widths.map((width) => `${imageUrl(image, width)} ${width}w`).join(', ');
