<script lang="ts">
  let {
    class: className = '',
    aspectRatio = ''
  }: {
    class?: string;
    aspectRatio?: string;
  } = $props();
</script>

<div
  class="skeleton {className}"
  aria-hidden="true"
  style:aspect-ratio={aspectRatio || undefined}
></div>

<style>
  .skeleton {
    background-color: #ecece8;
    background-image: linear-gradient(
      105deg,
      #ecece8 0%,
      #ecece8 32%,
      #f0f0ec 44%,
      #f8f8f5 50%,
      #f0f0ec 56%,
      #ecece8 68%,
      #ecece8 100%
    );
    background-size: 320% 100%;
    background-repeat: no-repeat;
    display: block;
    height: 100%;
    min-height: 120px;
    outline: 1px solid rgba(0, 0, 0, 0.1);
    width: 100%;
  }

  @media (prefers-reduced-motion: no-preference) {
    .skeleton {
      animation: shimmer 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 120% 0;
    }
    100% {
      background-position: -120% 0;
    }
  }
</style>
