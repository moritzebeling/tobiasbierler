<script>

    import Mailto from './Mailto.svelte';

    export let contact;

</script>

<footer>

    <address>
        <p><Mailto email={contact.email} /></p>
        <p>{contact.telephone}</p>
        <p>{contact.address}<br />{contact.zip} {contact.city}</p>
    </address>

    <div><slot /></div>

</footer>

<style lang="scss">

    footer {
        @media (min-width: 600px){
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
    }
    div {
        margin-top: 1rem;
    }

</style>
