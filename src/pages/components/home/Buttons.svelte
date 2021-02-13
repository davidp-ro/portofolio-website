<script>
  import { page, mediaQuery } from "../../../stores";

  function switchPage(newPage) {
    document.getElementsByTagName("html")[0].classList.remove("is-clipped");
    page.update((_) => newPage);
  }
</script>

<div class="columns has-text-centered">
  {#if $mediaQuery === "desktop"}
    <div class="column" />
  {/if}

  <!-- Go to About -->
  <div class="column has-text-left"> 
    <!-- svelte-ignore a11y-missing-attribute -->
    <a class="box is-success mx-3" on:click={() => {switchPage("about")}}>
      <div class="rnd" style="background-color: #084c61">
        <svg
          aria-hidden="true"
          class="icon has-text-white"
          style="color: white; position: relative; width: 46px;top: 16px; left: 5px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
          ><path
            fill="currentColor"
            d="M528 32H48A48 48 0 000 80v352a48 48 0 0048 48h480a48 48 0 0048-48V80a48 48 0 00-48-48zm0 400H48V80h480v352zM208 256a64 64 0 10-.1-128.1A64 64 0 00208 256zm-89.6 128h179.2c12.4 0 22.4-8.6 22.4-19.2v-19.2c0-31.8-30.1-57.6-67.2-57.6-10.8 0-18.7 8-44.8 8-26.9 0-33.4-8-44.8-8-37.1 0-67.2 25.8-67.2 57.6v19.2c0 10.6 10 19.2 22.4 19.2zM360 320h112a8 8 0 008-8v-16a8 8 0 00-8-8H360a8 8 0 00-8 8v16a8 8 0 008 8zm0-64h112a8 8 0 008-8v-16a8 8 0 00-8-8H360a8 8 0 00-8 8v16a8 8 0 008 8zm0-64h112a8 8 0 008-8v-16a8 8 0 00-8-8H360a8 8 0 00-8 8v16a8 8 0 008 8z"
          /></svg
        >
      </div>
      <div class="content ml-1 mt-5">
        <h5 class="mt-2">About Me</h5>
        <p>Who I am</p>
      </div>
    </a>
  </div>
  
  <!-- Go to Work -->
  <div class="column has-text-left">
    <!-- svelte-ignore a11y-missing-attribute -->
    <a class="box is-success mx-3" on:click={() => {switchPage("work")}}>
      <div class="rnd" style="background-color: #e3b505">
        <svg
          aria-hidden="true"
          class="icon has-text-white"
          style="color: white; position: relative; width: 46px;top: 16px; left: 5px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
          ><path
            fill="currentColor"
            d="M278.9 511.5l-61-17.7a12 12 0 01-8.2-14.9L346.2 8.7A12 12 0 01361.1.5l61 17.7a12 12 0 018.2 14.9L293.8 503.3a12 12 0 01-14.9 8.2zm-114-112.2l43.5-46.4a12 12 0 00-.8-17.2L117 256l90.6-79.7a12 12 0 00.8-17.2l-43.5-46.4a12 12 0 00-17-.5L3.8 247.2a12 12 0 000 17.5l144.1 135.1a12 12 0 0017-.5zm327.2.6l144.1-135.1a12 12 0 000-17.5L492.1 112.1a12.1 12.1 0 00-17 .5L431.6 159a12 12 0 00.8 17.2L523 256l-90.6 79.7a12 12 0 00-.8 17.2l43.5 46.4a12 12 0 0017 .6z"
          /></svg
        >
      </div>
      <div class="content ml-1 mt-5">
        <h5 class="mt-2">My Work</h5>
        <p>Projects & Experience</p>
      </div>
    </a>
  </div>

  <!-- Go to Contact -->
  <div class="column has-text-left" on:click={() => {switchPage("contact")}}>
    <!-- svelte-ignore a11y-missing-attribute -->
    <a class="box is-success mx-3">
      <div class="rnd" style="background-color: #db504a">
        <svg
          aria-hidden="true"
          class="icon has-text-white"
          style="color: white; position: relative; width: 46px;top: 16px; left: 5px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          ><path
            fill="currentColor"
            d="M256 8C119 8 8 119 8 256a247.9 247.9 0 00383.4 207.8 24 24 0 005.6-35.4L386.8 416a24 24 0 00-31.4-5.2A184.2 184.2 0 0172 256c0-101.5 82.5-184 184-184 100.1 0 184 57.6 184 160 0 38.8-21 79.7-58.2 83.7-17.3-.5-16.9-12.9-13.4-30l23.4-121.1a24 24 0 00-23.6-28.6h-45a13.5 13.5 0 00-13.4 12c-14.7-17.8-40.4-21.7-60-21.7-74.5 0-137.8 62.2-137.8 151.5 0 65.3 36.8 105.8 96 105.8 27 0 57.4-15.6 75-38.3 9.5 34.1 40.6 34.1 70.7 34.1 109 0 150.3-71.6 150.3-147.4C504 95.7 394 8 256 8zm-21.7 304.4c-22.2 0-36-15.6-36-40.7 0-45 30.7-72.8 58.6-72.8 22.3 0 35.6 15.3 35.6 40.8 0 45-33.9 72.7-58.2 72.7z"
          /></svg
        >
      </div>
      <div class="content ml-1 mt-5">
        <h5 class="mt-2">Contact Me</h5>
        <p>Let's get in touch!</p>
      </div>
    </a>
  </div>

  {#if $mediaQuery === "desktop"}
    <div class="column" />
  {/if}
</div>

<style>
  .rnd {
    border-radius: 50%;
    width: 56px;
    height: 56px;
  }
</style>
