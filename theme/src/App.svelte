<script>

	import { Router, Link, Route } from "svelte-routing";
	import { getProject } from './utilities/getProject.js';

	import Index from "./routes/Index.svelte";
	import Project from "./routes/Project.svelte";
	import Imprint from "./routes/Imprint.svelte";

	export let data;
	export let url = "";

	console.log('Welcome. This is the website of Tobias Bierler.');
	console.log('It was made by Moritz Ebeling. https://moritzebeling.com');

	const appHeight = () => {
		document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
	}
	appHeight();

</script>

<svelte:window on:resize={appHeight} />

<Router url="{url}">

	<Route path="/" component="{Index}" {data} />
	<Route path="impressum" component="{Imprint}" {data} />
	<Route path="portfolio/:id" let:params>
		<Project project={getProject( data.pages, 'portfolio/' + params.id )}/>
	</Route>

</Router>
