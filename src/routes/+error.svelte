<script>
	import { goto } from '$app/navigation';
</script>

<main>
	<div class="island-col">
		<h1>Oops! An unexpected error occured!</h1>
		<button on:click={() => goto('/dashboard')}>Back to dashboard</button>
	</div>
</main>
