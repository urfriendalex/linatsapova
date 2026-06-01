<script lang="ts">
  import { imageUrl, srcset } from '$lib/image';
  import type { PortfolioImage } from '$lib/types';

  let {
    image,
    sizes = '100vw',
    eager = false,
    class: className = '',
    transitionName = ''
  }: {
    image: PortfolioImage;
    sizes?: string;
    eager?: boolean;
    class?: string;
    transitionName?: string;
  } = $props();
</script>

<img
  class={className}
  src={imageUrl(image, 960)}
  srcset={srcset(image)}
  {sizes}
  width={image.width}
  height={image.height}
  alt={image.alt}
  loading={eager ? 'eager' : 'lazy'}
  fetchpriority={eager ? 'high' : 'auto'}
  decoding="async"
  style:view-transition-name={transitionName || undefined}
/>
