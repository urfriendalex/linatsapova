<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { setFocusImageParam } from '$lib/focus-url';
  import { page } from '$app/state';
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
  import { setLightboxSource } from '$lib/lightbox';
  import { readPrerenderPayload } from '$lib/prerender-payload';
  import { portfolio, syncPortfolioGallery } from '$lib/state.svelte';
  import type { WorkCategory } from '$lib/types';

  const PAYLOAD_ID = 'work-category-data';

  let { data } = $props();
  const slug = $derived(data?.slug ?? page.params.category);
  let categoryState = $state<WorkCategory | null>(
    data?.category ?? readPrerenderPayload<WorkCategory>(PAYLOAD_ID)
  );

  const category = $derived(categoryState);

  $effect.pre(() => {
    if (data?.category) categoryState = data.category;
    else if (!categoryState) categoryState = readPrerenderPayload<WorkCategory>(PAYLOAD_ID);
  });

  function syncActiveImageFromUrl() {
    portfolio.activeImage = page.url.searchParams.get('image') ?? '';
  }

  $effect(() => {
    if (!category?.images?.length) return;
    portfolio.activeProject = slug;
    portfolio.gallery = [...category.images];
  });

  onMount(() => {
    syncPortfolioGallery('.grid button');
    portfolio.activeProject = slug;
    syncActiveImageFromUrl();
    const onPopState = () => syncActiveImageFromUrl();
    addEventListener('popstate', onPopState);
    return () => removeEventListener('popstate', onPopState);
  });

  afterNavigate(syncActiveImageFromUrl);

  function focus(id: string, event: MouseEvent) {
    syncPortfolioGallery('.grid button');
    setLightboxSource((event.currentTarget as HTMLButtonElement).querySelector('img') ?? undefined);
    portfolio.activeProject = slug;
    portfolio.transitionPhase = 'opening';
    portfolio.activeImage = id;
    setFocusImageParam(id);
  }
</script>

<svelte:head><title>{category?.title ?? 'Work'} — Lina Tsapova</title></svelte:head>

<div id={PAYLOAD_ID} hidden aria-hidden="true">{data?.categoryPayload ?? ''}</div>

<section>
  <header>
    <div>
      <p>Selected work</p>
      <h1>{category?.title}</h1>
    </div>
    <p class="description">{category?.description}</p>
  </header>
  <div class="grid" aria-label={category?.title}>
    {#if category?.images?.length}
      {#each category.images as image}
        <button data-image-id={image.id} onclick={(event) => focus(image.id, event)} aria-label={`Explore ${image.alt}`}>
          <ResponsiveImage {image} sizes="(max-width: 700px) 50vw, 25vw" />
        </button>
      {/each}
    {/if}
  </div>
</section>

<style>
  section { padding: 95px 30px 140px; }
  header { align-items: end; display: flex; justify-content: space-between; margin-bottom: 90px; }
  p { color: var(--muted); font-size: .64rem; letter-spacing: .1em; margin: 0; text-transform: uppercase; }
  .description { line-height: 1.5; max-width: 360px; text-wrap: pretty; }
  h1 { font-size: clamp(3rem,7vw,7rem); font-weight: 400; letter-spacing: -.09em; line-height: .9; margin: 14px 0 0; text-wrap: balance; }
  .grid { display: grid; gap: 12px; grid-template-columns: repeat(4,minmax(0,1fr)); }
  button { background: transparent; border: 0; cursor: zoom-in; padding: 0; transition: opacity .2s; }
  button:hover, button:focus-visible { opacity: .78; }
  button:active { transform: scale(.96); }
  .grid :global(img),
  .grid :global(.skeleton) { aspect-ratio: 4 / 5; display: block; height: 100%; object-fit: cover; outline: 1px solid rgba(0,0,0,.1); width: 100%; }
  @media(max-width:700px) { section { padding: 70px 20px 100px; } header { display: block; margin-bottom: 54px; } .description { margin-top: 20px; } .grid { gap: 8px; grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>
