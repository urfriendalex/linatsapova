<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { portfolio } from '$lib/state.svelte';
  import { clearLightboxSource, getLightboxSource, setLightboxSource } from '$lib/lightbox';
  import { setFocusImageParam } from '$lib/focus-url';
  import { imageUrl } from '$lib/image';
  import { scrollToElement } from '$lib/lenis';
  import type { PortfolioImage } from '$lib/types';

  const FOCUS_WIDTH = 2400;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3.25;
  /** Keep full image visible above footer / below close */
  const FIT_INSET_Y = 56;
  const FOCUS_SURFACE = '#f8f8f5';

  let active = $derived(portfolio.gallery.find((image) => image.id === portfolio.activeImage));
  let index = $derived(portfolio.gallery.findIndex((image) => image.id === portfolio.activeImage));

  let gsap = $state<typeof import('gsap').gsap>();
  let overlay = $state<HTMLDivElement>();
  let backdrop = $state<HTMLDivElement>();
  let viewStage = $state<HTMLDivElement>();
  let mediaWrap = $state<HTMLDivElement>();
  let focusImg = $state<HTMLImageElement>();
  let previewSrc = $state('');
  let displaySrc = $state('');
  let fullLoaded = $state(false);
  let openAnimatedId = '';
  let zoomLevel = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let closingImageId = '';
  let dragging = $state(false);
  let dragStartX = 0;
  let dragStartY = 0;
  let dragPanStartX = 0;
  let dragPanStartY = 0;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let pinchStartPanX = 0;
  let pinchStartPanY = 0;
  let pinchStartMidpoint = { x: 0, y: 0 };
  const pointers = new Map<number, { x: number; y: number }>();
  let panLayer = $state<HTMLDivElement>();
  let stageSize = $state({ w: 0, h: 0 });

  const preloaded = new Map<string, Promise<void>>();

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Largest box that fits the full image inside the fullscreen stage (contain). */
  const fitSize = $derived.by(() => {
    if (!active || typeof window === 'undefined') return { width: 0, height: 0 };
    const maxW = stageSize.w || viewStage?.clientWidth || window.innerWidth;
    const maxH = (stageSize.h || viewStage?.clientHeight || window.innerHeight) - FIT_INSET_Y * 2;
    const ratio = active.width / active.height || 1;
    let width = maxW;
    let height = width / ratio;
    if (height > maxH) {
      height = maxH;
      width = height * ratio;
    }
    return { width: Math.round(width), height: Math.round(height) };
  });

  const canPan = $derived(zoomLevel > 1.001);

  const focusSrc = (image: PortfolioImage) => imageUrl(image, FOCUS_WIDTH);

  function preloadSrc(src: string) {
    const existing = preloaded.get(src);
    if (existing) return existing;
    const promise = new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
    preloaded.set(src, promise);
    return promise;
  }

  function preloadGallery() {
    if (!active) return;
    for (const image of portfolio.gallery) preloadSrc(focusSrc(image));
  }

  function panBounds() {
    if (!panLayer || !viewStage || zoomLevel <= 1) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    const view = viewStage.getBoundingClientRect();
    const scaled = panLayer.getBoundingClientRect();
    const overflowX = Math.max(0, (scaled.width - view.width) / 2);
    const overflowY = Math.max(0, (scaled.height - view.height) / 2);
    return {
      minX: -overflowX,
      maxX: overflowX,
      minY: -overflowY,
      maxY: overflowY
    };
  }

  function clampPan() {
    const bounds = panBounds();
    const clamp = (value: number, min: number, max: number) =>
      gsap ? gsap.utils.clamp(min, max, value) : Math.min(max, Math.max(min, value));
    panX = clamp(panX, bounds.minX, bounds.maxX);
    panY = clamp(panY, bounds.minY, bounds.maxY);
  }

  function applyTransform(animate = false) {
    if (!panLayer) return;
    clampPan();
    if (!gsap) {
      panLayer.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomLevel})`;
      return;
    }
    const vars = { x: panX, y: panY, scale: zoomLevel };
    if (animate) {
      gsap.to(panLayer, { ...vars, duration: 0.12, ease: 'power2.out', overwrite: true });
    } else {
      gsap.set(panLayer, { ...vars });
    }
  }

  function resetView() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    endDrag();
    if (panLayer && gsap) {
      gsap.killTweensOf(panLayer);
      gsap.set(panLayer, { x: 0, y: 0, scale: 1 });
    } else if (panLayer) {
      panLayer.style.transform = '';
    }
  }

  async function applyDisplaySrc(src: string) {
    await preloadSrc(src);
    displaySrc = src;
    fullLoaded = true;
    if (!focusImg) return;
    applyTransform();
    if (focusImg.src !== src) focusImg.src = src;
  }

  function sourcePreviewSrc(fallback: string) {
    const source = getLightboxSource();
    return source?.currentSrc || source?.src || fallback;
  }

  function thumbnailButton(imageId: string) {
    return document.querySelector<HTMLButtonElement>(`button[data-image-id="${CSS.escape(imageId)}"]`);
  }

  function scrollToThumbnail(imageId: string) {
    const button = thumbnailButton(imageId);
    if (!button) return;
    scrollToElement(button, { immediate: reducedMotion() });
  }

  function isStageTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest('.view-stage'));
  }

  function clampZoom(value: number) {
    return gsap ? gsap.utils.clamp(MIN_ZOOM, MAX_ZOOM, value) : Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  }

  function pointerPair() {
    const [first, second] = [...pointers.values()];
    return { first, second };
  }

  function midpoint(first: { x: number; y: number }, second: { x: number; y: number }) {
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  }

  function distance(first: { x: number; y: number }, second: { x: number; y: number }) {
    return Math.hypot(second.x - first.x, second.y - first.y);
  }

  function startDrag(pointer: { x: number; y: number }) {
    dragging = zoomLevel > 1;
    dragStartX = pointer.x;
    dragStartY = pointer.y;
    dragPanStartX = panX;
    dragPanStartY = panY;
  }

  function startPinch() {
    const { first, second } = pointerPair();
    if (!first || !second) return;
    pinchStartDistance = distance(first, second);
    pinchStartZoom = zoomLevel;
    pinchStartPanX = panX;
    pinchStartPanY = panY;
    pinchStartMidpoint = midpoint(first, second);
    dragging = false;
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2) {
      const { first, second } = pointerPair();
      if (!first || !second || !viewStage || pinchStartDistance <= 0) return;
      const currentMidpoint = midpoint(first, second);
      const nextZoom = clampZoom(pinchStartZoom * (distance(first, second) / pinchStartDistance));
      const scaleChange = nextZoom / pinchStartZoom;
      const stage = viewStage.getBoundingClientRect();
      const stageCenterX = stage.left + stage.width / 2;
      const stageCenterY = stage.top + stage.height / 2;
      zoomLevel = nextZoom;
      panX =
        currentMidpoint.x -
        stageCenterX -
        (pinchStartMidpoint.x - stageCenterX - pinchStartPanX) * scaleChange;
      panY =
        currentMidpoint.y -
        stageCenterY -
        (pinchStartMidpoint.y - stageCenterY - pinchStartPanY) * scaleChange;
      if (zoomLevel <= 1) {
        panX = 0;
        panY = 0;
      }
      applyTransform();
      return;
    }
    if (!dragging) return;
    panX = dragPanStartX + (event.clientX - dragStartX);
    panY = dragPanStartY + (event.clientY - dragStartY);
    applyTransform();
  }

  function removePointerListeners() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (pointers.size === 1) {
      startDrag([...pointers.values()][0]);
      return;
    }
    if (pointers.size > 1) {
      startPinch();
      return;
    }
    dragging = false;
    removePointerListeners();
    clampPan();
    applyTransform(true);
  }

  function onPointerDown(event: PointerEvent) {
    if ((event.pointerType === 'mouse' && event.button !== 0) || !isStageTarget(event.target)) return;
    if ((event.target as HTMLElement).closest('button')) return;
    if (event.pointerType === 'mouse' && zoomLevel <= 1) return;
    const firstPointer = pointers.size === 0;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.preventDefault();

    if (firstPointer) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }
    if (pointers.size >= 2) {
      startPinch();
    } else {
      startDrag({ x: event.clientX, y: event.clientY });
    }
  }

  function endDrag() {
    pointers.clear();
    dragging = false;
    removePointerListeners();
  }

  onMount(() => {
    void import('gsap').then((module) => {
      gsap = module.gsap;
    });
    return () => endDrag();
  });

  $effect(() => {
    if (!viewStage) return;
    const update = () => {
      stageSize = { w: viewStage!.clientWidth, h: viewStage!.clientHeight };
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(viewStage);
    return () => ro.disconnect();
  });

  $effect(() => {
    const isOpen = Boolean(active);
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousThemeColor = themeColor?.content;

    document.documentElement.classList.toggle('focus-open', isOpen);
    document.body.classList.toggle('focus-open', isOpen);
    if (isOpen && themeColor) themeColor.content = FOCUS_SURFACE;
    portfolio.transitionPhase = active ? 'open' : 'idle';
    return () => {
      document.documentElement.classList.remove('focus-open');
      document.body.classList.remove('focus-open');
      if (themeColor && previousThemeColor) themeColor.content = previousThemeColor;
    };
  });

  $effect(() => {
    if (!active) {
      openAnimatedId = '';
      previewSrc = '';
      displaySrc = '';
      fullLoaded = false;
      resetView();
      return;
    }

    preloadGallery();
    gsap;

    const isFirstOpen = openAnimatedId === '';
    const src = focusSrc(active);

    if (isFirstOpen) {
      previewSrc = sourcePreviewSrc(src);
      displaySrc = src;
      fullLoaded = false;
      void runOpen();
      return;
    }

    if (openAnimatedId !== active.id) {
      openAnimatedId = active.id;
      resetView();
      previewSrc = sourcePreviewSrc(displaySrc || src);
      displaySrc = src;
      fullLoaded = false;
    }
  });

  async function runOpen() {
    if (!active || !gsap || !overlay || !backdrop || !mediaWrap || !focusImg || !panLayer) return;

    await tick();

    requestAnimationFrame(() => {
      const g = gsap;
      const wrap = panLayer;
      const drop = backdrop;
      const shell = overlay;
      if (!active || !g || !wrap || !drop || !shell || openAnimatedId === active.id) return;
      openAnimatedId = active.id;

      const source = getLightboxSource();
      if (!source || reducedMotion()) {
        portfolio.transitionPhase = 'open';
        return;
      }

      portfolio.transitionPhase = 'opening';

      g.fromTo(drop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
      g.fromTo(
        shell.querySelector('.focus-chrome'),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.24, delay: 0.28, ease: 'power2.out' }
      );

      const from = source.getBoundingClientRect();
      const to = wrap.getBoundingClientRect();
      const scaleX = from.width / Math.max(to.width, 1);
      const scaleY = from.height / Math.max(to.height, 1);

      g.fromTo(
        wrap,
        {
          x: from.left + from.width / 2 - (to.left + to.width / 2),
          y: from.top + from.height / 2 - (to.top + to.height / 2),
          scaleX,
          scaleY,
          transformOrigin: 'center center'
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.72,
          ease: 'expo.inOut',
          clearProps: 'transform',
          onComplete: () => {
            portfolio.transitionPhase = 'open';
          }
        }
      );
    });
  }

  function selectImage(imageId: string) {
    const image = portfolio.gallery.find((item) => item.id === imageId);
    if (!image) return;
    const thumb = thumbnailButton(imageId);
    const thumbImg = thumb?.querySelector('img');
    if (thumbImg) setLightboxSource(thumbImg);
    portfolio.activeImage = imageId;
    setFocusImageParam(imageId);
  }

  function next() {
    if (!active) return;
    selectImage(portfolio.gallery[(index + 1) % portfolio.gallery.length].id);
  }

  function previous() {
    if (!active) return;
    selectImage(portfolio.gallery[(index - 1 + portfolio.gallery.length) % portfolio.gallery.length].id);
  }

  function handleWheel(event: WheelEvent) {
    if (!active || !panLayer) return;
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.focus-footer')) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.14 : 0.14;
    const prevZoom = zoomLevel;
    zoomLevel = clampZoom(zoomLevel + delta);
    if (zoomLevel <= 1) {
      panX = 0;
      panY = 0;
    } else if (prevZoom > 1) {
      clampPan();
    }
    applyTransform(true);
  }

  function finishClose() {
    const id = closingImageId;
    clearLightboxSource();
    openAnimatedId = '';
    portfolio.activeImage = '';
    setFocusImageParam();
    closingImageId = '';
    resetView();
    if (id) requestAnimationFrame(() => scrollToThumbnail(id));
  }

  function close() {
    closingImageId = portfolio.activeImage;
    const thumb = thumbnailButton(closingImageId);
    const thumbImg = thumb?.querySelector('img');
    if (thumbImg) setLightboxSource(thumbImg);

    portfolio.transitionPhase = 'closing';
    resetView();

    const source = getLightboxSource();

    if (!source || !panLayer || !gsap || reducedMotion()) {
      finishClose();
      return;
    }

    const g = gsap;
    const wrap = panLayer;
    const drop = backdrop;
    const shell = overlay;
    if (!g || !wrap || !drop || !shell) {
      finishClose();
      return;
    }

    g.to(shell.querySelector('.focus-chrome'), {
      autoAlpha: 0,
      duration: 0.16,
      ease: 'power2.out'
    });
    g.to(drop, { autoAlpha: 0, duration: 0.38, ease: 'power2.in' });

    const from = wrap.getBoundingClientRect();
    const to = source.getBoundingClientRect();

    g.to(wrap, {
      x: to.left + to.width / 2 - (from.left + from.width / 2),
      y: to.top + to.height / 2 - (from.top + from.height / 2),
      scaleX: to.width / from.width,
      scaleY: to.height / from.height,
      transformOrigin: 'center center',
      duration: 0.5,
      ease: 'expo.inOut',
      onComplete: finishClose
    });
  }

  function keydown(event: KeyboardEvent) {
    if (!active) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') previous();
  }
</script>

<svelte:window onkeydown={keydown} />

{#if active}
  <div
    bind:this={overlay}
    class="focus-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Image viewer"
    onwheel={handleWheel}
  >
    <!-- Blur layer: isolated so mix-blend on UI never re-composites it -->
    <div bind:this={backdrop} class="focus-backdrop" aria-hidden="true"></div>

    <!-- Image + controls share one isolated group; controls blend only here -->
    <div class="focus-composite">
      <div
        bind:this={viewStage}
        class="view-stage"
        role="group"
        aria-label="Zoom and pan image"
        class:can-pan={canPan}
        class:is-dragging={dragging}
        onpointerdown={onPointerDown}
      >
        <div bind:this={mediaWrap} class="stage-media">
          <div
            bind:this={panLayer}
            class="pan-layer"
            style:width="{fitSize.width}px"
            style:height="{fitSize.height}px"
          >
            <img
              class="focused-image preview-image"
              src={previewSrc}
              alt=""
              aria-hidden="true"
              width={active.width}
              height={active.height}
              decoding="async"
              draggable="false"
            />
            <img
              bind:this={focusImg}
              class="focused-image"
              class:full-loaded={fullLoaded}
              src={displaySrc}
              alt={active.alt}
              width={active.width}
              height={active.height}
              decoding="async"
              fetchpriority="high"
              draggable="false"
              onload={() => (fullLoaded = true)}
            />
          </div>
        </div>
      </div>

      <div class="focus-chrome blend-ui">
        <button class="close" onclick={close} aria-label="Close image viewer">Close</button>
        <button class="nav previous" onclick={previous} aria-label="Previous image">
          <span class="arrow-icon nav-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 12H8M8 12l6-6M8 12l6 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
        <button class="nav next" onclick={next} aria-label="Next image">
          <span class="arrow-icon nav-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 12h8M16 12l-6-6M16 12l-6 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>
        <footer class="focus-footer">
          {#if active.caption}<p class="caption">{active.caption}</p>{/if}
          <p class="count">{String(index + 1).padStart(2, '0')} / {String(portfolio.gallery.length).padStart(2, '0')}</p>
        </footer>
      </div>
    </div>
  </div>
{/if}

<style>
  .focus-overlay {
    inset: 0;
    isolation: isolate;
    position: fixed;
    z-index: 100;
  }
  .focus-overlay::before,
  .focus-overlay::after {
    background: #f8f8f5;
    content: '';
    left: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    z-index: 2;
  }
  .focus-overlay::before {
    height: env(safe-area-inset-top, 0px);
    top: 0;
  }
  .focus-overlay::after {
    bottom: 0;
    height: env(safe-area-inset-bottom, 0px);
  }
  .focus-backdrop {
    backdrop-filter: blur(22px) saturate(1.08);
    -webkit-backdrop-filter: blur(22px) saturate(1.08);
    background: rgba(110, 110, 110, 0.58);
    inset: 0;
    isolation: isolate;
    position: absolute;
    transform: translateZ(0);
    z-index: 0;
  }
  .focus-composite {
    inset: 0;
    isolation: isolate;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }
  .view-stage {
    align-items: center;
    display: flex;
    inset: 0;
    justify-content: center;
    overflow: hidden;
    pointer-events: auto;
    position: absolute;
    touch-action: none;
    z-index: 0;
  }
  .view-stage.can-pan {
    cursor: grab;
  }
  .view-stage.is-dragging {
    cursor: grabbing;
  }
  .stage-media {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
  }
  .pan-layer {
    flex-shrink: 0;
    position: relative;
    transform-origin: center center;
    will-change: transform;
  }
  .focused-image {
    display: block;
    height: 100%;
    inset: 0;
    object-fit: contain;
    pointer-events: none;
    position: absolute;
    user-select: none;
    width: 100%;
  }
  .focused-image:not(.preview-image) {
    opacity: 0;
    transition: opacity 0.18s ease;
  }
  .focused-image.full-loaded {
    opacity: 1;
  }
  .focus-chrome {
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  .blend-ui {
    color: #fff;
    mix-blend-mode: difference;
  }

  .focus-footer {
    bottom: 22px;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    text-align: center;
  }
  .caption {
    display: block;
    font-size: 0.72rem;
    margin: 0 auto 0.35rem;
    max-width: min(96vw, 640px);
    opacity: 0.62;
    width: fit-content;
  }
  .count {
    display: block;
    font-size: 0.64rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.1em;
    margin: 0 auto;
    width: fit-content;
  }
  .focus-chrome button {
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
    min-height: 40px;
    min-width: 40px;
    pointer-events: auto;
    position: absolute;
    text-transform: uppercase;
    transition: opacity 0.16s ease, transform 0.16s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .focus-chrome button:hover,
  .focus-chrome button:focus-visible {
    opacity: 0.54;
  }
  .focus-chrome button:active {
    transform: scale(0.96);
  }
  .close {
    font-size: 0.56rem;
    letter-spacing: 0.07em;
    right: 30px;
    top: 26px;
  }
  .arrow-icon {
    display: block;
    line-height: 0;
  }
  .arrow-icon svg {
    display: block;
    height: 1em;
    width: 1em;
  }
  .nav {
    align-items: center;
    display: flex;
    justify-content: center;
    padding: 16px;
    top: 50%;
    translate: 0 -50%;
  }
  .nav-arrow {
    font-size: 1.2rem;
  }
  .previous {
    left: 16px;
  }
  .next {
    right: 16px;
  }
</style>
