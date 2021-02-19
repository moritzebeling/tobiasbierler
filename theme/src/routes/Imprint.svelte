<script>

    import { Link } from "svelte-routing";
    export let text;

</script>

<main>

    <Link to="/">Index</Link>

    <aside class="text">
        {@html text}
    </aside>

</main>

<style>

    main {
        margin: 1rem;
    }
    aside {
        margin-top: 1rem;
    }

</style>
