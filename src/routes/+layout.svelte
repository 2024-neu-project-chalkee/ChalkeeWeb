<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	import { navigating } from '$app/stores';
	import { loading } from '$lib/loading';
	$: $loading = !!$navigating;

	const showDev = false;
</script>

<svelte:head>
	<title>Chalkee{$page.data.title ? ` - ${$page.data.title}` : ''}</title>
</svelte:head>

{#if showDev}
	<pre>
		$page.data = {JSON.stringify($page.data, null, 4)}
	</pre>
{/if}

<div
	class={['/', '/signin'].includes($page.url.pathname) && $loading ? 'non-interactable' : ''}
	id="app"
>
	<slot />
</div>

{#if $loading}
	<div class="dots">
		<div></div>
		<div></div>
		<div></div>
	</div>
{/if}
