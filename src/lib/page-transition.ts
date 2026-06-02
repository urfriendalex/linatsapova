import type { Navigation } from '@sveltejs/kit';

export function shouldAnimatePageTransition(navigation: Navigation): boolean {
	if (typeof document === 'undefined') return false;
	if (!document.startViewTransition) return false;
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
	if (!navigation.from) return false;
	if (navigation.willUnload) return false;

	const from = navigation.from.url;
	const to = navigation.to?.url;
	if (!to) return false;

	if (from.pathname === to.pathname) return false;

	return true;
}

export function runPageTransition(navigation: Navigation): Promise<void> | undefined {
	if (!shouldAnimatePageTransition(navigation)) return;

	return new Promise((resolve) => {
		document.startViewTransition!(async () => {
			resolve();
			await navigation.complete;
		});
	});
}
