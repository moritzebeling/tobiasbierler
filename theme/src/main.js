import App from './App.svelte';
import 'lazysizes';

const app = new App({
	target: document.body,
	props: {
		data: window.pageData
	}
});

export default app;
