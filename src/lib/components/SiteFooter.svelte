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
  <div class="footer-meta">
    <a href={instagram} rel="noreferrer">Instagram</a>
    <a href={threads} rel="noreferrer">Threads</a>
    <span class="location">Warsaw</span>
  </div>
  <p class="studio-credit">
    Built by <a href="https://yansons.online" target="_blank" rel="noreferrer">yansons.online</a>
  </p>
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
    position: relative;
    text-decoration: none;
    width: max-content;
  }

  .site-footer .email::after {
    background: currentColor;
    bottom: -0.08em;
    content: '';
    height: 0.04em;
    left: 0.02em;
    position: absolute;
    right: 0.1em;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.26s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .site-footer .footer-meta {
    display: flex;
    gap: 18px;
    justify-content: flex-end;
  }

  .site-footer .footer-meta a,
  .site-footer .studio-credit a {
    color: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    position: relative;
    text-decoration: none;
    text-transform: inherit;
    transition: color 0.16s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .site-footer .footer-meta a::after,
  .site-footer .studio-credit a::after {
    background: currentColor;
    bottom: -0.32em;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .site-footer .studio-credit {
    font-size: 0.52rem;
    letter-spacing: 0.08em;
    margin: 8px 0 0;
    opacity: 0.62;
    text-align: right;
  }

  @media (hover: hover) and (pointer: fine) {
    .site-footer .email:hover::after,
    .site-footer .email:focus-visible::after {
      transform: scaleX(1);
    }

    .site-footer .footer-meta a:hover,
    .site-footer .footer-meta a:focus-visible,
    .site-footer .studio-credit a:hover,
    .site-footer .studio-credit a:focus-visible {
      color: var(--ink);
    }

    .site-footer .footer-meta a:hover::after,
    .site-footer .footer-meta a:focus-visible::after,
    .site-footer .studio-credit a:hover::after,
    .site-footer .studio-credit a:focus-visible::after {
      transform: scaleX(1);
      transform-origin: left;
    }
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

    .site-footer .footer-meta {
      justify-content: flex-start;
    }

    .site-footer .location {
      margin-left: auto;
    }

    .site-footer .studio-credit {
      margin-top: 4px;
      text-align: left;
    }
  }
</style>
