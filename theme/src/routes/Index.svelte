<script>

	import { Link } from "svelte-routing";
    import { num } from '../utilities/getProject.js';
    import Footer from '../components/Footer.svelte';

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

    <Footer contact={data.contact}>
        <Link to="impressum">Impressum</Link>
    </Footer>

</main>

<style lang="scss">

    main {
        @include padding;
        display: flex;
        min-height: 100vh;
        flex-direction: column;
    }

    ol {
        margin: unit( 1 ) 0;
        @include large;
        flex: 1;
    }

    $indent: 1.7em;

    li {
        padding-left: $indent;
        + li {
            margin-top: unit( 0.5 );
        }
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
