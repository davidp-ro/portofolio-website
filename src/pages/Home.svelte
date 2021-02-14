<script lang="ts">
  import { mediaQuery } from "../stores";
  import { fade } from "svelte/transition";

  import Introduction from "./components/home/Introduction.svelte";
  import Buttons from "./components/home/Buttons.svelte";

  // TODO: Remove when done / cookies are implemented:
  import WIP from "./components/home/WIP.svelte";

  // Make sure to remove the navbar padding
  document.querySelector("body").classList.remove("has-navbar-fixed-top");
</script>

<section class="content" transition:fade="{{duration: 200}}">
  {#if $mediaQuery === "desktop"}
    <div style="height: 5.5rem" />
  {/if}

  <Introduction />

  {#if $mediaQuery === "desktop"}
    <div style="height: 6.9rem" />
  {/if}

  <Buttons />

  {#if $mediaQuery !== "desktop"}
    <div style="height: 9rem" />
  {/if}

  <!-- TODO: Remove -->
  <WIP />
</section>

<style>
  section {
    display: block;
    background: #eee;
    height: 100%;
    width: 100%;
    padding: 4rem;
    box-sizing: border-box;
  }

  @media only screen and (max-width: 769px) {
    section {
      padding: 1rem;
    }
  }
</style>
