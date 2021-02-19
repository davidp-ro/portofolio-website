<script lang="ts">
  export let name: string;
  export let handle: string;
  export let link: string;
  export let color: string;
  export let textColor: string;
  export let icon: string;
</script>

<a href={link} target="_blank" class="box has-text-left" style="background-color: {color}">
  <div class="columns is-mobile">
    <div class="column is-2 has-text-centered mx-auto my-auto" style="color: {textColor}">
      <div class="icon">
        {@html icon}
      </div>
    </div>
    <div class="column">
      <h4 class="mb-2" style="color: {textColor}">{name}</h4>
      <p style="color: {textColor}">{handle}</p>
    </div>
  </div>
</a>

<style>
  .box {
    transition: transform .1s;
    height: 6rem;
  }

  .box:hover {
    transform: scale(1.02);
  }

  .icon {
    width: 48px;
    height: 48px;
  }

  @media only screen and (max-width: 1024px) {
    .icon {
      width: 36px;
      height: 36px;
    }
  }
</style>