<script>

    import { Route, Link } from "svelte-routing";
    import Img from '../components/Img.svelte';
    import Gallery from '../components/Gallery.svelte';

    export let project;
    export let index = 1;

    console.log( index );

</script>

<article>

    <header>
        <div class="controls">
            <Link to={project.prev}>Prev</Link>
            <Link to={project.next}>Next</Link>
        </div>
        <h1>
            <span class="year">{project.year}</span>
            <span>{project.title}</span>
            <span>{project.images[index-1].alt}</span>
        </h1>
        <div class="index">
            <span>{index}</span>/<span>{project.images.length}</span>
        </div>
    </header>

    <section>
        <Gallery images={project.images} let:prop={[image,i]} {index} on:slide={(e) => index = e.detail.index}>

            <div class="square">
                <Img srcset={image.srcset} alt="{image.alt}" />
            </div>

        </Gallery>
    </section>

</article>

<style>

    header {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 1rem;
        z-index: 50;
        display: flex;
        justify-content: space-between;
    }
    h1 span {
        display: inline-block;
        margin-right: 0.7em;
    }
    .year, .index {
        letter-spacing: 0.02em;
    }
    .index span {
        display: inline-block;
        margin: 0 0.1em;
    }
    section {
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
    }

    .square {
        width: 100vh;
        height: 100vh;
        padding: 4rem 1.5rem;
    }

    @media all and (orientation: portrait) {
        .square {
            width: 100vw;
            height: 100vw;
        }
    }

    :global( img ) {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
    }
</style>
