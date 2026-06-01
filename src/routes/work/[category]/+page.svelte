<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
  import { setLightboxSource } from '$lib/lightbox';
  import { portfolio } from '$lib/state.svelte';

  let { data } = $props();

  $effect(() => {
    portfolio.activeProject = data.slug;
    portfolio.gallery = [...data.category.images];
    portfolio.activeImage = page.url.searchParams.get('image') ?? '';
  });

  function focus(id: string, event: MouseEvent) {
    setLightboxSource((event.currentTarget as HTMLButtonElement).querySelector('img') ?? undefined);
    goto(`/work/${data.slug}?image=${id}`, { noScroll: true, keepFocus: true });
  }
</script>

<svelte:head><title>{data.category.title} — Lina Tsapova</title></svelte:head>

<section>
  <header>
    <div>
      <p>Selected work</p>
      <h1>{data.category.title}</h1>
    </div>
    <p class="description">{data.category.description}</p>
  </header>
  <div class="grid" aria-label={data.category.title}>
    {#each data.category.images as image}
      <button onclick={(event) => focus(image.id, event)} aria-label={`Explore ${image.alt}`}>
        <ResponsiveImage {image} sizes="(max-width: 700px) 50vw, 25vw" />
      </button>
    {/each}
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
  .grid :global(img) { aspect-ratio: 4 / 5; display: block; height: 100%; object-fit: cover; outline: 1px solid rgba(0,0,0,.1); width: 100%; }
  @media(max-width:700px) { section { padding: 70px 20px 100px; } header { display: block; margin-bottom: 54px; } .description { margin-top: 20px; } .grid { gap: 8px; grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>
