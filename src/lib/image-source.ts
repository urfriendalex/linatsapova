import type { PortfolioImage } from './types';

export const hasImageSource = (image?: PortfolioImage | null): image is PortfolioImage =>
	Boolean(image && (image.sanityAsset || image.src));
