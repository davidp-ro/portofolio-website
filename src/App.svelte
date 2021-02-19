<script lang="ts">
  let loaded = false;
  let showConsentPrompt = false;

  // Remove safe-text because the script loaded sucesfully
  document.getElementById("safe-text").remove();
  
  import { page } from "./stores";
  import switchPage from "./utils/switchPage";
  // import CookieManager from "./utils/cookieManager";

  import Home from "./pages/Home.svelte";
  import About from "./pages/About.svelte";
  import Work from "./pages/Work.svelte";
  import Contact from "./pages/Contact.svelte";

  import Consent from "./pages/components/Consent.svelte";

  import MediaQuery from "./utils/MediaQuery.svelte";
  import UpdateMQ from "./utils/UpdateMQ.svelte";

  /**
   * If there is a page in the URL, switch to it. (only on inital load)
   * 
   * @example /?contact will switch to the contacts page.
   */
  function reactToURL(): void {
    if (!loaded) {
      const splitUrl = window.location.href.split("/");
      let urlPage = splitUrl[splitUrl.length - 1];
      if (urlPage.length == 0) return; // No page in url, exit
      urlPage = urlPage.replace(/\?*\#*/gm, '');
      switchPage(urlPage);
    }
  }
  reactToURL();

  // TODO: Made this in advance, uncomment when google analytics is implemented
  // let consent = CookieManager.getCookie("acceptedCookies");
  // if (consent !== null) {
  //   showConsentPrompt = false;
  // }

  loaded = true;
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
