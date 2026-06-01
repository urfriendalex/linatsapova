# Lina Tsapova Portfolio

Static-first SvelteKit portfolio with a persistent client shell, native View Transitions, GSAP gallery interactions, and Sanity Studio schemas.

## Local development

```sh
npm install
npm run dev
```

The public site currently uses sample image data from `src/lib/data.ts` so it works immediately. To connect Sanity, create a project, set `SANITY_STUDIO_PROJECT_ID`, run `npm run studio`, and replace the sample loader with GROQ-backed project data.

## Publishing

Deploy the static build to Vercel and configure a Sanity webhook to call the Vercel deploy hook on published document changes.
