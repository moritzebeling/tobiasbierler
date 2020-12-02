<script>
	import { Router, Link, Route } from "svelte-routing";

	import Header from './components/Header.svelte';
	import Index from "./routes/Index.svelte";
	import Info from "./routes/Info.svelte";
	import Project from "./routes/Project.svelte";

	export let data;
	console.log( data );

	function getProject( projects, url ){
		let project;
		for (let i = 0; i < projects.length; i++) {
			if( projects[i].url === url ){
				project = projects[i];
				project['prev'] = i > 0 ? projects[i-1] : projects[projects.length-1];
				project['next'] = i < projects.length-1 ? projects[i+1] : projects[0];
				break;
			}
		}
		return project;
	}

	export let url = "";

</script>

<Router url="{url}">

	<Header>
		<Link to="/">{data.title}</Link>
		<Link to="info">Info</Link>
	</Header>

	<div>
		<Route path="/" component="{Index}" {data} />
		<Route path="info" component="{Info}" {data} />
		<Route path="portfolio/:id" let:params>
			<Project project={getProject( data.pages, 'portfolio/' + params.id )} />
		</Route>
	</div>

</Router>
