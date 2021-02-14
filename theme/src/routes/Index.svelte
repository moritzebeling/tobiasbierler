<script>

	import { Link } from "svelte-routing";
	import { imageIndex } from '../utilities/imageIndex.js';
    import Header from '../components/Header.svelte';
    import Grid from '../components/Grid.svelte';
    import Img from '../components/Img.svelte';

    import Imprint from './Imprint.svelte';

	export let data;

</script>

<main>

    <Header />

    <ol>
        {#each data.pages.reverse() as project}
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

    li :global( a ){
        text-decoration: underline;
    }

    .year:after {
        content: ',';
    }

</style>
