# Lina Tsapova Portfolio

Static-first SvelteKit portfolio with a persistent client shell, native View Transitions, GSAP gallery interactions, and Sanity Studio schemas.

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
5. Rebuild the site — pages fetch from Sanity at build time via GROQ.

## Publishing

Connect the repo to Vercel; pushes to `main` deploy automatically. Optionally add a Sanity webhook → Vercel deploy hook to rebuild when CMS content is published.
