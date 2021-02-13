<script lang="ts">
  import { mediaQuery } from "../stores";
  export let newMediaQuery: string;

  console.debug(`MQ::Update -> ${newMediaQuery}`);
  mediaQuery.update(_ => newMediaQuery);
</script>