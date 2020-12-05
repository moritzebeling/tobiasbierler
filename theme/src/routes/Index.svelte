<script>

	import { Link } from "svelte-routing";
	import { imageIndex } from '../utilities/imageIndex.js';

    import Grid from '../components/Grid.svelte';
    import Img from '../components/Img.svelte';

	export let data;

	let images = imageIndex( data );

</script>

<Grid items={images} let:prop={[item,i]}>
	<Link to={item.href}>
		<figure title="{item.project} {item.alt}">

			<Img srcset={item.srcset} alt="{item.alt}" />

		</figure>
	</Link>
</Grid>

<style>

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
