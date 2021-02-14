<script>

    import { Link } from "svelte-routing";
    import Img from '../components/Img.svelte';
    import Gallery from '../components/Gallery.svelte';

    export let project;
    console.log( project );

    let index;

    function handleSlide( event ){
        index = event.detail.index;
    }

</script>

<article>

    <header>
        <p class="year nowrap">{project.year}</p>
        <h1>{project.title}</h1>
        <p class="index nowrap">Bild {index + 1} von {project.images.length}</p>
        {#if project.images[index]}
            <h2>{project.images[index].alt}</h2>
        {/if}
    </header>

    <section>
        <Gallery images={project.images} let:prop={[image,i]} on:slide={handleSlide}>
            <figure class="" title="{image.alt}">
                <div class="square">
                    <Img srcset={image.srcset} alt="{image.alt}" />
                </div>
            </figure>
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
        flex-wrap: wrap;
    }

    h1 {
        margin-right: 0.3em;
    }
    h1:after {
        content: '.';
    }

    p {
        margin-right: 0.3em;
    }
    p:after {
        content: ':';
    }

    span {
        display: inline-block;
    }

    .year, .index {
        letter-spacing: 0.02em;
    }

    .nowrap {
        white-space: nowrap;
    }

    .year {
        font-feature-settings: "tnum";
    }
    .year:after {
        content: ',';
    }

    section {
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
    }

    figure {
        position: relative;
        height: 100vh;
    }

    .square {
        width: 100vh;
        height: 100vh;
        padding: 1rem 1rem 3rem;
        box-sizing: border-box;
    }

    @media all and (orientation: portrait) {
        .square {
            padding: 1rem;
            width: 100vw;
            height: 100vw;
        }
    }

    :global( img ) {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: left top;
    }
</style>
