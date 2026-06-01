<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { portfolio } from '$lib/state.svelte';
  import { clearLightboxSource, getLightboxSource } from '$lib/lightbox';
  import ResponsiveImage from './ResponsiveImage.svelte';

  let active = $derived(portfolio.gallery.find((image) => image.id === portfolio.activeImage));
  let index = $derived(portfolio.gallery.findIndex((image) => image.id === portfolio.activeImage));
  let observer: { kill: () => void; enable: () => void; disable: () => void } | undefined;
  let gsap = $state<typeof import('gsap').gsap>();
  let overlay = $state<HTMLDivElement>();
  let focusedImage = $state<HTMLDivElement>();
  let animatedImageId = '';

  onMount(() => {
    let disposed = false;
    void Promise.all([import('gsap'), import('gsap/Observer')]).then(([gsapModule, observerModule]) => {
      if (disposed) return;
      ({ gsap } = gsapModule);
      const { Observer } = observerModule;
      gsap.registerPlugin(Observer);
      observer = Observer.create({
        target: window,
        type: 'wheel,touch,pointer',
        tolerance: 24,
        preventDefault: true,
        onDown: previous,
        onUp: next
      });
      observer.disable();
    });
    return () => {
      disposed = true;
      observer?.kill();
    };
  });

  $effect(() => {
    document.body.classList.toggle('focus-open', Boolean(active));
    active ? observer?.enable() : observer?.disable();
    return () => document.body.classList.remove('focus-open');
  });

  $effect(() => {
    if (!active || !overlay || !focusedImage || !gsap || animatedImageId) return;
    animatedImageId = active.id;
    const source = getLightboxSource();
    if (!source || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.fromTo(overlay, {
      backgroundColor: 'rgba(249, 249, 247, 0)'
    }, {
      backgroundColor: 'rgba(249, 249, 247, .985)',
      duration: .46,
      ease: 'power2.out'
    });
    gsap.fromTo(overlay.querySelectorAll('button, .count'), {
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      duration: .28,
      delay: .3,
      ease: 'power2.out'
    });

    const destination = focusedImage;
    requestAnimationFrame(() => {
      const from = source.getBoundingClientRect();
      const to = destination.getBoundingClientRect();
      const scaleX = from.width / to.width;
      const scaleY = from.height / to.height;
      gsap?.fromTo(destination, {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scaleX,
        scaleY,
        transformOrigin: 'center center'
      }, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: .78,
        ease: 'expo.inOut',
        clearProps: 'transform'
      });
    });
  });

  $effect(() => {
    if (!active || index < 0) return;
    for (const offset of [-1, 1]) {
      const neighbor = portfolio.gallery[(index + offset + portfolio.gallery.length) % portfolio.gallery.length];
      const preload = new Image();
      preload.src = neighbor.src;
    }
  });

  function updateUrl(imageId = '') {
    const url = new URL(location.href);
    imageId ? url.searchParams.set('image', imageId) : url.searchParams.delete('image');
    goto(`${url.pathname}${url.search}`, { replaceState: true, noScroll: true, keepFocus: true });
  }

  function next() {
    if (!active) return;
    updateUrl(portfolio.gallery[(index + 1) % portfolio.gallery.length].id);
  }

  function previous() {
    if (!active) return;
    updateUrl(portfolio.gallery[(index - 1 + portfolio.gallery.length) % portfolio.gallery.length].id);
  }

  function close() {
    portfolio.transitionPhase = 'closing';
    const source = getLightboxSource();
    if (!source || !focusedImage || !gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clearLightboxSource();
      animatedImageId = '';
      updateUrl();
      return;
    }
    gsap.to(overlay?.querySelectorAll('button, .count') ?? [], {
      autoAlpha: 0,
      duration: .18,
      ease: 'power2.out'
    });
    if (overlay) {
      gsap.to(overlay, {
        backgroundColor: 'rgba(249, 249, 247, 0)',
        duration: .44,
        ease: 'power2.in'
      });
    }
    const from = focusedImage.getBoundingClientRect();
    const to = source.getBoundingClientRect();
    gsap.to(focusedImage, {
      x: to.left + to.width / 2 - (from.left + from.width / 2),
      y: to.top + to.height / 2 - (from.top + from.height / 2),
      scaleX: to.width / from.width,
      scaleY: to.height / from.height,
      transformOrigin: 'center center',
      duration: .52,
      ease: 'expo.inOut',
      onComplete: () => {
        clearLightboxSource();
        animatedImageId = '';
        updateUrl();
      }
    });
  }

  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') previous();
  }
</script>

<svelte:window onkeydown={keydown} />

{#if active}
  <div bind:this={overlay} class="focus-overlay" role="dialog" aria-modal="true" aria-label="Image viewer">
    <button class="close" onclick={close} aria-label="Close image viewer">Close</button>
    <button class="nav previous" onclick={previous} aria-label="Previous image">←</button>
    <figure>
      <div bind:this={focusedImage} class="focused-media"><ResponsiveImage image={active} sizes="94vw" eager class="focused-image" /></div>
      {#if active.caption}<figcaption>{active.caption}</figcaption>{/if}
    </figure>
    <button class="nav next" onclick={next} aria-label="Next image">→</button>
    <p class="count">{String(index + 1).padStart(2, '0')} / {String(portfolio.gallery.length).padStart(2, '0')}</p>
  </div>
{/if}

<style>
  .focus-overlay { align-items: center; background: rgba(249,249,247,.985); display: grid; inset: 0; justify-items: center; position: fixed; z-index: 100; }
  figure { display: grid; height: 88vh; margin: 0; place-items: center; width: 86vw; }
  .focused-media { display: grid; place-items: center; will-change: transform; }
  :global(.focused-image) { max-height: 88vh; max-width: 86vw; object-fit: contain; width: auto; }
  button { background: transparent; border: 0; color: var(--ink); cursor: pointer; font: inherit; min-height: 40px; min-width: 40px; text-transform: uppercase; transition: opacity .16s ease, transform .16s cubic-bezier(.23,1,.32,1); }
  button:hover, button:focus-visible { opacity: .54; }
  button:active { transform: scale(.96); }
  .close { font-size: .68rem; letter-spacing: .08em; position: absolute; right: 30px; top: 26px; }
  .nav { font-size: 1.2rem; padding: 16px; position: absolute; top: 50%; }
  .previous { left: 16px; } .next { right: 16px; }
  .count { bottom: 22px; font-size: .64rem; font-variant-numeric: tabular-nums; letter-spacing: .1em; position: absolute; }
</style>
