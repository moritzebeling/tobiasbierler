<script>

    import { Link } from "svelte-routing";
    export let data;
    console.log( data );

</script>

<main>

    <h2>Architekt</h2>

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

</main>

<style>

    main {
        margin: 1.2rem 0;
		padding: 1rem;
    }

    ul {
        margin: 3rem 0;
    }

    li {
        margin: 0.5rem 0;
    }

    li span {
        display: inline-block;
        margin-right: 0.7em;
    }

</style>
