<script>
	import { page } from '$app/stores';
</script>

<header>
	<span id="logo"> Chalkee </span>
	<nav>
		{#if $page.data.session}
			{#if $page.data.session.user?.role == 'Student'}
				<button>Timetables</button>
				<button>Grades</button>
				<button>Info</button>
			{:else if $page.data.session.user?.role == 'Teacher'}
				<button>a</button>
			{:else if $page.data.session.user?.role == 'Principal'}
				<button>a</button>
			{:else if $page.data.session.user?.role == 'Admin'}
				<button>a</button>
			{/if}
		{/if}
	</nav>
</header>

<style>
	header {
		@apply fixed z-50 flex h-16 w-screen flex-row items-center justify-between gap-2 bg-neutral-800 px-16 drop-shadow-lg;
	}

	#logo {
		@apply text-2xl;
	}
</style>
