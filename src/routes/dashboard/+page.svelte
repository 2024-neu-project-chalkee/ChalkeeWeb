<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
</script>

<div class="island-col">
	<h1>Dashboard</h1>
	<h3>Welcome back, {$page.data.session?.user?.firstName}</h3>
	<button on:click={() => signOut({ callbackUrl: '/' })}>Sign out</button>
</div>
