<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import { mediaQuery } from "../stores";
  import { fade } from "svelte/transition";
</script>

<section class="content" transition:fade="{{delay:200, duration: 300}}">
  <Navbar />

  {#if $mediaQuery === "desktop"}
    <div style="height: 3rem" />
  {/if}

  
  <div class="has-text-centered">
    <h3>Currently work in progress</h3>
    <br />
    <p>Meanwhile you can view my CV by clicking the mighty <span style="color: var(--danger)">Hire Me!</span> button</p>
  </div>
</section>