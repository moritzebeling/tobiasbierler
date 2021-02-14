<script>

    import { onMount, createEventDispatcher } from "svelte";
    import 'swiper/swiper-bundle.css';
    import Swiper from 'swiper';

	export let images;
    let index = 0;

	let container;
    let swiper;
    const dispatch = createEventDispatcher();

    function slideHook( n, max ){
        let i = ( n % max ) - 1;
        if( i < 0 ){
            i = max - 1;
        } else if( i >= max ){
            i = 0;
        }
        return i;
    }

	onMount(() => {
        swiper = new Swiper(container, {
            loop: true,
            speed: 400,
            on: {
                slideChange: function ( event ) {
                    index = slideHook( parseInt( this.activeIndex ), images.length );
                    dispatch('slide', {
                        index: index
                    });
                },
            },
        });
        return ()=>{
            swiper.destroy();
            swiper = undefined;
        }
    });

    function handleKeydown(event) {
        switch (event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                swiper.slidePrev();
                break;
            case 'ArrowRight':
            case 'KeyD':
            case 'Space':
            case 'Enter':
                swiper.slideNext();
                break;
        }
	}

</script>

<svelte:window on:keydown={handleKeydown}/>

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
