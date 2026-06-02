<script lang="ts">
  let {
    email,
    instagram,
    threads
  }: {
    email: string;
    instagram: string;
    threads: string;
  } = $props();
</script>

<footer class="site-footer">
  <p>For commissions, collaborations, and selected inquiries</p>
  <a class="email" href="mailto:{email}">{email}</a>
  <div>
    <a href={instagram} rel="noreferrer">Instagram</a>
    <a href={threads} rel="noreferrer">Threads</a>
    <span class="location">Warsaw</span>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid #e4e4df;
    display: grid;
    gap: 28px;
    margin: 0 30px;
    padding: 28px 0 24px;
  }

  .site-footer p,
  .site-footer div {
    color: var(--muted);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .site-footer .email {
    font-size: clamp(2.2rem, 6vw, 7rem);
    font-weight: 400;
    letter-spacing: -0.09em;
    line-height: 0.9;
    text-decoration: none;
    width: max-content;
  }

  .site-footer div {
    display: flex;
    gap: 18px;
    justify-content: flex-end;
  }

  .site-footer div a {
    color: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    text-decoration: none;
    text-transform: inherit;
  }

  @media (max-width: 760px) {
    .site-footer {
      gap: 24px;
      margin: 0 20px;
    }

    .site-footer .email {
      font-size: clamp(1.75rem, 8.2vw, 3rem);
      overflow-wrap: anywhere;
      width: auto;
    }

    .site-footer div {
      justify-content: flex-start;
    }

    .site-footer .location {
      margin-left: auto;
    }
  }
</style>
