<script>

    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { navigate } from "svelte-routing";

    import 'swiper/swiper-bundle.css';
    import Swiper from 'swiper';

	export let images;
    export let index = 0;
	let container;
    let swiper;
    const dispatch = createEventDispatcher();

    function slideHook( n, max ){
        let i = n % max;
        if( i === 0 ){
            i = max;
        }
        console.log( n, i );
        navigate(i, { replace: true });
        return i;
    }

	onMount(() => {

        swiper = new Swiper(container, {
            loop: true,
            speed: 400,
            initialSlide: index,
            on: {
                slideChange: function ( event ) {
                    index = slideHook( parseInt( this.activeIndex ), images.length );
                    dispatch('slide', {
                        index: this.activeIndex
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

    <button title="Previous image" class="button prev" on:click={swiper.slidePrev()}></button>
    <button title="Next image" class="button next" on:click={swiper.slideNext()}></button>

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

</style>
