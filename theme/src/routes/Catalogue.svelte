<script>

	import { Link } from "svelte-routing";
    import Grid from '../components/Grid.svelte';
    import Img from '../components/Img.svelte';

	export let data;

	console.log( data );

</script>

{#each data.pages.reverse() as project}
	<article>

		<header>
			<Link to={project.url}>
				<h2>
					<span>{project.year}</span>
					<span>{project.title}</span>
				</h2>
			</Link>
		</header>

		<Grid items={project.images} let:prop={[item,i]}>
			<Link to="{project.url}/{i+1}">
				<figure title="{item.alt}">
					<Img srcset={item.srcset} alt="{item.alt}" />
					<figcaption>{item.alt}</figcaption>
				</figure>
			</Link>
		</Grid>

	</article>
{/each}

<style>

	article {
		margin-bottom: 8rem;
	}

	header {
		margin-bottom: 1rem;
	}

	h2 span {
        display: inline-block;
        margin-right: 0.7em;
    }

    figure {
		display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    figure :global( img ) {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
	}

	figcaption {
		font-size: 0.7rem;
		margin-top: 1em;
		text-align: center;
	}

</style>
