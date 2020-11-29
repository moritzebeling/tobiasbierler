<script>

    import Img from './Img.svelte';

    export let image = {};

</script>

<a href="#">

    <figure>
        <Img {image} />
    </figure>

</a>

<style>

    a {
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
