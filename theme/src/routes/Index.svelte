<script>

	import { Link } from "svelte-routing";
	import { imageIndex } from '../utilities/imageIndex.js';
    import Header from '../components/Header.svelte';
    import Grid from '../components/Grid.svelte';
    import Img from '../components/Img.svelte';

    import Imprint from './Imprint.svelte';

	export let data;
    let images = imageIndex( data );

    console.log( images );

</script>

<main>

    <Header />

    <Grid items={images} let:prop={[item,i]}>
        <Link to={item.href}>
            <figure title="{item.project} {item.alt}">

                <Img srcset={item.srcset} alt="{item.alt}" />

            </figure>
        </Link>
    </Grid>

    <Imprint />

</main>

<style>

    main {
        margin: 1rem;
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
