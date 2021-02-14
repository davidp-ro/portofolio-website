<script lang="ts">
  import { mediaQuery } from "../stores";
  export let newMediaQuery: string;

  console.debug(`MQ::Update -> ${newMediaQuery}`);
  if (newMediaQuery !== "desktop") {
    document.getElementsByTagName("html")[0].classList.remove("is-clipped");
  }
  mediaQuery.update(_ => newMediaQuery);
</script>