<script>

    import { Link } from "svelte-routing";
    import Img from '../components/Img.svelte';
    import Gallery from '../components/Gallery.svelte';

    export let project;

    let index;

    function handleSlide( event ){
        index = event.detail.index;
    }

</script>

<article>

    <header>
        <p class="i num">{project.n}</p>
        <p class="index num">{index + 1}/{project.images.length}</p>
        {#if project.images[index]}
            <h2>{project.images[index].alt}</h2>
        {/if}
    </header>

    <footer>
        <Link to="/">Index</Link>
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

<style lang="scss">

    header {
        @include bottom;
        @include padding;
    }

    h2, p {
        display: inline;
    }

    .i, .index {
        display: inline-block;
        margin-right: 0.3em;
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
        box-sizing: border-box;
    }

    .square {
        width: 100vh;
        height: 100vh;
        @include padding;
        padding-bottom: unit(3);
    }

    @media all and (orientation: portrait) {
        .square {
            @include padding;
            width: 100vw;
            height: 100vw;
        }
    }

    :global( img ) {
        @include fitImage;
    }

    footer {
        @include bottom;
        @include padding;
        display: none;
        right: 0;
        @media all and (min-width: 800px){
            display: block;
        }
    }


</style>
