import type { PortfolioImage } from './types';

export const portfolio = $state({
  activeProject: '',
  activeImage: '',
  gallery: [] as PortfolioImage[],
  previousRoute: '/',
  transitionPhase: 'idle' as 'idle' | 'opening' | 'open' | 'closing',
  scrollPositions: new Map<string, number>()
});

export function rememberScroll(path: string) {
  portfolio.scrollPositions.set(path, window.scrollY);
}
