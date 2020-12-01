<script>

    import Gallery from '../components/Gallery.svelte';

    export let project;

</script>

<article>

    <header>
        <h1>
            <span>{project.year}</span>
            <span>{project.title}</span>
        </h1>
    </header>

    <Gallery gallery={project.images} />

</article>

<style>
    header {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 1.5rem;
        z-index: 50;
    }
    h1 span {
        display: inline-block;
        margin-right: 1rem;
    }
</style>
