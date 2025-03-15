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
			as a student?
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
		</div>
		<h1>
			What can you do with
			<img src="/logo.svg" alt="Chalkee" />
			as a teacher?
		</h1>
		<div>
			<div class="lg:col-span-2">
				<h2>Hand out assignments and notify students of any events</h2>
				<div>
					<img src="/error.svg" alt="a" />
					<img src="/assignment.svg" alt="a" />
				</div>
			</div>
			<div>
				<h2>Check your timetables</h2>
				<img src="/calendar_month.svg" alt="a" />
			</div>
			<div>
				<h2>Grade students</h2>
				<div>
					<img src="/counter_4.svg" alt="a" />
					<img src="/counter_5.svg" alt="a" />
				</div>
			</div>
			<div class="lg:col-span-2">
				<h2>Work from the web or the desktop client</h2>
				<img src="/devices.svg" alt="a" />
			</div>
		</div>
		<h1>But most importantly...</h1>
		<div>
			<div>
				<h2>Have a system that is not</h2>
				<img src="/kr.svg" alt="a" />
			</div>
		</div>
	</section>
</main>

<style>
	main {
		@apply absolute left-1/2 top-0 my-0 flex h-max min-h-screen w-screen -translate-x-1/2 flex-col items-center justify-start gap-6 p-0 text-white;
	}

	section:first-child > *:first-child {
		@apply mt-[30vh];
	}

	section:first-child {
		@apply flex h-max min-h-screen w-full flex-col items-center justify-start gap-8 bg-black;
		background-image: repeating-radial-gradient(circle at -50px -50px, transparent 0, #111 100px),
			repeating-linear-gradient(#ffffff55, #111);
		background-attachment: fixed;
	}

	section:first-child img {
		@apply mb-4 max-h-24 w-4/5;
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
		@apply flex h-max min-h-screen w-11/12 flex-col items-start justify-start gap-8 py-12 md:w-5/6;
	}

	section:nth-child(2) > h1 {
		@apply flex w-full flex-col items-center gap-3 md:w-max md:flex-row md:gap-0;
	}

	section:nth-child(2) > h1 > img {
		@apply mx-3 inline h-5;
	}

	section:nth-child(2) > div {
		@apply mb-24 grid w-full grid-cols-1 gap-4 lg:grid-cols-3;
	}

	section:nth-child(2) > div > div {
		@apply flex h-max min-h-48 flex-col-reverse items-center justify-between gap-8 rounded-md bg-neutral-800 p-12 md:flex-row;
	}

	section:nth-child(2) > div > div > h2 {
		@apply w-full text-center md:w-max md:text-start;
	}

	section:nth-child(2) > div:last-child > div:last-child {
		@apply col-span-full flex-col justify-center gap-6 bg-[#23A5CC] md:flex-row md:gap-3;
	}

	section:nth-child(2) > div:last-child > div:last-child > h2 {
		@apply text-white;
	}

	section:nth-child(2) > div:last-child > div:last-child img {
		@apply h-12;
	}

	section:nth-child(2) > div > div > img {
		@apply h-16;
	}

	section:nth-child(2) > div > div > div > img:last-child {
		@apply -translate-y-4;
	}

	section:nth-child(2) > div > div > div > img:first-child {
		@apply h-8 translate-x-1 translate-y-4;
	}

	section:nth-child(2) > div > div > div {
		@apply flex h-16 max-h-12 flex-row;
	}
</style>
