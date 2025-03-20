<script>
	import { sidebarOpen } from './sidebar';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	let w = 0;
</script>

<svelte:window bind:innerWidth={w} />

<nav class={$sidebarOpen ? 'open' : ''}>
	{#if $page.data.session}
		<button
			on:click={() => {
				goto('/dashboard');
				if (w < 768) sidebarOpen.set(!$sidebarOpen);
			}}>Dashboard</button
		>
		<button
			on:click={() => {
				goto('/dashboard/my/info');
				if (w < 768) sidebarOpen.set(!$sidebarOpen);
			}}>Info</button
		>
		{#if $page.data.session.user?.role == 'Student'}
			<button
				on:click={() => {
					goto('/dashboard/my/timetables');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>My timetables</button
			>
			<button
				on:click={() => {
					goto('/dashboard/my/announcements');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>My Announcements</button
			>
			<button
				on:click={() => {
					goto('/dashboard/my/grades');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>My Grades</button
			>
		{:else if $page.data.session.user?.role == 'Teacher'}
			<button
				on:click={() => {
					goto('/dashboard/my/timetables');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>My timetables</button
			>
			<button
				on:click={() => {
					goto('/dashboard/my/announcements');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>My Announcements</button
			>
		{:else if $page.data.session.user?.role == 'Principal'}
			<button
				on:click={() => {
					goto('/dashboard/my/timetables');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>My timetables</button
			>
			<button
				on:click={() => {
					goto('/dashboard/my/announcements');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>My Announcements</button
			>
			<button
				on:click={() => {
					goto('/manage/timetables');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>Manage timetables</button
			>
		{:else if $page.data.session.user?.role == 'Admin'}
			<button
				on:click={() => {
					goto('/admin');
					if (w < 768) sidebarOpen.set(!$sidebarOpen);
				}}>Admin panel</button
			>
		{/if}
		<button on:click={() => signOut({ callbackUrl: '/' })}>Sign out</button>
	{/if}
</nav>

<style>
	nav.open {
		@apply fixed right-0 top-0 z-40 flex h-screen w-screen flex-col justify-center bg-neutral-800 drop-shadow-lg transition-all md:w-96;
	}

	nav:not(.open) {
		@apply hidden transition-all;
	}

	nav button {
		@apply w-full rounded-none border-0 py-3 !important;
	}

	nav button:last-child {
		@apply hover:bg-red-900 !important;
	}
</style>
