<script>

    import { onMount } from "svelte";
    import Swipe from "swipejs";
    import Img from '../components/Img.svelte';

    export let project;

    let container;
    let swipeGallery;

    let index = parseInt( new URL(document.URL).hash.replace('#','') ) || 0;

    let imagetitle = '';

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
            <span>{project.year}</span>
            <span>{project.title}</span>
            <span>{project.images[index].alt}</span>
        </h1>
    </header>

    <section>

        <div class="swipe" bind:this={container}>
            <div class="swipe-wrap">
                {#each project.images as image, i}

                    <figure title="{image.alt}">
                        <Img srcset={image.srcset} alt="{image.alt}" />

                        {#if i > 0}
                            <button title="Previous slide" class="prev" on:click={swipeGallery.prev} />
                        {/if}
                        {#if i + 1 < project.images.length}
                            <button title="Next slide" class="next" on:click={swipeGallery.next} />
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
    }
    h1 span {
        display: inline-block;
        margin-right: 1rem;
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
        padding: 4rem 1.5rem;
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
</style>
