<script>

    import { Link } from "svelte-routing";
    import Img from '../components/Img.svelte';
    import Gallery from '../components/Gallery.svelte';

    export let project;
    export let index = 0;
    console.log( index );

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
        <nav>
            <Link to="/">Zurück</Link>
        </nav>
        <h1>
            <span class="year">{project.year}</span>
            <span>{project.title}</span>
            <span>{project.images[index].alt}</span>
        </h1>
        <div class="index">
            <span>{index+1}</span>/<span>{project.images.length}</span>
        </div>
    </header>

    {#if showGallery === true}
        <section>
            <Gallery images={project.images} let:prop={[image,i]} {index} on:slide={(e) => index = e.detail.index}>
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
        display: flex;
    }

    h1 {
        flex: 1;
    }

    span {
        display: inline-block;
    }

    nav, h1 span {
        margin-right: 0.7em;
    }

    .year, .index {
        letter-spacing: 0.02em;
        white-space: nowrap;
    }

    .index {
        text-align: right;
        min-width: 3.3em;
    }
    .index span {
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
