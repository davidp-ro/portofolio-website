<script>
  import { mediaQuery } from "../../../stores";
  import { fade } from "svelte/transition";

  let isVisible = true;
  let hoverCounter = 0;
  let descText = "Student & Developer from Romania";

  if ($mediaQuery === "desktop") {
    document.getElementsByTagName("html")[0].classList.add("is-clipped");
  }

  function fadeInOut() {
    isVisible = false;
    setTimeout(() => {
      isVisible = true;
    }, 200);
  }

  function getRandomColor() {
    let color = randomColor({luminosity: "dark"});
    document.documentElement.style.setProperty("--imageShadowColor", `${color}cc`);
  }
</script>

<div class="columns">
  {#if $mediaQuery === "desktop"}
    <div class="column" />
  {/if}
  <div class="column">
    <h3 class="is-size-3 mt-5 mb-0">Hi! I'm</h3>
    <h1 class="title is-size-1 my-0">David Pescariu</h1>
    {#if (isVisible && $mediaQuery === "desktop")}
      <br />
      <br />
      <h5 class="is-size-5" transition:fade={{ duration: 100 }}>{descText}</h5>
    {/if}
  </div>
  <div class="column is-narrow-desktop">
    <figure class="image">
      <img
        class="is-rounded"
        src="assets/profile.jpg"
        alt="Profile"
        on:mouseenter={() => {
          getRandomColor();
          fadeInOut();
          hoverCounter++;
          descText = "Handsome lad eh?";
        }}
        on:mouseout={() => {
          fadeInOut();
          if (hoverCounter % 5 === 0) {
            descText = "Having fun? :)";
          } else {
            descText = "Student & Developer from Romania";
          }
        }}
      />
      {#if $mediaQuery !== "desktop"}
      <h5 class="is-size-5 mt-4">{descText}</h5>
      {/if}
    </figure>
  </div>
  {#if $mediaQuery === "desktop"}
    <div class="column" />
  {/if}
</div>

<style>
  img {
    height: 256px !important;
    width: 256px !important;
    box-shadow: 0px 0px 20px 18px #aaa;
    transition: transform .3s;
  }
  img:hover {
    box-shadow: 0px 0px 20px 18px var(--imageShadowColor);
    transform: scale(1.2);
  }
  @media only screen and (max-width: 769px) {
    img {
      height: 156px !important;
      width: 156px !important;
    }
  }
</style>
