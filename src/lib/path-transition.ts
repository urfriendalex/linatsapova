const ATTRIBUTE = 'data-path-transition';

export function preparePathTransition(slug: string) {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute(ATTRIBUTE, slug);
}

export function pathTransitionName(slug: string) {
	if (typeof document === 'undefined') return '';
	return document.documentElement.getAttribute(ATTRIBUTE) === slug ? `work-cover-${slug}` : '';
}

export function clearPathTransition() {
	if (typeof document === 'undefined') return;
	document.documentElement.removeAttribute(ATTRIBUTE);
}
