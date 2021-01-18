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
		margin-bottom: 1rem;
		display: grid;
		gap: 6vw;
		grid-template-columns: 1fr 1fr;
	}

	@media only screen and (min-width: 370px) {
		ul {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
	@media only screen and (min-width: 800px) {
		ul {
			grid-template-columns: repeat( auto-fit, minmax(130px, 1fr) );
		}
	}
	@media only screen and (min-width: 920px) {
		ul {
			grid-template-columns: repeat( auto-fit, minmax(180px, 1fr) );
			gap: 4vw;
			padding-left: 4vw;
			padding-right: 4vw;
		}
	}

	@media only screen and (min-width: 1500px) {
		ul {
			grid-template-columns: repeat( auto-fit, minmax(200px, 1fr) );
		}
	}

	@media only screen and (min-width: 1900px) {
		ul {
			grid-template-columns: repeat( auto-fit, minmax(220px, 1fr) );
			gap: 3vw;
			padding-left: 3vw;
			padding-right: 3vw;
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
