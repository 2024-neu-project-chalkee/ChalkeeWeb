<script>
	import Header from '$lib/Header.svelte';
	import { navigating } from '$app/stores';
	import { loading } from '$lib/loading';
	$: $loading = !!$navigating;
</script>

<Header />
<main class={$loading ? 'non-interactable' : ''}>
	<slot />
</main>
