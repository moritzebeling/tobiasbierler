<script>

    export let text;

    let contact = {
        name: 'Tobias Bierler',
        email: 'tobiasbierler@icloud.com',
        street: 'Trierer Str. 62',
        zip: '99423',
        city: 'Weimar',
    }

</script>

<footer class="text">

    {@html text}

</footer>

<style>

    footer {
        margin-top: 1rem;
    }

</style>
