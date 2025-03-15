<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<div class="island-col">
	<h1>What would you like to do now, {$page.data.session?.user?.firstName}?</h1>
	<div class="flex flex-col">
		<div class="flex flex-col">
			<h2 class="mb-2">Add data</h2>
			<button
				on:click={() => {
					goto('/admin/add/user');
				}}>Add a user to the users of the institution</button
			>
			<button
				on:click={() => {
					goto('/admin/add/room');
				}}>Add a room to the rooms of the institution</button
			>
			<button
				on:click={() => {
					goto('/admin/add/class');
				}}>Add a class to the classes of the institution</button
			>
			<button
				on:click={() => {
					goto('/admin/add/group');
				}}>Add a group to the groups of the institution</button
			>
		</div>
		<div class="flex flex-col gap-2">
			<h2 class="mb-2">Delete data</h2>
			<button
				on:click={() => {
					goto('/admin/remove/user');
				}}>Delete a user from the users of the institution</button
			>
			<button
				on:click={() => {
					goto('/admin/remove/room');
				}}>Delete a room from the rooms of the institution</button
			>
			<button
				on:click={() => {
					goto('/admin/remove/class');
				}}>Delete a class from the classes of the institution</button
			>
			<button
				on:click={() => {
					goto('/admin/remove/group');
				}}>Delete a group from the groups of the institution</button
			>
		</div>
	</div>
</div>

<style>
	div:not(div.island-col) {
		@apply flex flex-col !important;
	}
</style>
