<script>

    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { navigate } from "svelte-routing";
	import Swipe from "swipejs";

	const dispatch = createEventDispatcher();

	import { Link } from "svelte-routing";

	export let images;
    export let index = 1;

	let container;
    let swipeGallery;

	onMount(() => {

        swipeGallery = new Swipe(container, {
            draggable: true,
            speed: 400,
            continuous: false,
            startSlide: index - 1,
            callback: function(i, element) {
                let n = i + 1;
                index = n;
                navigate(n, { replace: true });
				dispatch('slide', {
					index: n
				});
            }
        });

    });

    onDestroy(() => {

        swipeGallery.kill();
        swipeGallery = undefined;

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
