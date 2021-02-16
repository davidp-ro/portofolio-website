<script lang="ts">
  import { page } from "../../../stores";
  export let to: string;

  function getDisplayName(): string {
    switch(to) {
      case "about":
        return "About Me";
      case "work":
        return "My Work";
      case "contact":
        return "Contact Me";
      default:
        return "Fail";
    }
  }

  function switchPage(newPage: string) {
    page.update((_) => newPage);
    window.history.pushState({page: newPage}, `@davidp-ro - ${newPage}`, `?${newPage}`);
  }
</script>

{#if to === $page}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a class="navbar-item" on:click={() => {switchPage(to)}}>
    <span class="currentPage">{getDisplayName()}</span>
  </a>
{:else}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a class="navbar-item" on:click={() => {switchPage(to)}}>
    <span>{getDisplayName()}</span>
  </a>
{/if}

<style>
  .currentPage {
    border-bottom: 0.2rem solid var(--warning);
  }
</style>
