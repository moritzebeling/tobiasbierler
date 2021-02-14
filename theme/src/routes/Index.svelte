<script>

	import { Link } from "svelte-routing";
    import Header from '../components/Header.svelte';
    import Imprint from '../components/Imprint.svelte';

	export let data;

</script>

<main>

    <Header />

    <ol>
        {#each data.pages as project}
            <li>

                <Link to={project.url}>
                    <h2>
                        <span class="year num">{project.year}</span>
                        <span>{project.title}</span>
                    </h2>
                </Link>

            </li>
        {/each}
    </ol>

    <Imprint />

</main>

<style>

    main {
        margin: 1rem;
    }

    li {
        padding-left: 2.9em;
        text-indent: -2.9em;
    }
    li :global( a ){
        text-decoration: underline;
    }

    .year:after {
        content: ',';
    }

</style>
