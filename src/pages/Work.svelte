<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import { fade } from "svelte/transition";
</script>

<section class="content" transition:fade="{{delay:200, duration: 300}}">
  <Navbar />
  <h3>Work in progress</h3>
</section>