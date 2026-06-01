<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';
  import type { Project } from '$lib/types';
  import { rememberScroll } from '$lib/state.svelte';

  let { project, priority = false }: { project: Project; priority?: boolean } = $props();
  let card: HTMLAnchorElement;
  let gsap: typeof import('gsap').gsap | undefined;
  let ctx: ReturnType<typeof import('gsap').gsap.context> | undefined;

  onMount(() => {
    let disposed = false;
    void import('gsap').then((module) => {
      if (disposed) return;
      ({ gsap } = module);
      ctx = gsap.context(() => {
      const layers = card.querySelectorAll('.stack-layer');
      const [backLeft, backRight, front] = layers;
      const enter = () => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap?.to(backLeft, { x: -16, y: -4, rotation: -8, duration: 0.45, ease: 'power3.out' });
        gsap?.to(backRight, { x: 16, y: -4, rotation: 8, duration: 0.45, ease: 'power3.out' });
        gsap?.to(front, { y: -8, scale: 1.015, duration: 0.45, ease: 'power3.out' });
      };
      const leave = () => {
        gsap?.to(backLeft, { x: -5, y: 5, rotation: -3.5, duration: 0.4, ease: 'power3.out' });
        gsap?.to(backRight, { x: 5, y: 5, rotation: 3.5, duration: 0.4, ease: 'power3.out' });
        gsap?.to(front, { y: 0, scale: 1, duration: 0.4, ease: 'power3.out' });
      };
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      card.addEventListener('focus', enter);
      card.addEventListener('blur', leave);
      return () => {
        card.removeEventListener('mouseenter', enter);
        card.removeEventListener('mouseleave', leave);
        card.removeEventListener('focus', enter);
        card.removeEventListener('blur', leave);
      };
      }, card);
    });
    return () => {
      disposed = true;
      ctx?.revert();
    };
  });

  async function open(event: MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    rememberScroll(location.pathname);
    const cover = card.querySelector('.front') as HTMLElement;
    cover.style.viewTransitionName = `project-${project.slug}`;
    const navigate = () => goto(`/projects/${project.slug}`);
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const transition = document.startViewTransition(navigate);
      transition.finished.finally(() => (cover.style.viewTransitionName = ''));
    } else {
      await navigate();
    }
  }
</script>

<a bind:this={card} class="project-card" href={`/projects/${project.slug}`} onclick={open}>
  <span class="stack" aria-hidden="true">
    <span class="stack-layer back back-left"><ResponsiveImage image={project.stack[0]} sizes="(max-width: 720px) 82vw, 28vw" /></span>
    <span class="stack-layer back back-right"><ResponsiveImage image={project.stack[1]} sizes="(max-width: 720px) 82vw, 28vw" /></span>
    <span class="stack-layer front"><ResponsiveImage image={project.cover} sizes="(max-width: 720px) 82vw, 28vw" eager={priority} /></span>
  </span>
  <span class="card-meta"><span>{project.title}</span><span>{project.year}</span></span>
</a>

<style>
  .project-card { color: inherit; display: block; text-decoration: none; }
  .stack { aspect-ratio: 4 / 5; display: block; position: relative; }
  .stack-layer { inset: 0; overflow: hidden; position: absolute; transform-origin: center 88%; will-change: transform; }
  .back-left { transform: rotate(-3.5deg) translate(-5px, 5px); }
  .back-right { transform: rotate(3.5deg) translate(5px, 5px); }
  .front { background: #eee; z-index: 2; }
  .stack :global(img) { height: 100%; object-fit: cover; width: 100%; }
  .card-meta { display: flex; font-size: .72rem; justify-content: space-between; letter-spacing: .02em; padding-top: 16px; text-transform: uppercase; }
  .card-meta span:last-child { color: var(--muted); }
</style>
