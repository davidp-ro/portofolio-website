<script>
  import { mediaQuery } from "../stores";
  import { fade } from "svelte/transition";

  import Introduction from "./components/home/Introduction.svelte";
  import Buttons from "./components/home/Buttons.svelte";
</script>

<section class="content" transition:fade="{{duration: 300}}">
  {#if $mediaQuery === "desktop"}
    <div style="height: 6.9rem" />
  {/if}

  <Introduction />

  {#if $mediaQuery === "desktop"}
    <div style="height: 10rem" />
  {/if}

  <Buttons />
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
