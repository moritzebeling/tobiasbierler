<script>

    import { Link } from "svelte-routing";

    export let data;

</script>

<header>

    <nav>
        <h1>
            <Link to="/">{data.title}</Link>
        </h1>
        <Link to="info">Info</Link>
    </nav>

</header>

<style>

    header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 1rem;
        z-index: 100;
    }

    nav {
        display: flex;
    }

    nav :global(a) {
        margin-right: 0.5em;
    }

    nav > :global(a) {
        opacity: 0;
        transition: opacity 300ms ease;
    }

    nav:hover > :global(a) {
        opacity: 1;
    }

</style>
