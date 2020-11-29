<script>

    import Img from './Img.svelte';

    export let image = {};

</script>

<a href={image.path}>

    <figure>
        <Img {image} />
    </figure>

</a>

<style>

    a {
        display: block;
    }

</style>
