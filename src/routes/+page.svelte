<script lang="ts">
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';

  let { data } = $props();

  const categories = $derived(
    data.workCategories.map((category) => ({
      ...category,
      image: category.images[0] ?? null
    }))
  );

  const landingLines = $derived(data.siteSettings.landingStatement.split('\n'));
</script>

<svelte:head><title>{data.siteSettings.siteTitle}</title></svelte:head>

<section class="hero">
  <div class="hero-copy">
    <p>Modeling and photography</p>
    <h1>
      {#each landingLines as line, index}
        {line}{#if index < landingLines.length - 1}<br />{/if}
      {/each}
    </h1>
    <a class="explore" href="#works"><span>Explore works</span><i aria-hidden="true">↓</i></a>
  </div>
  <div class="hero-image">
    <ResponsiveImage image={data.siteSettings.heroImage} sizes="(max-width: 760px) 100vw, 48vw" eager />
  </div>
  <p class="hero-note">{data.siteSettings.heroNote}</p>
</section>

<section class="works" id="works" aria-labelledby="works-title">
  <div class="section-intro">
    <p>Selected bodies of work</p>
    <h2 id="works-title">Choose a direction.</h2>
  </div>
  <div class="category-grid">
    {#each categories as category, index}
      <a class="category" href={`/work/${category.slug}`}>
        <span class="category-image">
          <ResponsiveImage image={category.image} sizes="(max-width: 760px) 100vw, 50vw" eager={index === 0} />
        </span>
        <span class="category-meta">
          <span>
            <small>0{index + 1}</small>
            <strong>{category.title}</strong>
          </span>
          <i aria-hidden="true">↗</i>
        </span>
      </a>
    {/each}
  </div>
</section>

<style>
  p,h1,h2 { margin: 0; }
  .hero { display: grid; grid-template-columns: minmax(0,1fr) minmax(360px,.72fr); min-height: calc(100svh - 92px); overflow: hidden; padding: 36px 30px 30px; position: relative; }
  .hero-copy { align-self: center; padding: 30px 0 30px clamp(0px,4vw,64px); position: relative; z-index: 1; }
  .hero-copy p, .section-intro p, .hero-note { color: var(--muted); font-size: .64rem; letter-spacing: .12em; text-transform: uppercase; }
  h1 { font-size: clamp(5rem,12vw,13rem); font-weight: 400; letter-spacing: -.11em; line-height: .79; margin: 24px 0 46px; text-wrap: balance; }
  .explore { align-items: center; display: inline-flex; font-size: .68rem; gap: 14px; letter-spacing: .1em; min-height: 44px; text-decoration: none; text-transform: uppercase; }
  .explore i { font-size: 1.05rem; font-style: normal; transition: transform .24s cubic-bezier(.23,1,.32,1); }
  .explore:hover i, .explore:focus-visible i { transform: translateY(5px); }
  .hero-image { min-height: 0; overflow: hidden; }
  .hero-image :global(img),
  .hero-image :global(.skeleton) { height: 100%; object-fit: cover; outline: 1px solid rgba(0,0,0,.1); width: 100%; }
  .hero-note { bottom: 34px; left: 30px; position: absolute; }
  .works { padding: clamp(110px,14vw,190px) 30px clamp(120px,15vw,210px); scroll-margin-top: 100px; }
  .section-intro { display: flex; justify-content: space-between; margin-bottom: 62px; }
  h2 { font-size: clamp(2.8rem,5.6vw,6rem); font-weight: 400; letter-spacing: -.085em; line-height: .92; text-wrap: balance; }
  .category-grid { display: grid; gap: 16px; grid-template-columns: repeat(2,minmax(0,1fr)); }
  .category { color: inherit; display: block; text-decoration: none; }
  .category-image { aspect-ratio: 1 / 1.12; display: block; overflow: hidden; }
  .category-image :global(img),
  .category-image :global(.skeleton) { height: 100%; object-fit: cover; outline: 1px solid rgba(0,0,0,.1); transition: transform .5s cubic-bezier(.23,1,.32,1); width: 100%; }
  .category-meta { align-items: end; display: flex; justify-content: space-between; padding-top: 18px; }
  .category-meta span { display: grid; gap: 8px; }
  small { color: var(--muted); font-size: .62rem; font-variant-numeric: tabular-nums; letter-spacing: .08em; }
  strong { font-size: clamp(2rem,3.5vw,4.4rem); font-weight: 400; letter-spacing: -.08em; line-height: .9; }
  .category-meta i { font-size: 1.3rem; font-style: normal; transition: transform .22s cubic-bezier(.23,1,.32,1); }
  .category:hover .category-image :global(img), .category:focus-visible .category-image :global(img) { transform: scale(1.035); }
  .category:hover .category-meta i, .category:focus-visible .category-meta i { transform: translate(4px,-4px); }
  @media (hover:hover) and (pointer:fine) { .category-image :global(img) { will-change: transform; } }
  @media (max-width:760px) {
    .hero { display: block; min-height: auto; padding: 54px 20px 20px; }
    .hero-copy { padding: 50px 0 58px; }
    h1 { font-size: clamp(5.6rem,26vw,8rem); }
    .hero-image { height: 57svh; }
    .hero-note { bottom: 35px; left: 36px; }
    .works { padding: 112px 20px 120px; }
    .section-intro { display: block; margin-bottom: 44px; }
    h2 { margin-top: 14px; }
    .category-grid { display: block; }
    .category + .category { margin-top: 64px; }
  }
</style>
