<script>

	import { Link } from "svelte-routing";
	import { shuffle } from '../utilities/shuffle.js';

    import Img from '../components/Img.svelte';

	export let data;

    function mapIndex( portfolio ){
		let images = [];
		for( const project of portfolio.pages ){
			for( const image of project.images ){
				images.push({ ...image,
					project: project.title,
					href: project.url,
				});
			}
		}
		return shuffle( images );
	}

	let index = mapIndex( data );

</script>

<ul>
    {#each index as image}
        <li>
            <Link to={image.href}>
				<figure title="{image.project}">
					<Img srcset={image.srcset} alt="{image.alt}" />
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
