<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import FocusOverlay from '$lib/components/FocusOverlay.svelte';

  let { children } = $props();
  let menuOpen = $state(false);
  let menuShell: HTMLElement;
  let gsap: typeof import('gsap').gsap | undefined;
  let menuTimeline: ReturnType<typeof import('gsap').gsap.timeline> | undefined;

  onMount(() => {
    void import('gsap').then((module) => (gsap = module.gsap));
  });

  $effect(() => {
    page.url.pathname;
    menuOpen = false;
  });

  $effect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    if (!gsap || !menuShell) return;
    const lines = gsap.utils.toArray<HTMLElement>('.expanded-label', menuShell);
    const footerItems = gsap.utils.toArray<HTMLElement>('.footer-item', menuShell);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(lines, { autoAlpha: menuOpen ? 1 : 0, yPercent: menuOpen ? 0 : 18 });
      gsap.set(footerItems, { autoAlpha: menuOpen ? 1 : 0, y: 0 });
      return;
    }
    menuTimeline?.kill();
    if (menuOpen) {
      gsap.set(lines, { autoAlpha: 0, yPercent: 105 });
      gsap.set(footerItems, { autoAlpha: 0, y: 8 });
    }
    menuTimeline = gsap.timeline({ defaults: { overwrite: true } });
    if (menuOpen) {
      menuTimeline.to({}, { duration: .34 });
      menuTimeline.to(lines, {
        autoAlpha: 1,
        yPercent: 0,
        duration: .68,
        ease: 'expo.out',
        stagger: .085
      });
      menuTimeline.to(footerItems, {
        autoAlpha: 1,
        y: 0,
        duration: .32,
        ease: 'power3.out',
        stagger: .055
      }, '>-0.04');
    } else {
      menuTimeline.to(footerItems, { autoAlpha: 0, y: 6, duration: .14, ease: 'power2.out' });
      menuTimeline.to(lines, {
        autoAlpha: 0,
        yPercent: 24,
        duration: .24,
        ease: 'power3.out',
        stagger: { each: .04, from: 'end' }
      }, '<');
    }
    return () => document.body.classList.remove('menu-open');
  });

  function openMenu() {
    menuOpen = true;
  }

  function closeMenu() {
    menuOpen = false;
  }
</script>

<svelte:head>
  <meta name="description" content="Lina Tsapova — photographer and visual artist." />
  <link rel="preconnect" href="https://images.unsplash.com" />
</svelte:head>

<header
  bind:this={menuShell}
  class:expanded={menuOpen}
  class="menu-shell"
  role="navigation"
  aria-label="Site"
  onmouseleave={closeMenu}
>
  <div class="compact-row" aria-hidden={menuOpen}>
    <a class="brand" href="/">Lina Tsapova</a>
    <nav aria-label="Primary">
      <a href="/work/modeling">Modeling</a>
      <a href="/about">About</a>
      <a href="/work/photography">Photography</a>
    </nav>
  </div>

  <div class="expanded-menu" aria-hidden={!menuOpen}>
    <a class="expanded-brand" href="/">Lina Tsapova</a>
    <nav aria-label="Expanded menu">
      <a class="expanded-link" href="/work/modeling"><span class="expanded-label">Modeling</span></a>
      <a class="expanded-link" href="/about"><span class="expanded-label">About</span></a>
      <a class="expanded-link" href="/work/photography"><span class="expanded-label">Photography</span></a>
    </nav>
    <div class="menu-footer">
      <div class="socials">
        <a class="footer-item" href="https://instagram.com/" rel="noreferrer">Instagram</a>
        <a class="footer-item" href="https://threads.net/" rel="noreferrer">Threads</a>
      </div>
      <p class="footer-item">Warsaw</p>
    </div>
  </div>

  <button
    class:open={menuOpen}
    class="menu-trigger"
    type="button"
    aria-expanded={menuOpen}
    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
    onmouseenter={openMenu}
    onclick={() => (menuOpen = !menuOpen)}
  >
    <span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
  </button>
</header>

<main>{@render children()}</main>
<FocusOverlay />

<style>
  :global(*) { box-sizing: border-box; }
  :global(:root) { --bg: #f8f8f5; --ink: #121212; --muted: #8d8d88; background: var(--bg); color: var(--ink); font-family: Helvetica Neue, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  :global(body) { margin: 0; }
  :global(body.focus-open), :global(body.menu-open) { overflow: hidden; }
  :global(a) { color: inherit; }
  .menu-shell { background: rgba(230,227,219,.82); backdrop-filter: blur(18px); box-shadow: 0 1px 0 rgba(0,0,0,.04), 0 12px 36px rgba(0,0,0,.04); color: var(--ink); height: 92px; left: 50%; max-width: 1360px; overflow: hidden; padding: 0 26px; position: fixed; top: 28px; transform: translateX(-50%); transform-origin: top center; transition: background-color .3s ease, box-shadow .3s ease, color .3s ease, height .5s cubic-bezier(.77,0,.175,1), top .5s cubic-bezier(.77,0,.175,1), width .5s cubic-bezier(.77,0,.175,1); width: min(calc(100% - 120px),1360px); z-index: 60; }
  .menu-shell.expanded { background: rgba(24,24,23,.93); color: #f8f8f5; height: min(730px,calc(100vh - 56px)); }
  .compact-row { align-items: center; display: flex; height: 92px; justify-content: space-between; opacity: 1; padding-right: 76px; transition: opacity .18s ease; }
  .expanded .compact-row { opacity: 0; pointer-events: none; }
  .brand { font-size: 1rem; font-weight: 500; letter-spacing: -.02em; text-decoration: none; text-transform: uppercase; }
  .compact-row nav { display: flex; gap: clamp(24px,4vw,70px); }
  .compact-row nav a { font-size: .76rem; letter-spacing: .04em; text-decoration: none; text-transform: uppercase; transition: opacity .16s ease; }
  .compact-row nav a:hover, .compact-row nav a:focus-visible { opacity: .52; }
  .menu-trigger { align-items: center; background: transparent; border: 0; color: currentColor; cursor: pointer; display: flex; height: 44px; justify-content: center; padding: 0; position: absolute; right: 20px; top: 24px; transition: transform .16s cubic-bezier(.23,1,.32,1); width: 44px; z-index: 3; }
  .menu-trigger:active { transform: scale(.96); }
  .menu-icon { display: grid; gap: 5px; grid-template-columns: repeat(2,5px); transition: transform .3s cubic-bezier(.77,0,.175,1); }
  .menu-icon i { background: currentColor; display: block; height: 5px; transition: border-radius .3s cubic-bezier(.23,1,.32,1); width: 5px; }
  .menu-trigger.open .menu-icon { transform: rotate(45deg); }
  .menu-trigger.open .menu-icon i { border-radius: 50%; }
  .expanded-menu { display: flex; flex-direction: column; inset: 0; justify-content: flex-end; opacity: 0; padding: 150px 26px 20px; pointer-events: none; position: absolute; transition: opacity .28s cubic-bezier(.23,1,.32,1); }
  .expanded .expanded-menu { opacity: 1; pointer-events: auto; }
  .expanded-brand { font-size: 1rem; font-weight: 500; left: 26px; letter-spacing: -.02em; position: absolute; text-decoration: none; text-transform: uppercase; top: 37px; }
  .expanded-menu nav { display: grid; margin-bottom: auto; margin-top: auto; width: max-content; }
  .expanded-link { display: block; font-size: clamp(4.3rem,7vw,7.5rem); font-weight: 400; letter-spacing: -.08em; line-height: .88; overflow: hidden; padding: 5px 0; text-decoration: none; text-transform: uppercase; }
  .expanded-label { display: block; opacity: 0; transition: color .16s ease; will-change: transform, opacity; }
  .expanded-link:hover, .expanded-link:focus-visible { color: rgba(248,248,245,.5); }
  .menu-footer { align-items: center; color: rgba(248,248,245,.58); display: flex; font-size: .66rem; justify-content: space-between; letter-spacing: .08em; text-transform: uppercase; }
  .socials { display: flex; gap: 18px; }
  .socials a { align-items: center; display: flex; min-height: 44px; text-decoration: none; }
  .menu-footer p { margin: 0; }
  main { padding-top: 92px; }
  :global(::view-transition-old(root)), :global(::view-transition-new(root)) { animation-duration: .42s; animation-timing-function: cubic-bezier(.22,.61,.36,1); }
  @media (max-width: 700px) {
    .menu-shell { height: 68px; padding: 0 16px; top: 14px; width: calc(100% - 28px); }
    .menu-shell.expanded { height: calc(100vh - 28px); }
    .compact-row { height: 68px; padding-right: 54px; }
    .brand { font-size: .75rem; }
    .compact-row nav { display: none; }
    .menu-trigger { right: 8px; top: 12px; }
    .expanded-menu { padding: 90px 16px 18px; }
    .expanded-brand { font-size: .75rem; left: 16px; top: 27px; }
    .expanded-menu nav { width: 100%; }
    .expanded-link { font-size: clamp(3rem,13vw,4.2rem); line-height: .9; max-width: 100%; padding: 6px 0; }
    .menu-footer { align-items: end; }
    .menu-footer p { margin-bottom: 15px; }
    main { padding-top: 68px; }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(*), :global(*::before), :global(*::after) { animation-duration: .01ms !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
  }
</style>
