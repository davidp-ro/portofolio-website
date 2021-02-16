<script lang="ts">
  export let imgSrc: string;
  export let name: string;
  export let link: string;
</script>

<a target="_blank" href={link} class="box source mx-4">
  <figure class="image is-128x128 mx-auto my-0 p-2">
    <img src={imgSrc} alt={name}>
  </figure>
  <p class="p-0 mt-3">{name}</p>
</a>

<style>
  .source {
    transition: transform .1s;
  }

  .source:hover {
    transform: scale(1.1);
    box-shadow: none;
  }
</style>