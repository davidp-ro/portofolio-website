<script lang="ts">
  import { doNotTrack, mediaQuery } from "../../stores";
  import { fade } from "svelte/transition";
  import CookieManager from "../../utils/cookieManager";

  let show = true;

  function acceptedCookies(): void {
    console.debug("[Cookies] Accepted");

    // Set consent cookie
    const dateAdded = Date().split(" ").slice(0, 5).join("_");
    CookieManager.setCookie("acceptedCookies", `yes+${dateAdded}`, 365);

    // Update consent
    gtag("consent", "update", {
      analytics_storage: "granted",
    });

    // Update dnt store
    doNotTrack.update(() => "");

    // And finally refresh
    location.href = "/";
  }
</script>

{#if show}
  {#if $mediaQuery == "desktop"}
    <article
      id="cookieMessage"
      class="consent message is-danger"
      transition:fade
    >
      <div class="message-body">
        <div class="columns is-vcentered">
          <div class="column is-three-quarters">
            <strong>Hey there!</strong> I would like to use some basic analytics
            to track traffic, so I need to store some cookies,
            <a href="https://www.cookiesandyou.com/">what are cookies?</a>. Is
            that OK with you?
          </div>
          <div class="column">
            <button
              class="button is-danger is-outlined"
              on:click={() => {
                show = false;
              }}>Nope</button
            >
            <button
              class="button is-primary is-outlined"
              on:click={acceptedCookies}>Sure!</button
            >
          </div>
        </div>
      </div>
    </article>
  {:else}
    <article
      id="cookieMessage"
      class="consent-mobile message is-danger"
      transition:fade
    >
      <div class="message-body p-1">
        <span class="mobile-text">
          <strong>Hey there!</strong> I would like to use some basic analytics
          to track traffic, so I need to store some cookies,
          <a href="https://www.cookiesandyou.com/">what are cookies?</a>. Is
          that OK with you?
        </span>
        <br />
        <div class="columns is-mobile">
          <div class="column">
            <button
              class="button is-danger is-outlined is-fullwidth"
              on:click={() => {
                show = false;
              }}>Nope</button
            >
          </div>
          <div class="column">
            <button
              class="button is-primary is-outlined is-fullwidth"
              on:click={acceptedCookies}>Sure!</button
            >
          </div>
        </div>
      </div>
    </article>
  {/if}
{/if}

<style>
  .consent {
    position: fixed;
    max-width: 50rem;
    left: 50%;
    top: 90%;
    transform: translate(-50%);
  }

  .consent-mobile {
    position: fixed;
    min-width: 18rem;
    left: 50%;
    top: 75%;
    transform: translate(-50%);
  }

  .mobile-text {
    font-size: 14px !important;
  }
</style>
