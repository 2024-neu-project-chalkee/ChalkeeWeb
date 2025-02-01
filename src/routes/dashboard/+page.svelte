<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
</script>

<div class="island-col">
	<h1>Dashboard</h1>
	<h3>Welcome back, {$page.data.session?.user?.firstName}</h3>
	<div>
		<button on:click={() => signOut({ callbackUrl: '/' })}>Sign out</button>
		<button on:click={() => goto('/dashboard/my/info')}>View my information</button>
		<button on:click={() => goto('/dashboard/my/grades')} disabled>View my grades</button>
		<button on:click={() => goto('/dashboard/my/timetables')}>View my timetables</button>
	</div>
</div>
