<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let success: boolean | null = null;

	let announcementTypes =
		$page.data.session?.user?.role == 'Principal'
			? ['General', 'Homework', 'Test', 'Exam', 'Matura Exam']
			: ['General', 'Homework', 'Test', 'Exam'];
	let announcementTypeDescriptions =
		$page.data.session?.user?.role == 'Principal'
			? ['in general', 'about homework', 'about a test', 'about an exam', 'about a matura exam']
			: ['in general', 'about homework', 'about a test', 'about an exam'];
</script>

<div class="island-col">
	{#if success == null}
		<h1>Create a new announcement</h1>
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={async ({ formData, cancel }) => {
				if (!formData.get('subject') || !formData.get('type') || !formData.get('content')) cancel();

				formData.set('institutionId', $page.data.session?.user?.institutionId as string);

				return async ({ result }) => {
					success = result.status == 200;
				};
			}}
			class="flex flex-col gap-4"
		>
			<div class="mt-4 flex flex-col gap-2">
				<h2>Subject</h2>
				<select class="w-full md:w-3/5" name="subject" id="subject" required>
					<option selected disabled hidden>Select an option</option>
					{#each $page.data.mutualSubjects as subject}
						<option value={subject.id}>{subject.name}</option>
					{/each}
				</select>
			</div>
			<div class="mt-4 flex flex-col gap-2">
				<h2>This announcement contains information...</h2>
				<select class="w-full md:w-3/5" name="type" id="type" required>
					<option selected disabled hidden>Select an option</option>
					{#each announcementTypeDescriptions as type, i}
						<option value={announcementTypes[i]}>{type}</option>
					{/each}
				</select>
			</div>
			<div class="mt-4 flex flex-col gap-2">
				<h2>Content</h2>
				<textarea class="w-full md:w-3/5" name="content" id="content" required></textarea>
			</div>
			<div class="mt-4 flex flex-col gap-2">
				<h2>Due by</h2>
				<input
					class="w-full md:w-3/5"
					type="date"
					name="date"
					id="date"
					value={new Date().toISOString().split('T')[0]}
				/>
			</div>
			<button>Create announcement</button>
		</form>
	{:else if success}
		<h1>Successful operation!</h1>
		<div>
			<button
				on:click={() => {
					success = null;
				}}>Create another announcement</button
			>
			<button on:click={() => goto('/dashboard/my/announcements')}
				>Go back to my announcements</button
			>
		</div>
	{:else}
		<h1>Unsuccessful operation!</h1>
		<h2>
			Oops, it seems like an unexpected error has happened while trying to create an announcement!
		</h2>
		<div>
			<button
				on:click={() => {
					success = null;
				}}>Go back and retry</button
			>
			<button on:click={() => goto('/dashboard/my/announcements')}
				>Go back to my announcements</button
			>
		</div>
	{/if}
</div>
