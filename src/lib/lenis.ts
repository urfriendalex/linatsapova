import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenis: Lenis | undefined;

export function initLenis() {
	if (typeof window === 'undefined' || lenis) return lenis;
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	lenis = new Lenis({
		autoRaf: true,
		anchors: true,
		stopInertiaOnNavigate: true
	});

	return lenis;
}

export function destroyLenis() {
	lenis?.destroy();
	lenis = undefined;
}

export function getLenis() {
	return lenis;
}

export function getScrollY() {
	return lenis?.scroll ?? window.scrollY;
}

export function setLenisStopped(stopped: boolean) {
	if (!lenis) return;
	if (stopped) lenis.stop();
	else lenis.start();
}

export function resizeLenis() {
	lenis?.resize();
}

export function scrollToElement(
	element: Element,
	options: { immediate?: boolean; offset?: number } = {}
) {
	const { immediate = false, offset = -window.innerHeight * 0.32 } = options;
	const top = element.getBoundingClientRect().top + window.scrollY + offset;
	if (lenis) {
		lenis.scrollTo(top, { immediate, force: immediate });
		return;
	}
	element.scrollIntoView({ block: 'center', behavior: immediate ? 'instant' : 'smooth' });
}
