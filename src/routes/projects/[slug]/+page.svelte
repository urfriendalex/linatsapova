<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import { setFocusImageParam } from '$lib/focus-url';
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
  import { setLightboxSource } from '$lib/lightbox';
  import { portfolio, syncPortfolioGallery } from '$lib/state.svelte';

  let { data } = $props();
  const project = $derived(data.project);

  function syncFromUrl() {
    const id = page.url.searchParams.get('image') ?? '';
    portfolio.activeImage = id;
    portfolio.transitionPhase = id ? 'open' : 'idle';
  }

  $effect(() => {
    if (!project?.gallery) return;
    portfolio.activeProject = project.slug;
    portfolio.gallery = project.gallery;
  });

  onMount(() => {
    syncPortfolioGallery('.gallery button');
    portfolio.activeProject = project.slug;
    syncFromUrl();
    const onPopState = () => syncFromUrl();
    addEventListener('popstate', onPopState);
    return () => removeEventListener('popstate', onPopState);
  });

  afterNavigate(syncFromUrl);

  function focus(id: string, event: MouseEvent) {
    syncPortfolioGallery('.gallery button');
    setLightboxSource((event.currentTarget as HTMLButtonElement).querySelector('img') ?? undefined);
    portfolio.activeProject = project.slug;
    portfolio.transitionPhase = 'opening';
    portfolio.activeImage = id;
    setFocusImageParam(id);
  }
</script>

<svelte:head><title>{project.title} — Lina Tsapova</title></svelte:head>

<section class="project-head">
  <div><p>{project.year} — Project</p><h1>{project.title}</h1><p class="summary">{project.summary}</p></div>
  <ResponsiveImage image={project.cover} sizes="(max-width: 800px) 100vw, 52vw" eager transitionName={`project-${project.slug}`} />
</section>
<section class="gallery" aria-label={`${project.title} gallery`}>
  {#each project.gallery as image, index}
    <button
      class:wide={index % 3 === 0}
      data-image-id={image.id}
      onclick={(event) => focus(image.id, event)}
      aria-label={`Explore ${image.alt}`}
    >
      <ResponsiveImage {image} sizes={index % 3 === 0 ? '(max-width: 720px) 100vw, 70vw' : '(max-width: 720px) 100vw, 42vw'} />
    </button>
  {/each}
</section>

<style>
  .project-head { align-items: end; display: grid; gap: 50px; grid-template-columns: 1fr 1.3fr; padding: 100px 30px 150px; }
  p,h1 { margin: 0; }.project-head p:first-child{color:var(--muted);font-size:.54rem;letter-spacing:.1em;text-transform:uppercase}
  h1{font-size:clamp(3.5rem,7vw,8rem);font-weight:400;letter-spacing:-.09em;line-height:.9;margin:20px 0 28px}.summary{font-size:.9rem;line-height:1.5;max-width:390px}
  .project-head :global(img){display:block;height:auto;width:100%}
  .gallery{display:grid;gap:clamp(30px,8vw,120px);grid-template-columns:repeat(2,1fr);padding:0 clamp(20px,7vw,130px) 180px}
  button{background:0;border:0;cursor:zoom-in;padding:0}.wide{grid-column:1/-1;margin:0 auto;width:82%}.gallery :global(img){display:block;height:auto;width:100%}
  @media(max-width:720px){.project-head{display:block;padding:80px 20px 100px}.project-head :global(img){margin-top:60px}.gallery{display:block;padding:0 20px 100px}.gallery button{display:block;margin:0 0 42px;width:100%}}
</style>
