<script>
	import { Router, Link, Route } from "svelte-routing";

	import {getProject} from './utilities/getProject.js';

	import Header from './components/Header.svelte';
	import Index from "./routes/Index.svelte";
	import Info from "./routes/Info.svelte";
	import Catalogue from "./routes/Catalogue.svelte";
	import Project from "./routes/Project.svelte";

	export let data;
	console.log( data );

	export let url = "";

</script>

<Router url="{url}">

	<Header>
		<Link to="/">{data.title}</Link>
	</Header>

	<main>
		<Route path="/" component="{Index}" {data} />
		<Route path="info" component="{Info}" {data} />
		<Route path="catalogue" component="{Catalogue}" {data} />
		<Route path="portfolio/:id" let:params>
			<Project project={getProject( data.pages, 'portfolio/' + params.id )} />
		</Route>
	</main>

</Router>
