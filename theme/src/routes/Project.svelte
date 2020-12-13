<script>

    import { Route, Link, navigate } from "svelte-routing";
    import Img from '../components/Img.svelte';
    import Gallery from '../components/Gallery.svelte';

    export let project;
    export let index = 1;

    console.log( project );

    /*
    * rerender gallery component when new project is shown
    */
    let showGallery = false;
    $: url = project.url;
    $: rerenderGallery( url );
    function rerenderGallery( project ){
        showGallery = false;
        setTimeout(()=>{
            showGallery = true;
        }, 2);
    }

</script>

<article>

    <header>
        <div class="index">
            <span>{index}</span>/<span>{project.images.length}</span>
        </div>
        <h1>
            <span class="year">{project.year}</span>
            <span>{project.title}</span>
            <span>{project.images[index-1].alt}</span>
        </h1>
    </header>

    {#if showGallery === true}
        <section>
            <Gallery images={project.images} let:prop={[image,i]} {index} on:slide={(e) => index = e.detail.index} prev={project.prev} next={project.next}>
                <figure class="" title="{image.alt}">
                    <div class="square">
                        <Img srcset={image.srcset} alt="{image.alt}" />
                    </div>
			    </figure>
            </Gallery>
        </section>
    {/if}

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

    h1 span {
        display: inline-block;
        margin-right: 0.7em;
    }

    .year, .index {
        letter-spacing: 0.02em;
        white-space: nowrap;
    }

    .index {
        float: right;
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

    figure {
        position: relative;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .square {
        width: 100vh;
        height: 100vh;
        padding: 3rem 1rem;
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
        object-position: center;
    }
</style>
