<script lang="ts">
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';

  let { data } = $props();

  const bioParagraphs = $derived(data.profile.bio.split('\n\n'));
</script>

<svelte:head><title>{data.profile.descriptor} — Lina Tsapova</title></svelte:head>

<section>
  <div class="portrait">
    <ResponsiveImage image={data.profile.portrait} sizes="(max-width: 760px) 100vw, 48vw" eager />
  </div>
  <div class="copy">
    <p class="eyebrow">{data.profile.descriptor}</p>
    <h1>{data.profile.headline}</h1>
    <div class="bio">
      {#each bioParagraphs as paragraph}
        <p>{paragraph}</p>
      {/each}
    </div>
    <div class="links">
      <a href="mailto:{data.profile.email}">{data.profile.email}</a>
      <a href={data.profile.instagram} rel="noreferrer">Instagram</a>
      <a href={data.profile.threads} rel="noreferrer">Threads</a>
    </div>
  </div>
</section>

<style>
  section { display: grid; gap: clamp(40px,7vw,120px); grid-template-columns: minmax(0,1fr) minmax(0,1fr); grid-template-rows: minmax(0,1fr); min-height: calc(100svh - 100px); padding: 54px 30px 30px; }
  .portrait { height: 100%; max-height: calc(100svh - 184px); min-height: 0; overflow: hidden; }
  .portrait :global(.frame) { min-height: 0; overflow: hidden; }
  .portrait :global(img),
  .portrait :global(.skeleton) { height: 100%; object-fit: cover; outline: 1px solid rgba(0,0,0,.1); width: 100%; }
  .copy { align-self: end; max-width: 620px; padding-bottom: 22px; }
  p,h1 { margin: 0; }
  .eyebrow { color: var(--muted); font-size: .54rem; letter-spacing: .1em; text-transform: uppercase; }
  h1 { font-size: clamp(3.2rem,6vw,6.9rem); font-weight: 400; letter-spacing: -.09em; line-height: .9; margin: 24px 0 55px; text-wrap: balance; }
  .bio { font-size: .92rem; line-height: 1.52; max-width: 460px; text-wrap: pretty; }
  .bio p + p { margin-top: 16px; }
  .links { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 46px; }
  a { align-items: center; display: flex; font-size: .68rem; letter-spacing: .09em; min-height: 22px; position: relative; text-decoration: none; text-transform: uppercase; transition: color .16s cubic-bezier(.23,1,.32,1); }
  a::after { background: currentColor; bottom: .38em; content: ''; height: 1px; left: 0; position: absolute; right: 0; transform: scaleX(0); transform-origin: right; transition: transform .2s cubic-bezier(.23,1,.32,1); }
  @media (hover:hover) and (pointer:fine) {
    a:hover::after,
    a:focus-visible::after { transform: scaleX(1); transform-origin: left; }
  }
  @media(max-width:760px) { section { display: block; min-height: auto; padding: 28px 20px 80px; } .portrait { height: 55vh; max-height: none; } .copy { padding: 55px 0 0; } h1 { margin-bottom: 38px; } }
</style>
