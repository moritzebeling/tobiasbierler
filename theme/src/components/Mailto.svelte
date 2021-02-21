<script>

  import { onMount } from 'svelte';
  export let email;

  let reveal = '';
  function typeWriter() {
    if (reveal.length < email.length) {
      reveal += email.charAt( reveal.length );
      setTimeout(typeWriter, 30);
    }
  }
  onMount(() => {
    setTimeout(typeWriter, 350);
  });
</script>

<a href="mailto:{reveal}">{reveal}</a>
