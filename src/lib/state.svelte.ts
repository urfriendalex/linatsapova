import type { PortfolioImage } from './types';

const galleryFromDom = (selector: string): PortfolioImage[] =>
	[...document.querySelectorAll<HTMLButtonElement>(selector)].map((button) => {
		const img = button.querySelector('img');
		return {
			id: button.dataset.imageId ?? '',
			src: img?.currentSrc || img?.src || '',
			alt: img?.alt || '',
			width: Number(img?.width) || 1800,
			height: Number(img?.height) || 1200
		};
	});

export function syncPortfolioGallery(selector: string) {
	const images = galleryFromDom(selector);
	if (images.length) portfolio.gallery = images;
}

export const portfolio = $state({
  activeProject: '',
  activeImage: '',
  gallery: [] as PortfolioImage[],
  previousRoute: '/',
  transitionPhase: 'idle' as 'idle' | 'opening' | 'open' | 'closing',
  scrollPositions: new Map<string, number>()
});

import { getScrollY } from './lenis';

export function rememberScroll(path: string) {
  portfolio.scrollPositions.set(path, getScrollY());
}
