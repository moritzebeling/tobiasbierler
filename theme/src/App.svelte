<script>

	import {shuffle} from './utilities/shuffle.js';

	import Header from './components/Header.svelte';
	import Tile from './components/Tile.svelte';

	export let data = {};

	function allImages( projects ){
		let images = [];
		for (const project of projects) {
			for (const image of project.images) {
				images.push( image );
			}
		}
		return shuffle( images );
	}

</script>

<Header>{data.title}</Header>

<ul>
	{#each allImages(data.pages) as image}
		<li>
			<Tile {image} />
		</li>
	{/each}
</ul>

<style>

	ul {
		margin: 2.5rem 0;
		padding: 1.5rem;
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat( auto-fit, minmax(150px, 1fr) );
	}

	li {
		position: relative;
	}

	li::before {
		content: "";
		padding-bottom: 100%;
		display: inline-block;
		vertical-align: top;
	}

</style>
