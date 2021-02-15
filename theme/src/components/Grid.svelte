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
		display: grid;
		gap: 6vw;
		padding: 0 4vw;
		margin: 4vw 0;
		grid-template-columns: 1fr 1fr;
	}

	@media only screen and (min-width: 370px) {
		ul {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
	@media only screen and (min-width: 800px) {
		ul {
			grid-template-columns: repeat( auto-fit, minmax(120px, 1fr) );
		}
	}
	@media only screen and (min-width: 920px) {
		ul {
			grid-template-columns: repeat( auto-fit, minmax(150px, 1fr) );
			gap: 4vw;
			padding: 0 3vw;
			margin: 3vw 0;
		}
	}
	@media only screen and (min-width: 1500px) {
		ul {
			gap: 3vw;
			padding: 0 2vw;
			margin: 2vw 0;
		}
	}
	@media only screen and (min-width: 1900px) {
		ul {
			gap: 2vw;
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
