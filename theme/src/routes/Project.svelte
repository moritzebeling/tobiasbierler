<script>

    import { onMount } from "svelte";
    import { Link } from "svelte-routing";
    import Swipe from "swipejs";
    import Img from '../components/Img.svelte';

    export let project;

    let container;
    let swipeGallery;

    let index = parseInt( new URL(document.URL).hash.replace('#','') ) || 0;

    onMount(() => {

        swipeGallery = new Swipe(container, {
            draggable: true,
            continuous: false,
            startSlide: index,
            callback: function(i, element) {
                index = i;
            }
        });

    });

</script>

<article>

    <header>
        <h1>
            <span class="year">{project.year}</span>
            <span>{project.title}</span>
            <span>{project.images[index].alt}</span>
        </h1>
        <div class="index">
            <span>{index + 1}</span>/<span>{project.images.length}</span>
        </div>
    </header>

    <section>

        <div class="swipe" bind:this={container}>
            <div class="swipe-wrap">
                {#each project.images as image, i}

                    <figure title="{image.alt}">

                        <div class="square">
                            <Img srcset={image.srcset} alt="{image.alt}" />
                        </div>

                        {#if i === 0}
                            <Link to={'/'}>
                                <button title="Previous project" class="prev link"></button>
                            </Link>
                        {:else}
                            <button title="Previous image" class="prev" on:click={swipeGallery.prev} />
                        {/if}

                        {#if i + 1 === project.images.length}
                            <Link to={'/'}>
                                <button title="Next project" class="next link"></button>
                            </Link>
                        {:else}
                            <button title="Next image" class="next" on:click={swipeGallery.next} />
                        {/if}

                    </figure>

                {/each}
            </div>
        </div>

    </section>

</article>

<style>

    header {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 1.5rem;
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

    .swipe {
        overflow: hidden;
        visibility: hidden;
        position: relative;
        height: 100%;
        width: 100vw;
    }
    .swipe-wrap {
        overflow: hidden;
        position: relative;
        height: 100%;
    }

    figure {
        position: relative;
        height: 100vh;
        width: 100vw;
        float: left;
        display: flex;
        justify-content: center;
        align-items: center;
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

    figure :global( img ) {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
    }

    button {
        position: absolute;
        top: 0;
        width: 50%;
        height: 100%;
        z-index: 5;
    }
    button.prev {
        left: 0;
        cursor: w-resize;
    }
    button.next {
        left: 50%;
        cursor: e-resize;
    }

    button.link {
        cursor: pointer !important;
    }
</style>
