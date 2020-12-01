<script>

    export let project;

    console.log(project);

</script>

<article>
    <header>
        <h1>
            <span>{project.year}</span>
            <span>{project.title}</span>
        </h1>
    </header>
</article>

<style>
    header {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 1.5rem;
    }
    h1 span {
        display: inline-block;
        margin-right: 1rem;
    }
</style>
