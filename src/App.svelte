<script>
  import { page } from "./stores";
  // import CookieManager from "./cookieManager";

  import Home from "./pages/Home.svelte";
  import About from "./pages/About.svelte";
  import Work from "./pages/Work.svelte";
  import Contact from "./pages/Contact.svelte";

  import Consent from "./pages/components/Consent.svelte";

  import MediaQuery from "./MediaQuery.svelte";
  import UpdateMQ from "./UpdateMQ.svelte";

  // TODO: Made this in advance, uncomment when google analytics is implemented
  // let consent = CookieManager.getCookie("acceptedCookies");
  let showConsentPrompt = false;
  // if (consent !== null) {
  //   showConsentPrompt = false;
  // }

  /**
   * FIXME: Bugs and todos:
   *  Content for the new page is loaded before the initial page is gone
   */
</script>

<div class="App">
  <!-- Set mediaQuery to be used in components -->
  <MediaQuery query="(min-width: 1024px)" let:matches>
    {#if matches}
      <UpdateMQ newMediaQuery="desktop" />
    {/if}
  </MediaQuery>
  <MediaQuery query="(min-width: 769px) and (max-width: 1023px)" let:matches>
    {#if matches}
      <UpdateMQ newMediaQuery="tablet" />
    {/if}
  </MediaQuery>
  <MediaQuery query="(max-width: 768px)" let:matches>
    {#if matches}
      <UpdateMQ newMediaQuery="mobile" />
    {/if}
  </MediaQuery>

  <!-- Content -->
  {#if $page === "about"}
    <About />
  {:else if $page === "work"}
    <Work />
  {:else if $page === "contact"}
    <Contact />
  {:else}
    <Home />
  {/if}

  <!-- Consent -->
  {#if showConsentPrompt}
    <Consent />
  {/if}
</div>
