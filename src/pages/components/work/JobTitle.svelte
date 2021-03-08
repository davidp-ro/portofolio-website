<script lang="ts">
  export let title: string;
  export let location: string;
  export let duration: string;
  export let workplace = "";

  import { mediaQuery } from "../../../stores";
</script>

<div class="columns m-0 is-vcentered">
  <div class="column m-0">
    <h3 class="m-0">{title}</h3>
  </div>
  {#if $mediaQuery == "desktop"}
    <div class="column m-0 has-text-right">
      <p class="m-0">{duration} <small>{location}</small></p>
    </div>
  {:else}
    <div class="column m-0 pt-0">
      <p class="m-0">{duration} <small>{location}</small></p>
    </div>
  {/if}
</div>

<!-- Conditional horizontal bar (if workplace !empty, show it in the center) -->
{#if workplace != "" && $mediaQuery != "mobile"}
  <div class="columns is-vcentered has-text-centered">
    <div class="column">
      <p />
      <hr class="mx-0" style="background-color: var(--primary)" />
    </div>
    <div class="column is-3">{workplace}</div>
    <div class="column">
      <p />
      <hr class="mx-0" style="background-color: var(--primary)" />
    </div>
  </div>
{:else}
  {#if workplace != ""}
  <div class="columns is-vcentered has-text-centered is-mobile">
    <div class="column">
      <p />
      <hr class="mx-0" style="background-color: var(--primary)" />
    </div>
    <div class="column is-5">{workplace}</div>
    <div class="column">
      <p />
      <hr class="mx-0" style="background-color: var(--primary)" />
    </div>
  </div>
  {:else}
  <div class="columns is-vcentered has-text-centered is-mobile">
    <div class="column">
      <p />
      <hr class="mx-0" style="background-color: var(--primary)" />
    </div>
  </div>
  {/if}
{/if}
