<script lang="ts">
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
  import { projects } from '$lib/data';
  const portrait = projects[1].cover;
</script>

<svelte:head><title>About / Contact — Lina Tsapova</title></svelte:head>

<section>
  <div class="portrait"><ResponsiveImage image={portrait} sizes="(max-width: 760px) 100vw, 48vw" eager /></div>
  <div class="copy">
    <p class="eyebrow">About / Contact</p>
    <h1>Looking for the quieter part of a moment.</h1>
    <div class="bio">
      <p>Lina Tsapova is a photographer and visual artist based in Warsaw. Her work moves between portraiture, landscape, and the architecture of everyday life.</p>
      <p>Available for editorial commissions, selected commercial projects, and collaborations worldwide.</p>
    </div>
    <div class="links">
      <a href="mailto:hello@linatsapova.com">hello@linatsapova.com</a>
      <a href="https://instagram.com/" rel="noreferrer">Instagram</a>
      <a href="https://threads.net/" rel="noreferrer">Threads</a>
    </div>
  </div>
</section>

<style>
  section { display: grid; gap: clamp(40px,7vw,120px); grid-template-columns: minmax(0,1fr) minmax(0,1fr); min-height: calc(100vh - 88px); padding: 54px 30px 30px; }
  .portrait { min-height: 0; overflow: hidden; }
  .portrait :global(img) { height: 100%; object-fit: cover; outline: 1px solid rgba(0,0,0,.1); width: 100%; }
  .copy { align-self: end; max-width: 620px; padding-bottom: 22px; }
  p,h1 { margin: 0; }
  .eyebrow { color: var(--muted); font-size: .64rem; letter-spacing: .1em; text-transform: uppercase; }
  h1 { font-size: clamp(3.2rem,6vw,6.9rem); font-weight: 400; letter-spacing: -.09em; line-height: .9; margin: 24px 0 55px; text-wrap: balance; }
  .bio { font-size: .92rem; line-height: 1.52; max-width: 460px; text-wrap: pretty; }
  .bio p + p { margin-top: 16px; }
  .links { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 46px; }
  a { align-items: center; display: flex; font-size: .68rem; letter-spacing: .09em; min-height: 40px; text-transform: uppercase; }
  @media(max-width:760px) { section { display: block; min-height: auto; padding: 28px 20px 80px; } .portrait { height: 55vh; } .copy { padding: 55px 0 0; } h1 { margin-bottom: 38px; } }
</style>
