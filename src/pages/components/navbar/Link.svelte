<script lang="ts">
  import { page } from "../../../stores";
  import switchPage from "../../../utils/switchPage";

  import { trackClick } from "../GATracker.svelte";
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
</script>

{#if to === $page}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a class="navbar-item" on:click={() => {switchPage(to); trackClick(to);}}>
    <span class="currentPage">{getDisplayName()}</span>
  </a>
{:else}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a class="navbar-item" on:click={() => {switchPage(to); trackClick(to);}}>
    <span>{getDisplayName()}</span>
  </a>
{/if}

<style>
  .currentPage {
    border-bottom: 0.2rem solid var(--warning);
  }
</style>
