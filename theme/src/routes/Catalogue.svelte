<script>

	import { Link } from "svelte-routing";
    import Img from '../components/Img.svelte';

	export let data;

</script>

<div class="wrapper">
	{#each data.pages as project}

		<article>
			<header>
				<Link to={project.url}>
					<h2>
						<span>{project.year}</span>
						<span>{project.title}</span>
					</h2>
				</Link>
			</header>

			<ul class="gallery">
				{#each project.images as image, i}
					<li>
						<Link to="{project.url}#{i}">
							<figure title="{image.alt}">
								<Img srcset={image.srcset} alt="{image.alt}" />
								<figcaption>{image.alt}</figcaption>
							</figure>
						</Link>
					</li>
				{/each}
			</ul>

		</article>

	{/each}
</div>

<style>


	.wrapper {
		margin: 2.5rem 0;
		padding: 1.5rem;
	}

	article {
		margin-bottom: 8rem;
	}
	header {
		margin-bottom: 1rem;
	}

	.gallery {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	}

	.gallery > li {
		position: relative;
		margin-bottom: 1rem;
	}

	.gallery > li:before {
		content: "";
		padding-bottom: 100%;
		display: inline-block;
		vertical-align: top;
	}

	li :global( figure ) {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

	h2 span {
        display: inline-block;
        margin-right: 1rem;
    }

	li :global(a) {
        display: block;
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

	figcaption {
		font-size: 0.6rem;
		margin-top: 0.5em;
		text-align: center;
	}

</style>
