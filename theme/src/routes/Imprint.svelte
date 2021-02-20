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

<style lang="scss">

    main {
        @include margin;
    }
    aside {
        margin-top: unit();
    }

</style>
