<script lang="ts">
  import { imageUrl, srcset } from '$lib/image';
  import { hasImageSource } from '$lib/image-source';
  import type { PortfolioImage } from '$lib/types';
  import ImageSkeleton from './ImageSkeleton.svelte';

  let {
    image = null,
    sizes = '100vw',
    eager = false,
    class: className = '',
    transitionName = ''
  }: {
    image?: PortfolioImage | null;
    sizes?: string;
    eager?: boolean;
    class?: string;
    transitionName?: string;
  } = $props();

  let loaded = $state(false);

  $effect(() => {
    image;
    loaded = false;
  });
</script>

{#if hasImageSource(image)}
  <span class="frame">
    {#if !loaded}
      <ImageSkeleton class="placeholder" />
    {/if}
    <img
      class={[className, loaded && 'loaded']}
      src={imageUrl(image!, 960)}
      srcset={srcset(image!)}
      {sizes}
      width={image!.width}
      height={image!.height}
      alt={image!.alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : 'auto'}
      decoding="async"
      style:view-transition-name={transitionName || undefined}
      onload={() => (loaded = true)}
    />
  </span>
{:else}
  <ImageSkeleton class={className} />
{/if}

<style>
  .frame {
    display: block;
    height: 100%;
    position: relative;
    width: 100%;
  }

  .placeholder {
    inset: 0;
    position: absolute;
    z-index: 0;
  }

  img {
    display: block;
    height: 100%;
    opacity: 0;
    position: relative;
    transition: opacity 0.55s cubic-bezier(0.2, 0, 0, 1);
    width: 100%;
    z-index: 1;
  }

  img.loaded {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      opacity: 1;
      transition: none;
    }
  }
</style>
