<script>

	import { Router, Link, Route } from "svelte-routing";
	import {getProject} from './utilities/getProject.js';
	import Header from './components/Header.svelte';
	import Index from "./routes/Index.svelte";
	import Info from "./routes/Info.svelte";
	import Catalogue from "./routes/Catalogue.svelte";
	import Project from "./routes/Project.svelte";

	export let data;
	export let url = "";

</script>

<Router url="{url}">

	<Route path="/" component="{Index}" {data} />
	<Route path="info" component="{Info}" {data} />
	<Route path="catalogue" component="{Catalogue}" {data} />
	<Route path="portfolio/:id/:index" let:params>
		<Project project={getProject( data.pages, 'portfolio/' + params.id )} index={params.index}/>
	</Route>

</Router>
