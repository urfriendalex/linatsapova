<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { afterNavigate, onNavigate } from '$app/navigation';
  import FocusOverlay from '$lib/components/FocusOverlay.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import { page } from '$app/state';
  import { destroyLenis, initLenis, resizeLenis, setLenisStopped } from '$lib/lenis';
  import { runPageTransition } from '$lib/page-transition';
  import { portfolio } from '$lib/state.svelte';
  import { sanityConfigured } from '$lib/sanity/env';
  import { sampleProfile, sampleSiteSettings } from '$lib/sample-data';

  const menuLinks = [
    { href: '/work/modeling', label: 'Modeling' },
    { href: '/about', label: 'About' },
    { href: '/work/photography', label: 'Photography' }
  ] as const;

  let { children, data } = $props();
  const siteSettings = $derived(data?.siteSettings ?? sampleSiteSettings);
  const profile = $derived(data?.profile ?? sampleProfile);
  const SHELL_COLLAPSE_MS = 340;
  const SHELL_POLISH_MS = 120;

  let menuOpen = $state(false);
  let menuClosing = $state(false);
  let closeInFlight = $state(false);
  let menuShell = $state<HTMLElement | undefined>(undefined);
  let gsap = $state<typeof import('gsap').gsap | undefined>(undefined);
  let menuTimeline: ReturnType<typeof import('gsap').gsap.timeline> | undefined;

  const shellExpanded = $derived(menuOpen || menuClosing);

  onNavigate((navigation) => runPageTransition(navigation));

  onMount(() => {
    initLenis();
    void import('gsap').then((module) => {
      gsap = module.gsap;
    });
    return () => destroyLenis();
  });

  afterNavigate(({ from }) => {
    resizeLenis();
    if (from && menuOpen) void closeMenu();
  });

  $effect(() => {
    setLenisStopped(Boolean(portfolio.activeImage));
  });

  $effect(() => {
    if (!gsap || !menuShell || !menuOpen) return;

    const shell = menuShell;
    const lines = gsap.utils.toArray<HTMLElement>('.menu-link-label', shell);
    const footerItems = gsap.utils.toArray<HTMLElement>('.footer-item', shell);
    let cancelled = false;
    const motion = gsap;

    void tick().then(() => {
      if (cancelled || !menuOpen || !motion) return;
      if (!lines.length) return;

      const body = shell.querySelector<HTMLElement>('.menu-body');
      if (body) motion.set(body, { clearProps: 'maxHeight,paddingBottom' });

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        motion.set(lines, { autoAlpha: 1, yPercent: 0 });
        motion.set(footerItems, { autoAlpha: 1, y: 0 });
        return;
      }

      menuTimeline?.kill();
      motion.set(lines, { autoAlpha: 0, yPercent: 100 });
      motion.set(footerItems, { autoAlpha: 0, y: 8 });
      menuTimeline = motion.timeline({ defaults: { overwrite: true } });
      menuTimeline.to({}, { duration: 0.22 });
      menuTimeline.to(lines, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.55,
        ease: 'expo.out',
        stagger: 0.07
      });
      menuTimeline.to(
        footerItems,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.28,
          ease: 'power3.out',
          stagger: 0.05
        },
        '>-0.05'
      );
    });

    return () => {
      cancelled = true;
      if (!menuClosing) menuTimeline?.kill();
    };
  });

  function wait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  async function closeMenu() {
    if (!menuOpen || closeInFlight) return;
    closeInFlight = true;
    menuClosing = true;

    const motion = gsap;
    const lines =
      motion && menuShell ? motion.utils.toArray<HTMLElement>('.menu-link-label', menuShell) : [];
    const footerItems =
      motion && menuShell ? motion.utils.toArray<HTMLElement>('.footer-item', menuShell) : [];
    const body = menuShell?.querySelector<HTMLElement>('.menu-body');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      if (motion && lines.length && !reduced) {
        menuTimeline?.kill();
        await new Promise<void>((resolve) => {
          menuTimeline = motion.timeline({ onComplete: resolve, defaults: { overwrite: true } });
          menuTimeline.to(footerItems, {
            autoAlpha: 0,
            y: 8,
            duration: 0.16,
            ease: 'power3.in',
            stagger: -0.03
          });
          menuTimeline.to(
            lines,
            {
              autoAlpha: 0,
              yPercent: 100,
              duration: 0.3,
              ease: 'power3.in',
              stagger: -0.05
            },
            0
          );
        });
      } else if (motion) {
        motion.set(lines, { autoAlpha: 0, yPercent: 18 });
        motion.set(footerItems, { autoAlpha: 0, y: 6 });
        await wait(16);
      }

      menuOpen = false;

      if (motion && menuShell && !reduced) {
        const shell = menuShell;
        const chromeH = parseFloat(getComputedStyle(shell).getPropertyValue('--chrome-h'));
        const startH = shell.getBoundingClientRect().height;
        motion.set(shell, {
          height: startH,
          gridTemplateRows: `${chromeH}px 0px`,
          overflow: 'hidden'
        });
        if (body) motion.set(body, { maxHeight: body.scrollHeight, paddingBottom: 16, overflow: 'hidden' });

        await new Promise<void>((resolve) => {
          const collapse = motion.timeline({ onComplete: resolve });
          collapse.to(shell, {
            height: chromeH,
            duration: SHELL_COLLAPSE_MS / 1000,
            ease: 'power3.inOut'
          });
          if (body) {
            collapse.to(
              body,
              {
                maxHeight: 0,
                paddingBottom: 0,
                duration: SHELL_COLLAPSE_MS / 1000,
                ease: 'power3.inOut'
              },
              '<'
            );
          }
        });
        motion.set(shell, { clearProps: 'height,gridTemplateRows,overflow' });
        if (body) motion.set(body, { clearProps: 'maxHeight,paddingBottom,overflow' });
        await wait(SHELL_POLISH_MS);
      } else {
        await wait(reduced ? 16 : SHELL_COLLAPSE_MS);
      }
    } finally {
      menuClosing = false;
      closeInFlight = false;
    }
  }

  function resetShellMotion() {
    if (!gsap || !menuShell) return;
    menuTimeline?.kill();
    const body = menuShell.querySelector<HTMLElement>('.menu-body');
    const targets: HTMLElement[] = [menuShell];
    if (body) targets.push(body);
    gsap.killTweensOf(targets);
    gsap.set(menuShell, { clearProps: 'height,gridTemplateRows,overflow' });
    if (body) gsap.set(body, { clearProps: 'maxHeight,paddingBottom,overflow' });
  }

  function toggleMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (closeInFlight) return;
    if (menuOpen) {
      void closeMenu();
      return;
    }
    resetShellMotion();
    menuClosing = false;
    closeInFlight = false;
    menuOpen = true;
  }
</script>

<svelte:head>
  <meta name="description" content={siteSettings.metaDescription} />
  {#if sanityConfigured}
    <link rel="preconnect" href="https://cdn.sanity.io" />
  {/if}
</svelte:head>

<header
  bind:this={menuShell}
  class:expanded={shellExpanded}
  class="menu-shell site-header"
  role="navigation"
  aria-label="Site"
  data-lenis-prevent
>
  <div class="menu-chrome">
    <a class="brand" href="/">Lina Tsapova</a>
    <nav class="compact-nav" aria-label="Primary">
      {#each menuLinks as link}
        <a href={link.href}>{link.label}</a>
      {/each}
    </nav>
    <button
      onclick={toggleMenu}
      class:open={menuOpen || menuClosing}
      class="menu-trigger"
      type="button"
      aria-expanded={menuOpen}
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
    >
      <span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    </button>
  </div>

  <div class="menu-body" aria-hidden={!shellExpanded}>
    <nav class="menu-links" aria-label="Expanded menu">
      {#each menuLinks as link}
        <a class="menu-link" href={link.href}>
          <span class="menu-link-label">{link.label}</span>
        </a>
      {/each}
    </nav>
    <div class="menu-footer">
      <div class="socials">
        <a class="footer-item" href={profile.instagram} rel="noreferrer">Instagram</a>
        <a class="footer-item" href={profile.threads} rel="noreferrer">Threads</a>
      </div>
      <p class="footer-item">Warsaw</p>
    </div>
  </div>
</header>

<main class="page-main">{@render children()}</main>
{#if page.url.pathname !== '/about'}
  <SiteFooter email={profile.email} instagram={profile.instagram} threads={profile.threads} />
{/if}
<FocusOverlay />

<style>
  :global(*) { box-sizing: border-box; }
  :global(:root) {
    --bg: #f8f8f5;
    --ink: #121212;
    --muted: #8d8d88;
    --menu-surface: rgba(235, 232, 224, 0.88);
    --menu-surface-expanded: rgba(235, 232, 224, 0.94);
    background: var(--bg);
    color: var(--ink);
    font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  :global(html),
  :global(body) {
    background: var(--bg);
    margin: 0;
    min-height: 100%;
  }
  :global(html.focus-open),
  :global(body.focus-open) {
    background: var(--bg);
  }
  :global(body.focus-open) {
    overflow: hidden;
  }
  :global(body.focus-open::after) {
    background: var(--bg);
    bottom: 0;
    content: '';
    height: max(env(safe-area-inset-bottom, 0px), 180px);
    left: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    z-index: 99;
  }
  :global(a) { color: inherit; }

  .menu-shell {
    --menu-ease: cubic-bezier(0.77, 0, 0.175, 1);
    --menu-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --menu-max: 920px;
    --menu-pad-x: 26px;
    --chrome-pad-y: 14px;
    --chrome-h: 64px;
    --menu-body-max: min(480px, calc(100vh - 180px));
    --radius-bar: calc(var(--chrome-h) / 2);
    --radius-panel: 22px;
    background: var(--menu-surface);
    backdrop-filter: blur(20px) saturate(1.08);
    border-radius: var(--radius-bar);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.55) inset,
      0 1px 2px rgba(0, 0, 0, 0.04),
      0 14px 40px rgba(0, 0, 0, 0.07);
    color: var(--ink);
    corner-shape: superellipse(1.12);
    display: grid;
    grid-template-rows: var(--chrome-h) minmax(0, 0fr);
    left: 50%;
    max-width: var(--menu-max);
    overflow: hidden;
    position: fixed;
    top: 28px;
    transform: translateX(-50%);
    transform-origin: top center;
    transition:
      background-color 0.32s var(--menu-ease),
      border-radius 0.28s var(--menu-ease-out),
      box-shadow 0.32s var(--menu-ease),
      grid-template-rows 0.42s var(--menu-ease);
    width: min(calc(100% - 80px), var(--menu-max));
    z-index: 60;
  }

  .menu-shell:not(.expanded) {
    transition:
      background-color 0.26s var(--menu-ease-out),
      border-radius 0.24s var(--menu-ease-out),
      box-shadow 0.26s var(--menu-ease-out),
      grid-template-rows 0.32s var(--menu-ease-out);
  }

  .menu-shell.expanded {
    background: var(--menu-surface-expanded);
    border-radius: var(--radius-panel);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.62) inset,
      0 1px 2px rgba(0, 0, 0, 0.05),
      0 22px 64px rgba(0, 0, 0, 0.1);
    grid-template-rows: var(--chrome-h) minmax(0, 1fr);
    max-height: min(580px, calc(100vh - 120px));
    overflow: visible;
  }

  .menu-chrome {
    align-items: center;
    align-self: stretch;
    box-sizing: border-box;
    display: flex;
    height: var(--chrome-h);
    justify-content: space-between;
    min-height: 0;
    padding: var(--chrome-pad-y) var(--menu-pad-x);
    position: relative;
    z-index: 2;
  }

  .brand {
    align-items: center;
    align-self: center;
    display: inline-flex;
    flex-shrink: 0;
    font-size: 0.92rem;
    font-weight: 500;
    height: auto;
    letter-spacing: -0.02em;
    line-height: 1;
    position: relative;
    text-decoration: none;
    text-transform: uppercase;
    z-index: 2;
  }

  .compact-nav {
    align-items: center;
    display: flex;
    gap: clamp(22px, 3.2vw, 44px);
    height: calc(var(--chrome-h) - (var(--chrome-pad-y) * 2));
    inset: var(--chrome-pad-y) 0;
    justify-content: center;
    left: 0;
    margin: 0;
    opacity: 1;
    pointer-events: auto;
    position: absolute;
    right: 0;
    transition:
      opacity 0.22s var(--menu-ease-out) 0.14s,
      visibility 0s linear 0s;
    visibility: visible;
    white-space: nowrap;
    z-index: 1;
  }

  .menu-shell.expanded .compact-nav {
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.16s var(--menu-ease-out),
      visibility 0s linear 0.16s;
    visibility: hidden;
  }

  .compact-nav a {
    align-items: center;
    display: inline-flex;
    font-size: 0.76rem;
    letter-spacing: 0.04em;
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
    transition: opacity 0.16s var(--menu-ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .compact-nav a:hover,
    .compact-nav a:focus-visible {
      opacity: 0.52;
    }
  }

  .menu-trigger {
    align-items: center;
    align-self: center;
    background: transparent;
    border: 0;
    color: currentColor;
    cursor: pointer;
    display: inline-flex;
    flex-shrink: 0;
    height: calc(var(--chrome-h) - (var(--chrome-pad-y) * 2));
    justify-content: center;
    margin: 0;
    max-height: calc(var(--chrome-h) - (var(--chrome-pad-y) * 2));
    min-width: 40px;
    padding: 0;
    position: relative;
    transition: transform 0.16s var(--menu-ease-out);
    width: 40px;
    z-index: 2;
  }

  .menu-trigger::before {
    content: '';
    inset: -4px;
    position: absolute;
  }

  .menu-trigger:active {
    transform: scale(0.96);
  }

  .menu-icon {
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(2, 5px);
    transition: transform 0.18s ease-out;
  }

  .menu-icon i {
    background: currentColor;
    display: block;
    height: 5px;
    transition: border-radius 0.28s var(--menu-ease-out);
    width: 5px;
  }

  @media (hover: hover) and (pointer: fine) {
    .menu-trigger:hover:not(.open) .menu-icon {
      transform: rotate(45deg);
    }
  }

  .menu-trigger.open .menu-icon {
    transform: rotate(135deg);
  }

  .menu-trigger.open .menu-icon i {
    border-radius: 50%;
  }

  .menu-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--chrome-pad-y);
    margin: 0;
    max-height: 0;
    min-height: 0;
    overflow: hidden;
    padding: 0 var(--menu-pad-x);
    padding-bottom: 0;
    pointer-events: none;
    transition:
      max-height 0.32s var(--menu-ease-out),
      padding-bottom 0.32s var(--menu-ease-out),
      visibility 0s linear 0.32s;
    visibility: hidden;
  }

  .menu-shell.expanded .menu-body {
    max-height: var(--menu-body-max);
    overflow: visible;
    padding-bottom: var(--chrome-pad-y);
    pointer-events: auto;
    transition:
      max-height 0.42s var(--menu-ease),
      padding-bottom 0.42s var(--menu-ease),
      visibility 0s linear 0s;
    visibility: visible;
  }

  .menu-links {
    display: grid;
    gap: clamp(4px, 1.2vw, 10px);
    padding: clamp(20px, 4vw, 40px) 0 clamp(10px, 1.8vw, 18px);
  }

  .menu-link {
    display: block;
    font-size: clamp(2.24rem, 4.76vw, 3.92rem);
    font-weight: 400;
    letter-spacing: -0.085em;
    line-height: 0.9;
    overflow: hidden;
    padding: 4px 0;
    text-decoration: none;
    text-transform: uppercase;
    text-wrap: balance;
    transition: .23s all var(--menu-ease);
  }

  .menu-link-label {
    display: block;
    opacity: 0;
    will-change: transform, opacity;
  }

  @media (hover: hover) and (pointer: fine) {
    .menu-link:hover,
    .menu-link:focus-visible {
      color: var(--muted);
    }
  }

  .menu-footer {
    align-items: center;
    color: var(--muted);
    display: flex;
    font-size: clamp(0.54rem, 1.1vw, 0.66rem);
    justify-content: space-between;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .socials {
    display: flex;
    gap: 18px;
  }

  .socials a {
    align-items: center;
    display: flex;
    text-decoration: none;
    transition: color 0.16s var(--menu-ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .socials a:hover,
    .socials a:focus-visible {
      color: var(--ink);
    }
  }

  .menu-footer p {
    margin: 0;
    display: flex;
    align-items: center;
    font-variant-numeric: tabular-nums;
  }

  .site-header {
    view-transition-name: site-header;
  }

  .page-main {
    background: var(--bg);
    min-height: 100svh;
    padding-top: 100px;
    view-transition-name: page-main;
  }

  :global(::view-transition) {
    background: var(--bg);
  }

  :global(::view-transition-old(site-header)),
  :global(::view-transition-new(site-header)) {
    animation: none;
    height: 100%;
    mix-blend-mode: normal;
  }

  :global(::view-transition-old(site-header)) {
    display: none;
  }

  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation: none;
    mix-blend-mode: normal;
  }

  :global(::view-transition-group(page-main)) {
    animation-duration: 0.56s;
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }

  :global(::view-transition-old(page-main)) {
    animation: page-leave 0.46s cubic-bezier(0.37, 0, 0.63, 1) both;
    background: var(--bg);
    mix-blend-mode: normal;
  }

  :global(::view-transition-new(page-main)) {
    animation: page-enter 0.56s cubic-bezier(0.37, 0, 0.63, 1) 0.04s both;
    background: var(--bg);
    mix-blend-mode: normal;
  }

  :global(::view-transition-group(work-cover-modeling)),
  :global(::view-transition-group(work-cover-photography)) {
    animation-duration: 0.58s;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 2;
  }

  :global(::view-transition-old(work-cover-modeling)),
  :global(::view-transition-new(work-cover-modeling)),
  :global(::view-transition-old(work-cover-photography)),
  :global(::view-transition-new(work-cover-photography)) {
    animation-duration: 0.58s;
    height: 100%;
    mix-blend-mode: normal;
    object-fit: cover;
  }

  @keyframes page-leave {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes page-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 700px) {
    .menu-shell {
      --menu-pad-x: 18px;
      --chrome-pad-y: 12px;
      --chrome-h: 56px;
      --radius-panel: 20px;
      --menu-body-max: min(420px, calc(100vh - 100px));
      top: 14px;
      width: calc(100% - 28px);
    }

    .menu-shell.expanded {
      max-height: min(520px, calc(100vh - 80px));
    }

    .brand {
      font-size: 0.75rem;
    }

    .compact-nav {
      display: none;
    }

    .menu-links {
      padding-top: 20px;
    }

    .menu-link {
      font-size: clamp(1.82rem, 8.4vw, 2.52rem);
    }

    .menu-body {
      padding-bottom: 12px;
    }

    .page-main {
      padding-top: 78px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-shell,
    .menu-shell *,
    .menu-shell *::before,
    .menu-shell *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }

    .menu-trigger:hover:not(.open) .menu-icon,
    .menu-trigger.open .menu-icon {
      transform: none;
    }

    .menu-link-label {
      opacity: 1 !important;
      transform: none !important;
    }

    .menu-shell:not(.expanded) .menu-link-label {
      opacity: 0 !important;
    }

    .footer-item {
      opacity: 1 !important;
      transform: none !important;
    }

    .menu-shell:not(.expanded) .footer-item {
      opacity: 0 !important;
    }

    :global(::view-transition-old(root)),
    :global(::view-transition-new(root)),
    :global(::view-transition-old(site-header)),
    :global(::view-transition-new(site-header)),
    :global(::view-transition-old(page-main)),
    :global(::view-transition-new(page-main)),
    :global(::view-transition-group(work-cover-modeling)),
    :global(::view-transition-group(work-cover-photography)),
    :global(::view-transition-old(work-cover-modeling)),
    :global(::view-transition-new(work-cover-modeling)),
    :global(::view-transition-old(work-cover-photography)),
    :global(::view-transition-new(work-cover-photography)) {
      animation: none !important;
      display: block;
      filter: none !important;
      transform: none !important;
    }
  }
</style>
