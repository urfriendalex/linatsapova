import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    prerender: {
      handleUnseenRoutes: 'ignore'
    },
    adapter: adapter({ fallback: '404.html' })
  }
};
