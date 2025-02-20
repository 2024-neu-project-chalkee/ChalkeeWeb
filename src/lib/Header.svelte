<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<header>
	<img on:click={() => goto('/dashboard/')} src="/logo.svg" alt="logo" id="logo" />
	<nav>
		{#if $page.data.session}
			{#if $page.data.session.user?.role == 'Student'}
				<button on:click={() => goto('/dashboard/my/timetables')}>Timetables</button>
				<button>Grades</button>
				<button on:click={() => goto('/dashboard/my/info')}>Info</button>
			{:else if $page.data.session.user?.role == 'Teacher'}
				<button on:click={() => goto('/dashboard/my/timetables')}>Timetables</button>
				<button>Grades</button>
				<button on:click={() => goto('/dashboard/my/info')}>Info</button>
			{:else if $page.data.session.user?.role == 'Principal'}
				<button on:click={() => goto('/manage/timetables')}>Manage timetables</button>
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
		@apply h-1/3 cursor-pointer text-2xl;
	}
</style>
