<script>

    import { Link } from "svelte-routing";
    import Imprint from './Imprint.svelte';

    export let data;
    console.log( data );

</script>

<main>

    <ul>
        {#each data.pages as item}
            <li>
                <Link to='{item.url}/1'>

                    <span class="year">{item.year}</span>
                    <span>{item.title}</span>

                </Link>
            </li>
        {/each}
    </ul>

    <aside>
        <Imprint />
    </aside>

</main>

<style>

    main {
		padding: 2rem 1rem 1rem;
    }

    ul {
        margin: 1rem 0;
    }

    li {
        margin: 0.25rem 0;
    }

    li span {
        display: inline-block;
        margin-right: 0.7em;
    }

</style>
