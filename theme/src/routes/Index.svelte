<script>

	import { Link } from "svelte-routing";
	import { imageIndex } from '../utilities/imageIndex.js';

    import Grid from '../components/Grid.svelte';

	export let data;

	let images = imageIndex( data );

</script>

<Grid {images} />
