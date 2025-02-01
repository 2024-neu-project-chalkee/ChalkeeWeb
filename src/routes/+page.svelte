<script>
	import { goto } from '$app/navigation';
</script>

<main
	class="absolute left-[50%] top-[50%] flex h-max min-h-screen w-[calc(100vw-4em)] translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center gap-6 p-[2em] text-white"
>
	<h1 class="text-center text-4xl">Welcome to Chalkee!</h1>
	<p class="text-center">The new way to check your grades!</p>
	<button on:click={() => goto('/signin')}>Get started</button>
</main>
