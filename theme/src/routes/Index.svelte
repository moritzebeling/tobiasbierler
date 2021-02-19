<script>

	import { Link } from "svelte-routing";
    import { num } from '../utilities/getProject.js';

	export let data;

</script>

<main>

    <header class="text">
        {@html data.header}
    </header>

    <ol>
        {#each data.pages as project, i}
            <li>
                <Link to={project.url}>
                    <article>

                        <span class="i num">{num(i, data.pages.length)}</span><h2>{project.title}</h2>

                        <p>
                            {#if project.hasOwnProperty('subtitle')}
                                <span>{project.subtitle}</span>,
                            {/if}
                            <span class="year">{project.year}</span>
                        </p>

                    </article>
                </Link>
            </li>
        {/each}
    </ol>

    <footer class="text">
        {@html data.footer}
    </footer>

    <Link to="impressum">Impressum</Link>

</main>

<style>

    main {
        padding: 1rem;
        display: flex;
        min-height: 100vh;
        flex-direction: column;
    }

    ol {
        font-size: 1.4rem;
        flex: 1;
    }
    li {
        padding-left: 1.9em;
        margin: 0.5em 0;
    }
    .i {
        min-width: 1.9em;
        margin-left: -1.9em;
        display: inline-block;
    }

    article h2 {
        display: inline;
    }

</style>
