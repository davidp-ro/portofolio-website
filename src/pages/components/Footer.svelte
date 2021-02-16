<script lang="ts">
  import CookieManager from "../../utils/cookieManager";
</script>

<footer class="footer">
  <div class="content has-text-centered">
    <div class="columns is-vcentered">
      <div class="column">
        <button
          class="button is-rounded is-danger is-outlined"
          on:click={() => {
            CookieManager.eraseAllCookies();
          }}>Delete cookies from this site</button
        >
      </div>
      <div class="column">
        <p class="mb-2">
          <strong>&copy; Copyright 2021 - David Pescariu</strong>
        </p>
        <p>
          Icons from <a target="_blank" href="https://fontawesome.com/license/free"
            >FontAwesome</a
          >
        </p>
      </div>
      <div class="column">
        <p class="info p-2 mx-auto">
          Built with <a target="_blank" href="https://svelte.dev/">Svelte</a>
          and <a target="_blank" href="https://bulma.io/">Bulma</a>
        </p>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    margin-top: 3.5rem;
    padding: 2rem 0 2rem 0;
    background-color: #ffffffaa;

    -webkit-box-shadow: 0px 0px 10px 10px #ffffffaa;
    -moz-box-shadow: 0px 0px 10px 10px #ffffffaa;
    box-shadow: 0px 0px 10px 10px #ffffffaa;
  }

  .info {
    border-radius: 3rem;
    border: 1px solid var(--link);
    padding-left: 1rem !important;
    padding-right: 1rem !important;
    width: fit-content;
  }
</style>
