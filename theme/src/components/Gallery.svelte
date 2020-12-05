<script>

	import { createEventDispatcher } from 'svelte';
	import { onMount } from "svelte";
	import Swipe from "swipejs";

	const dispatch = createEventDispatcher();

	import { Link } from "svelte-routing";

	export let images;
	export let start = 0;

	let index = start;

	let container;
    let swipeGallery;

	onMount(() => {

        swipeGallery = new Swipe(container, {
            draggable: true,
            continuous: false,
            startSlide: index,
            callback: function(i, element) {
				index = i;
				dispatch('slide', {
					index: i
				});
            }
        });

    });

</script>

<div class="swipe" bind:this={container}>
	<div class="swipe-wrap">
		{#each images as image, i}

			<figure title="{image.alt}">

				<slot prop={[image, i]}></slot>

				{#if i === 0}
					<Link to={'/'}>
						<button title="Previous project" class="prev link"></button>
					</Link>
				{:else}
					<button title="Previous image" class="prev" on:click={swipeGallery.prev} />
				{/if}

				{#if i + 1 === images.length}
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

<style>

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
