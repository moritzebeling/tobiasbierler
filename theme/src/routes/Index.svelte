<script>

	import { Link } from "svelte-routing";
    import { num } from '../utilities/getProject.js';

	export let data;

</script>

<main>

    <header>
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

    <footer>
        {@html data.footer}
    </footer>

    <Link to="impressum">Impressum</Link>

</main>

<style lang="scss">

    main {
        @include padding;
        display: flex;
        min-height: 100vh;
        flex-direction: column;
    }

    ol {
        margin: unit( 0.25 ) 0;
        @include large;
        flex: 1;
    }

    $indent: 1.7em;

    li {
        padding-left: $indent;
        margin: unit( 0.5 ) 0;
    }

    .i {
        min-width: $indent;
        margin-left: -$indent;
        display: inline-block;
    }

    article h2 {
        display: inline;
    }

</style>
