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

        <p class="i num">{project.n}</p>

        <p class="index num">Bild {index + 1} von {project.images.length}</p>

        {#if project.images[index]}
            <h2>{project.images[index].alt}</h2>
        {/if}

    </header>

    <footer>
        <Link to="/">Zurück</Link>
    </footer>

    <section>
        <Gallery images={project.images} let:prop={[image,i]} on:slide={handleSlide}>
            <figure title="{image.alt}">
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
    }

    h1, h2, p {
        display: inline;
    }

    .index:after {
        content: ':';
    }
    .i {
        min-width: 1.6em;
        display: inline-block;
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
        width: 85vh;
        height: 85vh;
        padding: 1rem 1rem 3rem;
        box-sizing: border-box;
    }

    @media all and (orientation: portrait) {
        .square {
            padding: 1rem;
            width: 85vw;
            height: 85vw;
        }
    }

    :global( img ) {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: left top;
    }

    footer {
        display: none;
    }
    @media all and (min-width: 1000px){
        footer {
            display: block;
            position: fixed;
            z-index: 60;
            bottom: 0;
            right: 0;
            padding: 1rem;
        }
        footer :global( a ){
	        text-decoration: underline;
        }

    }

</style>
