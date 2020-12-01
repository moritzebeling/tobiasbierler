<script>

	import { Link } from "svelte-routing";
	import { shuffle } from '../utilities/shuffle.js';

    import Img from '../components/Img.svelte';

	export let data;
	console.log( data );

    function mapIndex( portfolio ){
		let images = [];
		for( const project of portfolio.pages ){
			for( const image of project.images ){
				images.push({ ...image,
					project: project.title
				});
			}
		}
		return shuffle( images );
	}

	let index = mapIndex( data );
	console.log( index );

</script>

<ul>
    {#each index as image}
        <li>
            <Link to={image.path}>
				<figure title="{image.project}">
					<Img {...image} />
				</figure>
			</Link>
        </li>
    {/each}
</ul>

<style>

	ul {
		margin: 2.5rem 0;
		padding: 1.5rem;
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat( auto-fit, minmax(200px, 1fr) );
	}

	li {
		position: relative;
	}

	li:before {
		content: "";
		padding-bottom: 100%;
		display: inline-block;
		vertical-align: top;
	}

	li :global(a) {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    figure {
        width: 100%;
        height: 100%;
    }

    figure :global( img ) {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
    }

</style>
