<script>
	import { Router, Link, Route } from "svelte-routing";

	import Header from './components/Header.svelte';
	import Index from "./routes/Index.svelte";
	import Info from "./routes/Info.svelte";
	import Project from "./routes/Project.svelte";

	export let data;

	export let url = "";

</script>

<Router url="{url}">

	<Header>
		{data.title} ({url})
		<Link to="/">Index</Link>
		<Link to="info">Info</Link>
	</Header>

	<div>
		<Route path="/" component="{Index}" {data} />
		<Route path="info" component="{Info}" {data} />
		<Route path="portfolio/:id" component="{Project}" {data} />
	</div>

</Router>
