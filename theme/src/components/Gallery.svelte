<script>

    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { Link, navigate } from "svelte-routing";

    import 'swiper/swiper-bundle.css';
    import Swiper from 'swiper';

    // prev/next project
	export let prev;
    export let next;

	export let images;
    export let index = 1;
	let container;
    let swiper;
    const dispatch = createEventDispatcher();

	onMount(() => {

        swiper = new Swiper(container, {
            loop: false,
            speed: 400,
            initialSlide: index - 1,
            on: {
                slideChange: function ( event ) {
                    let n = this.activeIndex + 1;
                    index = parseInt( n );
                    navigate(n, { replace: true });
                    dispatch('slide', {
                        index: n
                    });
                },
            },
         })

    });

    onDestroy(() => {

        swiper.destroy();
        swiper = undefined;

    });

</script>

<div class="swiper-container" bind:this={container}>

	<div class="swiper-wrapper">
		{#each images as image, i}
            <div class="swiper-slide">
                <slot prop={[image, i]}></slot>
            </div>
		{/each}
	</div>

    {#if index == 1}
        <Link to={prev}>
            <div title="Previous project" class="button prev link"></div>
        </Link>
    {:else}
        <button title="Previous image" class="button prev" on:click={swiper.slidePrev()}></button>
    {/if}

    {#if index == images.length}
        <Link to={next}>
            <div title="Next project" class="button next link"></div>
        </Link>
    {:else}
        <button title="Next image" class="button next" on:click={swiper.slideNext()}></button>
    {/if}

</div>

<style>

	.swiper-container {
        height: 100%;
        width: 100vw;
    }
    .swiper-slide {
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
    }
	.swiper-slide {
    }

	.button {
        position: absolute;
        top: 0;
        width: 50%;
        height: 100%;
        z-index: 5;
    }

    .button.prev {
        left: 0;
        cursor: w-resize;
    }

    .button.next {
        left: 50%;
        cursor: e-resize;
    }

    .link {
        cursor: pointer !important;
    }

</style>
