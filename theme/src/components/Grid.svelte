<script>

	export let items;

</script>

<ul>
    {#each items as item, i}
        <li>
			<slot prop={[item, i]}></slot>
        </li>
    {/each}
</ul>

<style>

	ul {
		margin: 2.5rem 0;
		padding: 1.5rem;
		display: grid;
		gap: 6vw;
		grid-template-columns: repeat( auto-fit, minmax(130px, 1fr) );
	}
	@media only screen and (min-width: 920px) {
		ul {
			gap: 5vw;
			grid-template-columns: repeat( auto-fit, minmax(180px, 1fr) );
		}
	}
	@media only screen and (min-width: 1500px) {
		ul {
			gap: 4vw;
			grid-template-columns: repeat( auto-fit, minmax(200px, 1fr) );
		}
	}
	@media only screen and (min-width: 1900px) {
		ul {
			gap: 3vw;
			grid-template-columns: repeat( auto-fit, minmax(220px, 1fr) );
		}
	}

	li {
		position: relative;
	}

	li:before {
		content: "";
		padding-bottom: 100%;
		display: inline-block;
		vertical-align: top;
	}

	li :global(a) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

</style>
