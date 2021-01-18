<script>

    import { Link } from "svelte-routing";
    import Imprint from './Imprint.svelte';

    export let data;
    console.log( data );

</script>

<main>

    <ul>
        {#each data.pages.reverse() as item}
            <li>
                <Link to='{item.url}/1'>

                    <span class="year">{item.year}</span>
                    <span>{item.title}</span>

                </Link>
            </li>
        {/each}
    </ul>

    <Imprint />

</main>

<style>

    main {
        margin: 1rem;
    }

    ul {
		margin-bottom: 1rem;
    }

    li {
        margin: 0.25rem 0;
    }

    li span {
        display: inline-block;
        margin-right: 0.7em;
    }

</style>
