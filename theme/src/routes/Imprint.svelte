<script>

    import { Link } from "svelte-routing";
    import Footer from '../components/Footer.svelte';

    export let data;

</script>

<main>

    <aside class="text">
        {@html data.imprint}
    </aside>

    <Footer contact={data.contact}>
        <Link to="/">Index</Link>
    </Footer>

</main>

<style lang="scss">

    main {
        @include padding;
        display: flex;
        min-height: 100vh;
        flex-direction: column;
    }

    aside {
        flex: 1;
        margin-bottom: 1rem;
    }

</style>
