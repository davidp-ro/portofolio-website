<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Footer from "./components/Footer.svelte";
  import Socials from "./components/contact/Socials.svelte";
  import Form from "./components/contact/Form.svelte";

  import { fade } from "svelte/transition";
  import { mediaQuery } from "../stores";
</script>

<section class="content" transition:fade={{ delay: 150, duration: 300 }}>
  <Navbar />

  {#if $mediaQuery === "desktop"}
    <div style="height: 3rem" />
  {/if}

  <div class="columns m-0 has-text-centered">
    <!-- Spacer left -->
    {#if $mediaQuery === "desktop"}
      <div class="column is-3" />
    {/if}

    <!-- Content -->
    <div class="column">
      <h3>You can find me here</h3>
      <hr style="background-color: var(--primary)" />
      <Socials />

      <div style="height: 1rem" />

      <h3 class="mb-1">Send me an email</h3>
      <h6><a href="mailto:davidpescariu12@gmail.com">davidpescariu12@gmail.com</a></h6>
      <hr style="background-color: var(--primary)" />
      <Form />
    </div>

    <!-- Spacer right -->
    {#if $mediaQuery === "desktop"}
      <div class="column is-3" />
    {/if}
  </div>

  <Footer />
</section>
