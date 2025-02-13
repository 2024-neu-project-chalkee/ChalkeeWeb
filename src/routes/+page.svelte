<script>
	import { goto } from '$app/navigation';
</script>

<main>
	<section>
		<h1 class="text-center text-lg">Welcome to</h1>
		<img src="/logo.svg" alt="Chalkee" />
		<p class="mb-12 text-center text-sm">The new way to check your grades!</p>
		<button on:click={() => goto('/signin')}>Get started</button>
		<a href="#more" class="flex flex-col items-center justify-center">
			Read more
			<img class="w-16" src="/keyboard_double_arrow_down.svg" alt="Read more" />
		</a>
	</section>
	<section id="more">
		<h1>
			What can you do with
			<img src="/logo.svg" alt="Chalkee" />
			?
		</h1>
		<div>
			<div>
				<h2>Check your grades</h2>
				<div>
					<img src="/counter_4.svg" alt="a" />
					<img src="/counter_5.svg" alt="a" />
				</div>
			</div>
			<div>
				<h2>Check your timetables</h2>
				<img src="/calendar_month.svg" alt="a" />
			</div>
			<div>
				<h2>Check your assignments</h2>
				<img src="/assignment.svg" alt="a" />
			</div>
			<div>
				<h2>Have a better alternative to...</h2>
				<img src="/kr.svg" alt="a" />
			</div>
		</div>
	</section>
</main>

<style>
	main {
		@apply absolute left-1/2 top-0 flex h-max min-h-screen w-screen -translate-x-1/2 flex-col items-center justify-start gap-6 p-0 text-white;
	}

	section:first-child > *:first-child {
		@apply mt-[30vh];
	}

	section:first-child {
		@apply flex h-screen w-full flex-col items-center justify-start gap-8 bg-black;
		background-image: repeating-radial-gradient(circle at -50px -50px, transparent 0, #111 100px),
			repeating-linear-gradient(#ffffff55, #111);
		background-attachment: fixed;
		animation: infinite 5s hero-bg-pos linear;
	}

	section:first-child img {
		@apply mb-4 h-24;
	}

	section:first-child button {
		@apply mb-8;
	}

	section:first-child > a > img {
		@apply transition-all;
	}

	section:first-child > a:hover > img {
		@apply mt-2 transition-all;
	}

	section:nth-child(2) {
		@apply flex h-screen w-11/12 flex-col items-start justify-start gap-8 py-12;
	}

	section:nth-child(2) > h1 {
		@apply flex flex-row items-center;
	}

	section:nth-child(2) > h1 > img {
		@apply ml-3 mr-1 inline h-5;
	}

	section:nth-child(2) > div {
		@apply grid w-full grid-cols-1 gap-4 lg:grid-cols-3;
	}

	section:nth-child(2) > div > div {
		@apply flex h-48 flex-row items-center justify-between gap-12 rounded-md bg-neutral-800 p-12;
	}

	section:nth-child(2) > div > div:last-child {
		@apply justify-center bg-[#23A5CC] text-white lg:col-span-3;
	}

	section:nth-child(2) > div > div > img {
		@apply h-16;
	}

	section:nth-child(2) > div > div:first-child img:last-child {
		@apply -translate-y-4;
	}

	section:nth-child(2) > div > div:first-child img:first-child {
		@apply h-8 translate-y-4;
	}

	section:nth-child(2) > div > div:first-child div {
		@apply flex h-full max-h-12 flex-row;
	}
</style>
