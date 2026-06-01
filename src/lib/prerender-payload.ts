import { browser } from '$app/environment';

export function readPrerenderPayload<T>(id: string): T | null {
	if (!browser) return null;
	const node = document.getElementById(id);
	if (!node?.textContent?.trim()) return null;
	try {
		return JSON.parse(node.textContent) as T;
	} catch {
		return null;
	}
}
