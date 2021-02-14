<script>

	import { Router, Link, Route } from "svelte-routing";
	import {getProject} from './utilities/getProject.js';

	import Index from "./routes/Index.svelte";
	import Project from "./routes/Project.svelte";

	export let data;
	export let url = "";

</script>

<Router url="{url}">

	<Route path="/" component="{Index}" {data} />
	<Route path="portfolio/:id" let:params>
		<Project project={getProject( data.pages, 'portfolio/' + params.id )}/>
	</Route>

</Router>
