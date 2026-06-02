# Lina Tsapova Portfolio

SvelteKit portfolio with live Sanity content (server-rendered on each request), a persistent client shell, native View Transitions, GSAP gallery interactions, and Sanity Studio schemas.

## Local development

```sh
npm install
npm run dev
```

Without Sanity env vars, the site uses sample image data from `src/lib/sample-data.ts` so it works immediately.

### Connect Sanity (free tier)

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) — the **Free** plan ($0 forever) is enough for this portfolio.
2. Copy `.env.example` to `.env` and set:
   - `PUBLIC_SANITY_PROJECT_ID` / `SANITY_STUDIO_PROJECT_ID` — your project ID
   - `PUBLIC_SANITY_DATASET=production`
   - `SANITY_API_TOKEN` — only needed for `npm run media:upload`
3. Run Studio locally: `npm run studio`
4. Add content: **Work category** (modeling, photography), **Profile**, **Site settings**, and optional **Project** documents.
5. Deploy to Vercel with `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` set in the project environment.

## Publishing

Connect the repo to Vercel; pushes to `main` deploy automatically. **CMS updates do not require a redeploy** — when content is published in Sanity, the next page load fetches the latest data via GROQ.

Ensure Vercel has these env vars for Production (and Preview if you use Studio there):

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET` (usually `production`)
