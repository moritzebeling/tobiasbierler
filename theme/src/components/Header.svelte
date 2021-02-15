<script>

    import { Link } from "svelte-routing";

    export let text;

</script>

<header>

    {@html text}

</header>

<style>

    header {
        margin-bottom: 1rem;
    }

</style>
