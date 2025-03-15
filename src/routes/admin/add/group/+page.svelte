<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let name: string = '';

	let success: boolean | null = null;
</script>

<div class="island-col">
	{#if success == null}
		<h1>Add a group to the groups of the institution</h1>
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={async ({ formData, cancel }) => {
				if (!(formData.get('name') as string).length) cancel();

				formData.set('institutionId', $page.data.session?.user?.institutionId as string);

				return async ({ result }) => {
					success = result.status == 200;
				};
			}}
			class="flex flex-col gap-4"
		>
			<div class="mt-4 flex flex-col gap-2">
				<h2>Name of the group</h2>
				<input
					bind:value={name}
					class="w-full md:w-3/5"
					type="text"
					name="name"
					id="name"
					required
				/>
			</div>
			<div class="flex flex-col gap-2">
				<h2>Grouproom (optional)</h2>
				<select class="w-full md:w-3/5" name="grouproom" id="grouproom">
					<option selected hidden disabled>Select an option</option>
					{#each $page.data.rooms as c}
						<option value={c.id}>{c.name}</option>
					{/each}
				</select>
			</div>
			<button>Add group to the groups of the institution</button>
		</form>
	{:else if success}
		<h1>Successful operation!</h1>
		<div>
			<button
				on:click={() => {
					success = null;
					name = '';
				}}>Add another group to the groups of the institution</button
			>
			<button on:click={() => goto('/dashboard')}>Go to the dashboard</button>
		</div>
	{:else}
		<h1>Unsuccessful operation!</h1>
		<h2>
			Oops, it seems like an unexpected error has happened while trying to add a group to the group
			of the institution!
		</h2>
		<div>
			<button
				on:click={() => {
					success = null;
					name = '';
				}}>Go back and retry</button
			>
			<button on:click={() => goto('/dashboard')}>Go to the dashboard</button>
		</div>
	{/if}
</div>
