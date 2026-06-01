import type { PortfolioImage } from './types';

export const imageUrl = (image: PortfolioImage, width: number) => {
  const url = new URL(image.src);
  url.searchParams.set('w', String(width));
  return url.toString();
};

export const srcset = (image: PortfolioImage, widths = [360, 640, 960, 1280, 1800]) =>
  widths.map((width) => `${imageUrl(image, width)} ${width}w`).join(', ');
