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

<style>
	.dots {
		@apply fixed left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-row;
	}

	.dots > div {
		@apply h-4 w-4 rounded-full bg-white opacity-0;
	}

	div > div:first-child {
		animation: blink 0.5s infinite alternate;
	}

	div > div:not(:first-child, :last-child) {
		animation: blink 0.5s infinite 0.25s alternate;
	}

	div > div:last-child {
		animation: blink 0.5s infinite 0.5s alternate;
	}

	div {
		transition: 0.25s;
	}

	@keyframes blink {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media screen and (max-width: 1000px) {
		.dots {
			@apply left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2;
			bottom: unset;
		}
	}
</style>
