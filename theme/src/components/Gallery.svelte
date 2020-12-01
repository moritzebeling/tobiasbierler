<script>

    import { onMount } from "svelte";
    import Swipe from "swipejs";
    import Img from './Img.svelte';

    export let gallery;

    let container;
    let swipeGallery;

    let first = true;
    let last = gallery.length === 1;
    let galleryIndex = 1;

    onMount(() => {
        swipeGallery = new Swipe(container, {
        draggable: true,
        continuous: false,
        callback: function(index, element) {
            first = index === 0;
            last = index + 1 === gallery.length;
            galleryIndex = index + 1;
        }
        });
    });

</script>

<section class:first class:last>

    <div class="swipe" bind:this={container}>
        <div class="swipe-wrap">
            {#each gallery as image, i}

                <figure title="{image.project}">
                    <Img srcset={image.srcset} alt="{image.alt}" />

                    {#if i > 0}
                        <button title="Previous slide" class="prev" on:click={swipeGallery.prev} />
                    {/if}
                    {#if i + 1 < gallery.length}
                        <button title="Next slide" class="next" on:click={swipeGallery.next} />
                    {/if}

                </figure>

            {/each}
        </div>
    </div>

</section>

<style>
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
