<script>
    import { mediaQuery } from "./stores";
    export let newMediaQuery;

    console.debug(`MQ::Update -> ${newMediaQuery}`);
    mediaQuery.update(_ => newMediaQuery);
</script>